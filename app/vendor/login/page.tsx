'use client';

import { useActionState } from 'react';
import { loginVendor } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function VendorLoginPage() {
  const [state, formAction, isPending] = useActionState(loginVendor, null);

  return (
    <main className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F6F1', color: '#0F172A', fontFamily: '"Work Sans", sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@400;500;600;700&display=swap');
        .brand-heading { font-family: 'Fraunces', serif; }
      `}} />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-medium brand-heading" style={{ color: '#0F172A' }}>
          Vendor Portal
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: '#1B2740' }}>
          Sign in to access your bookings and profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border" style={{ backgroundColor: '#fff', borderColor: 'rgba(15,23,42,0.12)' }}>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                {state.error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: '#0F172A', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                required 
                placeholder="you@example.com"
                disabled={isPending}
                className="border-[rgba(15,23,42,0.12)] focus-visible:ring-[#B8730A]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: '#0F172A', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                disabled={isPending}
                className="border-[rgba(15,23,42,0.12)] focus-visible:ring-[#B8730A]"
              />
            </div>

            <Button type="submit" className="w-full text-[#0F172A] font-bold hover:bg-[#F5A929] transition-colors" style={{ backgroundColor: '#E8960C' }} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
