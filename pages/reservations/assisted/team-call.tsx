// pages/reservations/assisted/team-call.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface TeamType {
  id: number;
  name: string;
}

export default function TeamCallPage() {
  const router = useRouter();
  const [teamTypes, setTeamTypes] = useState<TeamType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    teamTypeId: '',
    date: '',
    time: '',
    timeZone: '',
    host: '',
    duration: '',
    committeeDialInNumbers: '',
    committeeInternationalDialInNumbers: '',
    committeeConferenceId: '',
    teamDialInNumbers: '',
    teamInternationalDialInNumbers: '',
    teamConferenceId: '',
    reservationId: '',
    participants: '',
    participantList: 'None',
    participantListInformation: '',
    participantListRecipientEmail: '',
    other: '',
  });

  useEffect(() => {
    async function fetchTeamTypes() {
      try {
        const res = await fetch('/api/team-types/list');
        if (res.ok) {
          const data = await res.json();
          setTeamTypes(data.teamTypes || []);
        }
      } catch {
        // ignore
      }
    }
    fetchTeamTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profiles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileType: 'Assisted',
          callType: 'Team Call',
          teamType: teamTypes.find(t => t.id.toString() === form.teamTypeId)?.name || '',
          callDate: form.date,
          startTime: form.time,
          timeZone: form.timeZone,
          host: form.host,
          duration: form.duration,
          committeeDialInNumbers: form.committeeDialInNumbers,
          committeeInternationalDialInNumbers: form.committeeInternationalDialInNumbers,
          committeeConferenceId: form.committeeConferenceId,
          teamDialInNumbers: form.teamDialInNumbers,
          teamInternationalDialInNumbers: form.teamInternationalDialInNumbers,
          teamConferenceId: form.teamConferenceId,
          reservationId: form.reservationId,
          participants: form.participants,
          participantList: form.participantList,
          participantListInformation: form.participantListInformation,
          participantListRecipientEmail: form.participantListRecipientEmail,
          other: form.other,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create reservation');

      setSuccess('Reservation created successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/reservations/assisted')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Team Call Reservation</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TEAMS CALL CONFERENCE DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">TEAMS CALL CONFERENCE DETAILS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team Type *</label>
              <select name="teamTypeId" value={form.teamTypeId} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
                <option value="">Select team type</option>
                {teamTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <input type="time" name="time" value={form.time} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time Zone *</label>
              <select name="timeZone" value={form.timeZone} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
                <option value="">Choose time zone</option>
                <option value="Eastern">Eastern</option>
                <option value="Central">Central</option>
                <option value="Mountain">Mountain</option>
                <option value="Pacific">Pacific</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Host</label>
              <input type="text" name="host" value={form.host} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duration *</label>
              <input type="text" name="duration" value={form.duration} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>
          </div>
        </div>

        {/* COMMITTEE MEMBER INVITATION DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">COMMITTEE MEMBER INVITATION DETAILS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Committee Member Dial In Numbers *</label>
              <textarea name="committeeDialInNumbers" value={form.committeeDialInNumbers} onChange={handleChange} rows={4} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Committee Member International Dial In Numbers</label>
              <textarea name="committeeInternationalDialInNumbers" value={form.committeeInternationalDialInNumbers} onChange={handleChange} rows={4} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Committee Member Conference ID *</label>
              <input type="text" name="committeeConferenceId" value={form.committeeConferenceId} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>
          </div>
        </div>

        {/* TEAM MEMBER INVITATION DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">TEAM MEMBER INVITATION DETAILS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team Member Dial In Numbers *</label>
              <textarea name="teamDialInNumbers" value={form.teamDialInNumbers} onChange={handleChange} rows={4} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Team Member International Dial In Numbers</label>
              <textarea name="teamInternationalDialInNumbers" value={form.teamInternationalDialInNumbers} onChange={handleChange} rows={4} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Team Member Conference ID *</label>
              <input type="text" name="teamConferenceId" value={form.teamConferenceId} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>
          </div>
        </div>

        {/* CONFERENCE COORDINATOR DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">CONFERENCE COORDINATOR DETAILS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reservation ID *</label>
              <input type="text" name="reservationId" value={form.reservationId} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Number of Participants *</label>
              <input type="text" name="participants" value={form.participants} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Participant List</label>
              <select name="participantList" value={form.participantList} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                <option value="None">None</option>
                <option value="Prelim and Final">Prelim and Final</option>
                <option value="Final">Final</option>
              </select>
            </div>

            {(form.participantList === 'Prelim and Final' || form.participantList === 'Final') && (
              <div>
                <label className="block text-sm font-medium mb-1">Participant List Information</label>
                <select name="participantListInformation" value={form.participantListInformation} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  <option value="">Select information type</option>
                  <option value="Full Names and Team Number">Full Names and Team Number</option>
                  <option value="Full Names, Affiliations, Phone number">Full Names, Affiliations, Phone number</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Participant List Recipient Email *</label>
              <input type="email" name="participantListRecipientEmail" value={form.participantListRecipientEmail} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Other</label>
              <input type="text" name="other" value={form.other} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
          </div>
        </div>

        {/* Conference Coordinator Hints Day of Call */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Conference Coordinator Hints Day of Call</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Monitor</li>
              <li>Place Direct (Committee Members and Active Team Members)</li>
              <li>Music Hold/Listen Only (Inactive Team Members)</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Reservation'}
          </button>
        </div>
      </form>
    </div>
  );
}
