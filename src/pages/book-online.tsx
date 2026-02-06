import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import Layout from '@/components/layout/Layout';
import BookingForm from '@/components/booking/BookingForm';
import BookingComplete from '@/components/booking/BookingComplete';
import Link from 'next/link';
import Image from 'next/image';
import { DollarSign, Clock, Shield } from 'lucide-react';
import { bookingService } from '@/services/bookingService';
import type { CreateBookingRequest } from '@/types/booking';
import { logger } from '@/utils/logger';
import { supabase } from '@/utils/supabaseClient';
import { generateBookingReference as generateReferenceNumber } from '@/utils/bookingUtils';
import { formatDate, formatTimeSlot } from '@/utils/formatters';

// Create a logger for this page
const pageLogger = logger.createModuleLogger('BookOnlinePage');

const BookOnlinePage: NextPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);

  // useEffect cleanup for any potential state updates that might happen after unmounting
  useEffect(() => {
    return () => {
      // Cleanup function to prevent state updates after unmounting
    };
  }, []);

  const handleSubmit = async (data: CreateBookingRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Use the working booking API
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create booking');
      }
      
      // Record successful booking
      setBookingData({
        ...result.booking,
        reference_number: result.reference
      });
      
      // For SEO and analytics
      if (typeof window !== 'undefined') {
        // Track conversion
        if ((window as any).gtag) {
          (window as any).gtag('event', 'booking_completed', {
            'event_category': 'booking',
            'event_label': data.deviceType
          });
        }
        
        // Store booking in local storage for recovery
        localStorage.setItem('lastBookingReference', result.reference);
      }
      
      setIsSuccess(true);
      
      // Email is already sent by the API, no need to send again
      
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Handle cancellation - for now just redirect to home
    window.location.href = '/';
  };
  
  // Add a reset function for the booking form
  const handleReset = () => {
    setIsSuccess(false);
    setBookingData(null);
  };
  
  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    // Use the formatTimeSlot utility function which properly handles "HH-HH" format
    return formatTimeSlot(timeString);
  };
  
  const formatAddress = () => {
    if (!bookingData) return 'N/A';
    return `${bookingData.address}, ${bookingData.city || 'Vancouver'}, ${bookingData.province || 'BC'} ${bookingData.postalCode}`;
  };

  return (
    <Layout title="Book Online | The Travelling Technicians">
      <div className="py-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold text-primary-900 mb-4">Book Your Doorstep Repair</h1>
            <p className="text-lg text-primary-500 max-w-2xl mx-auto">
              We bring expert repair service directly to your doorstep. Fill out the form below to schedule a convenient time for your device repair.
            </p>
          </div>
          
          {error && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
            </div>
          )}
          
          {isSuccess && bookingData ? (
            <BookingComplete 
              bookingReference={bookingData.reference_number}
              customerName={bookingData.customer_name}
              customerEmail={bookingData.customer_email}
              appointmentDate={bookingData.booking_date}
              appointmentTime={bookingData.booking_time}
              onReset={handleReset}
            />
          ) : (
            <BookingForm 
              onSubmit={handleSubmit} 
              initialData={{}}
            />
          )}
          
          <div className="mt-16 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-primary-700" />
                <span className="ml-2 text-primary-700 font-medium">Transparent Pricing</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-primary-700" />
                <span className="ml-2 text-primary-700 font-medium">Same-Day Service</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary-700" />
                <span className="ml-2 text-primary-700 font-medium">Up to 6-Month Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookOnlinePage; 