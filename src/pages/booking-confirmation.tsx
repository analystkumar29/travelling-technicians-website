import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import { useBooking, STORAGE_KEYS } from '@/context/BookingContext';
import StorageService from '@/services/StorageService';
import logger from '@/utils/logger';

// Create a logger for this module
const pageLogger = logger.createModuleLogger('BookingConfirmation');

export default function BookingConfirmation() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { bookingReference, getStoredFormattedData } = useBooking();
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Format time like "09-11" to "9:00 AM - 11:00 AM"
  const formatTime = (timeSlot: string) => {
    if (!timeSlot || !timeSlot.includes('-')) return timeSlot;
    
    const [start, end] = timeSlot.split('-');
    const startHour = parseInt(start);
    const endHour = parseInt(end);
    
    const startTime = startHour < 12 ? 
      `${startHour}:00 AM` : 
      `${startHour === 12 ? 12 : startHour - 12}:00 PM`;
      
    const endTime = endHour < 12 ? 
      `${endHour}:00 AM` : 
      `${endHour === 12 ? 12 : endHour - 12}:00 PM`;
    
    return `${startTime} - ${endTime}`;
  };
  
  // Format service type like "screen_replacement" to "Screen Replacement"
  const formatServiceType = (serviceType: string) => {
    if (!serviceType) return 'Not specified';
    return serviceType
      .replace(/_/g, ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get device display name
  const getDeviceDisplay = (deviceType: string, brand?: string, model?: string) => {
    let deviceTypeDisplay = deviceType === 'mobile' ? 'Mobile Phone' : 
                           deviceType === 'laptop' ? 'Laptop' : 'Tablet';
    
    // Check if it's actually a tablet that was saved as mobile
    if (deviceType === 'mobile' && model && 
        (model.toLowerCase().includes('tab') || 
         model.toLowerCase().includes('pad') || 
         model.toLowerCase().includes('tablet'))) {
      deviceTypeDisplay = 'Tablet';
    }
    
    const brandStr = brand ? `${brand} ` : '';
    const modelStr = model || '';
    
    return `${deviceTypeDisplay} - ${brandStr}${modelStr}`.trim();
  };
  
  useEffect(() => {
    if (!router.isReady) return;
    
    const initializeBookingData = () => {
      try {
        pageLogger.debug('Initializing booking data');
        
        // Check if we have query parameters
        const { ref } = router.query;
        
        if (ref) {
          pageLogger.debug('Using reference from URL query', { ref });
          
          // If we have all query parameters, use them directly
          if (Object.keys(router.query).length > 1) {
            const {
              ref,
              device,
              service,
              date,
              time,
              address,
              email
            } = router.query;
            
            const queryData = {
              reference: ref as string,
              device: device as string,
              service: service as string,
              date: date as string,
              time: time as string,
              address: address as string,
              email: email as string
            };
            
            pageLogger.debug('Using booking data from URL query', { data: queryData });
            setBookingData(queryData);
          } else {
            // Try to get data from storage
            const storedData = getStoredFormattedData();
            
            if (storedData) {
              pageLogger.debug('Using booking data from storage', { data: storedData });
              setBookingData(storedData);
            } else {
              pageLogger.debug('No stored data found, using minimal reference data');
              setBookingData({ reference: ref as string });
            }
          }
        } else {
          // No reference in URL, try to get from storage
          const storedData = getStoredFormattedData();
          
          if (storedData) {
            pageLogger.debug('Using booking data from storage (no URL ref)', { data: storedData });
            setBookingData(storedData);
          } else if (bookingReference) {
            pageLogger.debug('Using booking reference from context', { reference: bookingReference });
            setBookingData({ reference: bookingReference });
          } else {
            pageLogger.warn('No booking data found');
            setError('No booking information was found. Please try booking again.');
            setBookingData(null);
          }
        }
      } catch (error) {
        pageLogger.error('Error initializing booking data', { 
          error: error instanceof Error ? error.message : String(error)
        });
        setError('An error occurred while loading your booking information.');
        setBookingData(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeBookingData();
  }, [router.isReady, router.query, bookingReference, getStoredFormattedData]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // If no booking data found, show error
  if (!bookingData || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Booking Information Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find your booking information. This could happen if you refreshed the page or accessed this page directly."}
          </p>
          <Link href="/book-online">
            <span className="inline-block bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition cursor-pointer">
              Book A New Repair
            </span>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="text-xl font-bold text-blue-600 cursor-pointer">The Travelling Technicians</span>
          </Link>
          <nav>
            <ul className="flex space-x-8">
              <li><Link href="/"><span className="text-gray-600 hover:text-blue-600 cursor-pointer">Home</span></Link></li>
              <li><Link href="/services/mobile"><span className="text-gray-600 hover:text-blue-600 cursor-pointer">Services</span></Link></li>
              <li><Link href="/contact"><span className="text-gray-600 hover:text-blue-600 cursor-pointer">Contact</span></Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 sm:p-10">
              <div className="text-center">
                <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Your repair has been scheduled successfully.
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Booking Reference: <span className="text-blue-600 font-bold">{bookingData.reference || bookingData.ref}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-gray-500 mb-1">Device</p>
                      <p className="font-medium">{bookingData.device || 'Not specified'}</p>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-gray-500 mb-1">Service</p>
                      <p className="font-medium">{bookingData.service || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 mb-1">Date</p>
                      <p className="font-medium">{bookingData.date || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 mb-1">Time</p>
                      <p className="font-medium">{bookingData.time || 'Not specified'}</p>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-gray-500 mb-1">Address</p>
                      <p className="font-medium">{bookingData.address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full w-8 h-8 flex items-center justify-center mr-2 bg-green-500 text-white">
                      <FaEnvelope className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">
                      Confirmation email sent to {bookingData.email || 'your email address'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Please check your email for booking details and verification link.
                  </p>
                  
                  <p className="text-sm text-gray-700">
                    Our technician will arrive at your address during the selected time window.
                    You will receive a call about 30 minutes before the technician arrives.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                  <Link href="/">
                    <span className="inline-block bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition cursor-pointer">
                      Return to Home
                    </span>
                  </Link>
                  <Link href="/services">
                    <span className="inline-block bg-white text-primary-600 border border-primary-600 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer">
                      Browse Services
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-sm">
            <p>&copy; {new Date().getFullYear()} The Travelling Technicians. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 