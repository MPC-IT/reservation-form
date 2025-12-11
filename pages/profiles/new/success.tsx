import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SuccessPage() {
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

  return (
    <div className="p-10 max-w-3xl mx-auto text-center space-y-10">

      {/* CHECKMARK ICON */}
      <div className="text-green-600 text-7xl">✓</div>

      <h1 className="text-3xl font-bold text-gray-900">
        Reservation Saved Successfully
      </h1>

      {reservation && (
        <div className="bg-gray-50 border p-6 rounded-xl text-left space-y-2 shadow-sm">

          <h2 className="text-xl font-semibold text-gray-700">
            Reservation Summary
          </h2>

          <p><strong>Profile Type:</strong> {reservation.profileType}</p>
          <p><strong>Call Type:</strong> {reservation.callType}</p>

          {reservation.callDate && (
            <p><strong>Date:</strong> {reservation.callDate}</p>
          )}

          {reservation.startTime && (
            <p><strong>Time:</strong> {reservation.startTime}</p>
          )}

          {reservation.companyName && (
            <p><strong>Company:</strong> {reservation.companyName}</p>
          )}

          {reservation.setupName && (
            <p><strong>Setup Contact:</strong> {reservation.setupName}</p>
          )}

          {reservation.setupEmail && (
            <p><strong>Email:</strong> {reservation.setupEmail}</p>
          )}

          {reservation.conferenceId && (
            <p><strong>Conference ID:</strong> {reservation.conferenceId}</p>
          )}

          {reservation.hostPasscode && (
            <p><strong>Host Passcode:</strong> {reservation.hostPasscode}</p>
          )}

          {reservation.guestPasscode && (
            <p><strong>Guest Passcode:</strong> {reservation.guestPasscode}</p>
          )}

        </div>
      )}

      {/* BUTTONS */}
      <div className="flex justify-center gap-6 pt-4">

        <button
          onClick={() => router.push(`/profiles/new/export?id=${id}`)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700"
        >
          Export to Outlook / Email
        </button>

        <button
          onClick={() => router.push("/")}
          className="bg-gray-200 px-8 py-3 rounded-lg text-lg hover:bg-gray-300"
        >
          Back to Home
        </button>

      </div>
    </div>
  );
}
