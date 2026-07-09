'use client';

import { useState } from 'react';
import { VendorCard, Vendor } from './vendor-card';

interface VendorGridProps {
  vendors: Vendor[];
  cloudflareAccountHash: string;
}

export function VendorGrid({ vendors, cloudflareAccountHash }: VendorGridProps) {
  const [visibleCount, setVisibleCount] = useState(9);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 9);
  };

  const visibleVendors = vendors.slice(0, visibleCount);
  const hasMore = visibleCount < vendors.length;

  return (
    <>
      <div className="vgrid">
        {visibleVendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            cloudflareAccountHash={cloudflareAccountHash}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="load-more-wrap in">
          <button onClick={handleLoadMore} className="load-more">
            Load more professionals <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i>
          </button>
        </div>
      )}
    </>
  );
}
