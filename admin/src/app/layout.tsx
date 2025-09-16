// Resources
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Components
import { SessionProvider } from "next-auth/react";
import { Grid } from "@/components/View";

// Types
import type { Metadata, Viewport } from "next";

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
  generator: "Inticate",
  applicationName: "Inticate",
  title: {
    template: "%s | Agent Dashboard",
    default: "Agent Dashboard",
  },
  description:
    "Professional live chat application. Level up your customer service platform and provide your users the customer service they deserve.",
  keywords: ["live chat", "crm", "customer service", "dashboard"],
};

// Viewport
export const viewport: Viewport = {
  themeColor: "#121212",
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
