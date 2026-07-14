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
  const video_url = formData.get('video_url') as string;
  const bio = formData.get('bio') as string;
  const languagesRaw = formData.get('languages') as string;
  const occasionsRaw = formData.get('occasions') as string;

  const languages = languagesRaw ? JSON.parse(languagesRaw) : [];
  const occasions = occasionsRaw ? JSON.parse(occasionsRaw) : [];

  if (video_url && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.*$/.test(video_url)) {
    return { error: 'Invalid YouTube URL submitted.' };
  }

  const { error } = await supabase
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
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: 'Profile updated successfully' };
}

export async function saveAvailabilitySlot(date: Date, slot_morning: boolean, slot_afternoon: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const formattedDate = format(date, 'yyyy-MM-dd');

  // Check if slot exists
  const { data: existingSlot } = await supabase
    .from('vendor_availability_slots')
    .select('id')
    .eq('vendor_id', user.id)
    .eq('date', formattedDate)
    .single();

  if (existingSlot) {
    if (!slot_morning && !slot_afternoon) {
      // If both false, delete the slot
      const { error } = await supabase
        .from('vendor_availability_slots')
        .delete()
        .eq('id', existingSlot.id);
      if (error) return { error: error.message };
    } else {
      // Update
      const { error } = await supabase
        .from('vendor_availability_slots')
        .update({ slot_morning, slot_afternoon })
        .eq('id', existingSlot.id);
      if (error) return { error: error.message };
    }
  } else {
    if (slot_morning || slot_afternoon) {
      // Insert
      const { error } = await supabase
        .from('vendor_availability_slots')
        .insert({
          vendor_id: user.id,
          date: formattedDate,
          slot_morning,
          slot_afternoon
        });
      if (error) return { error: error.message };
    }
  }
  
  return { success: true };
}

export async function deleteAvailabilitySlot(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('vendor_availability_slots')
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
