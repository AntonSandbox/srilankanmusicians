import { Button } from '@/components/ui/button';
import { logoutAction } from './layout-actions';
import { LogOut } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ 
      backgroundColor: '#F8F6F1', 
      color: '#0F172A',
      fontFamily: '"Work Sans", sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@400;500;600;700&display=swap');
        .admin-heading { font-family: 'Fraunces', serif; }
      `}} />
      <header className="px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm gap-4 flex-wrap" style={{ backgroundColor: '#EFEAE0', borderBottom: '1px solid rgba(15,23,42,0.12)' }}>
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-2xl font-medium admin-heading" style={{ color: '#0F172A' }}>Admin Portal</h1>
            <p className="text-sm font-medium mt-1 hidden sm:block" style={{ color: '#1B2740' }}>System Management</p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm" className="hover:bg-[rgba(15,23,42,0.08)] font-semibold text-[#0F172A]">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
