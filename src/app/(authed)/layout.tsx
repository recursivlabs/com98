'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TopBar } from '@/components/chrome/TopBar';
import { Sidebar } from '@/components/chrome/Sidebar';

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, sdk, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/sign-in');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted animate-pulse">
          AUTHENTICATING SIGNAL...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onMenuClick={() => setMenuOpen(true)} />
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar overlay */}
        {menuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-bg/80 z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <div
          className={`fixed md:static inset-y-0 left-0 z-40 transition-transform md:translate-x-0 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar sdk={sdk} onSignOut={handleSignOut} onClose={() => setMenuOpen(false)} />
        </div>
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-bg">{children}</main>
      </div>
    </div>
  );
}
