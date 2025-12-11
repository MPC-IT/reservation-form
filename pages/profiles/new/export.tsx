import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ExportPage() {
  const router = useRouter();
  const { id } = router.query;

  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const res = await fetch(`/api/profiles/get?id=${id}`);
      const data = await res.json();
      if (res.ok) setReservation(data.profile);
    }

    load();
  }, [id]);

  if (!reservation) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Export Reservation</h1>

      <p className="text-gray-600">
        This screen will allow you to generate an Outlook email or ICS (calendar) file.
        We'll build this logic next.
      </p>

      <pre className="bg-gray-100 p-4 rounded-lg border">
        {JSON.stringify(reservation, null, 2)}
      </pre>

      <button
        onClick={() => router.back()}
        className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
      >
        Back
      </button>
    </div>
  );
}
