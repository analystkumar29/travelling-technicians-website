import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { FaCheckCircle, FaMobileAlt, FaLaptop, FaTabletAlt, FaQuestionCircle } from 'react-icons/fa';

type RepairService = {
  id: number;
  name: string;
  mobilePrice: string | null;
  laptopPrice: string | null;
  description: string;
  popular?: boolean;
  doorstep: boolean;
};

// Repair services with pricing
const repairServices: RepairService[] = [
  {
    id: 1,
    name: 'Screen Replacement',
    mobilePrice: '$79 - $199',
    laptopPrice: '$149 - $299',
    description: 'Replace damaged or cracked screens with high-quality parts.',
    popular: true,
    doorstep: true
  },
  {
    id: 2,
    name: 'Battery Replacement',
    mobilePrice: '$69 - $129',
    laptopPrice: '$99 - $199',
    description: 'Restore battery life with premium battery replacements.',
    popular: true,
    doorstep: true
  },
  {
    id: 3,
    name: 'Charging Port Repair',
    mobilePrice: '$89 - $149',
    laptopPrice: '$129 - $249',
    description: 'Fix loose connections or charging issues with a new charging port.',
    doorstep: true
  },
  {
    id: 4,
    name: 'Speaker/Microphone Repair',
    mobilePrice: '$79 - $129',
    laptopPrice: '$109 - $199',
    description: 'Resolve audio issues with speaker or microphone replacement.',
    doorstep: true
  },
  {
    id: 5,
    name: 'Camera Repair',
    mobilePrice: '$89 - $169',
    laptopPrice: null,
    description: 'Fix front or rear camera problems with camera module replacement.',
    doorstep: true
  },
  {
    id: 6,
    name: 'Water Damage Diagnostics',
    mobilePrice: '$49 - $99',
    laptopPrice: '$79 - $129',
    description: 'Initial assessment and emergency treatment for water-damaged devices.',
    doorstep: true
  },
  {
    id: 7,
    name: 'Data Recovery',
    mobilePrice: '$99 - $249',
    laptopPrice: '$129 - $299',
    description: 'Recover important data from damaged or malfunctioning devices.',
    doorstep: true
  },
  {
    id: 8,
    name: 'Keyboard Repair/Replacement',
    mobilePrice: null,
    laptopPrice: '$129 - $249',
    description: 'Replace damaged or malfunctioning laptop keyboards.',
    doorstep: true
  },
  {
    id: 9,
    name: 'Trackpad Repair',
    mobilePrice: null,
    laptopPrice: '$99 - $199',
    description: 'Fix laptop trackpad issues for smooth operation.',
    doorstep: true
  },
  {
    id: 10,
    name: 'RAM Upgrade',
    mobilePrice: null,
    laptopPrice: '$79 - $249',
    description: 'Boost performance with memory upgrades.',
    popular: true,
    doorstep: true
  },
  {
    id: 11,
    name: 'HDD/SSD Replacement/Upgrade',
    mobilePrice: null,
    laptopPrice: '$119 - $349',
    description: 'Upgrade storage capacity or replace failing drives.',
    doorstep: true
  },
  {
    id: 12,
    name: 'Software Troubleshooting',
    mobilePrice: '$79 - $149',
    laptopPrice: '$89 - $169',
    description: 'Diagnose and fix software issues, performance problems, or startup errors.',
    doorstep: true
  },
  {
    id: 13,
    name: 'Virus Removal',
    mobilePrice: '$79 - $129',
    laptopPrice: '$99 - $179',
    description: 'Remove malware and implement security measures to prevent future infections.',
    doorstep: true
  },
  {
    id: 14,
    name: 'Cooling System Repair',
    mobilePrice: null,
    laptopPrice: '$89 - $179',
    description: 'Resolve overheating issues with cooling system repair or cleaning.',
    doorstep: true
  },
  {
    id: 15,
    name: 'Power Jack Repair',
    mobilePrice: null,
    laptopPrice: '$129 - $219',
    description: 'Fix charging issues with DC jack replacement or circuit repair.',
    doorstep: true
  }
];

export default function PricingPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transparent Pricing for Our Repair Services
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              We believe in clear, upfront pricing with no hidden fees. All prices include our convenient doorstep service across the Lower Mainland.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-online" className="btn-accent text-center">
                Book Repair Service
              </Link>
              <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                Get a Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Complete Pricing Guide</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Below are our price ranges for common repairs. The exact price will be confirmed after diagnosing your specific device model and issue.
            </p>
            <div className="flex justify-center items-center mt-4">
              <div className="flex items-center mr-6">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span className="text-gray-700">All prices include doorstep service</span>
              </div>
            </div>
          </div>

          {/* Desktop Pricing Table */}
          <div className="hidden lg:block mb-12">
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repair Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <FaMobileAlt className="mr-2" />
                        Mobile Phones
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center">
                        <FaLaptop className="mr-2" />
                        Laptops
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doorstep Service
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {repairServices.map((service) => (
                    <tr key={service.id} className={service.popular ? 'bg-primary-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {service.name}
                            {service.popular && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {service.mobilePrice ? (
                          <span className="text-sm font-medium text-gray-900">{service.mobilePrice}</span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {service.laptopPrice ? (
                          <span className="text-sm font-medium text-gray-900">{service.laptopPrice}</span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {service.doorstep ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1" /> Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Limited
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Pricing Cards */}
          <div className="lg:hidden">
            <div className="space-y-6">
              {repairServices.map((service) => (
                <div key={service.id} className={`rounded-lg shadow-sm border border-gray-200 overflow-hidden ${service.popular ? 'border-l-4 border-l-primary-500' : ''}`}>
                  <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {service.name}
                      {service.popular && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                          Popular
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {service.description}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      {service.mobilePrice && (
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <FaMobileAlt className="mr-2" /> Mobile Phones
                          </dt>
                          <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                            {service.mobilePrice}
                          </dd>
                        </div>
                      )}
                      {service.laptopPrice && (
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500 flex items-center">
                            <FaLaptop className="mr-2" /> Laptops
                          </dt>
                          <dd className="mt-1 text-sm font-medium text-gray-900 sm:mt-0 sm:col-span-2">
                            {service.laptopPrice}
                          </dd>
                        </div>
                      )}
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Doorstep Service</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {service.doorstep ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1" /> Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Limited
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Information */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Understanding Our Pricing</h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-3">What's Included in Every Repair</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Doorstep Service:</span> Our technician travels to your location.</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Quality Parts:</span> Premium components with manufacturer compatibility.</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Expert Labor:</span> Certified technicians perform all repairs.</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Warranty:</span> 90-day guarantee on parts and labor.</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Diagnostics:</span> Complete assessment of your device's condition.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-3">Why Price Ranges?</h3>
                <p className="text-gray-600 mb-4">
                  We show price ranges because repair costs can vary based on:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Device Model:</span> Newer or premium models often use more expensive components.</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Part Availability:</span> Some components may be more difficult to source.</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Repair Complexity:</span> Some models require more technical expertise or time.</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-1" />
                    <span><span className="font-medium">Additional Issues:</span> Sometimes repairs reveal other problems that need addressing.</span>
                  </li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Our technician will confirm the exact price after diagnosing your specific device and before proceeding with any repair.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-3">No Hidden Fees</h3>
                <p className="text-gray-600">
                  We believe in transparency. The price quoted after diagnosis is the price you pay - no surprise charges or hidden fees. 
                  If additional issues are found during repair, we'll always discuss options with you before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Quote Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="bg-primary-50 rounded-lg shadow-custom p-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                  <FaQuestionCircle className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Need a Custom Quote?</h3>
                <p className="text-gray-600 mb-4">
                  Don\'t see your specific device or repair listed? Have a unique situation? Contact us for a personalized quote.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact" className="btn-primary">
                    Request Quote
                  </Link>
                  <Link href="/book-online" className="btn-outline">
                    Book Consultation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Common Pricing Questions</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Get answers to frequently asked questions about our pricing and payment policies.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-2">Do you charge for diagnostics?</h3>
                <p className="text-gray-600">
                  No, basic diagnostics are free. If you approve the repair, there's no diagnostic fee. If you decide not to proceed with the repair, 
                  there's a $39 service call fee to cover our technician's travel and time.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit and debit cards, e-Transfer, cash, and mobile payment options including Apple Pay and Google Pay. 
                  Payment is collected after the repair is completed and you've verified everything is working properly.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-2">Is there an extra charge for doorstep service?</h3>
                <p className="text-gray-600">
                  No, all our prices include our doorstep service within our standard service area. There are no additional travel or convenience fees.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-2">What if my repair costs more than expected?</h3>
                <p className="text-gray-600">
                  We'll always confirm the exact price with you after diagnosing your device and before beginning any work. If additional issues are 
                  discovered during the repair process, we'll consult with you and get approval before proceeding with any additional work.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Your Device Fixed?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book your doorstep repair service now and say goodbye to device problems without ever leaving your location.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-center">
                Book Repair Service
              </Link>
              <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-700 text-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 