import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { FaExclamationCircle, FaHome, FaPhoneAlt } from 'react-icons/fa';

export default function Custom500() {
  return (
    <Layout title="Server Error | The Travelling Technicians">
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-amber-100 p-5 rounded-full">
                <FaExclamationCircle className="text-5xl text-amber-500" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">500 - Server Error</h1>
            <p className="text-xl text-gray-600 mb-8">
              We're sorry, something went wrong on our end. We're working to fix it.
            </p>
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Need immediate assistance?</h2>
              <p className="text-gray-600 mb-4">
                Our technicians are still available to help with your device repair needs. Please contact us directly or visit our homepage to learn more about our services.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
                <a 
                  href="tel:+17785551234" 
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  <FaPhoneAlt /> Call Us
                </a>
                <Link 
                  href="/book-online" 
                  className="btn-accent"
                >
                  Book Online
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/" 
                className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                <FaHome /> Back to Home
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 