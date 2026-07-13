import { SERVICES } from '@/lib/constants';
import { BrowseClient } from './BrowseClient';
import '@/app/home-new.css';

function getCategoryFromSlug(slug: string) {
  for (const cat of SERVICES[0].items) {
    const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (catSlug === slug) return cat;
  }
  return null;
}

export default async function BrowseCategoryPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const categoryName = getCategoryFromSlug(params.category);

  if (!categoryName) {
    return <div className="text-center py-20 text-xl">Category not found</div>;
  }

  const cloudflareAccountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'olsA5w0GxmMpS1hyYoBOrg';

  return (
    <div className="new-home">
      <header id="siteHeader">
        <div className="wrap">
          <nav>
            <a href="/" className="logo">Sri Lankan <span>Event Portal</span></a>
            <div className='flex gap-5'>
              <a href="/become-vendor" className="nav-cta">Become a vendor</a>
              <a href="/vendor/login" className="nav-cta">Vendor Login</a>
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
            <span>Powered by MentSpire</span>
            <span style={{ borderLeft: '1px solid rgba(248,246,241,0.25)', paddingLeft: '20px' }}>Also part of <a href="https://lankanweddingportal.com">Sri Lankan Wedding Portal</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
