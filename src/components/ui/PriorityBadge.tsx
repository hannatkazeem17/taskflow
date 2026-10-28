type Priority = 'low' | 'medium' | 'high' | 'urgent';

const config: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-primary-100 text-primary-700' },
  medium: { label: 'Medium', className: 'bg-amber/20 text-ink' },
  high: { label: 'High', className: 'bg-coral/15 text-coral' },
  urgent: { label: 'Urgent', className: 'bg-coral text-white' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = config[priority] ?? config.low;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}