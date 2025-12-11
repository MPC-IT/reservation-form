// pages/reservations/assisted.tsx
import { useRouter } from 'next/router';

export default function AssistedPage() {
  const router = useRouter();

  const callTypes = [
    { id: 'team-call', name: 'Team Call', description: 'Team conference call with committee and team members' },
    { id: 'analyst-teach-in', name: 'Analyst Teach In', description: 'Analyst training session' },
    { id: 'management-teach-in', name: 'Management Teach In', description: 'Management training session' },
    { id: 'investor-call', name: 'Investor Call', description: 'Investor presentation call' },
    { id: 'standard-qa', name: 'Standard QA', description: 'Standard Q&A session' },
    { id: 'bifurcated-qa', name: 'Bifurcated QA', description: 'Split Q&A session' },
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

      <h1 className="text-2xl font-bold mb-6">Assisted Call Type</h1>

      <div className="space-y-4">
        {callTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              if (type.id === 'team-call') {
                router.push('/reservations/assisted/team-call');
              } else if (type.id === 'investor-call' || type.id === 'standard-qa') {
                router.push('/reservations/assisted/investor-standard');
              } else if (type.id === 'management-teach-in') {
                router.push('/reservations/assisted/management-teach-in');
              } else if (type.id === 'analyst-teach-in') {
                router.push('/reservations/assisted/analyst-teach-in');
              } else {
                // TODO: Create pages for other assisted types
                alert(`${type.name} form coming soon`);
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
