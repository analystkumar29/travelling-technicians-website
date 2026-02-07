import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon | ReactNode;
  trend?: ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo';
}

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', ring: 'ring-green-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
};

export default function AdminStatsCard({ label, value, icon, trend, color = 'blue' }: AdminStatsCardProps) {
  const colors = COLOR_MAP[color];

  // Determine if icon is a LucideIcon component or a ReactNode
  const isComponent = typeof icon === 'function';
  const IconComponent = isComponent ? (icon as LucideIcon) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className="text-xs font-medium text-gray-500">{trend}</div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${colors.bg} ring-1 ${colors.ring}`}>
          {IconComponent ? (
            <IconComponent className={`h-5 w-5 ${colors.icon}`} />
          ) : (
            <span className={colors.icon}>{icon as ReactNode}</span>
          )}
        </div>
      </div>
    </div>
  );
}
