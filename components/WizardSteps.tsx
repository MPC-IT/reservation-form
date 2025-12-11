interface WizardProps {
  currentStep: number;
}

export default function WizardSteps({ currentStep }: WizardProps) {
  const steps = [
    "Select Type",
    "Search",
    "Reservation Details",
  ];

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isPast = stepNumber < currentStep;

        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`
                px-3 py-1 rounded-full text-sm font-semibold
                ${isActive ? "bg-blue-600 text-white" : isPast ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-400"}
              `}
            >
              Step {stepNumber}
            </div>

            <span
              className={`
                text-sm ${isActive ? "text-blue-700" : isPast ? "text-gray-700" : "text-gray-400"}
              `}
            >
              {label}
            </span>

            {stepNumber < steps.length && (
              <span className="text-gray-400">›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
