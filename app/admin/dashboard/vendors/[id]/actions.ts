'use server';

import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function adminUpdateVendorProfile(vendorId: string, prevState: unknown, formData: FormData) {
  const location = formData.get('location') as string;
  const category = formData.get('category') as string;
  const budget_range = formData.get('budget_range') as string;
  const contact_email = formData.get('contact_email') as string;
  const schedule_url = formData.get('schedule_url') as string;
  const video_url = formData.get('video_url') as string;
  const bio = formData.get('bio') as string;
  const languagesRaw = formData.get('languages') as string;
  const occasionsRaw = formData.get('occasions') as string;

  const languages = languagesRaw ? JSON.parse(languagesRaw) : [];
  const occasions = occasionsRaw ? JSON.parse(occasionsRaw) : [];

  if (video_url && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.*$/.test(video_url)) {
    return { error: 'Invalid YouTube URL submitted.' };
  }

  const { error } = await supabaseAdmin
    .from('vendors')
    .update({
      category,
      location,
      budget_range,
      occasions,
      languages,
      contact_email,
      schedule_url,
      video_url,
      bio
    })
    .eq('id', vendorId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/dashboard/vendors/${vendorId}`);
  return { success: 'Profile updated successfully' };
}

export async function adminAddAvailableRange(vendorId: string, from: Date, to: Date) {
  const start_date = format(from, 'yyyy-MM-dd');
  const end_date = format(to, 'yyyy-MM-dd');

  const { error } = await supabaseAdmin
    .from('vendor_available_ranges')
    .insert({
      vendor_id: vendorId,
      start_date,
      end_date
    });
    
  if (error) return { error: error.message };
  revalidatePath(`/admin/dashboard/vendors/${vendorId}`);
  return { success: true };
}

export async function adminDeleteAvailableRange(id: string) {
  const { error } = await supabaseAdmin
    .from('vendor_available_ranges')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function adminAddVendorReview(vendorId: string, prevState: unknown, formData: FormData) {
  const reviewer_name = formData.get('reviewer_name') as string;
  const review_text = formData.get('review_text') as string;
  const review_date_raw = formData.get('review_date') as string;

  if (!reviewer_name || !review_text || !review_date_raw) {
    return { error: 'Missing required fields' };
  }

  const review_date = format(new Date(review_date_raw), 'yyyy-MM-dd');

  const { error } = await supabaseAdmin
    .from('vendor_reviews')
    .insert({
      vendor_id: vendorId,
      reviewer_name,
      review_text,
      review_date
    });

  if (error) return { error: error.message };
  
  revalidatePath(`/admin/dashboard/vendors/${vendorId}`);
  return { success: 'Review added successfully' };
}

export async function adminDeleteVendorReview(id: string) {
  const { error } = await supabaseAdmin
    .from('vendor_reviews')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  
  return { success: true };
}
