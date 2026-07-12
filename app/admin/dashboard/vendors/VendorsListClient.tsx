'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendSetupLink, sendForgotPasswordLink } from './vendor-management-actions';
import { Loader2, Mail, MailWarning, Edit, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminVendor {
  id: string;
  name: string;
  category: string;
  contact_email: string;
  login_email: string;
  created_at: string;
  has_setup_password: boolean;
}

export function VendorsListClient({ initialVendors }: { initialVendors: AdminVendor[] }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleSendSetupLink = async (vendor: AdminVendor) => {
    if (!confirm(`Send setup link to ${vendor.login_email}?`)) return;
    setLoadingAction(`setup-${vendor.id}`);
    const result = await sendSetupLink(vendor.id, vendor.login_email, vendor.name);
    setLoadingAction(null);
    if (result.success) {
      alert('Setup link sent successfully!');
    } else {
      alert(`Failed to send setup link: ${result.error}`);
    }
  };

  const handleSendForgotPwd = async (vendor: AdminVendor) => {
    if (!confirm(`Send forgot password link to ${vendor.login_email}?`)) return;
    setLoadingAction(`forgot-${vendor.id}`);
    const result = await sendForgotPasswordLink(vendor.login_email);
    setLoadingAction(null);
    if (result.success) {
      alert('Forgot password link sent successfully!');
    } else {
      alert(`Failed to send forgot password link: ${result.error}`);
    }
  };

  const navigateToEdit = (id: string) => {
    router.push(`/admin/dashboard/vendors/${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-[#1B2740] uppercase bg-[#F8F6F1] border-b border-[rgba(15,23,42,0.12)]">
          <tr>
            <th className="px-4 py-3">Vendor</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Login Email</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialVendors.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No vendors found.
              </td>
            </tr>
          ) : (
            initialVendors.map((vendor) => (
              <tr key={vendor.id} className="border-b border-[rgba(15,23,42,0.08)] hover:bg-[#F8F6F1]/50 transition-colors">
                <td className="px-4 py-4 font-medium text-[#0F172A]">
                  {vendor.name}
                </td>
                <td className="px-4 py-4 text-[#1B2740]">
                  {vendor.category}
                </td>
                <td className="px-4 py-4 text-[#1B2740]">
                  {vendor.login_email}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-center gap-1">
                    {vendor.has_setup_password ? (
                      <span className="flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Set Up
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                        <XCircle className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {vendor.has_setup_password ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendForgotPwd(vendor)}
                        disabled={loadingAction === `forgot-${vendor.id}`}
                        className="text-xs h-8 px-2 border-[rgba(15,23,42,0.12)] hover:bg-[#EFEAE0]"
                        title="Send Forgot Password"
                      >
                        {loadingAction === `forgot-${vendor.id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Reset Pwd
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendSetupLink(vendor)}
                        disabled={loadingAction === `setup-${vendor.id}`}
                        className="text-xs h-8 px-2 border-[rgba(15,23,42,0.12)] hover:bg-[#EFEAE0]"
                        title="Resend Setup Link"
                      >
                        {loadingAction === `setup-${vendor.id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <MailWarning className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Resend Link
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      onClick={() => navigateToEdit(vendor.id)}
                      className="text-xs h-8 px-3 bg-[#1B2740] hover:bg-[#0F172A] text-white"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
