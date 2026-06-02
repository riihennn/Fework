"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell, MessageSquare, Trash2, Clock } from "lucide-react";
import { AuthUser } from "@/services/api";
import Avatar from "@/components/shared/Avatar";
import GlobalChatDrawer from "@/components/shared/GlobalChatDrawer";
import { useNotificationStore } from "@/store/notificationStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface HeaderProps {
  user: AuthUser | null;
  activeSection: string;
  setSidebarOpen: (open: boolean) => void;
  pendingCount?: number;
}

export default function DashboardHeader({ user, activeSection, setSidebarOpen }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
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
              Welcome back, <span className="text-teal-600 capitalize">{user?.name?.split(" ")[0] || "Worker"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Chat Icon */}
          <button
            onClick={() => setChatDrawerOpen(true)}
            className="relative p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#0F172A] hover:bg-gray-100 transition-all group"
          >
            <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-white shadow-sm" />
          </button>

          {/* Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#0F172A] hover:bg-gray-100 transition-all group cursor-pointer"
            >
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center px-1 border-2 border-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
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

          {/* Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <Avatar src={(user as any)?.avatar} name={user?.name} size={40} className="rounded-2xl" />
          </div>
        </div>
      </header>

      <GlobalChatDrawer />
    </>
  );
}
