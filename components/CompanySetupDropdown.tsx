import { useState, useEffect } from "react";

interface Company {
  id: number;
  name: string;
}

interface Setup {
  id: number;
  name: string;
  email?: string;
  companyId: number;
}

interface TeamCall {
  id: number;
  name: string;
  setupId: number;
}

interface CompanySetupDropdownProps {
  onCompanyChange?: (companyId: number | null) => void;
  onSetupChange?: (setupId: number | null) => void;
  onTeamCallChange?: (teamCallId: number | null) => void;
  initialCompanyId?: number | null;
  initialSetupId?: number | null;
  initialTeamCallId?: number | null;
  disabled?: boolean;
}

export default function CompanySetupDropdown({
  onCompanyChange,
  onSetupChange,
  onTeamCallChange,
  initialCompanyId = null,
  initialSetupId = null,
  initialTeamCallId = null,
  disabled = false,
}: CompanySetupDropdownProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [teamCalls, setTeamCalls] = useState<TeamCall[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(initialCompanyId);
  const [selectedSetupId, setSelectedSetupId] = useState<number | null>(initialSetupId);
  const [selectedTeamCallId, setSelectedTeamCallId] = useState<number | null>(initialTeamCallId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load setups when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      loadSetups(selectedCompanyId);
    } else {
      setSetups([]);
      setSelectedSetupId(null);
      setTeamCalls([]);
      setSelectedTeamCallId(null);
      onSetupChange?.(null);
      onTeamCallChange?.(null);
    }
  }, [selectedCompanyId]);

  // Load team calls when setup changes
  useEffect(() => {
    if (selectedSetupId) {
      loadTeamCalls(selectedSetupId);
    } else {
      setTeamCalls([]);
      setSelectedTeamCallId(null);
      onTeamCallChange?.(null);
    }
  }, [selectedSetupId]);

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/companies/list");
      const data = await response.json();
      
      if (response.ok) {
        setCompanies(data.companies || []);
      } else {
        setError("Failed to load companies");
      }
    } catch (err) {
      setError("Error loading companies");
    }
  };

  const loadSetups = async (companyId: number) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/setups/get-by-company?companyId=${companyId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSetups(data || []);
      } else {
        setError("Failed to load setups");
        setSetups([]);
      }
    } catch (err) {
      setError("Error loading setups");
      setSetups([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamCalls = async (setupId: number) => {
    try {
      const response = await fetch(`/api/team-calls/get-by-setup?setupId=${setupId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTeamCalls(data || []);
      } else {
        setError("Failed to load team calls");
        setTeamCalls([]);
      }
    } catch (err) {
      setError("Error loading team calls");
      setTeamCalls([]);
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedCompanyId(companyId);
    setSelectedSetupId(null);
    setSelectedTeamCallId(null);
    onCompanyChange?.(companyId);
    onSetupChange?.(null);
    onTeamCallChange?.(null);
  };

  const handleSetupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const setupId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedSetupId(setupId);
    setSelectedTeamCallId(null);
    onSetupChange?.(setupId);
    onTeamCallChange?.(null);
  };

  const handleTeamCallChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamCallId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedTeamCallId(teamCallId);
    onTeamCallChange?.(teamCallId);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="company-select" className="label">
          Company
        </label>
        <select
          id="company-select"
          className="select"
          value={selectedCompanyId || ""}
          onChange={handleCompanyChange}
          disabled={disabled}
        >
          <option value="">Select a company...</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="setup-select" className="label">
          Setup Name
        </label>
        <select
          id="setup-select"
          className="select"
          value={selectedSetupId || ""}
          onChange={handleSetupChange}
          disabled={disabled || !selectedCompanyId || loading}
        >
          <option value="">
            {loading ? "Loading setups..." : "Select a setup..."}
          </option>
          {setups.map((setup) => (
            <option key={setup.id} value={setup.id}>
              {setup.name}
              {setup.email && ` (${setup.email})`}
            </option>
          ))}
        </select>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="team-call-select" className="label">
          Team Call
        </label>
        <select
          id="team-call-select"
          className="select"
          value={selectedTeamCallId || ""}
          onChange={handleTeamCallChange}
          disabled={disabled || !selectedSetupId}
        >
          <option value="">Select a team call...</option>
          {teamCalls.map((teamCall) => (
            <option key={teamCall.id} value={teamCall.id}>
              {teamCall.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
