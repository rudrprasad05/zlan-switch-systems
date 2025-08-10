import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Switchboard Dashboard",
  description:
    "Monitor real-time electrical metrics like current, voltage, and power using the Switchboard Dashboard. Built for performance, reliability, and visibility.",
  keywords: [
    "switchboard dashboard",
    "energy monitoring",
    "current monitoring",
    "voltage dashboard",
    "real-time energy data",
    "iot dashboard",
    "power tracking",
    "electrical metrics",
    "switchboard ui",
    "react energy dashboard",
  ],
  authors: [{ name: "Switchboard Dev Team", url: "https://yourdomain.com" }],
  creator: "Switchboard System",
  openGraph: {
    title: "Switchboard Dashboard",
    description:
      "Visualize electrical data in real-time. Switchboard Dashboard lets you track power, current, voltage, and more with intuitive charts.",
    url: "https://yourdomain.com",
    siteName: "Switchboard Dashboard",
    images: [
      {
        url: "https://yourdomain.com/og-switchboard.jpg",
        width: 1200,
        height: 630,
        alt: "Switchboard Dashboard - Real-Time Energy Monitoring",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Switchboard Dashboard",
    description:
      "Track and analyze real-time electrical data including current, voltage, and power. Clean UI built for technicians and engineers.",
    images: ["https://yourdomain.com/twitter-switchboard.jpg"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // ✅ default to dark
          enableSystem={false} // ❌ don't follow OS preference
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
