'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, FileText, Shield, Brain, Wrench, LayoutDashboard, MessageCircle, ExternalLink } from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  external?: boolean;
}

function SidebarItem({ href, icon, children, external = false }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href);

  const LinkComponent = external ? 'a' : Link;
  const linkProps = external 
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href };

  return (
    <LinkComponent
      {...linkProps}
      className={`
        flex items-center gap-3 px-4 py-2 text-sm transition-colors
        ${isActive 
          ? 'text-white bg-[#212121] border-l-2 border-white' 
          : 'text-gray-400 hover:text-white hover:bg-[#212121]/50'
        }
      `}
    >
      {icon}
      <span>{children}</span>
      {external && <ExternalLink className="w-3 h-3 ml-auto" />}
    </LinkComponent>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-64 w-64 bg-[#181818] border-r border-[#2E2E2E] z-50">
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-6 border-b border-[#2E2E2E]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#212121] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Slowly API</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section 1: Get Started */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Get Started</h3>
            <div className="space-y-1">
              <SidebarItem href="/docs" icon={<Home className="w-4 h-4" />}>
                Introduction
              </SidebarItem>
              <SidebarItem href="/docs/auth" icon={<Shield className="w-4 h-4" />}>
                Authentication
              </SidebarItem>
              <SidebarItem href="/docs/errors" icon={<LayoutDashboard className="w-4 h-4" />}>
                Errors
              </SidebarItem>
            </div>
          </div>

          {/* Section 2: Category */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</h3>
            <div className="space-y-1">
              <SidebarItem href="/docs/social" icon={<MessageCircle className="w-4 h-4" />}>
                Social Media
              </SidebarItem>
              <SidebarItem href="/docs/ai" icon={<Brain className="w-4 h-4" />}>
                Artificial Intelligence
              </SidebarItem>
              <SidebarItem href="/docs/tools" icon={<Wrench className="w-4 h-4" />}>
                Tools
              </SidebarItem>
            </div>
          </div>

          {/* Section 3: Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Links</h3>
            <div className="space-y-1">
              <SidebarItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                Dashboard
              </SidebarItem>
              <SidebarItem 
                href="https://t.me/slowlyapi" 
                icon={<MessageCircle className="w-4 h-4" />}
                external={true}
              >
                Support
              </SidebarItem>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}