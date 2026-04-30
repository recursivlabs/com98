import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { AuthProvider } from '@/lib/auth';
import { ScanlineOverlay } from '@/components/chrome/ScanlineOverlay';
import './globals.css';

export const metadata: Metadata = {
  title: 'COM98',
  description: 'The brain behind the operation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-bg text-text font-sans antialiased min-h-screen">
        <AuthProvider>
          {children}
          <ScanlineOverlay />
        </AuthProvider>
      </body>
    </html>
  );
}
