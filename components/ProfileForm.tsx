import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AddCompanyModal from "../components/AddCompanyModal";

// ------------------------------
// VALIDATION SCHEMA
// ------------------------------
const formSchema = z.object({
  profileType: z.string().min(1, "Profile Type is required"),
  callType: z.string().min(1, "Call Type is required"),

  companyId: z.string().min(1, "Company selection is required"),

  dealName: z.string().optional(),
  setupName: z.string().optional(),
  setupEmail: z.string().email("Invalid email").optional(),

  callDate: z.string().optional(),
  startTime: z.string().optional(),
  timeZone: z.string().optional(),

  hostPasscode: z.string().optional(),
  guestPasscode: z.string().optional(),

  conferenceId: z.string().optional(),
  notes: z.string().optional(),
});

export default function ProfileForm() {
  const [profileType, setProfileType] = useState("");
  const [callType, setCallType] = useState("");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [showAddCompany, setShowAddCompany] = useState(false);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch("/api/companies/list");
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies || []);
        }
      } catch {
        // ignore
      }
    }
    fetchCompanies();
  }, []);

  const assistedTypes = [
    "Analyst Teach In",
    "Management Teach In",
    "Investor",
    "Standard",
    "Bifurcated",
  ];

  const passcodeTypes = ["Single-Date Passcode", "24x7"];

  const showScheduling = callType && callType !== "24x7";
  const isPasscode = profileType === "Passcode";
  const isAssisted = profileType === "Assisted";

  const dealNameRequired =
    isAssisted || !["24x7", "Single-Date Passcode"].includes(callType);

  // ------------------------------
  // Load Companies for dropdown
  // ------------------------------
  useEffect(() => {
    async function loadCompanies() {
      const res = await fetch("/api/companies/list");
      const data = await res.json();
      setCompanies(data);
    }
    loadCompanies();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  // ----------------------------------------
  // SUBMIT HANDLER
  // ----------------------------------------
  async function onSubmit(data: any) {
    try {
      const res = await fetch("/api/profiles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(`Error: ${result.error}`);
        return;
      }

      alert("Reservation Saved Successfully!");

      reset();
      setProfileType("");
      setCallType("");

    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

      {/* ------------------------------ */}
      {/* GRID LAYOUT */}
      {/* ------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* ------------------------------------------------- */}
        {/* LEFT COLUMN: Profile Type + Call Type + Scheduling */}
        {/* ------------------------------------------------- */}
        <div className="space-y-4">

          {/* Profile Type */}
          <div>
            <label className="font-semibold">Profile Type</label>
            <select
              {...register("profileType")}
              className="input mt-1"
              value={profileType}
              onChange={(e) => {
                setProfileType(e.target.value);
                setCallType("");
              }}
            >
              <option value="">Select Type</option>
              <option value="Assisted">Assisted</option>
              <option value="Passcode">Passcode</option>
            </select>
            {errors.profileType && (
              <p className="text-red-600 text-sm">
                {errors.profileType.message as string}
              </p>
            )}
          </div>

          {/* Call Type */}
          {profileType && (
            <div>
              <label className="font-semibold">Call Type</label>
              <select
                {...register("callType")}
                className="input mt-1"
                value={callType}
                onChange={(e) => setCallType(e.target.value)}
              >
                <option value="">Select Call Type</option>

                {isAssisted &&
                  assistedTypes.map((t) => (
                    <option key={t} value={t}>
                      Assisted – {t}
                    </option>
                  ))}

                {isPasscode &&
                  passcodeTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
              {errors.callType && (
                <p className="text-red-600 text-sm">
                  {errors.callType.message as string}
                </p>
              )}
            </div>
          )}

          {/* Scheduling Fields */}
          {showScheduling && (
            <>
              <div>
                <label className="font-semibold">Call Date</label>
                <input type="date" {...register("callDate")} className="input" />
              </div>

              <div>
                <label className="font-semibold">Start Time</label>
                <input type="time" {...register("startTime")} className="input" />
              </div>

              <div>
                <label className="font-semibold">Time Zone</label>
                <select {...register("timeZone")} className="input">
                  <option value="Central">Central</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Mountain">Mountain</option>
                  <option value="Pacific">Pacific</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* RIGHT COLUMN: Company + Setup Information */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-4">

          {/* Company Dropdown + Add Button */}
          <div>
            <label className="font-semibold">Company *</label>

            <div className="flex space-x-2">
              <select {...register("companyId")} className="input flex-1">
                <option value="">Select Company</option>
                {Array.isArray(companies) && companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn-primary px-4"
                onClick={() => setShowAddCompany(true)}
              >
                +
              </button>
            </div>

            {errors.companyId && (
              <p className="text-red-600 text-sm">
                {errors.companyId.message as string}
              </p>
            )}

            <AddCompanyModal
              open={showAddCompany}
              onClose={() => setShowAddCompany(false)}
              onCreated={(newCompany) => {
                setCompanies((prev) => [...prev, newCompany]);
                setValue("companyId", String(newCompany.id));
              }}
            />
          </div>

          {/* Deal Name */}
          <div>
            <label className="font-semibold">
              Deal / Reference Name{" "}
              {dealNameRequired && <span className="text-red-600">*</span>}
            </label>
            <input type="text" {...register("dealName")} className="input" />
          </div>

          <div>
            <label className="font-semibold">Setup Name</label>
            <input type="text" {...register("setupName")} className="input" />
          </div>

          <div>
            <label className="font-semibold">Setup Email Address</label>
            <input type="email" {...register("setupEmail")} className="input" />
            {errors.setupEmail && (
              <p className="text-red-600 text-sm">
                {errors.setupEmail.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------ */}
      {/* ADDITIONAL SETTINGS */}
      {/* ------------------------------ */}
      <div className="border p-6 rounded-xl bg-gray-50 shadow-sm space-y-6">

        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
          Additional Settings
        </h3>

        {/* PASSCODE CALLS */}
        {isPasscode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Host Passcode</label>
              <input
                type="text"
                {...register("hostPasscode")}
                className="input"
              />
            </div>

            <div>
              <label className="font-semibold">Guest Passcode</label>
              <input
                type="text"
                {...register("guestPasscode")}
                className="input"
              />
            </div>
          </div>
        )}

        {/* ASSISTED CALLS */}
        {isAssisted && (
          <div>
            <label className="font-semibold">Conference ID</label>
            <input
              type="text"
              {...register("conferenceId")}
              className="input"
            />
          </div>
        )}

        {/* NOTES */}
        <div>
          <label className="font-semibold">Notes</label>
          <textarea
            {...register("notes")}
            className="input h-28"
            placeholder="Internal-only notes. Not visible to customers."
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button type="submit" className="btn-primary">
        Save Reservation
      </button>
    </form>
  );
}
