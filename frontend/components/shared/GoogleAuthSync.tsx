"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function GoogleAuthSync() {
  const { data: session, status } = useSession();
  const { isAuthenticated, googleLogin } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const hasAttemptedSync = useRef(false);

  useEffect(() => {
    const syncGoogleAuth = async () => {
      // Don't interfere with the signup registration flow — those pages handle Google themselves
      if (pathname.startsWith("/signup")) return;

      if (status === "authenticated" && session?.user?.email && !isAuthenticated && !hasAttemptedSync.current) {
        hasAttemptedSync.current = true;
        // Attempt to log in to the custom backend using Google email
        const success = await googleLogin(session.user.email);
        
        if (success) {
          // Redirect based on role after successful sync
          const { user } = useAuthStore.getState();
          if (user?.role === "worker") {
            router.push("/worker");
          } else {
            router.push("/");
          }
        } else {
          // If the user is not registered, sign them out of NextAuth so session is cleared and redirect to login
          await signOut({ redirect: false });
          router.push("/login");
        }
      }
    };

    syncGoogleAuth();
  }, [status, session, isAuthenticated, googleLogin, router, pathname]);

  return null;
}
