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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add New Company</h2>

        <input
          type="text"
          placeholder="Company name"
          className="input mb-3"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <div className="flex justify-end space-x-3">
          <button className="btn-secondary px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn-primary px-4 py-2 rounded"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
