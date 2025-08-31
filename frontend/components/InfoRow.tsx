type InfoRowProps = {
  label: string;
  value?: string | number | null;
};
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <p style={{ marginBottom: "8px" }}>
      <strong>{label}:</strong> {value ?? "N/A"}
    </p>
  );
}

export default InfoRow;