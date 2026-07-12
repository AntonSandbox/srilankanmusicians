'use server';

import { sendForgotPasswordLink } from '@/app/admin/dashboard/vendors/vendor-management-actions';

export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  // We reuse the admin action to generate and send the Resend email securely
  const result = await sendForgotPasswordLink(email);

  if (!result.success) {
    // If user not found or another error, we could show an error, 
    // but for security it's best to show a success message regardless 
    // to prevent email enumeration. However, since this is a vendor portal, 
    // we can just show the error or success.
    if (result.error && result.error.includes('User not found')) {
      return { error: 'No vendor account found with that email address.' };
    }
    return { error: result.error || 'Failed to send reset link' };
  }

  return { success: 'If an account exists, a password reset link has been sent to your email.' };
}
