'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase Admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createVendorAction(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const location = formData.get('location') as string;
  const contact_email = formData.get('contact_email') as string;
  const login_email = formData.get('login_email') as string;
  const profile_image = formData.get('profile_image') as string;

  const languagesRaw = formData.get('languages') as string;
  const portfolioRaw = formData.get('portfolio') as string;

  const languages = languagesRaw ? JSON.parse(languagesRaw) : [];
  const portfolio = portfolioRaw ? JSON.parse(portfolioRaw) : [];

  if (!name || !category || !login_email) {
    return { success: false, error: 'Name, Category, and Login Email are required.' };
  }

  try {
    // 1. Try to create the user
    let userId: string;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: login_email,
      password: crypto.randomUUID(),
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        // If user exists, find their ID
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existing = existingUsers.users.find(u => u.email === login_email);
        if (existing) {
          userId = existing.id;
        } else {
          throw new Error('User already registered but could not retrieve ID.');
        }
      } else {
        throw new Error(`Failed to create user: ${authError.message}`);
      }
    } else if (authData.user) {
      userId = authData.user.id;
    } else {
      throw new Error('Failed to create user: No user returned');
    }

    // 2. Generate a setup/recovery link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: login_email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/setup-password`,
      },
    });

    if (linkError) {
      throw new Error(`Failed to generate setup link: ${linkError.message}`);
    }

    const actionLink = linkData.properties.action_link;

    // 3. Upsert into the vendors table to handle re-runs smoothly
    const { error: dbError } = await supabaseAdmin.from('vendors').upsert({
      id: userId,
      name,
      category,
      location,
      languages,
      contact_email,
      profile_image,
      portfolio,
    });

    if (dbError) {
      throw new Error(`Failed to insert vendor profile: ${dbError.message}`);
    }

    // 3. Dispatch email via Resend
    await resend.emails.send({
      from: 'spytLabs <onboarding@mail.spytlabs.com>', // Use verified domain in production
      to: login_email,
      subject: 'Welcome! Setup Your Vendor Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the Platform, ${name}!</h2>
          <p>We've created a vendor account for you. Please click the button below to set up your password and access your dashboard.</p>
          <a href="${actionLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
            Set up my account
          </a>
        </div>
      `,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Vendor creation error:', error);
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: msg };
  }
}
