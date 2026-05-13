"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronLeft, ChevronRight, Clock,
  Zap, Loader2, MapPin, FileText, AlertCircle
} from "lucide-react";
import { WorkerPublic, bookingApi } from "@/services/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["M","T","W","T","F","S","S"];
const SLOTS  = ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const total  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

function slotToDate(year: number, month: number, day: number, slot: string): string {
  const [time, period] = slot.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  const d = new Date(year, month, day, h, m);
  return d.toISOString();
}

export default function BookingPanel({ worker }: { worker: WorkerPublic }) {
  const now = new Date();
  const [calYear,    setCalYear]    = useState(now.getFullYear());
  const [calMonth,   setCalMonth]   = useState(now.getMonth());
  const [selDay,     setSelDay]     = useState<number | null>(null);
  const [selSlot,    setSelSlot]    = useState<string | null>(null);
  const [service,    setService]    = useState(worker.category || "");
  const [description,setDescription]= useState("");
  const [location,   setLocation]   = useState(worker.city || "");
  const [isUrgent,   setIsUrgent]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [booked,     setBooked]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [step,       setStep]       = useState<1 | 2>(1); // 1=details, 2=calendar

  const calDays = getCalendarDays(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const canProceed = service.trim().length > 0 && description.trim().length >= 3 && location.trim().length > 0;
  const canBook = selDay !== null && selSlot !== null;

  const handleBooking = async () => {
    if (!canBook || !selDay || !selSlot) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        workerId: worker._id,
        service: service.trim(),
        description: description.trim(),
        location: location.trim(),
        scheduledAt: slotToDate(calYear, calMonth, selDay, selSlot),
        estimatedPay: worker.hourlyRate || 0,
        isUrgent,
      };
      
      console.log("[BookingPanel] Sending request:", payload);
      await bookingApi.create(payload);
      setBooked(true);
    } catch (e: any) {
      console.error("[BookingPanel] Error:", e);
      setError(e.message || "Booking failed. Please check if you are logged in as a Client.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBooked(false); setSelSlot(null); setSelDay(null);
    setStep(1); setError(null); setDescription("");
  };

  return (
    <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
      >
        {/* ── Success ── */}
        {booked ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-teal-500" />
            </div>
            <h3 className="font-black text-[#0F172A] mb-2">Booking Sent!</h3>
            <p className="text-gray-400 text-xs font-bold leading-relaxed mb-1">
              {service} · {MONTHS[calMonth]} {selDay}, {calYear}
            </p>
            <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">
              at {selSlot} — waiting for worker confirmation.
            </p>
            <button onClick={handleReset} className="text-xs font-black text-teal-600 uppercase tracking-widest hover:underline">
              Book Another Slot
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-black text-[#0F172A]">Book Appointment</h2>
              <div className="flex gap-1.5">
                {[1,2].map(s => (
                  <div key={s} className={`w-2 h-2 rounded-full transition-all ${step === s ? "bg-[#0F172A] w-5" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* ── Step 1: Job Details ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Service Needed</label>
                    <input
                      value={service}
                      onChange={e => setService(e.target.value)}
                      placeholder="e.g. AC Repair, Plumbing Fix"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-sm font-bold text-[#0F172A] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Description</label>
                      <span className={`text-[9px] font-bold ${description.length >= 3 ? "text-teal-500" : "text-rose-400"}`}>
                        {description.length}/3 min
                      </span>
                    </div>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Describe the issue in detail (min. 3 characters)"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-sm font-bold text-[#0F172A] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Your Location</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Street, Area, City"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 text-sm font-bold text-[#0F172A] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setIsUrgent(u => !u)}
                      className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${isUrgent ? "bg-rose-500" : "bg-gray-200"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isUrgent ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-1.5">
                        <Zap size={11} className="text-rose-500" /> Urgent Request
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold">Priority handling — may incur additional fee</p>
                    </div>
                  </label>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceed}
                    className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all mt-2 ${
                      canProceed ? "bg-[#0F172A] text-white hover:bg-gray-800 shadow-xl shadow-gray-200" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Choose Date & Time →
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: Calendar ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                  <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0F172A] transition-colors mb-4">
                    <ChevronLeft size={12} /> Back to Details
                  </button>

                  {/* Job summary */}
                  <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-3 mb-2">
                    <FileText size={14} className="text-teal-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest truncate">{service}</div>
                      <div className="text-[10px] text-gray-400 font-bold truncate">{location}</div>
                    </div>
                    {isUrgent && <span className="ml-auto shrink-0 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black border border-rose-100">Urgent</span>}
                  </div>

                  {/* Calendar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-[#0F172A]">{MONTHS[calMonth]} {calYear}</span>
                    <div className="flex gap-1">
                      <button onClick={prevMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><ChevronLeft size={14} /></button>
                      <button onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><ChevronRight size={14} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 mb-1">
                    {DAYS.map((d, i) => <div key={i} className="text-center text-[10px] font-black text-gray-300 uppercase py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1 mb-3">
                    {calDays.map((day, i) => {
                      if (!day) return <div key={i} />;
                      const isPast = new Date(calYear, calMonth, day) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
                      const isSel = day === selDay;
                      return (
                        <button key={i} onClick={() => { if (!isPast) { setSelDay(day); setSelSlot(null); } }}
                          disabled={isPast}
                          className={`text-xs font-black h-8 w-8 mx-auto rounded-full transition-all ${
                            isSel ? "bg-[#0F172A] text-white shadow-lg"
                            : isToday ? "ring-2 ring-teal-400 text-teal-600"
                            : isPast ? "text-gray-200 cursor-not-allowed"
                            : "hover:bg-gray-100 text-gray-600"
                          }`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {selDay && (
                    <>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Pick a Time — {MONTHS[calMonth]} {selDay}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {SLOTS.map(slot => (
                          <button key={slot} onClick={() => setSelSlot(slot)}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                              selSlot === slot ? "bg-[#0F172A] text-white border-[#0F172A]" : "border-gray-100 text-gray-500 hover:border-gray-300"
                            }`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {selSlot && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 px-4 py-3 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Selected</div>
                        <div className="text-sm font-black text-[#0F172A]">{MONTHS[calMonth]} {selDay} · {selSlot}</div>
                      </div>
                      <Clock size={18} className="text-teal-400" />
                    </motion.div>
                  )}

                  {/* Estimated pay */}
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
                      canBook && !loading ? "bg-[#0F172A] text-white hover:bg-teal-600 shadow-xl shadow-gray-200" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}>
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Sending Request…</> : "Confirm Booking"}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-bold">
                    No payment yet. Worker will confirm your request.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>

      {/* Urgent CTA */}
      {!booked && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-[#0F172A] rounded-[28px] p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.12),transparent)]" />
          <Zap className="text-teal-400 mx-auto mb-4" size={28} />
          <h3 className="text-white font-black text-lg mb-2">Need it Now?</h3>
          <p className="text-white/40 text-xs font-bold leading-relaxed mb-6">
            Toggle urgent on your booking and the worker will be notified immediately.
          </p>
          <button onClick={() => { setIsUrgent(true); setStep(1); }}
            className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center justify-center gap-2">
            <Zap size={12} /> Book as Urgent
          </button>
        </motion.div>
      )}
    </div>
  );
}
