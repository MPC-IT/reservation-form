// pages/admin/data.tsx
import { useState } from 'react';

export default function AdminDataPage() {
  const [companiesFile, setCompaniesFile] = useState<File | null>(null);
  const [setupsFile, setSetupsFile] = useState<File | null>(null);
  const [bridgeInstructionsFile, setBridgeInstructionsFile] = useState<File | null>(null);
  const [teamTypesFile, setTeamTypesFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState<'companies' | 'setups' | 'bridgeInstructions' | 'teamTypes'>('companies');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    const file = importType === 'companies' ? companiesFile : 
                 importType === 'setups' ? setupsFile : 
                 importType === 'bridgeInstructions' ? bridgeInstructionsFile : 
                 teamTypesFile;
    if (!file) {
      setError(`Please select a CSV file for ${importType}`);
      return;
    }

    setError('');
    setSuccess('');
    setImporting(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = importType === 'companies' ? '/api/admin/companies/import' : 
                       importType === 'setups' ? '/api/admin/setups/import' : 
                       importType === 'bridgeInstructions' ? '/api/admin/bridge-instructions/import' :
                       '/api/admin/team-types/import';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to import ${importType}`);
      }

      setSuccess(`Imported ${data.count} ${importType} successfully`);
      if (importType === 'companies') setCompaniesFile(null);
      else if (importType === 'setups') setSetupsFile(null);
      else if (importType === 'bridgeInstructions') setBridgeInstructionsFile(null);
      else setTeamTypesFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Reservation Data</h1>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Import Data</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Import Type</label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value as 'companies' | 'setups' | 'bridgeInstructions' | 'teamTypes')}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="companies">Companies</option>
              <option value="setups">Setup People</option>
              <option value="bridgeInstructions">Bridge Instructions</option>
              <option value="teamTypes">Team Types</option>
            </select>
          </div>

          {importType === 'companies' && (
            <div>
              <label className="block text-sm font-medium mb-1">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCompaniesFile(e.target.files?.[0] || null)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV must include a "name" column. Only the company name will be imported.
              </p>
            </div>
          )}

          {importType === 'setups' && (
            <div>
              <label className="block text-sm font-medium mb-1">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSetupsFile(e.target.files?.[0] || null)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV must include "name" and "company" columns.
              </p>
            </div>
          )}

          {importType === 'bridgeInstructions' && (
            <div>
              <label className="block text-sm font-medium mb-1">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setBridgeInstructionsFile(e.target.files?.[0] || null)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV must include a "name" column.
              </p>
            </div>
          )}

          {importType === 'teamTypes' && (
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setTeamTypesFile(e.target.files?.[0] || null)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV must include a "name" column.
              </p>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : `Import ${importType}`}
          </button>
        </div>
      </div>

      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
    </div>
  );
}
