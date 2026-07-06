import { createClient } from '@/lib/supabase-server';
import { VendorDashboardClient } from './VendorDashboardClient';
import { Vendor } from '@/components/vendor-card';

export const metadata = {
  title: 'Vendor Dashboard',
};

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Should be caught by layout.tsx, but just in case
    return null; 
  }

  const { data: vendorData } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: availableRangesData } = await supabase
    .from('vendor_available_ranges')
    .select('id, start_date, end_date')
    .eq('vendor_id', user.id)
    .order('start_date', { ascending: true });

  return (
    <VendorDashboardClient 
      vendor={vendorData as Vendor} 
      availableRanges={availableRangesData || []} 
    />
  );
}
