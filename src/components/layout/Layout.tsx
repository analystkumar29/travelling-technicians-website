import { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const pageTitle = title 
    ? `${title} | The Travelling Technicians` 
    : 'The Travelling Technicians | Mobile & Laptop Repair at Your Doorstep';

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Expert mobile phone and laptop repair services right at your doorstep across the Lower Mainland, BC. Book online for convenient tech repair that comes to you." />
      </Head>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
} 