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

  const { data: unavailableSlotsData } = await supabase
    .from('vendor_unavailable_slots')
    .select('id, date, start_time, end_time')
    .eq('vendor_id', user.id)
    .order('date', { ascending: true });

  const { data: reviewsData } = await supabase
    .from('vendor_reviews')
    .select('*')
    .eq('vendor_id', user.id)
    .order('review_date', { ascending: false });

  return (
    <VendorDashboardClient 
      vendor={vendorData as Vendor} 
      unavailableSlots={unavailableSlotsData || []} 
      initialReviews={reviewsData || []}
    />
  );
}
