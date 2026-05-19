"use client";

import { useEffect, useState } from "react";
import { adminApi, AdminStats } from "@/services/api";
import { Users, Briefcase, Calendar, DollarSign, Activity, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  accepted: "bg-indigo-500",
  in_progress: "bg-blue-500",
  awaiting_approval: "bg-purple-500",
  completed: "bg-green-500",
  disputed: "bg-rose-500",
  cancelled: "bg-slate-500",
};

function StatCard({ label, value, sub, colorClass, icon: Icon, isPrimary }: { label: string; value: string | number; sub?: string; colorClass: string; icon: any; isPrimary?: boolean }) {
  return (
    <div className={`rounded-3xl p-6 relative overflow-hidden transition-all group ${isPrimary ? 'bg-[#0A1128] text-white shadow-xl' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'}`}>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isPrimary ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
          <div className="text-3xl font-black tracking-tight">{value}</div>
          {sub && <div className={`text-xs mt-2 font-bold ${isPrimary ? 'text-teal-400' : 'text-teal-600'}`}>{sub}</div>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPrimary ? 'bg-white/10 text-white' : `${colorClass} bg-opacity-10`}`}>
          <Icon size={24} className={isPrimary ? '' : colorClass.replace('bg-', 'text-')} />
        </div>
      </div>
      {isPrimary && <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Dashboard</p>
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-rose-500">
      <AlertTriangle size={48} className="mb-4" />
      <p className="font-bold">{error}</p>
    </div>
  );

  const o = stats!.overview;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Real-time snapshot of the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={o.totalUsers.toLocaleString()} sub={`+${o.newUsersThisMonth} this month`} colorClass="bg-indigo-500" icon={Users} isPrimary />
        <StatCard label="Workers" value={o.totalWorkers.toLocaleString()} colorClass="bg-purple-500" icon={Briefcase} />
        <StatCard label="Bookings" value={o.totalBookings.toLocaleString()} colorClass="bg-blue-500" icon={Calendar} />
        <StatCard label="Revenue" value={`₹${o.totalRevenue.toLocaleString()}`} colorClass="bg-green-500" icon={DollarSign} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Clients" value={o.clientCount} colorClass="bg-cyan-500" icon={Users} />
        <StatCard label="Pending" value={o.pendingBookings} colorClass="bg-amber-500" icon={Activity} />
        <StatCard label="Completed" value={o.completedBookings} colorClass="bg-green-500" icon={CheckCircle2} />
        <StatCard label="Disputed" value={o.disputedBookings} colorClass="bg-rose-500" icon={AlertTriangle} />
        <StatCard label="Cancelled" value={o.cancelledBookings} colorClass="bg-slate-500" icon={XCircle} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F172A] mb-6">Bookings by Status</h3>
          <div className="space-y-5">
            {stats!.bookingsByStatus.map((s) => {
              const pct = o.totalBookings > 0 ? Math.round((s.count / o.totalBookings) * 100) : 0;
              const bgColorClass = STATUS_COLORS[s._id] ?? "bg-slate-500";
              return (
                <div key={s._id} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${bgColorClass}`} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{s._id.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${bgColorClass} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-bold text-[#0F172A]">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F172A] mb-6">Recent Sign-ups</h3>
          <div className="space-y-4">
            {stats!.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-black">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#0F172A] truncate">{u.name}</div>
                  <div className="text-xs text-gray-500 truncate">{u.email}</div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  u.role === 'client' ? 'bg-cyan-50 text-cyan-600' : 'bg-purple-50 text-purple-600'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
