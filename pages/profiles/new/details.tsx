import { useRouter } from "next/router";
import WizardSteps from "../../../components/WizardSteps";
import ProfileForm from "../../../components/ProfileForm";

export default function DetailsPage() {
  const router = useRouter();
  const { profileType, callType, reservationId } = router.query;

  if (!profileType || !callType) return <p>Invalid navigation.</p>;

  return (
    <div className="p-10 max-w-4xl mx-auto">

      <WizardSteps currentStep={3} />

      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-semibold mb-8">
        Reservation Details
      </h1>

      <ProfileForm
        profileType={String(profileType)}
        callType={String(callType)}
        reservationId={reservationId ? Number(reservationId) : null}
      />
    </div>
  );
}
