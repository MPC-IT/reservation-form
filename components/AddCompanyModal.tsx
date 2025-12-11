import { useState, type ChangeEvent } from "react";
import type { Company } from "../types/company";

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (company: Company) => void;
}

export default function AddCompanyModal({
  open,
  onClose,
  onCreated,
}: AddCompanyModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/companies/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Could not create company.");
      setLoading(false);
      return;
    }

    onCreated(data);
    setName("");
    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="text-xl font-bold text-primary mb-4">Add New Company</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="company-name" className="label">
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              placeholder="Enter company name"
              className="input"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : "Save Company"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
