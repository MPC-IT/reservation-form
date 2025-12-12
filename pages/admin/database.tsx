// pages/admin/database.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface TableInfo {
  name: string;
  columns: { name: string; type: string; nullable: boolean }[];
  count: number;
}

interface TableData {
  [key: string]: any;
}

export default function DatabaseViewer() {
  const router = useRouter();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/database/tables');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch tables');
      }
      
      setTables(data.tables);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/admin/database/table/${tableName}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch table data');
      }
      
      setTableData(data.data);
      setSelectedTable(tableName);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Database Viewer</h1>
        <p className="text-secondary">View and explore database tables</p>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4">Tables</h2>
            
            {loading && !tables.length ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                <p className="text-sm text-muted mt-2">Loading tables...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => fetchTableData(table.name)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedTable === table.name
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent hover:bg-accent/5'
                    }`}
                  >
                    <div className="font-medium text-primary">{table.name}</div>
                    <div className="text-sm text-muted">
                      {table.columns.length} columns • {table.count} rows
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Data */}
        <div className="lg:col-span-2">
          {selectedTable ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary">
                  {selectedTable} ({tableData.length} rows)
                </h2>
                <button
                  onClick={() => fetchTableData(selectedTable)}
                  disabled={loading}
                  className="btn btn-secondary btn-sm"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                  <p className="text-sm text-muted mt-2">Loading data...</p>
                </div>
              ) : tableData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-surface">
                      <tr>
                        {Object.keys(tableData[0]).map((column) => (
                          <th
                            key={column}
                            className="px-4 py-2 text-left text-xs font-medium text-muted uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                      {tableData.map((row, index) => (
                        <tr key={index} className="hover:bg-surface">
                          {Object.values(row).map((value, valueIndex) => (
                            <td
                              key={valueIndex}
                              className="px-4 py-2 text-sm text-primary whitespace-nowrap"
                            >
                              {value === null ? (
                                <span className="text-muted italic">null</span>
                              ) : value === '' ? (
                                <span className="text-muted italic">empty</span>
                              ) : (
                                String(value)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted">No data found in {selectedTable}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">Select a Table</h3>
                <p className="text-muted">Choose a table from the list to view its data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
