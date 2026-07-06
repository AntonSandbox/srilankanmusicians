'use client';

import { useState, useActionState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateVendorProfile, addAvailableRange, deleteAvailableRange } from './actions';
import { Loader2, Trash2 } from 'lucide-react';
import { Vendor } from '@/components/vendor-card';
import { format } from 'date-fns';
import { OCCASIONS, SERVICES, LOCATIONS, LANGUAGES, BUDGET_RANGES } from '@/lib/constants';
import { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';

export interface AvailableRange {
  id: string;
  start_date: string;
  end_date: string;
}

interface VendorDashboardClientProps {
  vendor: Vendor;
  availableRanges: AvailableRange[];
}

export function VendorDashboardClient({ vendor, availableRanges }: VendorDashboardClientProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSubmittingRange, setIsSubmittingRange] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [profileState, profileAction, isProfilePending] = useActionState(updateVendorProfile, null);

  const [category, setCategory] = useState(vendor.category || '');
  const [location, setLocation] = useState(vendor.location || '');
  const [budgetRange, setBudgetRange] = useState(vendor.budget_range || '');
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
    formData.set('languages', JSON.stringify(languages));
    formData.set('occasions', JSON.stringify(occasions));
    profileAction(formData);
  };

  const handleAddRange = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      alert('Please select both a start and end date.');
      return;
    }
    
    setIsSubmittingRange(true);
    const result = await addAvailableRange(dateRange.from, dateRange.to);
    setIsSubmittingRange(false);
    
    if (result.error) {
      alert(`Failed to add range: ${result.error}`);
    } else {
      setDateRange(undefined);
      router.refresh();
    }
  };

  const handleDeleteRange = async (id: string) => {
    setIsDeleting(id);
    const result = await deleteAvailableRange(id);
    setIsDeleting(null);
    
    if (result.error) {
      alert(`Failed to delete range: ${result.error}`);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Profile Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <form action={handleProfileSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="budget_range">Budget Range</Label>
            <Select value={budgetRange} onValueChange={(val) => setBudgetRange(val || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select Budget Range" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Languages</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    languages.includes(lang)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-foreground hover:bg-slate-100 border-input'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Occasions</Label>
            <div className="space-y-4">
              {OCCASIONS.map((occasionGroup) => (
                <div key={occasionGroup.group} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{occasionGroup.group}</h4>
                  <div className="flex flex-wrap gap-2">
                    {occasionGroup.items.map((occasion) => (
                      <button
                        key={occasion}
                        type="button"
                        onClick={() => toggleOccasion(occasion)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                          occasions.includes(occasion)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-white text-foreground hover:bg-slate-100 border-input'
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

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" name="contact_email" defaultValue={vendor.contact_email || ''} placeholder="Booking email address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule_url">External Booking Link</Label>
            <Input id="schedule_url" name="schedule_url" defaultValue={vendor.schedule_url || ''} placeholder="https://calendly.com/your-link" />
          </div>

          <Button type="submit" disabled={isProfilePending} className="w-full">
            {isProfilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </form>
      </div>

      {/* Availability Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <h2 className="text-2xl font-bold mb-2">Available Ranges</h2>
        <p className="text-sm text-gray-500 mb-6">Define blocks of dates when you are available to take bookings.</p>
        
        <div className="flex flex-col items-center border border-gray-100 rounded-lg p-4 bg-gray-50 mb-6">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={1}
            className="bg-white rounded-md shadow-sm border border-gray-200"
          />
          <Button 
            onClick={handleAddRange} 
            disabled={isSubmittingRange || !dateRange?.from || !dateRange?.to}
            className="mt-6 w-full max-w-[280px]"
          >
            {isSubmittingRange ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Availability Range
          </Button>
        </div>

        <div className="space-y-4 flex-1">
          <h3 className="font-semibold text-lg border-b pb-2">Saved Ranges</h3>
          {availableRanges.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No available ranges saved yet.</p>
          ) : (
            <ul className="space-y-3">
              {availableRanges.map(range => (
                <li key={range.id} className="flex items-center justify-between bg-gray-50 border p-3 rounded-lg">
                  <div className="text-sm font-medium">
                    {format(new Date(range.start_date), 'MMM d, yyyy')} — {format(new Date(range.end_date), 'MMM d, yyyy')}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    disabled={isDeleting === range.id}
                    onClick={() => handleDeleteRange(range.id)}
                  >
                    {isDeleting === range.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
