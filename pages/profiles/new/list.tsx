import { useRouter } from "next/router";
import useSWR from "swr";
import { useState } from "react";
import WizardSteps from "../../../components/WizardSteps";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReservationList() {
  const router = useRouter();
  const { profileType, callType } = router.query;

  const [search, setSearch] = useState("");

  const { data, error } = useSWR(
    callType ? `/api/profiles/list?callType=${callType}` : null,
    fetcher
  );

  if (error) return <p>Error loading reservations</p>;
  if (!data) return <p>Loading...</p>;

  // FILTER LOGIC
  const filtered = data.profiles.filter((p: any) => {
    if (!search) return true;

    if (profileType === "Assisted") {
      return p.conferenceId?.toLowerCase().includes(search.toLowerCase());
    }

    if (profileType === "Passcode") {
      return (
        p.hostPasscode?.toLowerCase().includes(search.toLowerCase()) ||
        p.guestPasscode?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return true;
  });

  return (
    <div className="p-10 max-w-3xl mx-auto">

      <WizardSteps currentStep={2} />

      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-semibold mb-8">Search Existing Reservations</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={
          profileType === "Assisted"
            ? "Search by Conference ID"
            : "Search by Passcode"
        }
        className="w-full border p-3 rounded-lg mb-6"
      />

      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="text-gray-600">No matching reservations found.</p>
        )}

        {filtered.map((p: any) => (
          <div
            key={p.id}
            className="border p-4 rounded-lg shadow-sm bg-white flex justify-between"
          >
            <div>
              <p className="font-semibold">{p.companyName}</p>
              {profileType === "Assisted" && (
                <p className="text-gray-600">CID: {p.conferenceId}</p>
              )}
              {profileType === "Passcode" && (
                <p className="text-gray-600">
                  Host: {p.hostPasscode} — Guest: {p.guestPasscode}
                </p>
              )}
            </div>

            <button
              onClick={() =>
                router.push({
                  pathname: "/profiles/new/details",
                  query: { profileType, callType, reservationId: p.id },
                })
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Use
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          router.push({
            pathname: "/profiles/new/details",
            query: { profileType, callType },
          })
        }
        className="mt-10 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
      >
        Create New Reservation
      </button>
    </div>
  );
}
