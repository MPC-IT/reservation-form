// pages/admin/view-team-calls.tsx
import { useState, useEffect } from 'react';

interface TeamCall {
  id: number;
  name: string;
  setup: {
    id: number;
    name: string;
    email: string | null;
    company: {
      id: number;
      name: string;
    };
  };
}

export default function ViewTeamCallsPage() {
  const [teamCalls, setTeamCalls] = useState<TeamCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamCalls();
  }, []);

  const fetchTeamCalls = async () => {
    try {
      const res = await fetch('/api/admin/debug-data');
      const data = await res.json();
      
      if (res.ok) {
        setTeamCalls(data.teamCalls || []);
      } else {
        setError(data.message || 'Failed to fetch team calls');
      }
    } catch (err) {
      setError('Error fetching team calls');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">All Team Calls</h1>
        <p className="text-gray-600">View all imported team calls ({teamCalls.length} total)</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Call Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Setup Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Setup Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamCalls.map((teamCall) => (
              <tr key={teamCall.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {teamCall.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {teamCall.setup.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {teamCall.setup.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {teamCall.setup.company.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {teamCalls.length === 0 && (
          <div className="px-6 py-4 text-center text-gray-500">
            No team calls found
          </div>
        )}
      </div>
    </div>
  );
}
