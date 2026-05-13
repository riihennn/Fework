import type { Metadata } from "next";
import "./globals.css";
import SessionRestorer from "@/components/shared/SessionRestorer";
import QueryProvider from "@/components/providers/QueryProvider";

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
      <body className="antialiased">
        <QueryProvider>
          <SessionRestorer />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
