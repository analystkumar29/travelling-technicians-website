import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { formatDate } from '@/utils/formatters';
import { format } from 'date-fns';

interface Booking {
  id: string;
  reference_number: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_email: string;
  address: string;
  status: string;
  created_at: string;
  issue_description?: string;
}

const RescheduleBooking: React.FC = () => {
  const router = useRouter();
  const { reference, token } = router.query;
  
  // States
  const [step, setStep] = useState<'email' | 'select-booking' | 'reschedule'>('email');
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  console.log('[RescheduleBooking] Component loaded with params:', { reference, token });

  const fetchAllBookingsForEmail = useCallback(async (customerEmail: string, verificationToken: string, verificationReference: string) => {
    try {
      console.log('[RescheduleBooking] Fetching all bookings for email');
      
      const response = await fetch('/api/bookings/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerEmail,
          verificationToken: verificationToken,
          verificationReference: verificationReference
        })
      });

      const result = await response.json();
      console.log('[RescheduleBooking] All bookings response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch your bookings');
      }

      setBookings(result.bookings || []);
      setStep('select-booking');
      setStatus('ready');

    } catch (error) {
      console.error('[RescheduleBooking] Error fetching bookings:', error);
      setStatus('error');
      setMessage('Unable to load your bookings. Please try again.');
    }
  }, []);

  const loadBookingFromParams = useCallback(async (ref: string, tok: string) => {
    try {
      setStatus('loading');
      console.log('[RescheduleBooking] Loading booking:', ref);

      // Fetch the specific booking first
      const bookingResponse = await fetch(`/api/bookings/${ref}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const bookingResult = await bookingResponse.json();
      console.log('[RescheduleBooking] Booking response:', bookingResult);

      if (!bookingResponse.ok || !bookingResult.success) {
        throw new Error(bookingResult.message || 'Failed to load booking');
      }

      const booking = bookingResult.booking;
      setEmail(booking.customer_email);
      setSelectedBooking(booking);
      
      // Now fetch all bookings for this email
      await fetchAllBookingsForEmail(booking.customer_email, tok, ref);
      
    } catch (error) {
      console.error('[RescheduleBooking] Error loading booking:', error);
      setStatus('error');
      setMessage('Unable to load booking. Please check your link or try again.');
    }
  }, [fetchAllBookingsForEmail]);

  // Auto-load booking if we have reference and token
  useEffect(() => {
    if (reference && token && typeof reference === 'string' && typeof token === 'string') {
      console.log('[RescheduleBooking] Auto-loading from URL params');
      loadBookingFromParams(reference, token);
    }
  }, [reference, token, loadBookingFromParams]);



  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    // If we have URL params, use them for verification
    if (reference && token && typeof reference === 'string' && typeof token === 'string') {
      await fetchAllBookingsForEmail(email.trim().toLowerCase(), token, reference);
    } else {
      setMessage('Please use the reschedule link from your booking confirmation email');
    }
  };

  const handleBookingSelect = (booking: Booking) => {
    console.log('[RescheduleBooking] Selected booking:', booking);
    setSelectedBooking(booking);
    setStep('reschedule');
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedBooking) {
      setMessage('Please select both date and time');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('');

      console.log('[RescheduleBooking] Submitting reschedule:', {
        bookingId: selectedBooking.id,
        newDate: selectedDate,
        newTime: selectedTime,
        reference: selectedBooking.reference_number
      });

             const response = await fetch('/api/bookings/update', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           id: selectedBooking.id,
           appointmentDate: selectedDate,
           appointmentTime: selectedTime
         })
       });

      const result = await response.json();
      console.log('[RescheduleBooking] Update response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to reschedule booking');
      }

      // Send confirmation email
      await sendRescheduleConfirmation();
      
      setStatus('success');
      setMessage('Your booking has been successfully rescheduled!');

    } catch (error) {
      console.error('[RescheduleBooking] Error rescheduling:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to reschedule booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendRescheduleConfirmation = async () => {
    if (!selectedBooking) return;

    try {
      console.log('[RescheduleBooking] Sending reschedule confirmation email...');
      
      const formatTimeDisplay = (timeSlot: string) => {
        switch (timeSlot) {
          case 'morning': return 'Morning (9AM - 12PM)';
          case 'afternoon': return 'Afternoon (12PM - 4PM)';
          case 'evening': return 'Evening (4PM - 7PM)';
          default: return timeSlot;
        }
      };

      const emailData = {
        to: selectedBooking.customer_email,
        name: selectedBooking.customer_name,
        bookingReference: selectedBooking.reference_number,
        deviceType: selectedBooking.device_type,
        brand: selectedBooking.device_brand,
        model: selectedBooking.device_model,
        service: selectedBooking.service_type,
        oldDate: formatDate(selectedBooking.booking_date),
        oldTime: formatTimeDisplay(selectedBooking.booking_time),
        bookingDate: formatDate(selectedDate),
        bookingTime: formatTimeDisplay(selectedTime),
        address: selectedBooking.address
      };

      console.log('[RescheduleBooking] Email data being sent:', emailData);

      const response = await fetch('/api/send-reschedule-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();
      console.log('[RescheduleBooking] Email response status:', response.status);
      console.log('[RescheduleBooking] Email response ok:', response.ok);
      console.log('[RescheduleBooking] Email response data:', result);

      if (!response.ok || !result.success) {
        console.error('[RescheduleBooking] Email send failed:', {
          status: response.status,
          ok: response.ok,
          result: result
        });
        // Don't fail the entire process for email issues
        setMessage('Booking rescheduled successfully! However, confirmation email may be delayed.');
      } else {
        console.log('[RescheduleBooking] Email sent successfully');
        // Optional: Update message to confirm email was sent
        // setMessage('Booking rescheduled successfully! Confirmation email sent.');
      }
    } catch (error) {
      console.error('[RescheduleBooking] Error sending confirmation email:', error);
      // Don't fail the entire process for email issues  
      setMessage('Booking rescheduled successfully! However, confirmation email may be delayed.');
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return maxDate.toISOString().split('T')[0];
  };

  const formatBookingStatus = (status: string) => {
    switch (status) {
      case 'confirmed': return { label: 'Confirmed', class: 'bg-green-100 text-green-800' };
      case 'pending': return { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
      case 'completed': return { label: 'Completed', class: 'bg-blue-100 text-blue-800' };
      case 'cancelled': return { label: 'Cancelled', class: 'bg-red-100 text-red-800' };
      default: return { label: status, class: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatTimeDisplay = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'Morning (9AM - 12PM)';
      case 'afternoon': return 'Afternoon (12PM - 4PM)';
      case 'evening': return 'Evening (4PM - 7PM)';
      default: return timeSlot;
    }
  };

  const renderEmailStep = () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Your Email</h2>
        <p className="text-gray-600 mb-6">
          Enter the email address associated with your booking to view and reschedule your appointments.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="your.email@example.com"
            disabled={status === 'loading'}
          />
        </div>

        {message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        <button
          onClick={handleEmailSubmit}
          disabled={status === 'loading' || !email.trim()}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Loading...' : 'Continue'}
        </button>
      </div>
    </div>
  );

  const renderBookingSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Booking to Reschedule</h2>
        
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No bookings found for this email address.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const statusInfo = formatBookingStatus(booking.status);
              const isOriginalBooking = booking.reference_number === reference;
              const canReschedule = booking.status === 'pending' || booking.status === 'confirmed';
              
              return (
                <div
                  key={booking.id}
                  className={`border rounded-lg p-4 transition-all ${
                    !canReschedule 
                      ? 'border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed' 
                      : isOriginalBooking 
                        ? 'border-primary-300 bg-primary-50 cursor-pointer hover:border-primary-400' 
                        : 'border-gray-200 hover:border-primary-300 cursor-pointer'
                  }`}
                  onClick={() => canReschedule && handleBookingSelect(booking)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">
                        {booking.reference_number}
                      </h3>
                      {isOriginalBooking && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          From Email Link
                        </span>
                      )}
                      {!canReschedule && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Cannot Reschedule
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Device:</span>
                      <span className="ml-2 font-medium">{booking.device_brand} {booking.device_model}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <span className="ml-2 font-medium">{booking.service_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2 font-medium">{formatDate(booking.booking_date)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <span className="ml-2 font-medium">{formatTimeDisplay(booking.booking_time)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm">
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-2">{booking.address}</span>
                  </div>
                  
                  {!canReschedule && (
                    <div className="mt-3 text-sm text-gray-500 italic">
                      Only pending and confirmed bookings can be rescheduled.
                      {booking.status === 'cancelled' && ' This booking has been cancelled.'}
                      {booking.status === 'completed' && ' This booking has been completed.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => setStep('email')}
            className="text-primary-600 hover:text-primary-700"
          >
            ← Back to Email Entry
          </button>
        </div>
      </div>
    </div>
  );

  const renderRescheduleStep = () => {
    if (!selectedBooking) return null;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Reschedule Booking</h2>
          
          {/* Current booking info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Current Booking</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Reference:</span>
                <span className="ml-2 font-medium">{selectedBooking.reference_number}</span>
              </div>
              <div>
                <span className="text-gray-500">Device:</span>
                <span className="ml-2 font-medium">{selectedBooking.device_brand} {selectedBooking.device_model}</span>
              </div>
              <div>
                <span className="text-gray-500">Current Date:</span>
                <span className="ml-2 font-medium">{formatDate(selectedBooking.booking_date)}</span>
              </div>
              <div>
                <span className="text-gray-500">Current Time:</span>
                <span className="ml-2 font-medium">{formatTimeDisplay(selectedBooking.booking_time)}</span>
              </div>
            </div>
          </div>

          {/* New date/time selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTomorrowDate()}
                max={getMaxDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">We accept bookings up to 60 days in advance.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Time <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a time slot...</option>
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 4PM)</option>
                <option value="evening">Evening (4PM - 7PM)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Our technicians work 7 days a week.</p>
            </div>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => setStep('select-booking')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
            >
              ← Back to Bookings
            </button>
            <button
              onClick={handleRescheduleSubmit}
              disabled={isSubmitting || !selectedDate || !selectedTime}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Rescheduling...' : 'Reschedule Booking'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Reschedule Booking | The Travelling Technicians">
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Reschedule Your Appointment</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Need to change your appointment time? No problem! Select a new date and time that works better for you.
            </p>
          </div>

          {step === 'email' && renderEmailStep()}
          {step === 'select-booking' && renderBookingSelection()}
          {step === 'reschedule' && renderRescheduleStep()}
        </div>
      </div>
    </Layout>
  );
};

export default RescheduleBooking; 