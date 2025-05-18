import Link from 'next/link';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              {/* Logo implementation with SVG primary and PNG fallback */}
              <picture className="inline-block">
                <source srcSet="/images/logo.svg" type="image/svg+xml" />
                <img 
                  src="/images/logo.png" 
                  alt="The Travelling Technicians Logo" 
                  width={110} 
                  height={40} 
                  className="h-12 w-auto mb-2"
                />
              </picture>
              <h3 className="text-xl font-bold mt-2">The Travelling Technicians</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Expert mobile phone and laptop repair services at your doorstep across the Lower Mainland.
            </p>
            <div className="space-y-2">
              <div className="flex items-center group">
                <FaPhone className="text-primary-400 mr-2 group-hover:text-primary-300 transition-colors duration-300" />
                <a href="tel:6041234567" className="group-hover:text-primary-300 transition-colors duration-300">
                  (604) 123-4567
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
                <Link href="/">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Home
                    </span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/services/mobile">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Mobile Phone Repair
                    </span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/services/laptop">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Laptop & Computer Repair
                    </span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/doorstep">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Doorstep Repair
                    </span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Pricing
                    </span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/book-online">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Book Online
                    </span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300 flex items-center">
                    <span>
                      <span className="w-1 h-1 bg-primary-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      Contact Us
                    </span>
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-400">Service Areas</h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              <li>
                <Link href="/service-areas/vancouver">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    Vancouver
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/burnaby">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    Burnaby
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/surrey">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    Surrey
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/richmond">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    Richmond
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/coquitlam">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    Coquitlam
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/north-vancouver">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    North Vancouver
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/west-vancouver">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    West Vancouver
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/new-westminster">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    New Westminster
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/delta">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    Delta
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas/langley">
                  <a className="text-gray-300 hover:text-primary-300 transition-colors duration-300">
                    Langley
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/service-areas">
                  <a className="text-primary-400 hover:text-primary-300 transition-colors duration-300 font-medium">
                    View All Areas
                  </a>
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
              <Link href="/book-online">
                <a className="w-full px-4 py-3 bg-accent-500 text-white rounded-md font-medium inline-block text-center hover:bg-accent-600 transition-all duration-300 hover:shadow-md hover:translate-y-[-1px]">
                  Book Your Repair
                </a>
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
              <Link href="/privacy-policy">
                <a className="text-gray-400 text-sm hover:text-primary-300 transition-colors duration-300">
                  Privacy Policy
                </a>
              </Link>
              <Link href="/terms-conditions">
                <a className="text-gray-400 text-sm hover:text-primary-300 transition-colors duration-300">
                  Terms & Conditions
                </a>
              </Link>
              <Link href="/sitemap">
                <a className="text-gray-400 text-sm hover:text-primary-300 transition-colors duration-300">
                  Sitemap
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 