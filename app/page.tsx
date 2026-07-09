import { Suspense } from 'react';
import { SearchForm } from '@/components/search-form';
import { VendorCard, Vendor } from '@/components/vendor-card';
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

        if (ranges && !rangesError) {
          vendors = vendors.map(v => ({
            ...v,
            availabilityRanges: ranges.filter(r => r.vendor_id === v.id)
          }));
        }
      }
    }
  }

  // Cloudflare Images uses an Account Hash for delivery, not the API Account ID
  const cloudflareAccountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'olsA5w0GxmMpS1hyYoBOrg';

  return (
    <main className="portal-page">
      {/* NAV */}
      <nav>
        <div className="container nav-in">
          <a href="/" className="nav-logo">
            <div className="nl-sq"><span>S</span></div>
            <div className="nl-text">
              <span className="nl-name">Sri Lankan Event Portal</span>
              <span className="nl-sub">Find &middot; Check &middot; Book</span>
            </div>
          </a>
          <div className="nav-links">
            <a href="#vendors" className="nav-a">Find Talent</a>
            <a href="#occasions" className="nav-a">Occasions</a>
            <a href="#rates" className="nav-a">Rate Guide</a>
            <a href="#how-it-works" className="nav-a">How It Works</a>
            <a href="#faq" className="nav-a">FAQ</a>
          </div>
          <a href="#book-direct" className="nav-cta">Tentative Booking</a>
          <button className="nav-burger" aria-label="Open menu"><span></span><span></span><span></span></button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <div className="hero-kicker"><span className="hero-kicker-dot"></span>Sri Lanka &amp; worldwide diaspora</div>
          <h1 className="hero-h1">Every event deserves<br />the right <em>talent.</em></h1>
          <p className="hero-desc">Find verified Sri Lankan event professionals for weddings, birthdays, corporate events, conferences and exhibitions. Check real availability. Request a tentative booking — confirmed with a personalised quote within 24 hours.</p>

          <Suspense fallback={<div className="h-32 bg-white/50 rounded-2xl animate-pulse w-full max-w-5xl mx-auto"></div>}>
            <SearchForm />
          </Suspense>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="container trust-bar-in">
          <div className="tb-item"><i className="fas fa-shield-check" style={{ color: 'var(--saffron)' }}></i><span><strong>Personally verified</strong> professionals only</span></div>
          <div className="tb-sep"></div>
          <div className="tb-item"><i className="fas fa-clock" style={{ color: 'var(--saffron)' }}></i><span>Booking confirmed with quote within <strong>24 hours</strong></span></div>
          <div className="tb-sep"></div>
          <div className="tb-item"><i className="fas fa-calendar-check" style={{ color: 'var(--saffron)' }}></i><span><strong>Live availability</strong> &mdash; only available dates shown</span></div>
          <div className="tb-sep"></div>
          <div className="tb-item"><i className="fas fa-globe-asia" style={{ color: 'var(--saffron)' }}></i><span>Sri Lanka &amp; <strong>15+ countries</strong> worldwide</span></div>
          <div className="tb-sep"></div>
          <div className="tb-item"><i className="fas fa-gift" style={{ color: 'var(--saffron)' }}></i><span><strong>Free</strong> to search &amp; make tentative bookings</span></div>
        </div>
      </div>

      {/* CATEGORY STRIP */}
      <div className="cats" id="vendors">
        <div className="container">
          <div className="cats-scroll in">
            <button className="cat-pill on"><span className="cp-icon">✦</span><span className="cp-name">All talent</span><span className="cp-count">542</span></button>
            <button className="cat-pill"><span className="cp-icon">🎤</span><span className="cp-name">Emcees/ MC/ Compere</span><span className="cp-count">48</span></button>
            <button className="cat-pill"><span className="cp-icon">💄</span><span className="cp-name">MUA/ Make-up Artist</span><span className="cp-count">61</span></button>
            <button className="cat-pill"><span className="cp-icon">🎵</span><span className="cp-name">Band</span><span className="cp-count">34</span></button>
            <button className="cat-pill"><span className="cp-icon">🎧</span><span className="cp-name">DJ</span><span className="cp-count">27</span></button>
            <button className="cat-pill"><span className="cp-icon">📷</span><span className="cp-name">Photographer</span><span className="cp-count">72</span></button>
            <button className="cat-pill"><span className="cp-icon">🎂</span><span className="cp-name">Cake Artist</span><span className="cp-count">14</span></button>
          </div>
        </div>
      </div>

      {/* VENDORS GRID */}
      <div className="vendors">
        <div className="container">
          {!hasSearchParams ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-zinc-200 shadow-sm" style={{ borderColor: 'var(--sand2)', background: 'var(--paper)' }}>
              <h2 className="text-2xl font-bold mb-2 font-['Cormorant',serif]" style={{ color: 'var(--ink)' }}>Start Your Search</h2>
              <p style={{ color: 'var(--mist)' }}>Use the filters above to find available vendors.</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12 text-red-500 bg-red-50 rounded-2xl">
              <p>Oops! Something went wrong while searching. Please try again.</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-24 rounded-3xl border shadow-sm" style={{ borderColor: 'var(--sand2)', background: 'var(--paper)' }}>
              <h2 className="text-2xl font-bold mb-2 font-['Cormorant',serif]" style={{ color: 'var(--ink)' }}>No Vendors Found</h2>
              <p style={{ color: 'var(--mist)' }}>Try adjusting your filters to find more results.</p>
            </div>
          ) : (
            <>
              <div className="vendors-hd in">
                <div className="vhd-left">
                  <div className="vhd-count" id="v-count">Showing {vendors.length} of {totalProfessionals || 542} professionals</div>
                  <div className="vhd-title">Available <em>this week</em></div>
                </div>
                <div className="vhd-sort">
                  <label>Sort by</label>
                  <select>
                    <option>Highest rated</option>
                    <option>Lowest price</option>
                    <option>Most reviewed</option>
                    <option>Recently added</option>
                  </select>
                </div>
              </div>

              <div className="vgrid">
                {vendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    cloudflareAccountHash={cloudflareAccountHash}
                  />
                ))}
              </div>
              <div className="load-more-wrap in">
                <button className="load-more">Load more professionals <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i></button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* OCCASIONS */}
      <section className="occ-sec" id="occasions">
        <div className="container">
          <span className="sec-eye in">Every occasion</span>
          <h2 className="sec-h2 in">The right talent for <em>every event</em></h2>
          <div className="occ-grid">
            <div className="occ-card in"><div className="oc-icon">💍</div><div className="oc-name">Wedding</div><div className="oc-talents">MC · Photographer · Band · MUA · Planner · Florist · Cake</div></div>
            <div className="occ-card in"><div className="oc-icon">🎂</div><div className="oc-name">Birthday Party</div><div className="oc-talents">MC · DJ · Photographer · Cake · Decorator</div></div>
            <div className="occ-card in"><div className="oc-icon">💼</div><div className="oc-name">Corporate Event</div><div className="oc-talents">MC · Speaker · Photographer · Videographer · Band</div></div>
            <div className="occ-card in"><div className="oc-icon">🎙️</div><div className="oc-name">Conference</div><div className="oc-talents">MC · Speaker · Moderator · Translator · Photographer</div></div>
            <div className="occ-card in"><div className="oc-icon">🖼️</div><div className="oc-name">Exhibition</div><div className="oc-talents">MC · Promoter · Photographer · Videographer</div></div>
            <div className="occ-card in"><div className="oc-icon">🎵</div><div className="oc-name">Concert &amp; Show</div><div className="oc-talents">Band · DJ · Vocalist · Dancers · Photographer</div></div>
            <div className="occ-card in"><div className="oc-icon">🏆</div><div className="oc-name">Awards Ceremony</div><div className="oc-talents">MC · Photographer · Videographer · Band · Décor</div></div>
            <div className="occ-card in"><div className="oc-icon">💐</div><div className="oc-name">Engagement Party</div><div className="oc-talents">MC · Photographer · Cake · Florist · DJ</div></div>
          </div>
        </div>
      </section>

      {/* RATE GUIDE */}
      <section className="rates-sec" id="rates">
        <div className="container">
          <span className="sec-eye in">Transparent pricing</span>
          <h2 className="sec-h2 in">Sri Lankan event talent <em>rate guide</em></h2>
          <p className="sec-p in" style={{ marginBottom: '24px' }}>Typical rate ranges across Sri Lanka. Actual quotes depend on experience level, event duration, location and specific requirements. All quotes are personalised and provided within 24 hours of a tentative booking request.</p>
          <div className="rates-note in">
            <i className="fas fa-info-circle"></i>
            <span>These are <strong>market ranges</strong> — not fixed prices. Entry-level professionals start at the low end; award-winning or internationally experienced professionals command the high end. Overseas events (Australia, UK, UAE) will attract travel and accommodation costs in addition. Final pricing is always confirmed directly with the professional.</span>
          </div>
          <table className="rates-table in">
            <thead>
              <tr><th>Service</th><th>Entry Level</th><th>Experienced</th><th>Premium / Award-Winning</th><th>Notes</th></tr>
            </thead>
            <tbody>
              <tr><td className="rates-cat">Emcees/ MC/ Compere</td><td>LKR 15,000</td><td>LKR 35,000&ndash;60,000</td><td>LKR 100,000+</td><td>Bilingual usually higher</td></tr>
              <tr><td className="rates-cat">Photographer</td><td>LKR 25,000</td><td>LKR 50,000&ndash;120,000</td><td>LKR 250,000+</td><td>Per day rate</td></tr>
              <tr><td className="rates-cat">Band</td><td>LKR 40,000</td><td>LKR 80,000&ndash;150,000</td><td>LKR 300,000+</td><td>Depends on line-up</td></tr>
              <tr><td className="rates-cat">DJ</td><td>LKR 15,000</td><td>LKR 30,000&ndash;75,000</td><td>LKR 150,000+</td><td>Setup included usually</td></tr>
              <tr><td className="rates-cat">MUA/ Make-up Artist</td><td>LKR 10,000</td><td>LKR 25,000&ndash;50,000</td><td>LKR 80,000+</td><td>Bridal / airbrush = premium</td></tr>

              <tr><td className="rates-cat">Cake Artist</td><td>LKR 8,000</td><td>LKR 25,000&ndash;60,000</td><td>LKR 100,000+</td><td>Tiered / sculpted cakes = premium</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* WHY VERIFIED */}
      <section className="why-sec">
        <div className="container">
          <span className="sec-eye in">Why this portal</span>
          <h2 className="sec-h2 in">What makes every professional here <em>different</em></h2>
          <div className="why-grid">
            <div className="why-card in"><div className="wc-icon"><i className="fas fa-shield-check"></i></div><div className="wc-t">Personally verified</div><p className="wc-d">Every professional is reviewed before listing — experience checked, references confirmed. You will never see an unchecked self-registration on this platform.</p></div>
            <div className="why-card in"><div className="wc-icon"><i className="fas fa-calendar-check"></i></div><div className="wc-t">Live availability</div><p className="wc-d">Each professional manages a live calendar. Search results show only those genuinely available on your date — no wasted time chasing unavailable vendors.</p></div>
            <div className="why-card in"><div className="wc-icon"><i className="fas fa-file-invoice"></i></div><div className="wc-t">Quote within 24 hours</div><p className="wc-d">Every tentative booking triggers a personalised quote from the professional — based on your specific event, date and requirements. Not a generic rate card.</p></div>
            <div className="why-card in"><div className="wc-icon"><i className="fas fa-globe-asia"></i></div><div className="wc-t">Sri Lankans worldwide</div><p className="wc-d">Verified Sri Lankan professionals in Australia, UK, UAE, Canada and beyond. Diaspora weddings and overseas corporate events are equally served.</p></div>
            <div className="why-card in"><div className="wc-icon"><i className="fas fa-star"></i></div><div className="wc-t">Real reviews only</div><p className="wc-d">Reviews come from verified event organisers who actually used the professional. No anonymous ratings, no inflated scores — only authentic feedback.</p></div>
            <div className="why-card in"><div className="wc-icon"><i className="fas fa-gift"></i></div><div className="wc-t">Free for organisers</div><p className="wc-d">Search, browse, compare and request tentative bookings completely free. You only deal directly with the professional — no commission, no booking fees.</p></div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-sec" id="faq">
        <div className="container">
          <span className="sec-eye in">Common questions</span>
          <h2 className="sec-h2 in" style={{ textAlign: 'center' }}>Everything you need <em>to know</em></h2>
          <div className="faq-list">
            <div className="faq-item in">
              <button className="faq-q">What is a "tentative booking" and is it binding? <i className="fas fa-plus"></i></button>
              <div className="faq-a" style={{ maxHeight: '1000px' }}><div className="faq-a-in">A tentative booking is a reservation of interest — not a contract. When you click "Book Tentatively" and fill in the form, your details go directly to the professional via a verified secure link. The professional responds within 24 hours with a personalised quote and confirms their availability. You then decide whether to proceed. No money changes hands until you actively confirm the booking directly with the professional.</div></div>
            </div>
            {/* other faqs can be populated here later or left as is for now */}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="ft">
            <div>
              <div className="nav-logo" style={{ marginBottom: '14px' }}>
                <div className="nl-sq"><span>S</span></div>
                <div className="nl-text">
                  <span className="nl-name">Sri Lankan Event Portal</span>
                  <span className="nl-sub">Find &middot; Check &middot; Book</span>
                </div>
              </div>
              <p className="fb-desc">Sri Lanka's first verified all-event talent platform. From weddings in Colombo to conferences in Dubai — find the right professional, check availability, and book tentatively. Free for event organisers.</p>
              <div className="fb-soc">
                <a href="#" title="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" title="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" title="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                <a href="#" title="YouTube"><i className="fab fa-youtube"></i></a>
                <a href="#" title="WhatsApp"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>
            <div className="fc">
              <h4>Find Talent</h4>
              <ul>
                <li><a href="#"><i className="fas fa-chevron-right"></i>Emcees/ MC/ Compere</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i>MUA/ Make-up Artist</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i>Band</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i>DJ</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i>Photographer</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i>Cake Artist</a></li>
              </ul>
            </div>
            <div className="fc">
              <h4>Also in the Network</h4>
              <ul>
                <li><a href="#"><i className="fas fa-chevron-right"></i>Lankan Wedding MC</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i>Lankan Wedding MUA</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i>Wedding Photographer</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i>Wedding Band</a></li>
              </ul>
            </div>
          </div>
          <hr className="f-div" />
          <div className="f-bot">
            <p className="f-copy">&copy; 2025 Sri Lankan Event Portal &middot; All rights reserved</p>
            <div className="f-links"><a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Sitemap</a></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
