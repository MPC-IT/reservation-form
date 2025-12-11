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
    <>
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">All Reservations</h1>
          <button
            className="btn-primary"
            onClick={() => router.push("/reservation/create")}
          >
            + New Reservation
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-semibold">Profile Type</label>
            <select
              className="input"
              value={profileFilter}
              onChange={(e) => {
                setProfileFilter(e.target.value);
                setCallTypeFilter("");
              }}
            >
              <option value="">All</option>
              <option value="Assisted">Assisted</option>
              <option value="Passcode">Passcode</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Call Type</label>
            <select
              className="input"
              value={callTypeFilter}
              onChange={(e) => setCallTypeFilter(e.target.value)}
              disabled={!profileFilter}
            >
              <option value="">All</option>
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
            <label className="text-sm font-semibold">Status</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">From Date</label>
            <input
              type="date"
              className="input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">To Date</label>
            <input
              type="date"
              className="input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="text-sm font-semibold">Search</label>
          <input
            className="input"
            placeholder="Company, Deal, Conference ID, Passcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="card mt-4">
          {loading ? (
            <p className="text-gray-600">Loading reservations…</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600">No reservations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-3 py-2 border-b">Company</th>
                    <th className="px-3 py-2 border-b">Profile</th>
                    <th className="px-3 py-2 border-b">Call Type</th>
                    <th className="px-3 py-2 border-b">Key ID</th>
                    <th className="px-3 py-2 border-b">Date</th>
                    <th className="px-3 py-2 border-b">Time</th>
                    <th className="px-3 py-2 border-b">Status</th>
                    <th className="px-3 py-2 border-b text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border-b">
                        <div className="font-semibold">
                          {p.company?.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.dealName}
                        </div>
                      </td>
                      <td className="px-3 py-2 border-b">{p.profileType}</td>
                      <td className="px-3 py-2 border-b">{p.callType}</td>
                      <td className="px-3 py-2 border-b">
                        {keyIdentifier(p)}
                      </td>
                      <td className="px-3 py-2 border-b">
                        {p.callDate || "N/A"}
                      </td>
                      <td className="px-3 py-2 border-b">
                        {p.startTime
                          ? `${p.startTime} ${p.timeZone || ""}`
                          : "N/A"}
                      </td>
                      <td className="px-3 py-2 border-b">
                        <span
                          className={
                            "px-2 py-1 text-xs rounded-full " +
                            statusBadgeClass(p.status)
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <select
                            className="input text-xs w-40"
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
                            className="btn-primary text-xs"
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
    </>
  );
}
