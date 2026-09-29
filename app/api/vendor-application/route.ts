import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { name, category, whatsapp, email, city, languages, startingRate } = await request.json();

    if (!name || !whatsapp || !email) {
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
      from: `Vendor Application <${process.env.RESEND_FROM_EMAIL}>`,
      to: adminEmail,
      subject: `New Vendor Application: ${name}${category ? ` (${category})` : ''}`,
      text: `A new vendor has applied to join the platform. This vendor request comes from the Musician website.\n\nName: ${name}\nCategory: ${category || 'N/A'}\nWhatsApp: ${whatsapp}\nEmail: ${email}\nCity: ${city || 'N/A'}${languages ? `\nLanguages: ${languages}` : ''}\nStarting Rate: ${startingRate || 'N/A'}`,
      html: `
        <h2>New Vendor Application</h2>
        <p><em>This vendor request comes from the Musician website.</em></p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Category:</strong> ${category || 'N/A'}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>City/Area:</strong> ${city || 'N/A'}</p>
        ${languages ? `<p><strong>Languages:</strong> ${languages}</p>` : ''}
        <p><strong>Starting Rate per Event:</strong> ${startingRate || 'N/A'}</p>
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
