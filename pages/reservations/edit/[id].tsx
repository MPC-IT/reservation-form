import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Company {
  id: number;
  name: string;
}

interface Reservation {
  id: number;
  profileType: string;
  callType: string;
  companyName: string;
  dealName?: string;
  setupName?: string;
  setupEmail?: string;
  callDate?: string;
  startTime?: string;
  timeZone?: string;
  hostPasscode?: string;
  guestPasscode?: string;
  conferenceId?: string;
  notes?: string;
  host?: string;
  duration?: string;
  status: string;
  companyId?: number;
  createdAt: string;
  updatedAt: string;
}

const assistedTypes = [
  "Analyst Teach In",
  "Management Teach In", 
  "Investor",
  "Standard",
  "Bifurcated",
];

const passcodeTypes = [
  "Single-Date Passcode",
  "24x7",
];

const statusOptions = [
  "Draft",
  "Pending Confirmation", 
  "Confirmed",
  "Completed",
  "TBD",
  "Cancelled",
];

export default function EditReservationPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status: sessionStatus } = useSession();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    profileType: '',
    callType: '',
    companyId: '',
    companyName: '',
    dealName: '',
    setupName: '',
    setupEmail: '',
    callDate: '',
    startTime: '',
    timeZone: '',
    hostPasscode: '',
    guestPasscode: '',
    conferenceId: '',
    notes: '',
    host: '',
    duration: '',
    status: 'Draft',
  });

  useEffect(() => {
    if (!id) return;
    
    async function loadData() {
      try {
        // Load reservation
        const resRes = await fetch(`/api/profiles/get?id=${id}`);
        if (!resRes.ok) {
          throw new Error('Reservation not found');
        }
        const resData = await resRes.json();
        
        // Load companies
        const compRes = await fetch('/api/companies/list');
        const compData = await compRes.json();
        
        setReservation(resData.profile);
        setCompanies(compData.companies || []);
        
        // Set form data
        const profile = resData.profile;
        setFormData({
          profileType: profile.profileType || '',
          callType: profile.callType || '',
          companyId: profile.companyId?.toString() || '',
          companyName: profile.companyName || '',
          dealName: profile.dealName || '',
          setupName: profile.setupName || '',
          setupEmail: profile.setupEmail || '',
          callDate: profile.callDate || '',
          startTime: profile.startTime || '',
          timeZone: profile.timeZone || '',
          hostPasscode: profile.hostPasscode || '',
          guestPasscode: profile.guestPasscode || '',
          conferenceId: profile.conferenceId || '',
          notes: profile.notes || '',
          host: profile.host || '',
          duration: profile.duration || '',
          status: profile.status || 'Draft',
        });
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reservation');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id.toString() === companyId);
    setFormData(prev => ({
      ...prev,
      companyId,
      companyName: company?.name || ''
    }));
  };

  const handleSave = async () => {
    if (!reservation) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/reservations/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: reservation.id,
          ...formData,
          companyId: formData.companyId ? parseInt(formData.companyId) : null,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSuccess('Reservation updated successfully!');
        setReservation(prev => prev ? { ...prev, ...result.profile } : null);
      } else {
        throw new Error(result.error || 'Failed to update reservation');
      }
    } catch (err) {
      console.error('Error saving reservation:', err);
      setError(err instanceof Error ? err.message : 'Failed to save reservation');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!reservation || !recipientEmail) return;
    
    setLoading(true);
    setEmailError(null);
    try {
      const ccEmailArray = ccEmails ? ccEmails.split(',').map(email => email.trim()).filter(email => email) : [];
      
      const response = await fetch('/api/reservations/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationData: reservation,
          recipientEmail,
          ccEmails: ccEmailArray,
          subject: emailSubject || 'Updated Reservation Confirmation'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEmailSent(true);
        setShowEmailModal(false);
        setRecipientEmail('');
        setCcEmails('');
        setEmailSubject('');
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openEmailModal = () => {
    if (reservation?.setupEmail) {
      setRecipientEmail(reservation.setupEmail);
    }
    setShowEmailModal(true);
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading reservation...</div>
        </div>
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/admin/reservations')}
            className="btn btn-primary"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  const callTypes = formData.profileType === 'Assisted' ? assistedTypes : 
                   formData.profileType === 'Passcode' ? passcodeTypes : [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Reservation</h1>
          <p className="text-gray-600 mt-1">Update reservation details and send confirmation emails</p>
        </div>
        <button
          onClick={() => router.push('/admin/reservations')}
          className="btn btn-secondary"
        >
          Back to Reservations
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Type *
            </label>
            <select
              value={formData.profileType}
              onChange={(e) => handleInputChange('profileType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Profile Type</option>
              <option value="Assisted">Assisted</option>
              <option value="Passcode">Passcode</option>
            </select>
          </div>

          {/* Call Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call Type *
            </label>
            <select
              value={formData.callType}
              onChange={(e) => handleInputChange('callType', e.target.value)}
              disabled={!formData.profileType}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Call Type</option>
              {callTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company *
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal / Reference Name
            </label>
            <input
              type="text"
              value={formData.dealName}
              onChange={(e) => handleInputChange('dealName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deal name or reference"
            />
          </div>

          {/* Setup Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup Contact Name
            </label>
            <input
              type="text"
              value={formData.setupName}
              onChange={(e) => handleInputChange('setupName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contact name"
            />
          </div>

          {/* Setup Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup Email
            </label>
            <input
              type="email"
              value={formData.setupEmail}
              onChange={(e) => handleInputChange('setupEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contact@example.com"
            />
          </div>

          {/* Call Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call Date
            </label>
            <input
              type="date"
              value={formData.callDate}
              onChange={(e) => handleInputChange('callDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>
            <input
              type="text"
              value={formData.timeZone}
              onChange={(e) => handleInputChange('timeZone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="EST, PST, etc."
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="60 minutes, 1 hour, etc."
            />
          </div>

          {/* Host */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host
            </label>
            <input
              type="text"
              value={formData.host}
              onChange={(e) => handleInputChange('host', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Host name"
            />
          </div>

          {/* Conference ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conference ID
            </label>
            <input
              type="text"
              value={formData.conferenceId}
              onChange={(e) => handleInputChange('conferenceId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Conference ID"
            />
          </div>

          {/* Host Passcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host Passcode
            </label>
            <input
              type="text"
              value={formData.hostPasscode}
              onChange={(e) => handleInputChange('hostPasscode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Host passcode"
            />
          </div>

          {/* Guest Passcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Passcode
            </label>
            <input
              type="text"
              value={formData.guestPasscode}
              onChange={(e) => handleInputChange('guestPasscode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Guest passcode"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            onClick={openEmailModal}
            disabled={!reservation}
            className="btn btn-secondary"
          >
            Send Updated Confirmation
          </button>
          
          <button
            onClick={() => router.push(`/profiles/export/${reservation?.id}`)}
            disabled={!reservation}
            className="btn btn-secondary"
          >
            Export Details
          </button>
        </div>
      </div>

      {/* Email Send Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Send Updated Confirmation Email
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="customer@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CC Emails (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={ccEmails}
                    onChange={(e) => setCcEmails(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cc1@example.com, cc2@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Updated Reservation Confirmation"
                  />
                </div>
              </div>

              {/* Email Error Message */}
              {emailError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    {emailError}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSendEmail}
                  disabled={loading || !recipientEmail}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Email'}
                </button>
                
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setRecipientEmail('');
                    setCcEmails('');
                    setEmailSubject('');
                    setEmailError(null);
                  }}
                  className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Success Message */}
      {emailSent && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800">
            Updated confirmation email sent successfully to {recipientEmail}!
          </div>
        </div>
      )}
    </div>
  );
}
