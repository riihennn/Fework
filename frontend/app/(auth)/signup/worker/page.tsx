"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion as m, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Camera, 
  ArrowRight, 
  ArrowLeft,
  Briefcase,
  Wrench,
  Clock,
  DollarSign,
  Globe,
  Upload,
  Check,
  Loader2,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Cog,
  Shield,
  Snowflake,
  BrickWall
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";

const skillCategories = [
  { id: "plumber", name: "Plumber", icon: Droplets, color: "text-blue-600 bg-blue-50" },
  { id: "electrician", name: "Electrician", icon: Zap, color: "text-amber-600 bg-amber-50" },
  { id: "carpenter", name: "Carpenter", icon: Hammer, color: "text-orange-600 bg-orange-50" },
  { id: "painter", name: "Painter", icon: Paintbrush, color: "text-rose-600 bg-rose-50" },
  { id: "mechanic", name: "Mechanic", icon: Cog, color: "text-slate-600 bg-slate-50" },
  { id: "welder", name: "Welder", icon: Shield, color: "text-indigo-600 bg-indigo-50" },
  { id: "ac", name: "AC Technician", icon: Snowflake, color: "text-cyan-600 bg-cyan-50" },
  { id: "mason", name: "Mason", icon: BrickWall, color: "text-stone-600 bg-stone-50" },
];

function WorkerSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";
  const defaultName = searchParams.get("name") || "";
  const isGoogleAuth = searchParams.get("googleAuth") === "true";

  const { register, googleLogin, isLoading, error, clearError } = useAuthStore();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    fullName: defaultName,
    email: defaultEmail,
    password: "",
    confirmPassword: "",
    skill: "",
    experience: "",
    about: "",
    hourlyRate: "",
    timing: "",
    languages: "",
    phone: "",
    address: "",
    city: "",
    state: "Kerala",
    pincode: ""
  });

  // When Google OAuth returns to this page, check if user is already registered
  useEffect(() => {
    if (isGoogleAuth && status === "authenticated" && session?.user?.email && step === 1) {
      googleLogin(session.user.email).then(success => {
        if (success) {
          // Already registered — log them in and redirect to their dashboard
          const { user } = useAuthStore.getState();
          router.push(user?.role === "worker" ? "/worker" : "/");
        } else {
          // New user — fill in Google details and continue to step 2
          setFormData(prev => ({
            ...prev,
            email: session.user!.email || prev.email,
            fullName: session.user!.name || prev.fullName,
          }));
          setStep(2);
        }
      });
    }
  }, [isGoogleAuth, status, session, step]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      if (step === 1 && !isGoogleAuth && formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      setStep(prev => prev + 1);
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
        isGoogleAuth ? "GOOGLE_AUTH_PLACEHOLDER_PASS" : formData.password,
        "worker",
        formData.phone ? `+91${formData.phone}` : undefined,
        {
          category: formData.skill,
          bio: formData.about,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
          location: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        }
      );
      router.push("/worker");
    } catch {
      // error shown from store
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">

      <main className="flex-grow flex items-center justify-center px-6 py-20">
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          {/* Progress Indicator */}
          <div className="mb-10 px-4 md:px-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Step {step} of 3</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {step === 1 ? "Account Creation" : step === 2 ? "Professional Details" : "Personal Details"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full flex overflow-hidden">
              <m.div 
                className="h-full bg-teal-600"
                initial={{ width: "33%" }}
                animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
              />
            </div>
          </div>

          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">
            <form onSubmit={handleNext}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <m.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="mb-8 text-center md:text-left">
                      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Join as Partner</h1>
                      <p className="text-gray-500 text-sm">Become part of the elite Fework service network.</p>
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
                            placeholder="john@work.com"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            readOnly={isGoogleAuth && !!defaultEmail}
                          />
                        </div>
                      </div>

                      {!isGoogleAuth && (
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
                      )}

                      {!isGoogleAuth && (
                        <>
                          <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white px-4 text-gray-400 font-medium tracking-wider">Or continue with</span>
                            </div>
                          </div>

                          <button 
                            type="button" 
                            onClick={() => signIn("google", { callbackUrl: "/signup/worker?googleAuth=true" })}
                            className="w-full h-14 rounded-2xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-bold text-sm text-[#0F172A] active:scale-[0.98]"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.9:9 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                          </button>
                        </>
                      )}
                    </div>
                  </m.div>
                )}

                {step === 2 && (
                  <m.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Professional Profile</h1>
                      <p className="text-gray-500 text-sm">Tell us about your skills and experience.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-[#0F172A] ml-1">Select Skill Category</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {skillCategories.map((s) => (
                            <div 
                              key={s.id}
                              onClick={() => updateField("skill", s.id)}
                              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${formData.skill === s.id ? 'border-teal-600 bg-teal-50/50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                                <s.icon size={20} />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#0F172A] ml-1">Experience (Years)</label>
                          <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                            <input 
                              required
                              placeholder="5"
                              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                              value={formData.experience}
                              onChange={(e) => updateField("experience", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-[#0F172A] ml-1">Hourly Rate ($)</label>
                          <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                            <input 
                              required
                              placeholder="45"
                              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                              value={formData.hourlyRate}
                              onChange={(e) => updateField("hourlyRate", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0F172A] ml-1">About Your Service</label>
                        <textarea 
                          placeholder="Briefly describe your expertise..."
                          rows={3}
                          className="w-full p-6 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                          value={formData.about}
                          onChange={(e) => updateField("about", e.target.value)}
                        />
                      </div>
                    </div>
                  </m.div>
                )}

                {step === 3 && (
                  <m.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Personal Details</h1>
                      <p className="text-gray-500 text-sm">Almost there! Complete your identity verification.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Profile Photo</span>
                        <div className="w-full h-32 rounded-[24px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer">
                          <Camera size={24} className="mb-2" />
                          <span className="text-[10px] font-bold">Upload Photo</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ID Proof</span>
                        <div className="w-full h-32 rounded-[24px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer">
                          <Upload size={24} className="mb-2" />
                          <span className="text-[10px] font-bold">Upload ID</span>
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
                        <label className="text-sm font-bold text-[#0F172A] ml-1">Home Address</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                          <input 
                            required
                            placeholder="Suite 500, High Street"
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
                  </m.div>
                )}
              </AnimatePresence>

              <div className="mt-10 flex gap-4">
                {step > 1 && (
                  <button 
                    type="button"
                    onClick={() => setStep(prev => prev - 1)}
                    className="flex-grow h-14 rounded-2xl border border-gray-200 font-bold text-[#0F172A] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
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
                      {step < 3 ? "Continue" : "Register Partner"}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Already a partner?{" "}
              <Link href="/login" className="text-teal-600 font-bold hover:underline">Log in</Link>
            </div>
          </div>
        </m.div>
      </main>

    </div>
  );
}

export default function WorkerSignup() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" size={32} /></div>}>
      <WorkerSignupForm />
    </React.Suspense>
  );
}
