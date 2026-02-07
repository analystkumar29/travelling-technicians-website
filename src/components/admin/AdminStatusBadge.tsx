type BookingStatus = 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
type WarrantyStatus = 'active' | 'expired' | 'void' | 'claimed';
type Status = BookingStatus | WarrantyStatus;

interface AdminStatusBadgeProps {
  status: Status | string;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  // Booking statuses
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  assigned: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  'in-progress': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  // Warranty statuses
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  void: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  claimed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  active: 'Active',
  expired: 'Expired',
  void: 'Void',
  claimed: 'Claimed',
};

export default function AdminStatusBadge({ status, size = 'sm' }: AdminStatusBadgeProps) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const label = STATUS_LABELS[status] || status;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${styles.bg} ${styles.text} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}
