import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '@/context/AuthContext';
import { useBookingForm } from '@/hooks/useBookingForm';
import { supabase } from '@/utils/supabaseClient';
import { FaCheckCircle, FaRegCalendarAlt, FaMapMarkerAlt, FaTools, FaMobileAlt, FaLaptop } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
// Import temporarily commented out due to build issues
// import ConfettiExplosion from 'react-confetti-explosion';
import { BookingFormState } from '@/types/booking';

interface BookingCompleteProps {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  onReset: () => void;
}

const BookingComplete: React.FC<BookingCompleteProps> = ({
  bookingReference,
  customerName,
  customerEmail,
  appointmentDate,
  appointmentTime,
  onReset
}) => {
  const router = useRouter();
  const { state } = useBookingForm();
  const auth = useContext(AuthContext);
  const { isAuthenticated } = auth || {};

  // Format date for better display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-CA', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Function to handle the registration flow
  const handleRegister = () => {
    // Store booking reference in session storage to associate it with the account after registration
    sessionStorage.setItem('pendingBookingReference', bookingReference);
    router.push(`/auth/register?email=${encodeURIComponent(customerEmail)}&redirect=/account/bookings`);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h2>
        <p className="mt-2 text-gray-600">
          Your repair request has been successfully submitted.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-gray-600">Reference Number:</span>
            <span className="font-semibold text-primary-700">{bookingReference}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{customerName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{customerEmail}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-gray-600">Appointment:</span>
            <span className="font-medium">{formatDate(appointmentDate)}, {appointmentTime}</span>
          </div>
        </div>
      </div>

      {/* Account creation prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-lg mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Create an account to manage your bookings
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Register now to track your repair status, view warranty information, and schedule future repairs more easily.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Account
                  </button>
                  <Link href={`/auth/login?email=${encodeURIComponent(customerEmail)}&redirect=/account/bookings`}>
                    <a className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      I Already Have an Account
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-4">
        <p className="text-gray-600">
          We've sent a confirmation email to <span className="font-semibold">{customerEmail}</span> with these details.
        </p>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <Link href="/">
            <a className="text-primary-600 hover:text-primary-800 font-medium">
              Return to Home
            </a>
          </Link>

          {isAuthenticated && (
            <Link href="/account/bookings">
              <a className="ml-6 text-primary-600 hover:text-primary-800 font-medium">
                View All Bookings
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingComplete; 