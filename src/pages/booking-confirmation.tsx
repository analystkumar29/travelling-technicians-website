import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import { useBooking } from '@/lib/bookingContext';

export default function BookingConfirmation() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { bookingData: contextBookingData } = useBooking();
  
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
    setLoading(false);
  }, [router.isReady]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // If no booking data in context, try to use URL parameters as fallback
  const fallbackData = (() => {
    if (router.isReady) {
      const {
        reference,
        device,
        service,
        date,
        time,
        address,
        email
      } = router.query;

      // If we have URL parameters, use them
      if (reference) {
        return {
          reference: reference as string,
          device: device as string,
          service: service as string,
          date: date as string,
          time: time as string,
          address: address as string,
          email: email as string
        };
      }
    }
    return null;
  })();
  
  // If no booking data in context or URL, show error
  if (!contextBookingData && !fallbackData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Booking Information Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your booking information. This could happen if you refreshed the page or accessed this page directly.</p>
          <Link href="/book-online">
            <span className="inline-block bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition cursor-pointer">
              Book A New Repair
            </span>
          </Link>
        </div>
      </div>
    );
  }
  
  // Prepare display data from either context or fallback
  const displayData = contextBookingData 
    ? {
        reference: contextBookingData.reference_number,
        device: getDeviceDisplay(
          contextBookingData.device_type, 
          contextBookingData.device_brand, 
          contextBookingData.device_model
        ),
        service: formatServiceType(contextBookingData.service_type),
        date: new Date(contextBookingData.booking_date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }),
        time: formatTime(contextBookingData.booking_time),
        address: contextBookingData.address,
        email: contextBookingData.customer_email
      } 
    : fallbackData;
  
  // TypeScript safety check - this should never happen due to the earlier check
  if (!displayData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">We couldn't display your booking information. Please try again or contact support.</p>
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
                    Booking Reference: <span className="text-blue-600 font-bold">{displayData.reference}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-gray-500 mb-1">Device</p>
                      <p className="font-medium">{displayData.device}</p>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-gray-500 mb-1">Service</p>
                      <p className="font-medium">{displayData.service}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 mb-1">Date</p>
                      <p className="font-medium">{displayData.date}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 mb-1">Time</p>
                      <p className="font-medium">{displayData.time}</p>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-gray-500 mb-1">Address</p>
                      <p className="font-medium">{displayData.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full w-8 h-8 flex items-center justify-center mr-2 bg-green-500 text-white">
                      <FaEnvelope className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700">
                      Confirmation email sent to {displayData.email}
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
                    <span className="inline-flex justify-center items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-md font-medium hover:bg-primary-50 transition cursor-pointer">
                      Return Home
                    </span>
                  </Link>
                  <Link href="/contact">
                    <span className="inline-flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition cursor-pointer">
                      Contact Support
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} The Travelling Technicians. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 