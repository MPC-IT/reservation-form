// pages/reservations/passcode/24x7.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Company {
  id: number;
  name: string;
}

interface Setup {
  id: number;
  name: string;
}

export default function Passcode24x7Page() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    companyId: '',
    setupId: '',
    host: '',
    referenceName: '',
    dialInNumbers: '',
    internationalDialInNumbers: '',
    hostPasscode: '',
    guestPasscode: '',
    reservationId: '',
    bridgeInstructions: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const companiesRes = await fetch('/api/companies/list');
        if (companiesRes.ok) {
          const data = await companiesRes.json();
          setCompanies(data.companies || []);
        }
      } catch {
        // ignore
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchSetups() {
      try {
        const companyName = companies.find(c => c.id.toString() === form.companyId)?.name;
        if (!companyName) {
          setSetups([]);
          return;
        }
        
        const setupsRes = await fetch(`/api/setups/list?company=${encodeURIComponent(companyName)}`);
        if (setupsRes.ok) {
          const data = await setupsRes.json();
          setSetups(data.setups || []);
        }
      } catch {
        // ignore
      }
    }
    fetchSetups();
  }, [form.companyId, companies]);

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
          profileType: 'Passcode',
          callType: '24x7',
          companyName: companies.find(c => c.id.toString() === form.companyId)?.name || '',
          setupName: setups.find(s => s.id.toString() === form.setupId)?.name || '',
          host: form.host,
          referenceName: form.referenceName,
          dialInNumbers: form.dialInNumbers,
          internationalDialInNumbers: form.internationalDialInNumbers,
          hostPasscode: form.hostPasscode,
          guestPasscode: form.guestPasscode,
          reservationId: form.reservationId,
          bridgeInstructions: form.bridgeInstructions,
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
          onClick={() => router.push('/reservations/passcode')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">24x7 Passcode Reservation</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 24x7 CONFERENCE DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">24x7 CONFERENCE DETAILS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <select name="companyId" value={form.companyId} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
                <option value="">Select a company</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Setup Name</label>
              <select name="setupId" value={form.setupId} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                <option value="">Select setup</option>
                {setups.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Host</label>
              <input type="text" name="host" value={form.host} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reference Name</label>
              <input type="text" name="referenceName" value={form.referenceName} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
          </div>
        </div>

        {/* 24x7 PASSCODE INVITATION DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">24x7 PASSCODE INVITATION DETAILS</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Passcode Dial In Numbers *</label>
              <textarea name="dialInNumbers" value={form.dialInNumbers} onChange={handleChange} rows={4} className="w-full border px-3 py-2 rounded" required 
                placeholder="Toll-Free Dial In: (866) 367-6492&#10;Domestic Local Dial In : +1 (253) 201-4919&#10;Universal Int'l Dial In : +1 (251) 973-3395" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Passcode International Dial In Numbers</label>
              <textarea name="internationalDialInNumbers" value={form.internationalDialInNumbers} onChange={handleChange} rows={4} className="w-full border px-3 py-2 rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Host Passcode *</label>
                <input type="text" name="hostPasscode" value={form.hostPasscode} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Guest Passcode</label>
                <input type="text" name="guestPasscode" value={form.guestPasscode} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* 24x7 HELPFUL HINTS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">24x7 HELPFUL HINTS</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Mobile Friendly Dial In:</strong> {form.dialInNumbers.split('\n')[0] || '{Dial In Number}'},,,{form.hostPasscode || '{Passcode#}'}</p>
            <p><strong>Example:</strong> 4445556666,,,1111111#</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Landline phones provide better sound quality</li>
              <li>Placing your phone on hold can play music into the conference</li>
              <li>If call drops, simply dial back in to reconnect</li>
              <li>Press "0" for coordinator assistance</li>
              <li>5# Conference Mute</li>
              <li>6# Conference Un-Mute</li>
              <li>*0*6*6: Play Party Count</li>
              <li><strong>Auto Recording</strong></li>
              <li>*2*1: Start / Stop Recording</li>
              <li>*0: Hear Main Menu</li>
            </ul>
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
              <label className="block text-sm font-medium mb-1">Bridge Instructions *</label>
              <select name="bridgeInstructions" value={form.bridgeInstructions} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
                <option value="">Choose bridge instructions</option>
                <option value="Refer to Operations Helpful Hints Google Doc">Refer to Operations Helpful Hints Google Doc</option>
                <option value="GENERIC">GENERIC</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Use GENERIC if no specific company on Helpful Hints Google Doc</p>
            </div>
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
