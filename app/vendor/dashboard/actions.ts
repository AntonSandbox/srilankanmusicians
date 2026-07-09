'use server';

import { createClient } from '@/lib/supabase-server';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export async function updateVendorProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const location = formData.get('location') as string;
  const category = formData.get('category') as string;
  const budget_range = formData.get('budget_range') as string;
  const contact_email = formData.get('contact_email') as string;
  const schedule_url = formData.get('schedule_url') as string;
  const languagesRaw = formData.get('languages') as string;
  const occasionsRaw = formData.get('occasions') as string;

  const languages = languagesRaw ? JSON.parse(languagesRaw) : [];
  const occasions = occasionsRaw ? JSON.parse(occasionsRaw) : [];

  const { error } = await supabase
    .from('vendors')
    .update({
      category,
      location,
      budget_range,
      occasions,
      languages,
      contact_email,
      schedule_url
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: 'Profile updated successfully' };
}

export async function addAvailableRange(from: Date, to: Date) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const start_date = format(from, 'yyyy-MM-dd');
  const end_date = format(to, 'yyyy-MM-dd');

  const { error } = await supabase
    .from('vendor_available_ranges')
    .insert({
      vendor_id: user.id,
      start_date,
      end_date
    });
    
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteAvailableRange(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('vendor_available_ranges')
    .delete()
    .eq('id', id)
    .eq('vendor_id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function addVendorReview(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const reviewer_name = formData.get('reviewer_name') as string;
  const review_text = formData.get('review_text') as string;
  const review_date_raw = formData.get('review_date') as string;

  if (!reviewer_name || !review_text || !review_date_raw) {
    return { error: 'Missing required fields' };
  }

  const review_date = format(new Date(review_date_raw), 'yyyy-MM-dd');

  const { error } = await supabase
    .from('vendor_reviews')
    .insert({
      vendor_id: user.id,
      reviewer_name,
      review_text,
      review_date
    });

  if (error) return { error: error.message };
  
  revalidatePath('/vendor/dashboard');
  return { success: 'Review added successfully' };
}

export async function deleteVendorReview(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('vendor_reviews')
    .delete()
    .eq('id', id)
    .eq('vendor_id', user.id);

  if (error) return { error: error.message };
  
  revalidatePath('/vendor/dashboard');
  return { success: true };
}
