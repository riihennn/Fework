"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Zap,
  Droplets,
  Snowflake,
  Trash2,
  Paintbrush,
  Hammer,
  Star,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";
import HeroSearch from "@/components/home/HeroSearch";

const categories = [
  { name: "Electrician", slug: "electrician", icon: Zap },
  { name: "Plumber",     slug: "plumber",     icon: Droplets },
  { name: "AC Repair",   slug: "ac",          icon: Snowflake },
  { name: "Cleaning",    slug: "cleaner",     icon: Trash2 },
  { name: "Painting",    slug: "painter",     icon: Paintbrush },
  { name: "Carpentry",   slug: "carpenter",   icon: Hammer },
];

// Interactive Ad Section Data
const featuredAd = {
  title: "Limited Time Offer!",
  subtitle: "Get 20% off your first service with code FEWORK20",
  cta: "Claim Now",
  image: "/images/featured-ad.jpg",
};

const applianceServices = [
  { name: "AC Repair", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7oxh13J9udlF7xMCJD-AKqb_70uPN0HiQMA&s" },
  { name: "Washing Machine", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNijvnWjOr3H5CFOCOliO_fZIQydwoi0mdNQ&s" },
  { name: "Refrigerator", image: "https://www.whirlpool.com/is/image/content/dam/business-unit/whirlpoolv2/en-us/marketing-content/site-assets/page-content/refer-sclp-25/mh-2-m.jpg?$atomic-mobile$&fit=constrain&fmt=webp-alpha&qlt=100&bfc=off" },
  { name: "Microwave", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUi-fb5c1QfTvzflR1jP33Iy949r6dzaNUhw&s" },
  { name: "Television", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400" },
];

const spotlightCards = [
  {
    title: "Expert Plumbing",
    subtitle: "Leak repairs & installations",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-blue-50",
    textColor: "text-blue-900",
    isDark: false
  },
  {
    title: "Master Electrician",
    subtitle: "Wiring & safety checks",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-[#0A1128]",
    textColor: "text-white",
    isDark: true
  },
  {
    title: "Professional Painter",
    subtitle: "Wall painting & finishing",
    cta: "Explore",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-rose-50",
    textColor: "text-rose-900",
    isDark: false
  },
  {
    title: "Expert Carpenter",
    subtitle: "Furniture & wood work",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-orange-50",
    textColor: "text-orange-900",
    isDark: false
  },
  {
    title: "AC Technician",
    subtitle: "Service & repair",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd6b?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-900",
    isDark: false
  },
  {
    title: "Auto Mechanic",
    subtitle: "Vehicle maintenance",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-gray-100",
    textColor: "text-gray-900",
    isDark: false
  },
  {
    title: "Home Cleaner",
    subtitle: "Deep cleaning expert",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1581578731522-7b7194262b5b?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-purple-50",
    textColor: "text-purple-900",
    isDark: false
  },
  {
    title: "Expert Welder",
    subtitle: "Metal works & repairs",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-slate-50",
    textColor: "text-slate-900",
    isDark: false
  },
  {
    title: "Master Mason",
    subtitle: "Stone & brick work",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-stone-50",
    textColor: "text-stone-900",
    isDark: false
  },
  {
    title: "General Handyman",
    subtitle: "All-in-one solutions",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
    bgColor: "bg-teal-50",
    textColor: "text-teal-900",
    isDark: false
  }
];

export default function LandingPage() {
  const router = useRouter();
  const navigateSearch = (term: string) => router.push(`/findservices?search=${encodeURIComponent(term)}`);
  const navigateCategory = (cat: string) => router.push(`/findservices?category=${encodeURIComponent(cat)}`);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">


      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-[#0A1128] pt-24 pb-32 overflow-hidden">
          {/* Subtle architectural background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,200 L1000,200 M0,400 L1000,400 M0,600 L1000,600 M0,800 L1000,800 M200,0 L200,1000 M400,0 L400,1000 M600,0 L600,1000 M800,0 L800,1000" stroke="white" strokeWidth="1" fill="none" />
              <path d="M100,100 L900,100 L900,900 L100,900 Z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M500,50 L950,400 L50,400 Z" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight"
            >
              Search for experts near you
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <HeroSearch />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 text-white/60 text-sm"
            >
              <span>Popular:</span>
              {["Electrician", "House Cleaning", "AC Maintenance", "Plumber"].map(term => (
                <button
                  key={term}
                  onClick={() => navigateSearch(term)}
                  className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
                >
                  {term}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Service Categories</h2>
              <p className="text-gray-500">Professional solutions for every home need</p>
            </div>
            <Link href="/findservices" className="text-[#006D77] font-bold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                onClick={() => navigateCategory(cat.slug)}
                className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-[#006D77] group-hover:bg-[#006D77] group-hover:text-white transition-all">
                  <cat.icon size={28} />
                </div>
                <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* In the Spotlight Slider */}
        <section className="py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-10">
            <h2 className="text-3xl font-bold text-[#0F172A]">In the spotlight</h2>
          </div>
          
          <div className="relative">
            <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar pb-8 flex gap-6 scroll-smooth">
              {spotlightCards.map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className={`min-w-[320px] md:min-w-[450px] h-[280px] rounded-[32px] ${card.bgColor} overflow-hidden flex relative group cursor-pointer border border-gray-100 flex-shrink-0`}
                >
                  <div className="w-1/2 p-8 flex flex-col justify-between items-start z-10">
                    <div>
                      <h3 className={`text-xl md:text-2xl font-bold ${card.textColor} mb-2 leading-tight`}>
                        {card.title}
                      </h3>
                      <p className={`text-sm ${card.isDark ? 'text-white/60' : 'text-gray-500'}`}>
                        {card.subtitle}
                      </p>
                    </div>
                    <Link href="/findservices" className={`${card.isDark ? 'bg-white text-black' : 'bg-black text-white'} px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all text-center`}>
                      {card.cta}
                    </Link>
                  </div>
                  <div className="w-1/2 h-full relative">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${card.isDark ? 'from-black/40' : 'from-gray-100/40'} to-transparent md:hidden`}></div>
                  </div>
                </motion.div>
              ))}
              
              {/* Fake navigation arrow for aesthetic */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-xl border border-gray-100 hidden lg:flex items-center justify-center text-gray-800 cursor-pointer hover:bg-gray-50 transition-all z-20">
                <ArrowRight size={24} />
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Advertisement Section */}
        <section className="py-24 bg-gray-50/50 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[48px] bg-[#0A1128] overflow-hidden group cursor-pointer"
            >
              <div className="grid lg:grid-cols-2 items-center">
                <div className="p-12 md:p-20 relative z-10">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-1 rounded-full bg-teal-500 text-white text-xs font-black tracking-widest uppercase mb-6"
                  >
                    Flash Sale
                  </motion.div>
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    {featuredAd.title}
                  </h2>
                  <p className="text-xl text-white/60 mb-10 max-w-lg">
                    {featuredAd.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-[#0A1128] px-10 py-4 rounded-2xl font-black text-lg hover:bg-teal-50 transition-colors flex items-center gap-2"
                    >
                      {featuredAd.cta}
                      <ArrowRight size={20} />
                    </motion.button>
                    <div className="flex items-center gap-4 text-white/40">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A1128] bg-gray-600 overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-${i === 1 ? '1535713875002-d1d0cf377fde' : i === 2 ? '1527980965255-d3b416303d12' : '1580489944761-15a19d654956'}?auto=format&fit=crop&q=80&w=100`} alt="User" />
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-medium">Joined by 2k+ today</span>
                    </div>
                  </div>
                </div>

                <div className="relative h-[400px] lg:h-full min-h-[500px] overflow-hidden">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: -2 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={featuredAd.image} 
                      alt="Special Offer" 
                      className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A1128] via-transparent to-transparent"></div>
                  </motion.div>
                  
                  {/* Floating interactive elements */}
                  <motion.div
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-1/4 right-1/4 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl z-20 hidden md:block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white">
                        <Zap size={24} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-white font-bold">Fast Booking</p>
                        <p className="text-white/50 text-xs">Available in 2h</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Animated background glow */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] -z-0 pointer-events-none group-hover:bg-teal-500/20 transition-all duration-700"></div>
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 bg-gray-50/30 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">How Fework works</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Getting your home tasks done has never been this easy or elegant.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  step: "01", 
                  title: "Choose a Service", 
                  desc: "Select from over 50+ professional home services from our curated catalog.",
                  icon: Sparkles,
                  color: "bg-teal-500"
                },
                { 
                  step: "02", 
                  title: "Book an Expert", 
                  desc: "Pick a date and time that works for you. We'll match you with a top-rated pro.",
                  icon: Calendar,
                  color: "bg-[#0A1128]"
                },
                { 
                  step: "03", 
                  title: "Relax & Enjoy", 
                  desc: "Our expert arrives and handles the job while you focus on what matters.",
                  icon: CheckCircle2,
                  color: "bg-[#006D77]"
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="relative p-8 rounded-[32px] bg-white border border-gray-100 hover:shadow-xl transition-all group"
                >
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform`}>
                    <item.icon size={32} />
                  </div>
                  <span className="absolute top-8 right-8 text-4xl font-black text-gray-100">{item.step}</span>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-4">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-bold text-[#0F172A]">Appliance repair & service</h2>
            <Link href="/findservices" className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all">
              See all
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {applianceServices.map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                onClick={() => navigateCategory(service.name === "AC Repair" ? "ac" : service.name.toLowerCase())}
                className="group cursor-pointer"
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-gray-100">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" 
                  />
                </div>
                <h3 className="font-semibold text-gray-800 text-center">{service.name}</h3>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Wellness Bundle Interactive Ad */}
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-[48px] overflow-hidden flex flex-col lg:flex-row items-stretch border border-green-100 shadow-sm"
          >
            <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center items-start">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-200 text-green-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <TrendingUp size={14} /> Popular Bundle
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Home Wellness <br />Seasonal Bundle
              </h2>
              <p className="text-xl text-gray-700/80 mb-10 max-w-md">
                Get a Deep Clean + AC Service + 5-Point Safety Check for one flat price. Save $120 today.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-800">
                  <CheckCircle2 size={16} className="text-green-600" /> Deep Cleaning
                </div>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-800">
                  <CheckCircle2 size={16} className="text-green-600" /> AC Maintenance
                </div>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-800">
                  <CheckCircle2 size={16} className="text-green-600" /> Electrical Check
                </div>
              </div>
              <button className="bg-[#0A1128] text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-green-900/10">
                Claim Bundle <ArrowRight size={20} />
              </button>
            </div>
            <div className="lg:w-1/2 min-h-[400px] relative">
              <img 
                src="/images/wellness-bundle.jpg" 
                alt="Wellness Bundle" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F0FDF4] to-transparent lg:hidden"></div>
              
              {/* Interactive Floating Badge */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-green-400 z-20"
              >
                <span className="text-[10px] font-black text-gray-400 uppercase">Save</span>
                <span className="text-2xl font-black text-green-600">$120</span>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="py-12 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-[#FFF8E1] rounded-[32px] overflow-hidden flex flex-col md:flex-row items-stretch"
          >
            <div className="p-12 md:p-20 flex-grow flex flex-col justify-center items-start">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                Give your space the<br />glow-up it deserves
              </h2>
              <p className="text-xl text-gray-700 mb-10">Home painting</p>
              <button className="bg-black text-white px-10 py-3.5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all">
                Buy now
              </button>
            </div>
            <div className="md:w-[45%] min-h-[300px] relative">
              <img 
                src="/images/glowup.jpg" 
                alt="Interior Glow-up" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </section>

        {/* CTA Sections */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative bg-[#0A1128] rounded-[40px] overflow-hidden p-12 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="max-w-md relative z-10">
                <span className="text-teal-400 text-xs font-black tracking-[0.2em] uppercase mb-4 block">Premium Plan</span>
                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                  Unlimited Care for Your Home
                </h2>
                <p className="text-white/60 mb-10 leading-relaxed">
                  Join Fework Elite for $0 service fees, priority scheduling, and annual maintenance checks.
                </p>
                <button className="bg-[#006D77] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#005a63] transition-all shadow-xl shadow-teal-900/20">
                  Get Started
                </button>
              </div>
              <div className="relative w-full md:w-64 h-64 flex flex-col items-center justify-center">
                <div className="w-32 h-32 border-4 border-teal-500/30 rounded-full flex items-center justify-center mb-4">
                  <div className="w-16 h-16 border-4 border-teal-500/50 rounded-full"></div>
                </div>
                <span className="text-white/40 font-bold tracking-[0.3em] uppercase text-xl">Elite care</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-[40px] p-12 flex flex-col items-center text-center justify-center gap-8">
              <div className="w-16 h-16 bg-[#006D77]/10 text-[#006D77] rounded-2xl flex items-center justify-center">
                <MessageSquare size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Need Help?</h2>
                <p className="text-gray-500">
                  Our expert concierge team is available 24/7 to help you find the right pro.
                </p>
              </div>
                  <button
                    onClick={() => router.push("/help")}
                    className="w-full bg-white border border-gray-200 text-[#0F172A] px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-sm"
                  >
                    Chat with Us
                  </button>
            </div>
          </div>
        </section>
      </main>


    </div>
  );
}
