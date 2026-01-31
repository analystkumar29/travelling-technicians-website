import Link from 'next/link';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMobileAlt, FaLaptop, FaTabletAlt } from 'react-icons/fa';
import { LogoImage } from '@/components/common/OptimizedImage';
import { useSimplePhoneNumber } from '@/hooks/useBusinessSettings';

export default function Footer() {
  const { display: phoneDisplay, href: phoneHref, loading: phoneLoading } = useSimplePhoneNumber();
  
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <LogoImage 
                src="/images/logo/logo-orange-optimized.webp" 
                alt="Travelling Technicians Logo" 
                width={48} 
                height={48} 
                className="h-12 w-12 mr-2"
              />
              <div className="font-semibold text-white leading-tight">
                <span className="block text-lg">Travelling</span>
                <span className="block text-lg text-accent-400">Technicians</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Expert mobile phone and laptop repair services at your doorstep across the Lower Mainland.
            </p>
            <div className="space-y-2">
              <div className="flex items-center group">
                <FaPhone className="text-primary-400 mr-2 group-hover:text-primary-300 transition-colors duration-300" />
                <a href={phoneLoading ? "#" : phoneHref} className="group-hover:text-primary-300 transition-colors duration-300">
                  {phoneLoading ? "Loading..." : phoneDisplay}
                </a>
              </div>
              <div className="flex items-center group">
                <FaEnvelope className="text-primary-400 mr-2 group-hover:text-primary-300 transition-colors duration-300" />
                <a href="mailto:info@travellingtechnicians.ca" className="group-hover:text-primary-300 transition-colors duration-300">
                  info@travellingtechnicians.ca
                </a>
              </div>
              <div className="flex items-start group">
                <FaMapMarkerAlt className="text-primary-400 mr-2 mt-1 group-hover:text-primary-300 transition-colors duration-300" />
                <a href="/service-areas" className="group-hover:text-primary-300 transition-colors duration-300">
                  Serving the entire Lower Mainland, BC
                </a>
              </div>
            </div>
            {/* Social Media */}
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 hover:scale-110 transform" aria-label="Facebook">
                <FaFacebook size={22} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 hover:scale-110 transform" aria-label="Twitter">
                <FaTwitter size={22} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 hover:scale-110 transform" aria-label="Instagram">
                <FaInstagram size={22} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 hover:scale-110 transform" aria-label="LinkedIn">
                <FaLinkedin size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Home
                    </span>
                  </Link>
              </li>
              <li>
                <Link href="/services/mobile-repair" className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                  <FaMobileAlt className="mr-2" />
                  Mobile Repair
                </Link>
              </li>
              <li>
                <Link href="/services/laptop-repair" className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                  <FaLaptop className="mr-2" />
                  Laptop Repair
                </Link>
              </li>
              <li>
                <Link href="/services/tablet-repair" className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                  <FaTabletAlt className="mr-2" />
                  Tablet Repair
                </Link>
              </li>
              <li>
                <Link href="/doorstep" className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Doorstep Repair
                    </span>
                  </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Pricing
                    </span>
                  </Link>
              </li>
              <li>
                <Link href="/book-online" className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Book Online
                    </span>
                  </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Contact Us
                    </span>
                  </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-400">Service Areas</h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              <li>
                <Link href="/repair/vancouver" className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                  Vancouver
                </Link>
              </li>
              <li>
                <Link href="/repair/burnaby" className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                  Burnaby
                </Link>
              </li>
              <li>
                <Link href="/repair/richmond" className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                  Richmond
                </Link>
              </li>
              <li>
                <Link href="/repair/new-westminster" className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                  New Westminster
                </Link>
              </li>
              <li>
                <Link href="/repair/north-vancouver" className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                  North Vancouver
                </Link>
              </li>
              <li>
                <Link href="/repair/west-vancouver" className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                  West Vancouver
                </Link>
              </li>
              <li>
                <Link href="/repair/coquitlam" className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                  Coquitlam
                </Link>
              </li>
              <li>
                <Link href="/repair/chilliwack" className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                  Chilliwack
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours & Book Online */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-400">Business Hours</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>8:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span>9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span>10:00 AM - 5:00 PM</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/book-online" className="w-full px-4 py-3 bg-accent-500 text-white rounded-md font-medium inline-block text-center hover:bg-accent-600 transition-all duration-300 hover:shadow-md hover:translate-y-[-1px]">
                  Book Your Repair
                </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-950 py-4">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} The Travelling Technicians. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-400 text-sm hover:text-primary-300 transition-colors duration-300">
                  Privacy Policy
                </Link>
              <Link href="/terms-conditions" className="text-gray-400 text-sm hover:text-primary-300 transition-colors duration-300">
                  Terms & Conditions
                </Link>
              <Link href="/sitemap" className="text-gray-400 text-sm hover:text-primary-300 transition-colors duration-300">
                  Sitemap
                </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 