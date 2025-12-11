// pages/admin/companies.tsx
import { useEffect, useState } from 'react';

export default function AdminCompaniesPage() {
  const [companiesFile, setCompaniesFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleImportCompanies(e: React.FormEvent) {
    e.preventDefault();
    if (!companiesFile) {
      setError('Please select a CSV file');
      return;
    }

    setError('');
    setSuccess('');
    setImporting(true);

    const formData = new FormData();
    formData.append('file', companiesFile);

    try {
      const res = await fetch('/api/admin/companies/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to import companies');
      }

      setSuccess(`Imported ${data.count} companies successfully`);
      setCompaniesFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import Companies</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <div className="bg-white p-6 rounded shadow">
        <p className="text-sm text-gray-600 mb-4">
          Upload a CSV file with a header row containing a "name" column. Only the company name will be imported.
        </p>
        <form onSubmit={handleImportCompanies} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCompaniesFile(e.target.files?.[0] || null)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={importing}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import Companies'}
          </button>
        </form>
      </div>
    </div>
  );
}
