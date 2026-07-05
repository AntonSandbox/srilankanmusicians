'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OCCASIONS, SERVICES, LOCATIONS, LANGUAGES, BUDGET_RANGES } from '@/lib/constants';

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [occasion, setOccasion] = useState(searchParams.get('occasion') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get('date') ? new Date(searchParams.get('date') as string) : undefined
  );
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [budget, setBudget] = useState(searchParams.get('budget') || '');

  // Sync state if URL changes externally
  useEffect(() => {
    setOccasion(searchParams.get('occasion') || '');
    setCategory(searchParams.get('category') || '');
    setDate(searchParams.get('date') ? new Date(searchParams.get('date') as string) : undefined);
    setLocation(searchParams.get('location') || '');
    setLanguage(searchParams.get('language') || '');
    setBudget(searchParams.get('budget') || '');
  }, [searchParams]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (occasion && occasion !== 'none') params.set('occasion', occasion);
    else params.delete('occasion');

    if (category && category !== 'none') params.set('category', category);
    else params.delete('category');
    
    if (date) params.set('date', format(date, 'yyyy-MM-dd'));
    else params.delete('date');

    if (location && location !== 'none') params.set('location', location);
    else params.delete('location');
    
    if (language && language !== 'none') params.set('language', language);
    else params.delete('language');

    if (budget && budget !== 'none') params.set('budget', budget);
    else params.delete('budget');

    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-7xl mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        
        <div className="space-y-2">
          <Label htmlFor="occasion" className="text-zinc-600 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">What is your occasion?</Label>
          <Select value={occasion} onValueChange={(val) => setOccasion(val || '')}>
            <SelectTrigger id="occasion" className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800">
              <SelectValue placeholder="All Occasions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Occasions</SelectItem>
              {OCCASIONS.map((group) => (
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
          <Label htmlFor="category" className="text-zinc-600 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">Talent / Service</Label>
          <Select value={category} onValueChange={(val) => setCategory(val || '')}>
            <SelectTrigger id="category" className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Services</SelectItem>
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
          <Label className="text-zinc-600 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">Event Date</Label>
          <Popover>
            <PopoverTrigger
              className={cn(
                "inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-10 px-4 py-2 w-full font-normal bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-950">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-zinc-600 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">Location</Label>
          <Select value={location} onValueChange={(val) => setLocation(val || '')}>
            <SelectTrigger id="location" className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Locations</SelectItem>
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
          <Label htmlFor="language" className="text-zinc-600 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">Language</Label>
          <Select value={language} onValueChange={(val) => setLanguage(val || '')}>
            <SelectTrigger id="language" className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Languages</SelectItem>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className="text-zinc-600 dark:text-zinc-400 font-medium text-xs uppercase tracking-wider">Budget Range</Label>
          <Select value={budget} onValueChange={(val) => setBudget(val || '')}>
            <SelectTrigger id="budget" className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800">
              <SelectValue placeholder="Any Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any Budget</SelectItem>
              {BUDGET_RANGES.map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2 lg:pt-0">
          <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg transition-transform hover:scale-[1.02]">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
