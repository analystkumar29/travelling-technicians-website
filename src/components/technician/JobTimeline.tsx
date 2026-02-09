import { Check, Circle } from 'lucide-react';

const STATUSES = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

interface JobTimelineProps {
  currentStatus: string;
}

export default function JobTimeline({ currentStatus }: JobTimelineProps) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-xs font-bold">X</span>
        </div>
        <span className="text-sm text-red-600 font-medium">Cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUSES.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex items-center gap-1 py-2">
      {STATUSES.map((status, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={status.key} className="flex items-center">
            {/* Step dot */}
            <div className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  isDone
                    ? 'bg-green-500'
                    : isCurrent
                      ? 'bg-accent-500 ring-2 ring-accent-200'
                      : 'bg-gray-200'
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Circle className={`h-2.5 w-2.5 ${isCurrent ? 'text-primary-900 fill-current' : 'text-gray-400'}`} />
                )}
              </div>
              <span className={`text-[9px] mt-1 ${
                isDone ? 'text-green-600' : isCurrent ? 'text-accent-600 font-semibold' : 'text-gray-400'
              }`}>
                {status.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STATUSES.length - 1 && (
              <div className={`h-0.5 w-6 mx-0.5 ${
                isDone ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
