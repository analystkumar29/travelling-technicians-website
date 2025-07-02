import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function NewWestminsterServiceArea() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual repair page after a brief delay for SEO
    const timer = setTimeout(() => {
      router.replace('/repair/new-westminster');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Mobile & Laptop Repair in New Westminster, BC | The Travelling Technicians</title>
        <meta name="description" content="Professional mobile phone and laptop repair services in New Westminster, BC. Same-day doorstep repair with 90-day warranty. Book online or call now!" />
        <meta name="keywords" content="mobile repair New Westminster BC, laptop repair New Westminster, iPhone repair New Westminster, doorstep repair New Westminster" />
        <link rel="canonical" href="https://www.travelling-technicians.ca/repair/new-westminster" />
        <meta property="og:title" content="Mobile & Laptop Repair in New Westminster, BC | The Travelling Technicians" />
        <meta property="og:description" content="Professional mobile phone and laptop repair services in New Westminster, BC. Same-day doorstep repair with 90-day warranty." />
        <meta property="og:url" content="https://www.travelling-technicians.ca/repair/new-westminster" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mobile & Laptop Repair in New Westminster, BC</h1>
          <p className="text-gray-600 mb-4">
            Professional doorstep repair services for New Westminster residents. We come to you!
          </p>
          <p className="text-sm text-gray-500">Loading New Westminster repair services...</p>
        </div>
      </div>
    </>
  );
} 