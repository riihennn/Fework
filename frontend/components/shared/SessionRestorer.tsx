"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

// Silently restore the session from the backend httpOnly cookie on every page load
export default function SessionRestorer() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return null;
}
