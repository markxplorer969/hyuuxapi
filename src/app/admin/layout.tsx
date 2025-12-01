'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Combined loading state
  const isLoading = authLoading || (!user && authLoading === false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No user and not loading, redirecting to login');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // Check admin access
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated, checking role:', user.role);
      if (user.role !== 'admin') {
        console.log('User is not admin, redirecting');
        router.push('/'); // Redirect to home instead of login
        return;
      }
      console.log('User is admin, access granted');
    }
  }, [user, authLoading, router]);

  // Show loading while authenticating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // If user exists but not admin, show access denied (though redirect should happen)
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/')} 
              className="w-full"
              variant="outline"
            >
              Back to Home
            </Button>
            <Button 
              onClick={logout} 
              className="w-full"
              variant="destructive"
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
      active: typeof window !== 'undefined' && window.location.pathname === '/admin'
    },
    {
      href: '/admin/users',
      icon: Users,
      label: 'Users',
      active: typeof window !== 'undefined' && window.location.pathname === '/admin/users'
    },
    {
      href: '/admin/api-keys',
      icon: Key,
      label: 'API Keys',
      active: typeof window !== 'undefined' && window.location.pathname === '/admin/api-keys'
    },
    {
      href: '/admin/settings',
      icon: Settings,
      label: 'Settings',
      active: typeof window !== 'undefined' && window.location.pathname === '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-slate-400 text-sm">Slowly API</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Admin'} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.displayName || 'Admin User'}</p>
                <p className="text-slate-400 text-sm truncate">{user?.email}</p>
                <Badge variant="secondary" className="mt-1 bg-blue-600 text-white text-xs">
                  {user?.role || 'admin'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    item.active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="min-h-screen bg-slate-50">
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}