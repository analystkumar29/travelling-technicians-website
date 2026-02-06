import Link from 'next/link';
import { LogoImage } from '@/components/common/OptimizedImage';
import { useSimplePhoneNumber } from '@/hooks/useBusinessSettings';
import { Phone, Mail, MapPin, Smartphone, Laptop, Tablet, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const { display: phoneDisplay, href: phoneHref, loading: phoneLoading } = useSimplePhoneNumber();

  return (
    <footer className="bg-primary-950 text-white">
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
              <div className="font-heading font-bold leading-tight">
                <span className="block text-lg text-white">Travelling</span>
                <span className="block text-lg text-accent-400">Technicians</span>
              </div>
            </div>
            <p className="text-primary-300 mb-4">
              Expert mobile phone and laptop repair services at your doorstep across the Lower Mainland.
            </p>
            <div className="space-y-2.5">
              <a href={phoneLoading ? '#' : phoneHref} className="flex items-center text-primary-200 hover:text-accent-400 transition-colors duration-200">
                <Phone className="h-4 w-4 text-accent-400 mr-2.5" />
                {phoneLoading ? 'Loading...' : phoneDisplay}
              </a>
              <a href="mailto:info@travellingtechnicians.ca" className="flex items-center text-primary-200 hover:text-accent-400 transition-colors duration-200">
                <Mail className="h-4 w-4 text-accent-400 mr-2.5" />
                info@travellingtechnicians.ca
              </a>
              <Link href="/service-areas" className="flex items-start text-primary-200 hover:text-accent-400 transition-colors duration-200">
                <MapPin className="h-4 w-4 text-accent-400 mr-2.5 mt-0.5" />
                Serving the entire Lower Mainland, BC
              </Link>
            </div>
            {/* Social Media */}
            <div className="flex space-x-4 mt-5">
              <a href="#" className="text-primary-400 hover:text-accent-400 transition-colors duration-200" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" className="text-primary-400 hover:text-accent-400 transition-colors duration-200" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" className="text-primary-400 hover:text-accent-400 transition-colors duration-200" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" className="text-primary-400 hover:text-accent-400 transition-colors duration-200" aria-label="LinkedIn"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-accent-400">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-primary-200 hover:text-white transition-colors duration-200">Home</Link></li>
              <li>
                <Link href="/services/mobile-repair" className="text-primary-200 hover:text-white transition-colors duration-200 flex items-center">
                  <Smartphone className="h-3.5 w-3.5 mr-2 text-primary-400" />Mobile Repair
                </Link>
              </li>
              <li>
                <Link href="/services/laptop-repair" className="text-primary-200 hover:text-white transition-colors duration-200 flex items-center">
                  <Laptop className="h-3.5 w-3.5 mr-2 text-primary-400" />Laptop Repair
                </Link>
              </li>
              <li>
                <Link href="/services/tablet-repair" className="text-primary-200 hover:text-white transition-colors duration-200 flex items-center">
                  <Tablet className="h-3.5 w-3.5 mr-2 text-primary-400" />Tablet Repair
                </Link>
              </li>
              <li><Link href="/doorstep" className="text-primary-200 hover:text-white transition-colors duration-200">Doorstep Repair</Link></li>
              <li><Link href="/pricing" className="text-primary-200 hover:text-white transition-colors duration-200">Pricing</Link></li>
              <li><Link href="/book-online" className="text-primary-200 hover:text-white transition-colors duration-200">Book Online</Link></li>
              <li><Link href="/contact" className="text-primary-200 hover:text-white transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-accent-400">Service Areas</h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              <li><Link href="/repair/vancouver" className="text-primary-200 hover:text-white transition-colors duration-200">Vancouver</Link></li>
              <li><Link href="/repair/burnaby" className="text-primary-200 hover:text-white transition-colors duration-200">Burnaby</Link></li>
              <li><Link href="/repair/richmond" className="text-primary-200 hover:text-white transition-colors duration-200">Richmond</Link></li>
              <li><Link href="/repair/new-westminster" className="text-primary-200 hover:text-white transition-colors duration-200">New Westminster</Link></li>
              <li><Link href="/repair/north-vancouver" className="text-primary-200 hover:text-white transition-colors duration-200">North Vancouver</Link></li>
              <li><Link href="/repair/west-vancouver" className="text-primary-200 hover:text-white transition-colors duration-200">West Vancouver</Link></li>
              <li><Link href="/repair/coquitlam" className="text-primary-200 hover:text-white transition-colors duration-200">Coquitlam</Link></li>
              <li><Link href="/repair/chilliwack" className="text-primary-200 hover:text-white transition-colors duration-200">Chilliwack</Link></li>
            </ul>
          </div>

          {/* Hours & Book Online */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-accent-400">Business Hours</h3>
            <ul className="space-y-2 text-primary-200">
              <li className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="text-white">8:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-white">9:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-white">10:00 AM - 5:00 PM</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/book-online"
                className="w-full px-4 py-3 bg-accent-500 text-primary-900 rounded-full font-semibold inline-block text-center hover:bg-accent-600 transition-colors duration-200"
              >
                Book Your Repair
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-800">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-primary-400 text-sm">
                &copy; {new Date().getFullYear()} The Travelling Technicians. All rights reserved.
              </p>
              <p className="text-primary-500 text-xs mt-1 max-w-2xl">
                The Travelling Technicians is an independent service provider. We are not affiliated with, authorized by, or endorsed by Apple Inc., Samsung Electronics Co., Ltd., or Google LLC. All trademarks are the property of their respective owners. We provide out-of-warranty hardware repairs only.
              </p>
            </div>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link href="/privacy-policy" className="text-primary-400 text-sm hover:text-white transition-colors duration-200">Privacy Policy</Link>
              <Link href="/terms-conditions" className="text-primary-400 text-sm hover:text-white transition-colors duration-200">Terms & Conditions</Link>
              <Link href="/sitemap" className="text-primary-400 text-sm hover:text-white transition-colors duration-200">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
