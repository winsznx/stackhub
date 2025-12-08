import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StacksHub | The Bitcoin Superapp",
  description: "Chat, trade, and launch tokens on Stacks. Fully on-chain and encrypted.",
  manifest: "/manifest.json",
};

import { SiteHeader } from "@/components/site-header";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { Toaster } from "@/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <RealtimeProvider>
          <SiteHeader />
          {children}
          <Toaster />
        </RealtimeProvider>
      </body>
    </html>
  );
}
