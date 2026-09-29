'use client';

import { MapPin } from 'lucide-react';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string | null;
  languages: string[];
  occasions?: string[];
  budget_range?: string | null;
  contact_email: string | null;
  schedule_url: string | null;
  profile_image: string | null;
  portfolio: string[];
  unavailableSlots?: { date: string; start_time: string; end_time: string }[];
  years_of_experience?: number;
  review_count?: number;
  created_at?: string;
  video_url?: string | null;
  bio?: string | null;
}

interface VendorCardProps {
  vendor: Vendor;
  cloudflareAccountHash: string;
  triggerType?: 'search' | 'profile-card';
}

const generateVendorUrl = (vendor: Vendor) => {
  const categoryStr = vendor.category || 'vendor';
  const categorySlug =
    categoryStr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'vendor';

  const nameStr = vendor.name || 'vendor';
  const nameSlug =
    nameStr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'vendor';

  const idPrefix = (vendor.id || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 8)
    .toLowerCase();

  return `https://www.eventvendorportal.com/${categorySlug}/${nameSlug}-${idPrefix}`;
};

export function VendorCard({ vendor, cloudflareAccountHash, triggerType = 'search' }: VendorCardProps) {
  const getImageUrl = (imageId: string | null) => {
    if (!imageId) return 'https://via.placeholder.com/400x400?text=No+Image';
    // If it's already a full URL, return as is
    if (imageId.startsWith('http')) return imageId;
    return `https://imagedelivery.net/${cloudflareAccountHash}/${imageId}/public`;
  };

  const vendorUrl = generateVendorUrl(vendor);

  if (triggerType === 'profile-card') {
    return (
      <a
        href={vendorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="profile-card group block"
      >
        {vendor.profile_image ? (
          <img src={getImageUrl(vendor.profile_image)} alt={vendor.name} className="vendor-img" />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-4xl font-serif text-amber-500 vendor-img">
            {vendor.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="profile-card-overlay">
          <h4 className="profile-card-name">{vendor.name}</h4>
          <div className="profile-card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{vendor.location || 'Remote'}</span>
          </div>

          <div className="profile-card-btn-container">
            <div className="profile-card-btn">
              View Profile <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={vendorUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 block cursor-pointer"
    >
      {/* Top Section - Image Header */}
      <div className="relative h-72 sm:h-80 w-full flex-shrink-0 bg-zinc-950 overflow-hidden">
        {/* Blurred Background Layer */}
        {vendor.profile_image && (
          <img src={getImageUrl(vendor.profile_image)} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 scale-125" aria-hidden="true" />
        )}

        {/* Actual contained image */}
        {vendor.profile_image ? (
          <img src={getImageUrl(vendor.profile_image)} alt={vendor.name} className="relative w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center text-5xl font-serif text-amber-500">
            {vendor.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Gradient Overlay for Header */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 opacity-95 transition-opacity group-hover:opacity-100">
          <h2 className="text-[28px] font-bold font-serif text-white mb-1.5 leading-tight drop-shadow-md">{vendor.name}</h2>
          {vendor.location && (
            <div className="flex items-center gap-1.5 text-white/90 text-[13px] font-medium drop-shadow-md">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{vendor.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body Section */}
      <div className="p-6 flex flex-col flex-grow bg-white">
        <div className="flex flex-col gap-5 flex-grow">
          {/* Event Types */}
          {vendor.occasions && vendor.occasions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-3">Expertise</div>
              <div className="flex flex-wrap gap-2">
                {vendor.occasions.slice(0, 3).map(occ => (
                  <span key={occ} className="px-3 py-1.5 border border-zinc-100 rounded-lg text-[11px] font-medium text-zinc-600 bg-zinc-50">{occ}</span>
                ))}
                {vendor.occasions.length > 3 && (
                  <span className="px-3 py-1.5 border border-zinc-100 rounded-lg text-[11px] font-medium text-zinc-600 bg-zinc-50">+{vendor.occasions.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {vendor.languages && vendor.languages.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-1.5">Languages</div>
              <div className="text-[13.5px] font-medium text-zinc-700">
                {vendor.languages.join(' • ')}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Container */}
        <div className="pt-5 mt-5 border-t border-zinc-100 flex flex-col gap-5">
          {/* Budget */}
          <div>
            <div className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-1">Starting From</div>
            <div className="text-[22px] font-bold text-zinc-900">
              {vendor.budget_range ? (
                (() => {
                  const splitBudget = vendor.budget_range.split(/[-–]/).map(s => s.trim());
                  return splitBudget && splitBudget.length > 0 ? splitBudget[0] : vendor.budget_range;
                })()
              ) : '-'}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="w-full flex items-center justify-center py-2.5 bg-white border-2 border-zinc-100 group-hover:border-amber-200 group-hover:bg-amber-50 text-zinc-700 group-hover:text-amber-700 rounded-xl font-bold text-[13.5px] transition-colors"
            >
              Profile
            </div>
            <div
              className="w-full flex items-center justify-center py-2.5 bg-[#dda44a] hover:bg-[#c99036] text-white rounded-xl font-bold text-[13.5px] shadow-sm hover:shadow-md transition-all"
            >
              Book
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
