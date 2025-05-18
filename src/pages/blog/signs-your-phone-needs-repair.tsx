import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaUser, FaTag, FaClock, FaChevronLeft, FaShare, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function SignsYourPhoneNeedsRepairPost() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog">
              <a className="inline-flex items-center text-primary-100 hover:text-white transition-colors mb-4">
                <FaChevronLeft className="mr-2" /> Back to Blog
              </a>
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              5 Warning Signs Your Phone Needs Repair
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-primary-100">
              <div className="flex items-center">
                <FaUser className="mr-2" /> 
                <span>Alex Chen</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" /> 
                <span>March 15, 2023</span>
              </div>
              <div className="flex items-center">
                <FaTag className="mr-2" /> 
                <span>Mobile Repair</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2" /> 
                <span>5 min read</span>
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
                src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd" 
                alt="Cracked smartphone screen" 
                layout="fill"
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
              <article className="prose prose-lg max-w-none">
                <p className="font-medium text-lg text-gray-700 mb-6">
                  Our smartphones have become essential tools in our daily lives, and when they start malfunctioning, it can significantly disrupt our routines. Recognizing the early warning signs that your phone needs professional attention can save you from more serious problems and potentially costly repairs down the line.
                </p>
                
                <p>
                  Many phone issues start with subtle symptoms that are easy to ignore. However, being proactive about addressing these signs can extend your device's lifespan and maintain its performance. Here are five critical warning signs that your phone may need professional repair.
                </p>

                <h2>1. Battery Draining Unusually Quickly</h2>
                <p>
                  While battery life naturally decreases over time, a sudden or dramatic drop in battery performance often indicates a problem. If your phone was once lasting all day but now needs multiple charges to make it through the same usage pattern, it could be a sign that:
                </p>
                <ul>
                  <li>The battery is deteriorating and needs replacement</li>
                  <li>Background apps are consuming excessive power</li>
                  <li>Hardware components are malfunctioning and drawing more power than they should</li>
                </ul>

                <p>
                  Our technicians can diagnose whether a simple battery replacement will solve the issue or if there's an underlying problem causing the excessive drain.
                </p>

                <h2>2. Overheating During Normal Use</h2>
                <p>
                  Some warming during charging or intensive tasks like gaming is normal, but your phone shouldn't become uncomfortably hot during regular activities like texting or browsing social media. Persistent overheating can indicate:
                </p>
                <ul>
                  <li>CPU or processor issues</li>
                  <li>Battery problems</li>
                  <li>Software conflicts or malware</li>
                  <li>Damaged charging components</li>
                </ul>

                <p>
                  Ignoring overheating can lead to permanent damage to internal components, data loss, or even safety hazards. Professional diagnosis can identify the source of the heat problem.
                </p>

                <h2>3. Unresponsive Touch Screen</h2>
                <p>
                  If your screen has started to:
                </p>
                <ul>
                  <li>Respond inconsistently to touches</li>
                  <li>Register phantom touches (ghost touching)</li>
                  <li>Have "dead zones" that don't respond at all</li>
                  <li>Lag significantly between touch and response</li>
                </ul>

                <p>
                  These are signs that the digitizer (the component that registers your touches) may be failing or damaged. While software glitches can sometimes cause similar symptoms, persistent touch problems typically require professional repair.
                </p>

                <h2>4. Charging Problems</h2>
                <p>
                  Charging issues can manifest in several ways:
                </p>
                <ul>
                  <li>Phone won't charge at all</li>
                  <li>Only charges in certain positions or with specific chargers</li>
                  <li>Charges very slowly</li>
                  <li>Battery percentage jumps erratically</li>
                  <li>Cable must be held at a specific angle to charge</li>
                </ul>

                <p>
                  These symptoms often point to a damaged charging port, worn-out battery, or faulty charging circuit. Our doorstep repair service can diagnose and fix most charging issues on the spot.
                </p>

                <h2>5. Camera Blurriness or Dark Spots</h2>
                <p>
                  If your once-clear photos now show:
                </p>
                <ul>
                  <li>Persistent blurriness that isn't caused by movement</li>
                  <li>Dark spots or smudges in the same location across photos</li>
                  <li>Lines or other artifacts</li>
                  <li>Strange color tinting</li>
                </ul>

                <p>
                  These issues typically indicate a problem with the camera module itself rather than just dirty lenses. Professional repair can restore your phone's photography capabilities without replacing the entire device.
                </p>

                <div className="border-t border-b border-gray-200 py-6 my-8">
                  <h3 className="text-xl font-bold mb-4">Need professional phone repair?</h3>
                  <p className="mb-4">
                    Our certified technicians can diagnose and fix these issues at your location across the Lower Mainland.
                  </p>
                  <Link href="/book-online">
                    <a className="btn-primary inline-block">
                      Book a Repair Now
                    </a>
                  </Link>
                </div>
              </article>
              
              {/* Share Links */}
              <div className="mt-8">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4 font-medium">Share this article:</span>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                      <FaFacebook />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                      <FaTwitter />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
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
                  <h3 className="text-lg font-bold mb-4">Services</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      <Link href="/services/mobile/screen-replacement">
                        <a className="hover:text-primary-600 transition-colors">Screen Replacement</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile/battery-replacement">
                        <a className="hover:text-primary-600 transition-colors">Battery Replacement</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile/charging-port-repair">
                        <a className="hover:text-primary-600 transition-colors">Charging Port Repair</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile/camera-repair">
                        <a className="hover:text-primary-600 transition-colors">Camera Repair</a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/services/mobile/water-damage">
                        <a className="hover:text-primary-600 transition-colors">Water Damage Repair</a>
                      </Link>
                    </li>
                  </ul>
                </div>
                
                <div className="card mb-8 p-6">
                  <h3 className="text-lg font-bold mb-4">Popular Articles</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-200">
                          <Image 
                            src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed" 
                            alt="Laptop Battery" 
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          <Link href="/blog/how-to-extend-your-laptop-battery-life">
                            <a className="hover:text-primary-600">
                              How to Extend Your Laptop Battery Life
                            </a>
                          </Link>
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">April 2, 2023</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-200">
                          <Image 
                            src="https://images.unsplash.com/photo-1563884072595-24fccfa2c5c2" 
                            alt="Water Damage" 
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          <Link href="/blog/water-damage-first-aid-for-devices">
                            <a className="hover:text-primary-600">
                              Water Damage First Aid for Your Devices
                            </a>
                          </Link>
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">February 10, 2023</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-200">
                          <Image 
                            src="https://images.unsplash.com/photo-1608503396060-0322b3e88af7" 
                            alt="Screen Protection" 
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          <Link href="/blog/ultimate-guide-to-screen-protection">
                            <a className="hover:text-primary-600">
                              The Ultimate Guide to Screen Protection
                            </a>
                          </Link>
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">January 22, 2023</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Card */}
                <div className="bg-primary-50 rounded-lg overflow-hidden shadow-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-3">Need a Repair?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Our technicians come directly to your location across the Lower Mainland. Most repairs completed in under an hour.
                    </p>
                    <Link href="/book-online">
                      <a className="btn-primary text-center w-full block">
                        Book Doorstep Repair
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image 
                  src="https://images.unsplash.com/photo-1585399000684-d2f72660f092" 
                  alt="Repair or Replace" 
                  layout="fill"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2">
                  <Link href="/blog/repair-or-replace-making-the-right-decision">
                    <a className="text-gray-900 hover:text-primary-600 transition-colors">
                      Repair or Replace? Making the Right Decision
                    </a>
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  How to determine whether it's more cost-effective to repair your existing device or invest in a new one.
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <FaCalendarAlt className="inline-block mr-1" /> 
                    <span>May 5, 2023</span>
                  </div>
                  <Link href="/blog/repair-or-replace-making-the-right-decision">
                    <a className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                      Read More
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image 
                  src="https://images.unsplash.com/photo-1563884072595-24fccfa2c5c2" 
                  alt="Water Damage" 
                  layout="fill"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2">
                  <Link href="/blog/water-damage-first-aid-for-devices">
                    <a className="text-gray-900 hover:text-primary-600 transition-colors">
                      Water Damage First Aid for Your Devices
                    </a>
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  The critical first steps to take when your phone or laptop gets wet that can save your device from permanent damage.
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <FaCalendarAlt className="inline-block mr-1" /> 
                    <span>February 10, 2023</span>
                  </div>
                  <Link href="/blog/water-damage-first-aid-for-devices">
                    <a className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                      Read More
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image 
                  src="https://images.unsplash.com/photo-1608503396060-0322b3e88af7" 
                  alt="Screen Protection" 
                  layout="fill"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2">
                  <Link href="/blog/ultimate-guide-to-screen-protection">
                    <a className="text-gray-900 hover:text-primary-600 transition-colors">
                      The Ultimate Guide to Screen Protection
                    </a>
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  Compare different types of screen protectors and learn proper installation techniques for maximum protection.
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <FaCalendarAlt className="inline-block mr-1" /> 
                    <span>January 22, 2023</span>
                  </div>
                  <Link href="/blog/ultimate-guide-to-screen-protection">
                    <a className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                      Read More
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Experiencing These Warning Signs?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Don't wait until your device stops working completely. Our technicians can diagnose and repair your phone at your location.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online">
                <a className="btn-accent text-center">
                  Book a Repair
                </a>
              </Link>
              <Link href="/contact">
                <a className="btn-outline border-white text-white hover:bg-primary-700 text-center">
                  Contact Us
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 