import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Layout from '@/components/layout/Layout';
import BookingForm from '@/components/booking/BookingForm';
import Link from 'next/link';
import Image from 'next/image';
import { FaCheck, FaClock, FaTools, FaShieldAlt, FaStar } from 'react-icons/fa';
import { bookingService } from '@/services/bookingService';
import type { CreateBookingRequest } from '@/types/booking';
import { logger } from '@/utils/logger';

// Create a logger for this page
const pageLogger = logger.createModuleLogger('BookOnlinePage');

const BookOnlinePage: NextPage = () => {
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingData, setBookingData] = useState<CreateBookingRequest | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect cleanup for any potential state updates that might happen after unmounting
  useEffect(() => {
    return () => {
      // Cleanup function to prevent state updates after unmounting
    };
  }, []);

  // Add handleBookingComplete function for onComplete prop
  const handleBookingComplete = (data: any) => {
    setBookingComplete(true);
    setBookingData(data);
    pageLogger.info('Booking completion callback triggered', {});
  };

  const handleSubmit = async (data: CreateBookingRequest) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields before submission
      const requiredFields: (keyof CreateBookingRequest)[] = [
        'deviceType', 'deviceBrand', 'deviceModel', 'serviceType',
        'customerName', 'customerEmail', 'customerPhone',
        'address', 'postalCode', 'appointmentDate', 'appointmentTime'
      ];
      
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      
      pageLogger.info('Submitting booking:', {
        deviceType: data.deviceType,
        serviceType: data.serviceType
      });
      
      const response = await bookingService.createBooking(data);
      
      if (response.success) {
        setBookingComplete(true);
        setBookingData(data);
        setBookingReference(response.reference || 'N/A');
        pageLogger.info('Booking successful:', { reference: response.reference });
      } else {
        const errorMessage = response.message || 'Failed to create booking. Please try again.';
        setError(errorMessage);
        pageLogger.error('Booking failed:', { error: errorMessage });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      pageLogger.error('Error creating booking:', { error: errorMessage });
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Handle cancellation - for now just redirect to home
    window.location.href = '/';
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-CA', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  };
  
  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    // Handle different time formats
    if (timeString.includes('-')) {
      return timeString; // Return time range as is
    }
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    } catch (e) {
      return timeString; // Return original if parsing fails
    }
  };
  
  const formatAddress = () => {
    if (!bookingData) return 'N/A';
    return `${bookingData.address}, ${bookingData.city || 'Vancouver'}, ${bookingData.province || 'BC'} ${bookingData.postalCode}`;
  };

  return (
    <Layout title="Book a Repair | The Travelling Technicians">
      <section className="bg-gradient-to-b from-primary-900 to-primary-800 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Book Your Doorstep Repair</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            We'll come to you! Schedule a convenient time, and our expert technicians will repair your device right at your doorstep.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {bookingComplete && bookingData ? (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-lg text-gray-600">
                  Thank you for booking with The Travelling Technicians.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-md p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reference Number</p>
                    <p className="text-base font-semibold text-primary-600">{bookingReference}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Device</p>
                    <p className="text-base">{bookingData.deviceBrand} {bookingData.deviceModel} ({bookingData.deviceType})</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service</p>
                    <p className="text-base">{bookingData.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                    <p className="text-base">{formatDate(bookingData.appointmentDate)} at {formatTime(bookingData.appointmentTime)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-base">{formatAddress()}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">What's Next?</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                  <li>You'll receive a confirmation email at <span className="font-medium">{bookingData.customerEmail}</span> with all the details.</li>
                  <li>Our technician will call you at <span className="font-medium">{bookingData.customerPhone}</span> on the day of your appointment to confirm the exact time.</li>
                  <li>The technician will arrive at your location with all the necessary tools and parts.</li>
                  <li>After diagnosing the issue, the technician will provide you with an exact quote before proceeding with the repair.</li>
                </ol>
              </div>
              
              <div className="text-center">
                <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 max-w-3xl mx-auto bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <BookingForm 
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </>
          )}
        </div>
      </section>
      
      {/* Booking Process */}
      {!bookingComplete && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div>
              <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">How Our Doorstep Repair Works</h3>
                <p className="text-gray-600">
                  A simple, hassle-free process from booking to repair
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="card hover:shadow-custom-lg transition-shadow text-center">
                  <div className="p-6">
                    <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Book Online</h3>
                    <p className="text-gray-600 text-sm">
                      Select your device, issue, location, and preferred appointment time.
                    </p>
                  </div>
                </div>
                
                <div className="card hover:shadow-custom-lg transition-shadow text-center">
                  <div className="p-6">
                    <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Confirmation</h3>
                    <p className="text-gray-600 text-sm">
                      Receive booking confirmation via email with all appointment details.
                    </p>
                  </div>
                </div>
                
                <div className="card hover:shadow-custom-lg transition-shadow text-center">
                  <div className="p-6">
                    <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Technician Visit</h3>
                    <p className="text-gray-600 text-sm">
                      Our technician arrives at your location with all necessary tools and parts.
                    </p>
                  </div>
                </div>
                
                <div className="card hover:shadow-custom-lg transition-shadow text-center">
                  <div className="p-6">
                    <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Repair & Payment</h3>
                    <p className="text-gray-600 text-sm">
                      Your device is repaired on-site. Pay only after the repair is complete and tested.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {!bookingComplete && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Doorstep Repair?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professional, convenient, and transparent device repair services throughout the Lower Mainland
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                <div className="rounded-full bg-primary-100 w-12 h-12 flex items-center justify-center mb-4">
                  <FaClock className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Save Time</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  No need to travel or wait in line at a repair shop. Our technicians come to your location at your convenience.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                <div className="rounded-full bg-primary-100 w-12 h-12 flex items-center justify-center mb-4">
                  <FaTools className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Technicians</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  Our certified technicians have years of experience and bring all necessary tools and high-quality parts with them.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                <div className="rounded-full bg-primary-100 w-12 h-12 flex items-center justify-center mb-4">
                  <FaShieldAlt className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Warranty Included</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  All our repairs come with a 1-year warranty. If anything goes wrong, we'll fix it at no additional cost.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <blockquote className="italic text-lg text-gray-700 max-w-2xl mx-auto">
                "The technician was professional, fast, and fixed my laptop right at my kitchen table. I didn't have to go anywhere or wait days for a repair!"
                <cite className="block text-sm text-gray-500 mt-2 not-italic">— Sarah K., Vancouver</cite>
              </blockquote>
              
              <div className="flex justify-center mt-4">
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BookOnlinePage; 