import { getTechInfo } from '@/utils/technicianAuth';

interface TechnicianHeaderProps {
  title?: string;
}

export default function TechnicianHeader({ title }: TechnicianHeaderProps) {
  const techInfo = typeof window !== 'undefined' ? getTechInfo() : null;
  const firstName = techInfo?.name?.split(' ')[0] || 'Tech';

  return (
    <header className="sticky top-0 z-40 bg-primary-900 text-white">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center text-primary-900 font-bold text-sm">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">
              {title || `Hi, ${firstName}`}
            </h1>
            <p className="text-[10px] text-primary-300">Travelling Technicians</p>
          </div>
        </div>
      </div>
    </header>
  );
}
