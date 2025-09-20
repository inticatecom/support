// Resources
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Components
import { Grid } from "@/components/View";
import Providers from "./providers";

// Definitions
import type { Metadata, Viewport } from "next";
import { Children } from "@/lib/definitions";

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

/**
 * The root layout for the entire applications. Renders providers and the main view.
 */
export default function RootLayout({ children }: Children) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Grid className="flex justify-center items-center">{children}</Grid>
        </Providers>
      </body>
    </html>
  );
}
