export default function Breadcrumbs({ steps }: { steps: string[] }) {
  return (
    <div className="breadcrumb mb-4">
      {steps.map((step, i) => (
        <span key={i}>
          {step}
          {i < steps.length - 1 && " > "}
        </span>
      ))}
    </div>
  );
}
