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
            <Link href="/blog" className="inline-flex items-center text-primary-100 hover:text-white transition-colors mb-4">
              <FaChevronLeft className="mr-2" /> Back to Blog
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
                  <li>Your battery has deteriorated and needs replacement</li>
                  <li>There's a software issue causing excessive battery consumption</li>
                  <li>A hardware component is malfunctioning and drawing too much power</li>
                </ul>
                <p>
                  A professional technician can diagnose whether you need a simple battery replacement or if there's a more serious underlying issue.
                </p>

                <h2>2. Overheating Without Heavy Use</h2>
                <p>
                  Phones naturally generate heat during processor-intensive activities like gaming or video streaming. However, if your phone gets uncomfortably hot during basic tasks like texting or browsing, or while charging, this could indicate:
                </p>
                <ul>
                  <li>Battery damage or deterioration</li>
                  <li>Processor or hardware malfunctions</li>
                  <li>Ventilation blockage from dust or debris</li>
                  <li>Charging system issues</li>
                </ul>
                <p>
                  Consistent overheating can damage internal components and potentially create safety hazards. Don't ignore this warning sign.
                </p>

                <h2>3. Unresponsive or Glitchy Touchscreen</h2>
                <p>
                  When your touchscreen stops responding reliably, it can make your phone frustrating or even impossible to use. Look for these symptoms:
                </p>
                <ul>
                  <li>Delayed response to taps or swipes</li>
                  <li>"Ghost touches" (phone registers touches you didn't make)</li>
                  <li>Dead zones where the screen doesn't respond</li>
                  <li>Erratic behavior like jumping or flickering</li>
                </ul>
                <p>
                  While software issues can sometimes cause these problems, they often indicate physical damage to the digitizer or display components, especially if there's visible damage like cracks or water exposure.
                </p>

                <h2>4. Charging Problems</h2>
                <p>
                  Charging issues are among the most common phone problems and can manifest in several ways:
                </p>
                <ul>
                  <li>Phone charges very slowly or not at all</li>
                  <li>Connection is loose or must be held at a specific angle</li>
                  <li>Wireless charging becomes inconsistent or stops working</li>
                  <li>Phone shows it's charging but the battery percentage doesn't increase</li>
                </ul>
                <p>
                  These symptoms often point to a damaged charging port, which can accumulate lint and debris or suffer from bent connection pins. In some cases, the charging circuit on the motherboard may be damaged. A repair technician can clean the port or replace it if necessary.
                </p>

                <h2>5. Camera Issues</h2>
                <p>
                  For many users, the smartphone camera is an essential feature. Problems with your camera that might require repair include:
                </p>
                <ul>
                  <li>Blurry or unfocused images when the lens is clean</li>
                  <li>Camera app crashes when opened</li>
                  <li>Black screen when camera is activated</li>
                  <li>Strange lines or spots appearing in photos</li>
                  <li>Camera flash not working properly</li>
                </ul>
                <p>
                  These issues can stem from software glitches, but persistent problems often indicate hardware failure in the camera module, sensors, or connecting components.
                </p>

                <h2>When to Seek Professional Repair</h2>
                <p>
                  While some minor issues can be resolved with simple troubleshooting like restarting your device or clearing cache, persistent problems typically require professional attention. Consider seeking repair when:
                </p>
                <ul>
                  <li>The problem persists after basic troubleshooting steps</li>
                  <li>There's visible physical damage like cracks or water exposure</li>
                  <li>The issue is getting progressively worse</li>
                  <li>Your phone is less than 2-3 years old and otherwise worth repairing</li>
                </ul>

                <h2>Benefits of Doorstep Repair Services</h2>
                <p>
                  With doorstep repair services like ours, you don't need to go without your phone for days. Our technicians come to your location across the Lower Mainland with the tools and parts needed to diagnose and fix most common issues on the spot. This means:
                </p>
                <ul>
                  <li>No need to back up and reset your device for repair</li>
                  <li>Your data remains secure as your device never leaves your possession</li>
                  <li>You can watch the repair process and ask questions</li>
                  <li>Most repairs can be completed in under an hour</li>
                </ul>

                <p>
                  By addressing phone problems promptly, you can avoid more expensive repairs later and extend the useful life of your device. If you're experiencing any of these warning signs, consider booking a doorstep repair service to diagnose and resolve the issue quickly and conveniently.
                </p>

                <div className="border-t border-b border-gray-200 py-6 my-8">
                  <h3 className="text-xl font-bold mb-4">Need professional phone repair?</h3>
                  <p className="mb-4">
                    Our certified technicians can diagnose and fix these issues at your location across the Lower Mainland.
                  </p>
                  <Link href="/book-online" className="btn-primary inline-block">
                    Book a Repair Now
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
              <div className="sticky top-24">
                {/* Author Bio */}
                <div className="card mb-8 p-6">
                  <h3 className="text-lg font-bold mb-4">About the Author</h3>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        <Image 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" 
                          alt="Alex Chen" 
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Alex Chen</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Senior Repair Technician with over 10 years of experience fixing mobile devices. Certified Apple and Samsung specialist.
                      </p>
                      <Link href="/about#team" className="text-primary-600 text-sm font-medium hover:text-primary-700">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Popular Articles */}
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
                          <Link href="/blog/how-to-extend-your-laptop-battery-life" className="hover:text-primary-600">
                            How to Extend Your Laptop Battery Life
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
                          <Link href="/blog/water-damage-first-aid-for-devices" className="hover:text-primary-600">
                            Water Damage First Aid for Your Devices
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
                          <Link href="/blog/ultimate-guide-to-screen-protection" className="hover:text-primary-600">
                            The Ultimate Guide to Screen Protection
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
                    <Link href="/book-online" className="btn-primary text-center w-full block">
                      Book Doorstep Repair
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
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2">
                  <Link href="/blog/repair-or-replace-making-the-right-decision" className="text-gray-900 hover:text-primary-600 transition-colors">
                    Repair or Replace? Making the Right Decision
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
                  <Link href="/blog/repair-or-replace-making-the-right-decision" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image 
                  src="https://images.unsplash.com/photo-1563884072595-24fccfa2c5c2" 
                  alt="Water Damage" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2">
                  <Link href="/blog/water-damage-first-aid-for-devices" className="text-gray-900 hover:text-primary-600 transition-colors">
                    Water Damage First Aid for Your Devices
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
                  <Link href="/blog/water-damage-first-aid-for-devices" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image 
                  src="https://images.unsplash.com/photo-1608503396060-0322b3e88af7" 
                  alt="Screen Protection" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2">
                  <Link href="/blog/ultimate-guide-to-screen-protection" className="text-gray-900 hover:text-primary-600 transition-colors">
                    The Ultimate Guide to Screen Protection
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
                  <Link href="/blog/ultimate-guide-to-screen-protection" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                    Read More
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
              <Link href="/book-online" className="btn-accent text-center">
                Book a Repair
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