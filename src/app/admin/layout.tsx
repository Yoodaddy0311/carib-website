'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check for admin claim
        const idTokenResult = await currentUser.getIdTokenResult();
        const hasAdminClaim = idTokenResult.claims.admin === true;

        if (hasAdminClaim) {
          setUser(currentUser);
          setIsAdmin(true);
          // If on login page and authenticated, redirect to dashboard
          if (pathname === '/admin/login') {
            router.push('/admin');
          }
        } else {
          // User doesn't have admin claim
          setUser(null);
          setIsAdmin(false);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        // Redirect to login if not on login page
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-gray-50)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
          <p className="text-[var(--color-gray-500)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Login page doesn't need sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Protected pages - show sidebar layout
  if (!user || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)]">
      <AdminSidebar userEmail={user.email} />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
