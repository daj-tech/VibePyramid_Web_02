const styles = {
  ACTIVE: "status-active",
  UPCOMING: "status-upcoming",
  EXPIRED: "status-expired",
  RESOLVED: "status-resolved"
};

export default function StatusBadge({ status }) {
  const value = String(status || "ACTIVE").toUpperCase();
  return <span className={`status-badge ${styles[value] || "status-upcoming"}`}>{value}</span>;
}
