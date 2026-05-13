"use client";
import React from "react";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-center py-20">
      <h2 className="text-3xl font-black capitalize">profile Coming Soon</h2>
      <p className="text-gray-400">We are perfecting this module for your professional experience.</p>
    </motion.div>
  );
}
