'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const isOverview = pathname === '/admin/dashboard';
  const isVendors = pathname === '/admin/dashboard/vendors';

  return (
    <div className="md:w-64 flex-shrink-0">
      <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto pb-4 md:pb-0 sticky top-24">
        <Link
          href="/admin/dashboard"
          className={`flex items-center px-4 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
            isOverview 
              ? 'bg-[#E8960C] text-[#0F172A]' 
              : 'text-[#1B2740] hover:bg-[#EFEAE0]'
          }`}
        >
          <Home className="w-4 h-4 mr-3" /> Overview
        </Link>
        <Link
          href="/admin/dashboard/vendors"
          className={`flex items-center px-4 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
            isVendors 
              ? 'bg-[#E8960C] text-[#0F172A]' 
              : 'text-[#1B2740] hover:bg-[#EFEAE0]'
          }`}
        >
          <Users className="w-4 h-4 mr-3" /> Vendors
        </Link>
      </nav>
    </div>
  );
}
