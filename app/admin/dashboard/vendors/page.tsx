import { getVendorsList } from './vendor-management-actions';
import { VendorsListClient } from './VendorsListClient';

export const dynamic = 'force-dynamic';

export default async function AdminVendorsPage() {
  const result = await getVendorsList();
  
  if (!result.success) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-md">
        Error loading vendors: {result.error}
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.12)]">
      <div className="mb-6">
        <h2 className="text-2xl font-medium admin-heading" style={{ color: '#0F172A' }}>Manage Vendors</h2>
        <p className="text-sm" style={{ color: '#1B2740' }}>View all registered vendors, check their setup status, and manage their profiles.</p>
      </div>

      <VendorsListClient initialVendors={result.vendors || []} />
    </div>
  );
}
