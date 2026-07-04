import { VendorCreationForm } from './VendorCreationForm';

export default function AdminDashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <VendorCreationForm />
    </main>
  );
}
