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
    <div className="min-h-screen flex flex-col" style={{ 
      backgroundColor: '#F8F6F1', 
      color: '#0F172A',
      fontFamily: '"Work Sans", sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@400;500;600;700&display=swap');
        .vendor-heading { font-family: 'Fraunces', serif; }
      `}} />
      <header className="px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#EFEAE0', borderBottom: '1px solid rgba(15,23,42,0.12)' }}>
        <div>
          <h1 className="text-2xl font-medium vendor-heading" style={{ color: '#0F172A' }}>Vendor Portal</h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#1B2740' }}>Welcome back, {vendorData.name}</p>
        </div>
        <form action={async () => {
          'use server';
          const supabaseAuth = await createClient();
          await supabaseAuth.auth.signOut();
          redirect('/vendor/login');
        }}>
          <Button variant="ghost" type="submit" size="sm" className="hover:bg-[rgba(15,23,42,0.08)] font-semibold text-[#0F172A]">
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
