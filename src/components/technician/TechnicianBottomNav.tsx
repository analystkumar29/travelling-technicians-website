import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, ClipboardList, Wrench, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/technician', label: 'Home', icon: LayoutDashboard },
  { href: '/technician/available-jobs', label: 'Available', icon: ClipboardList },
  { href: '/technician/my-jobs', label: 'My Jobs', icon: Wrench },
  { href: '/technician/profile', label: 'Profile', icon: User },
];

export default function TechnicianBottomNav() {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = router.pathname === href ||
            (href !== '/technician' && router.pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-accent-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
