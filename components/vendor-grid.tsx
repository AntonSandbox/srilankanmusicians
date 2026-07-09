'use client';

import { useState } from 'react';
import { VendorCard, Vendor } from './vendor-card';

interface VendorGridProps {
  vendors: Vendor[];
  cloudflareAccountHash: string;
  totalProfessionals: number;
}

const parseBudget = (budget: string | null | undefined): number => {
  if (!budget || budget === 'Flexible — show all') return Infinity; // Put flexible/unknown at the end when sorting ascending
  const noCommas = budget.replace(/,/g, '');
  const numMatch = noCommas.match(/\d+/);
  if (numMatch) return parseInt(numMatch[0], 10);
  return Infinity;
};

export function VendorGrid({ vendors, cloudflareAccountHash, totalProfessionals }: VendorGridProps) {
  const [visibleCount, setVisibleCount] = useState(9);
  const [sortBy, setSortBy] = useState('most_reviewed');

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 9);
  };

  const sortedVendors = [...vendors].sort((a, b) => {
    if (sortBy === 'most_reviewed') {
      return (b.review_count || 0) - (a.review_count || 0);
    }
    if (sortBy === 'lowest_price') {
      const budgetA = parseBudget(a.budget_range);
      const budgetB = parseBudget(b.budget_range);
      if (budgetA === budgetB) return 0;
      return budgetA > budgetB ? 1 : -1;
    }

    if (sortBy === 'recently_added') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  const visibleVendors = sortedVendors.slice(0, visibleCount);
  const hasMore = visibleCount < sortedVendors.length;

  return (
    <>
      <div className="vendors-hd in">
        <div className="vhd-left">
          <div className="vhd-count" id="v-count">Showing {vendors.length} of {totalProfessionals || 542} professionals</div>
          <div className="vhd-title">Available <em>professionals</em></div>
        </div>
        <div className="vhd-sort">
          <label>Sort by</label>
          <select value={sortBy} onChange={(e) => {
            setSortBy(e.target.value);
            setVisibleCount(9); // Reset pagination on sort change
          }}>
            <option value="most_reviewed">Most reviewed</option>
            <option value="lowest_price">Lowest price</option>
            <option value="recently_added">Recently added</option>
          </select>
        </div>
      </div>

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
