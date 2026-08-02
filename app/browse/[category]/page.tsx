import { SERVICES } from '@/lib/constants';
import { BrowseClient } from './BrowseClient';
import '@/app/home-new.css';
import type { Metadata } from 'next';

function getCategoryFromSlug(slug: string) {
  for (const cat of SERVICES[0].items) {
    const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (catSlug === slug) return cat;
  }
  return null;
}

export async function generateMetadata(props: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const params = await props.params;
  const categoryName = getCategoryFromSlug(params.category);

  if (!categoryName) return { title: 'Category Not Found' };

  return {
    title: `Book ${categoryName} in Sri Lanka`,
    description: `Browse and book top-rated ${categoryName} for your events in Sri Lanka. Read reviews, check availability, and contact directly.`,
    openGraph: {
      title: `Book ${categoryName} in Sri Lanka | Sri Lankan Event Portal`,
      description: `Browse and book top-rated ${categoryName} for your events in Sri Lanka. Read reviews, check availability, and contact directly.`,
      url: `/browse/${params.category}`,
    }
  };
}

export default async function BrowseCategoryPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const categoryName = getCategoryFromSlug(params.category);

  if (!categoryName) {
    return <div className="text-center py-20 text-xl">Category not found</div>;
  }

  const cloudflareAccountHash = process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH || 'olsA5w0GxmMpS1hyYoBOrg';

  return (
    <div className="new-home">
      <header id="siteHeader">
        <div className="wrap">
          <nav>
            <a href="/" className="logo">
              <img src="/srilankan_event_portal.png" alt="Sri Lankan Event Portal" style={{ height: '36px', width: 'auto' }} />
            </a>

            <input type="checkbox" id="mobile-menu-toggle" className="mobile-menu-toggle" />
            <label htmlFor="mobile-menu-toggle" className="mobile-menu-btn">
              <span></span>
              <span></span>
              <span></span>
            </label>

            <div className='nav-links flex gap-4'>
              <a href="/become-vendor" className="nav-btn-primary">BECOME A Emcees/ MC/ Compere</a>
            </div>
          </nav>
        </div>
      </header>

      <section className="profiles" style={{ minHeight: '80vh', padding: '120px 0 60px' }}>
        <div className="wrap">
          <div className="section-eyebrow">Browse talent</div>
          <h2>All {categoryName}</h2>

          <BrowseClient category={categoryName} cloudflareHash={cloudflareAccountHash} />

        </div>
      </section>

      <footer>
        <div className="wrap">
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Powered by <img src="/MentSpire_logo.svg" alt="MentSpire" style={{ height: '20px', width: 'auto' }} /></span>
            {/* <span style={{ borderLeft: '1px solid rgba(248,246,241,0.25)', paddingLeft: '20px' }}>Also part of <a href="https://lankanweddingportal.com">Sri Lankan Wedding Portal</a></span> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
