"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MessageSquare, Loader2, User, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { bookingApi, BookingJob } from "@/services/api";
import ChatBox from "@/components/shared/ChatBox";
import Avatar from "@/components/shared/Avatar";
import { useAuthStore } from "@/store/authStore";

export default function WorkerChatsPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<BookingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatJob, setActiveChatJob] = useState<{ id: string; title: string } | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getWorkerJobs({ limit: "50" });
      const activeJobs = res.jobs.filter((j: BookingJob) => 
        ["accepted", "in_progress", "awaiting_approval"].includes(j.status)
      );
      setJobs(activeJobs);
    } catch (e: any) {
      console.error("Failed to load jobs", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Client Chats</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Stay connected with your clients for active jobs.
        </p>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[32px] border border-gray-100">
          <Loader2 size={24} className="animate-spin text-teal-500 mb-4" />
          <p className="text-sm font-bold text-gray-400">Loading your chats...</p>
        </div>
      ) : jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-64 flex flex-col items-center justify-center bg-white rounded-[32px] border border-gray-100 text-center px-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
            <MessageSquare size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-bold text-[#0F172A] mb-2">No active client chats</p>
          <p className="text-xs text-gray-400 max-w-[250px]">
            When you accept a job, it will appear here so you can chat with the client.
          </p>
        </motion.div>
      ) : (
        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
          {jobs.map((job, idx) => {
            const clientInfo = job.client as { name: string; email: string; phone?: string };
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={job._id}
              >
                <button
                  onClick={() => setActiveChatJob({ id: job._id, title: clientInfo?.name || "Client" })}
                  className="w-full flex items-center justify-between p-5 md:p-6 border-b border-gray-50 hover:bg-gray-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                        src={(clientInfo as any)?.avatar}
                        name={clientInfo?.name}
                        size={56}
                        className="rounded-2xl"
                      />
                    <div>
                      <p className="font-bold text-[#0F172A] text-lg">{clientInfo?.name || "Client"}</p>
                      <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[200px] md:max-w-[400px]">
                        {job.service}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400 group-hover:text-[#0F172A] transition-colors hidden md:block">
                      Open Chat
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#0F172A] group-hover:border-[#0F172A] group-hover:text-teal-400 transition-all shadow-sm">
                      <ChevronRight size={18} className="ml-0.5" />
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <ChatBox
        isOpen={!!activeChatJob}
        onClose={() => setActiveChatJob(null)}
        jobId={activeChatJob?.id || ""}
        jobTitle={activeChatJob?.title || ""}
        currentUserId={user?._id || ""}
        currentUserModel="Worker"
      />
    </div>
  );
}
