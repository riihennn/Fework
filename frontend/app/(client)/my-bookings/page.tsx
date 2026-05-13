"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Clock, CheckCircle2, XCircle, Loader2,
  MapPin, Calendar, RefreshCw, Zap, User, Phone, MessageSquare
} from "lucide-react";
import { bookingApi, BookingJob } from "@/services/api";

const STATUS_TABS = [
  { key: "",            label: "All",         color: "text-gray-600",  bg: "bg-gray-50",    border: "border-gray-100" },
  { key: "pending",     label: "Pending",     color: "text-amber-600", bg: "bg-amber-50",   border: "border-amber-100" },
  { key: "accepted",    label: "Accepted",    color: "text-blue-600",  bg: "bg-blue-50",    border: "border-blue-100" },
  { key: "in_progress", label: "In Progress", color: "text-indigo-600",bg: "bg-indigo-50",  border: "border-indigo-100" },
  { key: "completed",   label: "Completed",   color: "text-teal-600",  bg: "bg-teal-50",    border: "border-teal-100" },
  { key: "cancelled",   label: "Cancelled",   color: "text-rose-600",  bg: "bg-rose-50",    border: "border-rose-100" },
];

export default function MyBookingsPage() {
  const [activeStatus, setActiveStatus] = useState("");
  const [jobs, setJobs] = useState<BookingJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (status: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: "10" };
      if (status) params.status = status;
      const res = await bookingApi.getClientJobs(params);
      setJobs(res.jobs);
      setTotal(res.pagination.total);
      setPages(res.pagination.pages);
    } catch (e: any) {
      setError(e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(activeStatus, page);
  }, [activeStatus, page, fetchJobs]);

  const handleStatusChange = (key: string) => {
    setActiveStatus(key);
    setPage(1);
  };

  const getStatusStyle = (status: string) => {
    const tab = STATUS_TABS.find((t) => t.key === status);
    return tab ? `${tab.color} ${tab.bg} ${tab.border}` : "text-gray-500 bg-gray-50 border-gray-100";
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      
      <main className="max-w-6xl mx-auto pt-28 pb-20 px-4 md:px-8 space-y-10">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">My Bookings</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              {total} {total === 1 ? "request" : "requests"} total
            </p>
          </div>
          <button
            onClick={() => fetchJobs(activeStatus, page)}
            className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeStatus === tab.key
                  ? `${tab.color} ${tab.bg} ${tab.border}`
                  : "text-gray-400 bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-sm font-bold">
            {error}
          </div>
        )}

        {/* Booking list */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white rounded-[28px] border border-gray-100 p-8 animate-pulse h-32" />
              ))
            ) : jobs.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 bg-white rounded-[40px] border border-gray-100">
                <Briefcase size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No bookings found</p>
                <p className="text-xs text-gray-300 mt-2">
                  {activeStatus ? `No ${activeStatus} bookings yet.` : "Your booking history will appear here."}
                </p>
              </motion.div>
            ) : (
              jobs.map((job, i) => {
                const workerUser = (job.worker as any)?.user;
                return (
                  <motion.div key={job._id} layout
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }} transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-[28px] border border-gray-100 p-7 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      {/* Left: Job & Worker Info */}
                      <div className="flex-1 flex flex-col md:flex-row gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 shrink-0 overflow-hidden ring-4 ring-gray-50 flex items-center justify-center">
                          {workerUser?.avatar ? (
                            <img src={workerUser.avatar} alt={workerUser.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-gray-300" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {job.isUrgent && (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-100">
                                <Zap size={9} /> Urgent
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(job.status)}`}>
                              {job.status.replace("_", " ")}
                            </span>
                          </div>
                          
                          <div className="font-black text-[#0F172A] text-lg tracking-tight mb-1">{job.service}</div>
                          <p className="text-gray-400 text-[11px] font-bold tracking-tight uppercase mb-3">
                            Requested from <span className="text-[#0F172A]">{workerUser?.name || "Professional"}</span>
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-[11px] text-gray-400 font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-teal-500" />
                              {new Date(job.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-teal-500" />
                              {new Date(job.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-teal-500" />{job.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment & Actions */}
                      <div className="flex flex-col items-end justify-between gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-black text-[#0F172A] tracking-tight">
                            ₹{(job.actualPay || job.estimatedPay).toLocaleString()}
                          </div>
                          <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                            {job.status === "completed" ? "Total Paid" : "Estimated Price"}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {(job.status === "accepted" || job.status === "in_progress") && (
                            <>
                              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all border border-teal-100" title="Call">
                                <Phone size={16} />
                              </button>
                              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-100" title="Message">
                                <MessageSquare size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-2xl text-sm font-black transition-all ${
                  page === i + 1 ? "bg-[#0F172A] text-white shadow-lg shadow-gray-200" : "bg-white border border-gray-100 text-gray-400 hover:border-gray-200"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-gray-100 text-center bg-white">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          © 2024 FEWORK TECHNOLOGIES. PRECISION MINIMALISM IN HOME SERVICES.
        </p>
      </footer>
    </div>
  );
}
