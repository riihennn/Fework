import React from "react";
import {
  Star,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Briefcase,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { workerApi } from "@/services/api";
import BookingPanel from "@/components/worker/BookingPanel";

// ── Fake reviews for UI (Server rendered) ──────────────
const FAKE_REVIEWS = [
  {
    initials: "RK",
    name: "Rajan Kumar",
    time: "2 weeks ago",
    rating: 5,
    text: "Exceptional work! Arrived on time, very professional and cleaned up perfectly after finishing. Highly recommend.",
  },
  {
    initials: "PM",
    name: "Priya Menon",
    time: "1 month ago",
    rating: 5,
    text: "Fixed our leaking pipe in under an hour. Very knowledgeable and transparent about pricing. Will hire again.",
  },
  {
    initials: "AS",
    name: "Anil Suresh",
    time: "2 months ago",
    rating: 4,
    text: "Good work overall. Completed the task efficiently. Minor delay but communicated well throughout.",
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          fill={s <= rating ? "#f59e0b" : "none"}
          stroke={s <= rating ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkerProfilePage({ params }: PageProps) {
  const { id } = await params;

  let worker = null;
  let error = null;

  try {
    worker = await workerApi.getById(id);
  } catch (e) {
    error = "Could not load this professional's profile.";
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-white flex flex-col">

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">{error || "Worker not found"}</p>
            <Link
              href="/findservices"
              className="px-6 py-3 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all inline-block"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avgRating = worker.rating > 0 ? worker.rating.toFixed(1) : null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans text-[#0F172A] selection:bg-teal-100">


      <div className="max-w-[1200px] mx-auto pt-5 pb-20 px-4 md:px-8">
        <Link
          href="/findservices"
          className="flex items-center gap-2 text-gray-400 hover:text-[#0F172A] transition-colors font-bold text-sm mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Professionals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 rounded-[24px] overflow-hidden bg-gray-100 ring-8 ring-gray-50 flex items-center justify-center">
                    {worker.user.avatar ? (
                      <img src={worker.user.avatar} alt={worker.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-gray-200">
                        {worker.user.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {worker.isAvailable && (
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">{worker.user.name}</h1>
                    {avgRating && (
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                        <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                        <span className="text-sm font-black text-amber-600">{avgRating}</span>
                        <span className="text-xs text-amber-400">({worker.totalJobs} jobs)</span>
                      </div>
                    )}
                  </div>
                  <p className="text-teal-600 font-bold text-sm capitalize mb-4">{worker.category} Specialist</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 size={11} /> Verified
                    </span>
                    {worker.experience && (
                      <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        {worker.experience} Yrs Exp
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      <MapPin size={11} /> {worker.city}{worker.state ? `, ${worker.state}` : ""}
                    </span>
                    {worker.isAvailable && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        <Clock size={11} /> Available Now
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#0F172A]">{avgRating ?? "New"}</div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Avg Rating</div>
                </div>
                <div className="text-center border-x border-gray-100">
                  <div className="text-2xl font-black text-[#0F172A]">{worker.totalJobs}</div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Jobs Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-[#0F172A] flex items-center justify-center gap-0.5">
                    <span className="text-sm text-gray-300">₹</span>{worker.hourlyRate ?? "—"}
                  </div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Per Hour</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-[28px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">About</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {worker.bio || `${worker.user.name} is a skilled ${worker.category} professional based in ${worker.city}.`}
                </p>
              </div>

              <div className="bg-white rounded-[28px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Details</h2>
                <div className="space-y-4">
                  {[
                    { icon: Briefcase, label: "Category", value: worker.category },
                    { icon: Clock, label: "Experience", value: worker.experience ? `${worker.experience} years` : "—" },
                    { icon: MapPin, label: "Location", value: `${worker.city}${worker.state ? `, ${worker.state}` : ""}` },
                    { icon: Star, label: "Rating", value: avgRating ? `${avgRating} / 5.0` : "New professional" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-teal-600" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{label}</div>
                        <div className="text-sm font-bold text-[#0F172A] capitalize">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[28px] border border-gray-100 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Reviews</h2>
              </div>
              <div className="space-y-6">
                {FAKE_REVIEWS.map((r, i) => (
                  <div key={i} className={`pb-6 ${i < FAKE_REVIEWS.length - 1 ? "border-b border-gray-50" : ""}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                          {r.initials}
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#0F172A]">{r.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{r.time}</div>
                        </div>
                      </div>
                      <StarRow rating={r.rating} />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed pl-12">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 rounded-[28px] border border-teal-100 p-7">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={20} className="text-teal-600" />
                <h3 className="font-black text-teal-800 text-sm">Fework Trust Guarantee</h3>
              </div>
              <p className="text-teal-600/80 text-xs font-bold leading-relaxed">
                All bookings are insured up to ₹1M and handled via our secure payment gateway.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN – Booking (Client Island) */}
          <BookingPanel worker={worker} />
        </div>
      </div>

      <footer className="py-10 border-t border-gray-100 text-center bg-white">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          © 2024 FEWORK TECHNOLOGIES. PRECISION MINIMALISM IN HOME SERVICES.
        </p>
      </footer>
    </div>
  );
}
