"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import CloudinaryUpload from "@/components/shared/CloudinaryUpload";
import { Loader2, CheckCircle, MapPin, Briefcase, Phone, DollarSign, User, LogOut } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function WorkerSettings() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [idProof, setIdProof] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: "",
    hourlyRate: "",
    experience: "",
    city: user?.city || "",
    state: "",
    pincode: "",
    location: "",
  });

  // Load current worker profile
  useEffect(() => {
    fetch(`${API}/workers/dashboard`, { credentials: "include" })
      .then((r) => r.json())
      .then(() => {})
      .catch(() => {});

    // fetch idProof from worker profile
    fetch(`${API}/workers/profile-data`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          const w = d.data.worker;
          const u = d.data.user;
          setForm({
            name: u?.name || user?.name || "",
            phone: u?.phone || user?.phone || "",
            bio: w?.bio || "",
            hourlyRate: w?.hourlyRate ? String(w.hourlyRate) : "",
            experience: w?.experience || "",
            city: w?.city || user?.city || "",
            state: w?.state || "",
            pincode: w?.pincode || "",
            location: w?.location || "",
          });
          setIdProof(w?.idProof || "");
          setAvatar(u?.avatar || user?.avatar || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API}/workers/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar: avatar || undefined,
          idProof: idProof || undefined,
          bio: form.bio || undefined,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
          experience: form.experience || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          pincode: form.pincode || undefined,
          location: form.location || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save");

      // Update avatar in auth store
      if (avatar && user) {
        useAuthStore.setState({ user: { ...user, avatar } });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">

      {/* Profile Photo + ID Proof */}
      <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
        <h2 className="text-xl font-black text-[#0F172A] mb-1">Profile Images</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Both are optional</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <CloudinaryUpload
            label="Profile Photo"
            sublabel="Click or drag to upload"
            currentUrl={avatar}
            onUpload={setAvatar}
            shape="circle"
            accept="image/*"
          />
          <CloudinaryUpload
            label="ID Proof"
            sublabel="Aadhaar / Licence / Passport"
            currentUrl={idProof}
            onUpload={setIdProof}
            shape="square"
            accept="image/*,application/pdf"
          />
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-black text-[#0F172A] mb-1">Professional Info</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Shown to clients</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => field("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-14 pl-10 pr-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hourly Rate (₹)</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={form.hourlyRate}
                onChange={(e) => field("hourlyRate", e.target.value)}
                placeholder="500"
                className="w-full h-14 pl-10 pr-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Years of Experience</label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.experience}
                onChange={(e) => field("experience", e.target.value)}
                placeholder="5 years"
                className="w-full h-14 pl-10 pr-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">City</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.city}
                onChange={(e) => field("city", e.target.value)}
                placeholder="Kochi"
                className="w-full h-14 pl-10 pr-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">About / Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => field("bio", e.target.value)}
            placeholder="Describe your services and experience..."
            className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold px-5 py-3 rounded-2xl">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 h-14 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle size={18} className="text-teal-400" />
              Saved!
            </>
          ) : (
            "Save Changes"
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 h-14 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </motion.div>
  );
}
