'use server';

import { createClient } from '@/lib/supabase-server';

export async function getVendorReviews(vendorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_reviews')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('review_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch vendor reviews:', error);
    return [];
  }

  return data;
}
