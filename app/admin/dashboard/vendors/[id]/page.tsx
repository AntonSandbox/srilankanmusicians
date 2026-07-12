import { createClient } from '@supabase/supabase-js';
import { AdminEditVendorClient } from './AdminEditVendorClient';
import { AvailableRange, VendorReview } from '@/app/vendor/dashboard/VendorDashboardClient';

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

  // 2. Fetch available ranges
  const { data: availableRanges, error: rangesError } = await supabaseAdmin
    .from('vendor_available_ranges')
    .select('*')
    .eq('vendor_id', id)
    .order('start_date', { ascending: true });

  // 3. Fetch initial reviews
  const { data: reviews, error: reviewsError } = await supabaseAdmin
    .from('vendor_reviews')
    .select('*')
    .eq('vendor_id', id)
    .order('review_date', { ascending: false });

  if (rangesError || reviewsError) {
    console.error('Error fetching vendor extra data:', { rangesError, reviewsError });
  }

  return (
    <div className="space-y-6">
      <AdminEditVendorClient 
        vendor={vendor}
        availableRanges={(availableRanges as AvailableRange[]) || []}
        initialReviews={(reviews as VendorReview[]) || []}
      />
    </div>
  );
}
