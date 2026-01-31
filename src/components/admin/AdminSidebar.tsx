'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  HelpCircle,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Inquiries',
    href: '/admin/inquiries',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    label: 'Threads',
    href: '/admin/threads',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'FAQ Management',
    href: '/admin/faq',
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

interface AdminSidebarProps {
  userEmail?: string | null;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo & Notification */}
      <div className="p-6 border-b border-[var(--color-gray-200)]">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary-600)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg text-[var(--foreground)]">Carib Admin</span>
          </Link>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              isActive(item.href)
                ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/20 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-medium'
                : 'text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-200)] hover:text-[var(--color-gray-900)] dark:hover:text-[var(--foreground)]'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[var(--color-gray-200)]">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-[var(--color-gray-200)] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[var(--color-gray-600)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {userEmail || 'Admin'}
            </p>
            <p className="text-xs text-[var(--color-gray-500)]">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[var(--color-gray-600)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white dark:bg-[var(--color-gray-100)] border-r border-[var(--color-gray-200)]">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-[var(--color-gray-100)] rounded-lg shadow-[var(--shadow-2)] text-[var(--color-gray-600)]"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[var(--color-gray-100)] border-r border-[var(--color-gray-200)] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)]"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </motion.aside>
    </>
  );
}
