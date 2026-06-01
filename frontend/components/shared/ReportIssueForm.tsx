"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bookingApi, ticketApi } from "@/services/api";
import { AlertCircle, FileText, Type, ChevronDown, CheckCircle2, Clock, Send, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

const CLIENT_BOOKING_ISSUE_TYPES = [
  { label: "Worker Didn't Arrive", value: "Worker Didn't Arrive" },
  { label: "Work Not Completed", value: "Work Not Completed" },
  { label: "Poor Service Quality", value: "Poor Service Quality" },
  { label: "Payment Issue", value: "Payment Issue" },
  { label: "Booking Cancellation", value: "Booking Cancellation" },
  { label: "Worker Misconduct", value: "Worker Misconduct" },
  { label: "Client Misconduct", value: "Client Misconduct" },
  { label: "Safety Concern", value: "Safety Concern" },
  { label: "Other", value: "Other" }
];

const WORKER_BOOKING_ISSUE_TYPES = [
  { label: "Client Cancelled / Unavailable", value: "Booking Cancellation" },
  { label: "Payment Issue", value: "Payment Issue" },
  { label: "Client Misconduct", value: "Client Misconduct" },
  { label: "Safety Concern", value: "Safety Concern" },
  { label: "Other", value: "Other" }
];

const GENERAL_ISSUE_TYPES = [
  { label: "App Issue", value: "App Issue" },
  { label: "Payment Issue", value: "Payment Issue" },
  { label: "Other", value: "Other" }
];

interface ReportIssueFormProps {
  onSuccessRedirect?: string;
  className?: string;
  hideHeader?: boolean;
}

export default function ReportIssueForm({ onSuccessRedirect, className = "", hideHeader = false }: ReportIssueFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [category, setCategory] = useState<"general" | "booking">("general");
  const [issueType, setIssueType] = useState<string>("App Issue");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category === "general") {
      setIssueType("App Issue");
    } else {
      setIssueType(user?.role === "worker" ? "Booking Cancellation" : "Poor Service Quality");
      if (bookings.length === 0) {
        fetchBookings();
      }
    }
  }, [category, user]);

  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const res = user?.role === "worker" 
        ? await bookingApi.getWorkerJobs({ limit: "50" })
        : await bookingApi.getClientJobs({ limit: "50" });
      setBookings(res.jobs || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Please provide both a title and description.");
      return;
    }

    if (category === "booking" && !selectedBookingId) {
      setError("Please select a booking to report an issue for.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        title,
        description,
        issueType,
        ...(category === "booking" && { bookingId: selectedBookingId })
      };

      await ticketApi.create(payload as any);
      setIsSuccess(true);
      
      setTimeout(() => {
        if (onSuccessRedirect) {
          router.push(onSuccessRedirect);
        } else {
          setIsSuccess(false);
          setTitle("");
          setDescription("");
        }
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl shadow-gray-200/50 text-center"
        >
          <div className="w-20 h-20 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Report Submitted</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for bringing this to our attention. Our support team will review your issue and get back to you shortly.
          </p>
          <p className="text-sm font-medium text-teal-600">
            {onSuccessRedirect ? "Redirecting..." : "Clearing form..."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto w-full ${className}`}>
      {!hideHeader && (
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2 flex items-center gap-3">
            <AlertCircle className="text-orange-500" size={32} /> Report an Issue
          </h1>
          <p className="text-gray-500 text-sm">
            Please provide details about the problem you encountered. We're here to help.
          </p>
        </div>
      )}

      <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-3">What kind of issue is this?</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setCategory("general")}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                  category === "general" 
                    ? "border-teal-500 bg-teal-50/30" 
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className={`p-2 rounded-lg ${category === "general" ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-500"}`}>
                    <AlertCircle size={18} />
                  </div>
                  <h3 className={`font-bold ${category === "general" ? "text-teal-900" : "text-gray-700"}`}>General Issue</h3>
                </div>
                <p className="text-xs text-gray-500 pl-[44px]">Bugs, payments, or account problems.</p>
              </div>

              <div 
                onClick={() => setCategory("booking")}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                  category === "booking" 
                    ? "border-orange-500 bg-orange-50/30" 
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className={`p-2 rounded-lg ${category === "booking" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                    <Briefcase size={18} />
                  </div>
                  <h3 className={`font-bold ${category === "booking" ? "text-orange-900" : "text-gray-700"}`}>Booking Issue</h3>
                </div>
                <p className="text-xs text-gray-500 pl-[44px]">Problems with a specific worker or job.</p>
              </div>
            </div>
          </div>

          {category === "booking" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
              <label className="block text-sm font-bold text-[#0F172A]">Select Booking</label>
              <div className="relative">
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  disabled={isLoadingBookings}
                >
                  <option value="">-- Choose a booking --</option>
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.service} - {new Date(b.scheduledAt).toLocaleDateString()} ({b.status})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {isLoadingBookings && <p className="text-xs text-gray-400 flex items-center gap-1.5"><Clock size={12} className="animate-spin" /> Loading your bookings...</p>}
              {!isLoadingBookings && bookings.length === 0 && (
                <p className="text-xs text-rose-500 font-medium">You don't have any bookings to report an issue for.</p>
              )}
            </motion.div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-bold text-[#0F172A]">Issue Type</label>
            <div className="relative">
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
              >
                {(category === "general" ? GENERAL_ISSUE_TYPES : (user?.role === "worker" ? WORKER_BOOKING_ISSUE_TYPES : CLIENT_BOOKING_ISSUE_TYPES)).map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-[#0F172A]">Title</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Type size={18} />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Worker did not show up"
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium placeholder:font-normal"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-[#0F172A]">Description</label>
            <div className="relative">
              <div className="absolute left-4 top-4 text-gray-400">
                <FileText size={18} />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide as much detail as possible..."
                rows={5}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium placeholder:font-normal resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (category === "booking" && (!bookings.length || !selectedBookingId))}
            className="w-full bg-[#0F172A] text-white rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
          >
            {isSubmitting ? (
              <><Clock size={18} className="animate-spin" /> Submitting...</>
            ) : (
              <><Send size={18} /> Submit Report</>
            )}
          </button>
          
        </form>
      </div>
    </div>
  );
}
