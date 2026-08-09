'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarIcon, Search, Loader2 } from 'lucide-react';
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
import { OCCASIONS, LOCATIONS, LANGUAGES } from '@/lib/constants';

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [occasion, setOccasion] = useState(searchParams.get('occasion') || '');
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get('date') ? new Date(searchParams.get('date') as string) : undefined
  );
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [budget, setBudget] = useState(searchParams.get('budget') || '');
  const [name, setName] = useState(searchParams.get('name') || '');

  // Sync state if URL changes externally
  useEffect(() => {
    setOccasion(searchParams.get('occasion') || '');
    setDate(searchParams.get('date') ? new Date(searchParams.get('date') as string) : undefined);
    setLocation(searchParams.get('location') || '');
    setBudget(searchParams.get('budget') || '');
    setName(searchParams.get('name') || '');
  }, [searchParams]);


  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (occasion && occasion !== 'none') params.set('occasion', occasion);
    else params.delete('occasion');

    if (date) params.set('date', format(date, 'yyyy-MM-dd'));
    else params.delete('date');

    if (location && location !== 'none') params.set('location', location);
    else params.delete('location');


    if (budget && budget !== 'none') params.set('budget', budget);
    else params.delete('budget');


    if (name.trim()) params.set('name', name.trim());
    else params.delete('name');


    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <div className="search-panel">
      <form onSubmit={handleSearch}>
        <div className="search-grid" style={{ marginBottom: '22px' }}>
          <div className="field">
            <label htmlFor="s-occasion">What is your occasion</label>
            <select id="s-occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              <option value="none">All Occasions</option>
              {OCCASIONS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-name">Search by Name</label>
            <input
              type="text"
              id="s-name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="s-date">Event date</label>
            <input
              type="date"
              id="s-date"
              value={date ? format(date, 'yyyy-MM-dd') : ''}
              onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>
          <div className="field">
            <label htmlFor="s-loc">Location</label>
            <select id="s-loc" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="none">All Locations</option>
              {LOCATIONS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-budget">Budget range</label>
            <select id="s-budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="none">Any Budget</option>
              {['Under LKR 20,000', 'Starting from LKR 20,000', 'Starting from LKR 50,000', 'Starting from LKR 100,000', 'Starting from LKR 250,000', 'Starting from  LKR 500,000'].map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={isPending} className="search-btn flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            'Find Available Cake Artists'
          )}
        </button>
      </form>
    </div>
  );
}
