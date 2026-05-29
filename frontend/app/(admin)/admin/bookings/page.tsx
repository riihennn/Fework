"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { adminApi, AdminBooking } from "@/services/api";
import { Calendar, MapPin, Clock, Edit3, X, Zap } from "lucide-react";

const STATUSES = ["all", "pending", "accepted", "in_progress", "awaiting_approval", "completed", "disputed", "cancelled"];

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  accepted: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  awaiting_approval: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  disputed: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  cancelled: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
};

function AdminBookingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, _setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminBooking | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const setPage = useCallback((newPage: number) => {
    _setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) params.delete("page");
    else params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const p = Number(searchParams.get("page")) || 1;
    if (p !== page) _setPage(p);
  }, [searchParams, page]);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "15" };
    if (status !== "all") params.status = status;
    adminApi.getBookings(params)
      .then((d) => { setBookings(d.bookings); setTotal(d.pagination.total); setPages(d.pagination.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing || !newStatus) return;
    setSaving(true);
    try {
      await adminApi.updateBookingStatus(editing._id, newStatus);
      setBookings((prev) => prev.map((b) => b._id === editing._id ? { ...b, status: newStatus } : b));
      setEditing(null);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });

  const workerName = (b: AdminBooking) => {
    if (b.worker && typeof b.worker === "object" && b.worker.user) return b.worker.user.name;
    return "Not assigned";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Bookings</h1>
          <p className="text-gray-500 mt-1">Manage and track {total.toLocaleString()} jobs.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {STATUSES.map((s) => {
          const isActive = status === s;
          const style = s !== "all" ? STATUS_STYLE[s] : { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
          return (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${isActive
                  ? `${style.bg} ${style.text} border-transparent shadow-sm ring-1 ring-inset ring-${style.dot.replace('bg-', '')}/20`
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
            >
              {s !== "all" && <span className={`w-2 h-2 rounded-full ${style.dot}`} />}
              {s.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
              <Calendar size={48} className="mb-4 text-gray-300" />
              <p className="font-bold text-[#0F172A]">No bookings found</p>
              <p className="text-sm">No jobs match the current filter.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Job Details</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Client & Worker</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => {
                  const st = STATUS_STYLE[b.status] ?? STATUS_STYLE.cancelled;
                  return (
                    <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#0F172A]">{b.service}</span>
                            {b.isUrgent && (
                              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100">
                                <Zap size={10} className="fill-rose-500" /> Urgent
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={12} /> {b.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">C</div>
                            <span className="text-xs font-semibold text-[#0F172A]">{b.client?.name ?? "—"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">W</div>
                            <span className="text-xs font-semibold text-gray-600">{workerName(b)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-[#0F172A]">{fmt(b.scheduledAt)}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock size={12} /> {fmtTime(b.scheduledAt)}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-[#0F172A]">₹{b.estimatedPay.toLocaleString()}</div>
                        {b.actualPay != null && (
                          <div className="text-xs font-bold text-green-600 mt-1">Paid ₹{b.actualPay.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${st.bg} ${st.text} border border-transparent ring-1 ring-inset ring-${st.dot.replace('bg-', '')}/20`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {b.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => { setEditing(b); setNewStatus(b.status); }}
                          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-[#0A1128] hover:bg-gray-100 rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between bg-gray-50/30">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#0F172A] bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-gray-500">Page {page} of {pages}</span>
            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#0F172A] bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A]">Update Status</h3>
                <p className="text-gray-500 mt-1">{editing.service}</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Info</div>
              <div className="text-sm font-semibold text-[#0F172A]">Client: {editing.client?.name}</div>
              <div className="text-sm text-gray-500">Scheduled: {fmt(editing.scheduledAt)} at {fmtTime(editing.scheduledAt)}</div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select New Status</label>
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full appearance-none bg-white border-2 border-gray-100 rounded-2xl px-4 py-4 text-[#0F172A] font-bold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all cursor-pointer"
                >
                  {STATUSES.filter((s) => s !== "all").map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || newStatus === editing.status}
              className="w-full px-5 py-4 rounded-2xl font-bold text-white bg-[#0A1128] hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-lg"
            >
              {saving ? "Saving..." : "Confirm Update"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <AdminBookingsContent />
    </Suspense>
  );
}
