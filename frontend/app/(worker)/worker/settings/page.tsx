"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudinaryUpload from "@/components/shared/CloudinaryUpload";
import { Loader2, CheckCircle, MapPin, Briefcase, Phone, DollarSign, User, Shield, LogOut, CheckCircle2, AlertTriangle, X, Search, Pencil } from "lucide-react";

import ReportIssueForm from "@/components/shared/ReportIssueForm";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function WorkerSettings() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "professional" | "security" | "report-issue">("profile");

  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [idProof, setIdProof] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);

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
    skills: [] as string[],
  });

  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/skills`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.skills) {
          const names: string[] = json.data.skills
            .filter((s: any) => s.isActive !== false)
            .map((s: any) => s.name as string)
            .sort();
          setAvailableSkills(names);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionContainerRef.current &&
        !suggestionContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !form.skills.includes(skill)
  );

  const addSkill = (skill: string) => {
    if (!form.skills.includes(skill)) {
      setForm((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setSkillInput("");
    setShowSuggestions(false);
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveSuggestionIndex((prev) =>
        filteredSkills.length > 0 ? (prev + 1) % filteredSkills.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveSuggestionIndex((prev) =>
        filteredSkills.length > 0
          ? (prev - 1 + filteredSkills.length) % filteredSkills.length
          : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && filteredSkills[activeSuggestionIndex]) {
        addSkill(filteredSkills[activeSuggestionIndex]);
      } else if (skillInput.trim()) {
        const exactMatch = availableSkills.find(
          (s) => s.toLowerCase() === skillInput.trim().toLowerCase()
        );
        if (exactMatch) {
          addSkill(exactMatch);
        }
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Load current worker profile
  useEffect(() => {
    // fetch full profile from worker
    fetch(`${API}/workers/me`, { credentials: "include" })
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
            skills: w?.skills || [],
          });
          setIdProof(w?.idProof || "");
          setAvatar(u?.avatar || user?.avatar || "");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch worker profile:", err);
      });
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
          skills: form.skills.length > 0 ? form.skills : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save");

      // Update avatar in auth store
      if (avatar && user) {
        useAuthStore.setState({ user: { ...user, avatar } });
      }

      setIsEditingProfile(false);
      setIsEditingProfessional(false);
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="h-10 px-4 bg-rose-50 text-rose-500 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
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
            <button
              onClick={() => setActiveTab("report-issue")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap mt-4 ${
                activeTab === "report-issue"
                  ? "bg-orange-50 text-orange-600 shadow-sm border border-orange-100"
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <AlertTriangle size={18} />
              Report Issue
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#0F172A] mb-1">Identity & Bio</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Manage your public persona</p>
                </div>
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 hover:text-teal-600 transition-all active:scale-95" title="Edit Identity & Bio">
                    <Pencil size={18} />
                  </button>
                )}
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 transition-all duration-300 ${!isEditingProfile ? "opacity-75 pointer-events-none grayscale-[0.2]" : ""}`}>
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
                  disabled={!isEditingProfile}
                  placeholder="Describe your services and experience..."
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {isEditingProfile && (
                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={() => setIsEditingProfile(false)} className="h-12 px-6 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Save Identity
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "professional" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#0F172A] mb-1">Professional Info</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Shown to clients</p>
                </div>
                {!isEditingProfessional && (
                  <button onClick={() => setIsEditingProfessional(true)} className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 hover:text-teal-600 transition-all active:scale-95" title="Edit Professional Info">
                    <Pencil size={18} />
                  </button>
                )}
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-300 ${!isEditingProfessional ? "opacity-75 pointer-events-none grayscale-[0.2]" : ""}`}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => field("phone", e.target.value)}
                      disabled={!isEditingProfessional}
                      placeholder="+91 98765 43210"
                      className="w-full h-14 pl-10 pr-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
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
                      disabled={!isEditingProfessional}
                      placeholder="500"
                      className="w-full h-14 pl-10 pr-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
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
                      disabled={!isEditingProfessional}
                      placeholder="5 years"
                      className="w-full h-14 pl-10 pr-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
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
                      disabled={!isEditingProfessional}
                      placeholder="Kochi"
                      className="w-full h-14 pl-10 pr-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2 relative" ref={suggestionContainerRef}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Skills</label>
                  
                  {/* Selected Skills Chips */}
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100/50"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-teal-200/50 text-teal-800 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Input Box */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                    <input 
                      type="text"
                      placeholder="Type to search skills... (e.g. Electrician)"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      value={skillInput}
                      disabled={!isEditingProfessional}
                      onChange={(e) => {
                        setSkillInput(e.target.value);
                        setShowSuggestions(true);
                        setActiveSuggestionIndex(0);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && skillInput.trim() !== "" && filteredSkills.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.08)] overflow-hidden z-50 max-h-60 overflow-y-auto">
                      {filteredSkills.map((skill, index) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            addSkill(skill);
                          }}
                          className={`w-full px-5 py-3 text-left text-sm transition-colors flex items-center justify-between ${
                            index === activeSuggestionIndex
                              ? "bg-teal-50 text-teal-800 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span>{skill}</span>
                          {index === activeSuggestionIndex && (
                            <span className="text-xs text-teal-600 font-bold uppercase tracking-widest">Enter to select</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isEditingProfessional && (
                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={() => setIsEditingProfessional(false)} className="h-12 px-6 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Save Info
                  </button>
                </div>
              )}
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

          {activeTab === "report-issue" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div>
                <h2 className="text-xl font-black text-[#0F172A] mb-1">Report an Issue</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Let us know if you need help</p>
              </div>
              <ReportIssueForm hideHeader />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
