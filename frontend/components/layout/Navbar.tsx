"use client";

import React from "react";
import Link from "next/link";
import { Bell, UserCircle, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface NavbarProps {
  className?: string;
  showLinks?: boolean;
}

export const Navbar = ({ className, showLinks = true }: NavbarProps) => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className={`bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 ${className || ""}`}>
      <div className="flex items-center gap-12">
        <Link href="/" className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-0.5">
          Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2" />
        </Link>
        {showLinks && (
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/findservices" className="hover:text-[#0F172A] transition-colors">Find Services</Link>
            <Link href="/workers" className="hover:text-[#0F172A] transition-colors">Professionals</Link>
            <Link href="#" className="hover:text-[#0F172A] transition-colors">Memberships</Link>
            <Link href="#" className="hover:text-[#0F172A] transition-colors">Help</Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 relative transition-all active:scale-95 group">
          <Bell size={20} className="group-hover:text-[#0F172A] transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-[#0F172A]">{user?.name || user?.email?.split("@")[0]}</span>
              <span className="text-[10px] text-gray-500 capitalize leading-tight">{user?.role}</span>
            </div>
            <Link href={user?.role === "worker" ? "/dashboard" : "/"}>
              <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#0F172A] transition-all active:scale-95 border border-gray-100">
                <UserCircle size={24} />
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-all active:scale-95"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
            <Link href="/login" className="hidden md:flex h-10 px-4 text-sm items-center justify-center font-bold text-[#0F172A] hover:bg-gray-50 rounded-lg transition-all">
              Log in
            </Link>
            <Link href="/signup" className="h-10 px-6 text-sm rounded-xl inline-flex items-center justify-center font-bold transition-all bg-[#0F172A] text-white hover:bg-gray-900 shadow-lg shadow-gray-200">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
