import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CustomThemeProvider from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Slowly API - Modern API Service",
  description: "Powerful RESTful API with AI integration, media downloaders, random content generators, and image processing tools. Built for developers who need reliable and fast API services.",
  keywords: ["API", "RESTful", "AI", "Media Download", "Image Processing", "Next.js", "TypeScript"],
  authors: [{ name: "Slowly API Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Slowly API - Modern API Service",
    description: "Powerful RESTful API with AI integration, media downloaders, and more",
    url: "https://slowly-api.vercel.app",
    siteName: "Slowly API",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slowly API - Modern API Service",
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
      <head>
        {/* Google Fonts - Space Grotesk */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Y+9+C9ZHVnUz/ICbED+EnSrz3a6PogvF1fY="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        className="font-sans bg-[#181818] text-gray-200 antialiased"
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif"
        }}
      >
        <CustomThemeProvider>
          <AuthProvider>
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