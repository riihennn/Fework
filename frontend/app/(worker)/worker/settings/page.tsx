"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import CloudinaryUpload from "@/components/shared/CloudinaryUpload";
import { Loader2, CheckCircle, MapPin, Briefcase, Phone, DollarSign, User, Shield, LogOut, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function WorkerSettings() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "professional" | "security">("profile");

  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [idProof, setIdProof] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

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
  }, [user]);

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccessMsg("");
    } else {
      setSuccessMsg(msg);
      setError("");
    }
    setTimeout(() => {
      setSuccessMsg("");
      setError("");
    }, 4000);
  };

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

      showMessage("Profile updated successfully!");
    } catch (e: any) {
      showMessage(e.message || "Failed to save changes", true);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage("Please fill all password fields.", true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage("New passwords do not match.", true);
      return;
    }
    
    setError("");
    setPasswordSaving(true);
    setSuccessMsg("");
    
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to change password");

      showMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      showMessage(e.message || "Failed to change password", true);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your worker profile and preferences.</p>
        </div>
        <button
          onClick={handleLogout}
          className="h-10 px-4 bg-rose-50 text-rose-500 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {(successMsg || error) && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${successMsg ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
          {successMsg ? <CheckCircle2 size={20} /> : null}
          <p className="font-medium text-sm">{successMsg || error}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === "profile" 
                  ? "bg-white text-teal-600 shadow-sm border border-gray-200" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <User size={18} />
              Identity & Bio
            </button>
            <button
              onClick={() => setActiveTab("professional")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === "professional" 
                  ? "bg-white text-teal-600 shadow-sm border border-gray-200" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Briefcase size={18} />
              Professional Info
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === "security" 
                  ? "bg-white text-teal-600 shadow-sm border border-gray-200" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Shield size={18} />
              Security
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-[#0F172A] mb-1">Identity & Bio</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Manage your public persona</p>
              </div>

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

              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">About / Bio</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => field("bio", e.target.value)}
                  placeholder="Describe your services and experience..."
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-12 px-8 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save Identity
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "professional" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-[#0F172A] mb-1">Professional Info</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Shown to clients</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone Number</label>
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Primary City</label>
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

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-12 px-8 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save Info
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-[#0F172A] mb-1">Security</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Update your password</p>
              </div>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 px-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 px-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 px-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordSaving || !currentPassword || !newPassword}
                  className="h-12 px-8 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {passwordSaving && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
