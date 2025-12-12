// pages/reservations/assisted/investor-standard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Company {
  id: number;
  name: string;
}

interface Setup {
  id: number;
  name: string;
  email?: string;
}

export default function InvestorStandardPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    callType: 'Standard QA', // or 'Investor Call'
    companyId: '',
    setupId: '',
    setupEmail: '',
    dealReferenceName: '',
    date: '',
    time: '',
    timeZone: '',
    host: '',
    duration: '',
    speakerDirectAccessLink: '',
    speakerDialInNumbers: '',
    speakerInternationalDialInNumbers: '',
    speakerConferenceId: '',
    participantDirectAccessLink: '',
    participantDialInNumbers: '',
    participantInternationalDialInNumbers: '',
    participantConferenceId: '',
    conferenceReplay: 'No',
    replayFromDate: '',
    replayToDate: '',
    replayEndTime: '',
    replayTimeZone: '',
    replayCode: '',
    replayAccessLink: '',
    multiview: 'No',
    multiviewAccessLink: '',
    multiviewUsername: '',
    multiviewConferenceNumber: '',
    reservationId: '',
    participants: '',
    participantList: 'No',
    participantListInformation: '',
    participantListRecipientEmail: '',
    operatorScript: 'No',
    operatorScriptVerbiage: '',
    conferenceMP3: 'No',
    conferenceTranscript: 'No',
    turnaroundTime: '',
    qa: 'No',
    qaSpecificOrder: 'No',
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
      if (!form.companyId) {
        setSetups([]);
        return;
      }
      
      try {
        const setupsRes = await fetch(`/api/setups/get-by-company?companyId=${form.companyId}`);
        if (setupsRes.ok) {
          const data = await setupsRes.json();
          setSetups(data || []);
        }
      } catch {
        // ignore
      }
    }
    fetchSetups();
  }, [form.companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Auto-fill Multiview link when Multiview is set to Yes
    if (name === 'multiview' && value === 'Yes') {
      setForm(prev => ({ ...prev, multiviewAccessLink: 'http://mv1.multipointcom.com' }));
    } else if (name === 'multiview' && value === 'No') {
      setForm(prev => ({ ...prev, multiviewAccessLink: '' }));
    }
    
    // Auto-fill Conference Replay link when Conference Replay is set to Yes
    if (name === 'conferenceReplay' && value === 'Yes') {
      setForm(prev => ({ ...prev, replayAccessLink: 'https://replay-dev.multipointcom.com/play-back' }));
    } else if (name === 'conferenceReplay' && value === 'No') {
      setForm(prev => ({ ...prev, replayAccessLink: '' }));
    }
    
    // Auto-fill Setup Email when Setup Name is selected from existing setups
    if (name === 'setupId') {
      const selectedSetup = setups.find(s => s.name === value);
      if (selectedSetup && selectedSetup.email) {
        setForm(prev => ({ ...prev, setupEmail: selectedSetup.email || '' }));
      }
    }
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
          callType: form.callType,
          companyName: companies.find(c => c.id.toString() === form.companyId)?.name || '',
          setupName: form.setupId,
          setupEmail: form.setupEmail,
          dealReferenceName: form.dealReferenceName,
          callDate: form.date,
          startTime: form.time,
          timeZone: form.timeZone,
          host: form.host,
          duration: form.duration,
          speakerDirectAccessLink: form.speakerDirectAccessLink,
          speakerDialInNumbers: form.speakerDialInNumbers,
          speakerInternationalDialInNumbers: form.speakerInternationalDialInNumbers,
          speakerConferenceId: form.speakerConferenceId,
          participantDirectAccessLink: form.participantDirectAccessLink,
          participantDialInNumbers: form.participantDialInNumbers,
          participantInternationalDialInNumbers: form.participantInternationalDialInNumbers,
          participantConferenceId: form.participantConferenceId,
          conferenceReplay: form.conferenceReplay,
          replayFromDate: form.replayFromDate,
          replayToDate: form.replayToDate,
          replayEndTime: form.replayEndTime,
          replayTimeZone: form.replayTimeZone,
          replayCode: form.replayCode,
          multiview: form.multiview,
          multiviewAccessLink: form.multiviewAccessLink,
          multiviewUsername: form.multiviewUsername,
          multiviewConferenceNumber: form.multiviewConferenceNumber,
          reservationId: form.reservationId,
          participants: form.participants,
          participantList: form.participantList,
          participantListInformation: form.participantListInformation,
          participantListRecipientEmail: form.participantListRecipientEmail,
          operatorScript: form.operatorScript,
          operatorScriptVerbiage: form.operatorScriptVerbiage,
          conferenceMP3: form.conferenceMP3,
          conferenceTranscript: form.conferenceTranscript,
          turnaroundTime: form.turnaroundTime,
          qa: form.qa,
          qaSpecificOrder: form.qaSpecificOrder,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create reservation');

      setSuccess('Reservation created successfully');
      // Redirect to success page with reservation data after 1 second
      setTimeout(() => {
        const reservationData = {
          profileType: 'Assisted',
          callType: form.callType,
          companyName: companies.find(c => c.id.toString() === form.companyId)?.name || '',
          dealReferenceName: form.dealReferenceName,
          setupName: form.setupId,
          setupEmail: form.setupEmail,
          callDate: form.date,
          startTime: form.time,
          timeZone: form.timeZone,
          host: form.host,
          duration: form.duration,
          speakerDirectAccessLink: form.speakerDirectAccessLink,
          speakerDialInNumbers: form.speakerDialInNumbers,
          speakerInternationalDialInNumbers: form.speakerInternationalDialInNumbers,
          speakerConferenceId: form.speakerConferenceId,
          participantDirectAccessLink: form.participantDirectAccessLink,
          participantDialInNumbers: form.participantDialInNumbers,
          participantInternationalDialInNumbers: form.participantInternationalDialInNumbers,
          participantConferenceId: form.participantConferenceId,
          conferenceReplay: form.conferenceReplay,
          replayFromDate: form.replayFromDate,
          replayToDate: form.replayToDate,
          replayEndTime: form.replayEndTime,
          replayTimeZone: form.replayTimeZone,
          replayCode: form.replayCode,
          replayAccessLink: form.replayAccessLink,
          multiview: form.multiview,
          multiviewAccessLink: form.multiviewAccessLink,
          multiviewUsername: form.multiviewUsername,
          multiviewConferenceNumber: form.multiviewConferenceNumber,
          reservationId: form.reservationId,
          participants: form.participants,
          participantList: form.participantList,
          participantListInformation: form.participantListInformation,
          participantListRecipientEmail: form.participantListRecipientEmail,
          operatorScript: form.operatorScript,
          operatorScriptVerbiage: form.operatorScriptVerbiage,
          conferenceMP3: form.conferenceMP3,
          conferenceTranscript: form.conferenceTranscript,
          turnaroundTime: form.turnaroundTime,
          qa: form.qa,
          qaSpecificOrder: form.qaSpecificOrder,
        };
        router.push({
          pathname: '/reservations/success',
          query: { data: JSON.stringify(reservationData) }
        });
      }, 1000);
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

      <h1 className="text-2xl font-bold mb-6">
        {form.callType === 'Investor Call' ? 'Investor Call Reservation' : 'Standard QA Reservation'}
      </h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Call Type Selection */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium mb-2">Call Type</label>
          <select name="callType" value={form.callType} onChange={handleChange} className="w-full border px-3 py-2 rounded">
            <option value="Standard QA">Standard QA</option>
            <option value="Investor Call">Investor Call</option>
          </select>
        </div>

        {/* SETUP DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">SETUP DETAILS</h2>
          
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
              <label className="block text-sm font-medium mb-1">Setup Name *</label>
              <input 
                type="text" 
                name="setupId" 
                value={form.setupId} 
                onChange={handleChange} 
                className="w-full border px-3 py-2 rounded" 
                placeholder="Select from dropdown or type new setup name"
                list="setup-options"
                required 
              />
              <datalist id="setup-options">
                {setups.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Setup Email *</label>
              <input type="email" name="setupEmail" value={form.setupEmail} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>
          </div>
        </div>

        {/* CONFERENCE CALL DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">
            {form.callType === 'Investor Call' ? 'INVESTOR - FULLY MONITORED CONFERENCE CALL DETAILS' : 'FULLY MONITORED CONFERENCE CALL DETAILS'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Deal/Reference Name *</label>
              <input type="text" name="dealReferenceName" value={form.dealReferenceName} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
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

        {/* SPEAKER INVITATION DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">
            {form.callType === 'Investor Call' ? 'INVESTOR SPEAKER INVITATION DETAILS' : 'SPEAKER INVITATION DETAILS'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Speaker Team Direct Access Link (No wait time for call entry) *</label>
              <input type="url" name="speakerDirectAccessLink" value={form.speakerDirectAccessLink} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Speaker Team Dial-In Numbers *</label>
              <textarea name="speakerDialInNumbers" value={form.speakerDialInNumbers} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Speaker Team International Dial-In Numbers</label>
              <textarea name="speakerInternationalDialInNumbers" value={form.speakerInternationalDialInNumbers} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Speaker Team Conference ID *</label>
              <input type="text" name="speakerConferenceId" value={form.speakerConferenceId} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>** Please provide the SPEAKER DIAL IN NUMBERS and SPEAKER Conference ID to the Technician if the call is taking place in an Auditorium and a Main Feed Line is needed to connect the call from the Auditorium to our Conferencing Bridge**</strong>
            </p>
          </div>
        </div>

        {/* PARTICIPANT INVITATION DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">
            {form.callType === 'Investor Call' ? 'INVESTOR PARTICIPANT INVITATION DETAILS' : 'PARTICIPANT INVITATION DETAILS'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Participant Direct Access Link (No wait time for call entry) *</label>
              <input type="url" name="participantDirectAccessLink" value={form.participantDirectAccessLink} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Participant Dial-In Numbers *</label>
              <textarea name="participantDialInNumbers" value={form.participantDialInNumbers} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Participant International Dial-In Numbers</label>
              <textarea name="participantInternationalDialInNumbers" value={form.participantInternationalDialInNumbers} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Participant Conference ID *</label>
              <input type="text" name="participantConferenceId" value={form.participantConferenceId} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
            </div>
          </div>
        </div>

        {/* DIRECT ACCESS LINK DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">DIRECT ACCESS LINK DETAILS</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Click on Direct Access Link</li>
              <li>Fill in required fields for conference</li>
              <li>Enter your dial back phone number</li>
              <li>The conference system will dial your phone number once you press Click to Join</li>
              <li>YOU MUST ENTER *1 WHEN PROMPTED – OTHERWISE YOU WILL NOT BE JOINED TO THE CALL</li>
              <li>Mobile Phone, Laptop and Desktop Phone friendly (no desktop extensions can be dialed)</li>
              <li>Cannot Access Conference via the Direct Access Link?</li>
              <li>Manual Dial in Number Listed once the Direct Access Link is clicked</li>
            </ul>
          </div>
        </div>

        {/* CONFERENCE REPLAY */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">CONFERENCE REPLAY</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Conference Replay</label>
              <select name="conferenceReplay" value={form.conferenceReplay} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {form.conferenceReplay === 'Yes' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Date *</label>
                <input type="date" name="replayFromDate" value={form.replayFromDate} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">To Date *</label>
                <input type="date" name="replayToDate" value={form.replayToDate} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input type="time" name="replayEndTime" value={form.replayEndTime} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time Zone</label>
                <select name="replayTimeZone" value={form.replayTimeZone} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  <option value="">Choose time zone</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Central">Central</option>
                  <option value="Mountain">Mountain</option>
                  <option value="Pacific">Pacific</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Conference Replay Direct Access Link</label>
                <input type="url" name="replayAccessLink" value={form.replayAccessLink} onChange={handleChange} className="w-full border px-3 py-2 rounded" 
                  readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Conference Replay Code *</label>
                <input type="text" name="replayCode" value={form.replayCode} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>
            </div>
          )}
        </div>

        {/* MULTIVIEW DETAILS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">MULTIVIEW DETAILS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">MultiView</label>
              <select name="multiview" value={form.multiview} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {form.multiview === 'Yes' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">MultiView Access Link</label>
                <input type="url" name="multiviewAccessLink" value={form.multiviewAccessLink} onChange={handleChange} className="w-full border px-3 py-2 rounded" 
                  defaultValue="http://mv1.multipointcom.com" readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input type="text" name="multiviewUsername" value={form.multiviewUsername} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Conference Number</label>
                <input type="text" name="multiviewConferenceNumber" value={form.multiviewConferenceNumber} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
            </div>
          )}
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
              <label className="block text-sm font-medium mb-1">Participant List *</label>
              <select name="participantList" value={form.participantList} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {form.participantList === 'Yes' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Participant List Information</label>
                  <select name="participantListInformation" value={form.participantListInformation} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                    <option value="">Select information type</option>
                    <option value="Full name, Affiliation, Phone Number">Full name, Affiliation, Phone Number</option>
                    <option value="Full name, Affiliation, Phone Number, Email">Full name, Affiliation, Phone Number, Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Participant List Recipient Email</label>
                  <input type="email" name="participantListRecipientEmail" value={form.participantListRecipientEmail} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Operator Script</label>
              <select name="operatorScript" value={form.operatorScript} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {form.operatorScript === 'Yes' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Operator Script Verbiage</label>
                <textarea name="operatorScriptVerbiage" value={form.operatorScriptVerbiage} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Conference MP3</label>
              <select name="conferenceMP3" value={form.conferenceMP3} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Conference Transcript</label>
              <select name="conferenceTranscript" value={form.conferenceTranscript} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {form.conferenceTranscript === 'Yes' && (
              <div>
                <label className="block text-sm font-medium mb-1">Turnaround Time</label>
                <select name="turnaroundTime" value={form.turnaroundTime} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  <option value="">Select turnaround time</option>
                  <option value="72 Business Hour">72 Business Hour</option>
                  <option value="48 Business Hour">48 Business Hour</option>
                  <option value="24 Business Hour">24 Business Hour</option>
                  <option value="Same Day Turnaround">Same Day Turnaround</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">QA</label>
              <select name="qa" value={form.qa} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {form.qa === 'Yes' && (
              <div>
                <label className="block text-sm font-medium mb-1">QA Specific Order of Questions</label>
                <select name="qaSpecificOrder" value={form.qaSpecificOrder} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* CONFERENCE COORDINATOR HINTS */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-bold mb-4">CONFERENCE COORDINATOR HINTS</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Conference Dial In Numbers: Add Dedicated Dial In Number assigned to call details onto the bridge</li>
              <li>Direct Access (EM Link) Dial into using link to test</li>
              <li>Speaker Direct Access Links (EM Link) Ensure that the MODE is set to T/L for both Host and Guest code</li>
              <li>Conference Record and Playback: Ensure the Replay, Transcript and MP3 information is uploaded to this portal</li>
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
