"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Camera, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ClientSignup() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: ""
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      setStep(2);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    clearError();
    try {
      await register(
        formData.fullName,
        formData.email,
        formData.password,
        "client",
        formData.phone || undefined,
        undefined, // no worker profile
        formData.city || undefined
      );
      router.push("/"); // Redirect to home after successful signup
    } catch {
      // error is set in the store
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">

      <main className="flex-grow flex items-center justify-center px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full"
        >
          {/* Progress Indicator */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Step {step} of 2</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {step === 1 ? "Account Creation" : "Personal Details"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-teal-600"
                initial={{ width: "50%" }}
                animate={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">
            <form onSubmit={handleNext}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Create Account</h1>
                      <p className="text-gray-500 text-sm">Join Fework as a client to book elite services.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0F172A] ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                          <input 
                            required
                            placeholder="John Doe"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.fullName}
                            onChange={(e) => updateField("fullName", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0F172A] ml-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                          <input 
                            required
                            type="email"
                            placeholder="john@example.com"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#0F172A] ml-1">Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                            <input 
                              required
                              type="password"
                              placeholder="••••••••"
                              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                              value={formData.password}
                              onChange={(e) => updateField("password", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#0F172A] ml-1">Confirm</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                            <input 
                              required
                              type="password"
                              placeholder="••••••••"
                              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                              value={formData.confirmPassword}
                              onChange={(e) => updateField("confirmPassword", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Personal Details</h1>
                      <p className="text-gray-500 text-sm">Tell us a bit more to personalize your experience.</p>
                    </div>

                    <div className="flex justify-center mb-8">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-3xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:border-teal-200 transition-all">
                          <Camera size={32} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                          <ArrowRight size={16} className="-rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0F172A] ml-1">Phone Number</label>
                        <div className="relative group flex">
                          <span className="h-14 px-4 flex items-center justify-center bg-gray-50 border border-r-0 border-gray-200 rounded-l-2xl text-sm font-bold text-gray-500 shrink-0">
                            +91
                          </span>
                          <input 
                            required
                            type="tel"
                            placeholder="9876543210"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            title="Enter 10 digit mobile number"
                            className="w-full h-14 px-4 rounded-r-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.phone}
                            onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                          />
                        </div>
                        {formData.phone && formData.phone.length < 10 && (
                          <p className="text-xs text-rose-400 ml-1">{10 - formData.phone.length} more digits needed</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0F172A] ml-1">Address</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                          <input 
                            required
                            placeholder="123 Luxury St, Apt 4"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.address}
                            onChange={(e) => updateField("address", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          required
                          placeholder="City"
                          className="w-full h-14 px-6 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                        />
                        <input 
                          required
                          placeholder="Pincode"
                          className="w-full h-14 px-6 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          value={formData.pincode}
                          onChange={(e) => updateField("pincode", e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10 flex gap-4">
                {step === 2 && (
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-grow h-14 rounded-2xl border border-gray-200 font-bold text-[#0F172A] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                )}
                <button 
                  disabled={isLoading}
                  className="flex-grow h-14 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {step === 1 ? "Next Step" : "Complete Signup"}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-600 font-bold hover:underline">Log in</Link>
            </div>
          </div>
        </motion.div>
      </main>

    </div>
  );
}
