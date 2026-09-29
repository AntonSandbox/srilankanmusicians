import { Vendor } from '@/components/vendor-card';
import { VendorGrid } from '@/components/vendor-grid';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function SearchResultsList({
  searchParams,
  cloudflareAccountHash,
  totalProfessionals
}: {
  searchParams: { [key: string]: string | string[] | undefined },
  cloudflareAccountHash: string,
  totalProfessionals: number
}) {
  const category = typeof searchParams.category === 'string' && searchParams.category !== 'none' ? searchParams.category : undefined;
  const location = typeof searchParams.location === 'string' && searchParams.location !== 'none' ? searchParams.location : undefined;



  const date = typeof searchParams.date === 'string' ? searchParams.date : undefined;
  const occasion = typeof searchParams.occasion === 'string' && searchParams.occasion !== 'none' ? searchParams.occasion : undefined;
  const budget = typeof searchParams.budget === 'string' && searchParams.budget !== 'none' ? searchParams.budget : undefined;
  const name = typeof searchParams.name === 'string' ? searchParams.name : undefined;


  let vendors: Vendor[] = [];
  let fetchError = null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() { },
      },
    }
  );

  const args = {
    p_category: category || null,
    p_location: location || null,
    p_languages: null,
    p_date: date || null,
    p_occasion: occasion || null,
    p_budget: budget || null,
    p_name: name || null
  };

  const { data, error } = await supabase.rpc('search_available_vendors', args);

  if (error) {
    console.error('Error fetching vendors:', error);
    fetchError = error;
  } else if (data) {
    vendors = data as Vendor[];

    if (process.env.NODE_ENV !== 'development') {
      vendors = vendors.filter(v => (v as any).contact_email !== 'tharushamjayasooriya@gmail.com');
    }

    if (vendors.length > 0) {
      const vendorIds = vendors.map(v => v.id);

      const { data: slots, error: slotsError } = await supabase
        .from('vendor_unavailable_slots')
        .select('vendor_id, date, start_time, end_time')
        .in('vendor_id', vendorIds);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('vendor_reviews')
        .select('*')
        .in('vendor_id', vendorIds);

      if (reviewsError) {
        console.error("Error fetching vendor reviews:", reviewsError);
      }

      vendors = vendors.map(v => {
        const vSlots = slots && !slotsError ? slots.filter(r => r.vendor_id === v.id) : [];
        const vReviews = reviewsData && !reviewsError ? reviewsData.filter(r => r.vendor_id === v.id) : [];

        return {
          ...v,
          unavailableSlots: vSlots,
          review_count: vReviews.length
        };
      });
    }
  }

  if (fetchError) {
    return (
      <div className="text-center py-12 text-red-500 bg-red-50 rounded-2xl">
        <p>Oops! Something went wrong while searching. Please try again.</p>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="empty-state">
        <p>No vendors found matching your criteria.</p>
        <a href="/" className="empty-cta">Clear Filters</a>
      </div>
    );
  }

  return (
    <>
      <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Search Results</div>
      <h2 style={{ marginBottom: '32px' }}>
        {category ? `Available ${category}${category.endsWith('s') ? '' : 's'} for Your Event` : 'Available Talent for Your Event'}
      </h2>
      <VendorGrid vendors={vendors} cloudflareAccountHash={cloudflareAccountHash} totalProfessionals={totalProfessionals || 542} />
    </>
  );
}

export function VendorGridSkeleton() {
  return (
    <>
      <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Search Results</div>
      <h2 style={{ marginBottom: '32px' }}>Available Talent for Your Event</h2>
      <div className="vendors-hd in animate-pulse">
        <div className="vhd-left">
          <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        <div className="vhd-sort">
          <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
      <div className="vgrid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="vcard in animate-pulse" style={{ height: '400px' }}>
            <div className="vc-top h-48 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="vc-body space-y-3 p-4">
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
