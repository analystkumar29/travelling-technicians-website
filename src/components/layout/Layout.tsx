import { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { ArrowUp } from 'lucide-react';

// Export the interface properly so it can be imported elsewhere
export interface LayoutProps {
  children: ReactNode;
  title?: string;
  metaDescription?: string;
  canonical?: string;
}

export default function Layout({ children, title, metaDescription, canonical }: LayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = title
    ? `${title} | The Travelling Technicians`
    : 'The Travelling Technicians | Mobile & Laptop Repair at Your Doorstep';

  const description = metaDescription
    || 'Expert mobile phone and laptop repair services right at your doorstep across the Lower Mainland, BC. Book online for convenient tech repair that comes to you.';

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />

        {/* Favicon and PWA manifest */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicons/favicon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/favicon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#102a43" />

        {/* Social sharing metadata */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/favicons/favicon-192x192.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        {canonical && <link rel="canonical" href={canonical} />}
      </Head>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-primary-800 text-white shadow-lg z-50 transition-all duration-300 hover:bg-primary-900 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
