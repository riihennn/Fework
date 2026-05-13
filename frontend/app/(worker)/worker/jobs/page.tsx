"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Clock, CheckCircle2, XCircle, Loader2, MapPin,
  Calendar, RefreshCw, Zap, ChevronRight, AlertTriangle,
  MessageSquare, User, Banknote, FileText, Send
} from "lucide-react";
import { bookingApi, BookingJob, JobStatus } from "@/services/api";

// ─── Status Config ─────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  "":                  { label: "All",               color: "text-gray-500",   bg: "bg-gray-50",     border: "border-gray-200",   dot: "bg-gray-400" },
  pending:             { label: "Pending",            color: "text-amber-600",  bg: "bg-amber-50",    border: "border-amber-200",  dot: "bg-amber-400" },
  accepted:            { label: "Accepted",           color: "text-blue-600",   bg: "bg-blue-50",     border: "border-blue-200",   dot: "bg-blue-400" },
  in_progress:         { label: "In Progress",        color: "text-indigo-600", bg: "bg-indigo-50",   border: "border-indigo-200", dot: "bg-indigo-400" },
  awaiting_approval:   { label: "Awaiting Approval",  color: "text-orange-600", bg: "bg-orange-50",   border: "border-orange-200", dot: "bg-orange-400" },
  disputed:            { label: "Disputed",           color: "text-red-600",    bg: "bg-red-50",      border: "border-red-200",    dot: "bg-red-400" },
  completed:           { label: "Completed",          color: "text-teal-600",   bg: "bg-teal-50",     border: "border-teal-200",   dot: "bg-teal-400" },
  cancelled:           { label: "Cancelled",          color: "text-gray-400",   bg: "bg-gray-50",     border: "border-gray-200",   dot: "bg-gray-300" },
};

const STATUS_TABS = ["", "pending", "accepted", "in_progress", "awaiting_approval", "disputed", "completed", "cancelled"];

// ─── Worker status transitions ─────────────────────────────────────────
const WORKER_ACTIONS: Record<string, { label: string; next: string; icon: any; color: string }> = {
  accepted:    { label: "Start Job",           next: "in_progress",       icon: ChevronRight, color: "bg-blue-600 hover:bg-blue-700 text-white" },
  in_progress: { label: "Mark Ready for Review", next: "awaiting_approval", icon: Send,         color: "bg-orange-500 hover:bg-orange-600 text-white" },
  disputed:    { label: "Re-submit for Review", next: "awaiting_approval", icon: Send,         color: "bg-orange-500 hover:bg-orange-600 text-white" },
};

// ─── Worker Note Modal ─────────────────────────────────────────────────
function WorkerNoteModal({
  job, onSubmit, onClose
}: { job: BookingJob; onSubmit: (note: string) => void; onClose: () => void }) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[28px] shadow-2xl border border-gray-100 w-full max-w-md p-8 mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Send size={18} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A] text-lg">Mark Ready for Review</h3>
            <p className="text-xs text-gray-400">Add a note for the client (optional)</p>
          </div>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Describe the work completed, materials used, etc."
          rows={4}
          className="w-full border border-gray-200 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
        />
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={() => onSubmit(note)} className="flex-1 h-12 rounded-2xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all">Submit for Review</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Job Card ──────────────────────────────────────────────────────────
function JobCard({ job, onAction }: { job: BookingJob; onAction: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const meta = STATUS_META[job.status] || STATUS_META[""];
  const action = WORKER_ACTIONS[job.status];
  const clientInfo = job.client as { name: string; email: string; phone?: string };

  const handleAcceptDecline = async (act: "accept" | "decline") => {
    setLoading(act);
    try { await bookingApi.respond(job._id, act); onAction(); }
    catch (e: any) { alert(e.message); }
    finally { setLoading(null); }
  };

  const handleAdvance = async (note: string) => {
    setShowNoteModal(false);
    setLoading("advance");
    try { await bookingApi.updateStatus(job._id, action.next, { workerNote: note }); onAction(); }
    catch (e: any) { alert(e.message); }
    finally { setLoading(null); }
  };

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">

        {/* Status bar */}
        <div className={`h-1 ${meta.dot}`} />

        <div className="p-6 md:p-7">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              {/* Client avatar */}
              <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-teal-400 font-bold text-lg shrink-0">
                {clientInfo?.name?.[0]?.toUpperCase() ?? <User size={20} />}
              </div>
              <div>
                <div className="font-bold text-[#0F172A] text-base">{clientInfo?.name || "Client"}</div>
                <div className="text-xs text-gray-400 font-medium">{clientInfo?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {job.isUrgent && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-100">
                  <Zap size={9} /> Urgent
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${meta.color} ${meta.bg} ${meta.border}`}>
                {meta.label}
              </span>
            </div>
          </div>

          {/* Service & Description */}
          <div className="mb-5">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">{job.service}</h3>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{job.description}</p>
          </div>

          {/* Client dispute note */}
          {job.status === "disputed" && job.clientApproval?.note && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Client Raised an Issue</p>
                <p className="text-sm text-red-700">{job.clientApproval.note}</p>
              </div>
            </div>
          )}

          {/* Worker note shown after submit */}
          {job.status === "awaiting_approval" && job.workerNote && (
            <div className="mb-5 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
              <FileText size={16} className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Your Note to Client</p>
                <p className="text-sm text-orange-700">{job.workerNote}</p>
              </div>
            </div>
          )}

          {/* Awaiting approval state */}
          {job.status === "awaiting_approval" && (
            <div className="mb-5 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-center">
              <Clock size={20} className="text-orange-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-orange-700">Waiting for client to confirm completion</p>
              <p className="text-xs text-orange-500 mt-1">The client will approve and release payment once satisfied</p>
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium mb-6">
            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-teal-500" />{job.location}</span>
            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-teal-500" />
              {new Date(job.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5"><Clock size={12} className="text-teal-500" />
              {new Date(job.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {clientInfo?.phone && (
              <span className="flex items-center gap-1.5"><MessageSquare size={12} className="text-teal-500" />{clientInfo.phone}</span>
            )}
          </div>

          {/* Footer: pay + actions */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Banknote size={16} className="text-teal-500" />
                <span className="text-2xl font-black text-[#0F172A]">
                  ₹{(job.actualPay || job.estimatedPay).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">
                  {job.status === "completed" ? "Paid · Cash" : "Estimated · Cash on completion"}
                </span>
                {job.paymentStatus === "paid" && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-[9px] font-black uppercase border border-teal-100">
                    ✓ Paid
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {job.status === "pending" && (
                <>
                  <button onClick={() => handleAcceptDecline("decline")} disabled={!!loading}
                    className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all disabled:opacity-50 flex items-center gap-1.5">
                    {loading === "decline" ? <Loader2 size={12} className="animate-spin" /> : <><XCircle size={12} />Decline</>}
                  </button>
                  <button onClick={() => handleAcceptDecline("accept")} disabled={!!loading}
                    className="h-10 px-4 rounded-xl bg-[#0F172A] text-xs font-bold text-white hover:bg-teal-600 transition-all disabled:opacity-50 flex items-center gap-1.5">
                    {loading === "accept" ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle2 size={12} />Accept</>}
                  </button>
                </>
              )}

              {action && (
                <button
                  onClick={() => action.next === "awaiting_approval" ? setShowNoteModal(true) : handleAdvance("")}
                  disabled={!!loading}
                  className={`h-10 px-5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 ${action.color}`}
                >
                  {loading === "advance" ? <Loader2 size={12} className="animate-spin" /> : <><action.icon size={12} />{action.label}</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {showNoteModal && <WorkerNoteModal job={job} onSubmit={handleAdvance} onClose={() => setShowNoteModal(false)} />}
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function JobsPage() {
  const [activeStatus, setActiveStatus] = useState("");
  const [jobs, setJobs] = useState<BookingJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (status: string, p: number) => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: "10" };
      if (status) params.status = status;
      const res = await bookingApi.getWorkerJobs(params);
      setJobs(res.jobs); setTotal(res.pagination.total); setPages(res.pagination.pages);
    } catch (e: any) { setError(e.message || "Failed to load jobs"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(activeStatus, page); }, [activeStatus, page, fetchJobs]);

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">My Jobs</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">
            {total} {total === 1 ? "job" : "jobs"}
          </p>
        </div>
        <button onClick={() => fetchJobs(activeStatus, page)}
          className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Payment Flow Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-[20px] p-5 flex items-center gap-4">
        <Banknote size={24} className="text-teal-600 shrink-0" />
        <div>
          <p className="text-sm font-bold text-[#0F172A]">💵 Cash on Completion</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Complete the job → submit for client review → client confirms → collect cash payment.
            <strong className="text-teal-700"> Clients control final approval to prevent fraud.</strong>
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const m = STATUS_META[tab];
          return (
            <button key={tab} onClick={() => { setActiveStatus(tab); setPage(1); }}
              className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeStatus === tab ? `${m.color} ${m.bg} ${m.border}` : "text-gray-400 bg-white border-gray-100 hover:border-gray-200"
              }`}>
              {m.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">{error}</div>
      )}

      {/* Job List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[24px] border border-gray-100 h-48 animate-pulse" />
            ))
          ) : jobs.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-[32px] border border-gray-100">
              <Briefcase size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No jobs found</p>
              <p className="text-xs text-gray-300 mt-2">
                {activeStatus ? `No ${STATUS_META[activeStatus]?.label.toLowerCase()} jobs.` : "Your job history will appear here."}
              </p>
            </motion.div>
          ) : (
            jobs.map(job => (
              <JobCard key={job._id} job={job} onAction={() => fetchJobs(activeStatus, page)} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-2xl text-sm font-black transition-all ${
                page === i + 1 ? "bg-[#0F172A] text-white shadow-lg" : "bg-white border border-gray-100 text-gray-400 hover:border-gray-200"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
