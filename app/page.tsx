import './home-new.css';
import { Suspense } from 'react';
import { SearchForm } from '@/components/search-form';
import { VendorCard, Vendor } from '@/components/vendor-card';
import { VendorGrid } from '@/components/vendor-grid';
import { SearchResultsList, VendorGridSkeleton } from '@/components/search-results-list';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Sparkles, CircleDollarSign, ShieldCheck, MessageCircle, Video, MousePointer2, Percent, CalendarCheck, TrendingUp } from 'lucide-react';
import { SERVICES } from '@/lib/constants';
import { JoinForm } from '@/components/join-form';
import { Logo } from '@/components/ui/logo';

function getCategorySlug(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const metadata = {
  title: 'Search & Book Top Musicians in Sri Lanka | Sri Lankan Event Portal',
  description: 'Find and book the best Musicians in Sri Lanka. Search verified Musicians for your wedding or corporate event. 100% free to search.',
  openGraph: {
    title: 'Search & Book Top Musicians in Sri Lanka',
    description: 'Find and book the best Musicians in Sri Lanka. Search verified Musicians for your special day.',
    url: '/',
    siteName: 'Sri Lankan Event Portal',
    locale: 'en_LK',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
};

export default async function PublicSearchPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;

  const category = typeof searchParams.category === 'string' && searchParams.category !== 'none' ? searchParams.category : undefined;
  const location = typeof searchParams.location === 'string' && searchParams.location !== 'none' ? searchParams.location : undefined;



  const date = typeof searchParams.date === 'string' ? searchParams.date : undefined;
  const occasion = typeof searchParams.occasion === 'string' && searchParams.occasion !== 'none' ? searchParams.occasion : undefined;
  const budget = typeof searchParams.budget === 'string' && searchParams.budget !== 'none' ? searchParams.budget : undefined;

  const name = typeof searchParams.name === 'string' ? searchParams.name : undefined;

  const hasSearchParams = category || location || date || occasion || budget || name;

  // The search fetching has been moved to SearchResultsList

  // Cloudflare Images uses an Account Hash for delivery, not the API Account ID
  const cloudflareAccountHash = process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH || 'CXXrCUeORPaBgBA-OAR4aA';

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

  let countQuery = supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true });

  if (category) {
    countQuery = countQuery.eq('category', category);
  }

  if (process.env.NODE_ENV !== 'development') {
    countQuery = countQuery.neq('contact_email', 'tharushamjayasooriya@gmail.com');
  }

  const { count: totalProfessionals } = await countQuery;

  const categories = SERVICES[0].items;
  const categoryVendors = await Promise.all(
    categories.map(async (cat) => {
      let query = supabase
        .from('vendors')
        .select('id, name, category, location, profile_image')
        .eq('category', cat)
        .order('created_at', { ascending: false });

      if (process.env.NODE_ENV !== 'development') {
        query = query.neq('contact_email', 'tharushamjayasooriya@gmail.com');
      }

      const { data } = await query.limit(5);
      return { category: cat, vendors: (data as Vendor[]) || [] };
    })
  );

  return (
    <div className="new-home">
      <header id="siteHeader">
        <div className="wrap">
          <nav>
            <a href="/" className="logo" style={{ fontSize: '13px' }}>
              <Logo />
            </a>

            <input type="checkbox" id="mobile-menu-toggle" className="mobile-menu-toggle" />
            <label htmlFor="mobile-menu-toggle" className="mobile-menu-btn">
              <span></span>
              <span></span>
              <span></span>
            </label>

            <div className='nav-links flex gap-4'>
              <a href="https://srilankaneventportal.com/vendor/login" target="_blank" rel="noopener noreferrer" className="nav-btn-secondary">Musician LOGIN</a>
              <a href="#join-us" className="nav-btn-primary">BECOME A Musician</a>
            </div>
          </nav>

        </div>
      </header>

      <section className="hero">
        <video autoPlay loop muted playsInline className="hero-bg-video desktop-video">
          <source src="/musician-bg-mentspire.mp4" type="video/mp4" />
        </video>
        <video autoPlay loop muted playsInline className="hero-bg-video mobile-video">
          <source src="/musician-bg-mentspire.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>

        <div className="wrap">
          <div className="eyebrow">Sri Lanka's Top Musicians, All in One Place</div>
          <h1>Search Musicians<br />for your <span>Event</span></h1>

          <Suspense fallback={<div style={{ height: '300px', background: 'var(--cream)', borderRadius: '6px' }}></div>}>
            <SearchForm />
          </Suspense>
        </div>

        <div className="hero-bottom-curve">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,120 C480,0 960,0 1440,120 L1440,120 L0,120 Z" fill="#F8F6F1"></path>
          </svg>
        </div>
      </section>

      {hasSearchParams && (
        <section className="search-results" style={{ padding: '60px 0 20px', background: 'var(--cream)' }}>
          <div className="wrap">
            <Suspense key={JSON.stringify(searchParams)} fallback={<VendorGridSkeleton />}>
              <SearchResultsList searchParams={searchParams} cloudflareAccountHash={cloudflareAccountHash} totalProfessionals={totalProfessionals || 542} />
            </Suspense>
          </div>
        </section>
      )}

      <section className="promise">
        <div className="wrap">
          <div className="promise-header">
            <h2>Free to search. <span>Musicians you can trust.</span></h2>
            <p>We've built a platform that puts your peace of mind first.</p>
          </div>

          <div className="promise-grid">
            <div className="promise-card">
              <div className="promise-card-header">
                <div className="promise-icon">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
                <h3>100% Free</h3>
              </div>
              <p>No charge to you, ever — searching, browsing and checking availability is completely free.</p>
            </div>

            <div className="promise-card">
              <div className="promise-card-header">
                <div className="promise-icon">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3>Verified Musicians</h3>
              </div>
              <p>Every Musician on this platform is meticulously screened before being listed to ensure top-tier quality.</p>
            </div>

            <div className="promise-card">
              <div className="promise-card-header">
                <div className="promise-icon">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3>Direct Contact</h3>
              </div>
              <p>Once you find someone available, you'll speak with them directly to confirm details, pricing and next steps.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="profiles" id="profiles">
        <div className="wrap">
          <div className="titles-mid">
            <h2 className="profiles-title">Discover exceptional <em>Musicians</em> for your big day.</h2>
            {/* <p className="profiles-desc">From master bakers to award-winning designers, explore our curated selection of verified Musicians ready to bring your vision to life.</p> */}

          </div>

          {categoryVendors.map(({ category, vendors }) => {
            const slug = getCategorySlug(category);
            return (
              <div key={category} className="category-block">
                <div className="category-head">
                  {/* <h3>{category === 'Musician' ? 'Musician' : category}</h3> */}
                  <a className="view-more" href={`/browse/${slug}`}>Explore All &rarr;</a>
                </div>
                <div className="profile-grid">
                  {vendors.map(v => (
                    <VendorCard
                      key={v.id}
                      vendor={v}
                      cloudflareAccountHash={cloudflareAccountHash}
                      triggerType="profile-card"
                    />
                  ))}
                  {vendors.length === 0 && (
                    <p className="text-sm text-zinc-500 italic">No vendors found.</p>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </section>



      <section className="offer-section">
        <div className="wrap">
          <div className="offer-header">
            <h2>If you believe you have the talent, <em>give it six months.</em></h2>
            <p className="offer-subtitle">List with us for six months. If you don't get a single booking in that time, your next six months are free — no catch, no small print.</p>
            <p className="offer-highlight">There is no commission or hidden fees on any booking.</p>
          </div>

          <div className="offer-grid">

            <div className="offer-card">
              <div className="offer-icon"><MousePointer2 className="w-5 h-5" /></div>
              <p>Every event featured on our social media</p>
            </div>
            <div className="offer-card">
              <div className="offer-icon"><Percent className="w-5 h-5" /></div>
              <p>Referrals sent your way</p>
            </div>
            {/* <div className="offer-card">
              <div className="offer-icon"><CalendarCheck className="w-5 h-5" /></div>
              <p>Tentative bookings, confirmed by us</p>
            </div> */}
            <div className="offer-card">
              <div className="offer-icon"><CircleDollarSign className="w-5 h-5" /></div>
              <p>Zero commission, zero hidden fees</p>
            </div>
            <div className="offer-card">
              <div className="offer-icon"><TrendingUp className="w-5 h-5" /></div>
              <p>ROI covered in a single event</p>
            </div>
            <div className="offer-card">
              <div className="offer-icon"><ShieldCheck className="w-5 h-5" /></div>
              <p>No bookings in 6 months? Next 6 free</p>
            </div>
          </div>

          <div className="offer-banner-dark">
            <p><em>Our priority is simple: your talent showcased, never wasted.</em></p>
          </div>

          {/* <div className="offer-banner-light">
            <div className="offer-banner-dot"></div>
            <p>Your profile also appears on Sri Lankan Wedding Portal and Sri Lankan Event Portal, at no extra cost</p>
          </div> */}
        </div>
      </section>


      <section className="mentor-section">
        <div className="wrap">
          <div className="mentor-header">
            <h2 className="mentor-title">Hear from our Mentor for Musicians</h2>
          </div>
          <div className="mentor-content">
            <div className="mentor-video">
              <a href="https://youtube.com/watch?v=s1dcnMwllSc" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                <div className="video-box-large">
                  <div className="video-bg" style={{ background: 'url(/s1dcnMwllSc-HD.jpg) center/cover no-repeat' }}></div>
                  <div className="watch-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                    <span>Watch on YouTube</span>
                  </div>
                  <div className="play-btn-large">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="video-caption-large">
                    <strong>Mr. Sohan Weerasinghe</strong>
                    <span className="caption-divider"></span>
                    <span>Musician mentor</span>
                  </div>
                </div>
              </a>
            </div>
            <div className="mentor-details">
              <svg className="quote-mark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 11L8 15H11V19H5V15L7 11H5V7H11V11H10ZM20 11L18 15H21V19H15V15L17 11H15V7H21V11H20Z" fill="currentColor" />
              </svg>
              <h3>Mr. Sohan Weerasinghe</h3>
              <p>Five decades into his musical journey, Mr. Sohan Weerasinghe continues to perform and mentor Soloists, Band Members & DJs. He remains to be a respected professional in Sri Lanka’s music industry, shaped by experience, humility, and an enduring love for music.</p>
              {/* <a href="https://youtu.be/4Axj6aj-wtQ?si=ECZc3P_FvhJAEz8X" target="_blank" rel="noopener noreferrer" className="mentor-link">Watch full interview &rarr;</a> */}
            </div>
          </div>
        </div>
      </section>

      <section className="join-section" id="join-us">
        <div className="wrap">
          <div className="join-container">
            <div className="join-header">

              <h2>Become a Musician</h2>
              <p>Fill this in and we'll call you to confirm your details and walk you through membership.</p>
            </div>
            <JoinForm />
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Powered by <img src="/MentSpire_logo.svg" alt="MentSpire" style={{ height: '20px', width: 'auto' }} /></span>
            {/* <span style={{ borderLeft: '1px solid rgba(248,246,241,0.25)', paddingLeft: '20px' }}>Also part of <a href="https://lankanweddingportal.com">Sri Lankan Wedding Portal</a></span> */}
            <span style={{ borderLeft: '1px solid rgba(248,246,241,0.25)', paddingLeft: '20px' }}><a href="/terms-and-conditions">Terms & Conditions</a></span>
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
