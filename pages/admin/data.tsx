// pages/admin/data.tsx
import { useState } from 'react';

export default function DataManagement() {
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [bridgeFile, setBridgeFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataFile) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', dataFile);

    try {
      const res = await fetch('/api/admin/unified-import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to import data');
      }

      setSuccess(`Import successful! ${data.setupsImported} setups and ${data.teamCallsImported} team calls imported.`);
      setDataFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleBridgeImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bridgeFile) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', bridgeFile);

    try {
      const res = await fetch('/api/admin/bridge-instructions/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to import bridge instructions');
      }

      setSuccess(`Bridge instructions import successful! ${data.count} bridge instructions imported.`);
      setBridgeFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Manage Reservation Data</h1>
        <p className="text-secondary">Import companies, setups, and team calls from a unified CSV file</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-primary mb-4">Import Bridge Instructions</h2>
        
        <form onSubmit={handleBridgeImport} className="space-y-4">
          <div>
            <label htmlFor="bridge-file" className="label">Bridge Instructions CSV File</label>
            <input
              id="bridge-file"
              type="file"
              accept=".csv"
              onChange={(e) => setBridgeFile(e.target.files?.[0] || null)}
              className="input"
              required
            />
            <p className="text-xs text-muted mt-1">
              CSV must contain: BridgeInstructions or name column
            </p>
          </div>

          <button
            type="submit"
            disabled={importing}
            className="btn btn-primary w-full"
          >
            {importing ? 'Importing...' : 'Import Bridge Instructions'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-primary mb-4">Import Data</h2>
        
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label htmlFor="csv-file" className="label">CSV File</label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => setDataFile(e.target.files?.[0] || null)}
              className="input"
              required
            />
            <p className="text-xs text-muted mt-1">
              CSV must contain: SetupName, CompanyName, SetupEmail (optional), TeamCall (optional)
            </p>
          </div>

          <button
            type="submit"
            disabled={importing}
            className="btn btn-primary w-full"
          >
            {importing ? 'Importing...' : 'Import Data'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="p-3 bg-success/10 border border-success/20 rounded text-success">{success}</div>}
    </div>
  );
}
