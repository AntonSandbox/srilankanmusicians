'use server';

import { createClient } from '@/lib/supabase-server';
import { format } from 'date-fns';

export async function updateVendorProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const location = formData.get('location') as string;
  const contact_email = formData.get('contact_email') as string;
  const schedule_url = formData.get('schedule_url') as string;
  const languagesRaw = formData.get('languages') as string;

  const languages = languagesRaw.split(',').map(l => l.trim()).filter(Boolean);

  const { error } = await supabase
    .from('vendors')
    .update({
      location,
      contact_email,
      schedule_url,
      languages
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: 'Profile updated successfully' };
}

export async function toggleBlockedDate(date: Date, isBlocked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const formattedDate = format(date, 'yyyy-MM-dd');

  if (isBlocked) {
    // Unblock the date (DELETE)
    const { error } = await supabase
      .from('vendor_blocked_dates')
      .delete()
      .eq('vendor_id', user.id)
      .eq('blocked_date', formattedDate);
    
    if (error) return { error: error.message };
  } else {
    // Block the date (INSERT)
    const { error } = await supabase
      .from('vendor_blocked_dates')
      .insert({
        vendor_id: user.id,
        blocked_date: formattedDate
      });
      
    if (error) return { error: error.message };
  }
  
  return { success: true };
}
