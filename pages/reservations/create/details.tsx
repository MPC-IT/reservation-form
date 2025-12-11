import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Head from 'next/head';
import { PrismaClient } from '@prisma/client';
import { validateSession } from '../../../lib/session';
import { GetServerSideProps } from 'next';

// Define form validation schema
const reservationSchema = z.object({
  profileType: z.string().min(1, 'Profile type is required'),
  callType: z.string().min(1, 'Call type is required'),
  companyId: z.string().min(1, 'Company is required'),
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

export default function ReservationDetails({ companies, callType }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      profileType: router.query.type === 'assisted' ? 'Assisted' : 'Passcode',
      callType: callType || '',
    },
  });

  const selectedCompanyId = watch('companyId');

  // Update company name when companyId changes
  useEffect(() => {
    if (selectedCompanyId) {
      const selectedCompany = companies.find(c => c.id === parseInt(selectedCompanyId));
      if (selectedCompany) {
        setValue('companyName', selectedCompany.name);
      }
    }
  }, [selectedCompanyId, companies, setValue]);

  const onSubmit = async (data: ReservationFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/reservations/view/${result.id}`);
      } else {
        const error = await response.json();
        console.error('Error creating reservation:', error);
        alert('Failed to create reservation. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Reservation Details - Multipoint Communications</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reservation Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            {router.query.type === 'assisted' ? 'Assisted Call' : 'Passcode Call'} - Fill in the details below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Selection */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
                  Select Company
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <select
                    id="companyId"
                    {...register('companyId')}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCompanyModal(true)}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    + New
                  </button>
                </div>
                {errors.companyId && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyId.message}</p>
                )}
              </div>

              {/* Company Name (hidden field but required for validation) */}
              <input type="hidden" {...register('companyName')} />
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
                  {router.query.type === 'assisted' ? (
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.setupEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.setupEmail.message}</p>
                )}
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
          {router.query.type === 'passcode' && (
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
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Reservation'}
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

  // Get companies for the dropdown
  const prisma = new PrismaClient();
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
  });

  // Determine call type based on URL
  const callType = context.query.type === 'assisted' ? 'Assisted' : 'Passcode';

  return {
    props: {
      companies: JSON.parse(JSON.stringify(companies)),
      callType,
    },
  };
};
