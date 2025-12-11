// pages/reservations/passcode.tsx
import { useRouter } from 'next/router';

export default function PasscodePage() {
  const router = useRouter();

  const passcodeTypes = [
    { id: 'single', name: 'Single-Date Passcode', description: 'One-time passcode for a specific date and time' },
    { id: '24x7', name: '24x7 Passcode', description: 'Permanent passcode available 24/7' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/reservations/create')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Passcode Call Type</h1>

      <div className="space-y-4">
        {passcodeTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              if (type.id === 'single') {
                router.push('/reservations/passcode/single');
              } else if (type.id === '24x7') {
                router.push('/reservations/passcode/24x7');
              }
            }}
            className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <h2 className="text-lg font-semibold mb-2">{type.name}</h2>
            <p className="text-gray-600">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
