"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Phone, 
  MessageSquare, 
  Zap, 
  Send 
} from "lucide-react";
import { WorkerPublic } from "@/services/api";

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

export default function BookingPanel({ worker }: { worker: WorkerPublic }) {
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selDay,   setSelDay]   = useState<number | null>(null);
  const [selSlot,  setSelSlot]  = useState<string | null>(null);
  const [showSlots, setShowSlots] = useState(false);
  const [booked,   setBooked]   = useState(false);

  const calDays = getCalendarDays(calYear, calMonth);

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

  return (
    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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

            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-black text-gray-300 uppercase py-1">{d}</div>
              ))}
            </div>

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

            {selDay && (
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">
                  {MONTHS[calMonth]} {selDay}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
            )}

            <AnimatePresence>
              {showSlots && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
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
            </AnimatePresence>

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
  );
}
