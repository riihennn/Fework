"use client";

import { useEffect, useState, useCallback } from "react";
import { ticketApi, TicketData } from "@/services/api";
import { AlertCircle, CheckCircle2, Clock, Image as ImageIcon, Search, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  OPEN: { label: "Open", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: AlertCircle },
  IN_REVIEW: { label: "In Review", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: Clock },
  WAITING_FOR_RESPONSE: { label: "Needs Response", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: AlertCircle },
  RESOLVED: { label: "Resolved", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200", icon: AlertCircle },
  CLOSED: { label: "Closed", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", icon: CheckCircle2 },
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const data = await ticketApi.getMyTickets();
      setTickets(data.tickets || []);
    } catch (e: any) {
      setError(e.message || "Failed to load tickets");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-4xl mx-auto pt-8 pb-20 px-4 md:px-8 space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">My Support Tickets</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
            </p>
          </div>
          <button onClick={() => fetchTickets()}
            className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error && (
          <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">{error}</div>
        )}

        {/* Ticket list */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] border border-gray-100 h-40 animate-pulse" />
              ))
            ) : tickets.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-24 bg-white rounded-[32px] border border-gray-100">
                <AlertCircle size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No tickets found</p>
                <p className="text-xs text-gray-300 mt-2">
                  You haven't raised any issues yet.
                </p>
              </motion.div>
            ) : (
              tickets.map(ticket => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketData }) {
  const m = STATUS_META[ticket.status] || STATUS_META.OPEN;
  const Icon = m.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Left: Status & ID */}
        <div className="flex-1 md:max-w-[200px]">
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${m.bg} ${m.color} ${m.border}`}>
              <Icon size={12} /> {m.label}
            </span>
          </div>
          <div className="text-xs text-gray-400 font-mono mb-1">TKT-{ticket._id.slice(-6).toUpperCase()}</div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
        </div>

        {/* Center: Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">
              {ticket.issueType}
            </span>
          </div>
          <h3 className="text-lg font-black text-[#0F172A] truncate mb-2">{ticket.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{ticket.description}</p>
          
          {ticket.booking && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Booking</div>
                <div className="text-sm font-bold text-[#0F172A]">{ticket.booking.service}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 font-mono">ID: {ticket.booking._id.slice(-6).toUpperCase()}</div>
              </div>
            </div>
          )}

          {ticket.resolution && (
            <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-2xl">
              <div className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Resolution
              </div>
              <p className="text-sm text-teal-800">{ticket.resolution}</p>
            </div>
          )}
        </div>

        {/* Right: Images */}
        {ticket.evidenceImages && ticket.evidenceImages.length > 0 && (
          <div className="w-full md:w-32 shrink-0">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Evidence</div>
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group-hover:border-teal-100 transition-colors bg-slate-50">
              <img src={ticket.evidenceImages[0]} alt="Evidence" className="w-full h-full object-cover" />
              {ticket.evidenceImages.length > 1 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-black text-sm">+{ticket.evidenceImages.length - 1}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
