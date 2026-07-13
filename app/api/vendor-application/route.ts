import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { name, phone, talentType } = await request.json();

    if (!name || !phone || !talentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!resendApiKey || !adminEmail) {
      console.error('RESEND_API_KEY or ADMIN_EMAIL is not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: 'Vendor Application <onboarding@mail.spytlabs.com>',
      to: adminEmail,
      subject: `New Vendor Application: ${name}`,
      text: `A new vendor has applied to join the platform.\n\nName: ${name}\nPhone: ${phone}\nTalent Type: ${talentType}`,
      html: `
        <h2>New Vendor Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Talent Type:</strong> ${talentType}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
