import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavigationBar from "@/components/NavigationBar";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Footer from "@/components/Footer";
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
  title: "Markets Compass",
  description: "Track major market indices and commodities in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}
      >
        <NavigationBar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
