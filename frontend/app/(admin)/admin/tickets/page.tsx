"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, TicketData } from "@/services/api";
import { 
  Search, AlertCircle, CheckCircle, Clock, Trash2, 
  ExternalLink, User, ShieldAlert, LifeBuoy, X, CheckSquare, MessageSquare, MapPin, Calendar, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUSES = ["all", "OPEN", "IN_REVIEW", "WAITING_FOR_RESPONSE", "RESOLVED", "REJECTED", "CLOSED"];
const ROLES = ["all", "client", "worker"];

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  OPEN: { label: "Open", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: AlertCircle },
  IN_REVIEW: { label: "In Review", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: Clock },
  WAITING_FOR_RESPONSE: { label: "Needs Response", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: AlertCircle },
  RESOLVED: { label: "Resolved", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200", icon: AlertCircle },
  CLOSED: { label: "Closed", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", icon: CheckCircle },
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TicketData | null>(null);

  // Resolution Form State
  const [adminNotes, setAdminNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [resolveStatus, setResolveStatus] = useState("RESOLVED");
  const [resolving, setResolving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getTickets();
      setTickets(data.tickets ?? []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminApi.updateTicketStatus(id, newStatus as "open" | "in_progress" | "resolved" | "closed");
      setTickets((prev) => prev.map((t) => t._id === id ? { ...t, status: newStatus as any } : t));
      if (selectedTicket && selectedTicket._id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    setResolving(true);
    try {
      const { ticket } = await adminApi.resolveTicket(selectedTicket._id, {
        adminNotes,
        resolution,
        status: resolveStatus
      });
      setTickets((prev) => prev.map((t) => t._id === ticket._id ? ticket : t));
      setSelectedTicket(ticket);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setResolving(false);
    }
  };

  const handleAssignRevisit = async () => {
    if (!selectedTicket) return;
    if (!confirm("Are you sure you want to assign a priority revisit to the worker? This will create a new urgent job and resolve this ticket.")) return;
    
    setResolving(true);
    try {
      const { ticket } = await adminApi.assignTicketRevisit(selectedTicket._id, {});
      setTickets((prev) => prev.map((t) => t._id === ticket._id ? ticket : t));
      setSelectedTicket(ticket);
      alert("Priority revisit assigned successfully!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setResolving(false);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      await adminApi.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t._id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      t._id.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || t.role === roleFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const fmtDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // KPIs
  const totalOpen = tickets.filter(t => t.status === "OPEN").length;
  const inReview = tickets.filter(t => t.status === "IN_REVIEW").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;
  const rejectedCount = tickets.filter(t => t.status === "REJECTED").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and resolve user disputes, complaints, and platform issues.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
          <div className="text-rose-500 bg-rose-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4"><AlertCircle size={20} /></div>
          <div className="text-2xl font-black text-[#0F172A]">{totalOpen}</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Open</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
          <div className="text-blue-500 bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4"><Clock size={20} /></div>
          <div className="text-2xl font-black text-[#0F172A]">{inReview}</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">In Review</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
          <div className="text-teal-500 bg-teal-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4"><CheckCircle size={20} /></div>
          <div className="text-2xl font-black text-[#0F172A]">{resolvedCount}</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Resolved</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
          <div className="text-gray-500 bg-gray-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4"><ShieldAlert size={20} /></div>
          <div className="text-2xl font-black text-[#0F172A]">{rejectedCount}</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Rejected</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search bar */}
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/5 transition-all">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, title, details, or user..."
              className="bg-transparent border-none outline-none flex-1 text-sm text-[#0F172A] placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Role filter */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-2xl">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    roleFilter === r
                      ? "bg-white text-teal-600 shadow-sm"
                      : "text-gray-400 hover:text-[#0F172A]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <select
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer outline-none hover:bg-slate-100/50 transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">ALL STATUSES</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_REVIEW">IN REVIEW</option>
              <option value="WAITING_FOR_RESPONSE">NEEDS RESPONSE</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List Card */}
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
              <LifeBuoy size={48} className="mb-4 text-gray-300 animate-pulse" />
              <p className="font-bold text-[#0F172A] text-lg">No support tickets found</p>
              <p className="text-sm text-gray-400 mt-1">There are no active user reports matching these criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Ticket ID / Date</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Reporter</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Booking</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Issue Type / Title</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTickets.map((t) => {
                  const m = STATUS_META[t.status] || STATUS_META.OPEN;
                  return (
                    <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="text-sm font-black text-[#0F172A]">TKT-{t._id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] text-gray-400 mt-1 font-bold">{fmtDate(t.createdAt)}</div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0F172A] text-sm font-black uppercase shadow-inner">
                            {t.user?.name?.[0] || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                              {t.user?.name || "Unknown User"}
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                t.role === "client" ? "bg-cyan-50 text-cyan-600" : "bg-purple-50 text-purple-600"
                              }`}>
                                {t.role}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{t.user?.email || "No Email"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 max-w-[200px]">
                        {t.booking ? (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                            <div className="text-xs font-black text-[#0F172A] truncate" title={t.booking.service}>
                              {t.booking.service}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold mt-0.5">
                              {new Date(t.booking.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </td>

                      <td className="px-6 py-5 max-w-[180px]">
                        <div className="text-sm font-bold text-[#0F172A] truncate" title={t.title}>
                          {t.title}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                          {t.issueType}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${m.bg} ${m.color} ${m.border}`}>
                          <m.icon size={10} />
                          {m.label}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setAdminNotes(t.adminNotes || "");
                              setResolution(t.resolution || "");
                              setResolveStatus(t.status === "RESOLVED" || t.status === "REJECTED" ? t.status : "RESOLVED");
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-[#0F172A] hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-sm"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" 
              onClick={() => setSelectedTicket(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-[32px] w-full max-w-5xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
              {/* LEFT COL: Ticket Info & Evidence */}
              <div className="flex-1 bg-white p-8 overflow-y-auto border-r border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-black text-[#0F172A]">TKT-{selectedTicket._id.slice(-6).toUpperCase()}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        STATUS_META[selectedTicket.status]?.bg} ${STATUS_META[selectedTicket.status]?.color}`}>
                        {STATUS_META[selectedTicket.status]?.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Raised: {fmtDate(selectedTicket.createdAt)}
                    </p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="md:hidden p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="mb-8">
                  <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mb-3">
                    {selectedTicket.issueType}
                  </span>
                  <h2 className="text-2xl font-black text-[#0F172A] mb-3 leading-tight">{selectedTicket.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed bg-slate-50 p-4 rounded-2xl whitespace-pre-line border border-slate-100">
                    {selectedTicket.description}
                  </p>
                </div>

                {selectedTicket.evidenceImages && selectedTicket.evidenceImages.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FileText size={12} /> Evidence Images
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedTicket.evidenceImages.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-teal-500 transition-all">
                          <img src={img} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTicket.booking && (
                  <div className="mb-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Calendar size={12} /> Linked Booking
                    </h3>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2">
                      <div className="font-bold text-[#0F172A] text-sm">{selectedTicket.booking.service}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5"><MapPin size={12} /> {selectedTicket.booking.location}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5"><Clock size={12} /> {new Date(selectedTicket.booking.scheduledAt).toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1">ID: {selectedTicket.booking._id}</div>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User size={12} /> Reporter
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-[#0F172A]">
                      {selectedTicket.user?.name?.[0] || "?"}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        {selectedTicket.user?.name || "Unknown User"}
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          selectedTicket.role === "client" ? "bg-cyan-50 text-cyan-600" : "bg-purple-50 text-purple-600"
                        }`}>{selectedTicket.role}</span>
                      </div>
                      <div className="text-xs text-gray-500">{selectedTicket.user?.email || "No Email"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COL: Admin Action & Resolution */}
              <div className="w-full md:w-[400px] bg-slate-50 p-8 flex flex-col h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={16} className="text-teal-500" /> Admin Action
                  </h3>
                  <button onClick={() => setSelectedTicket(null)} className="hidden md:flex p-2 bg-white text-gray-400 hover:text-gray-600 rounded-full transition-colors shadow-sm">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-5 flex-1">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Quick Status Update</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] outline-none focus:border-teal-500 transition-all shadow-sm"
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)}
                    >
                      {STATUSES.filter(s => s !== "all").map(s => (
                        <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                      ))}
                    </select>
                  </div>

                  <hr className="border-gray-200" />

                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Admin Private Notes</label>
                    <textarea 
                      value={adminNotes} 
                      onChange={e => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes for other admins..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:border-teal-500 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2 block">Resolution / Final Word</label>
                    <textarea 
                      value={resolution} 
                      onChange={e => setResolution(e.target.value)}
                      placeholder="What was the outcome? (Visible to user if resolved)"
                      className="w-full bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-900 placeholder:text-teal-700/50 resize-none h-32 focus:outline-none focus:border-teal-500 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Resolution Action</label>
                    <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => { setResolveStatus("RESOLVED"); handleResolveTicket(); }}
                        disabled={resolving}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        Resolve Issue
                      </button>
                      <button 
                        onClick={() => { setResolveStatus("REJECTED"); handleResolveTicket(); }}
                        disabled={resolving}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm py-3 rounded-xl transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                    {selectedTicket.booking && selectedTicket.status !== "RESOLVED" && (
                      <button 
                        onClick={handleAssignRevisit}
                        disabled={resolving}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <AlertCircle size={16} /> Assign Priority Revisit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
