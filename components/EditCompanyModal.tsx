import { useState, useEffect } from "react";

export default function EditCompanyModal({ open, company, onClose, onUpdated }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (company) {
      setName(company.name);
    }
  }, [company]);

  if (!open) return null;

  async function handleSave() {
    if (!name.trim()) return alert("Name cannot be empty");

    const res = await fetch("/api/companies/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: company.id,
        name,
      }),
    });

    if (!res.ok) return alert("Error updating company");

    onUpdated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Edit Company</h2>

        <input
          type="text"
          className="input mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end space-x-3">
          <button className="btn-secondary px-4" onClick={onClose}>
            Cancel
          </button>

          <button className="btn-primary px-4" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
