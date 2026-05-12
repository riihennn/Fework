"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Phone,
  Send,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { workerApi, WorkerPublic } from "@/services/api";

// ── Fake reviews for UI (until backend returns reviews) ──────────────
const FAKE_REVIEWS = [
  {
    initials: "RK",
    name: "Rajan Kumar",
    time: "2 weeks ago",
    rating: 5,
    text: "Exceptional work! Arrived on time, very professional and cleaned up perfectly after finishing. Highly recommend.",
  },
  {
    initials: "PM",
    name: "Priya Menon",
    time: "1 month ago",
    rating: 5,
    text: "Fixed our leaking pipe in under an hour. Very knowledgeable and transparent about pricing. Will hire again.",
  },
  {
    initials: "AS",
    name: "Anil Suresh",
    time: "2 months ago",
    rating: 4,
    text: "Good work overall. Completed the task efficiently. Minor delay but communicated well throughout.",
  },
];

// ── Calendar helper ──────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["M","T","W","T","F","S","S"];
const SLOTS  = ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM"];

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = first === 0 ? 6 : first - 1;      // Mon-based
  const total  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={14} fill={s <= rating ? "#f59e0b" : "none"} stroke={s <= rating ? "#f59e0b" : "#d1d5db"} />
      ))}
    </div>
  );
}

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [worker, setWorker]           = useState<WorkerPublic | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Calendar state
  const now   = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selDay,   setSelDay]   = useState<number | null>(null);
  const [selSlot,  setSelSlot]  = useState<string | null>(null);
  const [showSlots, setShowSlots] = useState(false);
  const [booked,   setBooked]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await workerApi.getById(id);
        setWorker(data);
      } catch {
        setError("Could not load this professional's profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const handleBooking = () => {
    if (!selSlot) return;
    setBooked(true);
  };

  const calDays = getCalendarDays(calYear, calMonth);

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error || !worker) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <AlertCircle size={48} className="text-rose-300 mx-auto mb-4" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">{error || "Worker not found"}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avgRating = worker.rating > 0 ? worker.rating.toFixed(1) : null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans text-[#0F172A] selection:bg-teal-100">
      <Navbar />

      <div className="max-w-[1200px] mx-auto pt-24 pb-20 px-4 md:px-8">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#0F172A] transition-colors font-bold text-sm mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Professionals
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 rounded-[24px] overflow-hidden bg-gray-100 ring-8 ring-gray-50 flex items-center justify-center">
                    {worker.user.avatar ? (
                      <img src={worker.user.avatar} alt={worker.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-gray-200">
                        {worker.user.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {worker.isAvailable && (
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow" title="Online" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">{worker.user.name}</h1>
                    {avgRating && (
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                        <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                        <span className="text-sm font-black text-amber-600">{avgRating}</span>
                        <span className="text-xs text-amber-400">({worker.totalJobs} jobs)</span>
                      </div>
                    )}
                  </div>

                  <p className="text-teal-600 font-bold text-sm capitalize mb-4">{worker.category} Specialist</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 size={11} /> Verified
                    </span>
                    {worker.experience && (
                      <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        {worker.experience} Yrs Exp
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      <MapPin size={11} /> {worker.city}{worker.state ? `, ${worker.state}` : ""}
                    </span>
                    {worker.isAvailable && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        <Clock size={11} /> Available Now
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#0F172A]">
                    {avgRating ?? "New"}
                  </div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Avg Rating</div>
                </div>
                <div className="text-center border-x border-gray-100">
                  <div className="text-2xl font-black text-[#0F172A]">{worker.totalJobs}</div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Jobs Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#0F172A] flex items-center justify-center gap-0.5">
                    <span className="text-sm text-gray-300">₹</span>{worker.hourlyRate ?? "—"}
                  </div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Per Hour</div>
                </div>
              </div>
            </motion.div>

            {/* About & Experience row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* About */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[28px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
              >
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">About</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {worker.bio || `${worker.user.name} is a skilled ${worker.category} professional based in ${worker.city}. With hands-on experience and a focus on quality, they deliver reliable service every time.`}
                </p>
              </motion.div>

              {/* Quick info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-[28px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
              >
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Details</h2>
                <div className="space-y-4">
                  {[
                    { icon: Briefcase, label: "Category",    value: worker.category,              cls: "capitalize" },
                    { icon: Clock,     label: "Experience",  value: worker.experience ? `${worker.experience} years` : "—", cls: "" },
                    { icon: MapPin,    label: "Location",    value: `${worker.city}${worker.state ? `, ${worker.state}` : ""}`, cls: "" },
                    { icon: Star,      label: "Rating",      value: avgRating ? `${avgRating} / 5.0` : "New professional", cls: "" },
                  ].map(({ icon: Icon, label, value, cls }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-teal-600" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{label}</div>
                        <div className={`text-sm font-bold text-[#0F172A] ${cls}`}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[28px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Reviews</h2>
                <span className="text-teal-600 font-black text-xs cursor-pointer hover:underline">View All</span>
              </div>
              <div className="space-y-6">
                {FAKE_REVIEWS.map((r, i) => (
                  <div key={i} className={`pb-6 ${i < FAKE_REVIEWS.length - 1 ? "border-b border-gray-50" : ""}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                          {r.initials}
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#0F172A]">{r.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{r.time}</div>
                        </div>
                      </div>
                      <StarRow rating={r.rating} />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed pl-12">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trust block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-teal-50 rounded-[28px] border border-teal-100 p-7"
            >
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={20} className="text-teal-600" />
                <h3 className="font-black text-teal-800 text-sm">Fework Trust Guarantee</h3>
              </div>
              <p className="text-teal-600/80 text-xs font-bold leading-relaxed">
                All bookings are insured up to ₹1M and handled via our secure, high-trust payment gateway. Free cancellation up to 24h before.
              </p>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN – Booking ────────────────────────────── */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-[32px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
            >
              <h2 className="text-base font-black text-[#0F172A] mb-6">Book Appointment</h2>

              {booked ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-teal-500" />
                  </div>
                  <h3 className="font-black text-[#0F172A] mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">
                    {MONTHS[calMonth]} {selDay}, {calYear} at {selSlot}
                  </p>
                  <button
                    onClick={() => { setBooked(false); setSelSlot(null); setShowSlots(false); setSelDay(null); }}
                    className="text-xs font-black text-teal-600 uppercase tracking-widest hover:underline"
                  >
                    Book Another Slot
                  </button>
                </div>
              ) : (
                <>
                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-black text-[#0F172A]">{MONTHS[calMonth]} {calYear}</span>
                    <div className="flex gap-1">
                      <button onClick={prevMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <ChevronLeft size={14} />
                      </button>
                      <button onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {DAYS.map((d, i) => (
                      <div key={i} className="text-center text-[10px] font-black text-gray-300 uppercase py-1">{d}</div>
                    ))}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-7 gap-y-1 mb-4">
                    {calDays.map((day, i) => {
                      if (!day) return <div key={i} />;
                      const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
                      const isSel   = day === selDay;
                      return (
                        <button
                          key={i}
                          onClick={() => { setSelDay(day); setSelSlot(null); setShowSlots(true); }}
                          className={`text-xs font-black h-8 w-8 mx-auto rounded-full transition-all ${
                            isSel
                              ? "bg-[#0F172A] text-white shadow-lg"
                              : isToday
                              ? "ring-2 ring-teal-400 text-teal-600"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected date label */}
                  {selDay && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-gray-100" />
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">
                        {MONTHS[calMonth]} {selDay}
                      </span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                  )}

                  {/* Slots — animated dropdown */}
                  {showSlots && (
                    <motion.div
                      key="slots"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden mb-1"
                    >
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Pick a Time</p>
                      <div className="grid grid-cols-2 gap-2">
                        {SLOTS.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelSlot(slot)}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                              selSlot === slot
                                ? "bg-[#0F172A] text-white border-[#0F172A]"
                                : "border-gray-100 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {selSlot && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 px-4 py-3 bg-gray-50 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Selected Slot</div>
                        <div className="text-sm font-black text-[#0F172A]">
                          {MONTHS[calMonth]} {selDay} • {selSlot}
                        </div>
                      </div>
                      <Clock size={18} className="text-gray-300" />
                    </motion.div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!selSlot}
                    className={`w-full mt-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                      selSlot
                        ? "bg-[#0F172A] text-white hover:bg-gray-800 shadow-xl shadow-gray-200"
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Confirm Booking
                  </button>

                  <p className="text-center text-[10px] text-gray-400 font-bold mt-3">
                    You won't be charged yet. Free cancellation up to 24h before.
                  </p>

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-50">
                    <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all">
                      <Phone size={12} /> Call
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all">
                      <MessageSquare size={12} /> Message
                    </button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Instant hire CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#0F172A] rounded-[28px] p-7 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.12),transparent)]" />
              <Zap className="text-teal-400 mx-auto mb-4" size={28} />
              <h3 className="text-white font-black text-lg mb-2">Instant Hire</h3>
              <p className="text-white/40 text-xs font-bold leading-relaxed mb-6">
                Skip the calendar. Connect directly and start immediately.
              </p>
              <button className="w-full flex items-center justify-center gap-2 py-4 bg-teal-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-400 transition-all">
                <Send size={12} /> Send Request
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <footer className="py-10 border-t border-gray-100 text-center bg-white">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          © 2024 FEWORK TECHNOLOGIES. PRECISION MINIMALISM IN HOME SERVICES.
        </p>
      </footer>
    </div>
  );
}
