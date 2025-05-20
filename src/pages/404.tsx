import { useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { FaSearch, FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';

export default function Custom404() {
  useEffect(() => {
    // Check if we're on GitHub Pages and the path might be missing the basePath
    const isGitHubPages = typeof window !== 'undefined' && 
      window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
      const currentPath = window.location.pathname;
      
      // If we're on GitHub Pages and the path doesn't include /travelling-technicians-website
      // then redirect to the correct path with basePath
      if (!currentPath.includes('/travelling-technicians-website')) {
        // For example, if someone tries to access /book-online
        // Redirect them to /travelling-technicians-website/book-online/
        const pathWithoutLeadingSlash = currentPath.replace(/^\//, '');
        const correctPath = `/travelling-technicians-website/${pathWithoutLeadingSlash}${pathWithoutLeadingSlash.endsWith('/') ? '' : '/'}`;
        window.location.href = correctPath;
      }
    }
  }, []);

  return (
    <Layout title="Page Not Found | The Travelling Technicians">
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-5 rounded-full">
                <FaExclamationTriangle className="text-5xl text-red-500" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">
              Oops! We couldn't find the page you're looking for.
            </p>
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Looking for device repair services?</h2>
              <p className="text-gray-600 mb-4">
                We offer convenient doorstep repair services for mobile phones and laptops across the Lower Mainland.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
                <Link href="/services/mobile">
                  <a className="btn-secondary">
                    Mobile Repair
                  </a>
                </Link>
                <Link href="/services/laptop">
                  <a className="btn-secondary">
                    Laptop Repair
                  </a>
                </Link>
                <Link href="/book-online">
                  <a className="btn-accent">
                    Book Now
                  </a>
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <a className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
                  <FaHome /> Back to Home
                </a>
              </Link>
              <Link href="/contact">
                <a className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
                  <FaArrowLeft /> Contact Support
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 