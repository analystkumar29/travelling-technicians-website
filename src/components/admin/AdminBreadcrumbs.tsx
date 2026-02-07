import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const PAGE_NAMES: Record<string, string> = {
  '/management': 'Dashboard',
  '/management/bookings': 'Bookings',
  '/management/devices': 'Devices',
  '/management/pricing': 'Pricing',
  '/management/technicians': 'Technicians',
  '/management/warranties': 'Warranties',
  '/management/customer-feedback': 'Feedback',
};

export default function AdminBreadcrumbs() {
  const router = useRouter();
  const pageName = PAGE_NAMES[router.pathname] || 'Page';
  const isRoot = router.pathname === '/management';

  return (
    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
      <span className="font-medium text-gray-900">Admin</span>
      {!isRoot && (
        <>
          <ChevronRight className="h-4 w-4 mx-1.5 text-gray-400" />
          <Link href="/management" className="text-gray-500 hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1.5 text-gray-400" />
          <span className="font-medium text-gray-900">{pageName}</span>
        </>
      )}
    </nav>
  );
}
