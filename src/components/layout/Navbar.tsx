/**
/components/layout/Navbar.tsx
*/
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Docs', href: '/docs' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Status', href: '/status' },

  // NEW
  { name: 'Contact', href: '/contact' },
  { name: 'Terms', href: '/terms' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border/50"
            : "bg-transparent border-b-0"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Slowly API
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center space-x-8">

              <div className="flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* AUTH BUTTONS */}
              <div className="flex items-center space-x-3">

                {/* THEME TOGGLE */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-9 w-9"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                {loading ? (
                  <div className="w-16 h-9 bg-muted animate-pulse rounded-lg" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {user.displayName || user.email}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/api-keys')}>
                        API Keys
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        Profile
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={handleLogout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                      Login
                    </Button>

                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => router.push('/login')}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* MOBILE NAV */}
            <div className="md:hidden flex items-center space-x-2">
              
              {/* MOBILE THEME TOGGLE */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-[300px]">

                  <div className="mt-8 flex flex-col space-y-4">

                    {/* MOBILE NAV LINKS */}
                    <div className="flex flex-col space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "px-4 py-3 rounded-lg text-sm font-medium",
                            pathname === item.href
                              ? "text-blue-600 dark:text-blue-400 bg-accent/50"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t pt-6 space-y-3">

                      {user ? (
                        <>
                          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/api-keys')}>API Keys</Button>
                          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/profile')}>Profile</Button>

                          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/login')}>Login</Button>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => router.push('/login')}>
                            Get Started
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
}