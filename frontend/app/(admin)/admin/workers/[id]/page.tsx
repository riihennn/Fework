"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi, AdminWorker, AdminBooking } from "@/services/api";
import { ArrowLeft, Star, MapPin, Mail, Briefcase, Award, Calendar, CheckCircle, Clock, XCircle, AlertCircle, MessageSquare, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/shared/Avatar";

export default function AdminWorkerDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [worker, setWorker] = useState<AdminWorker | null>(null);
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getWorkerById(id)
      .then((d) => {
        setWorker(d.worker);
        setRecentBookings(d.recentBookings);
        setRecentReviews(d.recentReviews);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleToggleElite = async () => {
    if (!worker) return;
    setTogglingId(worker._id);
    try {
      const { isElite } = await adminApi.toggleElite(worker._id);
      setWorker({ ...worker, isElite });
    } catch (e: any) { alert(e.message); }
    finally { setTogglingId(null); }
  };

  const handleVerify = async (status: "approved" | "rejected") => {
    if (!worker) return;
    setTogglingId(`verify-${status}`);
    try {
      const res = await adminApi.verifyWorker(worker._id, status);
      setWorker({ ...worker, verificationStatus: res.verificationStatus as any });
    } catch (e: any) { alert(e.message); }
    finally { setTogglingId(null); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500 bg-white rounded-3xl shadow-sm">
        <AlertCircle size={48} className="mb-4 text-rose-300" />
        <p className="font-bold text-[#0F172A]">Worker not found</p>
        <button onClick={() => router.push("/admin/workers")} className="mt-4 text-teal-600 font-bold hover:underline">
          Back to Workers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link href="/admin/workers" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0F172A] transition-colors">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Worker Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
            {worker.isElite && (
              <div className="absolute top-4 right-4 bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                <Award size={14} className="fill-amber-500 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Elite</span>
              </div>
            )}
            {worker.verificationStatus === "pending" && (
              <div className="absolute top-4 left-4 bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
              </div>
            )}
            {worker.verificationStatus === "rejected" && (
              <div className="absolute top-4 left-4 bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                <XCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Rejected</span>
              </div>
            )}
            {worker.verificationStatus === "approved" && (
              <div className="absolute top-4 left-4 bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                <CheckCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Approved</span>
              </div>
            )}
            
            <div className="flex flex-col items-center text-center">
              <Avatar src={worker.userInfo.avatar} name={worker.userInfo.name} size={80} className="mb-4" />
              <h2 className="text-2xl font-black text-[#0F172A]">{worker.userInfo.name}</h2>
              <div className="inline-block bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg mt-2 border border-teal-100">
                {worker.category || "General"}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <Mail size={18} className="text-gray-400" />
                <span className="truncate">{worker.userInfo.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <MapPin size={18} className="text-gray-400" />
                <span>{worker.city || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <Calendar size={18} className="text-gray-400" />
                <span>Joined {fmtDate(worker.createdAt)}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-black text-[#0F172A]">{worker.totalJobs}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Total Jobs</div>
              </div>
              <div className="border-l border-gray-100">
                <div className="text-xl font-black text-[#0F172A] flex justify-center items-center gap-1">
                  {worker.rating.toFixed(1)} <Star size={14} className="text-amber-500 fill-amber-500" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Rating</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
              {worker.verificationStatus === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify("approved")}
                    disabled={!!togglingId}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={18} />
                    {togglingId === "verify-approved" ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleVerify("rejected")}
                    disabled={!!togglingId}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={18} />
                    {togglingId === "verify-rejected" ? "..." : "Reject"}
                  </button>
                </div>
              )}
              <button
                onClick={handleToggleElite}
                disabled={togglingId === worker._id}
                className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                  worker.isElite
                    ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
                    : "bg-[#0F172A] text-white hover:bg-gray-800 shadow-md"
                }`}
              >
                {togglingId === worker._id ? "Processing..." : worker.isElite ? "Revoke Elite Status" : "Make Elite Provider"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-[#0F172A] mb-4">Availability</h3>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${
              worker.isAvailable 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-gray-50 text-gray-500 border border-gray-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${worker.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {worker.isAvailable ? 'Currently Online & Available' : 'Currently Offline'}
            </div>

            <h3 className="font-bold text-[#0F172A] mt-6 mb-4">Pricing</h3>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-500">Hourly Rate</span>
              <span className="text-lg font-black text-[#0F172A]">₹{worker.hourlyRate}</span>
            </div>
          </div>

          {(worker as any).idProof && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-[#0F172A] mb-4">ID Proof</h3>
              <a href={(worker as any).idProof} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={(worker as any).idProof}
                  alt="ID Proof"
                  className="w-full rounded-2xl object-cover border border-gray-100 hover:opacity-90 transition-opacity"
                />
                <p className="text-xs text-teal-600 font-bold mt-2 text-center">Click to open full size</p>
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm min-h-full">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-teal-600" />
              Recent Bookings
            </h2>

            {recentBookings.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Briefcase size={32} className="text-gray-300 mb-3" />
                <p className="font-bold text-gray-500">No bookings yet</p>
                <p className="text-xs text-gray-400 mt-1">This worker hasn't completed any jobs.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((job) => {
                  const statusColors = {
                    pending: "bg-amber-50 text-amber-700 border-amber-200",
                    accepted: "bg-blue-50 text-blue-700 border-blue-200",
                    in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200",
                    awaiting_approval: "bg-purple-50 text-purple-700 border-purple-200",
                    completed: "bg-teal-50 text-teal-700 border-teal-200",
                    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
                    disputed: "bg-red-50 text-red-700 border-red-200",
                  }[job.status] || "bg-gray-50 text-gray-700 border-gray-200";

                  const StatusIcon = {
                    pending: Clock,
                    accepted: CheckCircle,
                    in_progress: Briefcase,
                    awaiting_approval: Clock,
                    completed: CheckCircle,
                    cancelled: XCircle,
                    disputed: AlertCircle,
                  }[job.status] || Clock;

                  return (
                    <div key={job._id} className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors}`}>
                              <StatusIcon size={12} />
                              {job.status.replace("_", " ")}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg">
                              {job.service}
                            </span>
                          </div>
                          <h4 className="font-bold text-[#0F172A]">{job.description}</h4>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-lg font-black text-teal-600">₹{job.actualPay || job.estimatedPay}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {job.paymentStatus === "paid" ? "Paid" : "Estimated"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-500 bg-white border border-gray-100 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{fmtDate(job.scheduledAt)} • {fmtTime(job.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="truncate max-w-[200px]">{job.location}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                        <Avatar src={job.client.avatar} name={job.client.name} size={32} />
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">{job.client.name}</p>
                          <p className="text-[10px] font-semibold text-gray-400">Client</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mt-6">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-teal-600" />
              Recent Reviews
            </h2>

            {recentReviews.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MessageSquare size={32} className="text-gray-300 mb-3" />
                <p className="font-bold text-gray-500">No reviews yet</p>
                <p className="text-xs text-gray-400 mt-1">This worker hasn't received any reviews.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review._id} className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={review.client.avatar} name={review.client.name} size={32} />
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{review.client.name}</p>
                          <p className="text-[10px] font-semibold text-gray-400">{fmtDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        <span className="text-sm font-black text-amber-700">{review.rating}</span>
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment || "No comment provided."}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
