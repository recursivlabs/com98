'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/primitives/Input';
import { Label } from '@/components/primitives/Label';

export default function SignInPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/');
  }, [isAuthenticated, isLoading, router]);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendOtp(email.trim());
      setStep('otp');
    } catch (err: any) {
      setError(err?.message || 'Could not send code.');
    } finally {
      setBusy(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyOtp(email.trim(), otp.trim());
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Could not verify code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-3">
          <div className="font-bold text-accent text-5xl tracking-[0.18em]">COM98</div>
          <Label className="text-muted">SIGNAL ACQUIRED. AUTH REQUIRED.</Label>
        </div>

        <div className="border border-hairline bg-surface p-6 space-y-5">
          {step === 'email' ? (
            <form onSubmit={onRequest} className="space-y-4">
              <div className="space-y-2">
                <Label>EMAIL</Label>
                <Input
                  type="email"
                  required
                  placeholder="you@com98.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" loading={busy} className="w-full">
                REQUEST CODE
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div className="space-y-2">
                <Label>SIX DIGIT CODE</Label>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                  className="text-center text-2xl tracking-[0.4em]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError(null);
                  }}
                  className="text-[10px] uppercase tracking-[0.16em] text-muted hover:text-text"
                >
                  ← USE DIFFERENT EMAIL
                </button>
              </div>
              <Button type="submit" loading={busy} className="w-full">
                VERIFY
              </Button>
            </form>
          )}

          {error && (
            <div className="text-live text-xs font-mono border border-live/30 bg-live/5 p-3">
              {error}
            </div>
          )}
        </div>

        <div className="text-center">
          <Label className="text-muted">INVITE ONLY · CONTACT JACK FOR ACCESS</Label>
        </div>
      </div>
    </div>
  );
}
