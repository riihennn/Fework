"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, UserCircle, LogOut, Briefcase, Settings, ChevronDown, Clock, MessageSquare, Trash2, AlertTriangle, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GlobalChatDrawer from "../shared/GlobalChatDrawer";
import Avatar from "../shared/Avatar";
import { useNotificationStore } from "@/store/notificationStore";

interface NavbarProps {
  className?: string;
  showLinks?: boolean;
}

export const Navbar = ({ className, showLinks = true }: NavbarProps) => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    setChatDrawerOpen,
    setActiveChatJobId
  } = useNotificationStore();
  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <nav className={`bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50 ${className || ""}`}>
      <div className="flex items-center gap-4 lg:gap-12">
        {showLinks && (
          <button 
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-[#0F172A]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        )}
        <Link href="/" className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-0.5">
          Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2" />
        </Link>
        {showLinks && (
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/findservices" className="hover:text-[#0F172A] transition-colors">Find Services</Link>
            <Link href="/membership" className="hover:text-[#0F172A] transition-colors">Memberships</Link>
            <Link href="/help" className="hover:text-[#0F172A] transition-colors">Help</Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <>
            <button
              onClick={() => setChatDrawerOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 relative transition-all active:scale-95 group"
            >
              <MessageSquare size={20} className="group-hover:text-[#0F172A] transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-white shadow-sm" />
            </button>

            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 relative transition-all active:scale-95 group"
              >
                <Bell size={20} className="group-hover:text-[#0F172A] transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 min-w-[12px] h-3 px-0.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center border border-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 z-[60] flex flex-col max-h-[400px]"
                  >
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-50 shrink-0">
                      <h4 className="font-bold text-[#0F172A] text-sm">Notifications</h4>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead()}
                            className="text-[10px] font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={() => clearNotifications()}
                            className="text-[10px] font-bold text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 size={10} /> Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
                      {notifications.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <Bell size={24} className="text-gray-300 mb-2 animate-bounce" />
                          <p className="text-xs font-bold text-[#0F172A]">All caught up!</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">No new notifications here.</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.type === "message" ? "#" : n.link}
                            onClick={(e) => {
                              if (n.type === "message") {
                                e.preventDefault();
                                markAsRead(n.id);
                                setIsNotificationsOpen(false);
                                setChatDrawerOpen(true);
                                if (n.jobId) {
                                  setActiveChatJobId(n.jobId);
                                }
                              } else {
                                markAsRead(n.id);
                                setIsNotificationsOpen(false);
                              }
                            }}
                            className={`block p-3 rounded-xl border transition-all text-left group ${
                              n.read
                                ? "bg-white border-gray-50 hover:bg-gray-50/50"
                                : "bg-teal-50/20 border-teal-50/50 hover:bg-teal-50/30"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                                n.type === "message"
                                  ? "bg-blue-50 text-blue-500"
                                  : "bg-teal-50 text-teal-500"
                              }`}>
                                {n.type === "message" ? (
                                  <MessageSquare size={13} />
                                ) : (
                                  <Clock size={13} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-[#0F172A] truncate pr-1">
                                    {n.title}
                                  </p>
                                  {!n.read && (
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 animate-ping" />
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 font-medium">
                                  {n.description}
                                </p>
                                <span className="text-[9px] text-gray-400 block mt-1 font-semibold">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 pl-2 border-l border-gray-100 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-all"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-[#0F172A] capitalize">{user?.name || user?.email?.split("@")[0]}</span>
              </div>
              <Avatar src={(user as any)?.avatar} name={user?.name} size={36} className="rounded-xl border border-gray-200" />
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
                      href="/report-issue"
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0F172A] rounded-xl transition-all"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <AlertTriangle size={16} className="text-orange-400" /> Report Issue
                    </Link>

                    <Link
                      href="/settings"
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

    {/* Mobile Nav Drawer */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl flex flex-col lg:hidden"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-0.5">
                Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2" />
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              <Link href="/findservices" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all">Find Services</Link>
              <Link href="/membership" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all">Memberships</Link>
              <Link href="/help" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all">Help</Link>
              
              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full h-11 flex items-center justify-center text-sm font-bold text-[#0F172A] hover:bg-gray-50 rounded-xl transition-all border border-gray-200">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full h-11 flex items-center justify-center text-sm font-bold bg-[#0F172A] text-white hover:bg-gray-900 rounded-xl transition-all shadow-lg shadow-gray-200">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    
    {isAuthenticated && (
      <GlobalChatDrawer />
    )}
    </>
  );
};

export default Navbar;
