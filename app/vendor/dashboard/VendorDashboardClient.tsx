'use client';

import { useState, useActionState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateVendorProfile, addUnavailableSlot, clearUnavailableSlots, deleteUnavailableSlot, addVendorReview, deleteVendorReview } from './actions';
import { Loader2, Trash2, Star, User, CalendarDays, MessageSquare } from 'lucide-react';
import { Vendor } from '@/components/vendor-card';
import { format } from 'date-fns';
import { OCCASIONS, SERVICES, LOCATIONS, LANGUAGES, BUDGET_RANGES } from '@/lib/constants';
import { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

import { VendorCalendar } from '@/components/vendor-calendar';

export interface UnavailableSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface VendorReview {
  id: string;
  reviewer_name: string;
  review_text: string;
  review_date: string;
}

interface VendorDashboardClientProps {
  vendor: Vendor;
  unavailableSlots: UnavailableSlot[];
  initialReviews: VendorReview[];
}

export function VendorDashboardClient({ vendor, unavailableSlots, initialReviews }: VendorDashboardClientProps) {
  const router = useRouter();
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'availability' | 'reviews'>('profile');

  const [profileState, profileAction, isProfilePending] = useActionState(updateVendorProfile, null);
  const [reviewState, reviewAction, isReviewPending] = useActionState(addVendorReview, null);

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (profileState?.success) {
      setProfileSuccess(true);
      const t = setTimeout(() => setProfileSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [profileState?.success]);

  useEffect(() => {
    if (reviewState?.success) {
      setReviewSuccess(true);
      const t = setTimeout(() => setReviewSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [reviewState?.success]);

  const [category, setCategory] = useState(vendor.category || '');
  const [location, setLocation] = useState(vendor.location || '');
  const [budgetRange, setBudgetRange] = useState(vendor.budget_range || '');
  const [bio, setBio] = useState(vendor.bio || '');
  const [languages, setLanguages] = useState<string[]>(vendor.languages || []);
  const [occasions, setOccasions] = useState<string[]>(vendor.occasions || []);

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const toggleOccasion = (occasion: string) => {
    setOccasions(prev => prev.includes(occasion) ? prev.filter(o => o !== occasion) : [...prev, occasion]);
  };

  const handleProfileSubmit = (formData: FormData) => {
    formData.set('category', category);
    formData.set('location', location);
    formData.set('budget_range', budgetRange);
    formData.set('bio', bio);
    formData.set('languages', JSON.stringify(languages));
    formData.set('occasions', JSON.stringify(occasions));
    profileAction(formData);
  };

  // Availability handlers for VendorCalendar
  const handleAddSlot = async (dates: string[], start: string, end: string) => {
    setIsSubmittingSlot(true);
    const result = await addUnavailableSlot(dates, start, end);
    setIsSubmittingSlot(false);
    if (result.error) alert(result.error);
    else router.refresh();
  };

  const handleClearSlots = async (dates: string[]) => {
    setIsSubmittingSlot(true);
    const result = await clearUnavailableSlots(dates);
    setIsSubmittingSlot(false);
    if (result.error) alert(result.error);
    else router.refresh();
  };

  const handleDeleteSlot = async (id: string) => {
    setIsSubmittingSlot(true);
    const result = await deleteUnavailableSlot(id);
    setIsDeleting(null);
    setIsSubmittingSlot(false);

    if (result.error) {
      alert(`Failed to delete unavailable slot: ${result.error}`);
    } else {
      router.refresh();
    }
  };

  const handleDeleteReview = async (id: string) => {
    setIsDeletingReview(id);
    const result = await deleteVendorReview(id);
    setIsDeletingReview(null);

    if (result.error) {
      alert(`Failed to delete review: ${result.error}`);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="md:w-64 flex-shrink-0">
        <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto pb-4 md:pb-0 sticky top-24">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-4 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-[#E8960C] text-[#0F172A]' : 'text-[#1B2740] hover:bg-[#EFEAE0]'
              }`}
          >
            <User className="w-4 h-4 mr-3" /> Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`flex items-center px-4 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'availability' ? 'bg-[#E8960C] text-[#0F172A]' : 'text-[#1B2740] hover:bg-[#EFEAE0]'
              }`}
          >
            <CalendarDays className="w-4 h-4 mr-3" /> Availability
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center px-4 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'bg-[#E8960C] text-[#0F172A]' : 'text-[#1B2740] hover:bg-[#EFEAE0]'
              }`}
          >
            <MessageSquare className="w-4 h-4 mr-3" /> Manage Reviews
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Profile Panel */}
        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-lg shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.12)]">
            <h2 className="text-2xl font-medium vendor-heading mb-6" style={{ color: '#0F172A' }}>Profile Settings</h2>
            <form action={handleProfileSubmit} className="space-y-8">
              {profileState?.error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                  {profileState.error}
                </div>
              )}
              {profileState?.success && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
                  {profileState.success}
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4 border-b border-[rgba(15,23,42,0.12)] pb-2">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Vendor Bio / Description</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Passionate professional ready to make your event unforgettable."
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(val) => setCategory(val || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICES.map((group) => (
                          <SelectGroup key={group.group}>
                            <SelectLabel>{group.group}</SelectLabel>
                            {group.items.map((item) => (
                              <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select value={location} onValueChange={(val) => setLocation(val || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((group) => (
                          <SelectGroup key={group.group}>
                            <SelectLabel>{group.group}</SelectLabel>
                            {group.items.map((item) => (
                              <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="budget_range">Budget Range</Label>
                    <Select value={budgetRange} onValueChange={(val) => setBudgetRange(val || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Budget Range" />
                      </SelectTrigger>
                      <SelectContent>
                        {(category === 'Emcees/ MC/ Compere' || category === 'Cake Artist' 
                          ? ['Under LKR 25,000', 'LKR 25,000 – 50,000', 'LKR 50,000 – 100,000', 'LKR 100,000 – 200,000', 'Above LKR 200,000'] 
                          : BUDGET_RANGES).map((range) => (
                          <SelectItem key={range} value={range}>{range}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 2: Specialties */}
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4 border-b border-[rgba(15,23,42,0.12)] pb-2">Specialties</h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${languages.includes(lang)
                            ? 'bg-[#E8960C] text-[#0F172A] border-[#E8960C]'
                            : 'bg-[#F8F6F1] text-[#1B2740] hover:bg-[#EFEAE0] border-[rgba(15,23,42,0.12)]'
                            }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Occasions</Label>
                    <div className="space-y-4">
                      {OCCASIONS.map((occasionGroup) => (
                        <div key={occasionGroup.group} className="space-y-2 bg-[#F8F6F1] p-4 rounded-lg border border-[rgba(15,23,42,0.08)]">
                          <div className="flex flex-wrap gap-2">
                            {occasionGroup.items.map((occasion) => (
                              <button
                                key={occasion}
                                type="button"
                                onClick={() => toggleOccasion(occasion)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${occasions.includes(occasion)
                                  ? 'bg-[#E8960C] text-[#0F172A] border-[#E8960C]'
                                  : 'bg-white text-[#1B2740] hover:bg-[#EFEAE0] border-[rgba(15,23,42,0.12)]'
                                  }`}
                              >
                                {occasion}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Links */}
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4 border-b border-[rgba(15,23,42,0.12)] pb-2">Contact & Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input id="contact_email" name="contact_email" defaultValue={vendor.contact_email || ''} placeholder="Booking email address" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule_url">External Booking Link</Label>
                    <Input id="schedule_url" name="schedule_url" defaultValue={vendor.schedule_url || ''} placeholder="https://calendly.com/your-link" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="video_url">Background Video URL (YouTube only)</Label>
                    <Input
                      id="video_url"
                      name="video_url"
                      type="url"
                      defaultValue={vendor.video_url || ''}
                      placeholder="https://www.youtube.com/watch?v=..."
                      pattern="^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.*$"
                      title="Please enter a valid YouTube URL"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isProfilePending || profileSuccess} className={`w-full font-bold text-[14.5px] py-6 rounded-md transition-colors ${profileSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#E8960C] hover:bg-[#F5A929] text-[#0F172A]'}`}>
                  {isProfilePending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...</>
                  ) : profileSuccess ? (
                    <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> SAVED SUCCESSFULLY</>
                  ) : (
                    <>Save Profile Changes</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Availability Panel */}
        {activeTab === 'availability' && (
          <VendorCalendar
            unavailableSlots={unavailableSlots}
            onAddSlot={handleAddSlot}
            onClearSlots={handleClearSlots}
            onDeleteSlot={handleDeleteSlot}
            isSubmitting={isSubmittingSlot}
          />
        )}

        {/* Reviews Panel */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1 bg-white p-6 rounded-lg shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.12)] h-fit">
              <h2 className="text-xl font-medium vendor-heading mb-2" style={{ color: '#0F172A' }}>Add Review</h2>
              <p className="text-xs text-gray-500 mb-6">Showcase past clients.</p>

              <form action={(formData) => { reviewAction(formData); }} className="space-y-4">
                {reviewState?.error && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs">
                    {reviewState.error}
                  </div>
                )}
                {reviewState?.success && (
                  <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs">
                    {reviewState.success}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reviewer_name">Reviewer Name</Label>
                  <Input id="reviewer_name" name="reviewer_name" placeholder="John & Jane" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review_date">Review Date</Label>
                  <Input id="review_date" name="review_date" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review_text">Review</Label>
                  <textarea
                    id="review_text"
                    name="review_text"
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="They did an amazing job..."
                    required
                  />
                </div>

                <Button type="submit" disabled={isReviewPending || reviewSuccess} className={`w-full font-bold py-6 rounded-md mt-2 transition-colors ${reviewSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#E8960C] hover:bg-[#F5A929] text-[#0F172A]'}`}>
                  {isReviewPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SUBMITTING...</>
                  ) : reviewSuccess ? (
                    <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> REVIEW SUBMITTED</>
                  ) : (
                    <>Submit Review</>
                  )}
                </Button>
              </form>
            </div>

            <div className="xl:col-span-2 bg-white p-8 rounded-lg shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.12)]">
              <h2 className="text-2xl font-medium vendor-heading mb-6" style={{ color: '#0F172A' }}>Saved Reviews</h2>
              {initialReviews.length === 0 ? (
                <div className="bg-[#F8F6F1] border border-dashed border-[rgba(15,23,42,0.2)] rounded-lg p-10 text-center">
                  <Star className="w-8 h-8 text-[rgba(15,23,42,0.4)] mx-auto mb-3" />
                  <p className="text-sm text-[#1B2740] font-medium">No reviews saved yet.</p>
                  <p className="text-xs text-gray-500 mt-1">Add reviews from past clients to build trust on your profile.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {initialReviews.map(review => (
                    <div key={review.id} className="bg-[#F8F6F1] border border-[rgba(15,23,42,0.08)] rounded-lg p-5 flex flex-col justify-between">
                      <div>
                        {/* <div className="flex text-[#E8960C] mb-3">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div> */}
                        <p className="text-sm text-[#1B2740] italic mb-4 leading-relaxed">"{review.review_text}"</p>
                        <p className="font-semibold text-sm text-[#0F172A]">{review.reviewer_name}</p>
                        <p className="text-xs text-gray-500">{format(new Date(review.review_date), 'MMMM yyyy')}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[rgba(15,23,42,0.08)] flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2 transition-colors"
                          disabled={isDeletingReview === review.id}
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          {isDeletingReview === review.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Trash2 className="mr-2 h-3 w-3" />}
                          <span className="text-xs font-semibold">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
