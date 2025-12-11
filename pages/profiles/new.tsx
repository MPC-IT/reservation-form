// pages/profiles/new.tsx

import ProfileForm from "../../components/ProfileForm";

export default function NewProfilePage() {
  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Create New Profile</h1>
      <ProfileForm />
    </div>
  );
}
