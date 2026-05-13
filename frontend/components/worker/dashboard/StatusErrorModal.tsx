"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface StatusErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function StatusErrorModal({ isOpen, message, onClose }: StatusErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden p-8 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all"
            >
              <X size={18} />
            </button>

            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <AlertTriangle size={40} />
            </div>

            <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-3">Action Restricted</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {message}
            </p>

            <button
              onClick={onClose}
              className="w-full h-14 bg-[#0F172A] hover:bg-[#1e293b] text-white font-black text-sm rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
            >
              Understand & Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
