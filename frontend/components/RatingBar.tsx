interface RatingProps {
  label: string;
  value?: number | null;
};

function RatingBar({ label, value }: RatingProps) {
  const max = 10;
  const rating = Math.max(1, Math.min(10, Math.round(value ?? 0)));

  return (
    <div style={{ marginBottom: "24px" }}>
      <p style={{ marginBottom: "8px", fontWeight: 600, fontSize: "16px" }}>
        {label}
      </p>

      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: max }, (_, i) => {
          const index = i + 1;
          const isRating = index === rating;

          if (index > rating) return null; // Hide segments after the rating

          return (
            <div
              key={index}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                backgroundColor: isRating ? "#007bff" : "#d0d0d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isRating ? "#fff" : "transparent",
                fontWeight: "bold",
                fontSize: "14px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              {isRating ? index : "."}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingBar;