'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

import { type EmailOtpType } from '@supabase/supabase-js';

export function SetupPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if there is a session already
    supabase.auth.getSession();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Extract token_hash and type from URL parameters
      const params = new URLSearchParams(window.location.search);
      const token_hash = params.get('token_hash');
      const type = params.get('type') as EmailOtpType;

      if (token_hash && type) {
        // Exchange the token hash for a session
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (verifyError) {
          throw new Error(`Link is invalid or has expired: ${verifyError.message}`);
        }
        
        // Remove token_hash from URL so it's not reused
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Fallback: check if the user is already authenticated (e.g. from a hash or previous session)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required. Please use the link sent to your email.');
        }
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMsg('Password setup successfully! Redirecting...');
      
      // Redirect to vendor dashboard after a short delay
      setTimeout(() => {
        router.push('/vendor/dashboard');
      }, 1500);

    } catch (err: unknown) {
      console.error('Password setup error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to set up password. Please try again or request a new link.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border mt-10">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Set up your password</h2>
        <p className="text-sm text-muted-foreground">Please create a strong password for your vendor account.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || !!successMsg}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading || !!successMsg}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || !!successMsg}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Password'
        )}
      </Button>
    </form>
  );
}
