'use client';

import { useState } from 'react';
import MobileNavbar from '@/components/docs/MobileNavbar'; // Note: Check if this path is correct
import DocsSidebar from '@/components/docs/DocsSidebar'; // Note: Check if this path is correct

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#181818] text-gray-200 font-sans">
      {/* 1. Mobile Navbar (Visible only on small screens) */}
      <div className="md:hidden">
        <MobileNavbar onOpen={() => setIsSidebarOpen(true)} />
      </div>

      {/* 2. Mobile Drawer Overlay (Only visible when Open) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#181818] border-r border-[#2E2E2E] transform transition-transform duration-300 ease-in-out">
            {/* Close Button */}
            <div className="flex justify-end p-4 border-b border-[#2E2E2E]">
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            {/* Sidebar Content */}
            <div className="h-full overflow-y-auto">
              <DocsSidebar />
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Sidebar (Strictly Hidden on Mobile) */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-64 z-30">
        <DocsSidebar />
      </div>

      {/* 4. Main Content Wrapper */}
      <main className="flex-1 md:pl-64 min-h-screen relative">
        {/* Terminal Breadcrumb Header (Desktop Only) */}
        <div className="hidden md:flex h-14 items-center px-8 border-b border-[#2E2E2E] bg-[#181818]/95 backdrop-blur sticky top-0 z-20">
          <span className="font-mono text-sm text-gray-500">
            root@slowly:~/docs<span className="animate-pulse">_</span>
          </span>
        </div>

        {/* Page Content */}
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}