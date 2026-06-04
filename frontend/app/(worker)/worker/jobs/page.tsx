"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Clock, CheckCircle2, XCircle, Loader2, MapPin,
  Calendar, RefreshCw, Zap, ChevronRight, AlertTriangle,
  MessageSquare, User, Banknote, FileText, Send, CalendarClock, Play, Square, Timer, Phone,
  Search, X
} from "lucide-react";
import { io } from "socket.io-client";
import { bookingApi, ticketApi, BookingJob, JobStatus, BACKEND_URL } from "@/services/api";
import StatusErrorModal from "@/components/worker/dashboard/StatusErrorModal";
import ChatBox from "@/components/shared/ChatBox";
import Avatar from "@/components/shared/Avatar";
import { useAuthStore } from "@/store/authStore";

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
const ACTIVE_STATUS_TABS = ["", "pending", "accepted", "in_progress", "awaiting_approval", "disputed"];
const HISTORY_STATUS_TABS = ["", "completed", "cancelled"];

// ─── Worker status transitions ─────────────────────────────────────────
const WORKER_ACTIONS: Record<string, { label: string; next: string; icon: any; color: string }> = {
  accepted:    { label: "Start Job",           next: "in_progress",       icon: Play,         color: "bg-blue-600 hover:bg-blue-700 text-white" },
  in_progress: { label: "End Job",             next: "awaiting_approval", icon: Square,       color: "bg-orange-500 hover:bg-orange-600 text-white" },
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



// ─── Live Timer ────────────────────────────────────────────────────────
function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    
    const update = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full font-mono text-sm font-bold shadow-sm">
      <Timer size={14} className="animate-pulse text-indigo-500" />
      {h.toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
    </div>
  );
}

// ─── Job Card ──────────────────────────────────────────────────────────
function JobCard({ job, onAction }: { job: BookingJob; onAction: () => void }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [activeChatJob, setActiveChatJob] = useState<{ id: string; title: string } | null>(null);
  const meta = STATUS_META[job.status] || STATUS_META[""];
  const action = WORKER_ACTIONS[job.status];
  const clientInfo = job.client as { name: string; email: string; phone?: string };

  const handleAcceptDecline = async (act: "accept" | "decline") => {
    setLoading(act);
    try { await bookingApi.respond(job._id, act); onAction(); }
    catch (e: any) { setErrorModal({ open: true, message: e.message || "Action failed" }); }
    finally { setLoading(null); }
  };

  const handleAdvance = async (note: string) => {
    setShowNoteModal(false);
    setLoading("advance");
    try { await bookingApi.updateStatus(job._id, action.next, { workerNote: note }); onAction(); }
    catch (e: any) { setErrorModal({ open: true, message: e.message || "Failed to update job status" }); }
    finally { setLoading(null); }
  };

  const showChat = ["accepted", "in_progress", "awaiting_approval", "disputed"].includes(job.status);


  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">

        {/* Status bar */}
        <div className={`h-1 ${meta.dot}`} />

        <div className="p-6 md:p-7">
          {/* Top Row: Status Badges */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${meta.color} ${meta.bg} ${meta.border}`}>
              {meta.label}
            </span>
            {job.isUrgent && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-100">
                <Zap size={9} /> Urgent
              </span>
            )}
          </div>

          {/* Client Details Section - Highlighted */}
          <div className="flex items-start gap-4 mb-5 p-4 bg-gray-50/80 rounded-2xl border border-gray-100/80">
            <Avatar
              src={(clientInfo as any)?.avatar}
              name={clientInfo?.name}
              size={52}
              className="rounded-2xl shrink-0 shadow-sm border border-white"
            />
            <div className="flex-1 min-w-0">
              <div className="font-black text-[#0F172A] text-lg mb-0.5 truncate capitalize">{clientInfo?.name || "Client"}</div>
              <div className="flex flex-col gap-1.5 mt-1 text-xs text-gray-500 font-medium">
                {clientInfo?.phone && (
                  <span className="flex items-center gap-2"><Phone size={14} className="text-teal-500 shrink-0" /> {clientInfo.phone}</span>
                )}
                <span className="flex items-center gap-2"><MapPin size={14} className="text-teal-500 shrink-0" /> <span className="line-clamp-2 leading-relaxed">{job.location}</span></span>
              </div>
            </div>
          </div>

          {/* Service & Description */}
          <div className="mb-5 px-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Requirement</p>
            <p className="text-sm text-[#0F172A] leading-relaxed font-medium">{job.description}</p>
          </div>

          {/* Schedule Box */}
          <div className="flex flex-wrap items-center gap-4 p-3.5 bg-teal-50/40 border border-teal-100/50 rounded-xl mb-6 text-sm font-bold text-teal-800">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-teal-600" />
              {new Date(job.scheduledAt).toLocaleDateString("en-IN", { weekday: 'short', day: "numeric", month: "short", year: "numeric" })}
            </span>
            <div className="hidden sm:block w-px h-4 bg-teal-200" />
            <span className="flex items-center gap-2"><Clock size={16} className="text-teal-600" />
              {new Date(job.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* ── Rescheduled by Client Notice ──────────────────────── */}
          {(job.rescheduledCount ?? 0) >= 1 && ["pending", "accepted"].includes(job.status) && (
            <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <CalendarClock size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-0.5">📅 Rescheduled by Client</p>
                <p className="text-sm text-blue-700 font-medium">
                  The client moved this appointment to{" "}
                  <span className="font-bold">
                    {new Date(job.scheduledAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    {" at "}
                    {new Date(job.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>.
                  Please plan accordingly.
                </p>
              </div>
            </div>
          )}

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

          {/* In Progress Timer */}
          {job.status === "in_progress" && (job as any).startedAt && (
            <div className="mb-5 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Job in Progress</p>
                <p className="text-sm text-indigo-700">Time spent working on this job.</p>
              </div>
              <LiveTimer startedAt={(job as any).startedAt} />
            </div>
          )}

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

              {showChat && (
                <>
                  <button onClick={() => setActiveChatJob({ id: job._id, title: job.service })}
                    className="h-10 px-4 rounded-xl bg-teal-50 border border-teal-100 text-xs font-bold text-teal-600 hover:bg-teal-100 hover:text-teal-700 transition-all flex items-center gap-1.5">
                    <MessageSquare size={12} /> Chat
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

      <StatusErrorModal 
        isOpen={errorModal.open} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ open: false, message: "" })} 
      />
      <ChatBox
        isOpen={!!activeChatJob}
        onClose={() => setActiveChatJob(null)}
        jobId={activeChatJob?.id || ""}
        jobTitle={activeChatJob?.title || ""}
        currentUserId={user?._id || ""}
        currentUserModel="Worker"
      />
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
export default function JobsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [activeStatus, setActiveStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jobs, setJobs] = useState<BookingJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (tab: string, status: string, p: number, search: string, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: "10" };
      if (search) params.search = search;
      if (status) {
        params.status = status;
      } else {
        params.status = tab === "active" 
          ? "pending,accepted,in_progress,awaiting_approval,disputed" 
          : "completed,cancelled";
      }
      const res = await bookingApi.getWorkerJobs(params);
      setJobs(res.jobs); setTotal(res.pagination.total); setPages(res.pagination.pages);
    } catch (e: any) { setError(e.message || "Failed to load jobs"); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchJobs(activeTab, activeStatus, page, searchQuery);
  }, [fetchJobs, activeTab, activeStatus, page, searchQuery]);

  useEffect(() => {
    if (!user?._id) return;

    const socketURL = BACKEND_URL.replace("/api", "");
    const socket = io(socketURL, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("join_user", user._id);
    });

    socket.on("new_booking", () => {
      fetchJobs(activeTab, activeStatus, page, searchQuery, true);
    });

    socket.on("booking_updated", () => {
      fetchJobs(activeTab, activeStatus, page, searchQuery, true);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeTab, activeStatus, page, searchQuery, fetchJobs]);

  const currentTabs = activeTab === "active" ? ACTIVE_STATUS_TABS : HISTORY_STATUS_TABS;

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">My Jobs</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">
            {total} {total === 1 ? "job" : "jobs"}
          </p>
        </div>
        <button onClick={() => fetchJobs(activeTab, activeStatus, page, searchQuery)}
          className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>


      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button 
          onClick={() => { setActiveTab("active"); setActiveStatus(""); setPage(1); }}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === "active" ? "border-teal-500 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          Active Jobs
        </button>
        <button 
          onClick={() => { setActiveTab("history"); setActiveStatus(""); setPage(1); }}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === "history" ? "border-teal-500 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          History
        </button>
      </div>

      {/* Status filter dropdown & Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</label>
          <div className="relative">
            <select
              value={activeStatus}
              onChange={(e) => { setActiveStatus(e.target.value); setPage(1); }}
              className="appearance-none bg-white border border-gray-200 rounded-2xl pl-4 pr-10 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all cursor-pointer min-w-[160px]"
            >
              {currentTabs.map((tab) => (
                <option key={tab} value={tab}>{STATUS_META[tab].label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {activeTab === "history" && (
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(searchInput);
                  setPage(1);
                }
              }}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
            />
            {searchInput && (
              <button 
                onClick={() => { setSearchInput(""); setSearchQuery(""); setPage(1); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
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
              <div key={job._id} className="relative">
                <JobCard job={job} onAction={() => fetchJobs(activeTab, activeStatus, page, searchQuery, true)} />
              </div>
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
