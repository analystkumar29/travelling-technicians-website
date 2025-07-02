import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { FaCalendarAlt, FaUser, FaTag, FaClock, FaChevronLeft, FaShare, FaFacebook, FaTwitter, FaLinkedin, FaExclamationTriangle, FaPhone, FaLaptop } from 'react-icons/fa';

export default function WaterDamageFirstAidPost() {
  return (
    <>
      <Head>
        <title>Water Damage First Aid for Devices | Emergency Repair Guide | The Travelling Technicians</title>
        <meta name="description" content="Emergency steps to save water-damaged phones and laptops. Learn immediate response protocols, what to do and avoid, and when to call professionals for device recovery." />
        <meta name="keywords" content="water damage repair, phone water damage, laptop water damage, emergency device repair, water damage first aid, spilled liquid on phone" />
        <link rel="canonical" href="https://www.travelling-technicians.ca/blog/water-damage-first-aid-for-devices" />
        <meta property="og:title" content="Water Damage First Aid for Your Devices | Emergency Guide" />
        <meta property="og:description" content="Critical steps to take in the first minutes after water damage. Emergency protocols that could save your device and data." />
        <meta property="og:url" content="https://travelling-technicians.ca/blog/water-damage-first-aid-for-devices" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://travelling-technicians.ca/images/blog/water-damage-repair.jpg" />
        <meta property="article:published_time" content="2024-03-05T00:00:00Z" />
        <meta property="article:author" content="Michael Tran" />
        <meta property="article:section" content="Emergency Repair" />
        <meta property="article:tag" content="water damage" />
        <meta property="article:tag" content="emergency repair" />
        <meta property="article:tag" content="device recovery" />
        
        {/* Article Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Water Damage First Aid for Your Devices",
            "description": "Emergency steps to save water-damaged phones and laptops. Learn immediate response protocols, what to do and avoid, and when to call professionals.",
            "image": "https://travelling-technicians.ca/images/blog/water-damage-repair.jpg",
            "author": {
              "@type": "Person",
              "name": "Michael Tran"
            },
            "publisher": {
              "@type": "Organization",
              "name": "The Travelling Technicians",
              "logo": {
                "@type": "ImageObject",
                "url": "https://travelling-technicians.ca/images/logo/logo-orange.png"
              }
            },
            "datePublished": "2024-03-05",
            "dateModified": "2024-03-05",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://travelling-technicians.ca/blog/water-damage-first-aid-for-devices"
            },
            "articleSection": "Emergency Repair",
            "keywords": ["water damage", "emergency repair", "device recovery", "phone rescue"]
          })
        }} />
      </Head>
      <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-r from-red-700 to-red-900 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-red-100 hover:text-white transition-colors mb-4">
              <FaChevronLeft className="mr-2" /> Back to Blog
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Water Damage First Aid for Your Devices
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-red-100">
              <div className="flex items-center">
                <FaUser className="mr-2" /> 
                <span>Michael Tran</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" /> 
                <span>March 5, 2024</span>
              </div>
              <div className="flex items-center">
                <FaTag className="mr-2" /> 
                <span>Emergency Repair</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2" /> 
                <span>6 min read</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="py-8 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom">
              <Image 
                src="/images/blog/water-damage-repair.jpg" 
                alt="Water damaged device emergency repair" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
              <article className="prose prose-lg max-w-none blog-post-content">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
                  <div className="flex items-center mb-2">
                    <FaExclamationTriangle className="text-red-500 mr-2" />
                    <h3 className="text-red-800 font-bold text-lg mb-0">EMERGENCY ALERT</h3>
                  </div>
                  <p className="text-red-700 mb-0">
                    Time is critical! The first 24-48 hours after water exposure determine whether your device can be saved. Follow these steps immediately.
                  </p>
                </div>

                <p className="font-medium text-lg text-gray-700 mb-6">
                  Water damage is one of the most common and devastating accidents that can happen to your electronic devices. Whether it's a spilled coffee, dropped phone in water, or flood damage, knowing the right immediate response can mean the difference between a successful recovery and a total loss.
                </p>
                
                <p>
                  This guide provides step-by-step emergency protocols for both smartphones and laptops when they encounter water damage. Acting quickly and correctly in the first few minutes can dramatically increase the chances of saving your device and your data.
                </p>

                <h2>🚨 Immediate Response (First 5 Minutes)</h2>
                
                <h3>Step 1: Power Down Immediately</h3>
                <p>
                  <strong>DO NOT</strong> try to turn on your device or check if it's working. This is the most critical step:
                </p>
                <ul>
                  <li><strong>Smartphones:</strong> Hold power button + volume down to force shutdown</li>
                  <li><strong>Laptops:</strong> Hold power button for 10 seconds to force shutdown</li>
                  <li><strong>If powered off:</strong> Do NOT turn it on to "test" it</li>
                  <li><strong>Remove from power source:</strong> Unplug chargers immediately</li>
                </ul>

                <h3>Step 2: Remove External Components</h3>
                <ul>
                  <li>Remove phone case and screen protectors</li>
                  <li>Take out SIM card and memory cards</li>
                  <li>For laptops: remove battery if possible (older models)</li>
                  <li>Remove any connected accessories (headphones, USB drives)</li>
                </ul>

                <h3>Step 3: Initial Water Removal</h3>
                <ul>
                  <li>Gently shake out visible water</li>
                  <li>Use absorbent cloth to dab (don't wipe) external surfaces</li>
                  <li>Avoid using heat sources (hair dryers, heaters)</li>
                  <li>Don't use compressed air - it can push water deeper</li>
                </ul>

                <h2>📱 Smartphone-Specific Emergency Steps</h2>
                
                <h3>For iPhones (Lightning/USB-C)</h3>
                <ul>
                  <li>Check if water entered charging port</li>
                  <li>Don't attempt to charge for at least 24 hours</li>
                  <li>If you see water in camera lens, it needs professional attention</li>
                  <li>Modern iPhones have water resistance, but it's not waterproof</li>
                </ul>

                <h3>For Android Phones</h3>
                <ul>
                  <li>Remove back cover if possible (older models)</li>
                  <li>Take out battery if removable</li>
                  <li>Check for water in headphone jack and charging port</li>
                  <li>Some phones have water damage indicators that change color</li>
                </ul>

                <h2>💻 Laptop Emergency Protocol</h2>
                
                <h3>Immediate Positioning</h3>
                <ul>
                  <li>Turn laptop upside down in a tent position</li>
                  <li>This allows water to drain out of keyboard and vents</li>
                  <li>Keep it in this position for at least 48 hours</li>
                  <li>Place on absorbent towels that you change regularly</li>
                </ul>

                <h3>Remove What You Can</h3>
                <ul>
                  <li>Remove battery if it's external/removable</li>
                  <li>Take out RAM sticks if you're comfortable doing so</li>
                  <li>Remove hard drive/SSD if easily accessible</li>
                  <li>Clean any visible water from these components</li>
                </ul>

                <h2>🏠 DIY Drying Methods</h2>
                
                <h3>The Desiccant Method (Most Effective)</h3>
                <ul>
                  <li><strong>Silica gel packets:</strong> Much more effective than rice</li>
                  <li><strong>Setup:</strong> Place device in airtight container with desiccant</li>
                  <li><strong>Duration:</strong> 48-72 hours for phones, 5-7 days for laptops</li>
                  <li><strong>Where to get:</strong> Craft stores, online, or save packets from purchases</li>
                </ul>

                <h3>The Rice Method (Less Effective)</h3>
                <ul>
                  <li>Only use if no other options available</li>
                  <li>Use uncooked white rice in airtight container</li>
                  <li>Rice can leave residue - clean device afterward</li>
                  <li>Leave for 48-72 hours minimum</li>
                </ul>

                <h3>Professional Drying Options</h3>
                <ul>
                  <li>Vacuum-sealed desiccant chambers</li>
                  <li>Ultrasonic cleaning for circuit boards</li>
                  <li>Controlled environment drying rooms</li>
                  <li>Isopropyl alcohol displacement technique</li>
                </ul>

                <h2>⚠️ Critical DON'Ts</h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-6">
                  <h3 className="text-red-800 font-bold mb-4">Never Do These Things:</h3>
                  <ul className="text-red-700">
                    <li><strong>Don't use heat:</strong> Hair dryers, ovens, or heaters can warp components</li>
                    <li><strong>Don't shake vigorously:</strong> Can spread water to dry areas</li>
                    <li><strong>Don't try to turn on:</strong> Even to "test" - this can cause permanent damage</li>
                    <li><strong>Don't charge immediately:</strong> Wait at least 24-48 hours</li>
                    <li><strong>Don't use compressed air:</strong> Pushes water deeper into device</li>
                    <li><strong>Don't put in freezer:</strong> Condensation will make it worse</li>
                  </ul>
                </div>

                <h2>📞 When to Call Professionals</h2>
                
                <h3>Immediate Professional Help Needed:</h3>
                <ul>
                  <li>Saltwater exposure (highly corrosive)</li>
                  <li>Sugary drinks (coffee, soda) - leave sticky residue</li>
                  <li>Device was on when water hit it</li>
                  <li>Water visible inside screen or camera</li>
                  <li>Important data that must be recovered</li>
                </ul>

                <h3>Professional Recovery Services Can:</h3>
                <ul>
                  <li>Disassemble device completely for thorough cleaning</li>
                  <li>Use specialized solvents and ultrasonic cleaning</li>
                  <li>Replace corroded components</li>
                  <li>Recover data from damaged storage</li>
                  <li>Provide warranty on repairs</li>
                </ul>

                <h2>💡 Prevention Tips</h2>
                
                <ul>
                  <li><strong>Waterproof cases:</strong> Invest in quality protection</li>
                  <li><strong>Keep liquids away:</strong> Maintain safe distance from work areas</li>
                  <li><strong>Regular backups:</strong> Your data is often more valuable than the device</li>
                  <li><strong>Insurance:</strong> Consider device protection plans</li>
                  <li><strong>Water-resistant devices:</strong> Know your device's IP rating</li>
                </ul>

                <h2>🔄 Recovery Timeline</h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
                  <h3 className="text-blue-800 font-bold mb-4">What to Expect:</h3>
                  <ul className="text-blue-700">
                    <li><strong>0-24 hours:</strong> Emergency response and initial drying</li>
                    <li><strong>24-48 hours:</strong> Professional assessment if needed</li>
                    <li><strong>48-72 hours:</strong> First safe power-on attempt</li>
                    <li><strong>72+ hours:</strong> Extended drying for severe cases</li>
                    <li><strong>1 week:</strong> Professional repair completion</li>
                  </ul>
                </div>

                <div className="border-t border-b border-gray-200 py-6 my-8 blog-cta">
                  <h3>Emergency Water Damage Repair Service</h3>
                  <p>
                    Water damage to your device? Don't wait - every minute counts. Our emergency repair technicians can come to you within hours across the Lower Mainland.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/book-online" className="btn-primary inline-block text-center">
                      Emergency Repair Booking
                    </Link>
                    <Link href="/contact" className="btn-secondary inline-block text-center">
                      Call for Immediate Help
                    </Link>
                  </div>
                </div>
              </article>
              
              {/* Share Links */}
              <div className="mt-8">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4 font-medium">Share this article:</span>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors social-share-btn">
                      <FaFacebook />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors social-share-btn">
                      <FaTwitter />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors social-share-btn">
                      <FaLinkedin />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 space-y-8">
                <div className="card mb-8 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <FaExclamationTriangle className="text-red-500 mr-2" />
                    Emergency Services
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      <Link href="/services/mobile-repair" className="hover:text-primary-600 transition-colors flex items-center">
                        <FaPhone className="mr-2" /> Water Damage Recovery
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/laptop-repair" className="hover:text-primary-600 transition-colors flex items-center">
                        <FaLaptop className="mr-2" /> Liquid Spill Cleaning
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="hover:text-primary-600 transition-colors">Emergency Consultation</Link>
                    </li>
                    <li>
                      <Link href="/book-online" className="hover:text-primary-600 transition-colors">Same-Day Service</Link>
                    </li>
                  </ul>
                </div>
                
                <div className="card mb-8 p-6">
                  <h3 className="text-lg font-bold mb-4">Related Articles</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/blog/signs-your-phone-needs-repair" className="text-gray-700 hover:text-primary-600 transition-colors">
                        Signs Your Phone Needs Repair
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog/how-to-extend-your-laptop-battery-life" className="text-gray-700 hover:text-primary-600 transition-colors">
                        Laptop Battery Care
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog/ultimate-guide-to-screen-protection" className="text-gray-700 hover:text-primary-600 transition-colors">
                        Screen Protection Guide
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="card p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                  <h3 className="text-lg font-bold mb-3 text-red-800">💧 Quick Reference</h3>
                  <div className="text-sm text-red-700 space-y-2">
                    <p><strong>Step 1:</strong> Power off immediately</p>
                    <p><strong>Step 2:</strong> Remove components</p>
                    <p><strong>Step 3:</strong> Drain & dry externally</p>
                    <p><strong>Step 4:</strong> Desiccant treatment</p>
                    <p><strong>Step 5:</strong> Wait 48-72 hours</p>
                    <p className="font-bold">When in doubt, call professionals!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </Layout>
    </>
  );
} 