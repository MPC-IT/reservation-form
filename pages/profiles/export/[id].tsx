import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { buildICS } from "../../../lib/ics";

export default function ExportProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailBody, setEmailBody] = useState("");
  const [icsContent, setIcsContent] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const res = await fetch(`/api/profiles/get?id=${id}`);
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Error loading reservation");
          return;
        }

        setProfile(data.profile);
        const email = buildEmailBody(data.profile);
        setEmailBody(email);
        setIcsContent(buildICS(data.profile));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function buildEmailBody(p: any) {
    const lines = [];

    lines.push(`Dear ${p.setupName || "Client"},`);
    lines.push("");
    lines.push("Here are the details for your upcoming conference reservation:");
    lines.push("");
    lines.push(`Company: ${p.company?.name || ""}`);
    if (p.dealName) lines.push(`Deal / Reference: ${p.dealName}`);
    lines.push(`Profile Type: ${p.profileType}`);
    lines.push(`Call Type: ${p.callType}`);

    if (p.callDate) lines.push(`Date: ${p.callDate}`);
    if (p.startTime && p.timeZone) {
      lines.push(`Time: ${p.startTime} ${p.timeZone}`);
    }

    if (p.profileType === "Assisted") {
      if (p.conferenceId) {
        lines.push(`Conference ID: ${p.conferenceId}`);
      }
    } else {
      if (p.hostPasscode) lines.push(`Host Passcode: ${p.hostPasscode}`);
      if (p.guestPasscode) lines.push(`Guest Passcode: ${p.guestPasscode}`);
    }

    if (p.notes) {
      lines.push("");
      lines.push("Notes:");
      lines.push(p.notes);
    }

    lines.push("");
    lines.push("Best regards,");
    lines.push("Multipoint Communications – Reservation Team");

    return lines.join("\n");
  }

  function downloadICS() {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservation-${id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-700">Loading reservation…</p>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <p className="text-red-600">Reservation not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Export Reservation</h1>

        <div className="card">
          <h2 className="text-lg font-semibold mb-2">
            Step 1: Copy Email Body
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            Copy this into Outlook or your email client.
          </p>
          <textarea
            className="input h-64 font-mono text-xs"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
          />
        </div>

        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">
            Step 2: Download Outlook / Calendar Invite (ICS)
          </h2>
          <p className="text-sm text-gray-600">
            Click the button below to download an .ics file that can be attached
            to the confirmation email.
          </p>
          <button className="btn-primary" onClick={downloadICS}>
            Download .ics
          </button>
        </div>

        <div className="flex justify-between">
          <button
            className="btn-secondary"
            onClick={() => router.push("/admin/reservations")}
          >
            Back to Reservations
          </button>
        </div>
      </div>
    </Layout>
  );
}
