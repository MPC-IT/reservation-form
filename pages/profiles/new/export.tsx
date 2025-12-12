import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ExportPage() {
  const router = useRouter();
  const { id } = router.query;

  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const res = await fetch(`/api/profiles/get?id=${id}`);
      const data = await res.json();
      if (res.ok) setReservation(data.profile);
    }

    load();
  }, [id]);

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
          subject: emailSubject || 'Your Conference Reservation Confirmation'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEmailSent(true);
        setShowEmailModal(false);
        // Reset form
        setRecipientEmail(reservation.setupEmail || '');
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

  const handleExportHtml = async () => {
    if (!reservation) return;
    
    setLoading(true);
    setExportError(null);
    try {
      const response = await fetch('/api/reservations/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservation),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `reservation-confirmation-${reservation.reservationId || 'new'}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate email');
      }
    } catch (error) {
      console.error('Error exporting HTML:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export HTML. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openEmailModal = () => {
    // Pre-fill recipient email if available in reservation data
    if (reservation?.setupEmail) {
      setRecipientEmail(reservation.setupEmail);
    }
    setShowEmailModal(true);
  };

  if (!reservation) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Export Reservation</h1>

      <p className="text-gray-600">
        Export your reservation details or send a confirmation email to the customer.
      </p>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={openEmailModal}
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : emailSent ? 'Email Sent ✓' : 'Send Confirmation Email'}
        </button>

        <button
          onClick={handleExportHtml}
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Export Confirmation (HTML)'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {emailSent && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800 text-center">
            Confirmation email sent successfully to {recipientEmail}!
          </p>
        </div>
      )}

      {emailError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800 text-center">
            Failed to send email: {emailError}
          </p>
        </div>
      )}

      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800 text-center">
            Failed to export email: {exportError}
          </p>
        </div>
      )}

      {/* Reservation Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reservation Details</h2>
        <pre className="bg-gray-100 p-4 rounded-lg border overflow-auto">
          {JSON.stringify(reservation, null, 2)}
        </pre>
      </div>

      <button
        onClick={() => router.back()}
        className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
      >
        Back
      </button>

      {/* Email Send Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Send Confirmation Email
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
                    placeholder="Your Conference Reservation Confirmation"
                  />
                </div>
              </div>

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
                    setRecipientEmail(reservation.setupEmail || '');
                    setCcEmails('');
                    setEmailSubject('');
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
    </div>
  );
}
