"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Banknote, TrendingUp, Clock, Briefcase, RefreshCw,
  ArrowUpRight, User, MapPin, Calendar, Zap
} from "lucide-react";
import { workerApi, EarningsData } from "@/services/api";

// ─── Mini Bar Chart ─────────────────────────────────────────────────────
function BarChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const pct = Math.round((d.amount / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full relative flex flex-col justify-end" style={{ height: "96px" }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, 3)}%` }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                className={`w-full rounded-t-lg ${d.amount > 0 ? "bg-teal-500 group-hover:bg-teal-600" : "bg-gray-100"} transition-colors`}
                style={{ minHeight: "4px" }}
              />
              {/* Tooltip */}
              {d.amount > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[10px] font-bold rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10">
                  ₹{d.amount.toLocaleString()}
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color, delay
}: {
  label: string; value: string; sub?: string; icon: any; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-[24px] border border-gray-100 p-4 md:p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-black text-[#0F172A] tracking-tight">{value}</div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-2">{sub}</div>}
    </motion.div>
  );
}

// ─── Transaction Row ─────────────────────────────────────────────────────
function TransactionRow({ tx, i }: { tx: EarningsData["recentTransactions"][0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.04, duration: 0.3 }}
      className="flex items-center gap-3 md:gap-4 py-4 border-b border-gray-50 last:border-0 group hover:bg-gray-50/60 -mx-5 px-5 md:-mx-8 md:px-8 transition-colors rounded-2xl"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
        {tx.clientAvatar
          ? <img src={tx.clientAvatar} alt={tx.client} className="w-full h-full rounded-xl object-cover" />
          : <User size={18} className="text-teal-600" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#0F172A] text-sm truncate">{tx.service}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-400 font-medium">{tx.client}</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-300">
            <MapPin size={9} />{tx.location}
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-400 font-medium">
          {new Date(tx.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <div className="flex items-center gap-1 text-teal-600 font-black">
          <ArrowUpRight size={14} />
          <span className="text-sm">₹{tx.amount.toLocaleString()}</span>
        </div>
        <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Cash Paid</span>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = async () => {
    setLoading(true); setError(null);
    try {
      const res = await workerApi.getEarnings();
      setData(res);
    } catch (e: any) {
      setError(e.message || "Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEarnings(); }, []);

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-white rounded-[24px] border border-gray-100" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-[24px] border border-gray-100" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl">
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-sm">
          {error || "Could not load earnings data."}
        </div>
      </div>
    );
  }

  const { summary, monthlyBreakdown, recentTransactions } = data;

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
          Cash · {summary.totalJobs} completed jobs
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Earned" delay={0}
          value={`₹${summary.totalEarnings.toLocaleString()}`}
          sub="All time · cash"
          icon={Banknote}
          color="text-teal-600 bg-teal-50"
        />
        <StatCard
          label="This Month" delay={0.08}
          value={`₹${summary.thisMonth.toLocaleString()}`}
          sub="Current month"
          icon={Calendar}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="This Week" delay={0.16}
          value={`₹${summary.thisWeek.toLocaleString()}`}
          sub="Since Sunday"
          icon={TrendingUp}
          color="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          label="Pending" delay={0.24}
          value={`₹${summary.pendingEarnings.toLocaleString()}`}
          sub="Awaiting client approval"
          icon={Clock}
          color="text-orange-500 bg-orange-50"
        />
        <StatCard
          label="Avg Per Job" delay={0.32}
          value={`₹${summary.avgPerJob.toLocaleString()}`}
          sub="Based on completed"
          icon={Zap}
          color="text-amber-500 bg-amber-50"
        />
        <StatCard
          label="Jobs Done" delay={0.40}
          value={String(summary.totalJobs)}
          sub="All time completed"
          icon={Briefcase}
          color="text-rose-500 bg-rose-50"
        />
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-[24px] md:rounded-[28px] border border-gray-100 p-5 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-black text-[#0F172A] text-lg">Monthly Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Earnings from completed jobs · last 6 months</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cash received</span>
          </div>
        </div>
        {monthlyBreakdown.every(d => d.amount === 0) ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-gray-300 font-bold uppercase tracking-widest">No earnings in last 6 months</p>
          </div>
        ) : (
          <BarChart data={monthlyBreakdown} />
        )}
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-[24px] md:rounded-[28px] border border-gray-100 p-5 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-black text-[#0F172A] text-lg">Recent Transactions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last {recentTransactions.length} completed payments</p>
          </div>
          {summary.pendingEarnings > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
              <Clock size={12} className="text-orange-500" />
              <span className="text-xs font-bold text-orange-600 whitespace-nowrap">
                ₹{summary.pendingEarnings.toLocaleString()} pending
              </span>
            </div>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-16">
            <Banknote size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No transactions yet</p>
            <p className="text-xs text-gray-300 mt-1">Complete jobs to see your earnings here</p>
          </div>
        ) : (
          <div>
            {recentTransactions.map((tx, i) => (
              <TransactionRow key={tx.id} tx={tx} i={i} />
            ))}
          </div>
        )}
      </div>

      {/* Payment info note */}
      <div className="p-5 bg-gray-50 border border-gray-100 rounded-[20px] flex items-start gap-3">
        <Banknote size={18} className="text-gray-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400 leading-relaxed">
          All payments are <strong className="text-gray-600">Cash on Completion</strong>. Earnings appear here after
          the client approves your work and releases payment. Pending earnings are jobs awaiting client confirmation.
        </p>
      </div>
    </div>
  );
}
