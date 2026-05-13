"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Zap, User, CheckCircle, XCircle, Loader2, X
} from "lucide-react";
import { bookingApi } from "@/services/api";

export interface IncomingJob {
  id: string;
  client: string;
  clientAvatar?: string | null;
  service: string;
  description: string;
  location: string;
  scheduledAt: string;
  estimatedPay: number;
  isUrgent: boolean;
  status: string;
  createdAt: string;
}

interface IncomingJobAlertProps {
  job: IncomingJob;
  onResponded: (jobId: string, status: "accepted" | "cancelled") => void;
  onDismiss: (jobId: string) => void;
}

const ACCEPT_TIMEOUT_SECONDS = 60;

function IncomingJobAlert({ job, onResponded, onDismiss }: IncomingJobAlertProps) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [timeLeft, setTimeLeft] = useState(ACCEPT_TIMEOUT_SECONDS);

  // Countdown timer — auto-dismiss after timeout
  useEffect(() => {
    if (timeLeft <= 0) {
      onDismiss(job.id);
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, job.id, onDismiss]);

  const handleRespond = async (action: "accept" | "decline") => {
    setLoading(action);
    try {
      await bookingApi.respond(job.id, action);
      onResponded(job.id, action === "accept" ? "accepted" : "cancelled");
    } catch (e) {
      console.error("Respond error:", e);
    } finally {
      setLoading(null);
    }
  };

  const progress = (timeLeft / ACCEPT_TIMEOUT_SECONDS) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 420, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 420, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[380px] bg-white rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
    >
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100">
        <motion.div
          className={`h-full rounded-full transition-colors duration-1000 ${
            timeLeft > 30 ? "bg-teal-500" : timeLeft > 10 ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {job.isUrgent && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-100">
                <Zap size={10} /> Urgent
              </span>
            )}
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              New Request · {timeLeft}s
            </span>
          </div>
          <button
            onClick={() => onDismiss(job.id)}
            className="p-1.5 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Client info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-teal-400 font-black text-lg shadow-lg shadow-gray-200 shrink-0">
            {job.client?.[0]?.toUpperCase() ?? <User size={20} />}
          </div>
          <div>
            <div className="font-black text-[#0F172A] text-base tracking-tight">{job.client}</div>
            <div className="text-teal-600 text-[11px] font-black uppercase tracking-widest">{job.service}</div>
          </div>
        </div>

        {/* Job details */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 mb-5">
          <div className="flex items-start gap-2 text-[11px] text-gray-500 font-bold">
            <MapPin size={13} className="text-teal-500 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold">
            <Clock size={13} className="text-teal-500 shrink-0" />
            <span>{new Date(job.scheduledAt).toLocaleDateString("en-IN", {
              weekday: "short", day: "numeric", month: "short",
            })}, {new Date(job.scheduledAt).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit",
            })}</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium leading-relaxed border-t border-gray-100 pt-2.5">
            {job.description.length > 80 ? job.description.slice(0, 80) + "…" : job.description}
          </p>
        </div>

        {/* Pay */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Pay</span>
          <span className="text-2xl font-black text-[#0F172A] tracking-tight">₹{job.estimatedPay.toLocaleString()}</span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleRespond("decline")}
            disabled={!!loading}
            className="py-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-[11px] font-black text-gray-500 uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "decline" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <><XCircle size={14} /> Decline</>
            )}
          </button>
          <button
            onClick={() => handleRespond("accept")}
            disabled={!!loading}
            className="py-3.5 rounded-2xl bg-[#0F172A] text-[11px] font-black text-white uppercase tracking-widest hover:bg-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
          >
            {loading === "accept" ? (
              <Loader2 size={14} className="animate-spin text-white" />
            ) : (
              <><CheckCircle size={14} /> Accept</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Alert Stack Manager ───────────────────────────────────────────
interface AlertStackProps {
  jobs: IncomingJob[];
  onResponded: (jobId: string, status: "accepted" | "cancelled") => void;
  onDismiss: (jobId: string) => void;
}

export function IncomingJobAlertStack({ jobs, onResponded, onDismiss }: AlertStackProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {jobs.slice(0, 3).map((job) => (
          <div key={job.id} className="pointer-events-auto">
            <IncomingJobAlert job={job} onResponded={onResponded} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
