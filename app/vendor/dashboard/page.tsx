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

  const { data: blockedDatesData } = await supabase
    .from('vendor_blocked_dates')
    .select('blocked_date')
    .eq('vendor_id', user.id);

  const blockedDates = (blockedDatesData || []).map(row => {
    // blocked_date comes back as 'YYYY-MM-DD', convert to local Date object
    const [year, month, day] = row.blocked_date.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  });

  return (
    <VendorDashboardClient 
      vendor={vendorData as Vendor} 
      blockedDates={blockedDates} 
    />
  );
}
