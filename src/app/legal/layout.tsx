'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const legalNavItems = [
  { href: '/legal/privacy', label: '개인정보처리방침' },
  { href: '/legal/terms', label: '이용약관' },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)]">
      <div className="container-custom py-12 md:py-16 lg:py-20">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-gray-600)] hover:text-[var(--color-primary-600)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-body-2">홈으로 돌아가기</span>
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="lg:sticky lg:top-24">
              <h2 className="text-caption font-semibold text-[var(--color-gray-500)] uppercase tracking-wider mb-4">
                법적 고지
              </h2>
              <ul className="space-y-2">
                {legalNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-2 rounded-lg text-body-2 transition-colors ${
                        pathname === item.href
                          ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-medium'
                          : 'text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-900)]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-gray-200)] p-6 md:p-10 lg:p-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
