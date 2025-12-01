import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CustomThemeProvider from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hyuux API - Modern API Service",
  description: "Powerful RESTful API with AI integration, media downloaders, random content generators, and image processing tools. Built for developers who need reliable and fast API services.",
  keywords: ["API", "RESTful", "AI", "Media Download", "Image Processing", "Next.js", "TypeScript"],
  authors: [{ name: "Hyyux API Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Hyyux API - Modern API Service",
    description: "Powerful RESTful API with AI integration, media downloaders, and more",
    url: "https://hyuuxapi.vercel.app",
    siteName: "Hyyux API",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyyux API - Modern API Service",
    description: "Powerful RESTful API with AI integration, media downloaders, and more",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <CustomThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster />
          </AuthProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
