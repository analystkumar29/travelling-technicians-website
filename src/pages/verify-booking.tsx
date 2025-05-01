import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function VerifyBooking() {
  const router = useRouter();
  const { token, reference } = router.query;
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your booking...');
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  
  useEffect(() => {
    // Only run verification if token is available from URL
    if (!token || !reference) return;
    
    const verifyBooking = async () => {
      try {
        // Fetch booking information from the database using the reference
        const response = await fetch(`/api/bookings/findByReference?reference=${reference}`);
        const data = await response.json();
        
        if (data.success && data.booking) {
          setBookingInfo(data.booking);
          setVerificationStatus('success');
          setMessage('Your booking has been successfully verified!');
          
          // In a production implementation, you would also verify the token
          // and update the booking status to 'confirmed'
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
    
    verifyBooking();
  }, [token, reference]);
  
  return (
    <Layout title="Verify Booking | The Travelling Technicians">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center text-center">
              {verificationStatus === 'loading' && (
                <div className="animate-pulse">
                  <div className="h-16 w-16 rounded-full bg-primary-200 flex items-center justify-center mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary-500"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Booking</h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              )}
              
              {verificationStatus === 'success' && (
                <>
                  <FaCheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Verified</h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  
                  {bookingInfo && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md w-full">
                      <h3 className="font-medium text-gray-900 mb-2">Booking Details</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm text-left">
                        <div>
                          <span className="text-gray-500">Reference: </span>
                          <span className="font-medium">{bookingInfo.reference_number}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Device: </span>
                          <span className="font-medium">{bookingInfo.device_type} - {bookingInfo.device_brand} {bookingInfo.device_model}</span>
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
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mb-8">
                    Our technician will arrive at your address during the scheduled time window.
                    You will receive a call about 30 minutes before arrival.
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