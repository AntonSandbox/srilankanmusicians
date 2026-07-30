import { createClient } from '@supabase/supabase-js';
import { AdminEditVendorClient } from './AdminEditVendorClient';
import { UnavailableSlot, VendorReview } from '@/app/vendor/dashboard/VendorDashboardClient';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminEditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch vendor profile
  const { data: vendor, error: vendorError } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();

  if (vendorError || !vendor) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-md">
        Vendor not found or error loading vendor.
      </div>
    );
  }

  // 2. Fetch unavailable slots
  const { data: unavailableSlots, error: slotsError } = await supabaseAdmin
    .from('vendor_unavailable_slots')
    .select('*')
    .eq('vendor_id', id)
    .order('date', { ascending: true });

  // 3. Fetch initial reviews
  const { data: reviews, error: reviewsError } = await supabaseAdmin
    .from('vendor_reviews')
    .select('*')
    .eq('vendor_id', id)
    .order('review_date', { ascending: false });

  if (slotsError || reviewsError) {
    console.error('Error fetching vendor extra data:', { slotsError, reviewsError });
  }

  return (
    <div className="space-y-6">
      <AdminEditVendorClient 
        vendor={vendor}
        unavailableSlots={(unavailableSlots as UnavailableSlot[]) || []}
        initialReviews={(reviews as VendorReview[]) || []}
      />
    </div>
  );
}
