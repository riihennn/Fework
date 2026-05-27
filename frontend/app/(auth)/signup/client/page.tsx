"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  AlertCircle,
  Compass
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession, signOut } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";
import CloudinaryUpload from "@/components/shared/CloudinaryUpload";

function ClientSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";
  const defaultName = searchParams.get("name") || "";
  const isGoogleAuth = searchParams.get("googleAuth") === "true";

  const { register, googleLogin, isLoading, error, clearError } = useAuthStore();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [avatar, setAvatar] = useState(""); // Cloudinary URL

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            
            // Construct a readable address from Nominatim details
            const road = addr.road || addr.suburb || addr.neighbourhood || "";
            const county = addr.county || addr.district || "";
            const streetAddress = [road, county].filter(Boolean).join(", ");
            
            const cityName = addr.city || addr.town || addr.village || addr.municipality || "";
            const stateName = addr.state || "";
            const pincodeVal = addr.postcode || "";

            setFormData(prev => ({
              ...prev,
              address: streetAddress || data.display_name || prev.address,
              city: cityName || prev.city,
              state: stateName || prev.state,
              pincode: pincodeVal || prev.pincode
            }));
          }
        } catch (error) {
          console.error("Error geocoding location:", error);
          alert("Failed to retrieve address details for your location.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Error retrieving geolocation. Please make sure location access is enabled.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Form State
  const [formData, setFormData] = useState({
    fullName: defaultName,
    email: defaultEmail,
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: ""
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
          // Check if there was an error other than "User not registered."
          const err = useAuthStore.getState().error;
          if (err && err !== "User not registered.") {
            // It failed because of something else (like being blocked)
            signOut({ redirect: false });
            return;
          }
          // Clear the "User not registered." expected error
          clearError();

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
    if (step === 1) {
      if (!isGoogleAuth && formData.password !== formData.confirmPassword) {
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
        isGoogleAuth ? "GOOGLE_AUTH_PLACEHOLDER_PASS" : formData.password,
        "client",
        formData.phone || undefined,
        undefined, // no worker profile
        formData.city || undefined,
        formData.address || undefined,
        formData.state || undefined,
        formData.pincode || undefined
      );
      // After registration, update avatar if one was uploaded
      if (avatar) {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
        await fetch(`${API}/auth/profile`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar }),
        });
        // Update in-memory auth store
        const { user } = useAuthStore.getState();
        if (user) useAuthStore.setState({ user: { ...user, avatar } });
      }
      router.push("/");
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
            {/* Error alert */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-600 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

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
                            onClick={() => signIn("google", { callbackUrl: "/signup/client?googleAuth=true" })}
                            className="w-full h-14 rounded-2xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-bold text-sm text-[#0F172A] active:scale-[0.98]"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                          </button>
                        </>
                      )}
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

                    <div className="flex justify-center mb-6">
                      <div className="text-center">
                        <CloudinaryUpload
                          label=""
                          sublabel=""
                          currentUrl={avatar}
                          onUpload={setAvatar}
                          shape="circle"
                          accept="image/*"
                        />
                        <p className="text-xs text-gray-400 mt-2 font-semibold">Profile Photo <span className="text-gray-300">(optional)</span></p>
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
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-sm font-bold text-[#0F172A]">Address</label>
                          <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={isLocating}
                            className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {isLocating ? (
                              <>
                                <Loader2 className="animate-spin" size={14} />
                                Locating...
                              </>
                            ) : (
                              <>
                                <Compass size={14} />
                                Use my current location
                              </>
                            )}
                          </button>
                        </div>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#0F172A] ml-1">City</label>
                          <input 
                            required
                            placeholder="City"
                            className="w-full h-14 px-6 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.city}
                            onChange={(e) => updateField("city", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#0F172A] ml-1">State</label>
                          <input 
                            required
                            placeholder="State"
                            className="w-full h-14 px-6 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.state}
                            onChange={(e) => updateField("state", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#0F172A] ml-1">Pincode</label>
                          <input 
                            required
                            placeholder="Pincode"
                            className="w-full h-14 px-6 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={formData.pincode}
                            onChange={(e) => updateField("pincode", e.target.value)}
                          />
                        </div>
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

export default function ClientSignup() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" size={32} /></div>}>
      <ClientSignupForm />
    </React.Suspense>
  );
}
