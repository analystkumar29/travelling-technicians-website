import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { formatDate, formatTimeSlot } from '@/utils/formatters';
import { getTimeSlotsForDate, type TimeSlot } from '@/utils/bookingTimeSlots';

interface Booking {
  id: string;
  booking_ref: string;
  reference_number?: string; // Legacy field for backward compatibility
  quoted_price?: number;
  scheduled_at?: string; // ISO timestamp
  booking_date?: string; // Legacy field for backward compatibility
  booking_time?: string; // Legacy field for backward compatibility
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  address?: string; // Legacy field for backward compatibility
  status: string;
  created_at: string;
  issue_description?: string;
  technician?: {
    assigned: boolean;
    name?: string;
    phone?: string; // WhatsApp number
    whatsapp?: string; // Legacy field
  };
  service?: {
    name: string;
    description?: string;
  };
  device?: {
    model: string;
    brand: string;
  };
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
  const [countdown, setCountdown] = useState(0);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

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

      // Fetch the specific booking first - use the updated API endpoint
      const bookingResponse = await fetch(`/api/bookings/reference/${ref}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const bookingResult = await bookingResponse.json();
      console.log('[RescheduleBooking] Booking response:', bookingResult);

      if (!bookingResponse.ok || !bookingResult.success) {
        throw new Error(bookingResult.message || 'Failed to load booking');
      }

      const booking = bookingResult.booking;
      setEmail(booking.customer_email || booking.email || '');
      setSelectedBooking(booking);
      
      // Now fetch all bookings for this email
      await fetchAllBookingsForEmail(booking.customer_email || booking.email || '', tok, ref);
      
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

  // Fetch time slots when appointment date changes
  useEffect(() => {
    if (selectedDate) {
      const fetchTimeSlots = async () => {
        setIsLoadingTimeSlots(true);
        try {
          const date = new Date(selectedDate);
          const slots = await getTimeSlotsForDate(date);
          setTimeSlots(slots);
          
          // If current appointmentTime is not in the new slots, clear it
          if (selectedTime && !slots.some(slot => slot.value === selectedTime)) {
            setSelectedTime('');
          }
        } catch (error) {
          console.error('[RescheduleBooking] Error fetching time slots:', error);
          // Set default time slots as fallback
          setTimeSlots([
            { value: '8:00', label: '8:00 AM - 10:00 AM', startHour: 8, endHour: 10 },
            { value: '10:00', label: '10:00 AM - 12:00 PM', startHour: 10, endHour: 12 },
            { value: '12:00', label: '12:00 PM - 2:00 PM', startHour: 12, endHour: 14 },
            { value: '14:00', label: '2:00 PM - 4:00 PM', startHour: 14, endHour: 16 },
            { value: '16:00', label: '4:00 PM - 6:00 PM', startHour: 16, endHour: 18 },
            { value: '18:00', label: '6:00 PM - 8:00 PM', startHour: 18, endHour: 20 }
          ]);
        } finally {
          setIsLoadingTimeSlots(false);
        }
      };
      
      fetchTimeSlots();
    } else {
      // Clear time slots if no date selected
      setTimeSlots([]);
    }
  }, [selectedDate, selectedTime]);



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
      const emailSent = await sendRescheduleConfirmation();
      
      setStatus('success');
      if (emailSent) {
        setMessage('Perfect! Your booking has been rescheduled and a confirmation email has been sent.');
      } else {
        setMessage('Your booking has been rescheduled successfully. We\'ll send you a confirmation email shortly.');
      }

      // Auto-refresh booking data and return to booking list after 3 seconds
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(async () => {
        clearInterval(countdownInterval);
        if (reference && token && typeof reference === 'string' && typeof token === 'string') {
          try {
            // Refresh the booking data to show updated information
            await fetchAllBookingsForEmail(selectedBooking.customer_email, token, reference);
            setStep('select-booking');
            setStatus('ready');
            setMessage('');
            setCountdown(0);
          } catch (error) {
            console.error('[RescheduleBooking] Error refreshing booking data:', error);
          }
        }
      }, 3000);

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
        bookingReference: selectedBooking.booking_ref || selectedBooking.reference_number || 'N/A',
        deviceType: selectedBooking.device?.brand || '',
        brand: selectedBooking.device?.brand || '',
        model: selectedBooking.device?.model || '',
        service: selectedBooking.service?.name || '',
        oldDate: selectedBooking.scheduled_at ? 
          new Date(selectedBooking.scheduled_at).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          }) : 
          selectedBooking.booking_date ? 
            formatDate(selectedBooking.booking_date) : 
            'To be scheduled',
        oldTime: selectedBooking.scheduled_at ? 
          new Date(selectedBooking.scheduled_at).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }) : 
          selectedBooking.booking_time ? 
            formatTimeDisplay(selectedBooking.booking_time) : 
            'To be scheduled',
        bookingDate: formatDate(selectedDate),
        bookingTime: formatTimeDisplay(selectedTime),
        address: selectedBooking.customer_address || selectedBooking.address || 'Address not provided'
      };

      console.log('[RescheduleBooking] Sending email confirmation for:', selectedBooking.reference_number);

      const response = await fetch('/api/send-reschedule-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.warn('[RescheduleBooking] Email confirmation failed, but booking was updated');
        // Return false to indicate email failed, but don't throw error
        return false;
      } else {
        console.log('[RescheduleBooking] Email confirmation sent successfully');
        return true;
      }
    } catch (error) {
      console.error('[RescheduleBooking] Error sending confirmation email:', error);
      // Don't fail the entire process for email issues  
      return false;
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
              const bookingRef = booking.booking_ref || booking.reference_number;
              const isOriginalBooking = bookingRef === reference;
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
                      <span className="ml-2 font-medium">
                        {booking.device?.brand || ''} {booking.device?.model || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <span className="ml-2 font-medium">{booking.service?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2 font-medium">
                        {booking.scheduled_at ? 
                          new Date(booking.scheduled_at).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 
                          booking.booking_date ? 
                            formatDate(booking.booking_date) : 
                            'To be scheduled'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <span className="ml-2 font-medium">
                        {booking.scheduled_at ? 
                          new Date(booking.scheduled_at).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          }) : 
                          booking.booking_time ? 
                            formatTimeDisplay(booking.booking_time) : 
                            'To be scheduled'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm">
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-2">{booking.customer_address || booking.address || 'Address not provided'}</span>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Quoted Price:</span>
                    <span className="ml-2 font-medium">
                      {booking.quoted_price ? 
                        `$${parseFloat(booking.quoted_price.toString()).toFixed(2)}` : 
                        'Price to be confirmed'
                      }
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Technician:</span>
                    <span className="ml-2">
                      {booking.technician?.assigned ? 
                        `${booking.technician.name || 'Technician'} (${booking.technician.phone || booking.technician.whatsapp || 'Contact info pending'})` : 
                        'To be assigned'
                      }
                    </span>
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
                <span className="ml-2 font-medium">{selectedBooking.booking_ref || selectedBooking.reference_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Device:</span>
                <span className="ml-2 font-medium">
                  {selectedBooking.device?.brand || ''} {selectedBooking.device?.model || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Current Date:</span>
                <span className="ml-2 font-medium">
                  {selectedBooking.scheduled_at ? 
                    new Date(selectedBooking.scheduled_at).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 
                    selectedBooking.booking_date ? 
                      formatDate(selectedBooking.booking_date) : 
                      'To be scheduled'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">Current Time:</span>
                <span className="ml-2 font-medium">
                  {selectedBooking.scheduled_at ? 
                    new Date(selectedBooking.scheduled_at).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    }) : 
                    selectedBooking.booking_time ? 
                      formatTimeDisplay(selectedBooking.booking_time) : 
                      'To be scheduled'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">Quoted Price:</span>
                <span className="ml-2 font-medium">
                  {selectedBooking.quoted_price ? 
                    `$${parseFloat(selectedBooking.quoted_price.toString()).toFixed(2)}` : 
                    'Price to be confirmed'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">Technician:</span>
                <span className="ml-2">
                  {selectedBooking.technician?.assigned ? 
                    `${selectedBooking.technician.name || 'Technician'} (${selectedBooking.technician.phone || selectedBooking.technician.whatsapp || 'Contact info pending'})` : 
                    'To be assigned'
                  }
                </span>
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
              
              {isLoadingTimeSlots ? (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-md border border-gray-300">
                  <svg className="animate-spin h-5 w-5 text-primary-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600">Loading available time slots...</span>
                </div>
              ) : !selectedDate ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                  Please select a date first to see available time slots.
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  No time slots available for this date. Please select a different date.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedTime === slot.value
                          ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">Our technicians work 7 days a week. Select a 2-hour window that works best for you.</p>
            </div>
          </div>

          {message && status !== 'success' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                                 <div className="flex-1">
                   <p className="text-sm font-medium text-blue-800">{message}</p>
                   <p className="text-xs text-blue-600 mt-1">
                     {countdown > 0 ? `Returning to your bookings in ${countdown} second${countdown !== 1 ? 's' : ''}...` : 'Returning to your bookings...'}
                   </p>
                 </div>
              </div>
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