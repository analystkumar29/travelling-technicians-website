import Link from 'next/link';
import { LogoImage } from '@/components/common/OptimizedImage';
import { useSimplePhoneNumber, useBusinessSettings, useServiceAreas } from '@/hooks/useBusinessSettings';
import { Phone, Mail, MapPin, Smartphone, Laptop, Tablet, MessageCircle } from 'lucide-react';
import { getActiveServiceNavItems, ServiceNavItem } from '@/config/service-nav';

const FOOTER_ICON_MAP: Record<ServiceNavItem['icon'], React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
};

/** Format 24h time string (e.g. "08:00") to 12h display (e.g. "8:00 AM") */
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}:00 ${ampm}` : `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function Footer() {
  const { display: phoneDisplay, href: phoneHref, loading: phoneLoading } = useSimplePhoneNumber();
  const { settings, loading: settingsLoading } = useBusinessSettings();
  const { cities, loading: citiesLoading } = useServiceAreas();

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
              <a href={settingsLoading ? '#' : `mailto:${settings.email}`} className="flex items-center text-primary-200 hover:text-accent-400 transition-colors duration-200">
                <Mail className="h-4 w-4 text-accent-400 mr-2.5" />
                {settingsLoading ? 'Loading...' : settings.email}
              </a>
              <a href="https://wa.me/16048495329?text=Hi%2C%20I%20need%20a%20device%20repair" target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-200 hover:text-accent-400 transition-colors duration-200">
                <MessageCircle className="h-4 w-4 text-accent-400 mr-2.5" />
                WhatsApp Us
              </a>
              <Link href="/service-areas" className="flex items-start text-primary-200 hover:text-accent-400 transition-colors duration-200">
                <MapPin className="h-4 w-4 text-accent-400 mr-2.5 mt-0.5" />
                Serving the entire Lower Mainland, BC
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-accent-400">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-primary-200 hover:text-white transition-colors duration-200">Home</Link></li>
              {getActiveServiceNavItems().map((item) => {
                const Icon = FOOTER_ICON_MAP[item.icon];
                return (
                  <li key={item.slug}>
                    <Link href={item.href} className="text-primary-200 hover:text-white transition-colors duration-200 flex items-center">
                      <Icon className="h-3.5 w-3.5 mr-2 text-primary-400" />{item.label}
                    </Link>
                  </li>
                );
              })}
              <li><Link href="/repair" className="text-primary-200 hover:text-white transition-colors duration-200">Doorstep Repair</Link></li>
              <li><Link href="/pricing" className="text-primary-200 hover:text-white transition-colors duration-200">Pricing</Link></li>
              <li><Link href="/book-online" className="text-primary-200 hover:text-white transition-colors duration-200">Book Online</Link></li>
              <li><Link href="/check-warranty" className="text-primary-200 hover:text-white transition-colors duration-200">Check Warranty</Link></li>
              <li><Link href="/contact" className="text-primary-200 hover:text-white transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-accent-400">Service Areas</h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              {citiesLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <li key={i}><span className="text-primary-400">Loading...</span></li>
                ))
              ) : (
                cities.map((city) => (
                  <li key={city.slug}>
                    <Link href={`/repair/${city.slug}`} className="text-primary-200 hover:text-white transition-colors duration-200">
                      {city.cityName}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Hours & Book Online */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-4 text-accent-400">Business Hours</h3>
            <ul className="space-y-2 text-primary-200">
              {settingsLoading ? (
                <>
                  <li className="flex justify-between"><span>Monday - Friday:</span><span className="text-white">Loading...</span></li>
                  <li className="flex justify-between"><span>Saturday:</span><span className="text-white">Loading...</span></li>
                  <li className="flex justify-between"><span>Sunday:</span><span className="text-white">Loading...</span></li>
                </>
              ) : (
                ['weekday', 'saturday', 'sunday'].map((key) => {
                  const slot = settings.hours[key];
                  if (!slot || typeof slot !== 'object' || !slot.open) return null;
                  return (
                    <li key={key} className="flex justify-between">
                      <span>{slot.label || key}:</span>
                      <span className="text-white">{formatTime(slot.open)} - {formatTime(slot.close)}</span>
                    </li>
                  );
                })
              )}
            </ul>
            <div className="mt-6 space-y-3">
              <Link
                href="/book-online"
                className="w-full px-4 py-3 bg-accent-500 text-primary-900 rounded-full font-semibold inline-block text-center hover:bg-accent-600 transition-colors duration-200"
              >
                Book Your Repair
              </Link>
              <a
                href="https://g.page/r/CXBAlSwIpGMSEAE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 border border-primary-700 text-primary-300 hover:text-white rounded-full text-sm inline-flex items-center justify-center gap-2 hover:border-primary-500 transition-colors duration-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Rate us on Google
              </a>
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
                Apple, iPhone, iPad, and MacBook are trademarks of Apple Inc. Samsung and Galaxy are trademarks of Samsung Electronics Co., Ltd. Google and Pixel are trademarks of Google LLC. The Travelling Technicians is an independent repair service and is not affiliated with, authorized by, or endorsed by any of these companies. We provide out-of-warranty hardware repairs only.
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
