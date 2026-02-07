import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { isAuthenticated } from '@/utils/auth';
import AdminSidebar, { SIDEBAR_COLLAPSED_KEY } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Read sidebar collapsed state for content margin
  useEffect(() => {
    const sync = () => {
      try {
        setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');
      } catch {}
    };
    sync();
    const interval = setInterval(sync, 300);
    return () => clearInterval(interval);
  }, []);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirectTo=${encodeURIComponent(router.asPath)}&error=session_expired`);
    } else {
      setAuthorized(true);
    }
    setAuthChecked(true);
  }, [router]);

  const handleMobileClose = useCallback(() => setMobileOpen(false), []);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!authorized) return null;

  const pageTitle = title ? `${title} | Admin` : 'Admin Panel';

  return (
    <>
      <Head>
        <title>{pageTitle} | The Travelling Technicians</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <AdminSidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />

        <div className={`transition-all duration-200 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'}`}>
          <AdminHeader onMobileMenuToggle={() => setMobileOpen((v) => !v)} />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
