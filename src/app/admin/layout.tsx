'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Key,
  Settings,
  Shield,
  AlertTriangle,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Combined loading state
  const isLoading = authLoading || (!user && authLoading === false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Check admin access
  useEffect(() => {
    if (user && !authLoading && user.role !== 'admin') {
      router.push('/'); // Redirect non-admins to home
    }
  }, [user, authLoading, router]);

  // Show loading while authenticating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Checking admin access…</p>
        </div>
      </div>
    );
  }

  // If user exists but not admin, show access denied (fallback)
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Access denied</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You don&apos;t have permission to access the admin dashboard.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Back to home
            </Button>
            <Button
              onClick={logout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      href: '/admin/users',
      icon: Users,
      label: 'Users',
    },
    {
      href: '/admin/api-keys',
      icon: Key,
      label: 'API Keys',
    },
    {
      href: '/admin/settings',
      icon: Settings,
      label: 'Settings',
    },
  ].map((item) => ({
    ...item,
    active: pathname === item.href,
  }));

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col',
          'fixed left-0 top-16 z-30 h-[calc(100vh-64px)] w-64 border-r border-border bg-card',
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Admin
              </p>
              <p className="text-sm font-semibold">Control panel</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarImage
                src={user?.photoURL || ''}
                alt={user?.displayName || 'Admin'}
              />
              <AvatarFallback>
                {user?.displayName?.charAt(0) ||
                  user?.email?.charAt(0) ||
                  'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium truncate">
                {user?.displayName || 'Admin user'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
              <Badge
                variant="outline"
                className="h-5 border-primary/30 text-[11px] text-primary"
              >
                {user?.role?.toUpperCase() || 'ADMIN'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                item.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar (slide-over) */}
      <aside
        className={cn(
          'lg:hidden',
          'fixed left-0 top-16 z-50 h-[calc(100vh-80px)] w-72 max-w-[80vw]',
          'rounded-r-2xl border-r border-border bg-card shadow-xl',
          'transform transition-transform duration-200 ease-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-[110%]',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Admin
                </p>
                <p className="text-sm font-semibold">Control panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage
                  src={user?.photoURL || ''}
                  alt={user?.displayName || 'Admin'}
                />
                <AvatarFallback>
                  {user?.displayName?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium truncate">
                  {user?.displayName || 'Admin user'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                <Badge
                  variant="outline"
                  className="h-5 border-primary/30 text-[11px] text-primary"
                >
                  {user?.role?.toUpperCase() || 'ADMIN'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border/60">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pt-20 lg:pl-64">
        {/* Mobile toggle button (floating) */}
        <div className="fixed bottom-6 right-4 z-40 lg:hidden">
          <Button
            variant="default"
            size="icon"
            className="h-11 w-11 rounded-full shadow-lg"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
