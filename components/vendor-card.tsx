'use client';

import { useState, useEffect } from 'react';
import { Calendar, Globe2, MapPin, Clock, Send, Info, Lock, X, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { sendTentativeBookingRequest } from '@/app/actions/booking';
import { getVendorReviews } from '@/app/actions/vendors';
import { format } from 'date-fns';

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
  availabilityRanges?: { start_date: string; end_date: string }[];
}

interface VendorCardProps {
  vendor: Vendor;
  cloudflareAccountHash: string;
}

export function VendorCard({ vendor, cloudflareAccountHash }: VendorCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; error?: string; message?: string } | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasFetchedReviews, setHasFetchedReviews] = useState(false);

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

  const getImageUrl = (imageId: string | null) => {
    if (!imageId) return 'https://via.placeholder.com/400x400?text=No+Image';
    // If it's already a full URL, return as is
    if (imageId.startsWith('http')) return imageId;
    return `https://imagedelivery.net/${cloudflareAccountHash}/${imageId}/public`;
  };

  const profileImageUrl = getImageUrl(vendor.profile_image);

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={profileImageUrl} 
          alt={vendor.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {vendor.category}
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">{vendor.name}</h3>
            <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {vendor.location || 'Remote'}
            </div>
          </div>
        </div>

        {vendor.languages && vendor.languages.length > 0 && (
          <div className="flex items-center text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            <Globe2 className="w-4 h-4 mr-1" />
            {vendor.languages.join(', ')}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="flex-1 w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-zinc-300 dark:border-zinc-700 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              View Profile
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 bg-white dark:bg-zinc-950">
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
                <DialogTitle className="text-xl font-bold font-serif">{vendor.name}</DialogTitle>
                <DialogClose className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <X className="w-4 h-4" /> Close
                </DialogClose>
              </div>

              <div className="relative h-48 sm:h-64 bg-[#1A2530] flex items-center justify-center overflow-hidden">
                <span className="absolute text-9xl sm:text-[12rem] font-serif italic opacity-10 text-amber-500/20 select-none pointer-events-none">
                  {vendor.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="p-8 sm:p-12 space-y-10">
                <div>
                  <div className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-3">
                    {vendor.category}
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold font-serif text-zinc-900 dark:text-zinc-50">
                    {vendor.name}
                  </h1>
                </div>

                <div className="bg-[#FAF7F2] dark:bg-amber-950/20 border border-amber-200/50 p-6 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-6">
                  {(() => {
                    const splitBudget = vendor.budget_range?.split(/[-–]/).map(s => s.trim());
                    const isRange = splitBudget && splitBudget.length === 2;
                    return isRange ? (
                      <>
                        <div>
                          <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1">Starting From</div>
                          <div className="text-2xl font-mono font-medium">{splitBudget[0]}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1">Up To</div>
                          <div className="text-2xl font-mono font-medium">{splitBudget[1]}</div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2">
                        <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1">Budget Range</div>
                        <div className="text-2xl font-mono font-medium">{vendor.budget_range || 'Contact for pricing'}</div>
                      </div>
                    );
                  })()}
                  <div className="col-span-2 md:col-span-1 md:text-right flex flex-col md:items-end justify-center">
                    <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-1">Quote Type</div>
                    <div className="text-lg">Per event</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {vendor.occasions && vendor.occasions.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-3">Event Types</div>
                      <div className="flex flex-wrap gap-2">
                        {vendor.occasions.map((occ, i) => (
                          <span key={i} className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900">{occ}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {vendor.location && (
                    <div>
                      <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-3">Locations Served</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900">{vendor.location}</span>
                      </div>
                    </div>
                  )}

                  {vendor.languages && vendor.languages.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-3">Languages</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900">{vendor.languages.join(' + ')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#FAF7F2] dark:bg-amber-950/20 border border-amber-200/50 p-6 rounded-lg">
                  <div className="flex items-center gap-2 text-zinc-500 font-bold tracking-wider text-sm mb-2 uppercase">
                    <Calendar className="w-4 h-4 text-amber-500" /> Availability — Next 30 Days (Indicative)
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 italic mb-6">Select your date above to check precise availability.</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i + 1);
                      const day = date.getDate();
                      
                      const isAvailable = vendor.availabilityRanges?.some(range => {
                        if (!range.start_date || !range.end_date) return false;
                        const [sy, sm, sd] = range.start_date.split('-').map(Number);
                        const start = new Date(sy, sm - 1, sd);
                        
                        const [ey, em, ed] = range.end_date.split('-').map(Number);
                        const end = new Date(ey, em - 1, ed);
                        
                        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        
                        return checkDate >= start && checkDate <= end;
                      }) ?? false;
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center justify-center w-8 h-8 text-xs font-medium border ${isAvailable ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'}`}
                        >
                          {day}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-[#FAF7F2] dark:bg-amber-950/20 border border-amber-200/50 p-6 rounded-lg mt-10">
                  <div className="flex items-center gap-2 text-zinc-500 font-bold tracking-wider text-sm mb-4 uppercase">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Client Reviews
                  </div>
                  
                  {isLoadingReviews ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-amber-100 dark:border-amber-900/30 last:border-0 pb-6 last:pb-0">

                          <p className="text-zinc-700 dark:text-zinc-300 italic mb-3">"{review.review_text}"</p>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{review.reviewer_name}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{format(new Date(review.review_date), 'MMMM yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">No reviews yet.</p>
                  )}
                </div>

              {/* Form Section */}
              <div className="mt-10 border border-amber-200 bg-[#fdfaf6] dark:bg-amber-950/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6 text-amber-600 dark:text-amber-500 font-bold tracking-wider text-sm">
                  <Clock className="w-4 h-4" />
                  REQUEST TENTATIVE BOOKING
                </div>

                {submitResult ? (
                  <div className={`p-4 rounded-md mb-4 ${submitResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {submitResult.success ? submitResult.message : submitResult.error}
                  </div>
                ) : null}

                <form action={async (formData) => {
                  setIsSubmitting(true);
                  setSubmitResult(null);
                  formData.append('vendorEmail', vendor.contact_email || '');
                  formData.append('vendorName', vendor.name);
                  const result = await sendTentativeBookingRequest(null, formData);
                  setSubmitResult(result);
                  setIsSubmitting(false);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Your Full Name</label>
                      <input name="name" required placeholder="Full name" className="w-full flex h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                      <input name="email" type="email" required placeholder="you@email.com" className="w-full flex h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">WhatsApp / Mobile</label>
                      <input name="phone" required placeholder="+94 77 000 0000" className="w-full flex h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Event Date</label>
                      <input name="date" type="date" required className="w-full flex h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Occasion Type</label>
                      <select name="occasion" required className="w-full flex h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
                        <option value="Wedding">Wedding</option>
                        <option value="Corporate Event">Corporate Event</option>
                        <option value="Birthday Party">Birthday Party</option>
                        <option value="Anniversary">Anniversary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Event Location</label>
                      <input name="location" required placeholder="City or venue name" className="w-full flex h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Special Requirements or Questions</label>
                    <textarea name="requirements" rows={3} placeholder="Guest count, specific language requirements, any special requests..." className="w-full flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"></textarea>
                  </div>

                  <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 flex gap-3 text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 mt-6">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p>
                      This sends a <strong>tentative booking request</strong> to the professional via a verified link. No payment is taken at this stage. You will receive a personalised quote and availability confirmation within <strong>24 hours</strong>. Only then do you decide whether to confirm.
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !!(submitResult && submitResult.success)}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A101D] hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 h-12 rounded-md font-bold tracking-wider text-sm mt-4 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> 
                    {isSubmitting ? 'SENDING...' : 'SEND TENTATIVE BOOKING REQUEST'}
                  </button>
                  
                  <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-4">
                    <div className="flex items-center gap-1"><span className="text-zinc-300 dark:text-zinc-600">•</span> Verified professional</div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> Quote within 24 hours</div>
                    <div className="flex items-center gap-1"><Lock className="w-3 h-3 text-amber-500" /> No payment now</div>
                  </div>
                </form>
              </div>
              </div>
            </DialogContent>
          </Dialog>

          {vendor.schedule_url ? (
            <a href={vendor.schedule_url} target="_blank" rel="noopener noreferrer" className="flex-1 w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black">
              Schedule
            </a>
          ) : (
            <Button disabled className="flex-1 w-full">
              Not Available
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
