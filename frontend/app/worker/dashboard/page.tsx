"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  Star,
  Settings,
  Bell,
  LogOut,
  HelpCircle,
  MapPin,
  Clock,
  Check,
  X,
  Shield,
  TrendingUp,
  Menu,
  ChevronDown,
  Zap,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { workerApi } from "@/services/api";

const navLinks = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" },
  { label: "My Jobs", icon: Briefcase, id: "jobs" },
  { label: "Earnings", icon: DollarSign, id: "earnings" },
  { label: "Reviews", icon: Star, id: "reviews" },
  { label: "Settings", icon: Settings, id: "settings" },
];

const mockJobs = [
  { id: 1, client: "Arun Kumar", service: "AC Repair", location: "Kochi", date: "Today, 2:00 PM", status: "pending", amount: 600 },
  { id: 2, client: "Priya Thomas", service: "Plumbing", location: "Kozhikode", date: "Yesterday", status: "completed", amount: 850 },
  { id: 3, client: "Rahul Menon", service: "Electrical Work", location: "Kochi", date: "2 days ago", status: "completed", amount: 1200 },
  { id: 4, client: "Anitha Raj", service: "Painting", location: "Kochi", date: "3 days ago", status: "cancelled", amount: 0 },
];

export default function WorkerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleToggleAvailability = async () => {
    setTogglingAvailability(true);
    try {
      const res = await workerApi.toggleAvailability();
      setIsAvailable(res.isAvailable);
    } catch {
      // ignore
    } finally {
      setTogglingAvailability(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "completed") return "text-teal-600 bg-teal-50";
    if (status === "pending") return "text-amber-600 bg-amber-50";
    if (status === "cancelled") return "text-rose-500 bg-rose-50";
    return "text-gray-500 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="px-8 py-8 border-b border-white/5">
          <div className="text-2xl font-black text-white tracking-tight flex items-center gap-0.5">
            Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
          </div>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Worker Portal</p>
        </div>

        {/* User Info */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/20 flex items-center justify-center text-teal-400 font-black text-lg">
              {user?.name?.[0]?.toUpperCase() ?? "W"}
            </div>
            <div>
              <div className="text-white font-bold text-sm">{user?.name || "Worker"}</div>
              <div className="text-white/30 text-[10px] font-bold capitalize">{user?.role || "worker"}</div>
            </div>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            disabled={togglingAvailability}
            className={`mt-4 w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${
              isAvailable
                ? "bg-teal-600/10 border-teal-500/30 text-teal-400"
                : "bg-white/5 border-white/10 text-white/30"
            }`}
          >
            <span>{isAvailable ? "Online" : "Offline"}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isAvailable ? "bg-teal-500" : "bg-white/20"}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isAvailable ? "left-4" : "left-0.5"}`} />
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { setActiveSection(link.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeSection === link.id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-4 py-6 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
            <HelpCircle size={18} /> Help Center
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-[#0F172A] capitalize">{activeSection}</h1>
              <p className="text-xs text-gray-400 font-medium">Welcome back, {user?.name?.split(" ")[0] || "Worker"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#0F172A] transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-black text-sm">
                {user?.name?.[0]?.toUpperCase() ?? "W"}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">

          {activeSection === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Earnings", value: "₹12,450", change: "+18%", icon: DollarSign, color: "text-teal-600 bg-teal-50" },
                  { label: "Jobs Completed", value: "34", change: "+5", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
                  { label: "Avg. Rating", value: "4.8", change: "+0.1", icon: Star, color: "text-amber-600 bg-amber-50" },
                  { label: "Response Rate", value: "96%", change: "+2%", icon: Zap, color: "text-rose-600 bg-rose-50" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div className="text-2xl font-black mb-1">{stat.value}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    <div className="text-xs text-teal-600 font-bold mt-2">{stat.change} this month</div>
                  </div>
                ))}
              </div>

              {/* Recent Jobs */}
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black">Recent Jobs</h2>
                  <button
                    onClick={() => setActiveSection("jobs")}
                    className="text-xs font-black text-teal-600 uppercase tracking-widest hover:underline"
                  >
                    See All
                  </button>
                </div>
                <div className="space-y-4">
                  {mockJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-black">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F172A] text-sm">{job.client}</div>
                          <div className="text-xs text-gray-400 font-medium">{job.service} · <MapPin size={10} className="inline" /> {job.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pl-16 md:pl-0">
                        <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
                          <Clock size={12} /> {job.date}
                        </div>
                        {job.amount > 0 && (
                          <div className="text-sm font-black text-[#0F172A]">₹{job.amount}</div>
                        )}
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Shield, title: "Profile Verified", desc: "Your identity has been confirmed.", done: true },
                  { icon: Star, title: "Top Rated", desc: "You're among the top 20% of workers.", done: true },
                  { icon: TrendingUp, title: "Profile Completion", desc: "Add more details to get more jobs.", done: false },
                ].map((badge, i) => (
                  <div key={i} className={`p-5 rounded-2xl border flex items-center gap-4 ${badge.done ? "bg-teal-50/50 border-teal-100" : "bg-amber-50/50 border-amber-100"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${badge.done ? "bg-teal-100 text-teal-600" : "bg-amber-100 text-amber-600"}`}>
                      <badge.icon size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
                        {badge.title}
                        {badge.done ? <Check size={12} className="text-teal-600" /> : <X size={12} className="text-amber-600" />}
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === "jobs" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <h2 className="text-xl font-black mb-8">All Jobs</h2>
                <div className="space-y-4">
                  {mockJobs.map((job) => (
                    <div key={job.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-black">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F172A] text-sm">{job.client}</div>
                          <div className="text-xs text-gray-400 font-medium">{job.service} · <MapPin size={10} className="inline" /> {job.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pl-16 md:pl-0">
                        <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
                          <Clock size={12} /> {job.date}
                        </div>
                        {job.amount > 0 && (
                          <div className="text-sm font-black text-[#0F172A]">₹{job.amount}</div>
                        )}
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "earnings" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { label: "This Month", value: "₹4,200", icon: TrendingUp },
                  { label: "Total Earned", value: "₹12,450", icon: DollarSign },
                  { label: "Pending Payout", value: "₹600", icon: Clock },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <div className="text-3xl font-black">{stat.value}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <h2 className="text-xl font-black mb-8">Earnings History</h2>
                <div className="space-y-4">
                  {mockJobs.filter(j => j.status === "completed").map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50">
                      <div>
                        <div className="font-bold text-sm">{job.service} — {job.client}</div>
                        <div className="text-xs text-gray-400 font-medium">{job.date}</div>
                      </div>
                      <div className="text-teal-600 font-black">+₹{job.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "reviews" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-6 mb-10 p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <div className="text-5xl font-black text-amber-500">4.8</div>
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={18} className={s <= 4 ? "text-amber-400 fill-current" : "text-amber-200 fill-current"} />
                      ))}
                    </div>
                    <div className="text-xs font-bold text-gray-500">Based on 34 reviews</div>
                  </div>
                </div>
                <div className="space-y-6">
                  {["Priya Thomas", "Rahul Menon"].map((name, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500">{name[0]}</div>
                        <div>
                          <div className="font-bold text-sm">{name}</div>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12} className="text-amber-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        "Excellent service! Very professional, arrived on time and completed the work efficiently. Highly recommend!"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "settings" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm max-w-2xl space-y-8">
                <h2 className="text-xl font-black">Account Settings</h2>

                <div className="space-y-4">
                  {[
                    { label: "Full Name", value: user?.name || "", type: "text" },
                    { label: "Email Address", value: user?.email || "", type: "email" },
                  ].map((field) => (
                    <div key={field.label} className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <button className="px-8 py-3 bg-[#0F172A] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">
                  Save Changes
                </button>

                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-rose-500 font-bold text-sm hover:underline"
                  >
                    <LogOut size={16} /> Sign out of account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
