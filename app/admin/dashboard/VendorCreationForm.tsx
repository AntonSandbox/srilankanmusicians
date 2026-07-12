'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { createVendorAction } from './vendor-actions';
import { Loader2, Plus, X } from 'lucide-react';
import { OCCASIONS, SERVICES, LOCATIONS, LANGUAGES, BUDGET_RANGES } from '@/lib/constants';

export function VendorCreationForm() {
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for arrays and complex types
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  
  const [profileImageId, setProfileImageId] = useState<string>('');
  const [portfolioIds, setPortfolioIds] = useState<string[]>([]);

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const toggleOccasion = (occasion: string) => {
    setOccasions(prev => prev.includes(occasion) ? prev.filter(o => o !== occasion) : [...prev, occasion]);
  };

  const handleAddPortfolioImage = (id: string) => {
    if (portfolioIds.length < 5) {
      setPortfolioIds([...portfolioIds, id]);
    }
  };

  const handleRemovePortfolioImage = (idToRemove: string) => {
    setPortfolioIds(portfolioIds.filter(id => id !== idToRemove));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!category) {
      setErrorMsg('Category is required');
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set('category', category);
    formData.set('location', location);
    formData.set('budget_range', budgetRange);
    formData.set('languages', JSON.stringify(languages));
    formData.set('occasions', JSON.stringify(occasions));
    formData.set('portfolio', JSON.stringify(portfolioIds));
    if (profileImageId) {
      formData.set('profile_image', profileImageId);
    }

    startTransition(async () => {
      const result = await createVendorAction(formData);
      if (result.success) {
        setSuccessMsg('Vendor created successfully and onboarding email sent!');
        // Optional: reset form state
      } else {
        setErrorMsg(result.error || 'Failed to create vendor');
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.12)] space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-medium admin-heading" style={{ color: '#0F172A' }}>Register New Vendor</h2>
        <p className="text-sm" style={{ color: '#1B2740' }}>Fill in the details to register a new vendor and send them an onboarding invite.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4 border-b border-[rgba(15,23,42,0.12)] pb-2">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Vendor Name</Label>
            <Input id="name" name="name" required placeholder="Acme Events" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(val) => setCategory(val || '')} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((serviceGroup) => (
                  <SelectGroup key={serviceGroup.group}>
                    <SelectLabel>{serviceGroup.group}</SelectLabel>
                    {serviceGroup.items.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={location} onValueChange={(val) => setLocation(val || '')} required>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((locationGroup) => (
                  <SelectGroup key={locationGroup.group}>
                    <SelectLabel>{locationGroup.group}</SelectLabel>
                    {locationGroup.items.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="budget_range">Budget Range</Label>
            <Select value={budgetRange} onValueChange={(val) => setBudgetRange(val || '')} required>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4 border-b border-[rgba(15,23,42,0.12)] pb-2">Contact & Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email (Public)</Label>
            <Input id="contact_email" name="contact_email" type="email" placeholder="hello@vendor.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login_email">Login Email (Private)</Label>
            <Input id="login_email" name="login_email" type="email" required placeholder="admin@vendor.com" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="video_url">Background Video URL (YouTube only)</Label>
            <Input 
              id="video_url" 
              name="video_url" 
              type="url" 
              placeholder="https://www.youtube.com/watch?v=..." 
              pattern="^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.*$"
              title="Please enter a valid YouTube URL"
            />
          </div>
        </div>
      </div>

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
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                    languages.includes(lang)
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
                  <h4 className="text-sm font-semibold text-[#1B2740] mb-2">{occasionGroup.group}</h4>
                  <div className="flex flex-wrap gap-2">
                    {occasionGroup.items.map((occasion) => (
                      <button
                        key={occasion}
                        type="button"
                        onClick={() => toggleOccasion(occasion)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                          occasions.includes(occasion)
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

      <div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4 border-b border-[rgba(15,23,42,0.12)] pb-2">Profile & Portfolio Images</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="p-4 border border-dashed rounded-md bg-slate-50">
              {profileImageId ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Image uploaded: {profileImageId}</span>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setProfileImageId('')}>Remove</Button>
                </div>
              ) : (
                <ImageUploader onUploadComplete={(id) => setProfileImageId(id)} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Portfolio Images ({portfolioIds.length} / 5)</Label>
            <div className="p-4 border border-dashed rounded-md bg-slate-50 space-y-4">
              {portfolioIds.length > 0 && (
                <ul className="space-y-2">
                  {portfolioIds.map((id, index) => (
                    <li key={index} className="flex items-center justify-between text-sm bg-white p-2 border rounded-md">
                      <span>Portfolio Item {index + 1}: {id}</span>
                      <Button variant="ghost" size="sm" type="button" onClick={() => handleRemovePortfolioImage(id)}>Remove</Button>
                    </li>
                  ))}
                </ul>
              )}
              
              {portfolioIds.length < 5 ? (
                <ImageUploader onUploadComplete={handleAddPortfolioImage} />
              ) : (
                <p className="text-sm text-muted-foreground text-center">Maximum of 5 portfolio images reached.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        {successMsg && (
          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
            {errorMsg}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full bg-[#E8960C] hover:bg-[#F5A929] text-[#0F172A] font-bold text-[14.5px] py-6 rounded-md">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Vendor...
            </>
          ) : (
            'Create Vendor & Send Invite'
          )}
        </Button>
      </div>
    </form>
  );
}
