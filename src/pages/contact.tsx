import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaHeadset, FaComments } from 'react-icons/fa';
import { OrganizationSchema, LocalBusinessSchema } from '@/components/seo/StructuredData';
import { getBusinessSettingsForSSG } from '@/lib/business-settings';

// Contact form field types
type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

interface ContactPageProps {
  businessPhone: string;
  businessPhoneHref: string;
}

export async function getStaticProps() {
  try {
    const businessSettings = await getBusinessSettingsForSSG();
    return {
      props: {
        businessPhone: businessSettings.phone.display,
        businessPhoneHref: businessSettings.phone.href
      },
      revalidate: 3600
    };
  } catch (error) {
    return {
      props: {
        businessPhone: '(604) 849-5329',
        businessPhoneHref: 'tel:+16048495329'
      },
      revalidate: 3600
    };
  }
}

export default function ContactPage({ 
  businessPhone = '(604) 849-5329',
  businessPhoneHref = 'tel:+16048495329'
}: ContactPageProps) {
  // Contact form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (formErrors[name as keyof ContactFormData]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Partial<ContactFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.subject) {
      errors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setFormSubmitting(true);
      
      // Simulate form submission
      setTimeout(() => {
        setFormSubmitting(false);
        setFormSubmitted(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 1500);
      
      // In a real implementation, you would send the form data to a server here
      // Example:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | The Travelling Technicians | Mobile & Laptop Repair</title>
        <meta name="description" content="Contact The Travelling Technicians for professional mobile phone and laptop repair services across Vancouver and Lower Mainland, BC. Call, email, or book online today." />
        <link rel="canonical" href="https://travelling-technicians.ca/contact" />
        <meta property="og:title" content="Contact Us | The Travelling Technicians | Mobile & Laptop Repair" />
        <meta property="og:description" content="Get in touch with our expert repair technicians for mobile phone and laptop repair services across Vancouver and Lower Mainland, BC." />
        <meta property="og:url" content="https://travelling-technicians.ca/contact" />
        <meta property="og:type" content="website" />
        {/* Contact Page Structured Data */}
        <OrganizationSchema />
        <LocalBusinessSchema
          name="The Travelling Technicians"
          description="Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC. Contact us for fast, reliable tech repair solutions."
          telephone={businessPhoneHref}
          email="info@travellingtechnicians.ca"
        />
      </Head>
      <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact The Travelling Technicians
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              We're here to help with all your mobile and laptop repair needs. Reach out to our team for support, inquiries, or to schedule a repair.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaPhone className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">
                Speak directly with our customer service team
              </p>
              <a 
                href={businessPhoneHref} 
                className="text-xl font-bold text-primary-600 hover:text-primary-800 transition-colors block"
              >
                {businessPhone}
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Available during business hours
              </p>
            </div>

            {/* Email Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">
                Send us a message anytime
              </p>
              <a 
                href="mailto:info@travellingtechnicians.ca" 
                className="text-primary-600 hover:text-primary-800 transition-colors font-medium block break-all"
              >
                info@travellingtechnicians.ca
              </a>
              <p className="text-sm text-gray-500 mt-2">
                We aim to respond within 24 hours
              </p>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaClock className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Business Hours</h3>
              <p className="text-gray-600 mb-4">
                When our technicians are available
              </p>
              <ul className="space-y-1 text-gray-600">
                <li>Monday - Friday: 8:00 AM - 8:00 PM</li>
                <li>Saturday: 9:00 AM - 6:00 PM</li>
                <li>Sunday: 10:00 AM - 5:00 PM</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Information */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Have a question about our services or need to schedule a repair? Fill out the form below and we'll get back to you as soon as possible.
              </p>

              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent Successfully!</h3>
                  <p className="text-green-700 mb-4">
                    Thank you for contacting us. We've received your message and will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="btn-primary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="repair">Repair Question</option>
                        <option value="quote">Request a Quote</option>
                        <option value="booking">Booking Issue</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors.subject && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Type your message here..."
                    ></textarea>
                    {formErrors.message && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="btn-primary w-full md:w-auto"
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Additional Contact Options</h2>
              <p className="text-gray-600 mb-8">
                We're committed to providing excellent customer service. Choose the method that works best for you:
              </p>

              <div className="space-y-6">
                {/* Live Chat */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="rounded-full bg-primary-100 p-3">
                        <FaComments className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                      <p className="text-gray-600 mb-4">
                        Chat directly with our support team during business hours for immediate assistance.
                      </p>
                      <button className="btn-primary">
                        Start Chat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Service Areas */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="rounded-full bg-primary-100 p-3">
                        <FaMapMarkerAlt className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold mb-2">Service Areas</h3>
                      <p className="text-gray-600 mb-4">
                        We provide doorstep repair services throughout the Lower Mainland. Check if we service your area:
                      </p>
                      <Link href="/service-areas" className="btn-outline">
                          View Service Areas
                        </Link>
                    </div>
                  </div>
                </div>

                {/* Technical Support */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="rounded-full bg-primary-100 p-3">
                        <FaHeadset className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold mb-2">Technical Support</h3>
                      <p className="text-gray-600 mb-4">
                        Need help with a repaired device or have technical questions? Our support team is available to assist you.
                      </p>
                      <div className="flex items-center text-primary-600">
                        <FaPhone className="mr-2" />
                        <span className="font-medium">{businessPhone} ext. 2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about our services, pricing, and repair process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">How does doorstep repair work?</h3>
              <p className="text-gray-600 mb-4">
                Learn about our convenient process for bringing repair services directly to your location.
              </p>
              <Link href="/faq#process-1" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                  Read Answer
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">What areas do you serve?</h3>
              <p className="text-gray-600 mb-4">
                Find out which areas in the Lower Mainland we service with our doorstep repair.
              </p>
              <Link href="/faq#locations-1" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                  Read Answer
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">How much do repairs cost?</h3>
              <p className="text-gray-600 mb-4">
                Get details about our competitive pricing, payment options, and warranty coverage.
              </p>
              <Link href="/faq#pricing-1" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                  Read Answer
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/faq" className="btn-outline">
                View All FAQs
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
            <Link href="/book-online" className="btn-accent text-center inline-block">
                Book Doorstep Repair
              </Link>
          </div>
        </div>
      </section>
    </Layout>
    </>
  );
} 