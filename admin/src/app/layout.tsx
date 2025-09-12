// Resources
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Components
import { SessionProvider } from "next-auth/react";
import { Grid } from "@/components/View";

// Types
import type { Metadata } from "next";

// Variables
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Metadata
export const metadata: Metadata = {
  title: {
    template: "%s | Agent Dashboard",
    default: "Agent Dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <Grid className="flex justify-center items-center">{children}</Grid>
        </SessionProvider>
      </body>
    </html>
  );
}
