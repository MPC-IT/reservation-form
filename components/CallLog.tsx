'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { format } from 'date-fns';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

interface CallLogItem {
  [key: string]: string;
}

const ALL_COLUMNS = [
  { key: 'time', label: 'Time' },
  { key: 'reservation_id', label: 'Reservation ID' },
  { key: 'call_title', label: 'Call Title' },
  { key: 'type', label: 'Type' },
  { key: 'coordinator', label: 'Coordinator' },
  { key: 'length_of_call', label: 'Length of Call' },
] as const;

type ColumnKey = (typeof ALL_COLUMNS)[number]['key'];

export default function CallLog() {
  const { status } = useSession();
  const { handleGoogleAuthError } = useGoogleAuth();

  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📅 Date picker (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  // 👁 Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    () => new Set(ALL_COLUMNS.map(c => c.key))
  );

  // ✅ FIX: Force LOCAL date parsing (prevents off-by-one day bug)
  const sheetTabName = useMemo(() => {
    const localDate = new Date(`${selectedDate}T00:00:00`);
    return format(localDate, 'EEE MM.dd.yyyy');
  }, [selectedDate]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCallLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sheetTabName]);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/google/call-log?date=${encodeURIComponent(sheetTabName)}`,
        { credentials: 'include' }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const error = new Error(body?.error || 'Failed to load call log');
        
        // Handle Google auth errors globally with enhanced error information
        handleGoogleAuthError({
          status: res.status,
          message: body?.error || 'Failed to load call log',
          errorType: body?.errorType,
          requiresReauth: body?.requiresReauth
        });
        
        throw error;
      }

      const json = await res.json();
      const rows: CallLogItem[] = Array.isArray(json.callLogs)
        ? json.callLogs
        : [];

      // ⬇️ Default sort by Time (descending)
      rows.sort((a, b) => {
        const tA = new Date(a.time || '').getTime();
        const tB = new Date(b.time || '').getTime();
        return tB - tA;
      });

      setCallLogs(rows);
    } catch (err: any) {
      console.error(err);
	  setCallLogs([]);
      setError(err.message || 'Failed to load call log');
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const visibleColumnDefs = ALL_COLUMNS.filter(col =>
    visibleColumns.has(col.key)
  );

  // ------------------------
  // AUTH STATES
  // ------------------------

  if (status === 'loading') {
    return <div className="p-4 text-gray-500">Loading session…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Call Log</h2>
        <p className="mb-4">Please sign in with Google to view the call log.</p>
        <button
          onClick={() => signIn('google')}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // ------------------------
  // MAIN RENDER
  // ------------------------

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">
          Call Log — {sheetTabName}
        </h2>

        <div className="flex items-center gap-4">
          {/* 📅 Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />

          {/* 👁 Column Toggle */}
          <details className="relative">
            <summary className="cursor-pointer text-sm text-blue-600">
              Columns
            </summary>
            <div className="absolute right-0 mt-2 bg-white border rounded shadow p-3 z-10">
              {ALL_COLUMNS.map(col => (
                <label key={col.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Error (non-blocking) */}
      {error && (
        <div className="p-4 text-red-600 bg-red-50 border-b">
          {error.includes('not found')
            ? 'No call log exists for this date. Please select another date.'
            : error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="p-4 text-gray-500">Loading call log…</div>
      ) : callLogs.length === 0 ? (
        <div className="p-4 text-gray-500">No calls scheduled.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumnDefs.map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {callLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {visibleColumnDefs.map(col => (
                    <td
                      key={col.key}
                      className="px-4 py-2 text-sm whitespace-nowrap"
                    >
                      {log[col.key] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 bg-gray-50 text-right text-xs text-gray-500">
        <button
          onClick={fetchCallLogs}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}
