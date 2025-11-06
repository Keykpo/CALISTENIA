"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token') || '';
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function validate() {
      if (!token) {
        setValid(false);
        return;
      }
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        setValid(!!data.valid);
      } catch (_e) {
        setValid(false);
      }
    }
    validate();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
      } else {
        setSuccess('Password reset successfully. Redirecting to sign in...');
        setTimeout(() => router.push('/auth/signin'), 2000);
      }
    } catch (_e) {
      setError('Unexpected error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter a new password to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {valid === false && (
            <div className="text-red-600 mb-4">Invalid or expired reset link.</div>
          )}

          {valid && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-700 text-sm">{success}</div>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}