import type { Metadata } from "next";
import "./globals.css";
import SessionRestorer from "@/components/shared/SessionRestorer";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import GoogleAuthSync from "@/components/shared/GoogleAuthSync";
import NotificationListener from "@/components/shared/NotificationListener";

export const metadata: Metadata = {
  title: "Fework | Hyperlocal Service Marketplace",
  description: "Precision Home Services on Demand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
