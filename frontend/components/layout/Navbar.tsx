"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, UserCircle, LogOut, Briefcase, Settings, ChevronDown, Clock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  className?: string;
  showLinks?: boolean;
}

export const Navbar = ({ className, showLinks = true }: NavbarProps) => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 ${className || ""}`}>
      <div className="flex items-center gap-12">
        <Link href="/" className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-0.5">
          Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2" />
        </Link>
        {showLinks && (
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/findservices" className="hover:text-[#0F172A] transition-colors">Find Services</Link>
            <Link href="#" className="hover:text-[#0F172A] transition-colors">Memberships</Link>
            <Link href="#" className="hover:text-[#0F172A] transition-colors">Help</Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && (
          <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 relative transition-all active:scale-95 group">
            <Bell size={20} className="group-hover:text-[#0F172A] transition-colors" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
          </button>
        )}

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 pl-2 border-l border-gray-100 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-all"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-[#0F172A]">{user?.name || user?.email?.split("@")[0]}</span>
                <span className="text-[10px] text-gray-500 capitalize leading-tight">{user?.role}</span>
              </div>
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-100 text-[#0F172A] border border-gray-200">
                <UserCircle size={22} />
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 z-[60]"
                >
                  <div className="p-3 mb-2 border-b border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-[#0F172A] truncate">{user?.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    {user?.role === "worker" ? (
                      <Link 
                        href="/worker" 
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0F172A] rounded-xl transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Briefcase size={16} className="text-teal-500" /> Worker Dashboard
                      </Link>
                    ) : (
                      <Link 
                        href="/my-bookings" 
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0F172A] rounded-xl transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Clock size={16} className="text-teal-500" /> My Bookings
                      </Link>
                    )}
                    
                    <Link 
                      href="#" 
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0F172A] rounded-xl transition-all"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} className="text-gray-400" /> Settings
                    </Link>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
