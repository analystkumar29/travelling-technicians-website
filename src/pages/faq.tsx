import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp, FaTools, FaDollarSign, FaShippingFast, FaShieldAlt, FaRegClock, FaBusinessTime } from 'react-icons/fa';
import { FAQSchema } from '@/components/seo/StructuredData';

// FAQ Categories and Questions
const faqCategories = [
  {
    id: 'services',
    name: 'Our Services',
    icon: <FaTools className="h-6 w-6" />,
    questions: [
      {
        id: 'services-1',
        question: 'What devices do you repair?',
        answer: 'We repair a wide range of mobile phones and laptops. For mobile devices, we service all major brands including Apple iPhone, Samsung Galaxy, Google Pixel, and more. For laptops, we repair Apple MacBooks, Dell, HP, Lenovo, ASUS, and other major brands. If you don\'t see your device listed, please contact us as we may still be able to help.'
      },
      {
        id: 'services-2',
        question: 'Do you service both personal and business devices?',
        answer: 'Yes, we provide doorstep repair services for both personal and business devices. We have special business service plans for companies needing regular maintenance and support for multiple devices.'
      },
      {
        id: 'services-3',
        question: 'What are your most common repairs?',
        answer: 'For mobile phones, our most common repairs are screen replacements, battery replacements, and charging port repairs. For laptops, we frequently perform screen replacements, battery upgrades, hard drive/SSD upgrades, and keyboard replacements.'
      },
      {
        id: 'services-4',
        question: 'Can you recover data from a damaged device?',
        answer: 'In many cases, yes. Our technicians can often recover data from devices with software issues, some types of water damage, or hardware failures. The success rate depends on the extent of the damage. We offer data recovery services with a no-recovery, no-fee policy.'
      },
      {
        id: 'services-5',
        question: 'Do you repair water-damaged devices?',
        answer: 'Yes, we can diagnose and repair water-damaged devices. For the best chance of recovery, it\'s important to turn off the device immediately and avoid charging it. Success rates depend on how quickly the device is assessed, the type of liquid involved, and the extent of the damage.'
      }
    ]
  },
  {
    id: 'process',
    name: 'Repair Process',
    icon: <FaRegClock className="h-6 w-6" />,
    questions: [
      {
        id: 'process-1',
        question: 'How does the doorstep repair process work?',
        answer: 'Our process is simple: First, book an appointment online or by phone. Select your device, describe the issue, and choose a convenient time. Our technician will arrive at your location with the necessary parts and tools, diagnose the issue, and perform the repair on the spot. Most repairs take between 30-90 minutes to complete.'
      },
      {
        id: 'process-2',
        question: 'Do I need to prepare anything before your technician arrives?',
        answer: 'We recommend backing up your data if possible, though this isn\'t required. Please ensure there\'s a clean, well-lit space where our technician can work. Having your device accessible and, if possible, making note of any passcodes would be helpful. Also, please have identification ready as we\'ll need to verify you as the device owner.'
      },
      {
        id: 'process-3',
        question: 'What if my device can\'t be repaired on-site?',
        answer: 'While most repairs can be completed on-site, some complex issues may require specialized equipment available only at our service center. In these rare cases, we\'ll diagnose the issue at your location, explain the situation, and offer options including repair at our facility with convenient drop-off and pick-up arrangements.'
      },
      {
        id: 'process-4',
        question: 'How long does a typical repair take?',
        answer: 'Most mobile phone repairs take 30-60 minutes, while laptop repairs typically take 60-90 minutes. Complex repairs may take longer. We\'ll provide an estimated timeframe after diagnosing your specific issue.'
      },
      {
        id: 'process-5',
        question: 'Do I need to be present during the entire repair?',
        answer: 'We recommend being present so you can see exactly what we\'re doing and ask any questions, but it\'s not strictly necessary for the entire repair. You must be present at the beginning for device check-in and at the end to verify the repair and make payment.'
      }
    ]
  },
  {
    id: 'pricing',
    name: 'Pricing & Payment',
    icon: <FaDollarSign className="h-6 w-6" />,
    questions: [
      {
        id: 'pricing-1',
        question: 'How much do your repair services cost?',
        answer: 'Our repair prices vary depending on your device model and the specific issue. We provide transparent pricing with no hidden fees. You can view our price ranges on our pricing page, and we\'ll confirm the exact cost after diagnosing your device but before beginning any work. All prices include our doorstep service.'
      },
      {
        id: 'pricing-2',
        question: 'Do you charge a fee for coming to my location?',
        answer: 'No, our doorstep service is included in the repair price. There are no additional travel or convenience fees for locations within our standard service area in the Lower Mainland.'
      },
      {
        id: 'pricing-3',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards, e-Transfer, cash, and mobile payment options including Apple Pay and Google Pay. Payment is collected after the repair is completed and you\'ve verified everything is working properly.'
      },
      {
        id: 'pricing-4',
        question: 'Do you offer any discounts?',
        answer: 'Yes, we offer discounts for multiple device repairs, business clients with volume needs, students, and seniors. We also run seasonal promotions throughout the year. Please inquire about current offers when booking your repair.'
      },
      {
        id: 'pricing-5',
        question: 'What if you can\'t fix my device?',
        answer: 'If we can\'t repair your device, there\'s no charge for the repair attempt. There is a diagnostic fee of $39 to cover the technician\'s time and travel if you choose not to proceed with a recommended repair, but this fee is waived if you proceed with the repair.'
      }
    ]
  },
  {
    id: 'warranty',
    name: 'Warranty & Support',
    icon: <FaShieldAlt className="h-6 w-6" />,
    questions: [
      {
        id: 'warranty-1',
        question: 'What warranty do you offer on repairs?',
        answer: 'All our repairs come with a 90-day warranty covering both parts and labor. If you experience any issues related to our repair within the warranty period, we\'ll fix it at no additional cost. This includes a return visit to your location.'
      },
      {
        id: 'warranty-2',
        question: 'What is covered under your warranty?',
        answer: 'Our warranty covers defects in parts used for the repair and any issues directly related to our workmanship. It does not cover new damage, water damage, or software issues unrelated to our repair.'
      },
      {
        id: 'warranty-3',
        question: 'How do I make a warranty claim?',
        answer: 'If you experience any issues with your repaired device within the warranty period, simply contact our customer service team. We\'ll verify your repair details and schedule a follow-up visit. Please have your repair receipt or reference number handy when you call.'
      },
      {
        id: 'warranty-4',
        question: 'What quality of parts do you use?',
        answer: 'We use only high-quality, manufacturer-compatible parts for all our repairs. For certain devices, we offer both original manufacturer (OEM) parts and premium aftermarket alternatives, giving you options based on your preference and budget. All parts are thoroughly tested before installation.'
      },
      {
        id: 'warranty-5',
        question: 'Do you offer any extended warranty options?',
        answer: 'Yes, you can purchase an extended warranty that provides coverage for up to 12 months from the repair date. This extended warranty covers the same terms as our standard warranty for longer peace of mind. Ask your technician about pricing for extended warranty options.'
      }
    ]
  },
  {
    id: 'scheduling',
    name: 'Booking & Scheduling',
    icon: <FaBusinessTime className="h-6 w-6" />,
    questions: [
      {
        id: 'scheduling-1',
        question: 'How far in advance should I book?',
        answer: 'While we offer same-day appointments when available, we recommend booking 24-48 hours in advance for the best selection of time slots. During busy periods, same-day availability may be limited, especially in outlying service areas.'
      },
      {
        id: 'scheduling-2',
        question: 'What are your service hours?',
        answer: 'Our standard service hours are Monday to Friday from 8:00 AM to 8:00 PM, Saturday from 9:00 AM to 6:00 PM, and Sunday from 10:00 AM to 5:00 PM. We may be able to accommodate special requests outside these hours for emergency situations.'
      },
      {
        id: 'scheduling-3',
        question: 'Can I reschedule my appointment?',
        answer: 'Yes, you can reschedule through our online booking system or by calling our customer service team. We ask for at least 4 hours\' notice before your scheduled appointment time. Late cancellations or no-shows may incur a rebooking fee.'
      },
      {
        id: 'scheduling-4',
        question: 'Do you offer emergency repair services?',
        answer: 'Yes, we offer urgent service options for critical repair needs. While these appointments are subject to technician availability, we do our best to accommodate emergency situations. There may be an additional fee for urgent service requests.'
      },
      {
        id: 'scheduling-5',
        question: 'How precise are your arrival windows?',
        answer: 'We provide a 1-2 hour arrival window for all appointments. Our technicians will call or text approximately 30 minutes before arrival. While we strive to be punctual, occasional delays due to traffic or previous repair complications may occur. We\'ll always keep you updated if there are any changes to the estimated arrival time.'
      }
    ]
  },
  {
    id: 'locations',
    name: 'Service Areas',
    icon: <FaShippingFast className="h-6 w-6" />,
    questions: [
      {
        id: 'locations-1',
        question: 'What areas do you serve?',
        answer: 'We provide doorstep repair services throughout the Lower Mainland, including Vancouver, Burnaby, Richmond, New Westminster, North Vancouver, West Vancouver, Coquitlam, and Chilliwack. You can check specific coverage on our Service Areas page.'
      },
      {
        id: 'locations-2',
        question: 'Do you charge extra for certain locations?',
        answer: 'For most areas within the Lower Mainland, there are no additional travel fees. For some outlying areas or locations outside our main service region, a small travel fee may apply. This will be clearly communicated before you confirm your booking.'
      },
      {
        id: 'locations-3',
        question: 'Can you service locations outside the Lower Mainland?',
        answer: 'We may be able to accommodate special requests for locations just outside our standard service area. Please contact us directly to inquire about availability and any applicable travel fees for your specific location.'
      },
      {
        id: 'locations-4',
        question: 'Do you offer in-shop repairs as an alternative?',
        answer: 'While we specialize in doorstep service, we do maintain a central repair facility primarily for complex repairs that cannot be completed on-site. If you prefer to drop off your device rather than use our doorstep service, this can be arranged, though our business model is optimized for mobile service.'
      },
      {
        id: 'locations-5',
        question: 'Which areas offer same-day service?',
        answer: 'Same-day service is typically available in Vancouver, Burnaby, Richmond, New Westminster, North Vancouver, West Vancouver, and Coquitlam, subject to technician availability. Chilliwack requires scheduling at least one day in advance. Check our Service Areas page for specific details.'
      }
    ]
  }
];

// FAQ accordion component
interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FaqItem = ({ question, answer, isOpen, toggleOpen }: FaqItemProps) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <span className="ml-6 flex-shrink-0">
          {isOpen ? (
            <FaChevronUp className="h-5 w-5 text-primary-500" />
          ) : (
            <FaChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="mt-3 pr-12">
          <p className="text-base text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
};

// FAQ Category component
interface FaqCategoryProps {
  category: {
    id: string;
    name: string;
    icon: JSX.Element;
    questions: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };
  openItemId: string | null;
  setOpenItemId: (id: string | null) => void;
}

const FaqCategory = ({ category, openItemId, setOpenItemId }: FaqCategoryProps) => {
  return (
    <div className="mb-10">
      <div className="flex items-center mb-6">
        <div className="rounded-full bg-primary-100 p-3 mr-4">
          <div className="text-primary-600">{category.icon}</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        {category.questions.map((item) => (
          <FaqItem
            key={item.id}
            question={item.question}
            answer={item.answer}
            isOpen={openItemId === item.id}
            toggleOpen={() => setOpenItemId(openItemId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default function FAQPage() {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState(faqCategories);

  // Collect all FAQs for structured data
  const allFaqs = faqCategories.flatMap(category => 
    category.questions.map(q => ({
      question: q.question,
      answer: q.answer
    }))
  );

  return (
    <>
      <Head>
        {/* FAQ Page Structured Data */}
        <FAQSchema faqs={allFaqs} />
      </Head>
      <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Find answers to common questions about our doorstep repair services, pricing, warranty, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="py-10 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                placeholder="Search for questions..."
              />
              <div className="absolute left-4 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex flex-wrap -mx-4">
            {/* Category Navigation Sidebar */}
            <div className="w-full md:w-1/4 px-4 mb-8 md:mb-0">
              <div className="sticky top-24">
                <h3 className="text-lg font-bold mb-4 text-gray-900">FAQ Categories</h3>
                <nav className="space-y-2">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      className={`flex items-center w-full px-4 py-2 text-left rounded-md ${
                        activeCategory === category.id 
                          ? 'bg-primary-100 text-primary-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <span className="mr-3">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Can\'t find an answer?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We're here to help. Contact our support team for assistance with any questions you may have.
                  </p>
                  <div className="mt-6">
                    <Link href="/contact" className="btn-primary text-sm py-2 block text-center">
                        Contact Our Team
                      </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="w-full md:w-3/4 px-4">
              <div className="space-y-10">
                {faqCategories.map((category) => (
                  <div key={category.id} id={category.id} className={activeCategory === category.id ? 'block' : 'hidden'}>
                    <FaqCategory
                      category={category}
                      openItemId={openItemId}
                      setOpenItemId={setOpenItemId}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-custom p-8 max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-gray-600 mb-6">
                Can\'t find the answer you\'re looking for? Our friendly team is here to help you with any questions or concerns about our doorstep repair services.
              </p>
              <div className="text-center mt-12">
                <Link href="/contact" className="btn-primary text-center">
                    Have More Questions? Contact Us
                  </Link>
                <span className="mx-3 text-gray-300">or</span>
                <Link href="/book-online" className="btn-outline text-center">
                    Book a Repair
                  </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Doorstep Device Repair?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Our technicians bring the repair shop to you – saving you time and hassle. Book your appointment now.
            </p>
            <Link href="/book-online" className="btn-accent text-center inline-block">
                Book Your Repair Now
              </Link>
          </div>
        </div>
      </section>
    </Layout>
    </>
  );
} 