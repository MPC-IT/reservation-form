import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Company {
  id: number;
  name: string;
}

interface Profile {
  id: number;
  profileType: string;
  callType: string;
  status: string;
  companyId?: number | null;
  company?: Company | null;
  dealName?: string | null;
  callDate?: string | null;
  startTime?: string | null;
  timeZone?: string | null;
  conferenceId?: string | null;
  hostPasscode?: string | null;
  guestPasscode?: string | null;
  createdAt: string;
}

const assistedTypes = [
  "Analyst Teach In",
  "Management Teach In",
  "Investor",
  "Standard",
  "Bifurcated",
];

const passcodeTypes = ["Single-Date Passcode", "24x7"];

const statusOptions = [
  "Draft",
  "Pending Confirmation",
  "Confirmed",
  "Completed",
  "TBD",
  "Cancelled",
];

export default function AdminReservationsPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [profileFilter, setProfileFilter] = useState<string>("");
  const [callTypeFilter, setCallTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profiles/list-all");
        const data = await res.json();
        if (res.ok) {
          setProfiles(data.profiles || []);
        } else {
          alert(data.error || "Failed to load reservations");
        }
      } catch (err) {
        console.error(err);
        alert("Error loading reservations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function matchesFilters(p: Profile) {
    if (profileFilter && p.profileType !== profileFilter) return false;
    if (callTypeFilter && p.callType !== callTypeFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;

    const dateValue = p.callDate || p.createdAt?.slice(0, 10);
    if (fromDate && dateValue && dateValue < fromDate) return false;
    if (toDate && dateValue && dateValue > toDate) return false;

    if (search) {
      const term = search.toLowerCase();
      const haystack = [
        p.company?.name || "",
        p.dealName || "",
        p.conferenceId || "",
        p.hostPasscode || "",
        p.guestPasscode || "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(term)) return false;
    }

    return true;
  }

  const filtered = profiles.filter(matchesFilters);

  function keyIdentifier(p: Profile) {
    if (p.profileType === "Assisted") {
      return p.conferenceId || "—";
    }
    return p.guestPasscode || p.hostPasscode || "—";
  }

  async function changeStatus(id: number, status: string) {
    const res = await fetch("/api/profiles/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      alert("Error updating status");
      return;
    }

    const data = await res.json();
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: data.profile.status } : p))
    );
  }

  function goToExport(p: Profile) {
    router.push(`/profiles/export/${p.id}`);
  }

  function statusBadgeClass(status: string) {
    switch (status) {
      case "Pending Confirmation":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "TBD":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">All Reservations</h1>
          <p className="text-secondary">
            Manage and view all reservation records
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/reservations/create")}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Reservation
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="label">Profile Type</label>
            <select
              className="select"
              value={profileFilter}
              onChange={(e) => {
                setProfileFilter(e.target.value);
                setCallTypeFilter("");
              }}
            >
              <option value="">All Types</option>
              <option value="Assisted">Assisted</option>
              <option value="Passcode">Passcode</option>
            </select>
          </div>

          <div>
            <label className="label">Call Type</label>
            <select
              className="select"
              value={callTypeFilter}
              onChange={(e) => setCallTypeFilter(e.target.value)}
              disabled={!profileFilter}
            >
              <option value="">All Types</option>
              {profileFilter === "Assisted" &&
                assistedTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              {profileFilter === "Passcode" &&
                passcodeTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">From Date</label>
            <input
              type="date"
              className="input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              className="input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <label className="label">Search</label>
          <input
            className="input"
            placeholder="Company, Deal, Conference ID, Passcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-secondary">Loading reservations…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-secondary">No reservations found.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Profile</th>
                  <th>Call Type</th>
                  <th>Key ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-semibold text-primary">
                        {p.company?.name || "—" }
                      </div>
                      <div className="text-xs text-muted">
                        {p.dealName}
                      </div>
                    </td>
                    <td>{p.profileType}</td>
                    <td>{p.callType}</td>
                    <td className="font-mono text-sm">
                      {keyIdentifier(p)}
                    </td>
                    <td>{p.callDate || "N/A"}</td>
                    <td>
                      {p.startTime
                        ? `${p.startTime} ${p.timeZone || ""}`
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${statusBadgeClass(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <select
                          className="select text-xs w-32"
                          value={p.status}
                          onChange={(e) =>
                            changeStatus(p.id, e.target.value)
                          }
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-secondary text-xs"
                          onClick={() => goToExport(p)}
                        >
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
