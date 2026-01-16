import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useBookingForm } from '@/hooks/useBookingForm';
import { supabase } from '@/utils/supabaseClient';
import { FaCheckCircle, FaRegCalendarAlt, FaMapMarkerAlt, FaTools, FaMobileAlt, FaLaptop } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate, formatTimeSlot } from '@/utils/formatters';
// Import temporarily commented out due to build issues
// import ConfettiExplosion from 'react-confetti-explosion';

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

  // Format time for better display
  const formatTime = (timeString: string) => {
    return formatTimeSlot(timeString);
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
            <span className="font-medium">{formatDate(appointmentDate)}, {formatTime(appointmentTime)}</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-gray-600">
          We've sent a confirmation email to <span className="font-semibold">{customerEmail}</span> with these details.
        </p>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <Link href="/" className="text-primary-600 hover:text-primary-800 font-medium">
              Return to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingComplete; 