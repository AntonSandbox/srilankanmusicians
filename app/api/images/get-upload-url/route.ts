import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('wedding_admin_session');
  let isAuthorized = false;

  if (adminSession && adminSession.value === 'active') {
    isAuthorized = true;
  } else {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {
              // Read-only in this route
            },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        isAuthorized = true;
      }
    } catch (error) {
      console.error('Supabase auth check error:', error);
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!accountId || !apiToken) {
    console.error('Cloudflare credentials missing');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  try {
    const formData = new FormData();
    // Cloudflare requires requireSignedURLs for direct uploads optionally, we can omit it or set to false
    formData.append('requireSignedURLs', 'false');

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Cloudflare upload URL error:', response.status, errorData);
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      uploadURL: data.result.uploadURL,
      id: data.result.id,
    });
  } catch (error) {
    console.error('Error fetching direct upload URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
