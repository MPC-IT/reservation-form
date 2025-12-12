import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

interface AuditLog {
  id: number;
  eventType: string;
  eventLabel: string;
  reservationId?: number | null;
  reservation?: {
    id: number;
    companyName: string;
    dealName?: string;
  } | null;
  userId: number;
  user?: {
    name: string;
    email: string;
  } | null;
  userEmail: string;
  metadata: any;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Filters {
  startDate: string;
  endDate: string;
  eventType: string;
  userSearch: string;
  reservationId: string;
}

export default function AdminAuditLogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [eventTypes, setEventTypes] = useState<Array<{value: string, label: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    eventType: '',
    userSearch: '',
    reservationId: '',
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Check admin access on mount
  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Fetch audit logs when filters or page changes
  useEffect(() => {
    if (router.isReady) {
      fetchAuditLogs();
    }
  }, [router.isReady, currentPage, filters]);

  const checkAdminAccess = async () => {
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        if (data.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
      } else {
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Failed to check admin access:', error);
      router.push('/auth/login');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '25',
      });

      // Add filters to query params
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.eventType) queryParams.append('eventType', filters.eventType);
      if (filters.userSearch) queryParams.append('userSearch', filters.userSearch);
      if (filters.reservationId) queryParams.append('reservationId', filters.reservationId);

      const res = await fetch(`/api/admin/audit-logs?${queryParams}`);
      
      if (!res.ok) {
        if (res.status === 403) {
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch audit logs');
      }

      const data = await res.json();
      setLogs(data.logs);
      setPagination(data.pagination);
      setEventTypes(data.eventTypes);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load audit logs');
      // Don't block UI - show empty state instead
      setLogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      eventType: '',
      userSearch: '',
      reservationId: '',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const showMetadata = (log: AuditLog) => {
    setSelectedLog(log);
    setShowMetadataModal(true);
  };

  const getSummary = (log: AuditLog): string => {
    if (log.eventType === 'reservation_created') {
      return `Created reservation for ${log.reservation?.companyName || 'Unknown Company'}`;
    }
    if (log.eventType === 'reservation_updated') {
      const fieldsChanged = log.metadata?.fieldsChanged || [];
      return `Updated ${fieldsChanged.length > 0 ? fieldsChanged.join(', ') : 'reservation'}`;
    }
    if (log.eventType === 'reservation_email_sent') {
      return `Email sent to ${log.metadata?.recipientEmail || 'Unknown'}`;
    }
    if (log.eventType === 'reservation_email_failed') {
      return `Email failed to send to ${log.metadata?.recipientEmail || 'Unknown'}`;
    }
    if (log.eventType === 'reservation_exported') {
      return `Exported ${log.metadata?.exportFormat || 'data'}`;
    }
    return log.eventType;
  };

  if (loading && logs.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading audit logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Log</h1>
        <p className="text-gray-600">View system audit events and user actions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Events</option>
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Search
            </label>
            <input
              type="text"
              placeholder="Name or email"
              value={filters.userSearch}
              onChange={(e) => handleFilterChange('userSearch', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reservation ID
            </label>
            <input
              type="text"
              placeholder="ID"
              value={filters.reservationId}
              onChange={(e) => handleFilterChange('reservationId', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={fetchAuditLogs}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservation ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Summary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No audit events found'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.eventLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.reservationId ? (
                        <a
                          href={`/reservations/confirmation/${log.reservationId}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          #{log.reservationId}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{log.user?.name || 'Unknown'}</div>
                        <div className="text-gray-500">{log.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getSummary(log)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.metadata && (
                        <button
                          onClick={() => showMetadata(log)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Modal */}
      {showMetadataModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowMetadataModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <strong>Event Type:</strong> {selectedLog.eventLabel}
                </div>
                <div>
                  <strong>Timestamp:</strong> {format(new Date(selectedLog.createdAt), 'PPP p')}
                </div>
                <div>
                  <strong>User:</strong> {selectedLog.user?.name || 'Unknown'} ({selectedLog.userEmail})
                </div>
                {selectedLog.reservationId && (
                  <div>
                    <strong>Reservation ID:</strong>{' '}
                    <a href={`/reservations/confirmation/${selectedLog.reservationId}`} className="text-blue-600 hover:text-blue-800">
                      #{selectedLog.reservationId}
                    </a>
                  </div>
                )}
                {selectedLog.metadata && (
                  <div>
                    <strong>Metadata:</strong>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowMetadataModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
