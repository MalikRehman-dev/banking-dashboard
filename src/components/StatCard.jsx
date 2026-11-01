// Dashboard ka chhota card (balance, deposited, etc.)
export default function StatCard({ title, value, color }) {
  return (
    <div className={"stat-card stat-" + color}>
      <p className="stat-title">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  );
}
