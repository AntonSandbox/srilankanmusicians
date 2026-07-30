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

export async function getVendorsByCategory(category: string, page: number, limit: number = 12) {
  const supabase = await createClient();
  const from = page * limit;
  const to = from + limit - 1;
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, category, location, profile_image')
    .eq('category', category)
    .range(from, to);

  if (error) {
    console.error('Failed to fetch vendors by category:', error);
    return [];
  }
  return data;
}

export async function getFullVendorDetails(vendorId: string) {
  const supabase = await createClient();
  const [{ data: vendor }, { data: slots }] = await Promise.all([
    supabase.from('vendors').select('*').eq('id', vendorId).single(),
    supabase.from('vendor_unavailable_slots').select('date, start_time, end_time').eq('vendor_id', vendorId)
  ]);
  
  if (!vendor) return null;
  return { ...vendor, unavailableSlots: slots || [] };
}
