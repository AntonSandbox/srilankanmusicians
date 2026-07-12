'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getVendorsByCategory } from '@/app/actions/vendors';
import { VendorCard } from '@/components/vendor-card';

export function BrowseClient({ category, cloudflareHash }: { category: string; cloudflareHash: string }) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const newVendors = await getVendorsByCategory(category, page, 12);
    if (newVendors.length < 12) setHasMore(false);
    setVendors(prev => {
      // filter out duplicates just in case
      const existingIds = new Set(prev.map(v => v.id));
      const uniqueNewVendors = newVendors.filter(v => !existingIds.has(v.id));
      return [...prev, ...uniqueNewVendors];
    });
    setPage(p => p + 1);
    setLoading(false);
  }, [category, page, loading, hasMore]);

  const lastVendorRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  useEffect(() => {
    // Initial load
    if (page === 0 && vendors.length === 0 && !loading && hasMore) {
      loadMore();
    }
  }, [page, vendors.length, loading, hasMore, loadMore]);

  return (
    <div className="category-block" style={{ marginTop: '40px' }}>
      <div className="profile-grid">
        {vendors.map((v) => (
          <VendorCard
            key={v.id}
            vendor={v}
            cloudflareAccountHash={cloudflareHash}
            triggerType="profile-card"
          />
        ))}
      </div>
      
      <div ref={lastVendorRef} style={{ height: '1px', margin: '-1px 0 0 0' }} />
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid-brown)', fontStyle: 'italic' }}>
          Loading more talent...
        </div>
      )}
      {!hasMore && vendors.length > 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid-brown)', fontStyle: 'italic' }}>
          You've reached the end of the list.
        </div>
      )}
      {!hasMore && vendors.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mid-brown)', fontStyle: 'italic' }}>
          No professionals found in this category.
        </div>
      )}
    </div>
  );
}
