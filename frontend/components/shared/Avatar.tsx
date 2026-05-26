import React from "react";
import { UserCircle } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number; // px
  className?: string;
}

/**
 * Shows user photo if available, otherwise a generic UserCircle icon.
 * Never shows a letter.
 */
export default function Avatar({ src, name, size = 40, className = "" }: AvatarProps) {
  const dimension = `${size}px`;

  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        style={{ width: dimension, height: dimension }}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: dimension, height: dimension }}
      className={`rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 ${className}`}
    >
      <UserCircle size={Math.round(size * 0.65)} strokeWidth={1.5} />
    </div>
  );
}
