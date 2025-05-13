import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { FaCheckCircle, FaCalendarAlt, FaMobile, FaWrench, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/router';
import SupabaseStorageService from '@/services/SupabaseStorageService';
import { useBooking } from '@/context/BookingContext';
import { formatTimeSlot, formatServiceType, getDeviceTypeDisplay, formatDate } from '@/utils/formatters';

export default function BookingConfirmation() {
  const router = useRouter();
  const { fetchBookingByReference } = useBooking();
  const [isLoading, setIsLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookingData() {
      try {
        setIsLoading(true);
        
        // Get reference from URL query params
        const { reference } = router.query;
        
        if (!reference) {
          throw new Error('No booking reference provided');
        }
        
        if (typeof reference !== 'string') {
          throw new Error('Invalid booking reference format');
        }
        
        // Fetch booking data using reference
        const data = await fetchBookingByReference(reference);
        
        if (!data) {
          throw new Error('Booking not found');
        }
        
        console.log('DEBUG - Booking confirmation fetched raw date:', data.appointment.date);
        
        // Apply special handling to ensure date is correctly processed
        // Handle potential timezone issues by explicitly parsing the date
        let appointmentDate = data.appointment.date;
        
        // If date string has timezone info or is in a non-YYYY-MM-DD format, normalize it
        if (appointmentDate && appointmentDate.includes('T')) {
          console.log('DEBUG - Date contains timezone info, normalizing');
          // Extract just the date part if it includes time
          appointmentDate = appointmentDate.split('T')[0];
        }
        
        console.log('DEBUG - Normalized date before formatting:', appointmentDate);
        
        // Format the date properly to handle timezone issues
        const formattedDate = formatDate(appointmentDate);
        console.log('DEBUG - Formatted date for display:', formattedDate);
        
        setBookingData({
          ref: reference,
          device: getDeviceTypeDisplay(data.device.type, data.device.brand, data.device.model),
          service: formatServiceType(data.service.type),
          date: formattedDate,
          time: formatTimeSlot(data.appointment.time),
          address: data.location.address,
          email: data.customer.email
        });
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking information');
      } finally {
        setIsLoading(false);
      }
    }

    if (router.isReady) {
      fetchBookingData();
    }
  }, [router.isReady, router.query, fetchBookingByReference]);

  return (
    <Layout title="Booking Confirmation" metaDescription="Your booking has been confirmed with The Travelling Technicians.">
      <section className="py-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="container-custom">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-lg text-gray-600">Loading your booking information...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg p-8 shadow-custom text-center">
              <div className="bg-red-100 text-red-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-6">Unable to Load Booking</h1>
              <p className="text-lg text-gray-600 mb-6">{error}</p>
              <p className="mb-8">
                If you have your booking reference number, you can verify your booking on our 
                <a href="/verify-booking" className="text-primary-600 hover:text-primary-800 font-medium"> verification page</a>.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a href="/" className="btn btn-outline">Return to Home</a>
                <a href="/contact" className="btn btn-primary">Contact Support</a>
              </div>
            </div>
          ) : bookingData ? (
            <div className="bg-white rounded-lg p-8 shadow-custom">
              <div className="text-center mb-10">
                <div className="bg-green-100 text-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                <p className="text-lg text-gray-600">
                  Your repair has been scheduled. Reference number: <span className="font-semibold">{bookingData.ref}</span>
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Booking Details */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">Booking Details</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2 mt-1">
                          <FaCalendarAlt className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Date & Time</p>
                          <p className="text-base">
                            {bookingData.date} at {bookingData.time}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2 mt-1">
                          <FaMobile className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Device</p>
                          <p className="text-base">{bookingData.device}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2 mt-1">
                          <FaWrench className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Service</p>
                          <p className="text-base">{bookingData.service}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Details */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">Contact Details</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2 mt-1">
                          <FaMapMarkerAlt className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Service Location</p>
                          <p className="text-base">{bookingData.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2 mt-1">
                          <FaEnvelope className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-base">{bookingData.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-8 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">What's Next?</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center flex-shrink-0 text-xs h-5 w-5 bg-primary-600 text-white rounded-full mr-2 mt-0.5">1</span>
                        <span>You'll receive a confirmation email shortly.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center flex-shrink-0 text-xs h-5 w-5 bg-primary-600 text-white rounded-full mr-2 mt-0.5">2</span>
                        <span>Our technician will contact you 30 minutes before arrival.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-flex items-center justify-center flex-shrink-0 text-xs h-5 w-5 bg-primary-600 text-white rounded-full mr-2 mt-0.5">3</span>
                        <span>We'll diagnose and repair your device at your location.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Need to Make Changes?</h3>
                    <p className="text-gray-600 mb-4">
                      Need to reschedule or have questions about your booking? Use your reference number to make changes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a href={`/reschedule-booking?reference=${bookingData.ref}`} className="btn btn-secondary">
                        Reschedule
                      </a>
                      <a href="/contact" className="btn btn-outline">
                        Contact Us
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 shadow-custom text-center">
              <h1 className="text-3xl font-bold mb-6">No Booking Information</h1>
              <p className="text-lg text-gray-600 mb-8">We couldn't find any booking information to display.</p>
              <a href="/book-online" className="btn btn-primary">Make a Booking</a>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 