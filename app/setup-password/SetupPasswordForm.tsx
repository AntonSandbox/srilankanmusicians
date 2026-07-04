'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export function SetupPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Manually parse the hash to guarantee the session is established securely
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      
      if (access_token && refresh_token) {
        supabase.auth.setSession({
          access_token,
          refresh_token
        }).then(({ error }) => {
          if (error) console.error('Error setting session:', error);
        });
      }
    } else {
      // Fallback to force the browser client to check
      supabase.auth.getSession();
    }
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
      // Because the user arrived with an access_token in the URL hash,
      // they are authenticated for this action.
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
