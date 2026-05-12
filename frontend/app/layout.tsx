import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionRestorer from "@/components/SessionRestorer";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <QueryProvider>
          <SessionRestorer />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
