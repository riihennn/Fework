"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, AdminUser } from "@/services/api";
import { Search, Trash2, ShieldAlert, X, Users } from "lucide-react";

const ROLES = ["all", "client", "worker"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<AdminUser | null>(null);
  const [togglingBlockId, setTogglingBlockId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "10" };
    if (role !== "all") params.role = role;
    if (query) params.search = query;
    adminApi.getUsers(params)
      .then((d) => { setUsers(d.users); setTotal(d.pagination.total); setPages(d.pagination.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, role, query]);

  useEffect(() => { load(); }, [load]);

  const handleToggleBlock = async (id: string) => {
    setTogglingBlockId(id);
    try {
      const { isBlocked } = await adminApi.toggleBlockUser(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlocked } : u))
      );
    } catch (e: any) {
      alert(e.message || "Failed to update block status");
    } finally {
      setTogglingBlockId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(confirm._id);
    try {
      await adminApi.deleteUser(confirm._id);
      setUsers((prev) => prev.filter((u) => u._id !== confirm._id));
      setTotal((t) => t - 1);
    } catch (e: any) { alert(e.message); }
    finally { setDeleting(null); setConfirm(null); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Platform Users</h1>
          <p className="text-gray-500 mt-1">Manage all {total.toLocaleString()} clients and workers.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 w-full md:w-96 shadow-sm focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            className="bg-transparent border-none outline-none flex-1 text-sm text-[#0F172A] placeholder:text-gray-400"
            placeholder="Search name or email..."
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

        <div className="flex items-center p-1.5 bg-gray-100 rounded-2xl border border-gray-200/60">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                role === r
                  ? "bg-white text-[#0F172A] shadow-sm"
                  : "text-gray-500 hover:text-[#0F172A] hover:bg-gray-200/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            </div>
          ) : users.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500">
              <Users size={48} className="mb-4 text-gray-300" />
              <p className="font-bold text-[#0F172A]">No users found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">User</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Role</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Joined</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-gray-100 flex items-center justify-center text-[#0F172A] font-black text-lg">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#0F172A]">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'client' ? 'bg-cyan-50 text-cyan-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.isVerified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isVerified ? 'bg-green-500' : 'bg-amber-500'}`} />
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        {u.isBlocked && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                      {fmt(u.createdAt)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleBlock(u._id)}
                          disabled={togglingBlockId === u._id}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            u.isBlocked
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                          }`}
                        >
                          {togglingBlockId === u._id ? "..." : u.isBlocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          onClick={() => setConfirm(u)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <span className="text-sm font-bold text-gray-500">
              Page {page} of {pages}
            </span>
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

      {/* Delete Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="relative bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Delete User</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0F172A]">{confirm.name}</strong>? This action cannot be undone and will erase all their data.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 px-5 py-4 rounded-2xl font-bold text-[#0F172A] bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deleting}
                className="flex-1 px-5 py-4 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-colors shadow-lg shadow-rose-500/20"
              >
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
