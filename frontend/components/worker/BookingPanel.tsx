"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronLeft, ChevronRight, Clock,
  Zap, Loader2, MapPin, FileText, AlertCircle, Navigation,
} from "lucide-react";
import { WorkerPublic, bookingApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

// ── Constants ─────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["M","T","W","T","F","S","S"];

const TIME_WINDOWS = [
  { id: "morning",   label: "Morning",   range: "9 AM – 12 PM",  hour: 9  },
  { id: "afternoon", label: "Afternoon", range: "12 PM – 3 PM",  hour: 12 },
  { id: "evening",   label: "Evening",   range: "3 PM – 6 PM",   hour: 15 },
] as const;

function getCalendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

function toISO(year: number, month: number, day: number, hour: number): string {
  return new Date(year, month, day, hour, 0).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────
export default function BookingPanel({ worker }: { worker: WorkerPublic }) {
  const { user } = useAuthStore();
  const now = new Date();

  // Step
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields — service is auto-derived from worker, not user-selectable
  const service                         = worker.category || worker.skills?.[0] || "General Service";
  const [description, setDescription]   = useState("");
  const [location,    setLocation]      = useState("");
  const [isUrgent,    setIsUrgent]      = useState(false);
  const [gpsLoading,  setGpsLoading]    = useState(false);

  // Step 2 fields
  const [calYear,   setCalYear]   = useState(now.getFullYear());
  const [calMonth,  setCalMonth]  = useState(now.getMonth());
  const [selDay,    setSelDay]    = useState<number | null>(null);
  const [selWindow, setSelWindow] = useState<string | null>(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [booked,  setBooked]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Pre-fill location from saved city
  useEffect(() => {
    if (user?.city) setLocation(user.city);
  }, [user?.city]);

  const calDays = getCalendarDays(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const road = data.address?.road || data.address?.suburb || "";
          setLocation(road ? `${road}, ${city}` : city || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        } catch {
          setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        } finally { setGpsLoading(false); }
      },
      () => { setGpsLoading(false); setError("Could not detect location. Please enter manually."); }
    );
  };

  const canProceed = selDay !== null && selWindow !== null;
  const canBook    = canProceed && description.trim().length >= 10 && location.trim().length > 0;
  const selectedWindow = TIME_WINDOWS.find(w => w.id === selWindow);

  const handleBooking = async () => {
    if (!canBook || !selDay || !selectedWindow) return;
    setLoading(true); setError(null);
    try {
      await bookingApi.create({
        workerId:     worker._id,
        service:      service.trim(),
        description:  description.trim(),
        location:     location.trim(),
        scheduledAt:  toISO(calYear, calMonth, selDay, selectedWindow.hour),
        estimatedPay: worker.hourlyRate || 0,
        isUrgent,
      });
      setBooked(true);
    } catch (e: any) {
      setError(e.message || "Booking failed. Please ensure you are logged in as a Client.");
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setBooked(false); setSelDay(null); setSelWindow(null);
    setStep(1); setError(null); setDescription("");
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
      >

        {/* ── SUCCESS STATE ─────────────────────────────────────────── */}
        {booked ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-teal-500" />
            </div>
            <h3 className="font-black text-[#0F172A] text-lg mb-1">Booking Sent!</h3>
            <p className="text-gray-400 text-xs font-bold leading-relaxed mb-0.5">
              {service} · {MONTHS[calMonth]} {selDay}, {calYear}
            </p>
            <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">
              {selectedWindow?.label} ({selectedWindow?.range}) — awaiting worker confirmation.
            </p>
            <button onClick={handleReset} className="text-xs font-black text-teal-600 uppercase tracking-widest hover:underline">
              Book Another
            </button>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-black text-[#0F172A]">Book Appointment</h2>
              <div className="flex gap-1.5">
                {[1, 2].map(s => (
                  <div key={s} className={`h-2 rounded-full transition-all duration-300 ${step === s ? "bg-[#0F172A] w-5" : "bg-gray-200 w-2"}`} />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Choose Date & Time ── */}
              {step === 1 && (
                <motion.div key="step1"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  {/* Calendar */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#0F172A]">{MONTHS[calMonth]} {calYear}</span>
                    <div className="flex gap-1">
                      <button onClick={prevMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><ChevronLeft size={14} /></button>
                      <button onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7">
                    {DAYS.map((d, i) => <div key={i} className="text-center text-[10px] font-black text-gray-300 uppercase py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1 mb-2">
                    {calDays.map((day, i) => {
                      if (!day) return <div key={i} />;
                      const isPast  = new Date(calYear, calMonth, day) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
                      const isSel   = day === selDay;
                      return (
                        <button key={i} disabled={isPast}
                          onClick={() => { if (!isPast) { setSelDay(day); setSelWindow(null); } }}
                          className={`text-xs font-black h-8 w-8 mx-auto rounded-full transition-all ${
                            isSel    ? "bg-[#0F172A] text-white shadow-lg" :
                            isToday  ? "ring-2 ring-teal-400 text-teal-600" :
                            isPast   ? "text-gray-200 cursor-not-allowed" :
                                       "hover:bg-gray-100 text-gray-600"
                          }`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time preference windows — shown after day selected */}
                  {selDay && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={11} className="text-gray-400" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Time Preference · {MONTHS[calMonth]} {selDay}
                        </p>
                      </div>
                      {TIME_WINDOWS.map(({ id, label, range }) => {
                        const isActive = selWindow === id;
                        return (
                          <button key={id} onClick={() => setSelWindow(id)}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-left ${
                              isActive
                                ? "bg-[#0F172A] border-[#0F172A] text-white"
                                : "bg-white border-gray-100 hover:border-gray-300 text-[#0F172A]"
                            }`}>
                            <div>
                              <div className={`text-sm font-bold ${isActive ? "text-white" : "text-[#0F172A]"}`}>{label}</div>
                              <div className={`text-[11px] font-medium mt-0.5 ${isActive ? "text-white/60" : "text-gray-400"}`}>{range}</div>
                            </div>
                            {isActive && <CheckCircle2 size={16} className="text-white shrink-0" />}
                          </button>
                        );
                      })}
                      <p className="text-[10px] text-gray-400 font-bold px-1 mt-1">
                        This is a time preference, not a fixed appointment. The worker will confirm the exact time.
                      </p>
                    </div>
                  )}

                  <button onClick={() => setStep(2)} disabled={!canProceed}
                    className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                      canProceed
                        ? "bg-[#0F172A] text-white hover:bg-gray-800 shadow-xl shadow-gray-200"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}>
                    Describe Job &amp; Location →
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: Job & Location Details ── */}
              {step === 2 && (
                <motion.div key="step2"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  className="space-y-5"
                >
                  <button onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0F172A] transition-colors mb-2">
                    <ChevronLeft size={12} /> Back to Date &amp; Time
                  </button>

                  {/* Job summary strip (Chosen Date & Time) */}
                  {selectedWindow && selDay && (
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3">
                      <Clock size={14} className="text-teal-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-black text-[#0F172A] uppercase tracking-wide">Selected Time</div>
                        <div className="text-[10px] text-gray-400 font-bold truncate">
                          {MONTHS[calMonth]} {selDay}, {calYear} · {selectedWindow.label} ({selectedWindow.range})
                        </div>
                      </div>
                      {isUrgent && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black border border-rose-100">Urgent</span>
                      )}
                    </div>
                  )}

                  {/* Description — compulsory */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Describe the Work <span className="text-rose-400">*</span>
                      </label>
                      <span className={`text-[9px] font-black tabular-nums ${description.trim().length >= 10 ? "text-teal-500" : "text-rose-400"}`}>
                        {description.length} / 10 min
                      </span>
                    </div>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Clearly describe what needs to be done. The worker uses this to prepare."
                      className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm font-medium text-[#0F172A] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all resize-none leading-relaxed"
                    />
                    {description.length > 0 && description.trim().length < 10 && (
                      <p className="text-[10px] text-rose-400  mt-1">Please describe the work in more detail</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Location</label>
                      <button type="button" onClick={handleUseMyLocation} disabled={gpsLoading}
                        className="flex items-center gap-1 text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-wider disabled:opacity-50 transition-colors">
                        {gpsLoading ? <Loader2 size={11} className="animate-spin" /> : <Navigation size={11} />}
                        {gpsLoading ? "Detecting…" : "Use My Location"}
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400" />
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Street, Area, City"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-300 text-sm font-bold text-[#0F172A] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all"
                      />
                    </div>
                    {user?.city && location === user.city && (
                      <p className="text-[10px] text-teal-500 font-bold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Using your registered city
                      </p>
                    )}
                  </div>

                  {/* Urgent toggle */}
                  <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setIsUrgent(u => !u)}>
                    <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all ${isUrgent ? "bg-rose-500" : "bg-gray-200"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isUrgent ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-1.5">
                        <Zap size={11} className="text-rose-500" /> Urgent Request
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold">Priority handling — may incur additional fee</p>
                    </div>
                  </div>

                  {/* Pay */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Pay</span>
                    <span className="text-lg font-black text-[#0F172A]">₹{worker.hourlyRate}/hr</span>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[11px] font-bold">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}

                  <button onClick={handleBooking} disabled={!canBook || loading}
                    className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      canBook && !loading
                        ? "bg-[#0F172A] text-white hover:bg-teal-600 shadow-xl shadow-gray-200"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}>
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Sending Request…</> : "Confirm Booking"}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-bold">
                    No payment yet. Worker confirms and coordinates the exact time.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>

      {/* Urgent CTA card */}
      {!booked && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-[#0F172A] rounded-[28px] p-7 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.12),transparent)]" />
          <Zap className="text-teal-400 mx-auto mb-3 relative" size={28} />
          <h3 className="text-white font-black text-lg mb-2 relative">Need it Now?</h3>
          <p className="text-white/40 text-xs font-bold leading-relaxed mb-5 relative">
            Mark your request as urgent and the worker will prioritize it.
          </p>
          <button onClick={() => { setIsUrgent(true); setStep(1); }}
            className="relative w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center justify-center gap-2">
            <Zap size={12} /> Book as Urgent
          </button>
        </motion.div>
      )}
    </div>
  );
}
