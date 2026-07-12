'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getVendorsList() {
  try {
    // Fetch all vendors
    const { data: vendors, error: vendorsError } = await supabaseAdmin.from('vendors').select('*').order('name');
    if (vendorsError) throw new Error(vendorsError.message);

    // Fetch all users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw new Error(authError.message);

    const users = authData.users;

    // Combine the data
    const vendorsList = vendors.map((vendor) => {
      const user = users.find((u) => u.id === vendor.id);
      return {
        ...vendor,
        login_email: user?.email || '',
        last_sign_in_at: user?.last_sign_in_at || null,
        created_at: user?.created_at || vendor.created_at,
        has_setup_password: user?.last_sign_in_at != null || (user?.updated_at && user.updated_at !== user.created_at)
      };
    });

    return { success: true, vendors: vendorsList };
  } catch (error: unknown) {
    console.error('Error fetching vendors list:', error);
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: msg };
  }
}

export async function sendSetupLink(vendorId: string, email: string, name: string) {
  try {
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (linkError) throw new Error(linkError.message);

    const hashedToken = linkData.properties.hashed_token;
    const actionLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/setup-password?token_hash=${hashedToken}&type=recovery`;

    await resend.emails.send({
      from: 'spytLabs <onboarding@mail.spytlabs.com>',
      to: email,
      subject: 'Welcome! Setup Your Vendor Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the Platform, ${name}!</h2>
          <p>Please click the button below to set up your password and access your dashboard.</p>
          <a href="${actionLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
            Set up my account
          </a>
        </div>
      `,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error sending setup link:', error);
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: msg };
  }
}

export async function sendForgotPasswordLink(email: string) {
  try {
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (linkError) throw new Error(linkError.message);

    const hashedToken = linkData.properties.hashed_token;
    const actionLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/setup-password?token_hash=${hashedToken}&type=recovery`;

    await resend.emails.send({
      from: 'spytLabs <onboarding@mail.spytlabs.com>',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Please click the button below to set a new password.</p>
          <a href="${actionLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
            Reset Password
          </a>
        </div>
      `,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Error sending forgot password link:', error);
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: msg };
  }
}
