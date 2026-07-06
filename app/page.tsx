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
  
  if (hasSearchParams) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

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
    }
  }

  // Cloudflare Images uses an Account Hash for delivery, not the API Account ID
  const cloudflareAccountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'olsA5w0GxmMpS1hyYoBOrg';

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/50 to-transparent dark:from-rose-950/20" />
        <div className="container px-4 mx-auto relative z-10 text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Perfect Match</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12">
            Discover top-tier florists, visionary DJs, and masterful cake designers available for your special day.
          </p>
          
          <Suspense fallback={<div className="h-32 bg-white/50 rounded-2xl animate-pulse w-full max-w-5xl mx-auto"></div>}>
            <SearchForm />
          </Suspense>
        </div>
      </section>

      {/* Results Section */}
      <section className="container px-4 mx-auto pb-32">
        {!hasSearchParams ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Sparkles className="w-12 h-12 mx-auto text-rose-400 mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Start Your Search</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Use the filters above to find available vendors.</p>
          </div>
        ) : fetchError ? (
          <div className="text-center py-12 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl">
            <p>Oops! Something went wrong while searching. Please try again.</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">No Vendors Found</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Try adjusting your filters to find more results.</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Available Vendors <span className="text-zinc-400 text-lg font-normal">({vendors.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {vendors.map((vendor) => (
                <VendorCard 
                  key={vendor.id} 
                  vendor={vendor} 
                  cloudflareAccountHash={cloudflareAccountHash} 
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
