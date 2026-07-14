'use client';

import { Calendar, Globe2, MapPin, Clock, Send, Info, Lock, X, Star } from 'lucide-react';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { sendTentativeBookingRequest } from '@/app/actions/booking';
import { getVendorReviews, getFullVendorDetails } from '@/app/actions/vendors';
import { format } from 'date-fns';
import { Calendar as UICalendar } from '@/components/ui/calendar';

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
  availabilitySlots?: { date: string; slot_morning: boolean; slot_afternoon: boolean }[];
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
  };


  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasFetchedReviews, setHasFetchedReviews] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0);

  const [displayVendor, setDisplayVendor] = useState<Vendor>(vendor);
  const [hasFetchedFullProfile, setHasFetchedFullProfile] = useState(false);
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | undefined>();
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<'morning' | 'afternoon' | null>(null);

  const isFormValid =
    bookingForm.name.trim() !== '' &&
    bookingForm.email.trim() !== '' &&
    bookingForm.phone.trim() !== '' &&
    bookingForm.occasion.trim() !== '' &&
    bookingForm.location.trim() !== '' &&
    selectedBookingDate !== undefined &&
    selectedBookingSlot !== null;

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

  // Helpers for calendar
  const availableDates = popupVendor.availabilitySlots?.map(slot => {
    const [sy, sm, sd] = slot.date.split('-').map(Number);
    return new Date(sy, sm - 1, sd);
  }) || [];

  const modifiers = {
    available: availableDates,
    unavailable: (date: Date) => {
      // mark as unavailable if it's not in the available array
      return !availableDates.some(availDate => availDate.getTime() === date.getTime());
    }
  };

  const modifiersClassNames = {
    available: "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 dark:bg-green-900/50 dark:text-green-300 font-medium",
    unavailable: "bg-red-50 text-red-300 hover:bg-red-50 hover:text-red-300 dark:bg-red-950/20 dark:text-red-900 line-through opacity-60"
  };

  const selectedDateStr = selectedBookingDate ? format(selectedBookingDate, 'yyyy-MM-dd') : null;
  const availableSlotsForSelectedDate = selectedDateStr
    ? popupVendor.availabilitySlots?.find(s => s.date === selectedDateStr)
    : null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger render={<div className="contents" />}>
          {triggerType === 'profile-card' ? (
            <div className="profile-card cursor-pointer">
              <div className="profile-avatar">
                {vendor.profile_image ? (
                  <img src={getImageUrl(vendor.profile_image)} alt={vendor.name} />
                ) : (
                  vendor.name.charAt(0).toUpperCase()
                )}
              </div>
              <h4>{vendor.name}</h4>
              <p>{vendor.location || 'Remote'}</p>
            </div>
          ) : (
            <div className="vcard in cursor-pointer">
              <div className="vc-top">
                <div className="vc-badges">
                  <span className="vb vb-v">✓ Verified</span>
                  <span className="vb vb-a">Available</span>
                </div>
                {vendor.portfolio && vendor.portfolio.length > 0 ? (
                  <div className="vc-initial overflow-hidden border-0 bg-transparent">
                    <img src={getImageUrl(vendor.portfolio[0])} alt={vendor.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="vc-initial">{vendor.name.charAt(0).toUpperCase()}</div>
                )}
                <div className="vc-avail-bar">
                  <span className="vab-dot"></span>
                  <span className="vab-txt">Next available: see profile calendar</span>
                </div>
              </div>
              <div className="vc-body">
                <div className="vc-cat">{vendor.category}</div>
                <div className="vc-name">{vendor.name}</div>
                <div className="vc-tagline">{vendor.occasions?.join(' · ')}</div>
                <div className="vc-meta">
                  <span className="vc-m"><i className="fas fa-map-marker-alt"></i>{vendor.location || 'Remote'}</span>
                  {vendor.years_of_experience && <span className="vc-m"><i className="fas fa-star"></i>{vendor.years_of_experience} yrs exp.</span>}
                </div>
                <div className="vc-stars">
                  <span className="vc-rc">{vendor.review_count || 0} {(vendor.review_count === 1) ? 'review' : 'reviews'}</span>
                </div>
                <div className="vc-skills">
                  {vendor.languages?.map(lang => (
                    <span key={lang} className="vsk vsk-hl">{lang}</span>
                  ))}
                  {vendor.occasions?.slice(0, 2).map(occ => (
                    <span key={occ} className="vsk">{occ}</span>
                  ))}
                </div>
                <div className="vc-foot">
                  <div className="vc-rate">
                    <span className="vc-rate-lbl">From</span>
                    {(() => {
                      const splitBudget = vendor.budget_range?.split(/[-–]/).map(s => s.trim());
                      const isRange = splitBudget && splitBudget.length === 2;
                      if (isRange) {
                        return (
                          <>
                            <span className="vc-rate-val">{splitBudget[0]}</span>
                            <span className="vc-rate-range">Up to {splitBudget[1]}</span>
                          </>
                        )
                      }
                      return <span className="vc-rate-val text-sm">{vendor.budget_range || 'Contact'}</span>
                    })()}
                  </div>
                  <button className="vc-book">Book Tentatively</button>
                </div>
              </div>
            </div>
          )}
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] w-full max-h-[calc(100dvh-4rem)] overflow-y-auto p-0 gap-0 border-0 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
            <DialogTitle className="text-xl font-bold font-serif">{popupVendor.name}</DialogTitle>
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
            <div className="p-6 sm:p-10">
              <div className="flex flex-col gap-10">
                {/* TOP SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {/* Top Left: DP & Bio */}
                  <div className="flex flex-col h-full">
                    {/* DP Avatar */}
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950 shadow-lg flex-shrink-0 flex items-center justify-center text-6xl font-serif text-amber-500 mx-auto md:mx-0 mb-8">
                      {popupVendor.profile_image ? (
                        <img src={getImageUrl(popupVendor.profile_image)} alt={popupVendor.name} className="w-full h-full object-cover" />
                      ) : (
                        popupVendor.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Bio */}
                    {popupVendor.bio && (
                      <div className="mt-auto border-t border-b border-dashed border-zinc-300 dark:border-zinc-700 py-6">
                        <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-50 mb-3">Bio</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                          {popupVendor.bio}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Top Right: Title & Video */}
                  <div className="flex flex-col h-full md:pt-4">
                    <div className="mb-8">
                      <div className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-2">
                        {popupVendor.category}
                      </div>
                      <h1 className="text-4xl sm:text-5xl font-bold font-serif text-zinc-900 dark:text-zinc-50">
                        {popupVendor.name}
                      </h1>
                    </div>

                    {/* Media (Video or Cover Image) */}
                    <div className="mb-auto mt-auto w-full">
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
                  </div>
                </div>

                {/* BOTTOM SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {/* Bottom Left: Event Types & Languages */}
                  <div className="flex flex-col gap-6">
                    {popupVendor.occasions && popupVendor.occasions.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-3">Event Types</div>
                        <div className="flex flex-wrap gap-2">
                          {popupVendor.occasions.map((occ, i) => (
                            <span key={i} className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900">{occ}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {popupVendor.languages && popupVendor.languages.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-3">Languages</div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900">{popupVendor.languages.join(' + ')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Right: Locations Served */}
                  <div className="flex flex-col gap-6">
                    {popupVendor.location && (
                      <div>
                        <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-3">Locations Served</div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900">{popupVendor.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Portfolio */}
              {popupVendor.portfolio && popupVendor.portfolio.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 mb-6">Portfolio</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Main Image */}
                    <div
                      className="flex-1 aspect-[16/10] md:aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-amber-100 dark:border-amber-900/30 cursor-pointer shadow-sm relative group"
                      onClick={() => setSelectedImage(getImageUrl(popupVendor.portfolio[activePortfolioIndex]))}
                    >
                      <img
                        src={getImageUrl(popupVendor.portfolio[activePortfolioIndex])}
                        alt={`Portfolio main`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
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
                            className={`flex-shrink-0 w-24 sm:w-full aspect-[4/3] sm:aspect-video rounded-md overflow-hidden cursor-pointer shadow-sm transition-all border-2 ${activePortfolioIndex === idx
                                ? 'border-amber-500 scale-[1.02] ring-2 ring-amber-500/20'
                                : 'border-transparent hover:border-amber-300/50 opacity-70 hover:opacity-100'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePortfolioIndex(idx);
                            }}
                          >
                            <img src={getImageUrl(imgId)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
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
              <div className="mt-16">
                <h2 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 mb-6">Tentative Booking</h2>

                <form action={async (formData) => {
                  if (!selectedBookingDate) {
                    setSubmitResult({ success: false, error: 'Please select an event date.' });
                    return;
                  }
                  if (!selectedBookingSlot) {
                    setSubmitResult({ success: false, error: 'Please select a time slot.' });
                    return;
                  }

                  setIsSubmitting(true);
                  setSubmitResult(null);
                  formData.append('vendorEmail', popupVendor.contact_email || '');
                  formData.append('vendorName', popupVendor.name);
                  formData.append('date', format(selectedBookingDate, 'yyyy-MM-dd'));
                  formData.append('slot', selectedBookingSlot);
                  formData.append('name', bookingForm.name);
                  formData.append('email', bookingForm.email);
                  formData.append('phone', bookingForm.phone);
                  formData.append('occasion', bookingForm.occasion);
                  formData.append('location', bookingForm.location);
                  formData.append('requirements', bookingForm.requirements);

                  const result = await sendTentativeBookingRequest(null, formData);
                  setSubmitResult(result);
                  setIsSubmitting(false);
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
                            setSelectedBookingSlot(null);
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (date < today) return true;
                            return modifiers.unavailable(date);
                          }}
                          modifiers={modifiers}
                          modifiersClassNames={modifiersClassNames}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-3 w-fit"
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        {selectedBookingDate ? (
                          availableSlotsForSelectedDate ? (
                            <div className="space-y-4">
                              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 block">
                                Available Slots for {format(selectedBookingDate, 'MMMM do, yyyy')}
                              </label>

                              <div className="space-y-3">
                                {availableSlotsForSelectedDate.slot_morning && (
                                  <label className={`flex items-center gap-4 p-5 border rounded-lg cursor-pointer transition-all ${selectedBookingSlot === 'morning' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md ring-1 ring-amber-500' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 bg-white dark:bg-zinc-950 shadow-sm'}`}>
                                    <input
                                      type="radio"
                                      name="slot_selection"
                                      value="morning"
                                      checked={selectedBookingSlot === 'morning'}
                                      onChange={() => setSelectedBookingSlot('morning')}
                                      className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                                    />
                                    <div>
                                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Morning Slot</div>
                                      <div className="text-sm text-zinc-500 mt-1">9:00 AM - 12:00 PM</div>
                                    </div>
                                  </label>
                                )}

                                {availableSlotsForSelectedDate.slot_afternoon && (
                                  <label className={`flex items-center gap-4 p-5 border rounded-lg cursor-pointer transition-all ${selectedBookingSlot === 'afternoon' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md ring-1 ring-amber-500' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 bg-white dark:bg-zinc-950 shadow-sm'}`}>
                                    <input
                                      type="radio"
                                      name="slot_selection"
                                      value="afternoon"
                                      checked={selectedBookingSlot === 'afternoon'}
                                      onChange={() => setSelectedBookingSlot('afternoon')}
                                      className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                                    />
                                    <div>
                                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Afternoon Slot</div>
                                      <div className="text-sm text-zinc-500 mt-1">12:00 PM - 5:00 PM</div>
                                    </div>
                                  </label>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50 flex flex-col items-center justify-center h-full text-center space-y-2">
                              <X className="w-8 h-8 opacity-50" />
                              <p>The vendor is not available on <strong>{format(selectedBookingDate, 'MMMM do, yyyy')}</strong>.</p>
                              <p className="text-sm opacity-80">Please select a date marked in green on the calendar.</p>
                            </div>
                          )
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
                    <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-50">Your Details</h3>
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
                    className={`w-full flex items-center justify-center gap-2 h-14 rounded-lg font-bold tracking-wider text-sm transition-all ${submitResult?.success
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                        : !isFormValid
                          ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
                          : 'bg-[#0A101D] hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
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
                        SEND TENTATIVE BOOKING REQUEST
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
