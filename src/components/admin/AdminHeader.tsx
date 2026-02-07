import { useRouter } from 'next/router';
import { Menu, LogOut, ExternalLink } from 'lucide-react';
import { removeAuthToken } from '@/utils/auth';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import AdminNotificationBell from './AdminNotificationBell';

interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
}

export default function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login?message=logged_out');
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: mobile hamburger + breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <AdminBreadcrumbs />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <AdminNotificationBell />

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Site</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
