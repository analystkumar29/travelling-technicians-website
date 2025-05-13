import { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

// Export the interface properly so it can be imported elsewhere
export interface LayoutProps {
  children: ReactNode;
  title?: string;
  metaDescription?: string;
}

export default function Layout({ children, title, metaDescription }: LayoutProps) {
  const pageTitle = title 
    ? `${title} | The Travelling Technicians` 
    : 'The Travelling Technicians | Mobile & Laptop Repair at Your Doorstep';

  const description = metaDescription 
    ? metaDescription 
    : 'Expert mobile phone and laptop repair services right at your doorstep across the Lower Mainland, BC. Book online for convenient tech repair that comes to you.';

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
      </Head>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
} 