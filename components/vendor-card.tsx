'use client';

import { Calendar, Globe2, MapPin, Clock, Send, Info, Lock, X, Star } from 'lucide-react';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { sendTentativeBookingRequest } from '@/app/actions/booking';
import { getVendorReviews, getFullVendorDetails } from '@/app/actions/vendors';
import { format } from 'date-fns';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import { Logo } from '@/components/ui/logo';

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  return slots;
})();

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

export function VendorCard({ vendor, cloudflareAccountHash, triggerType = 'search' }: VendorCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; error?: string; message?: string } | null>(null);

  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    occasion: 'Wedding',
    location: '',
    requirements: ''
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
    if (submitResult?.success) setSubmitResult(null);
  };


  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        occasion: 'Wedding',
        location: '',
        requirements: ''
      });
      setSelectedBookingDate(undefined);
      setBookingStartTime('');
      setBookingEndTime('');
      setSubmitResult(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasFetchedReviews, setHasFetchedReviews] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0);
  const [scrollToBooking, setScrollToBooking] = useState(false);



  const [displayVendor, setDisplayVendor] = useState<Vendor>(vendor);
  const [hasFetchedFullProfile, setHasFetchedFullProfile] = useState(false);
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  useEffect(() => {
    if (isOpen && scrollToBooking && !isLoadingFull) {
      const timer = setTimeout(() => {
        const el = document.getElementById('tentative-booking-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scrollToBooking, isLoadingFull]);

  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | undefined>();
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');

  const isFormValid =
    bookingForm.name.trim() !== '' &&
    bookingForm.email.trim() !== '' &&
    bookingForm.phone.trim() !== '' &&
    bookingForm.occasion.trim() !== '' &&
    bookingForm.location.trim() !== '' &&
    selectedBookingDate !== undefined &&
    bookingStartTime !== '' &&
    bookingEndTime !== '';

  useEffect(() => {
    if (isOpen && !hasFetchedReviews) {
      setIsLoadingReviews(true);
      getVendorReviews(vendor.id).then(data => {
        setReviews(data);
        setIsLoadingReviews(false);
        setHasFetchedReviews(true);
      });
    }
  }, [isOpen, hasFetchedReviews, vendor.id]);

  useEffect(() => {
    if (isOpen && !hasFetchedFullProfile && triggerType === 'profile-card') {
      setIsLoadingFull(true);
      getFullVendorDetails(vendor.id).then(data => {
        if (data) setDisplayVendor(data);
        setIsLoadingFull(false);
        setHasFetchedFullProfile(true);
      });
    }
  }, [isOpen, hasFetchedFullProfile, vendor.id, triggerType]);

  const getImageUrl = (imageId: string | null) => {
    if (!imageId) return 'https://via.placeholder.com/400x400?text=No+Image';
    // If it's already a full URL, return as is
    if (imageId.startsWith('http')) return imageId;
    return `https://imagedelivery.net/${cloudflareAccountHash}/${imageId}/public`;
  };

  const popupVendor = triggerType === 'profile-card' ? displayVendor : vendor;

  const selectedDateStr = selectedBookingDate ? format(selectedBookingDate, 'yyyy-MM-dd') : null;
  const unavailableSlotsForSelectedDate = selectedDateStr
    ? popupVendor.unavailableSlots?.filter(s => s.date === selectedDateStr)
    : [];

  return (
    <>
      {triggerType === 'profile-card' ? (
        <div
          className="profile-card group"
          onClick={() => { setIsOpen(true); setScrollToBooking(false); }}
        >
          {vendor.profile_image ? (
            <img src={getImageUrl(vendor.profile_image)} alt={vendor.name} className="vendor-img" />
          ) : (
            <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-4xl font-serif text-amber-500 vendor-img">
              {vendor.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="profile-card-overlay">
            {/* <span className="profile-card-badge">
              {vendor.category}
            </span> */}
            <h4 className="profile-card-name">{vendor.name}</h4>
            <div className="profile-card-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>{vendor.location || 'Remote'}</span>
            </div>

            <div className="profile-card-btn-container">
              <div className="profile-card-btn">
                View Profile <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="group bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
          {/* Top Section - Image Header */}
          <div className="relative h-72 sm:h-80 w-full flex-shrink-0 cursor-pointer bg-zinc-950 overflow-hidden" onClick={() => { setIsOpen(true); setScrollToBooking(false); }}>
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
                <button
                  onClick={() => { setIsOpen(true); setScrollToBooking(false); }}
                  className="w-full py-2.5 bg-white border-2 border-zinc-100 hover:border-amber-200 hover:bg-amber-50 text-zinc-700 hover:text-amber-700 rounded-xl font-bold text-[13.5px] transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => { setIsOpen(true); setScrollToBooking(true); }}
                  className="w-full py-2.5 bg-[#dda44a] hover:bg-[#c99036] text-white rounded-xl font-bold text-[13.5px] shadow-sm hover:shadow-md transition-all"
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showCloseButton={false} className="max-w-[95vw] w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] md:w-full max-h-[calc(100dvh-2rem)] md:max-h-[calc(100dvh-4rem)] overflow-y-auto p-0 gap-0 border-0 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
            <DialogTitle className="flex items-center">
              <span className="sr-only">{popupVendor.name}</span>
              <Logo style={{ fontSize: '11px' }} />
            </DialogTitle>
            <DialogClose className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X className="w-4 h-4" /> Close
            </DialogClose>
          </div>

          {isLoadingFull && triggerType === 'profile-card' ? (
            <div className="p-6 sm:p-10 animate-pulse space-y-12">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/3 flex flex-col gap-6">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-zinc-200 dark:bg-zinc-800 mx-auto md:mx-0"></div>
                  <div>
                    <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="h-4 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3 flex flex-col gap-4">
                  <div className="h-4 w-24 bg-amber-200/50 dark:bg-amber-900/50 rounded"></div>
                  <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="w-full aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-xl mt-4"></div>
                </div>
              </div>

              <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
            </div>
          ) : (
            <div className="p-4 sm:p-10">
              <div className="flex flex-col gap-10">

                {/* Responsive Top Layout */}
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                  {/* Left Column (DP + Desktop Bio) */}
                  <div className="w-full md:w-1/3 flex flex-col items-center md:items-start shrink-0">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950 shadow-lg flex items-center justify-center text-5xl md:text-6xl font-serif text-amber-500 mb-4 md:mb-8 mx-auto md:mx-0">
                      {popupVendor.profile_image ? (
                        <img src={getImageUrl(popupVendor.profile_image)} alt={popupVendor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="relative z-10">{popupVendor.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Mobile Title */}
                    <div className="md:hidden text-center w-full mb-6">
                      <div className="text-amber-500 font-bold tracking-widest text-[10px] uppercase mb-1">
                        {popupVendor.category}
                      </div>
                      <h1 className="text-3xl font-bold font-serif text-zinc-900 dark:text-zinc-50 leading-tight">
                        {popupVendor.name}
                      </h1>
                    </div>

                    {/* Desktop Bio */}
                    {popupVendor.bio && (
                      <div className="hidden md:block w-full border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-6 mt-2">
                        <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-50 mb-3">About</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                          {popupVendor.bio}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column (Title, Media, Details) */}
                  <div className="w-full md:w-2/3 flex flex-col">
                    {/* Desktop Title */}
                    <div className="hidden md:block mb-8">
                      <div className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-2">
                        {popupVendor.category}
                      </div>
                      <h1 className="text-4xl lg:text-5xl font-bold font-serif text-zinc-900 dark:text-zinc-50">
                        {popupVendor.name}
                      </h1>
                    </div>

                    {/* Media (Video or Cover Image) */}
                    <div className="w-full mb-8">
                      {(() => {
                        let youtubeId = null;
                        if (popupVendor.video_url) {
                          const match = popupVendor.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                          if (match) youtubeId = match[1];
                        }

                        if (youtubeId) {
                          return (
                            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-[#1A2530] rounded-xl overflow-hidden shadow-sm">
                              <iframe
                                className="absolute w-full h-full top-0 left-0"
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                                title="Vendor Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          );
                        } else if (popupVendor.portfolio && popupVendor.portfolio.length > 0) {
                          return (
                            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
                              <img src={getImageUrl(popupVendor.portfolio[0])} alt="Cover" className="w-full h-full object-cover" />
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Mobile Bio */}
                    {popupVendor.bio && (
                      <div className="md:hidden w-full border-t border-b border-dashed border-zinc-300 dark:border-zinc-700 py-6 mb-8 text-center">
                        <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-50 mb-3">About</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                          {popupVendor.bio}
                        </p>
                      </div>
                    )}

                    {/* Attributes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {/* Left: Event Types & Languages */}
                      <div className="flex flex-col gap-6">
                        {popupVendor.occasions && popupVendor.occasions.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-[#7997b8] tracking-widest uppercase mb-3 text-center md:text-left">Event Types</div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                              {popupVendor.occasions.map((occ, i) => (
                                <span key={i} className="px-2.5 py-1.5 border border-zinc-100 rounded text-[11.5px] text-[#4a4a4a] bg-[#fbfbfb]">{occ}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {popupVendor.languages && popupVendor.languages.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-[#7997b8] tracking-widest uppercase mb-2 text-center md:text-left">Languages</div>
                            <div className="text-[14px] font-medium text-[#3a3a3a] text-center md:text-left">
                              {popupVendor.languages.join(' • ')}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Locations Served */}
                      <div className="flex flex-col gap-6">
                        {popupVendor.location && (
                          <div>
                            <div className="text-[10px] font-bold text-[#7997b8] tracking-widest uppercase mb-3 text-center md:text-left">Locations Served</div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                              <span className="px-3 py-1.5 border border-zinc-100 rounded text-xs text-[#4a4a4a] bg-[#fbfbfb]">{popupVendor.location}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio */}
              {popupVendor.portfolio && popupVendor.portfolio.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 mb-6">Featured</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Main Image */}
                    <div
                      className="flex-1 aspect-[16/10] md:aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-amber-100 dark:border-amber-900/30 cursor-pointer shadow-sm relative group"
                      onClick={() => setSelectedImage(getImageUrl(popupVendor.portfolio[activePortfolioIndex]))}
                    >
                      <img
                        src={getImageUrl(popupVendor.portfolio[activePortfolioIndex])}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 scale-125"
                        aria-hidden="true"
                      />
                      <img
                        src={getImageUrl(popupVendor.portfolio[activePortfolioIndex])}
                        alt={`Portfolio main`}
                        className="relative w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center z-10">
                        <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>

                    {/* Thumbnail Column */}
                    {popupVendor.portfolio.length > 1 && (
                      <div className="w-full sm:w-28 md:w-32 flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto pb-2 sm:pb-0 sm:pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700" style={{ maxHeight: 'min(60vh, 500px)' }}>
                        {popupVendor.portfolio.map((imgId, idx) => (
                          <div
                            key={idx}
                            className={`flex-shrink-0 w-24 sm:w-full aspect-[4/3] sm:aspect-video rounded-md overflow-hidden cursor-pointer shadow-sm transition-all border-2 relative bg-zinc-950 ${activePortfolioIndex === idx
                              ? 'border-amber-500 scale-[1.02] ring-2 ring-amber-500/20'
                              : 'border-transparent hover:border-amber-300/50 opacity-70 hover:opacity-100'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePortfolioIndex(idx);
                            }}
                          >
                            <img src={getImageUrl(imgId)} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-60 scale-125" aria-hidden="true" />
                            <img src={getImageUrl(imgId)} alt={`Thumbnail ${idx + 1}`} className="relative w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Budget Banner */}
              <div className="bg-[#FAF7F2] dark:bg-amber-950/20 border border-amber-200/50 px-8 py-6 rounded-xl mt-16 flex flex-wrap items-center gap-x-16 gap-y-4 shadow-sm">
                {(() => {
                  const splitBudget = popupVendor.budget_range?.split(/[-–]/).map(s => s.trim());
                  const isRange = splitBudget && splitBudget.length === 2;
                  return isRange ? (
                    <>
                      <div>
                        <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1">Starting From</div>
                        <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-50">{splitBudget[0]}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1">Up To</div>
                        <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-50">{splitBudget[1]}</div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1">Budget Range</div>
                      <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-50">{popupVendor.budget_range || 'Contact for pricing'}</div>
                    </div>
                  );
                })()}
              </div>

              {/* Tentative Booking Section */}
              <div className="mt-16" id="tentative-booking-section">
                <h2 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 mb-6">Tentative Booking</h2>

                <form action={async (formData) => {
                  if (!selectedBookingDate) {
                    setSubmitResult({ success: false, error: 'Please select an event date.' });
                    return;
                  }
                  if (!bookingStartTime || !bookingEndTime) {
                    setSubmitResult({ success: false, error: 'Please select a start and end time.' });
                    return;
                  }

                  setIsSubmitting(true);
                  setSubmitResult(null);
                  formData.append('vendorId', popupVendor.id);
                  formData.append('vendorEmail', popupVendor.contact_email || '');
                  formData.append('vendorName', popupVendor.name);
                  formData.append('date', format(selectedBookingDate, 'yyyy-MM-dd'));
                  formData.append('slot', `${bookingStartTime} to ${bookingEndTime}`);
                  formData.append('name', bookingForm.name);
                  formData.append('email', bookingForm.email);
                  formData.append('phone', bookingForm.phone);
                  formData.append('occasion', bookingForm.occasion);
                  formData.append('location', bookingForm.location);
                  formData.append('requirements', bookingForm.requirements);

                  const result = await sendTentativeBookingRequest(null, formData);
                  setSubmitResult(result);
                  setIsSubmitting(false);

                  if (result.success) {
                    setBookingForm({
                      name: '',
                      email: '',
                      phone: '',
                      occasion: 'Wedding',
                      location: '',
                      requirements: ''
                    });
                    setSelectedBookingDate(undefined);
                    setBookingStartTime('');
                    setBookingEndTime('');

                    setTimeout(() => {
                      setSubmitResult(null);
                    }, 5000);
                  }
                }} className="space-y-8">

                  <div className="bg-[#FAF7F2] dark:bg-amber-950/20 border border-amber-200/50 p-6 sm:p-8 rounded-xl shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="shrink-0 space-y-3">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 block">Event Date</label>
                        <UICalendar
                          mode="single"
                          selected={selectedBookingDate}
                          onSelect={(d) => {
                            setSelectedBookingDate(d);
                            setBookingStartTime('');
                            setBookingEndTime('');
                            if (submitResult?.success) setSubmitResult(null);
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (date < today) return true;

                            const dateStr = format(date, 'yyyy-MM-dd');
                            const isFullyBooked = popupVendor.unavailableSlots?.some(slot =>
                              slot.date === dateStr && slot.start_time.startsWith('00:00') && slot.end_time.startsWith('23:59')
                            );
                            return !!isFullyBooked;
                          }}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-3 w-fit"
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        {selectedBookingDate ? (
                          <div className="space-y-4">
                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 block">
                              Availability for {format(selectedBookingDate, 'MMMM do, yyyy')}
                            </label>

                            {unavailableSlotsForSelectedDate && unavailableSlotsForSelectedDate.length > 0 ? (
                              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-lg">
                                <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-3">
                                  Vendor is already booked during these times:
                                </p>
                                <ul className="space-y-1.5 mb-4">
                                  {unavailableSlotsForSelectedDate.map((slot, i) => (
                                    <li key={i} className="text-xs text-red-700 dark:text-red-400 font-medium flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5" />
                                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                    </li>
                                  ))}
                                </ul>
                                <p className="text-xs text-red-700 dark:text-red-400">
                                  Please select a time range that does not overlap with the above slots.
                                </p>
                              </div>
                            ) : (
                              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                                  Vendor is available all day. Please select your preferred time range.
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Start Time</label>
                                <select
                                  value={bookingStartTime}
                                  onChange={(e) => {
                                    setBookingStartTime(e.target.value);
                                    if (submitResult?.success) setSubmitResult(null);
                                    if (bookingEndTime && e.target.value >= bookingEndTime) {
                                      setBookingEndTime('');
                                    }
                                  }}
                                  className="w-full h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 transition-colors"
                                >
                                  <option value="">Select time...</option>
                                  {TIME_SLOTS.map(time => {
                                    const timeNum = time.replace(':', '');
                                    const disabled = popupVendor.unavailableSlots?.some(slot => {
                                      if (slot.date !== selectedDateStr) return false;
                                      const slotStart = slot.start_time.substring(0, 5).replace(':', '');
                                      const slotEnd = slot.end_time.substring(0, 5).replace(':', '');
                                      return timeNum >= slotStart && timeNum < slotEnd;
                                    });
                                    return <option key={time} value={time} disabled={disabled}>{time}</option>
                                  })}
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">End Time</label>
                                <select
                                  value={bookingEndTime}
                                  onChange={(e) => {
                                    setBookingEndTime(e.target.value);
                                    if (submitResult?.success) setSubmitResult(null);
                                  }}
                                  className="w-full h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 transition-colors"
                                >
                                  <option value="">Select time...</option>
                                  {TIME_SLOTS.map(time => {
                                    let disabled = false;
                                    const timeNum = time.replace(':', '');

                                    if (!bookingStartTime) {
                                      disabled = popupVendor.unavailableSlots?.some(slot => {
                                        if (slot.date !== selectedDateStr) return false;
                                        const slotStart = slot.start_time.substring(0, 5).replace(':', '');
                                        const slotEnd = slot.end_time.substring(0, 5).replace(':', '');
                                        return timeNum > slotStart && timeNum <= slotEnd;
                                      }) || false;
                                    } else {
                                      if (time <= bookingStartTime) {
                                        disabled = true;
                                      } else {
                                        const startNum = bookingStartTime.replace(':', '');
                                        disabled = popupVendor.unavailableSlots?.some(slot => {
                                          if (slot.date !== selectedDateStr) return false;
                                          const slotStart = slot.start_time.substring(0, 5).replace(':', '');
                                          const slotEnd = slot.end_time.substring(0, 5).replace(':', '');
                                          return slotStart < timeNum && slotEnd > startNum;
                                        }) || false;
                                      }
                                    }

                                    return <option key={time} value={time} disabled={disabled}>{time}</option>
                                  })}
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 rounded-lg border border-zinc-100 dark:border-zinc-800 h-full flex flex-col items-center justify-center text-center space-y-2">
                            <Calendar className="w-8 h-8 opacity-20" />
                            <p>Select a highlighted date from the calendar to view available time slots.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-50">Add your Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Your Full Name</label>
                        <input name="name" value={bookingForm.name} onChange={handleFormChange} required placeholder="Full name" className="w-full flex h-11 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                        <input name="email" type="email" value={bookingForm.email} onChange={handleFormChange} required placeholder="you@email.com" className="w-full flex h-11 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">WhatsApp / Mobile</label>
                        <input name="phone" value={bookingForm.phone} onChange={handleFormChange} required placeholder="+94 77 000 0000" className="w-full flex h-11 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Occasion Type</label>
                        <select name="occasion" value={bookingForm.occasion} onChange={handleFormChange} required className="w-full flex h-11 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 transition-colors">
                          <option value="Wedding">Wedding</option>
                          <option value="Corporate Event">Corporate Event</option>
                          <option value="Birthday Party">Birthday Party</option>
                          <option value="Anniversary">Anniversary</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Event Location</label>
                        <input name="location" value={bookingForm.location} onChange={handleFormChange} required placeholder="City or venue name" className="w-full flex h-11 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 transition-colors" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Special Requirements or Questions</label>
                        <textarea name="requirements" value={bookingForm.requirements} onChange={handleFormChange} rows={4} placeholder="Guest count, specific language requirements, any special requests..." className="w-full flex rounded-md border border-zinc-300 bg-white px-3 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 transition-colors"></textarea>
                      </div>
                    </div>
                  </div>

                  {submitResult ? (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${submitResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {submitResult.success ? <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> : <X className="w-5 h-5 shrink-0" />}
                      <p>{submitResult.success ? submitResult.message : submitResult.error}</p>
                    </div>
                  ) : null}

                  <div className="bg-[#fdfaf6] dark:bg-amber-950/10 rounded-lg p-5 flex gap-4 text-sm text-zinc-700 dark:text-zinc-300 border border-amber-200 dark:border-amber-900/50 mt-8 items-start">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      This sends a <strong>tentative booking request</strong> to the professional via a verified link. No payment is taken at this stage. You will receive a personalised quote and availability confirmation within <strong>24 hours</strong>. Only then do you decide whether to confirm.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting || !!(submitResult && submitResult.success)}
                    className={`w-full flex items-center justify-center gap-2 h-14 rounded-[4px] font-bold tracking-wider text-[13.5px] transition-all ${submitResult?.success
                      ? 'bg-[#1D4A34] text-white shadow-md'
                      : !isFormValid
                        ? 'bg-[#F8F6F1] text-[#1D4A34]/40 border border-[#1D4A34]/10 cursor-not-allowed'
                        : 'bg-[#E67E22] hover:bg-[#996515] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-zinc-900"></div>
                        SENDING REQUEST...
                      </>
                    ) : submitResult?.success ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        REQUEST SENT
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Book
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Reviews Section */}
              <div className="mt-16">
                <h2 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 mb-6">Reviews</h2>
                <div className="bg-[#FAF7F2] dark:bg-amber-950/20 border border-amber-200/50 p-6 sm:p-8 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-zinc-500 font-bold tracking-wider text-sm mb-6 uppercase">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Client Reviews
                  </div>

                  {isLoadingReviews ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-8">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-amber-100 dark:border-amber-900/30 last:border-0 pb-8 last:pb-0">
                          <p className="text-zinc-700 dark:text-zinc-300 italic mb-4 text-lg leading-relaxed">"{review.review_text}"</p>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{review.reviewer_name}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{format(new Date(review.review_date), 'MMMM yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-zinc-500 dark:text-zinc-400 italic">No reviews yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 md:p-10 cursor-pointer backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all z-[111]"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full screen portfolio"
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl cursor-default select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
