import './home-new.css';
import { Suspense } from 'react';
import { SearchForm } from '@/components/search-form';
import { VendorCard, Vendor } from '@/components/vendor-card';
import { VendorGrid } from '@/components/vendor-grid';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Find Your Perfect Wedding Vendor',
  description: 'Search for available florists, DJs, and cake designers for your special day.',
};

export default async function PublicSearchPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;

  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const location = typeof searchParams.location === 'string' ? searchParams.location : undefined;

  // language can be string or string[]
  let languages: string[] | undefined = undefined;
  if (Array.isArray(searchParams.language)) {
    languages = searchParams.language;
  } else if (typeof searchParams.language === 'string') {
    languages = [searchParams.language];
  }

  const date = typeof searchParams.date === 'string' ? searchParams.date : undefined;
  const occasion = typeof searchParams.occasion === 'string' ? searchParams.occasion : undefined;
  const budget = typeof searchParams.budget === 'string' ? searchParams.budget : undefined;

  const hasSearchParams = category || location || (languages && languages.length > 0) || date || occasion || budget;

  let vendors: Vendor[] = [];
  let fetchError = null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() { },
      },
    }
  );

  const { count: totalProfessionals } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true });

  if (hasSearchParams) {

    const args = {
      p_category: category || null,
      p_location: location || null,
      p_languages: languages || null,
      p_date: date || null,
      p_occasion: occasion || null,
      p_budget: budget || null
    };

    const { data, error } = await supabase.rpc('search_available_vendors', args);

    if (error) {
      console.error('Error fetching vendors:', error);
      fetchError = error;
    } else if (data) {
      vendors = data as Vendor[];

      if (vendors.length > 0) {
        const vendorIds = vendors.map(v => v.id);

        const { data: ranges, error: rangesError } = await supabase
          .from('vendor_available_ranges')
          .select('vendor_id, start_date, end_date')
          .in('vendor_id', vendorIds);

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('vendor_reviews')
          .select('*')
          .in('vendor_id', vendorIds);

        if (reviewsError) {
          console.error("Error fetching vendor reviews:", reviewsError);
        }

        vendors = vendors.map(v => {
          const vRanges = ranges && !rangesError ? ranges.filter(r => r.vendor_id === v.id) : [];
          const vReviews = reviewsData && !reviewsError ? reviewsData.filter(r => r.vendor_id === v.id) : [];

          return {
            ...v,
            availabilityRanges: vRanges,
            review_count: vReviews.length
          };
        });
      }
    }
  }

  // Cloudflare Images uses an Account Hash for delivery, not the API Account ID
  const cloudflareAccountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'olsA5w0GxmMpS1hyYoBOrg';

  return (
    <div className="new-home">
      <header id="siteHeader">
        <div className="wrap">
          <nav>
            <a href="/" className="logo">Sri Lankan <span>Event Portal</span></a>
            <div className='flex gap-5'>
              <a href="#explore" className="nav-cta">Become a vendor</a>
              <a href="/vendor/login" className="nav-cta">Vendor Login</a>
            </div>


          </nav>

        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="eyebrow">Sri Lanka's Event Talent, All in One Place</div>
          <h1>Search Talent for your Event</h1>

          <Suspense fallback={<div style={{ height: '300px', background: 'var(--cream)', borderRadius: '6px' }}></div>}>
            <SearchForm />
          </Suspense>
        </div>
      </section>

      {hasSearchParams && (
        <section className="search-results" style={{ padding: '60px 0 20px', background: 'var(--cream)' }}>
          <div className="wrap">
            {fetchError ? (
              <div className="text-center py-12 text-red-500 bg-red-50 rounded-2xl">
                <p>Oops! Something went wrong while searching. Please try again.</p>
              </div>
            ) : vendors.length === 0 ? (
              <div className="empty-state">
                <p>No vendors found matching your criteria.</p>
                <a href="/" className="empty-cta">Clear Filters</a>
              </div>
            ) : (
              <>
                <div className="section-eyebrow" style={{ marginBottom: '8px' }}>Search Results</div>
                <h2 style={{ marginBottom: '32px' }}>Available Talent for Your Event</h2>
                <VendorGrid vendors={vendors} cloudflareAccountHash={cloudflareAccountHash} totalProfessionals={totalProfessionals || 542} />
              </>
            )}
          </div>
        </section>
      )}

      <section className="promise">
        <div className="wrap">
          <h2>Free to search. <em>Vendors you can trust.</em></h2>
          <ul className="benefits-list">
            <li><span className="check">✓</span> No charge to you, ever — searching, browsing and checking availability is completely free</li>
            <li><span className="check">✓</span> Every vendor on this platform is screened before being listed</li>
            <li><span className="check">✓</span> Once you find someone available, you'll speak with them directly to confirm details, pricing and next steps</li>
            <li><span className="check">✓</span> We handle the discovery — you handle the conversation</li>
          </ul>
        </div>
      </section>

      <section className="profiles" id="profiles">
        <div className="wrap">
          <div className="section-eyebrow">Browse talent</div>
          <h2>Every category, ready to book.</h2>

          <div className="category-block">
            <div className="category-head"><h3>Emcees &amp; Comperes</h3><a className="view-more" href="https://srilankanmc.com">View all Emcees &amp; Comperes →</a></div>
            <div className="profile-grid">
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">RJ</div><h4>R. Jayawardena</h4><p>Colombo · 6 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">NF</div><h4>N. Fernando</h4><p>Kandy · 4 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">SW</div><h4>S. Wickramasinghe</h4><p>Galle · 8 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">DP</div><h4>D. Perera</h4><p>Negombo · 3 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">AR</div><h4>A. Rajapaksa</h4><p>Colombo · 10 yrs</p></div>
            </div>
          </div>

          <div className="category-block">
            <div className="category-head"><h3>Bands</h3><a className="view-more" href="https://srilankanband.com">View all Bands →</a></div>
            <div className="profile-grid">
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">EC</div><h4>Echo Collective</h4><p>Colombo · 6 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">CS</div><h4>The Cinnamon Sound</h4><p>Kandy · 9 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">IR</div><h4>Island Rhythm Band</h4><p>Galle · 5 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">VN</div><h4>Velvet Note</h4><p>Negombo · 3 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">SS</div><h4>Southern Strings</h4><p>Matara · 7 yrs</p></div>
            </div>
          </div>

          <div className="category-block">
            <div className="category-head"><h3>DJs</h3><a className="view-more" href="https://srilankandj.com">View all DJs →</a></div>
            <div className="profile-grid">
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">DK</div><h4>DJ Kavi</h4><p>Colombo · 5 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">DN</div><h4>DJ Nethmi</h4><p>Kandy · 4 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">DR</div><h4>DJ Rashen</h4><p>Galle · 6 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">DI</div><h4>DJ Imesha</h4><p>Negombo · 3 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">DT</div><h4>DJ Tharu</h4><p>Colombo · 8 yrs</p></div>
            </div>
          </div>

          <div className="category-block">
            <div className="category-head"><h3>Makeup Artists</h3><a className="view-more" href="https://srilankanmua.com">View all Makeup Artists →</a></div>
            <div className="profile-grid">
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">MS</div><h4>M. Silva</h4><p>Colombo · 7 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">TG</div><h4>T. Gunasekara</h4><p>Kandy · 5 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">PD</div><h4>P. Dias</h4><p>Galle · 4 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">KA</div><h4>K. Abeywardena</h4><p>Negombo · 6 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">RS</div><h4>R. Senanayake</h4><p>Colombo · 9 yrs</p></div>
            </div>
          </div>

          <div className="category-block">
            <div className="category-head"><h3>Cake Artists</h3><a className="view-more" href="https://srilankancakeartist.com">View all Cake Artists →</a></div>
            <div className="profile-grid">
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">SL</div><h4>Sweet Layers by Amaya</h4><p>Colombo · 6 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">KC</div><h4>Kandy Cake House</h4><p>Kandy · 8 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">SS</div><h4>Sugar &amp; Spice Studio</h4><p>Galle · 4 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">CA</div><h4>The Cake Atelier</h4><p>Negombo · 5 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">BB</div><h4>Blossom Bakes</h4><p>Colombo · 3 yrs</p></div>
            </div>
          </div>

          <div className="category-block">
            <div className="category-head"><h3>Photographers</h3><a className="view-more" href="https://srilankanphotographer.com">View all Photographers →</a></div>
            <div className="profile-grid">
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">JR</div><h4>J. Ranasinghe</h4><p>Colombo · 7 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">LW</div><h4>L. Wijesuriya</h4><p>Kandy · 5 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">HF</div><h4>H. Fonseka</h4><p>Galle · 6 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">CB</div><h4>C. Bandara</h4><p>Negombo · 4 yrs</p></div>
              <div className="profile-card"><div className="sample-tag">Sample</div><div className="profile-avatar">TW</div><h4>T. Weerasinghe</h4><p>Colombo · 9 yrs</p></div>
            </div>
          </div>

        </div>
      </section>

      <section className="explore" id="explore">
        <div className="wrap">
          <div className="section-eyebrow">Explore by talent</div>
          <h2>Every category has its own home — and its own community.</h2>
          <div className="explore-grid">
            <a className="explore-card" href="https://srilankanmc.com">
              <div className="tag">Emcees &amp; Comperes</div>
              <h3>Book an Emcee or Compere in Sri Lanka</h3>
              <p>Search and book verified emcees and comperes for any occasion.</p>
              <span className="link-arrow">Visit Sri Lankan Emcee →</span>
            </a>
            <a className="explore-card" href="https://srilankanband.com">
              <div className="tag">Bands</div>
              <h3>Book a Live Band in Sri Lanka</h3>
              <p>Search and book live bands for weddings, corporate events and celebrations.</p>
              <span className="link-arrow">Visit Sri Lankan Band →</span>
            </a>
            <a className="explore-card" href="https://srilankandj.com">
              <div className="tag">DJs</div>
              <h3>Book a DJ in Sri Lanka</h3>
              <p>Search and book DJs for any event, from intimate gatherings to large celebrations.</p>
              <span className="link-arrow">Visit Sri Lankan DJ →</span>
            </a>
            <a className="explore-card" href="https://srilankanmua.com">
              <div className="tag">Makeup Artists</div>
              <h3>Book a Makeup Artist in Sri Lanka</h3>
              <p>Search and book bridal and event makeup artists across the island.</p>
              <span className="link-arrow">Visit Sri Lankan MUA →</span>
            </a>
            <a className="explore-card" href="https://srilankancakeartist.com">
              <div className="tag">Cake Artists</div>
              <h3>Book a Cake Artist in Sri Lanka</h3>
              <p>Search and book cake artists for weddings and celebrations of any size.</p>
              <span className="link-arrow">Visit Sri Lankan Cake Artist →</span>
            </a>
            <a className="explore-card" href="https://srilankanphotographer.com">
              <div className="tag">Photographers</div>
              <h3>Book a Photographer in Sri Lanka</h3>
              <p>Search and book event and wedding photographers, local and diaspora-friendly.</p>
              <span className="link-arrow">Visit Sri Lankan Photographer →</span>
            </a>
          </div>
        </div>
      </section>

      <section className="mentors">
        <div className="wrap">
          <div className="section-eyebrow">Ambassadors</div>
          <h2>Hear from Our Mentors</h2>
          <div className="mentor-grid">
            <div className="mentor-card">
              <div className="video-box"><div className="play-btn" role="button" aria-label="Play Emcee mentor video"></div><div className="video-caption">Emcee / Compere</div></div>
              <div className="mentor-body"><div className="mentor-cat">Emcees &amp; Comperes</div><div className="mentor-name">Vijaya Corea</div></div>
            </div>
            <div className="mentor-card">
              <div className="video-box"><div className="play-btn" role="button" aria-label="Play Band mentor video"></div><div className="video-caption">Band</div></div>
              <div className="mentor-body"><div className="mentor-cat">Bands</div><div className="mentor-name">Ambassador to be announced</div></div>
            </div>
            <div className="mentor-card">
              <div className="video-box"><div className="play-btn" role="button" aria-label="Play DJ mentor video"></div><div className="video-caption">DJ</div></div>
              <div className="mentor-body"><div className="mentor-cat">DJs</div><div className="mentor-name">Ambassador to be announced</div></div>
            </div>
            <div className="mentor-card">
              <div className="video-box"><div className="play-btn" role="button" aria-label="Play Makeup Artist mentor video"></div><div className="video-caption">Makeup Artist</div></div>
              <div className="mentor-body"><div className="mentor-cat">Makeup Artists</div><div className="mentor-name">Ambassador to be announced</div></div>
            </div>
            <div className="mentor-card">
              <div className="video-box"><div className="play-btn" role="button" aria-label="Play Cake Artist mentor video"></div><div className="video-caption">Cake Artist</div></div>
              <div className="mentor-body"><div className="mentor-cat">Cake Artists</div><div className="mentor-name">Ambassador to be announced</div></div>
            </div>
            <div className="mentor-card">
              <div className="video-box"><div className="play-btn" role="button" aria-label="Play Photographer mentor video"></div><div className="video-caption">Photographer</div></div>
              <div className="mentor-body"><div className="mentor-cat">Photographers</div><div className="mentor-name">Ambassador to be announced</div></div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>Powered by MentSpire</span>
            <span style={{ borderLeft: '1px solid rgba(248,246,241,0.25)', paddingLeft: '20px' }}>Also part of <a href="https://lankanweddingportal.com">Sri Lankan Wedding Portal</a></span>
          </div>
          <div className="foot-socials">
            <a href="https://instagram.com" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2c2.7 0 3.05.01 4.12.06 1.07.05 1.8.22 2.44.47.66.26 1.22.6 1.77 1.16.55.55.9 1.11 1.16 1.77.25.63.42 1.37.47 2.44.05 1.07.06 1.42.06 4.12s-.01 3.05-.06 4.12c-.05 1.07-.22 1.8-.47 2.44a4.9 4.9 0 01-1.16 1.77 4.9 4.9 0 01-1.77 1.16c-.63.25-1.37.42-2.44.47-1.07.05-1.42.06-4.12.06s-3.05-.01-4.12-.06c-1.07-.05-1.8-.22-2.44-.47a4.9 4.9 0 01-1.77-1.16 4.9 4.9 0 01-1.16-1.77c-.25-.63-.42-1.37-.47-2.44C2.01 15.05 2 14.7 2 12s.01-3.05.06-4.12c.05-1.07.22-1.8.47-2.44.26-.66.6-1.22 1.16-1.77a4.9 4.9 0 011.77-1.16c.63-.25 1.37-.42 2.44-.47C8.95 2.01 9.3 2 12 2zm0 3.6A6.4 6.4 0 1012 18.4 6.4 6.4 0 0012 5.6zm0 10.57a4.17 4.17 0 110-8.34 4.17 4.17 0 010 8.34zm6.65-10.82a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
            </a>
            <a href="https://facebook.com" aria-label="Facebook">
              <svg viewBox="0 0 24 24"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8.1V13h2.7v8h2.7z" /></svg>
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M6.94 5a2 2 0 11-4-.02 2 2 0 014 .02zM3.3 8.75h3.6V21H3.3V8.75zm6.3 0h3.45v1.68h.05c.48-.9 1.66-1.85 3.42-1.85 3.66 0 4.33 2.4 4.33 5.53V21h-3.6v-6.2c0-1.48-.03-3.38-2.06-3.38-2.07 0-2.39 1.6-2.39 3.27V21H9.6V8.75z" /></svg>
            </a>
            <a href="https://tiktok.com" aria-label="TikTok">
              <svg viewBox="0 0 24 24"><path d="M16.6 3c.3 1.9 1.6 3.3 3.5 3.5v2.6c-1.3 0-2.5-.4-3.5-1.1v6.4a5.6 5.6 0 11-5.6-5.6c.2 0 .4 0 .6.03v2.7a2.9 2.9 0 102.4 2.87V3h2.6z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
