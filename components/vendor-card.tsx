'use client';

import { Calendar, Globe2, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
}

interface VendorCardProps {
  vendor: Vendor;
  cloudflareAccountHash: string;
}

export function VendorCard({ vendor, cloudflareAccountHash }: VendorCardProps) {
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
          <Dialog>
            <DialogTrigger className="flex-1 w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-zinc-300 dark:border-zinc-700 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              View Profile
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">{vendor.name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                  <img 
                    src={profileImageUrl} 
                    alt={vendor.name} 
                    className="w-full rounded-xl object-cover h-80 shadow-md"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase text-zinc-500 tracking-wider">Service</h4>
                    <p className="text-lg text-zinc-900 dark:text-zinc-100">{vendor.category}</p>
                  </div>
                  {vendor.location && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-zinc-500 tracking-wider">Location</h4>
                      <p className="text-lg text-zinc-900 dark:text-zinc-100">{vendor.location}</p>
                    </div>
                  )}
                  {vendor.languages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-zinc-500 tracking-wider">Languages</h4>
                      <p className="text-lg text-zinc-900 dark:text-zinc-100">{vendor.languages.join(', ')}</p>
                    </div>
                  )}
                  {vendor.contact_email && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-zinc-500 tracking-wider">Contact Email</h4>
                      <p className="text-lg text-zinc-900 dark:text-zinc-100">{vendor.contact_email}</p>
                    </div>
                  )}
                  {vendor.schedule_url && (
                    <div className="pt-4">
                      <a href={vendor.schedule_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-10 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                        <Calendar className="mr-2 h-5 w-5" /> Schedule Consultation
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {vendor.portfolio && vendor.portfolio.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xl font-bold mb-4">Portfolio Gallery</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {vendor.portfolio.map((imgId, idx) => (
                      <img 
                        key={idx}
                        src={getImageUrl(imgId)}
                        alt={`${vendor.name} portfolio ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
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
