// pages/reservations/create.tsx
import { useRouter } from 'next/router';

export default function CreateReservationPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Reservation</h1>

      <div className="space-y-4">
        <button
          onClick={() => router.push('/reservations/assisted')}
          className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <h2 className="text-lg font-semibold mb-2">Assisted Call</h2>
          <p className="text-gray-600">For Analyst Teach In, Management Teach In, Investor, Standard, and Bifurcated calls</p>
        </button>

        <button
          onClick={() => router.push('/reservations/passcode')}
          className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <h2 className="text-lg font-semibold mb-2">Passcode Call</h2>
          <p className="text-gray-600">For Single-Date Passcode and 24x7 calls</p>
        </button>
      </div>
    </div>
  );
}
