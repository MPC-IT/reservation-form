// pages/admin/index.tsx
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin</h1>

      <div className="space-y-4">
        <button
          onClick={() => router.push('/admin/users')}
          className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <h2 className="text-lg font-semibold mb-2">Manage Users</h2>
          <p className="text-gray-600">Create and manage staff accounts</p>
        </button>

        <button
          onClick={() => router.push('/admin/data')}
          className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <h2 className="text-lg font-semibold mb-2">Manage Reservation Data</h2>
          <p className="text-gray-600">View, edit, export reservations, and manage companies/setups</p>
        </button>
      </div>
    </div>
  );
}
