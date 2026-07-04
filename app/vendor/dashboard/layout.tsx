import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/vendor/login');
  }

  // Optionally verify that this user is actually a vendor by checking the vendors table
  const { data: vendorData, error: vendorError } = await supabase
    .from('vendors')
    .select('id, name')
    .eq('id', user.id)
    .single();

  if (vendorError || !vendorData) {
    // Not a valid vendor profile
    redirect('/vendor/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vendor Portal</h1>
          <p className="text-sm text-gray-500">Welcome back, {vendorData.name}</p>
        </div>
        <form action={async () => {
          'use server';
          const supabaseAuth = await createClient();
          await supabaseAuth.auth.signOut();
          redirect('/vendor/login');
        }}>
          <Button variant="ghost" type="submit" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </header>
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
