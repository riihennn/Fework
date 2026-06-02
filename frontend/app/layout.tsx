import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SessionRestorer from "@/components/shared/SessionRestorer";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import GoogleAuthSync from "@/components/shared/GoogleAuthSync";
import NotificationListener from "@/components/shared/NotificationListener";

export const metadata: Metadata = {
  title: "Fework | Premium Service Network",
  description: "Precision Home Services on Demand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <QueryProvider>
            <SessionRestorer />
            <GoogleAuthSync />
            <NotificationListener />
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
