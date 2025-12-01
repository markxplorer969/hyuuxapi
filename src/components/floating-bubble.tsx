'use client';

import { useState } from 'react';
import { MoreHorizontal, ArrowUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function FloatingBubble() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const goToStatus = () => {
    window.location.href = '/status';
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 md:bottom-6 md:left-6">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full bg-green-500 hover:bg-green-600",
              "text-white shadow-lg hover:scale-110 transition-all duration-200",
              "border-0 focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-48 p-0 mb-2" 
          align="start" 
          side="top"
          sideOffset={8}
        >
          <div className="flex flex-col">
            <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3 rounded-none hover:bg-accent"
              onClick={scrollToTop}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Scroll to Top
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3 rounded-none hover:bg-accent"
              onClick={goToStatus}
            >
              <Activity className="mr-2 h-4 w-4" />
              Status
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}