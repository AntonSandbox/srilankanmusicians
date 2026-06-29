import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { logoutAction } from './layout-actions';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-white dark:bg-zinc-950">
      {/* Sidebar Navigation */}
      <aside className="w-full border-b bg-zinc-50 dark:bg-zinc-900 md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <span className="font-semibold text-lg tracking-tight">Admin Panel</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Overview
            </Link>
            <Link
              href="/admin/dashboard/vendors"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Vendors
            </Link>
          </nav>
          <div className="border-t p-4">
            <form action={logoutAction}>
              <Button type="submit" variant="outline" className="w-full">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
