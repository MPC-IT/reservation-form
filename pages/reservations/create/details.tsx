import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Head from 'next/head';
import { PrismaClient } from '@prisma/client';
import { validateSession } from '../../../lib/session';
import { GetServerSideProps } from 'next';
import CompanySetupDropdown from '../../../components/CompanySetupDropdown';

// Define form validation schema
const reservationSchema = z.object({
  profileType: z.string().min(1, 'Profile type is required'),
  callType: z.string().min(1, 'Call type is required'),
  companyId: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  dealName: z.string().min(1, 'Deal name is required'),
  setupName: z.string().min(1, 'Setup name is required'),
  setupEmail: z.string().email('Invalid email address'),
  callDate: z.string().min(1, 'Call date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
  hostPasscode: z.string().optional(),
  guestPasscode: z.string().optional(),
  conferenceId: z.string().optional(),
  notes: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

export default function ReservationDetails({ companies, callType, reservation }: { companies: any[], callType?: string, reservation?: any }) {
  const router = useRouter();
  const { id } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isManualCompany, setIsManualCompany] = useState(false);
  
  const isEditMode = !!id || !!reservation;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      profileType: reservation?.profileType || (router.query.type === 'assisted' ? 'Assisted' : 'Passcode'),
      callType: reservation?.callType || callType || '',
      companyId: reservation?.companyId?.toString() || '',
      companyName: reservation?.companyName || '',
      dealName: reservation?.dealName || '',
      setupName: reservation?.setupName || '',
      setupEmail: reservation?.setupEmail || '',
      callDate: reservation?.callDate || '',
      startTime: reservation?.startTime || '',
      timeZone: reservation?.timeZone || '',
      hostPasscode: reservation?.hostPasscode || '',
      guestPasscode: reservation?.guestPasscode || '',
      conferenceId: reservation?.conferenceId || '',
      notes: reservation?.notes || '',
    },
  });

  const selectedCompanyId = watch('companyId');
  const selectedProfileType = watch('profileType');
  const setupName = watch('setupName');
  const setupEmail = watch('setupEmail');

  // Update company name when companyId changes
  useEffect(() => {
    if (selectedCompanyId && !isManualCompany) {
      const selectedCompany = companies.find(c => c.id === parseInt(selectedCompanyId));
      if (selectedCompany) {
        setValue('companyName', selectedCompany.name);
      }
    }
  }, [selectedCompanyId, companies, setValue, isManualCompany]);

  // Handle setup email change from CompanySetupDropdown
  const handleSetupEmailChange = (email: string) => {
    setValue('setupEmail', email);
  };

  // Handle setup name change from CompanySetupDropdown
  const handleSetupNameChange = (setupName: string) => {
    setValue('setupName', setupName);
  };

  // Handle company change from dropdown
  const handleCompanyChange = (companyId: number | null) => {
    if (companyId) {
      setIsManualCompany(false);
      setValue('companyId', companyId.toString());
      // Auto-populate company name
      const selectedCompany = companies.find(c => c.id === companyId);
      if (selectedCompany) {
        setValue('companyName', selectedCompany.name);
      }
    } else {
      setIsManualCompany(true);
      setValue('companyId', '');
      setValue('companyName', '');
    }
  };

  const onSubmit = async (data: ReservationFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const endpoint = isEditMode ? '/api/reservations/update' : '/api/reservations/create';
      const payload = isEditMode ? { id: parseInt(id as string), ...data } : data;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (isEditMode) {
          setSuccess('Reservation updated successfully!');
        } else {
          router.push(`/reservations/view/${result.id}`);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} reservation`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : `An unexpected error occurred. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) return;

    try {
      const response = await fetch('/api/companies/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCompanyName }),
      });

      if (response.ok) {
        const newCompany = await response.json();
        // Refresh companies list
        const updatedCompanies = await fetch('/api/companies/list').then(res => res.json());
        setValue('companyId', newCompany.id.toString());
        setNewCompanyName('');
        setShowNewCompanyModal(false);
      }
    } catch (error) {
      console.error('Error adding company:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) return;
    
    setIsSubmitting(true);
    setEmailError(null);
    try {
      const ccEmailArray = ccEmails ? ccEmails.split(',').map(email => email.trim()).filter(email => email) : [];
      
      const response = await fetch('/api/reservations/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationData: { id: parseInt(id as string), ...watch() },
          recipientEmail,
          ccEmails: ccEmailArray,
          subject: emailSubject || (isEditMode ? 'Updated Reservation Confirmation' : 'Your Conference Reservation Confirmation')
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
      setIsSubmitting(false);
    }
  };

  const openEmailModal = () => {
    const setupEmail = watch('setupEmail');
    if (setupEmail) {
      setRecipientEmail(setupEmail);
    }
    setShowEmailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{isEditMode ? 'Edit Reservation' : 'Reservation Details'} - Multipoint Communications</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Reservation' : 'Reservation Details'}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode ? 'Update reservation details below' : `${router.query.type === 'assisted' ? 'Assisted Call' : 'Passcode Call'} - Fill in the details below`}
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Selection */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <CompanySetupDropdown
                  onCompanyChange={handleCompanyChange}
                  onSetupNameChange={handleSetupNameChange}
                  onSetupEmailChange={handleSetupEmailChange}
                  initialCompanyId={reservation?.companyId || null}
                  disabled={false}
                />
              </div>

              {/* Manual Company Name Entry */}
              <div className="sm:col-span-6">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name {isManualCompany && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="companyName"
                  {...register('companyName')}
                  placeholder={isManualCompany ? "Enter company name manually" : "Company name auto-filled from selection above"}
                  disabled={!isManualCompany}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  value={isManualCompany ? undefined : watch('companyName')}
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                )}
                {!isManualCompany && (
                  <p className="mt-1 text-sm text-gray-500">To enter a company name manually, clear the company selection above</p>
                )}
              </div>
            </div>
          </div>

          {/* Call Details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Call Details</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="dealName" className="block text-sm font-medium text-gray-700">
                  Deal Name
                </label>
                <input
                  type="text"
                  id="dealName"
                  {...register('dealName')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.dealName && (
                  <p className="mt-1 text-sm text-red-600">{errors.dealName.message}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="callType" className="block text-sm font-medium text-gray-700">
                  Call Type
                </label>
                <select
                  id="callType"
                  {...register('callType')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select call type</option>
                  {selectedProfileType === 'Assisted' ? (
                    <>
                      <option value="Standard Assisted">Standard Assisted</option>
                      <option value="Premium Assisted">Premium Assisted</option>
                      <option value="Executive Assisted">Executive Assisted</option>
                    </>
                  ) : (
                    <>
                      <option value="Standard Passcode">Standard Passcode</option>
                      <option value="Premium Passcode">Premium Passcode</option>
                    </>
                  )}
                </select>
                {errors.callType && (
                  <p className="mt-1 text-sm text-red-600">{errors.callType.message}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="setupName" className="block text-sm font-medium text-gray-700">
                  Setup Contact Name
                </label>
                <input
                  type="text"
                  id="setupName"
                  {...register('setupName')}
                  placeholder="Enter setup contact name manually"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.setupName && (
                  <p className="mt-1 text-sm text-red-600">{errors.setupName.message}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="setupEmail" className="block text-sm font-medium text-gray-700">
                  Setup Contact Email
                </label>
                <input
                  type="email"
                  id="setupEmail"
                  {...register('setupEmail')}
                  placeholder="Enter setup contact email manually"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.setupEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.setupEmail.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Email will auto-fill when setup is selected from dropdown, or enter manually</p>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="callDate" className="block text-sm font-medium text-gray-700">
                  Call Date
                </label>
                <input
                  type="date"
                  id="callDate"
                  {...register('callDate')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.callDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.callDate.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  {...register('startTime')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
                  Time Zone
                </label>
                <select
                  id="timeZone"
                  {...register('timeZone')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select time zone</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
                {errors.timeZone && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeZone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Passcode Section (conditional based on call type) */}
          {selectedProfileType === 'Passcode' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Passcode Information</h2>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="hostPasscode" className="block text-sm font-medium text-gray-700">
                    Host Passcode
                  </label>
                  <input
                    type="text"
                    id="hostPasscode"
                    {...register('hostPasscode')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.hostPasscode && (
                    <p className="mt-1 text-sm text-red-600">{errors.hostPasscode.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="guestPasscode" className="block text-sm font-medium text-gray-700">
                    Guest Passcode
                  </label>
                  <input
                    type="text"
                    id="guestPasscode"
                    {...register('guestPasscode')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.guestPasscode && (
                    <p className="mt-1 text-sm text-red-600">{errors.guestPasscode.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="conferenceId" className="block text-sm font-medium text-gray-700">
                    Conference ID
                  </label>
                  <input
                    type="text"
                    id="conferenceId"
                    {...register('conferenceId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.conferenceId && (
                    <p className="mt-1 text-sm text-red-600">{errors.conferenceId.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
            <div className="mt-1">
              <textarea
                id="notes"
                rows={4}
                {...register('notes')}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="Any special instructions or notes about this reservation..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            {isEditMode && (
              <button
                type="button"
                onClick={() => router.push('/admin/reservations')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            
            {isEditMode && (
              <button
                type="button"
                onClick={openEmailModal}
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : emailSent ? 'Email Sent ✓' : 'Send Updated Confirmation'}
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Reservation')}
            </button>
          </div>
        </form>
      </div>

      {/* New Company Modal */}
      {showNewCompanyModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Company</h3>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="Company Name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddCompany}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Company
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCompanyModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Send Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Send {isEditMode ? 'Updated' : ''} Confirmation Email
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
                    placeholder={isEditMode ? 'Updated Reservation Confirmation' : 'Your Conference Reservation Confirmation'}
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
                  disabled={isSubmitting || !recipientEmail}
                  className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Email'}
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
        <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800">
            {isEditMode ? 'Updated' : ''} confirmation email sent successfully to {recipientEmail}!
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Validate session
  const session = await validateSession(context.req as any);
  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  const { id } = context.query;
  const prisma = new PrismaClient();
  
  // Get companies for the dropdown
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
  });

  // Load reservation data if in edit mode
  let reservation = null;
  if (id) {
    reservation = await prisma.profile.findUnique({
      where: { id: parseInt(id as string) },
    });
    
    if (!reservation) {
      return {
        notFound: true,
      };
    }
  }

  // Determine call type based on URL or reservation
  const callType = reservation?.callType || (context.query.type === 'assisted' ? 'Assisted' : 'Passcode');

  return {
    props: {
      companies: JSON.parse(JSON.stringify(companies)),
      callType,
      reservation: reservation ? JSON.parse(JSON.stringify(reservation)) : null,
    },
  };
};
