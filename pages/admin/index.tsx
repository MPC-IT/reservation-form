// pages/admin/index.tsx
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Admin Panel</h1>
        <p className="text-secondary">
          Manage users, reservations, and system settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="card p-6 text-left hover:border-accent transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-accent/20 transition-colors">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">Manage Users</h2>
              <p className="text-sm text-muted">User administration</p>
            </div>
          </div>
          <p className="text-secondary mb-4">
            Create and manage staff accounts, permissions, and access levels
          </p>
          <div className="flex items-center text-accent group-hover:text-accent-hover transition-colors">
            <span className="text-sm font-medium">Manage Users</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/data')}
          className="card p-6 text-left hover:border-accent transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-success/20 transition-colors">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">Manage Data</h2>
              <p className="text-sm text-muted">Data management</p>
            </div>
          </div>
          <p className="text-secondary mb-4">
            View, edit, export reservations, and manage companies/setups
          </p>
          <div className="flex items-center text-accent group-hover:text-accent-hover transition-colors">
            <span className="text-sm font-medium">Manage Data</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/companies')}
          className="card p-6 text-left hover:border-accent transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-warning/20 transition-colors">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">Companies</h2>
              <p className="text-sm text-muted">Company management</p>
            </div>
          </div>
          <p className="text-secondary mb-4">
            Manage company profiles and contact information
          </p>
          <div className="flex items-center text-accent group-hover:text-accent-hover transition-colors">
            <span className="text-sm font-medium">Manage Companies</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/reservations')}
          className="card p-6 text-left hover:border-accent transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-error/20 transition-colors">
              <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">Reservations</h2>
              <p className="text-sm text-muted">Reservation overview</p>
            </div>
          </div>
          <p className="text-secondary mb-4">
            View and manage all reservation records
          </p>
          <div className="flex items-center text-accent group-hover:text-accent-hover transition-colors">
            <span className="text-sm font-medium">View Reservations</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
