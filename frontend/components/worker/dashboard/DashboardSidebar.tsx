"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  DollarSign, 
  Star, 
  Settings, 
  HelpCircle, 
  AlertTriangle,
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { AuthUser } from "@/services/api";
import Avatar from "@/components/shared/Avatar";

interface NavLink {
  label: string;
  icon: any;
  id: string;
  href: string;
}

interface SidebarProps {
  user: AuthUser | null;
  activeSection: string;
  isAvailable: boolean;
  togglingAvailability: boolean;
  handleToggleAvailability: () => void;
  handleLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navLinks: NavLink[] = [
  { label: "Overview", icon: LayoutDashboard, id: "worker", href: "/worker" },
  { label: "My Jobs", icon: Briefcase, id: "jobs", href: "/worker/jobs" },
  { label: "Earnings", icon: DollarSign, id: "earnings", href: "/worker/earnings" },
  { label: "Reviews", icon: Star, id: "reviews", href: "/worker/reviews" },
  { label: "Settings", icon: Settings, id: "settings", href: "/worker/settings" },
];

export default function DashboardSidebar({
  user,
  activeSection,
  isAvailable,
  togglingAvailability,
  handleToggleAvailability,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-8 py-8">
          <Link href="/" className="text-2xl font-bold text-[#0F172A] tracking-tighter flex items-center gap-0.5">
            Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
          </Link>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Worker Portal</p>
        </div>

        {/* User Info */}
        <div className="px-6 py-6 mx-4 rounded-3xl bg-gray-50/50 border border-gray-100/50">
          <div className="flex items-center gap-4">
            <Avatar src={(user as any)?.avatar} name={user?.name} size={48} className="rounded-2xl" />
            <div>
              <div className="text-[#0F172A] font-black text-sm tracking-tight">{user?.name || "Worker"}</div>
              <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{user?.role || "worker"}</div>
            </div>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={togglingAvailability}
            className={`mt-6 w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest group ${
              isAvailable
                ? "bg-teal-50 border-teal-100 text-teal-600 shadow-sm shadow-teal-500/5"
                : "bg-white border-gray-200 text-gray-400 shadow-sm"
            }`}
          >
            <span>{isAvailable ? "Online" : "Offline"}</span>
            <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isAvailable ? "bg-teal-500" : "bg-gray-200"}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all duration-300 ${isAvailable ? "left-6" : "left-1"}`} />
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all group ${
                activeSection === link.id
                  ? "bg-[#0F172A] text-white shadow-lg shadow-gray-200"
                  : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
              }`}
            >
              <link.icon size={18} className={`transition-colors ${activeSection === link.id ? "text-teal-400" : "group-hover:text-teal-500"}`} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-4 py-6 border-t border-gray-50 space-y-1.5">
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0F172A] hover:bg-gray-50 transition-all group">
            <HelpCircle size={18} className="group-hover:text-teal-500" /> Help Center
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden shadow-2xl backdrop-blur-[2px]" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}
