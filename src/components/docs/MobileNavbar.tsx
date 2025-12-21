'use client';

import { Menu, Send } from 'lucide-react';

interface MobileNavbarProps {
  onOpen: () => void;
}

export default function MobileNavbar({ onOpen }: MobileNavbarProps) {
  return (
    <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#2E2E2E] bg-[#181818] px-4 md:hidden">
      {/* Left Side: Hamburger + Brand */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpen} 
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Open Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <span className="font-bold text-white text-lg tracking-tight">
          #BuildWithSlowly
        </span>
      </div>

      {/* Right Side: Action Icon */}
      <a 
        href="https://t.me/buildwithslowly" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Send className="h-5 w-5" />
      </a>
    </div>
  );
}