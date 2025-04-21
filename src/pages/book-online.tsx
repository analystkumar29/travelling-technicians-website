import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import BookingForm from '@/components/booking/BookingForm';
import Link from 'next/link';
import Image from 'next/image';
import { FaCheck, FaClock, FaTools, FaShieldAlt, FaStar } from 'react-icons/fa';

export default function BookOnlinePage() {
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  
  const handleBookingComplete = (data: any) => {
    setBookingData(data);
    setBookingComplete(true);
    // In a real application, you would send this data to your backend
    console.log('Booking data:', data);
  };
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Book Your Doorstep Repair
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Skip the trip to a repair shop. Our certified technicians come to your location for fast, convenient device repairs.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Process */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {bookingComplete ? (
                <div className="bg-white rounded-lg shadow-custom-lg p-8 text-center">
                  <div className="rounded-full bg-green-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-10 w-10 text-green-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-4 text-gray-900">Booking Confirmed!</h2>
                  <p className="text-xl mb-6 text-gray-600">
                    Your repair has been scheduled successfully.
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="font-bold mb-4 text-left">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-gray-600 text-sm">Date & Time</p>
                        <p className="font-medium">
                          {bookingData?.date && new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, {' '}
                          {bookingData?.timeSlot === '09-11' && '9:00 AM - 11:00 AM'}
                          {bookingData?.timeSlot === '11-13' && '11:00 AM - 1:00 PM'}
                          {bookingData?.timeSlot === '13-15' && '1:00 PM - 3:00 PM'}
                          {bookingData?.timeSlot === '15-17' && '3:00 PM - 5:00 PM'}
                          {bookingData?.timeSlot === '17-19' && '5:00 PM - 7:00 PM'}
                          {bookingData?.timeSlot === '19-21' && '7:00 PM - 9:00 PM'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Service Type</p>
                        <p className="font-medium">
                          {bookingData?.serviceType === 'screen' && 'Screen Replacement'}
                          {bookingData?.serviceType === 'battery' && 'Battery Replacement'}
                          {bookingData?.serviceType === 'charging' && 'Charging Port Repair'}
                          {bookingData?.serviceType === 'keyboard' && 'Keyboard Replacement'}
                          {bookingData?.serviceType === 'harddrive' && 'HDD/SSD Upgrade'}
                          {bookingData?.serviceType === 'ram' && 'RAM Upgrade'}
                          {bookingData?.serviceType === 'water' && 'Water Damage Assessment'}
                          {bookingData?.serviceType === 'software' && 'Software Issues'}
                          {bookingData?.serviceType === 'other' && 'Other Issues'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Location</p>
                        <p className="font-medium">{bookingData?.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Device</p>
                        <p className="font-medium">{bookingData?.brand} {bookingData?.model}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    We've sent a confirmation email to {bookingData?.contactEmail} with all the details.
                    Our technician will call you before arrival.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/" className="btn-primary">
                      Return to Home
                    </Link>
                    <button 
                      className="btn-outline"
                      onClick={() => setBookingComplete(false)}
                    >
                      Book Another Repair
                    </button>
                  </div>
                </div>
              ) : (
                <BookingForm onComplete={handleBookingComplete} />
              )}
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Why Choose Us</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 text-primary-600 mt-1">
                      <FaCheck />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-medium">Convenience:</span> We come to your home or office
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 text-primary-600 mt-1">
                      <FaCheck />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-medium">Speed:</span> Most repairs completed in 30-60 minutes
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 text-primary-600 mt-1">
                      <FaCheck />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-medium">Quality:</span> High-quality parts & certified technicians
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 text-primary-600 mt-1">
                      <FaCheck />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-medium">Transparent:</span> Upfront pricing with no hidden fees
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 text-primary-600 mt-1">
                      <FaCheck />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-medium">Warranty:</span> 90-day warranty on all repairs
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <span className="ml-2 text-gray-700 font-medium">4.9 out of 5</span>
                </div>
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-gray-700 italic mb-2">
                      "The technician was professional and fixed my iPhone screen right at my kitchen table. Great service!"
                    </p>
                    <p className="text-sm text-gray-500">
                      - Sarah J. in Vancouver
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 italic mb-2">
                      "So convenient to have my MacBook repaired while I was working from home. Saved me hours of time!"
                    </p>
                    <p className="text-sm text-gray-500">
                      - Michael T. in Burnaby
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Our Doorstep Repair Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, hassle-free process from booking to repair
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Book Online</h3>
                <p className="text-gray-600 text-sm">
                  Select your device, issue, location, and preferred appointment time.
                </p>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Confirmation</h3>
                <p className="text-gray-600 text-sm">
                  Receive booking confirmation via email with all appointment details.
                </p>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Technician Visit</h3>
                <p className="text-gray-600 text-sm">
                  Our technician arrives at your location with all necessary tools and parts.
                </p>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Repair & Payment</h3>
                <p className="text-gray-600 text-sm">
                  Your device is repaired on-site. Pay only after the repair is complete and tested.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-primary-600 font-medium mb-2">
              Most repairs are completed in 30-60 minutes
            </p>
            <p className="text-gray-600">
              If we can\'t fix your device on-site, there\'s no charge for the visit.
            </p>
          </div>
        </div>
      </section>
      
      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaClock className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Service</h3>
              <p className="text-gray-600">
                Most repairs completed in 30-60 minutes, so you can get back to using your device quickly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaTools className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Certified Technicians</h3>
              <p className="text-gray-600">
                Our repair specialists are fully certified and have years of experience with all major brands.
              </p>
            </div>
            
            <div className="text-center">
              <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">90-Day Warranty</h3>
              <p className="text-gray-600">
                All our repairs come with a 90-day warranty on parts and labor for your peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Answers to frequently asked questions about our booking and repair process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">How long in advance should I book?</h3>
              <p className="text-gray-600">
                We recommend booking 24-48 hours in advance for the best availability. Same-day appointments may be available depending on technician schedules.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">What if you can\'t fix my device on-site?</h3>
              <p className="text-gray-600">
                In the rare case that we can\'t complete the repair on-site, we\'ll provide options including taking the device to our repair center or scheduling another visit with specialized equipment.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept credit/debit cards, e-Transfer, cash, and mobile payment options like Apple Pay and Google Pay. Payment is collected only after the repair is successfully completed.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Can I reschedule my appointment?</h3>
              <p className="text-gray-600">
                Yes, you can reschedule through our online system or by calling our customer service team. We ask for at least 4 hours' notice before your scheduled appointment time.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/faq" className="text-primary-600 hover:text-primary-700 font-medium">
              View all FAQs
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Book Your Repair?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Skip the trip to a repair shop. Our technicians come to your location across the Lower Mainland.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-accent text-center inline-block"
            >
              Book Your Repair Now
            </button>
            <p className="mt-4 text-primary-100">
              Most repairs completed in 30-60 minutes with 90-day warranty
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
} 