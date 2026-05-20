"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Zap, 
  Coins 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MembershipPage() {
  // Savings Calculator State
  const [bookingsCount, setBookingsCount] = useState(3);
  const avgServiceFee = 150; // Saved per booking
  const avgLabourDiscount = 200; // Saved per booking
  const monthlySavings = bookingsCount * (avgServiceFee + avgLabourDiscount);
  const yearlySavings = monthlySavings * 12;

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: Coins,
      title: "Zero Service Fees",
      desc: "Save ₹150+ platform service fees on every single booking. No hidden markups, no surprise charges.",
      color: "bg-teal-50/30 border-teal-100/50",
      iconBg: "bg-teal-50 text-teal-600 border-teal-100",
    },
    {
      icon: Zap,
      title: "Priority Instant Booking",
      desc: "Get matched with top-rated professionals in under 15 minutes. Pro members get bumped to the front of the queue.",
      color: "bg-amber-50/30 border-amber-100/50",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      icon: Sparkles,
      title: "Top 1% Elite Pros",
      desc: "Exclusive access to our highest-rated (4.8+) and background-checked technicians for your premium jobs.",
      color: "bg-purple-50/30 border-purple-100/50",
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      icon: ShieldCheck,
      title: "Pro Protection Guarantee",
      desc: "Up to ₹10,000 insurance coverage on all jobs completed under Fework Pro. Complete peace of mind.",
      color: "bg-rose-50/30 border-rose-100/50",
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
    },
  ];

  const plans = [
    {
      name: "Basic Monthly",
      price: "149",
      period: "month",
      desc: "Perfect for testing out Fework Pro benefits",
      features: [
        "Zero Service Fees",
        "Standard Matching Priority",
        "Elite Pro Access",
        "Cancel anytime",
      ],
      popular: false,
    },
    {
      name: "Quarterly Plan",
      price: "299",
      period: "3 months",
      desc: "Our most popular membership option",
      features: [
        "Zero Service Fees",
        "15-Minute Priority Matching",
        "Elite Pro Access",
        "₹10,000 Protection Guarantee",
        "Save 33% monthly",
      ],
      popular: true,
    },
    {
      name: "Elite Annual",
      price: "799",
      period: "year",
      desc: "Unbeatable value for long-term savings",
      features: [
        "Zero Service Fees",
        "15-Minute Priority Matching",
        "Elite Pro Access",
        "₹10,000 Protection Guarantee",
        "Exclusive VIP Support Line",
        "Save 55% monthly",
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "How does the Zero Service Fees benefit work?",
      a: "As a Fework Pro member, the platform service fee (usually ₹150 per request) is completely waived. You only pay for the technician's hourly labour rate and any parts/materials used.",
    },
    {
      q: "Can I cancel my membership at any time?",
      a: "Yes, absolutely! You can cancel your subscription with a single click in your settings. If you cancel, your benefits will remain active until the end of your billing cycle, and you won't be charged again.",
    },
    {
      q: "What is Priority Instant Booking?",
      a: "Standard requests take up to 2-3 hours to match with a pro. Pro requests bypass the standard matching algorithms to instantly notify our premium pros, matching you in 15 minutes or less.",
    },
    {
      q: "Does the Fework Pro Guarantee cover damages?",
      a: "Yes. In the rare event of accidental property damage during a service, Fework Pro includes up to ₹10,000 coverage to resolve, repair, or replace the affected items.",
    },
  ];

  const scrollToPlans = () => {
    const plansSection = document.getElementById("pricing-plans");
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50/50">
        {/* Soft Radial Gradients */}
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-[10px] font-black uppercase tracking-widest mb-8"
          >
            <Sparkles size={12} className="text-teal-600" />
            Introducing Fework Pro
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0F172A] tracking-tight leading-none mb-6"
          >
            Ultimate Convenience. <br/>
            <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
              Zero Service Fees.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 text-sm md:text-base font-bold leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Unlock exclusive rates, top 1% certified professionals, 15-minute priority matching, and ₹10,000 satisfaction insurance. Join today and start saving.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button 
              onClick={scrollToPlans}
              className="px-8 py-4 bg-[#0F172A] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group cursor-pointer shadow-sm"
            >
              Get Fework Pro
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a 
              href="#benefits"
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
            >
              Explore Benefits
            </a>
          </motion.div>
        </div>
      </section>

      {/* Core Benefits */}
      <section id="benefits" className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-4">
              Membership Benefits
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Everything you need to keep your home running smoothly
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className={`bg-slate-50/40 border border-slate-100 rounded-3xl p-8 relative overflow-hidden transition-all duration-300 hover:border-slate-200 hover:bg-white hover:shadow-[0_10px_35px_rgba(15,23,42,0.03)]`}
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 font-black ${b.iconBg}`}>
                  <b.icon size={22} />
                </div>
                <h3 className="text-lg font-black text-[#0F172A] mb-2">{b.title}</h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section className="py-20 border-t border-slate-100 bg-slate-50/30 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 md:p-12 shadow-[0_15px_40px_rgba(15,23,42,0.04)] relative overflow-hidden">
            
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-teal-50 border border-teal-100 text-teal-700 text-[9px] font-black uppercase tracking-widest rounded-full mb-4">
                  Calculator
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight mb-4">
                  Calculate Your Savings
                </h2>
                <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8">
                  See how much Fework Pro saves you over time. Move the slider to set your expected monthly bookings.
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bookings / Month</span>
                    <span className="text-2xl font-black text-teal-600">{bookingsCount}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={bookingsCount}
                    onChange={(e) => setBookingsCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-black uppercase">
                    <span>1 Booking</span>
                    <span>10 Bookings</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full relative">
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">
                      Estimated Monthly Savings
                    </span>
                    <div className="text-4xl font-black text-[#0F172A]">₹{monthlySavings}</div>
                  </div>

                  <div className="border-t border-slate-200/80 pt-4">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">
                      Estimated Annual Savings
                    </span>
                    <div className="text-3xl font-black text-teal-600">₹{yearlySavings}</div>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 font-bold leading-relaxed mt-6">
                  *Based on average service charge of ₹{avgServiceFee} and estimated labour discount savings of ₹{avgLabourDiscount} per job.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section id="pricing-plans" className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-4">
              Select Your Plan
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              No long commitments. Cancel or switch plans whenever you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p, i) => (
              <div 
                key={i} 
                className={`bg-white border rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                  p.popular 
                    ? "border-teal-500 shadow-[0_15px_40px_rgba(20,184,166,0.12)]" 
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {p.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-teal-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wider mb-2">{p.name}</h3>
                  <p className="text-slate-500 text-xs font-bold mb-6 leading-relaxed">{p.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-[#0F172A]">₹{p.price}</span>
                    <span className="text-slate-400 text-xs font-black uppercase">/ {p.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8 border-t border-slate-100 pt-6">
                    {p.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex gap-2.5 items-center text-xs font-bold text-slate-600">
                        <Check size={14} className="text-teal-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                    p.popular 
                      ? "bg-teal-500 text-white hover:bg-teal-600" 
                      : "bg-[#0F172A] text-white hover:bg-slate-800"
                  }`}
                >
                  Join Fework Pro
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 border-t border-slate-100 bg-slate-50/20">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Have questions? We have the answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="text-sm font-black text-[#0F172A]">{faq.q}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180 text-teal-600" : ""}`} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 border-t border-slate-50 pt-4 text-xs font-bold text-slate-500 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-gray-100 text-center bg-gray-50/20">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          © 2024 FEWORK TECHNOLOGIES. PRECISION MINIMALISM IN HOME SERVICES.
        </p>
      </footer>

    </div>
  );
}
