"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Clock, Loader2, MapPin, Calendar, RefreshCw,
  Zap, User, Banknote, CheckCircle2, AlertTriangle, FileText,
  Phone, Star, ChevronRight, X
} from "lucide-react";
import { bookingApi, reviewApi, BookingJob } from "@/services/api";

// ─── Status Config ──────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; dot: string; desc: string }> = {
  "":                 { label: "All",               color: "text-gray-500",   bg: "bg-gray-50",     border: "border-gray-200",   dot: "bg-gray-300",   desc: "" },
  pending:            { label: "Pending",            color: "text-amber-600",  bg: "bg-amber-50",    border: "border-amber-200",  dot: "bg-amber-400",  desc: "Waiting for worker to accept" },
  accepted:           { label: "Accepted",           color: "text-blue-600",   bg: "bg-blue-50",     border: "border-blue-200",   dot: "bg-blue-400",   desc: "Worker has accepted your booking" },
  in_progress:        { label: "In Progress",        color: "text-indigo-600", bg: "bg-indigo-50",   border: "border-indigo-200", dot: "bg-indigo-400", desc: "Work is currently underway" },
  awaiting_approval:  { label: "Awaiting Approval",  color: "text-orange-600", bg: "bg-orange-50",   border: "border-orange-200", dot: "bg-orange-400", desc: "Worker marked job complete — please confirm" },
  disputed:           { label: "Disputed",           color: "text-red-600",    bg: "bg-red-50",      border: "border-red-200",    dot: "bg-red-400",    desc: "You raised an issue — worker is re-doing" },
  completed:          { label: "Completed",          color: "text-teal-600",   bg: "bg-teal-50",     border: "border-teal-200",   dot: "bg-teal-400",   desc: "Job completed and payment released" },
  cancelled:          { label: "Cancelled",          color: "text-gray-400",   bg: "bg-gray-50",     border: "border-gray-200",   dot: "bg-gray-300",   desc: "Booking was cancelled" },
};

const STATUS_TABS = ["", "pending", "accepted", "in_progress", "awaiting_approval", "completed", "disputed", "cancelled"];

// ─── Approval Modal ──────────────────────────────────────────────────────
function ApprovalModal({
  job,
  onClose,
  onDone,
  onApproved,
}: {
  job: BookingJob;
  onClose: () => void;
  onDone: () => void;
  onApproved: (jobId: string) => void;
}) {
  const [action, setAction] = useState<"approve" | "dispute" | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action) return;
    setLoading(true);
    try {
      await bookingApi.approveJob(job._id, action, note || undefined);
      if (action === "approve") {
        onApproved(job._id);
      } else {
        onDone();
      }
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden"
      >
        {/* Modal header */}
        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-[#0F172A]">Review Job Completion</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all">
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-400">
            The worker has completed <span className="font-bold text-[#0F172A]">{job.service}</span>.
            Please inspect the work before confirming.
          </p>
        </div>

        {/* Worker note */}
        {job.workerNote && (
          <div className="px-8 pt-6">
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
              <FileText size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Worker's Note</p>
                <p className="text-sm text-orange-800">{job.workerNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment breakdown */}
        <div className="px-8 pt-6">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Summary</p>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Estimated Price</span>
              <span className="font-bold text-[#0F172A]">₹{job.estimatedPay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-[#0F172A]">Pay to Worker (Cash)</span>
              <span className="text-xl font-black text-[#0F172A]">₹{(job.actualPay || job.estimatedPay).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action choice */}
        <div className="px-8 pt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Decision</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAction("approve")}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                action === "approve"
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-100 hover:border-teal-200 bg-white"
              }`}
            >
              <CheckCircle2 size={20} className={action === "approve" ? "text-teal-500 mb-2" : "text-gray-300 mb-2"} />
              <p className="font-bold text-sm text-[#0F172A]">Confirm Complete</p>
              <p className="text-xs text-gray-400 mt-0.5">Work is done. Pay the worker.</p>
            </button>
            <button
              onClick={() => setAction("dispute")}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                action === "dispute"
                  ? "border-red-400 bg-red-50"
                  : "border-gray-100 hover:border-red-200 bg-white"
              }`}
            >
              <AlertTriangle size={20} className={action === "dispute" ? "text-red-500 mb-2" : "text-gray-300 mb-2"} />
              <p className="font-bold text-sm text-[#0F172A]">Raise Issue</p>
              <p className="text-xs text-gray-400 mt-0.5">Work isn't satisfactory yet.</p>
            </button>
          </div>
        </div>

        {/* Note field */}
        <div className="px-8 pt-4">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={action === "dispute" ? "Describe the issue clearly so the worker can fix it..." : "Optional message to the worker (e.g. great service!)"}
            rows={3}
            className="w-full border border-gray-200 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
          />
        </div>

        {/* Submit */}
        <div className="p-8 pt-4">
          <button
            onClick={handleSubmit}
            disabled={!action || loading}
            className={`w-full h-13 py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 ${
              action === "dispute"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (
              action === "dispute" ? <><AlertTriangle size={16} />Report Issue</> : <><CheckCircle2 size={16} />Confirm & Release Payment</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Review Modal ────────────────────────────────────────────────────────
function ReviewModal({
  jobId, onClose, onDone
}: { jobId: string; onClose: () => void; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      await reviewApi.submit(jobId, rating, comment || undefined);
      setSubmitted(true);
      setTimeout(() => { onDone(); onClose(); }, 1500);
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-md p-8"
      >
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-teal-500" />
            </div>
            <h3 className="text-xl font-black text-[#0F172A] mb-1">Thank you!</h3>
            <p className="text-sm text-gray-400">Your review has been submitted.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-[#0F172A]">Rate Your Experience</h3>
                <p className="text-xs text-gray-400 mt-0.5">How was the service?</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <X size={16} />
              </button>
            </div>

            {/* Star selector */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {[1,2,3,4,5].map(s => (
                <button key={s}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${
                      s <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mb-6">
              {rating === 0 ? "Tap a star to rate" : ["Poor","Fair","Good","Very Good","Excellent!"][rating-1]}
            </p>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={3}
              className="w-full border border-gray-200 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all mb-6"
            />

            <button
              onClick={handleSubmit}
              disabled={!rating || loading}
              className="w-full h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Star size={16} />Submit Review</>}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Booking Card ──────────────────────────────────────────────────────
function BookingCard({ job, onRefresh }: { job: BookingJob; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const meta = STATUS_META[job.status] || STATUS_META[""];
  const workerUser = typeof job.worker === "object" ? (job.worker as any)?.user : null;

  const handleApproved = (jobId: string) => {
    onRefresh();
    setShowReview(true); // Auto-open review modal after approval
  };

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
        {/* Color bar */}
        <div className={`h-1 ${meta.dot}`} />

        <div className="p-6 md:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              {/* Worker avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                {workerUser?.avatar
                  ? <img src={workerUser.avatar} alt={workerUser.name} className="w-full h-full object-cover" />
                  : <User size={24} className="text-gray-300" />
                }
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Service Provider</p>
                <div className="font-bold text-[#0F172A] text-base">{workerUser?.name || "Professional"}</div>
                {workerUser?.phone && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Phone size={10} />{workerUser.phone}
                  </div>
                )}
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

          {/* Service */}
          <h3 className="font-bold text-[#0F172A] text-lg mb-1">{job.service}</h3>
          <p className="text-sm text-gray-500 mb-1">{meta.desc}</p>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-5">{job.description}</p>

          {/* Awaiting approval — call to action */}
          {job.status === "awaiting_approval" && (
            <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800">Worker says the job is done!</p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      Please inspect the work and confirm completion before paying.
                    </p>
                    {job.workerNote && (
                      <p className="text-xs text-orange-700 mt-2 bg-white/60 rounded-xl p-2 border border-orange-100">
                        <strong>Worker's note:</strong> {job.workerNote}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="shrink-0 h-10 px-4 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all flex items-center gap-1.5"
                >
                  Review <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Disputed */}
          {job.status === "disputed" && job.clientApproval?.note && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <FileText size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Your Reported Issue</p>
                <p className="text-sm text-red-700">{job.clientApproval.note}</p>
              </div>
            </div>
          )}

          {/* Completed */}
          {job.status === "completed" && (
            <div className="mb-5 p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={18} className="text-teal-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-teal-700">Payment Confirmed</p>
                <p className="text-xs text-teal-600">Cash was paid to the worker on {new Date(job.clientApproval?.approvedAt || job.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="ml-auto shrink-0">
                {!job.reviewed ? (
                  <button onClick={() => setShowReview(true)}
                    className="h-8 px-3 rounded-xl bg-teal-100 text-teal-700 text-xs font-bold hover:bg-teal-200 transition-all flex items-center gap-1.5">
                    <Star size={12} />Rate Worker
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-teal-500 font-bold">
                    <Star size={12} className="fill-amber-400 text-amber-400" />Reviewed
                  </span>
                )}
              </div>
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
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <Banknote size={16} className="text-teal-500" />
                <span className="text-2xl font-black text-[#0F172A]">
                  ₹{(job.actualPay || job.estimatedPay).toLocaleString()}
                </span>
                {job.paymentStatus === "paid" && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-[9px] font-black uppercase border border-teal-100">✓ Paid</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {job.paymentStatus === "paid" ? "Cash paid" : "Cash payable on completion"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Booked on</p>
              <p className="text-xs font-bold text-gray-500">
                {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <ApprovalModal
            job={job}
            onClose={() => setShowModal(false)}
            onDone={onRefresh}
            onApproved={handleApproved}
          />
        )}
        {showReview && (
          <ReviewModal
            jobId={job._id}
            onClose={() => setShowReview(false)}
            onDone={onRefresh}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function MyBookingsPage() {
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
      const res = await bookingApi.getClientJobs(params);
      setJobs(res.jobs); setTotal(res.pagination.total); setPages(res.pagination.pages);
    } catch (e: any) { setError(e.message || "Failed to load bookings"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(activeStatus, page); }, [activeStatus, page, fetchJobs]);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <main className="max-w-4xl mx-auto pt-8 pb-20 px-4 md:px-8 space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">My Bookings</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">
              {total} {total === 1 ? "booking" : "bookings"}
            </p>
          </div>
          <button onClick={() => fetchJobs(activeStatus, page)}
            className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* How payment works banner */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-[20px] p-5 flex items-start gap-4">
          <Banknote size={24} className="text-teal-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white">💵 How Payment Works</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Payment is <strong className="text-teal-400">Cash on Completion</strong>. After the worker marks the job done,
              you'll review their work here and confirm. <strong className="text-white">Only you can release payment</strong> — this protects you from fraud.
            </p>
          </div>
        </div>

        {/* Status tabs */}
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

        {/* Booking list */}
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
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No bookings found</p>
                <p className="text-xs text-gray-300 mt-2">
                  {activeStatus ? `No ${STATUS_META[activeStatus]?.label.toLowerCase()} bookings.` : "Your service history will appear here."}
                </p>
              </motion.div>
            ) : (
              jobs.map(job => (
                <BookingCard key={job._id} job={job} onRefresh={() => fetchJobs(activeStatus, page)} />
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
      </main>
    </div>
  );
}
