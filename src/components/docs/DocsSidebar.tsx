'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FolderOpen, 
  Folder, 
  FileText, 
  Shield, 
  FileJson, 
  MessageSquare, 
  Image,
  Video,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';

interface TreeNodeProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  indent?: number;
}

function TreeNode({ href, icon, children, isActive = false, indent = 0 }: TreeNodeProps) {
  return (
    <Link href={href} className="block">
      <div className={`
        flex items-center gap-2 px-2 py-1 text-sm transition-colors rounded
        ${isActive 
          ? 'bg-[#212121] text-white border-l-2 border-blue-400' 
          : 'text-gray-500 hover:text-white hover:bg-[#212121]/50'
        }
      `}
        style={{ paddingLeft: `${indent * 16}px` }}
      >
        {icon}
        <span className="flex-1">{children}</span>
        <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
      </div>
    </Link>
  );
}

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 bg-[#181818] border-r border-[#2E2E2E] flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#2E2E2E]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#212121] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Slowly API</span>
        </Link>
      </div>

      {/* Close Button (Mobile Only) */}
      <button className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white p-1">
        <X className="w-4 h-4" />
      </button>

      {/* File Tree */}
      <nav className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">EXPLORER</h3>
        
        {/* Getting Started Folder */}
        <div className="mb-4">
          <TreeNode href="/docs" icon={<FolderOpen className="w-4 h-4" />}>
            getting-started
          </TreeNode>
          <TreeNode 
            href="/docs" 
            icon={<FileText className="w-4 h-4" />}
            isActive={pathname === '/docs'}
            indent={1}
          >
            introduction.md
          </TreeNode>
          <TreeNode 
            href="/docs/auth" 
            icon={<Shield className="w-4 h-4" />}
            isActive={pathname.startsWith('/docs/auth')}
            indent={1}
          >
            authentication.md
          </TreeNode>
          <TreeNode 
            href="/docs/errors" 
            icon={<FileJson className="w-4 h-4" />}
            isActive={pathname.startsWith('/docs/errors')}
            indent={1}
          >
            errors.json
          </TreeNode>
        </div>

        {/* Social Media Folder */}
        <div className="mb-4">
          <TreeNode href="/docs/social" icon={<FolderOpen className="w-4 h-4" />}>
            social-media
          </TreeNode>
          <TreeNode 
            href="/docs/social/tiktok" 
            icon={<Video className="w-4 h-4" />}
            isActive={pathname.startsWith('/docs/social/tiktok')}
            indent={1}
          >
            tiktok-dl.ts
          </TreeNode>
          <TreeNode 
            href="/docs/social/instagram" 
            icon={<Image className="w-4 h-4" />}
            isActive={pathname.startsWith('/docs/social/instagram')}
            indent={1}
          >
            instagram.ts
          </TreeNode>
        </div>

        {/* AI Folder */}
        <div className="mb-4">
          <TreeNode href="/docs/ai" icon={<FolderOpen className="w-4 h-4" />}>
            artificial-intelligence
          </TreeNode>
          <TreeNode 
            href="/docs/ai/generate" 
            icon={<FileText className="w-4 h-4" />}
            isActive={pathname.startsWith('/docs/ai/generate')}
            indent={1}
          >
            generate.ts
          </TreeNode>
          <TreeNode 
            href="/docs/ai/chat" 
            icon={<MessageSquare className="w-4 h-4" />}
            isActive={pathname.startsWith('/docs/ai/chat')}
            indent={1}
          >
            chat.ts
          </TreeNode>
        </div>

        {/* Tools Folder */}
        <div className="mb-4">
          <TreeNode href="/docs/tools" icon={<FolderOpen className="w-4 h-4" />}>
            tools
          </TreeNode>
          <TreeNode 
            href="/docs/tools/ssweb" 
            icon={<FileText className="w-4 h-4" />}
            isActive={pathname.startsWith('/docs/tools/ssweb')}
            indent={1}
          >
            ssweb.ts
          </TreeNode>
        </div>

        {/* External Links */}
        <div className="mt-6 pt-4 border-t border-[#2E2E2E]">
          <TreeNode 
            href="/dashboard" 
            icon={<FileText className="w-4 h-4" />}
            isActive={pathname === '/dashboard'}
          >
            dashboard.tsx
          </TreeNode>
          <a 
            href="https://t.me/buildwithslowly" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1 text-sm text-gray-500 hover:text-white hover:bg-[#212121]/50 rounded transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="flex-1">support.link</span>
          </a>
        </div>
      </nav>
    </aside>
  );
}