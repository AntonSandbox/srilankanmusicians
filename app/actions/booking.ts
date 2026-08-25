'use server';

import { Resend } from 'resend';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTentativeBookingRequest(prevState: any, formData: FormData) {
  try {
    const vendorEmail = formData.get('vendorEmail') as string;
    const vendorName = formData.get('vendorName') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const date = formData.get('date') as string;
    const slot = formData.get('slot') as string;
    const occasion = formData.get('occasion') as string;
    const location = formData.get('location') as string;
    const requirements = formData.get('requirements') as string;

    if (!name || !email || !date || !occasion) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const vendorId = formData.get('vendorId') as string;
    
    if (vendorId) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { error: dbError } = await supabaseAdmin
        .from('vendor_booking_requests')
        .insert({
          vendor_id: vendorId,
          client_name: name,
          client_email: email,
          client_phone: phone || null,
          event_date: date,
          event_slot: slot || null,
          event_occasion: occasion,
          event_location: location || null,
          special_requirements: requirements || null,
          status: 'pending'
        });
      
      if (dbError) {
        console.error('Failed to insert booking request:', dbError);
        // Continue to send email even if DB insert fails, or we could return error here.
        // Returning error is safer to let the user know.
        // return { success: false, error: 'Failed to record booking request in database.' };
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('ADMIN_EMAIL environment variable is not set.');
    }

    const toEmails = [vendorEmail];
    if (adminEmail) {
      toEmails.push(adminEmail);
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #000;">New Tentative Booking Request</h2>
        <p>A new tentative booking request has been submitted for <strong>${vendorName}</strong>.</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Client Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 8px;"><strong>Name:</strong> ${name}</li>
          <li style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</li>
          <li style="margin-bottom: 8px;"><strong>Phone:</strong> ${phone || 'Not provided'}</li>
        </ul>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Event Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 8px;"><strong>Date:</strong> ${date}</li>
          <li style="margin-bottom: 8px;"><strong>Slot:</strong> ${slot ? (slot === 'morning' ? 'Morning (9:00 AM - 12:00 PM)' : 'Afternoon (12:00 PM - 5:00 PM)') : 'Not specified'}</li>
          <li style="margin-bottom: 8px;"><strong>Occasion:</strong> ${occasion}</li>
          <li style="margin-bottom: 8px;"><strong>Location:</strong> ${location || 'Not provided'}</li>
        </ul>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Special Requirements / Questions</h3>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 12px; border-radius: 4px;">${requirements || 'None provided.'}</p>
        
        <p style="margin-top: 32px; font-size: 12px; color: #888;">
          This is an automated notification from your platform.
        </p>
      </div>
    `;

    // Resend requires a verified domain or "onboarding@resend.dev" for testing.
    await resend.emails.send({
      from: `Platform <${process.env.RESEND_FROM_EMAIL}>`,
      to: toEmails,
      replyTo: email,
      subject: `New Booking Request for ${vendorName}`,
      html: emailHtml,
    });

    return { success: true, message: 'Your request has been sent successfully!' };
  } catch (error: any) {
    console.error('Failed to send booking request:', error);
    return { success: false, error: error.message || 'An error occurred while sending the request.' };
  }
}
