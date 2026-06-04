"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, ArrowLeft, CheckCheck, User, MoreVertical } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { messageApi, ChatMessage, API_BASE_URL, BACKEND_URL } from "../../services/api";
import { useNotificationStore } from "../../store/notificationStore";

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  currentUserId: string;
  currentUserModel: "User" | "Worker";
  jobTitle: string;
  isInline?: boolean;
  readOnly?: boolean;
}

// Group messages by date
function groupByDate(messages: ChatMessage[]) {
  const groups: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
    const last = groups[groups.length - 1];
    if (last && last.date === d) {
      last.messages.push(msg);
    } else {
      groups.push({ date: d, messages: [msg] });
    }
  });
  return groups;
}

export default function ChatBox({
  isOpen,
  onClose,
  jobId,
  currentUserId,
  currentUserModel,
  jobTitle,
  isInline = false,
  readOnly = false,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { setActiveChatRoomId } = useNotificationStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    setActiveChatRoomId(jobId);

    return () => {
      setActiveChatRoomId(null);
    };
  }, [isOpen, jobId, setActiveChatRoomId]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await messageApi.getMessages(jobId);
        if (isMounted) setMessages(data);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMessages();

    const socketURL = BACKEND_URL.replace("/api", "");
    const socket = io(socketURL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_job", jobId);
    });

    socket.on("receive_message", (newMessage: ChatMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [isOpen, jobId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      jobId,
      senderId: currentUserId,
      senderRole: currentUserModel === "User" ? "client" : "worker",
      message: input.trim(),
    });

    setInput("");
  };

  const handleClearChat = async () => {
    try {
      await messageApi.clearChat(jobId);
      setMessages([]);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to clear chat", error);
    }
  };

  const groups = groupByDate(messages);

  return (
    <AnimatePresence>
      {(isOpen || isInline) && (
        <>
          {!isInline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[9998] bg-black/50"
            />
          )}

          <motion.div
            initial={isInline ? { opacity: 0 } : { x: "100%" }}
            animate={isInline ? { opacity: 1 } : { x: 0 }}
            exit={isInline ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className={
              isInline
                ? "flex flex-col w-full h-full bg-white relative"
                : "fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[9999] flex flex-col"
            }
          >
            {/* Header */}
            <div className="h-[64px] px-4 flex items-center gap-3 bg-white border-b border-gray-100 shrink-0 shadow-sm">
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-all"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm leading-tight capitalize truncate w-48">{jobTitle}</h3>
                  {readOnly ? (
                    <p className="text-[10px] font-semibold text-gray-400">Chat closed</p>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-all"
                >
                  <MoreVertical size={20} className="text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute top-10 right-0 bg-white border border-gray-100 shadow-lg rounded-xl py-2 w-40 z-[9992]">
                    <button
                      onClick={handleClearChat}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors"
                    >
                      Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1 bg-gray-50">
              {loading ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <Loader2 size={24} className="animate-spin text-teal-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center h-full">
                  <div className="bg-white/70 rounded-full px-5 py-2 shadow-sm mb-3">
                    <p className="text-xs font-semibold text-gray-500">Messages are end-to-end encrypted</p>
                  </div>
                  <p className="text-xs text-gray-400">No messages yet. Say hello 👋</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.date} className="flex flex-col gap-1">
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-3">
                      <span className="bg-white/80 shadow-sm text-gray-500 text-[11px] font-semibold px-4 py-1 rounded-full">
                        {group.date}
                      </span>
                    </div>

                    {group.messages.map((msg, idx) => {
                      const isMe = msg.senderId === currentUserId;
                      const time = new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1.5`}
                        >
                          <div
                            className={`relative max-w-[85%] px-3 py-1.5 text-[14.5px] shadow-[0_1px_1px_rgba(0,0,0,0.08)] text-[#0F172A] ${
                              isMe ? "bg-gray-100 rounded-[12px] rounded-tr-none" : "bg-white rounded-[12px] rounded-tl-none border border-gray-100"
                            }`}
                          >
                            <div className="leading-relaxed break-words">
                              <span>{msg.message}</span>
                              <span className="inline-flex items-center gap-0.5 ml-3 mt-1 relative top-[1px] text-[10px] text-gray-400 font-medium tracking-tight whitespace-nowrap align-bottom">
                                {time}
                                {isMe && (
                                  <CheckCheck size={14} className="text-gray-400" />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!readOnly ? (
              <div className="p-3 bg-white border-t border-gray-100 shrink-0 flex items-center gap-2">
                <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-full pl-5 pr-4 text-sm focus:outline-none focus:border-teal-400 focus:bg-white transition-all font-medium placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-12 h-12 flex items-center justify-center bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-all disabled:opacity-40 shadow-md shrink-0"
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex justify-center text-center">
                <span className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                  This job is completed. Chat is closed.
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
