import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { format, addDays, isBefore } from 'date-fns';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCalendarAlt, FaClock } from 'react-icons/fa';

// Generate available dates (next 14 days)
function getAvailableDates() {
  const dates = [];
  const today = new Date();
  
  // Start from tomorrow
  const tomorrow = addDays(today, 1);
  
  // Generate dates for the next 14 days
  for (let i = 0; i < 14; i++) {
    const date = addDays(tomorrow, i);
    dates.push({
      date: format(date, 'yyyy-MM-dd'),
      display: format(date, 'EEEE, MMMM d, yyyy'),
      day: format(date, 'EEEE')
    });
  }
  
  return dates;
}

// Available time slots
const availableTimeSlots = [
  { id: '09:00-11:00', display: '9:00 AM - 11:00 AM' },
  { id: '11:00-13:00', display: '11:00 AM - 1:00 PM' },
  { id: '13:00-15:00', display: '1:00 PM - 3:00 PM' },
  { id: '15:00-17:00', display: '3:00 PM - 5:00 PM' },
  { id: '17:00-19:00', display: '5:00 PM - 7:00 PM' },
];

export default function RescheduleBooking() {
  const router = useRouter();
  const { token, reference } = router.query;
  
  const [status, setStatus] = useState<'loading' | 'error' | 'ready' | 'success'>('loading');
  const [message, setMessage] = useState('Verifying your booking information...');
  
  const [booking, setBooking] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  
  const [availableDates] = useState(getAvailableDates());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load booking when reference is available
  useEffect(() => {
    if (!reference) return;
    
    const fetchBooking = async () => {
      console.log('[RescheduleBooking] Starting to fetch booking:', { reference, token });
      
      try {
        // Fetch booking using the API endpoint
        console.log('[RescheduleBooking] Making API call to:', `/api/bookings/${reference}`);
        const response = await fetch(`/api/bookings/${reference}`);
        
        console.log('[RescheduleBooking] API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[RescheduleBooking] API error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          setStatus('error');
          setMessage('Booking not found. Please check your link or contact support.');
          return;
        }
        
        const bookingData = await response.json();
        console.log('[RescheduleBooking] Successfully fetched booking:', {
          reference: bookingData.reference_number,
          customerName: bookingData.customer_name,
          hasData: !!bookingData
        });
        
        setBooking(bookingData);
        
        // If we have token, status changes to ready
        if (token) {
          console.log('[RescheduleBooking] Token found, setting status to ready');
          setStatus('ready');
          setMessage('Please enter your email to verify and reschedule your booking.');
        } else {
          console.log('[RescheduleBooking] No token found, setting error status');
          setStatus('error');
          setMessage('Invalid verification link. Please check your email for the correct link.');
        }
      } catch (error) {
        console.error('[RescheduleBooking] Error fetching booking:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        setStatus('error');
        setMessage('Error retrieving booking information. Please try again later.');
      }
    };
    
    fetchBooking();
  }, [reference, token]);
  
  // Handle email verification
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[RescheduleBooking] Starting email verification:', { email, token, reference });
    
    // Validate email
    if (!email) {
      console.log('[RescheduleBooking] Email validation failed: empty email');
      setEmailError('Email is required for verification');
      return;
    }
    
    if (!token || !reference) {
      console.error('[RescheduleBooking] Missing verification data:', { token: !!token, reference });
      setStatus('error');
      setMessage('Missing verification data. Please check your link.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('[RescheduleBooking] Making verification API call');
      // Call verification API
      const response = await fetch('/api/verify-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reference, email }),
      });
      
      console.log('[RescheduleBooking] Verification API response status:', response.status);
      
      const result = await response.json();
      console.log('[RescheduleBooking] Verification API result:', {
        success: result.success,
        message: result.message,
        hasBooking: !!result.booking
      });
      
      if (response.ok && result.success) {
        console.log('[RescheduleBooking] Verification successful');
        setStatus('ready');
        setMessage('Your identity is confirmed. Select a new date and time for your booking.');
      } else {
        console.log('[RescheduleBooking] Verification failed:', result.message);
        setEmailError(result.message || 'Verification failed. Please check your email and try again.');
      }
    } catch (error) {
      console.error('[RescheduleBooking] Error during verification:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      setEmailError('An error occurred during verification. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle reschedule form submission
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[RescheduleBooking] Starting reschedule submission:', {
      selectedDate,
      selectedTime,
      reference,
      bookingId: booking?.id
    });
    
    // Validate selections
    let hasError = false;
    
    if (!selectedDate) {
      console.log('[RescheduleBooking] Date validation failed: no date selected');
      setDateError('Please select a date');
      hasError = true;
    }
    
    if (!selectedTime) {
      console.log('[RescheduleBooking] Time validation failed: no time selected');
      setTimeError('Please select a time');
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsSubmitting(true);
    
    try {
      // Format the selected date for display
      const selectedDateObj = new Date(selectedDate);
      const formattedNewDate = format(selectedDateObj, 'EEEE, MMMM d, yyyy');
      
      // Find the time slot display
      const timeSlot = availableTimeSlots.find(ts => ts.id === selectedTime);
      const formattedNewTime = timeSlot ? timeSlot.display : selectedTime;
      
      // Format the original booking date for display
      const originalDate = new Date(booking.booking_date);
      const formattedOriginalDate = format(originalDate, 'EEEE, MMMM d, yyyy');
      
      console.log('[RescheduleBooking] Making update API call with data:', {
        reference,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        formattedNewDate,
        formattedNewTime
      });
      
      // Update booking using API endpoint
      const updateResponse = await fetch('/api/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          status: 'pending' // Reset to pending so it needs verification again
        }),
      });
      
      console.log('[RescheduleBooking] Update API response status:', updateResponse.status);
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('[RescheduleBooking] Update API error:', {
          status: updateResponse.status,
          errorData
        });
        throw new Error(errorData.message || 'Failed to update booking');
      }
      
      console.log('[RescheduleBooking] Booking update successful');
      
      // Send reschedule confirmation email
      const emailResponse = await fetch('/api/send-reschedule-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: booking.customer_email,
          name: booking.customer_name,
          bookingReference: booking.reference_number,
          deviceType: booking.device_type,
          brand: booking.device_brand,
          model: booking.device_model,
          service: booking.service_type,
          oldDate: formattedOriginalDate,
          oldTime: booking.booking_time,
          bookingDate: formattedNewDate,
          bookingTime: formattedNewTime,
          address: booking.address
        }),
      });
      
      if (!emailResponse.ok) {
        console.warn('Failed to send reschedule email, but booking was updated');
      }
      
      // Update status to success
      setStatus('success');
      setMessage('Your booking has been successfully rescheduled!');
      setBooking({
        ...booking,
        booking_date: selectedDate,
        booking_time: selectedTime
      });
      
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      setStatus('error');
      setMessage('An error occurred while rescheduling your booking. Please try again later or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout title="Reschedule Booking | The Travelling Technicians">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {/* Loading State */}
            {status === 'loading' && (
              <div className="flex flex-col items-center text-center">
                <div className="animate-pulse">
                  <div className="h-16 w-16 rounded-full bg-primary-200 flex items-center justify-center mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary-500"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading</h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {status === 'error' && (
              <div className="flex flex-col items-center text-center">
                <FaTimesCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex space-x-4 mt-2">
                  <button 
                    onClick={() => router.push('/contact')}
                    className="btn-primary"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}
            
            {/* Email Verification */}
            {status === 'ready' && !selectedDate && booking && (
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reschedule Your Booking</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                
                {!email && (
                  <form onSubmit={handleVerifySubmit} className="w-full max-w-md space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError('');
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter the email used for booking"
                      />
                      {emailError && (
                        <p className="mt-1 text-sm text-red-600 text-left">{emailError}</p>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Verifying...
                          </>
                        ) : (
                          'Verify & Continue'
                        )}
                      </button>
                    </div>
                  </form>
                )}
                
                {email && (
                  <div className="w-full max-w-md">
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                      <h3 className="font-medium text-gray-900 mb-2">Current Booking Details</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Reference: </span>
                          <span className="font-medium">{booking.reference_number}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Device: </span>
                          <span className="font-medium">{booking.device_type} {booking.device_brand && `- ${booking.device_brand}`} {booking.device_model && booking.device_model}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Service: </span>
                          <span className="font-medium">{booking.service_type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Current Date: </span>
                          <span className="font-medium">{new Date(booking.booking_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Current Time: </span>
                          <span className="font-medium">{booking.booking_time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <form onSubmit={handleRescheduleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <FaCalendarAlt className="mr-2 text-primary-500" />
                          Select New Date
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {availableDates.map((dateOption) => (
                            <div key={dateOption.date}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDate(dateOption.date);
                                  setDateError('');
                                }}
                                className={`w-full px-4 py-2 border rounded-md text-left ${
                                  selectedDate === dateOption.date
                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {dateOption.display}
                              </button>
                            </div>
                          ))}
                        </div>
                        {dateError && (
                          <p className="mt-1 text-sm text-red-600">{dateError}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <FaClock className="mr-2 text-primary-500" />
                          Select New Time
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableTimeSlots.map((timeSlot) => (
                            <div key={timeSlot.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTime(timeSlot.id);
                                  setTimeError('');
                                }}
                                className={`w-full px-4 py-2 border rounded-md text-center ${
                                  selectedTime === timeSlot.id
                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {timeSlot.display}
                              </button>
                            </div>
                          ))}
                        </div>
                        {timeError && (
                          <p className="mt-1 text-sm text-red-600">{timeError}</p>
                        )}
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting || !selectedDate || !selectedTime}
                          className="w-full btn-primary flex items-center justify-center"
                        >
                          {isSubmitting ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Rescheduling...
                            </>
                          ) : (
                            'Confirm Reschedule'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
            
            {/* Success State */}
            {status === 'success' && (
              <div className="flex flex-col items-center text-center">
                <FaCheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Rescheduled</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                
                {booking && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md w-full">
                    <h3 className="font-medium text-gray-900 mb-2">New Booking Details</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm text-left">
                      <div>
                        <span className="text-gray-500">Reference: </span>
                        <span className="font-medium">{booking.reference_number}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Device: </span>
                        <span className="font-medium">
                          {booking.device_type} 
                          {booking.device_brand && ` - ${booking.device_brand}`} 
                          {booking.device_model && ` ${booking.device_model}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Service: </span>
                        <span className="font-medium">{booking.service_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">New Date: </span>
                        <span className="font-medium">{new Date(booking.booking_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">New Time: </span>
                        <span className="font-medium">
                          {(() => {
                            const timeSlot = availableTimeSlots.find(ts => ts.id === booking.booking_time);
                            return timeSlot ? timeSlot.display : booking.booking_time;
                          })()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status: </span>
                        <span className="font-medium">Pending</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-gray-500 mb-8">
                  A confirmation email has been sent with your new booking details.
                  Please check your email and verify your booking again.
                </p>
                
                <div className="flex space-x-4 mt-2">
                  <button 
                    onClick={() => router.push('/')}
                    className="btn-outline"
                  >
                    Return Home
                  </button>
                  <button 
                    onClick={() => router.push('/contact')}
                    className="btn-primary"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 