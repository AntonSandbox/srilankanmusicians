'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { createVendorAction } from './vendor-actions';
import { Loader2, Plus, X } from 'lucide-react';

export function VendorCreationForm() {
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for arrays and complex types
  const [category, setCategory] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  
  const [profileImageId, setProfileImageId] = useState<string>('');
  const [portfolioIds, setPortfolioIds] = useState<string[]>([]);

  const handleAddLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
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
    formData.set('languages', JSON.stringify(languages));
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
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm border">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Create New Vendor</h2>
        <p className="text-sm text-muted-foreground">Fill in the details to register a new vendor and send them an onboarding invite.</p>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Vendor Name</Label>
          <Input id="name" name="name" required placeholder="Acme Events" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Florist">Florist</SelectItem>
              <SelectItem value="DJ">DJ</SelectItem>
              <SelectItem value="Cake Designer">Cake Designer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="City, State" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email (Public)</Label>
          <Input id="contact_email" name="contact_email" type="email" placeholder="hello@vendor.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login_email">Login Email (Private)</Label>
          <Input id="login_email" name="login_email" type="email" required placeholder="admin@vendor.com" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex gap-2">
          <Input 
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddLanguage();
              }
            }}
            placeholder="e.g. English, Spanish" 
          />
          <Button type="button" onClick={handleAddLanguage} variant="secondary">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {languages.map(lang => (
              <span key={lang} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                {lang}
                <button type="button" onClick={() => handleRemoveLanguage(lang)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-4 border-t">
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Vendor...
          </>
        ) : (
          'Create Vendor & Send Invite'
        )}
      </Button>
    </form>
  );
}
