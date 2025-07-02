import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function MobileServiceRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual mobile repair page after a brief delay for SEO
    const timer = setTimeout(() => {
      router.replace('/services/mobile-repair');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Mobile Phone Repair Services | The Travelling Technicians</title>
        <meta name="description" content="Professional mobile phone repair services in Vancouver, Burnaby, Richmond, and surrounding areas. Same-day doorstep repair with 90-day warranty. iPhone, Samsung, and all major brands." />
        <meta name="keywords" content="mobile phone repair, iPhone repair, Samsung repair, screen replacement, battery replacement, doorstep repair" />
        <link rel="canonical" href="https://travelling-technicians.ca/services/mobile-repair" />
        <meta property="og:title" content="Mobile Phone Repair Services | The Travelling Technicians" />
        <meta property="og:description" content="Professional mobile phone repair services with same-day doorstep service. Expert technicians for all major brands." />
        <meta property="og:url" content="https://travelling-technicians.ca/services/mobile-repair" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mobile Phone Repair Services</h1>
          <p className="text-gray-600 mb-4">
            Expert mobile repair services at your doorstep. iPhone, Samsung, and all major brands.
          </p>
          <p className="text-sm text-gray-500">Loading mobile repair services...</p>
        </div>
      </div>
    </>
  );
} 