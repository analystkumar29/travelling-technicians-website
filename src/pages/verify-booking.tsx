import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

export default function VerifyBooking() {
  const router = useRouter();
  const { token, reference } = router.query;
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your booking...');
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loadingAllBookings, setLoadingAllBookings] = useState(false);
  
  // Try to get booking info when reference is available
  useEffect(() => {
    // Only run if reference is available from URL
    if (!reference) return;
    
    const fetchBookingInfo = async () => {
      try {
        // Fetch booking information from the database using the reference
        const response = await fetch(`/api/bookings/reference/${reference}`);
        const data = await response.json();
        
        if (data.success && data.booking) {
          setBookingInfo(data.booking);
          
          // If booking is already confirmed, show success
          if (data.booking.status === 'confirmed') {
            setVerificationStatus('success');
            setMessage('Your booking has already been verified!');
          } else {
            // Otherwise, ask for email verification
            setMessage('Please enter your email to verify your booking');
          }
        } else {
          setVerificationStatus('error');
          setMessage('Invalid or expired verification link. Please contact support.');
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setVerificationStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
      }
    };
    
    fetchBookingInfo();
  }, [reference]);
  
  // Handle verify form submission
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setEmailError('Email is required for verification');
      return;
    }
    
    if (!token || !reference) {
      setVerificationStatus('error');
      setMessage('Missing verification data. Please check your verification link.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call verify API endpoint
      const response = await fetch('/api/verify-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          reference: reference,
          email: email
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setBookingInfo(result.booking);
        setVerificationStatus('success');
        setMessage('Your booking has been successfully verified!');
      } else {
        setVerificationStatus('error');
        setMessage(result.message || 'Verification failed. Please check your email and try again.');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setVerificationStatus('error');
      setMessage('An error occurred during verification. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to fetch all bookings for this email
  const fetchAllBookings = async () => {
    if (!email || !token || !reference) return;
    
    setLoadingAllBookings(true);
    
    try {
      // Use the original verification token to fetch all bookings
      const response = await fetch('/api/bookings/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          verificationToken: token, 
          verificationReference: reference 
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAllBookings(result.bookings);
        setShowAllBookings(true);
      } else {
        console.error('Failed to fetch all bookings:', result.message);
      }
    } catch (error) {
      console.error('Error fetching all bookings:', error);
    } finally {
      setLoadingAllBookings(false);
    }
  };
  
  return (
    <Layout title="Verify Booking | The Travelling Technicians">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center text-center">
              {verificationStatus === 'loading' && !bookingInfo && (
                <div className="animate-pulse">
                  <div className="h-16 w-16 rounded-full bg-primary-200 flex items-center justify-center mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary-500"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Booking</h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              )}
              
              {verificationStatus === 'loading' && bookingInfo && (
                <div className="w-full max-w-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Booking</h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  
                  <form onSubmit={handleVerifySubmit} className="space-y-4">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                          'Verify Booking'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {verificationStatus === 'success' && (
                <>
                  <FaCheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Verified</h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  
                  {!showAllBookings && bookingInfo && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md w-full">
                      <h3 className="font-medium text-gray-900 mb-2">Verified Booking Details</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm text-left">
                        <div>
                          <span className="text-gray-500">Reference: </span>
                          <span className="font-medium">{bookingInfo.reference_number}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Device: </span>
                          <span className="font-medium">{bookingInfo.device_type} {bookingInfo.device_brand && `- ${bookingInfo.device_brand}`} {bookingInfo.device_model && bookingInfo.device_model}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Service: </span>
                          <span className="font-medium">{bookingInfo.service_type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date: </span>
                          <span className="font-medium">{new Date(bookingInfo.booking_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time: </span>
                          <span className="font-medium">{bookingInfo.booking_time}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status: </span>
                          <span className="font-medium text-green-600">Confirmed</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {showAllBookings && allBookings.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 max-w-4xl w-full">
                      <h3 className="font-medium text-gray-900 mb-4">All Your Bookings ({allBookings.length})</h3>
                      <div className="space-y-4">
                        {allBookings.map((booking) => (
                          <div key={booking.id} className="bg-white p-4 rounded-lg border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="mb-2">
                                  <span className="text-gray-500">Reference: </span>
                                  <span className="font-medium">{booking.reference_number}</span>
                                  {booking.reference_number === bookingInfo?.reference_number && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Just Verified</span>
                                  )}
                                </div>
                                <div className="mb-2">
                                  <span className="text-gray-500">Device: </span>
                                  <span className="font-medium">{booking.device_type} {booking.device_brand && `- ${booking.device_brand}`} {booking.device_model && booking.device_model}</span>
                                </div>
                                <div className="mb-2">
                                  <span className="text-gray-500">Service: </span>
                                  <span className="font-medium">{booking.service_type}</span>
                                </div>
                              </div>
                              <div>
                                <div className="mb-2">
                                  <span className="text-gray-500">Date: </span>
                                  <span className="font-medium">{new Date(booking.booking_date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}</span>
                                </div>
                                <div className="mb-2">
                                  <span className="text-gray-500">Time: </span>
                                  <span className="font-medium">{booking.booking_time}</span>
                                </div>
                                <div className="mb-2">
                                  <span className="text-gray-500">Status: </span>
                                  <span className={`font-medium ${
                                    booking.status === 'confirmed' ? 'text-green-600' :
                                    booking.status === 'pending' ? 'text-yellow-600' :
                                    booking.status === 'completed' ? 'text-blue-600' :
                                    'text-gray-600'
                                  }`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!showAllBookings && (
                    <p className="text-sm text-gray-500 mb-8">
                      Our technician will arrive at your address during the scheduled time window.
                      You will receive a call about 30 minutes before arrival.
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 mt-6">
                    {!showAllBookings && (
                      <button 
                        onClick={fetchAllBookings}
                        disabled={loadingAllBookings}
                        className="btn-secondary flex items-center"
                      >
                        {loadingAllBookings ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Loading...
                          </>
                        ) : (
                          'View All My Bookings'
                        )}
                      </button>
                    )}
                    
                    {showAllBookings && (
                      <button 
                        onClick={() => setShowAllBookings(false)}
                        className="btn-secondary"
                      >
                        Show Just This Booking
                      </button>
                    )}
                    
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
                </>
              )}
              
              {verificationStatus === 'error' && (
                <>
                  <FaTimesCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 