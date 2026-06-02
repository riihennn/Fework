"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2, User, X, MoreVertical, CheckCheck } from "lucide-react";
import { bookingApi, messageApi, BookingJob } from "@/services/api";
import ChatBox from "./ChatBox";
import Avatar from "./Avatar";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import Link from "next/link";

interface GlobalChatDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function GlobalChatDrawer({ isOpen: propIsOpen, onClose: propOnClose }: GlobalChatDrawerProps = {}) {
  const { user } = useAuthStore();
  const { isChatDrawerOpen, setChatDrawerOpen, activeChatJobId, setActiveChatJobId } = useNotificationStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isChatDrawerOpen;

  const onClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setChatDrawerOpen(false);
    }
    setActiveChatJob(null);
    setActiveChatJobId(null);
  };

  const [jobs, setJobs] = useState<BookingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChatJob, setActiveChatJob] = useState<{ id: string; title: string; status: string } | null>(null);
  const [lastMessages, setLastMessages] = useState<Record<string, any>>({});
  const [showMenu, setShowMenu] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let res;
      if (user.role === "worker") {
        res = await bookingApi.getWorkerJobs({ limit: "50" });
      } else {
        res = await bookingApi.getClientJobs({ limit: "50" });
      }

      const activeJobs = res.jobs.filter((j: BookingJob) =>
        ["accepted", "in_progress", "awaiting_approval", "completed", "disputed"].includes(j.status)
      );

      const uniqueJobs: BookingJob[] = [];
      const seenUsers = new Set();

      for (const job of activeJobs) {
        const otherPartyId = user.role === "worker"
          ? (job.client && typeof job.client === 'object' ? (job.client as any)._id : job.client)
          : (job.worker && typeof job.worker === 'object' ? (job.worker as any).user?._id || (job.worker as any)._id : job.worker);

        if (otherPartyId && !seenUsers.has(otherPartyId)) {
          seenUsers.add(otherPartyId);
          uniqueJobs.push(job);
        }
      }

      setJobs(uniqueJobs);
    } catch (e: any) {
      console.error("Failed to load jobs for chat", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen, fetchJobs]);

  useEffect(() => {
    const fetchLastMessages = async () => {
      const msgsMap: Record<string, any> = {};
      await Promise.all(
        jobs.map(async (job) => {
          try {
            const chatMsgs = (await messageApi.getMessages(job._id)) as any;
            if (chatMsgs && chatMsgs.length > 0) {
              msgsMap[job._id] = chatMsgs[chatMsgs.length - 1];
            }
          } catch (e) { }
        })
      );
      setLastMessages(msgsMap);
    };

    if (jobs.length > 0) {
      fetchLastMessages();
    }
  }, [jobs]);

  useEffect(() => {
    if (activeChatJobId && jobs.length > 0) {
      const job = jobs.find((j) => j._id === activeChatJobId);
      if (job) {
        const workerInfo = typeof job.worker === "object" ? (job.worker as any).user : null;
        const otherParty = user?.role === "worker" ? job.client : workerInfo;
        const name = typeof otherParty === "object" ? (otherParty as any)?.name : "User";
        setActiveChatJob({ id: job._id, title: `${name || "User"} — ${job.service}`, status: job.status });
      }
    }
  }, [activeChatJobId, jobs, user]);

  const handleClearAllChats = async () => {
    try {
      await messageApi.clearAllChats();
      setLastMessages({});
      setShowMenu(false);
    } catch (e) {
      console.error("Failed to clear all chats", e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9990] bg-black/50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[9991] flex flex-col border-l border-gray-100"
          >
            <div className="h-[64px] px-5 flex items-center justify-between bg-white border-b border-gray-100 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500">
                  <MessageSquare size={16} />
                </div>
                <h3 className="font-semibold text-[#0F172A] tracking-tight text-[15px]">Chats</h3>
              </div>
              <div className="flex items-center gap-1 relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-all"
                >
                  <MoreVertical size={20} className="text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute top-12 right-10 bg-white border border-gray-100 shadow-lg rounded-xl py-2 w-48 z-[9992]">
                    <button
                      onClick={handleClearAllChats}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors"
                    >
                      Delete all chats
                    </button>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-all"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-teal-500 mb-4" />
                  <p className="text-sm font-bold text-gray-400">Loading chats...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] mb-1">No active chats</p>
                  <p className="text-xs text-gray-400">
                    {user?.role === "worker"
                      ? "When you accept a job, you can chat here."
                      : "Book a service to start chatting!"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {jobs.map((job) => {
                    const workerInfo = typeof job.worker === "object" ? (job.worker as any).user : null;
                    const otherParty = user?.role === "worker" ? job.client : workerInfo;
                    const name = typeof otherParty === "object" ? (otherParty as any)?.name : "User";
                    const avatar = typeof otherParty === "object" ? (otherParty as any)?.avatar : null;
                    const lastMsg = lastMessages[job._id];
                    const isMine = lastMsg?.senderId === user?._id;

                    return (
                      <button
                        key={job._id}
                        onClick={() => setActiveChatJob({ id: job._id, title: `${name || "User"} — ${job.service}`, status: job.status })}
                        className="w-full bg-white border-b border-gray-100 p-4 flex items-center gap-4 hover:bg-gray-50 transition-all text-left"
                      >
                        <Avatar
                          src={avatar}
                          name={name}
                          size={48}
                          className="rounded-full shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-[14px] font-bold text-[#0F172A] truncate flex items-center gap-2">
                              <span className="capitalize">{name || "User"}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-teal-600 px-1.5 py-0.5 bg-teal-50 border border-teal-100 rounded">
                                {job.service}
                              </span>
                            </h4>
                            <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                              {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date(job.updatedAt).toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {isMine && <CheckCheck size={15} className="text-gray-400 shrink-0" />}
                            <p className="text-[13px] text-gray-500 truncate">
                              {lastMsg ? lastMsg.message : job.service}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          <ChatBox
            isOpen={!!activeChatJob}
            onClose={() => setActiveChatJob(null)}
            jobId={activeChatJob?.id || ""}
            jobTitle={activeChatJob?.title || ""}
            currentUserId={user?._id || ""}
            currentUserModel={user?.role === "worker" ? "Worker" : "User"}
            readOnly={["completed", "disputed", "cancelled"].includes(activeChatJob?.status || "")}
          />
        </>
      )}
    </AnimatePresence>
  );
}
