const LABELS = ["人数", "図案", "情報", "確認"];

export default function StepIndicator({ step }: { step: number }) {
  return (
    <div className="steps" aria-hidden="true">
      {LABELS.map((_, i) => (
        <div key={i} className="step-seg">
          {i > 0 && (
            <span className={`step-bar ${i <= step ? "is-done" : ""}`} />
          )}
          <span
            className={`step-dot ${
              i === step ? "is-active" : i < step ? "is-done" : ""
            }`}
          >
            {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
