import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { isTechAuthenticated } from '@/utils/technicianAuth';
import TechnicianHeader from './TechnicianHeader';
import TechnicianBottomNav from './TechnicianBottomNav';
import InstallPrompt from './InstallPrompt';
import { Loader2 } from 'lucide-react';
import { useTechnicianRealtimeJobs } from '@/hooks/useTechnicianRealtimeJobs';

interface TechnicianLayoutProps {
  children: ReactNode;
  title?: string;
  headerTitle?: string;
}

export default function TechnicianLayout({ children, title, headerTitle }: TechnicianLayoutProps) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isTechAuthenticated()) {
      router.replace('/technician/login');
    } else {
      setAuthorized(true);
    }
    setAuthChecked(true);
  }, [router]);

  // Global realtime notifications — runs on all technician pages
  useTechnicianRealtimeJobs({ enabled: authorized });

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!authorized) return null;

  const pageTitle = title ? `${title} | Technician Portal` : 'Technician Portal';

  return (
    <>
      <Head>
        <title>{pageTitle} | The Travelling Technicians</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link key="manifest" rel="manifest" href="/manifest-technician.json" />
        <meta name="theme-color" content="#102a43" />
        <meta key="apple-wac" name="apple-mobile-web-app-capable" content="yes" />
        <meta key="apple-wac-status" name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta key="apple-wac-title" name="apple-mobile-web-app-title" content="TT Tech" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <TechnicianHeader title={headerTitle} />
        <main className="px-4 py-4">
          {children}
        </main>
        <InstallPrompt />
        <TechnicianBottomNav />
      </div>
    </>
  );
}
