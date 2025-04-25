import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

// Available dates (next 7 days)
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const displayDate = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    dates.push({ value: dateString, label: displayDate });
  }
  
  return dates;
};

// Available times
const availableTimes = [
  { id: '09-11', label: '9:00 AM - 11:00 AM' },
  { id: '11-13', label: '11:00 AM - 1:00 PM' },
  { id: '13-15', label: '1:00 PM - 3:00 PM' },
  { id: '15-17', label: '3:00 PM - 5:00 PM' },
  { id: '17-19', label: '5:00 PM - 7:00 PM' },
  { id: '19-21', label: '7:00 PM - 9:00 PM' },
];

export default function RescheduleBooking() {
  const router = useRouter();
  const { reference, token } = router.query;
  
  // Form states
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [note, setNote] = useState('');
  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  
  // Process states
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Loading your booking information...');
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  
  // Handle verification of token and reference
  useEffect(() => {
    if (!reference || !token) return;
    
    const validateToken = async () => {
      try {
        // In production, you would verify the token against your database
        // For demo, we'll just simulate a successful validation after delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple validation check
        if (typeof reference === 'string' && typeof token === 'string' && 
            reference.startsWith('TT') && token.length > 20) {
          
          // Mock booking data (in production, fetch from database)
          setBookingInfo({
            reference: reference,
            deviceType: 'Mobile Phone',
            issue: 'Screen Replacement',
            currentDate: 'Monday, June 10, 2024',
            currentTime: '9:00 AM - 11:00 AM',
            address: '123 Main St, Vancouver, BC'
          });
          
          setStatus('ready');
          setMessage('');
        } else {
          setStatus('error');
          setMessage('Invalid or expired reschedule link. Please contact support.');
        }
      } catch (error) {
        console.error('Error validating reschedule request:', error);
        setStatus('error');
        setMessage('Something went wrong while loading your booking. Please try again later.');
      }
    };
    
    validateToken();
  }, [reference, token]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    let hasError = false;
    
    if (!date) {
      setDateError(true);
      hasError = true;
    }
    
    if (!timeSlot) {
      setTimeError(true);
      hasError = true;
    }
    
    if (hasError) return;
    
    // Start submission
    setStatus('submitting');
    
    try {
      // In production, you would call an API to update the booking
      // For now, we'll use our real email API
      try {
        // Format the date for display
        const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        }) : '';
        
        // Format the time for display
        const formattedTime = availableTimes.find(t => t.id === timeSlot)?.label || '';
        
        // Prepare the user's email
        const userEmail = typeof reference === 'string' ? reference.split('@').length > 1 ? reference : undefined : undefined;
        
        // Send reschedule confirmation email
        const emailResponse = await fetch('/api/send-reschedule-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: userEmail || 'manoj@example.com', // In production, you'd get this from your database
            name: 'Customer', // In production, you'd get this from your database
            bookingReference: bookingInfo.reference,
            deviceType: bookingInfo.deviceType || 'Device',
            brand: '', // Would come from database
            model: '', // Would come from database
            service: bookingInfo.issue,
            oldDate: bookingInfo.currentDate,
            oldTime: bookingInfo.currentTime,
            bookingDate: formattedDate,
            bookingTime: formattedTime,
            address: bookingInfo.address,
            notes: note || '',
          }),
        });
        
        const emailResult = await emailResponse.json();
        console.log('Email sending result:', emailResult);
      } catch (emailError) {
        console.error('Failed to send reschedule confirmation email:', emailError);
        // Continue with success state even if email fails
      }
      
      // Update status to success
      setStatus('success');
      setMessage('Your booking has been successfully rescheduled! A confirmation email will be sent shortly.');
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      setStatus('error');
      setMessage('Failed to reschedule your booking. Please try again or contact support.');
    }
  };
  
  return (
    <Layout title="Reschedule Booking | The Travelling Technicians">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
            <h1 className="text-2xl font-bold text-primary-800">Reschedule Your Booking</h1>
          </div>
          
          <div className="px-6 py-5">
            {/* Loading State */}
            {status === 'loading' && (
              <div className="flex flex-col items-center text-center py-10">
                <div className="animate-pulse">
                  <div className="h-16 w-16 rounded-full bg-primary-200 flex items-center justify-center mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary-500"></div>
                  </div>
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Verifying Your Booking</h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {status === 'error' && (
              <div className="flex flex-col items-center text-center py-10">
                <FaTimesCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex space-x-4 mt-2">
                  <button 
                    onClick={() => router.push('/book-online')}
                    className="btn-outline"
                  >
                    Book Again
                  </button>
                  <button 
                    onClick={() => router.push('/contact')}
                    className="btn-primary"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}
            
            {/* Reschedule Form */}
            {status === 'ready' && bookingInfo && (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Current Booking Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Reference:</span>
                      <p className="font-medium">{bookingInfo.reference}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <p className="font-medium">{bookingInfo.issue}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Date:</span>
                      <p className="font-medium">{bookingInfo.currentDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Time:</span>
                      <p className="font-medium">{bookingInfo.currentTime}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">Address:</span>
                      <p className="font-medium">{bookingInfo.address}</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <h3 className="text-lg font-medium mb-4">Select New Date & Time</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                        New Date *
                      </label>
                      <select
                        id="date"
                        className={`w-full px-4 py-3 border ${dateError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setDateError(false);
                        }}
                        required
                      >
                        <option value="">Select a date</option>
                        {getAvailableDates().map((date) => (
                          <option key={date.value} value={date.value}>
                            {date.label}
                          </option>
                        ))}
                      </select>
                      {dateError && (
                        <p className="mt-1 text-sm text-red-600">Please select a date</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="time" className="block text-gray-700 font-medium mb-2">
                        New Time *
                      </label>
                      <select
                        id="time"
                        className={`w-full px-4 py-3 border ${timeError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        value={timeSlot}
                        onChange={(e) => {
                          setTimeSlot(e.target.value);
                          setTimeError(false);
                        }}
                        required
                      >
                        <option value="">Select a time</option>
                        {availableTimes.map((time) => (
                          <option key={time.id} value={time.id}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                      {timeError && (
                        <p className="mt-1 text-sm text-red-600">Please select a time</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="note" className="block text-gray-700 font-medium mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="note"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any special requests or information about your reschedule..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Confirm Reschedule
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Submitting State */}
            {status === 'submitting' && (
              <div className="flex flex-col items-center text-center py-10">
                <FaSpinner className="h-16 w-16 text-primary-500 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Your Request</h2>
                <p className="text-gray-600">Please wait while we update your booking...</p>
              </div>
            )}
            
            {/* Success State */}
            {status === 'success' && (
              <div className="flex flex-col items-center text-center py-10">
                <FaCheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Rescheduled!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="bg-gray-50 p-4 rounded-lg w-full max-w-md mb-6">
                  <div className="text-left">
                    <p className="font-medium text-gray-900 mb-1">New Appointment:</p>
                    <p className="text-gray-700">
                      {date && new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-700">
                      {availableTimes.find(t => t.id === timeSlot)?.label}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/')}
                  className="btn-primary"
                >
                  Return Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 