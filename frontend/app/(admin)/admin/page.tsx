"use client";

import { useEffect, useState } from "react";
import { adminApi, AdminStats } from "@/services/api";
import {
  Users,
  HardHat,
  ClipboardList,
  Wallet,
  Hourglass,
  AlertOctagon,
  Ban,
  CheckCircle,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  accepted: "bg-indigo-500",
  in_progress: "bg-blue-500",
  awaiting_approval: "bg-purple-500",
  completed: "bg-green-500",
  disputed: "bg-rose-500",
  cancelled: "bg-slate-500",
};

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as any;

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
} as any;

function StatCard({ label, value, sub, colorClass, icon: Icon, isPrimary }: { label: string; value: string | number; sub?: string; colorClass: string; icon: any; isPrimary?: boolean }) {
  return (
    <motion.div variants={itemVars} whileHover={{ y: -4 }} className={`rounded-[28px] p-6 relative overflow-hidden transition-all duration-300 group ${isPrimary ? 'bg-[#0A1128] text-white shadow-xl shadow-[#0A1128]/10' : 'bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200'}`}>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPrimary ? 'text-gray-400' : 'text-gray-400'}`}>{label}</div>
          <div className={`text-3xl font-black tracking-tight ${isPrimary ? 'text-white' : 'text-[#0F172A]'}`}>{value}</div>
          {sub && (
            <div className={`flex items-center gap-1 text-[11px] mt-2 font-bold ${isPrimary ? 'text-teal-400' : 'text-emerald-500'}`}>
              <TrendingUp size={14} /> {sub}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPrimary ? 'bg-white/10 text-white backdrop-blur-sm' : `${colorClass} bg-opacity-10`} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className={isPrimary ? '' : colorClass.replace('bg-', 'text-')} />
        </div>
      </div>
      {isPrimary && <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />}
    </motion.div>
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
      <AlertOctagon size={48} className="mb-4" />
      <p className="font-bold">{error}</p>
    </div>
  );

  const o = stats!.overview;

  // Calculate total revenue from trend data for the header
  const weekRevenue = stats!.trendData?.reduce((sum, item) => sum + item.revenue, 0) || 0;

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={o.totalUsers.toLocaleString()} sub={`${o.newUsersThisMonth} this month`} colorClass="bg-indigo-500" icon={Users} isPrimary />
        <StatCard label="Workers" value={o.totalWorkers.toLocaleString()} colorClass="bg-purple-500" icon={HardHat} />
        <StatCard label="Bookings" value={o.totalBookings.toLocaleString()} colorClass="bg-blue-500" icon={ClipboardList} />
        <StatCard label="Revenue" value={`₹${o.totalRevenue.toLocaleString()}`} colorClass="bg-emerald-500" icon={Wallet} />
      </div>

      {/* Main Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <motion.div variants={itemVars} className="lg:col-span-2 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Revenue Overview</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Last 7 Days</p>
            </div>
            <div className="text-2xl font-black text-emerald-500">
              ₹{weekRevenue.toLocaleString()}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats!.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 700 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#0F172A' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bookings Bar Chart */}
        <motion.div variants={itemVars} className="bg-[#0A1128] border border-gray-800 rounded-[32px] p-8 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white">Daily Jobs</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Completed</p>
              </div>
            </div>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats!.trendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: 'white', fontWeight: 'bold' }}
                    itemStyle={{ color: '#a5b4fc' }}
                    formatter={(val: any) => [val, 'Bookings']}
                  />
                  <Bar dataKey="bookings" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Clients", value: o.clientCount, colorClass: "bg-cyan-500", icon: UserCheck },
          { label: "Pending", value: o.pendingBookings, colorClass: "bg-amber-500", icon: Hourglass },
          { label: "Completed", value: o.completedBookings, colorClass: "bg-emerald-500", icon: CheckCircle },
          { label: "Disputed", value: o.disputedBookings, colorClass: "bg-rose-500", icon: AlertOctagon },
          { label: "Cancelled", value: o.cancelledBookings, colorClass: "bg-slate-500", icon: Ban }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVars} whileHover={{ y: -2 }} className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-lg transition-all flex flex-col items-center justify-center text-center group">
            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${stat.colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} className={stat.colorClass.replace('bg-', 'text-')} />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{stat.value}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={itemVars} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#0F172A]">Bookings by Status</h3>
            <div className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">{o.totalBookings} Total</div>
          </div>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {stats!.bookingsByStatus.map((s) => {
              const pct = o.totalBookings > 0 ? Math.round((s.count / o.totalBookings) * 100) : 0;
              const bgColorClass = STATUS_COLORS[s._id] ?? "bg-slate-500";
              return (
                <div key={s._id} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${bgColorClass} shadow-sm`} />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#0F172A] transition-colors">{s._id.replace(/_/g, " ")}</span>
                    </div>
                    <span className="text-sm font-black text-[#0F172A]">{s.count} <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">({pct}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                      className={`h-full ${bgColorClass} rounded-full relative`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={itemVars} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#0F172A]">Recent Sign-ups</h3>
            <button className="text-[10px] font-black text-gray-400 hover:text-[#0F172A] uppercase tracking-widest transition-colors">View All</button>
          </div>
          <div className="space-y-3">
            {stats!.recentUsers.map((u, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                key={u._id}
                className="flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center text-[#0F172A] font-black text-lg group-hover:scale-105 transition-transform">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#0F172A] truncate group-hover:text-teal-600 transition-colors">{u.name}</div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{u.email}</div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${u.role === 'client' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                  {u.role}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
