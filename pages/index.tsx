import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="p-10 max-w-xl mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold">Multipoint Reservation Tool</h1>
      <p className="text-gray-600">
        Select an action below to get started.
      </p>

      <div className="space-y-4">
        <button
          onClick={() => router.push("/profiles/new/select-type")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full"
        >
          Create New Reservation
        </button>

        <button
          onClick={() => router.push("/admin/reservations")}
          className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 w-full"
        >
          View All Reservations
        </button>
      </div>
    </div>
  );
}
