import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import CustomThemeProvider from "@/components/theme-provider";
import Navbar from "@/components/layout/Navbar";
import { FloatingBubble } from "@/components/floating-bubble";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slowly API - Modern RESTful API Service",
  description: "Powerful RESTful API with AI integration, media downloaders, random content generators, and image processing tools.",
  keywords: ["API", "RESTful", "AI", "Downloader", "Random", "Tools", "Next.js", "TypeScript"],
  authors: [{ name: "Slowly" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Slowly API",
    description: "Modern RESTful API service providing AI integration, media tools, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slowly API",
    description: "Modern RESTful API service providing AI integration, media tools, and more.",
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <CustomThemeProvider>
            <Navbar />
            <main className="pt-20">
              {children}
            </main>
            <FloatingBubble />
            <Toaster />
          </CustomThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
