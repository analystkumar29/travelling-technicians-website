import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Layout from '@/components/layout/Layout';
import BookingForm from '@/components/booking/BookingForm';
import Link from 'next/link';
import Image from 'next/image';
import { FaCheck, FaClock, FaTools, FaShieldAlt, FaStar, FaInfoCircle, FaThumbsUp, FaMapMarkerAlt } from 'react-icons/fa';
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
      {/* Hero Section - Enhanced with background pattern */}
      <section className="bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "30px 30px"
          }}></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-primary-100 text-sm font-medium">
            <FaInfoCircle className="mr-2" />
            Expert repair service at your doorstep
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-md">
            Book Your Doorstep Repair
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            We'll come to you! Schedule a convenient time, and our expert technicians 
            will repair your device right at your doorstep.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4 flex-wrap">
            <div className="flex items-center mt-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <FaThumbsUp className="mr-2" />
              <span>No Travel Required</span>
            </div>
            <div className="flex items-center mt-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <FaShieldAlt className="mr-2" />
              <span>1-Year Warranty</span>
            </div>
            <div className="flex items-center mt-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <FaMapMarkerAlt className="mr-2" />
              <span>Lower Mainland Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-12 px-4 bg-gray-50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-700 to-transparent h-24"></div>
        <div className="max-w-7xl mx-auto relative">
          {bookingComplete && bookingData ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto mt-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 mb-4 transform transition-all duration-500 hover:scale-110">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-lg text-gray-600">
                  Thank you for booking with The Travelling Technicians.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
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
              
              <div className="mb-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-medium text-primary-700 mb-2 flex items-center">
                  <FaInfoCircle className="mr-2" />
                  What's Next?
                </h3>
                <ol className="list-decimal pl-5 space-y-3 text-gray-600">
                  <li>You'll receive a confirmation email at <span className="font-medium text-primary-700">{bookingData.customerEmail}</span> with all the details.</li>
                  <li>Our technician will call you at <span className="font-medium text-primary-700">{bookingData.customerPhone}</span> on the day of your appointment to confirm the exact time.</li>
                  <li>The technician will arrive at your location with all the necessary tools and parts.</li>
                  <li>After diagnosing the issue, the technician will provide you with an exact quote before proceeding with the repair.</li>
                </ol>
              </div>
              
              <div className="text-center">
                <Link href="/">
                  <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 hover:scale-105">
                    Return to Home
                  </a>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
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
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div>
              <div className="bg-primary-50 rounded-xl shadow-sm p-6 mb-10 border border-primary-100">
                <h3 className="text-2xl font-bold text-primary-800 mb-3">How Our Doorstep Repair Works</h3>
                <p className="text-primary-700">
                  A simple, hassle-free process from booking to repair
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-center relative group">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <div className="p-6">
                    <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:scale-110 duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-primary-800">Book Online</h3>
                    <p className="text-gray-600">
                      Select your device, issue, location, and preferred appointment time.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-center relative group">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <div className="p-6">
                    <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:scale-110 duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-primary-800">Confirmation</h3>
                    <p className="text-gray-600">
                      Receive booking confirmation via email with all appointment details.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-center relative group">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <div className="p-6">
                    <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:scale-110 duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-primary-800">Technician Visit</h3>
                    <p className="text-gray-600">
                      Our technician arrives at your location with all necessary tools and parts.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-center relative group">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <div className="p-6">
                    <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:scale-110 duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-primary-800">Repair & Payment</h3>
                    <p className="text-gray-600">
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
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Doorstep Repair?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professional, convenient, and transparent device repair services throughout the Lower Mainland
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-4">
                  <FaClock className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Save Time</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  No need to travel or wait in line at a repair shop. Our technicians come to your location at your convenience.
                </p>
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-primary-600">No travel required</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-4">
                  <FaTools className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Technicians</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  Our certified technicians have years of experience and bring all necessary tools and high-quality parts with them.
                </p>
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-primary-600">Certified professionals</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-4">
                  <FaShieldAlt className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Warranty Included</h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  All our repairs come with a 1-year warranty. If anything goes wrong, we'll fix it at no additional cost.
                </p>
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-primary-600">1-year guarantee</span>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <blockquote className="italic text-lg text-gray-700 max-w-2xl mx-auto">
                "The technician was professional, fast, and fixed my laptop right at my kitchen table. I didn't have to go anywhere or wait days for a repair!"
              </blockquote>
              <cite className="block text-sm text-gray-500 mt-4 not-italic font-medium">— Sarah K., Vancouver</cite>
              
              <div className="flex justify-center mt-4">
                <FaStar className="text-yellow-400 mx-0.5" />
                <FaStar className="text-yellow-400 mx-0.5" />
                <FaStar className="text-yellow-400 mx-0.5" />
                <FaStar className="text-yellow-400 mx-0.5" />
                <FaStar className="text-yellow-400 mx-0.5" />
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BookOnlinePage; 