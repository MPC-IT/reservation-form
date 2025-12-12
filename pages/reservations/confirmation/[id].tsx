import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ArrowLeft, Mail, Download, Send } from 'lucide-react';
import Link from 'next/link';
import { ConfirmationRenderer, ReservationConfirmationData } from '../../../components/ConfirmationRenderer';
import { emailService } from '../../../lib/emailService';

interface ConfirmationPageProps {
  reservationData: ReservationConfirmationData;
}

const ConfirmationPage: NextPage<ConfirmationPageProps> = ({ reservationData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  useEffect(() => {
    // Pre-fill recipient email if available in reservation data
    if (reservationData?.setupEmail) {
      setRecipientEmail(reservationData.setupEmail);
    }
  }, [reservationData]);

  const handleSendEmail = async () => {
    if (!reservationData || !recipientEmail) return;
    
    setLoading(true);
    try {
      const ccEmailArray = ccEmails ? ccEmails.split(',').map(email => email.trim()).filter(email => email) : [];
      
      const response = await fetch('/api/reservations/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationData,
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
        setRecipientEmail(reservationData.setupEmail || '');
        setCcEmails('');
        setEmailSubject('');
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportHtml = async () => {
    if (!reservationData) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/reservations/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `reservation-confirmation-${reservationData.reservationId || 'new'}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate HTML');
      }
    } catch (error) {
      console.error('Error exporting HTML:', error);
      alert('Failed to export HTML. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reservation Confirmation</h1>
              <p className="text-gray-600">Reservation ID: {reservationData.reservationId || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportHtml} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Export HTML
            </Button>
            <Button variant="default" size="sm" onClick={() => setShowEmailModal(true)} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
        </div>

        {/* Confirmation Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Confirmation Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConfirmationRenderer data={reservationData} mode="page" />
          </CardContent>
        </Card>

        {/* Success Message */}
        {emailSent && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Confirmation email sent successfully to {recipientEmail}!
            </p>
          </div>
        )}

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
                      setRecipientEmail(reservationData.setupEmail || '');
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
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  const { id } = context.query;
  
  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  try {
    // Fetch reservation data from your API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/reservations/${id}`);
    
    if (!response.ok) {
      return {
        notFound: true,
      };
    }

    const reservation = await response.json();
    
    // Transform the reservation data to match ReservationConfirmationData interface
    const reservationData: ReservationConfirmationData = {
      profileType: reservation.profileType || reservation.type || 'Passcode',
      callType: reservation.callType || 'Standard QA',
      companyName: reservation.company?.name || reservation.companyName || '',
      dealName: reservation.dealName || reservation.dealReferenceName,
      setupName: reservation.setupName || reservation.user?.name,
      setupEmail: reservation.setupEmail || reservation.user?.email,
      callDate: reservation.callDate,
      startTime: reservation.startTime,
      timeZone: reservation.timeZone,
      host: reservation.host,
      duration: reservation.duration,
      hostPasscode: reservation.hostPasscode,
      guestPasscode: reservation.guestPasscode,
      conferenceId: reservation.conferenceId,
      reservationId: reservation.reservationId || reservation.id?.toString(),
      dialInNumbers: reservation.dialInNumbers,
      internationalDialInNumbers: reservation.internationalDialInNumbers,
      speakerDialInNumbers: reservation.speakerDialInNumbers,
      speakerInternationalDialInNumbers: reservation.speakerInternationalDialInNumbers,
      participantDialInNumbers: reservation.participantDialInNumbers,
      participantInternationalDialInNumbers: reservation.participantInternationalDialInNumbers,
      speakerDirectAccessLink: reservation.speakerDirectAccessLink,
      participantDirectAccessLink: reservation.participantDirectAccessLink,
      multiview: reservation.multiview,
      multiviewAccessLink: reservation.multiviewAccessLink,
      conferenceReplay: reservation.conferenceReplay,
      replayAccessLink: reservation.replayAccessLink,
      participants: reservation.participants,
      bridgeInstructions: reservation.bridgeInstructions,
      notes: reservation.notes,
      referenceName: reservation.referenceName,
      // Add any other fields as needed
    };

    return {
      props: {
        reservationData,
      },
    };
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return {
      notFound: true,
    };
  }
};

export default ConfirmationPage;
