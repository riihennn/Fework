"use client";

import { useEffect, useState } from "react";
import { getTickets, saveTickets, SupportTicket } from "@/utils/ticketStorage";
import { 
  Search, AlertCircle, CheckCircle, Clock, Trash2, 
  ExternalLink, User, ShieldAlert, LifeBuoy, X, CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITIES = ["all", "low", "medium", "high", "urgent"];
const STATUSES = ["all", "open", "in_progress", "resolved"];
const ROLES = ["all", "client", "worker"];

const CATEGORY_LABELS: Record<string, string> = {
  payment: "Payment & Refunds",
  scheduling: "Bookings & Delays",
  quality: "Quality of Work",
  safety: "Safety & Misbehavior",
  technical: "Technical Bug",
  other: "Other Issue",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SupportTicket | null>(null);

  // Load tickets on mount
  useEffect(() => {
    setTickets(getTickets());
  }, []);

  const handleUpdateStatus = (id: string, newStatus: SupportTicket["status"]) => {
    const updated = tickets.map((t) => t.id === id ? { ...t, status: newStatus } : t);
    setTickets(updated);
    saveTickets(updated);
    
    // Keep selected ticket modal sync'd
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleDeleteTicket = (id: string) => {
    const updated = tickets.filter((t) => t.id !== id);
    setTickets(updated);
    saveTickets(updated);
    setDeleteConfirm(null);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || t.role === roleFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesRole && matchesPriority && matchesStatus;
  });

  const fmtDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityStyle = (p: SupportTicket["priority"]) => {
    switch (p) {
      case "urgent": return "bg-red-50 text-red-600 border-red-100";
      case "high": return "bg-amber-50 text-amber-600 border-amber-100";
      case "medium": return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusStyle = (s: SupportTicket["status"]) => {
    switch (s) {
      case "resolved": return "bg-green-50 text-green-600 border-green-100";
      case "in_progress": return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and resolve user disputes, complaints, and platform issues.</p>
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
              placeholder="Search by ticket ID, subject, details, or user..."
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
              <option value="open">OPEN</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="resolved">RESOLVED</option>
            </select>

            {/* Priority filter */}
            <select
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer outline-none hover:bg-slate-100/50 transition-colors"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">ALL PRIORITIES</option>
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
              <option value="urgent">URGENT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List Card */}
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredTickets.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
              <LifeBuoy size={48} className="mb-4 text-gray-300 animate-pulse" />
              <p className="font-bold text-[#0F172A] text-lg">No support tickets found</p>
              <p className="text-sm text-gray-400 mt-1">There are no active user reports matching these criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Ticket ID / Date</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Reporter</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Subject / Category</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Priority</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Ticket ID */}
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-[#0F172A]">{t.id}</div>
                      <div className="text-[10px] text-gray-400 mt-1 font-bold">{fmtDate(t.createdAt)}</div>
                    </td>

                    {/* Reporter info */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0F172A] text-sm font-black uppercase shadow-inner">
                          {t.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                            {t.name}
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              t.role === "client" ? "bg-cyan-50 text-cyan-600" : "bg-purple-50 text-purple-600"
                            }`}>
                              {t.role}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{t.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Subject & Category */}
                    <td className="px-8 py-5 max-w-sm">
                      <div className="text-sm font-bold text-[#0F172A] truncate" title={t.subject}>
                        {t.subject}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        {CATEGORY_LABELS[t.category] || t.category}
                      </div>
                    </td>

                    {/* Priority badge */}
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>

                    {/* Status pill */}
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(t.status)}`}>
                        <span className={`w-1 h-1 rounded-full ${
                          t.status === "resolved" ? "bg-green-500" : t.status === "in_progress" ? "bg-blue-500" : "bg-amber-500"
                        }`} />
                        {t.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="px-3 py-1.5 text-xs font-bold text-[#0F172A] hover:bg-slate-50 border border-slate-100 rounded-xl transition-all shadow-sm"
                        >
                          View Details
                        </button>
                        
                        {t.status !== "resolved" && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, "resolved")}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Resolve Ticket"
                          >
                            <CheckSquare size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteConfirm(t)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="Dismiss Ticket"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              className="relative bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[85vh] border border-slate-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-[#0F172A]">{selectedTicket.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      selectedTicket.role === "client" ? "bg-cyan-50 text-cyan-600" : "bg-purple-50 text-purple-600"
                    }`}>
                      {selectedTicket.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
                    Raised: {fmtDate(selectedTicket.createdAt)}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Block */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">User Contact Details</div>
                <div className="text-sm font-bold text-[#0F172A]">{selectedTicket.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{selectedTicket.email}</div>
              </div>

              {/* Status and Priority Controls */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                  <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${getPriorityStyle(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Update Status</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-[#0F172A] uppercase outline-none cursor-pointer focus:bg-white focus:border-teal-500 transition-all"
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as any)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Subject & Description */}
              <div className="space-y-4 mb-8">
                <div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject</div>
                  <h4 className="text-base font-bold text-[#0F172A] leading-snug">{selectedTicket.subject}</h4>
                </div>
                <div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Details</div>
                  <p className="text-sm text-gray-600 leading-relaxed bg-slate-50/50 p-4 border border-slate-100/50 rounded-2xl whitespace-pre-line">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 px-5 py-4 rounded-2xl font-bold text-[#0F172A] bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                >
                  Close View
                </button>
                {selectedTicket.status !== "resolved" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedTicket.id, "resolved");
                      setSelectedTicket(null);
                    }}
                    className="flex-1 px-5 py-4 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors text-sm shadow-lg shadow-emerald-500/20"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Ticket Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" 
              onClick={() => setDeleteConfirm(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 mx-auto mb-6">
                <ShieldAlert size={30} />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Dismiss Ticket</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to dismiss and delete ticket <strong className="text-[#0F172A]">{deleteConfirm.id}</strong>? This action will permanently remove it from the support queue.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-5 py-3.5 rounded-2xl font-bold text-[#0F172A] bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTicket(deleteConfirm.id)}
                  className="flex-1 px-5 py-3.5 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors text-sm shadow-lg shadow-rose-500/20"
                >
                  Dismiss Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
