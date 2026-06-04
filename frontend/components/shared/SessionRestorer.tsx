"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

// Silently restore the session from the backend httpOnly cookie on mount — runs once only.
export default function SessionRestorer() {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    useAuthStore.getState().restoreSession();
  }, []);

  return null;
}
