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
  const [languages, setLanguages] = useState<string[]>(searchParams.getAll('language'));
  const [budget, setBudget] = useState(searchParams.get('budget') || '');

  // Sync state if URL changes externally
  useEffect(() => {
    setOccasion(searchParams.get('occasion') || '');
    setCategory(searchParams.get('category') || '');
    setDate(searchParams.get('date') ? new Date(searchParams.get('date') as string) : undefined);
    setLocation(searchParams.get('location') || '');
    setLanguages(searchParams.getAll('language'));
    setBudget(searchParams.get('budget') || '');
  }, [searchParams]);

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

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
    
    params.delete('language');
    languages.forEach(lang => {
      params.append('language', lang);
    });

    if (budget && budget !== 'none') params.set('budget', budget);
    else params.delete('budget');

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="search-engine mt-12 mx-auto text-left rounded-lg overflow-visible">
      <form onSubmit={handleSearch}>
        <div className="se-head">
          <span className="se-title"><i className="fas fa-search" style={{marginRight:'7px',color:'var(--saffron)'}}></i>Search available talent</span>
          <span className="se-avail">Search our verified professionals</span>
        </div>
        <div className="se-row se-r1">
          <div className="sf">
            <label htmlFor="s-occasion">What is your occasion?</label>
            <div style={{position:'relative'}}>
              <i className="fas fa-calendar-star sf-ico"></i>
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
          </div>
          <div className="sf">
            <label htmlFor="s-talent">Talent / Service needed</label>
            <div style={{position:'relative'}}>
              <i className="fas fa-user-tie sf-ico"></i>
              <select id="s-talent" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="none">All Services</option>
                {SERVICES.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.items.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <div className="sf">
            <label htmlFor="s-date">Event date</label>
            <div style={{position:'relative'}}>
              <i className="fas fa-calendar-alt sf-ico"></i>
              <input 
                type="date" 
                id="s-date" 
                style={{paddingLeft:'36px'}} 
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>
        <div className="se-row se-r2">
          <div className="sf">
            <label htmlFor="s-loc">Location</label>
            <div style={{position:'relative'}}>
              <i className="fas fa-map-marker-alt sf-ico"></i>
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
          </div>
          <div className="sf">
            <label htmlFor="s-lang">Language</label>
            <div style={{position:'relative'}}>
              <i className="fas fa-language sf-ico"></i>
              <select id="s-lang" value={languages[0] || 'none'} onChange={(e) => setLanguages(e.target.value === 'none' ? [] : [e.target.value])}>
                <option value="none">Preferred language</option>
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="sf">
            <label htmlFor="s-budget">Budget range</label>
            <div style={{position:'relative'}}>
              <i className="fas fa-coins sf-ico"></i>
              <select id="s-budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="none">Any Budget</option>
                {BUDGET_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="sf" style={{display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
            <label style={{color:'transparent',userSelect:'none'}}>.</label>
            <div className="se-actions">
              <button type="submit" className="se-btn">
                <i className="fas fa-search"></i> Find Available Talent
              </button>
            </div>
          </div>
        </div>
        <p className="se-hint">Only professionals available on your date are shown &nbsp;&middot;&nbsp; <strong>Free to search and enquire</strong></p>
      </form>
    </div>
  );
}
