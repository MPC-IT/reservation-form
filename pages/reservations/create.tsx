// pages/reservations/create.tsx
import { useRouter } from 'next/router';

export default function CreateReservationPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Create New Reservation</h1>
        <p className="text-secondary">
          Choose the type of reservation you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => router.push('/reservations/assisted')}
          className="card p-6 text-left hover:border-accent transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-accent/20 transition-colors">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">Assisted Call</h2>
              <p className="text-sm text-muted">Interactive call with operator support</p>
            </div>
          </div>
          <p className="text-secondary mb-4">
            For Analyst Teach In, Management Teach In, Investor, Standard, and Bifurcated calls
          </p>
          <div className="flex items-center text-accent group-hover:text-accent-hover transition-colors">
            <span className="text-sm font-medium">Get Started</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => router.push('/reservations/passcode')}
          className="card p-6 text-left hover:border-accent transition-all duration-200 group"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-success/20 transition-colors">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-1">Passcode Call</h2>
              <p className="text-sm text-muted">Self-service access with passcode</p>
            </div>
          </div>
          <p className="text-secondary mb-4">
            For Single-Date Passcode and 24x7 calls
          </p>
          <div className="flex items-center text-accent group-hover:text-accent-hover transition-colors">
            <span className="text-sm font-medium">Get Started</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
