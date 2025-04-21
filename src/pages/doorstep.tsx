import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { FaTools, FaClock, FaCheckCircle, FaMapMarkerAlt, FaShieldAlt, FaEye } from 'react-icons/fa';

export default function DoorstepPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                The Ultimate Convenience: Tech Repair at Your Doorstep
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Skip the trip – we bring expert repair services to your home, office, or any location across the Lower Mainland.
              </p>
              <Link href="/book-online" className="btn-accent">
                Book Doorstep Service Now
              </Link>
            </div>
            <div className="relative">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                <Image
                  src="https://images.unsplash.com/photo-1585495976940-2420865c8d86"
                  alt="Technician repairing a device at customer's location"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-custom-lg">
                <div className="flex items-center">
                  <div className="bg-accent-500 text-white p-3 rounded-full mr-3">
                    <FaClock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Same-Day Service</p>
                    <p className="text-sm text-gray-600">Available in most areas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How Our Doorstep Service Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, transparent process that brings expert repair service directly to your location.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 gap-8">
                {/* Step 1 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-xl font-bold">1</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold mb-2">Simple Online Booking</h3>
                    <p className="text-gray-600">
                      Visit our booking page and tell us about your device and the issues you're experiencing. 
                      Select a date and time that works for your schedule, and provide your location details. 
                      We'll confirm your appointment immediately.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-xl font-bold">2</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold mb-2">Expert Technician Arrives</h3>
                    <p className="text-gray-600">
                      Our certified technician will arrive at your specified location with all the necessary 
                      tools, parts, and equipment to complete your repair. We pride ourselves on punctuality 
                      and professionalism.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-xl font-bold">3</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold mb-2">On-Site Diagnosis & Repair</h3>
                    <p className="text-gray-600">
                      Your technician will diagnose the issue and explain what needs to be done. With your 
                      approval, they'll complete the repair right before your eyes – no need to wonder what's 
                      happening to your device.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-xl font-bold">4</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold mb-2">Testing & Verification</h3>
                    <p className="text-gray-600">
                      Before considering the job complete, we thoroughly test your device to ensure everything 
                      is working perfectly. You can verify the repair's success yourself before making payment.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-xl font-bold">5</span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold mb-2">Warranty & Support</h3>
                    <p className="text-gray-600">
                      Every repair comes with our standard warranty. Should any issues arise after your doorstep 
                      repair, we'll return to your location and fix them at no additional cost within the 
                      warranty period.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="relative h-[450px] w-full rounded-lg overflow-hidden shadow-custom mb-6">
                  <Image
                    src="https://images.unsplash.com/photo-1589793907316-f94025b46850"
                    alt="Technician repairing a phone at customer's home"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="card bg-primary-50 border border-primary-100">
                  <h3 className="text-xl font-bold mb-4">Ready to book your doorstep repair?</h3>
                  <p className="text-gray-600 mb-6">
                    Our technicians are standing by to bring expert repair service directly to your location.
                  </p>
                  <Link href="/book-online" className="btn-primary w-full justify-center">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Benefits of Doorstep Repair</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the advantages of having your device repaired without ever leaving your location.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                <FaClock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Time-Saving Convenience</h3>
              <p className="text-gray-600">
                Save hours by eliminating travel and waiting time. Continue working, relaxing, or taking care of 
                other tasks while we repair your device right where you are.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                <FaEye className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Complete Transparency</h3>
              <p className="text-gray-600">
                Watch the entire repair process and ask questions as your technician works. Know exactly what's 
                being done to your device from start to finish.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                <FaShieldAlt className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy & Security</h3>
              <p className="text-gray-600">
                Your device never leaves your sight, providing peace of mind regarding personal data and privacy. 
                No worrying about what happens to your device behind closed doors.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                <FaCheckCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Immediate Testing</h3>
              <p className="text-gray-600">
                Test your device in your normal usage environment immediately after repair to ensure everything 
                works as expected in real-world conditions.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                <FaTools className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Service</h3>
              <p className="text-gray-600">
                Our mobile technicians are specifically trained for on-site repairs, bringing the same level of 
                expertise and equipment you'd find in a professional repair shop.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                <FaMapMarkerAlt className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Comfort & Convenience</h3>
              <p className="text-gray-600">
                Enjoy the comfort of your own space rather than waiting in a busy repair shop. No need to 
                rearrange your schedule around store hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Coverage */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Service Area Coverage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Travelling Technicians provide doorstep repair services throughout the Lower Mainland.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Map Placeholder - Would be replaced with interactive map */}
            <div className="relative h-[450px] w-full rounded-lg overflow-hidden shadow-custom">
              <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                <p className="text-gray-500">Interactive Map Would Be Here</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Lower Mainland Coverage</h3>
                  <p>We come to your location across the Greater Vancouver area.</p>
                </div>
              </div>
            </div>

            <div className="card bg-gray-50 border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Areas We Serve</h3>
              <p className="text-gray-600 mb-6">
                Our technicians are available for doorstep service in the following locations:
              </p>

              <div className="grid grid-cols-2 gap-y-3">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Vancouver</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Burnaby</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Surrey</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Richmond</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Coquitlam</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>North Vancouver</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>West Vancouver</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>New Westminster</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Delta</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>Langley</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-gray-600 mb-4">Not sure if we serve your area? Check your postal code:</p>
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="Enter Postal Code" 
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    Check
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/service-areas" className="text-primary-600 font-medium hover:text-primary-700 flex items-center">
                  View detailed service area information
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scheduling & Availability */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Scheduling & Availability</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technicians are ready to serve you at your convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Regular Hours */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Regular Service Hours</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="font-medium">Monday - Friday:</span>
                  <span>8:00 AM - 8:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Saturday:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Sunday:</span>
                  <span>10:00 AM - 5:00 PM</span>
                </li>
              </ul>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <p className="text-gray-600 text-sm">
                  Appointments outside of regular hours may be available upon request for emergency situations.
                </p>
              </div>
            </div>

            {/* Same-Day Service */}
            <div className="card bg-primary-50 border border-primary-100">
              <h3 className="text-xl font-bold mb-4">Same-Day Appointments</h3>
              <p className="text-gray-600 mb-4">
                Need your device fixed urgently? We offer same-day service when technicians are available in your area.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                  <span>Book before 11 AM for potential same-day service</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                  <span>Subject to technician availability in your area</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                  <span>Priority given to emergency situations</span>
                </li>
              </ul>
              <Link href="/book-online" className="btn-primary w-full justify-center">
                Check Same-Day Availability
              </Link>
            </div>

            {/* Booking Info */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Booking Information</h3>
              <p className="text-gray-600 mb-4">
                Scheduling your doorstep repair is easy and flexible.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                  <span>Book online 24/7 through our convenient system</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                  <span>Receive confirmation immediately</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                  <span>Reschedule up to 4 hours before appointment</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                  <span>Get text reminders before your appointment</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                  <span>Technician arrival tracking available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get answers to common questions about our doorstep repair service.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-bold mb-2">What if my device can\'t be fixed at my location?</h3>
                <p className="text-gray-600">
                  While most repairs can be completed on-site, some complex issues may require specialized equipment 
                  available only at our service center. In these rare cases, we'll diagnose the issue at your location, 
                  explain the situation, and offer options including repair at our facility with drop-off and pick-up services.
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-2">Do I need to provide anything for the repair?</h3>
                <p className="text-gray-600">
                  No. Our technicians arrive with all necessary tools, parts, and equipment. Just ensure there's a 
                  clean, well-lit space where the technician can work on your device.
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-2">Is my data safe during repair?</h3>
                <p className="text-gray-600">
                  Yes. Unlike traditional repair shops where your device leaves your possession, our doorstep service 
                  means your device never leaves your sight. We don\'t need to access your personal data for most repairs, 
                  and you can watch the entire process. We recommend backing up important data before any repair as a precaution.
                </p>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-2">What happens if you need a part you don\'t have with you?</h3>
                <p className="text-gray-600">
                  Our technicians stock the most commonly needed parts in their service vehicles. In the rare case that 
                  we need a special part, we'll order it and schedule a follow-up appointment at your convenience, at no 
                  additional service charge.
                </p>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link href="/faq" className="btn-outline">
                View All FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience the Convenience of Doorstep Repair?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book your appointment now and have your device fixed without ever leaving your location.
            </p>
            <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
              Book Your Doorstep Repair
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
} 