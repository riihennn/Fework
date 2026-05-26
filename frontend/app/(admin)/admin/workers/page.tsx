"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, AdminWorker } from "@/services/api";
import { Search, MapPin, Briefcase, Star, Award, X } from "lucide-react";
import Link from "next/link";

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<AdminWorker[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "12" };
    if (query) params.search = query;
    adminApi.getWorkers(params)
      .then((d) => { setWorkers(d.workers); setTotal(d.pagination.total); setPages(d.pagination.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  const handleToggleElite = async (id: string) => {
    setTogglingId(id);
    try {
      const { isElite } = await adminApi.toggleElite(id);
      setWorkers((prev) => prev.map((w) => w._id === id ? { ...w, isElite } : w));
    } catch (e: any) { alert(e.message); }
    finally { setTogglingId(null); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Worker Directory</h1>
          <p className="text-gray-500 mt-1">Manage {total.toLocaleString()} registered professionals.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 w-full md:w-[400px] shadow-sm focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          className="bg-transparent border-none outline-none flex-1 text-sm text-[#0F172A] placeholder:text-gray-400"
          placeholder="Search by name, email, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setQuery(search); setPage(1); } }}
        />
        {search && (
          <button onClick={() => { setSearch(""); setQuery(""); setPage(1); }} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Worker Grid */}
      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        </div>
      ) : workers.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500 bg-white border border-gray-100 rounded-[32px]">
          <Briefcase size={48} className="mb-4 text-gray-300" />
          <p className="font-bold text-[#0F172A]">No workers found</p>
          <p className="text-sm">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workers.map((w) => (
            <Link href={`/admin/workers/${w._id}`} key={w._id} className="relative bg-white border border-gray-100 rounded-[32px] p-6 flex flex-col shadow-sm hover:shadow-xl hover:border-gray-200 transition-all group overflow-hidden">
              {/* Elite Ribbon */}
              {w.isElite && (
                <div className="absolute top-4 right-4 bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Award size={14} className="fill-amber-500 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Elite</span>
                </div>
              )}

              {/* Profile Head */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl border border-teal-100 shadow-inner">
                  {w.userInfo.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 pr-12">
                  <h3 className="text-[15px] font-bold text-[#0F172A] truncate">{w.userInfo.name}</h3>
                  <p className="text-xs text-gray-500 truncate mb-1">{w.userInfo.email}</p>
                  <span className="inline-block bg-gray-100 text-[#0F172A] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                    {w.category || "General"}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-2xl p-3 mb-6 border border-gray-100/50">
                <div className="text-center">
                  <div className="text-sm font-black text-[#0F172A]">{w.totalJobs}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Jobs</div>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <div className="text-sm font-black text-[#0F172A] flex justify-center items-center gap-0.5">
                    {w.rating.toFixed(1)} <Star size={12} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black text-[#0F172A]">₹{w.hourlyRate}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">/Hour</div>
                </div>
              </div>

              {/* Badges & Meta */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${w.isAvailable ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${w.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  {w.isAvailable ? 'Online' : 'Offline'}
                </div>
                {w.city && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <MapPin size={12} /> {w.city}
                  </div>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Since {fmt(w.createdAt)}
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); handleToggleElite(w._id); }}
                  disabled={togglingId === w._id}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${w.isElite
                      ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                      : "bg-[#0A1128] text-white hover:bg-gray-800 shadow-md"
                    }`}
                >
                  {togglingId === w._id ? "..." : w.isElite ? "Revoke Elite" : "Make Elite"}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#0F172A] bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-gray-500">Page {page} of {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#0F172A] bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
