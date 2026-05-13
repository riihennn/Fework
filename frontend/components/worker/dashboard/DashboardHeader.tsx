"use client";

import React from "react";
import { Menu, Bell } from "lucide-react";
import { AuthUser } from "@/services/api";

interface HeaderProps {
  user: AuthUser | null;
  activeSection: string;
  setSidebarOpen: (open: boolean) => void;
  pendingCount?: number;
}

export default function DashboardHeader({ user, activeSection, setSidebarOpen, pendingCount = 0 }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition-all active:scale-95"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight capitalize">{activeSection}</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">
            Welcome back, <span className="text-teal-600">{user?.name?.split(" ")[0] || "Worker"}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#0F172A] hover:bg-gray-100 transition-all group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          {pendingCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center px-1 border-2 border-white shadow-sm">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          ) : (
            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
          )}
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-[#0F172A] flex items-center justify-center text-teal-400 font-black text-sm shadow-lg shadow-gray-200">
            {user?.name?.[0]?.toUpperCase() ?? "W"}
          </div>
        </div>
      </div>
    </header>
  );
}
