"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, Calendar, LogOut, Menu, LifeBuoy } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/workers", label: "Workers", icon: Briefcase },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/tickets", label: "Tickets", icon: LifeBuoy },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== "/admin";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] flex">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden shadow-2xl backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="px-8 py-8">
          <Link href="/admin" className="text-2xl font-bold text-[#0F172A] tracking-tighter flex items-center gap-0.5">
            Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
          </Link>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Admin Portal</p>
        </div>

        {/* User Info */}
        <div className="px-6 py-6 mx-4 rounded-3xl bg-gray-50/50 border border-gray-100/50 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0A1128] flex items-center justify-center text-white font-black text-lg">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div>
              <div className="text-[#0F172A] font-black text-sm tracking-tight">{user?.name ?? "Admin"}</div>
              <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Super Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all group ${active
                    ? "bg-[#0F172A] text-white shadow-lg shadow-gray-200"
                    : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
                  }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${active ? "text-teal-400" : "group-hover:text-teal-500"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-gray-50 space-y-1.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-rose-500/60 hover:text-rose-600 hover:bg-rose-50 transition-all group"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#F8FAFC] lg:ml-72">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="text-sm font-bold text-[#0F172A] tracking-wide">
              {NAV.find((n) => isActive(n.href, n.exact))?.label ?? "Dashboard"}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-green-700 tracking-wider">Live</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
