import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eventra | Campus Event Operations & Zero-Trust Check-in",
  description: "Eventra - Enterprise Zero-Trust Campus Event Registration, Dynamic Verification and Check-in Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full bg-[#0B0F19] text-[#F8FAFC] antialiased selection:bg-blue-600/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
