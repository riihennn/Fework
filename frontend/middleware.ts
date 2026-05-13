import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that are strictly for workers (Client -> Home)
const workerOnlyRoutes = ["/worker"];

// Routes that are strictly for clients (Worker -> Dashboard)
const clientOnlyRoutes = ["/my-bookings"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("user_role")?.value;
  const { pathname } = request.nextUrl;

  // 1. Determine if the route is protected
  // /my-bookings, /worker, and /findservices/[id] (but NOT /findservices itself)
  const isProtected = 
    pathname.startsWith("/my-bookings") || 
    pathname.startsWith("/worker") || 
    (pathname.startsWith("/findservices/") && pathname !== "/findservices");

  // If trying to access a protected route without a token -> Login
  if (isProtected && !token) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // 2. If logged in as worker, but trying to access client-only routes
  if (userRole === "worker") {
    const isClientOnly = clientOnlyRoutes.some(route => pathname.startsWith(route));
    if (isClientOnly) {
      // Redirect worker to their dashboard
      return NextResponse.redirect(new URL("/worker", request.url));
    }
  }

  // 3. If logged in as client, but trying to access worker-only routes
  if (userRole === "client") {
    const isWorkerOnly = workerOnlyRoutes.some(route => pathname.startsWith(route));
    if (isWorkerOnly) {
      // Redirect client to homepage
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 4. If logged in and trying to access login/signup -> Redirect based on role
  if (token && (pathname === "/login" || pathname === "/signup")) {
    const dest = userRole === "worker" ? "/worker" : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/worker/:path*",
    "/findservices/:path*",
    "/my-bookings/:path*",
    "/login",
    "/signup",
  ],
};
