"use client";

import React, { useRef, useState } from "react";
import { Camera, Upload, X, Loader2, FileImage, CheckCircle } from "lucide-react";

interface CloudinaryUploadProps {
  label: string;
  sublabel?: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  accept?: string; // e.g. "image/*" or "image/*,application/pdf"
  shape?: "circle" | "square"; // avatar vs id proof
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Upload failed");
  }
  
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Upload failed");
  }
  
  return data.secure_url as string;
}

export default function CloudinaryUpload({
  label,
  sublabel,
  currentUrl,
  onUpload,
  accept = "image/*",
  shape = "square",
}: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentUrl || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleFile = async (file: File) => {
    setError("");
    setSuccess(false);
    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setPreview(url);
      onUpload(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setPreview(currentUrl || "");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview("");
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isCircle = shape === "circle";

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-bold text-[#0F172A]">{label}</label>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative cursor-pointer group transition-all ${
          isCircle
            ? "w-24 h-24 rounded-full mx-auto"
            : "w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 hover:border-teal-400 hover:bg-teal-50/30"
        }`}
      >
        {preview ? (
          // Has image
          <div className={`relative w-full h-full ${isCircle ? "rounded-full" : "rounded-xl"} overflow-hidden`}>
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${isCircle ? "rounded-full" : "rounded-xl"}`}>
              {uploading ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={18} className="text-white" />
              )}
            </div>
            {/* Clear button */}
            {!uploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all shadow-sm z-10"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ) : (
          // No image — show upload prompt
          isCircle ? (
            <div className="w-full h-full rounded-full border-2 border-dashed border-gray-200 bg-gray-50 group-hover:border-teal-400 group-hover:bg-teal-50 transition-all flex items-center justify-center">
              {uploading ? (
                <Loader2 size={20} className="text-teal-500 animate-spin" />
              ) : (
                <Camera size={22} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
              {uploading ? (
                <Loader2 size={22} className="text-teal-500 animate-spin" />
              ) : (
                <>
                  <FileImage size={24} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
                  <p className="text-xs text-gray-400 group-hover:text-teal-600 font-semibold transition-colors text-center">
                    Click or drag & drop to upload
                  </p>
                </>
              )}
            </div>
          )
        )}

        {/* Success ring */}
        {success && (
          <div className={`absolute inset-0 ${isCircle ? "rounded-full" : "rounded-2xl"} ring-2 ring-teal-500 pointer-events-none flex items-center justify-center`}>
            <CheckCircle size={20} className="text-teal-500 bg-white rounded-full" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}

      {/* Uploading status */}
      {uploading && (
        <p className="text-xs text-teal-600 font-semibold text-center animate-pulse">Uploading...</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
