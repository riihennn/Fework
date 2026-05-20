import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * FEWORK ROUTE GUARD (NEXT.JS 16 PROXY CONVENTION)
 *
 * Four user types with completely separate territories:
 *
 * GUEST (no token)
 *   ✅ /               (homepage)
 *   ✅ /findservices    (public list)
 *   ✅ /login, /signup
 *   ❌ everything else → /login
 *
 * CLIENT (role = "client")
 *   ✅ /               (homepage)
 *   ✅ /findservices/*  (search + profiles)
 *   ✅ /my-bookings
 *   ❌ /worker/* /admin/* → /
 *   ❌ /login, /signup → /
 *
 * WORKER (role = "worker")
 *   ✅ /worker/*       (dashboard, jobs, etc.)
 *   ❌ everything else → /worker
 *
 * ADMIN (role = "admin")
 *   ✅ /admin/*        (admin dashboard)
 *   ❌ everything else → /admin
 */

// Routes workers are allowed to visit
const WORKER_ALLOWED = ["/worker"];

// Routes guests are allowed to visit without a token
const GUEST_ALLOWED = ["/", "/findservices", "/login", "/signup"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("user_role")?.value;
  const { pathname } = request.nextUrl;

  // ── Always allow NextAuth internals (session, callbacks, CSRF, etc.) ──
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ── ADMIN: locked to /admin/* ────────────────────────────────
  if (userRole === "admin") {
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // ── WORKER: locked to /worker/* ──────────────────────────────
  if (userRole === "worker") {
    const isAllowed = WORKER_ALLOWED.some(r => pathname.startsWith(r));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/worker", request.url));
    }
    return NextResponse.next();
  }

  // ── CLIENT: locked to client territory ──────────────────────
  if (userRole === "client") {
    // Block from worker/admin territory
    if (pathname.startsWith("/worker") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Block from login/signup (already authenticated)
    if (pathname === "/login" || pathname.startsWith("/signup")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── GUEST: limited public access ────────────────────────────
  const isGuestAllowed =
    pathname === "/" ||
    pathname === "/findservices" ||
    pathname === "/login" ||
    pathname.startsWith("/signup");

  if (!isGuestAllowed) {
    // Guests hitting any other route go to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
