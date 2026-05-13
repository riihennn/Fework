"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RefreshCw, User, Briefcase, MessageSquare, TrendingUp } from "lucide-react";
import { reviewApi, MyReviewsResponse, ReviewData } from "@/services/api";

// ─── Star Display ────────────────────────────────────────────────────────
function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

// ─── Rating Breakdown Bar ─────────────────────────────────────────────────
function BreakdownBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 w-12 shrink-0">
        <span className="text-xs font-bold text-gray-500">{star}</span>
        <Star size={11} className="fill-amber-400 text-amber-400" />
      </div>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-amber-400 rounded-full"
        />
      </div>
      <span className="text-xs text-gray-400 font-bold w-6 text-right">{count}</span>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────
function ReviewCard({ review, i }: { review: ReviewData; i: number }) {
  const client = typeof review.client === "object" ? review.client as any : null;
  const job = typeof review.job === "object" ? review.job as any : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="bg-white rounded-[20px] border border-gray-100 p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Client avatar */}
        <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {client?.avatar
            ? <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
            : <User size={20} className="text-gray-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="font-bold text-[#0F172A] text-sm">{client?.name || "Client"}</div>
            <StarRow rating={review.rating} size={14} />
          </div>

          {job?.service && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
              <Briefcase size={10} />
              {job.service}
            </div>
          )}

          {review.comment ? (
            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
          ) : (
            <p className="text-xs text-gray-300 italic">No comment left.</p>
          )}

          <p className="text-[10px] text-gray-300 mt-3 font-medium">
            {new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const [data, setData] = useState<MyReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true); setError(null);
    try {
      const res = await reviewApi.getMyReviews();
      setData(res);
    } catch (e: any) {
      setError(e.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-gray-100 rounded-2xl" />
        <div className="h-48 bg-white rounded-[28px] border border-gray-100" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-[20px] border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl">
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-sm">
          {error || "Could not load reviews."}
        </div>
      </div>
    );
  }

  const { reviews, total, avgRating, breakdown } = data;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Reviews</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">
            {total} {total === 1 ? "review" : "reviews"} from clients
          </p>
        </div>
        <button onClick={fetchReviews}
          className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[28px] border border-gray-100 p-8"
      >
        {total === 0 ? (
          <div className="text-center py-8">
            <Star size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No reviews yet</p>
            <p className="text-xs text-gray-300 mt-2">Complete jobs and get clients to rate your work.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Big rating number */}
            <div className="text-center shrink-0">
              <div className="text-7xl font-black text-[#0F172A] tracking-tighter leading-none">
                {avgRating.toFixed(1)}
              </div>
              <StarRow rating={Math.round(avgRating)} size={20} />
              <p className="text-xs text-gray-400 mt-2 font-bold">out of 5.0</p>
              <div className="flex items-center gap-2 justify-center mt-3 px-4 py-2 bg-gray-50 rounded-2xl">
                <MessageSquare size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-bold">{total} ratings</span>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="flex-1 w-full space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <BreakdownBar key={star} star={star} count={breakdown[star] || 0} total={total} />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Tip banner */}
      {total > 0 && (
        <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-[20px]">
          <TrendingUp size={18} className="text-teal-600 shrink-0 mt-0.5" />
          <p className="text-xs text-teal-700 leading-relaxed">
            <strong>Your rating is {avgRating.toFixed(1)} ⭐</strong> — Great work! Higher ratings mean you appear first in search results.
            Keep delivering excellent service to climb the rankings.
          </p>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-4">
        <AnimatePresence>
          {reviews.length === 0 ? null : reviews.map((review, i) => (
            <ReviewCard key={review._id} review={review} i={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
