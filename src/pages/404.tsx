import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { FaSearch, FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';

export default function Custom404() {
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
                <Link 
                  href="/services/mobile" 
                  className="btn-secondary"
                >
                  Mobile Repair
                </Link>
                <Link 
                  href="/services/laptop" 
                  className="btn-secondary"
                >
                  Laptop Repair
                </Link>
                <Link 
                  href="/book-online" 
                  className="btn-accent"
                >
                  Book Now
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
              <Link 
                href="/contact" 
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                <FaArrowLeft /> Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 