'use client';

import { useState, useActionState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateVendorProfile, toggleBlockedDate } from './actions';
import { Loader2 } from 'lucide-react';
import { Vendor } from '@/components/vendor-card';
import { format } from 'date-fns';

interface VendorDashboardClientProps {
  vendor: Vendor;
  blockedDates: Date[];
}

export function VendorDashboardClient({ vendor, blockedDates: initialBlockedDates }: VendorDashboardClientProps) {
  const [blockedDates, setBlockedDates] = useState<Date[]>(initialBlockedDates);
  const [profileState, profileAction, isProfilePending] = useActionState(updateVendorProfile, null);

  const handleDayClick = async (day: Date, modifiers: { selected?: boolean }) => {
    // Check if currently blocked
    const isCurrentlyBlocked = modifiers.selected;
    
    // Optimistic UI update
    if (isCurrentlyBlocked) {
      setBlockedDates(prev => prev.filter(d => format(d, 'yyyy-MM-dd') !== format(day, 'yyyy-MM-dd')));
    } else {
      setBlockedDates(prev => [...prev, day]);
    }

    // Server update
    const result = await toggleBlockedDate(day, !!isCurrentlyBlocked);
    
    if (result.error) {
      // Revert on error
      if (isCurrentlyBlocked) {
        setBlockedDates(prev => [...prev, day]);
      } else {
        setBlockedDates(prev => prev.filter(d => format(d, 'yyyy-MM-dd') !== format(day, 'yyyy-MM-dd')));
      }
      alert(`Failed to update availability: ${result.error}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Profile Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <form action={profileAction} className="space-y-4">
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
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" name="contact_email" defaultValue={vendor.contact_email || ''} placeholder="Booking email address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={vendor.location || ''} placeholder="e.g. New York, NY" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages (comma separated)</Label>
            <Input id="languages" name="languages" defaultValue={vendor.languages?.join(', ') || ''} placeholder="English, Spanish" />
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-2">Availability Calendar</h2>
        <p className="text-sm text-gray-500 mb-6">Click dates to block or unblock them from your public calendar.</p>
        
        <div className="flex justify-center border border-gray-100 rounded-lg p-4 bg-gray-50">
          <Calendar
            mode="multiple"
            selected={blockedDates}
            onDayClick={handleDayClick}
            className="bg-white rounded-md shadow-sm border border-gray-200"
          />
        </div>
      </div>
    </div>
  );
}
