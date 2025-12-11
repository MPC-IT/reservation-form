import { useState } from "react";
import { useRouter } from "next/router";
import WizardSteps from "../../../components/WizardSteps";

export default function SelectTypePage() {
  const router = useRouter();

  const [profileType, setProfileType] = useState("");
  const [callType, setCallType] = useState("");
  const [error, setError] = useState("");

  const assistedTypes = [
    "Analyst Teach In",
    "Management Teach In",
    "Investor Call",
    "Standard Call",
    "Bifurcated Call",
  ];

  const passcodeTypes = ["Single-Date Passcode", "24x7 Passcode"];

  const Tile = ({ label, selected, onClick }: any) => (
    <button
      onClick={onClick}
      className={`
        w-full p-4 border rounded-lg text-left shadow-sm transition hover:shadow-md
        ${selected ? "bg-blue-600 text-white border-blue-700" : "bg-white"}
      `}
    >
      <span className="font-semibold">{label}</span>
    </button>
  );

  function validateAndProceed(nextRoute: string) {
    if (!profileType || !callType) {
      setError("Please select both Profile Type and Call Type.");
      return;
    }

    setError("");

    router.push({
      pathname: `/profiles/new/${nextRoute}`,
      query: { profileType, callType },
    });
  }

  return (
    <div className="p-10 max-w-2xl mx-auto">

      <WizardSteps currentStep={1} />

      <h1 className="text-3xl font-semibold mb-10">Create New Reservation</h1>

      {/* PROFILE TYPE */}
      <h2 className="text-xl font-semibold mb-3">Select Profile Type</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Tile
          label="Assisted"
          selected={profileType === "Assisted"}
          onClick={() => {
            setProfileType("Assisted");
            setCallType("");
          }}
        />

        <Tile
          label="Passcode"
          selected={profileType === "Passcode"}
          onClick={() => {
            setProfileType("Passcode");
            setCallType("");
          }}
        />
      </div>

      {/* CALL TYPE */}
      {profileType && (
        <>
          <h2 className="text-xl font-semibold mb-3">Select Call Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {(profileType === "Assisted" ? assistedTypes : passcodeTypes).map(
              (t) => (
                <Tile
                  key={t}
                  label={t}
                  selected={callType === t}
                  onClick={() => setCallType(t)}
                />
              )
            )}
          </div>
        </>
      )}

      {/* VALIDATION ERROR */}
      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {/* BUTTONS */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => validateAndProceed("details")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Next
        </button>

        <button
          onClick={() => validateAndProceed("list")}
          className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          Search Existing Reservations
        </button>
      </div>
    </div>
  );
}
