export function AvailabilityBadge({ value }) {
  const cls = value === 'In Stock' ? 'green' : value === 'Low Stock' ? 'orange' : 'red';
  return <span className={`badge ${cls}`}>{value}</span>;
}

export function StatusBadge({ active }) {
  return active ? <span className="badge green">Active</span> : <span className="badge gray">Inactive</span>;
}
