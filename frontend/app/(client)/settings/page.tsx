"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/api";
import { User, MapPin, Shield, Camera, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const { user, restoreSession } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "location" | "security">("profile");

  // Profile State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Location State
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setAddress(user.address || "");
      setState(user.state || "");
      setPincode(user.pincode || "");
    }
  }, [user]);

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg("");
    } else {
      setSuccessMsg(msg);
      setErrorMsg("");
    }
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === "profile") {
        await authApi.updateProfile({ name, phone });
      } else if (activeTab === "location") {
        await authApi.updateProfile({ city, address, state, pincode });
      }
      await restoreSession(); // refresh user data in store
      showMessage("Profile updated successfully!");
    } catch (err: any) {
      showMessage(err.message || "Failed to update profile", true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match.", true);
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      showMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showMessage(err.message || "Failed to change password", true);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "fework_avatars"); 
      const cloudinaryName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfjelmiyh";
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        await authApi.updateProfile({ avatar: data.secure_url });
        await restoreSession();
        showMessage("Avatar updated successfully!");
      } else {
        throw new Error("Cloudinary upload failed");
      }
    } catch (err) {
      console.error(err);
      showMessage("Failed to upload avatar.", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and personal information.</p>
      </div>

      {(successMsg || errorMsg) && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${successMsg ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {successMsg && <CheckCircle2 size={20} />}
          <p className="font-medium">{successMsg || errorMsg}</p>
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
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab("location")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === "location" 
                  ? "bg-white text-teal-600 shadow-sm border border-gray-200" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <MapPin size={18} />
              Location Info
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
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Details</h2>
              
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-md relative">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600 font-bold text-3xl">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-teal-600 hover:border-teal-100 transition-all"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your avatar to personalize your account.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Email address cannot be changed.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button 
                    disabled={loading}
                    className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md shadow-gray-200 flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "location" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Location Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code / Zip</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button 
                    disabled={loading}
                    className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md shadow-gray-200 flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Save Location
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <button 
                    disabled={loading}
                    className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md shadow-gray-200 flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
