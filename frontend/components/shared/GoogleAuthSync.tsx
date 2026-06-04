"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function GoogleAuthSync() {
  const { data: session, status } = useSession();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const hasAttemptedSync = useRef(false);

  useEffect(() => {
    // Don't interfere with the signup registration flow — those pages handle Google themselves
    if (pathname.startsWith("/signup")) return;

    if (status === "authenticated" && session?.user?.email && !isAuthenticated && !hasAttemptedSync.current) {
      hasAttemptedSync.current = true;

      // Attempt to log in to the custom backend using Google email
      useAuthStore.getState().googleLogin(session.user.email).then((success) => {
        if (success) {
          const { user } = useAuthStore.getState();
          router.push(user?.role === "worker" ? "/worker" : "/");
        } else {
          // Not registered — sign them out of NextAuth and redirect to login
          signOut({ redirect: false }).then(() => router.push("/login"));
        }
      });
    }

    // Reset the guard if user logs out so Google sync works again on next login
    if (status === "unauthenticated") {
      hasAttemptedSync.current = false;
    }
  }, [status, session?.user?.email, isAuthenticated, pathname]); // Only stable primitives in deps

  return null;
}
