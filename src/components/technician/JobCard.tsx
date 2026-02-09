import { MapPin, Clock, DollarSign, Smartphone, Wrench } from 'lucide-react';

export interface JobCardData {
  booking_id?: string;
  id?: string;
  booking_ref: string;
  booking_date: string;
  booking_time?: string;
  slot_duration?: number;
  city_name?: string;
  service_name?: string;
  service_category?: string;
  device_name?: string;
  brand_name?: string;
  quoted_price?: number;
  pricing_tier?: string;
  issue_description?: string;
  customer_name?: string;
  recommendation_label?: string;
  recommendation_score?: number;
  status?: string;
  // Joined data from my-jobs
  device_models?: any;
  services?: any;
  service_locations?: any;
}

interface JobCardProps {
  job: JobCardData;
  onAction?: () => void;
  actionLabel?: string;
  actionLoading?: boolean;
  onClick?: () => void;
  showStatus?: boolean;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'assigned': return 'bg-purple-100 text-purple-800';
    case 'in-progress': return 'bg-indigo-100 text-indigo-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getBadgeColor(label: string) {
  switch (label) {
    case 'Recommended': return 'bg-accent-100 text-accent-800 border-accent-300';
    case 'Good Fit': return 'bg-blue-100 text-blue-800 border-blue-300';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  // Handle "HH:MM" or "HH-HH" or "HH:MM:SS" formats
  const clean = timeStr.split(':')[0] + ':' + (timeStr.split(':')[1] || '00');
  try {
    const [h, m] = clean.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
}

export default function JobCard({ job, onAction, actionLabel, actionLoading, onClick, showStatus }: JobCardProps) {
  // Normalize data from smart-feed vs my-jobs shape
  const deviceName = job.device_name || job.device_models?.name || 'Unknown Device';
  const brandName = job.brand_name || job.device_models?.brands?.name || '';
  const serviceName = job.service_name || job.services?.display_name || job.services?.name || 'Repair Service';
  const cityName = job.city_name || job.service_locations?.city_name || '';
  const price = job.quoted_price;
  const tier = job.pricing_tier;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${onClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      {/* Recommendation badge */}
      {job.recommendation_label && (
        <div className={`px-3 py-1 text-xs font-semibold border-b ${getBadgeColor(job.recommendation_label)}`}>
          {job.recommendation_label}
          {job.recommendation_score != null && (
            <span className="ml-1 opacity-60">({job.recommendation_score})</span>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Device + Service */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {brandName ? `${brandName} ${deviceName}` : deviceName}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Wrench className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-600 truncate">{serviceName}</p>
            </div>
          </div>

          {showStatus && job.status && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          )}
        </div>

        {/* Location + Time + Price row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
          {cityName && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {cityName}
            </span>
          )}
          {price != null && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${Number(price).toFixed(0)}
              {tier && tier !== 'standard' && (
                <span className="text-accent-600 font-medium ml-0.5">
                  {tier}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Date + Time */}
        {job.booking_date && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
            <Clock className="h-3 w-3" />
            <span>{formatDate(job.booking_date)}</span>
            {job.booking_time && <span>at {formatTime(job.booking_time)}</span>}
          </div>
        )}

        {/* Issue description */}
        {job.issue_description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">
            &ldquo;{job.issue_description}&rdquo;
          </p>
        )}

        {/* Action button */}
        {onAction && actionLabel && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            disabled={actionLoading}
            className="mt-3 w-full py-2.5 bg-accent-500 text-primary-900 font-semibold rounded-lg text-sm hover:bg-accent-400 active:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading ? 'Processing...' : actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
