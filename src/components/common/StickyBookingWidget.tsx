'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Calendar, Shield, Clock, Zap, X } from 'lucide-react';

interface StickyBookingWidgetProps {
  businessPhone?: string;
  businessPhoneHref?: string;
}

export default function StickyBookingWidget({
  businessPhone = '(604) 849-5329',
  businessPhoneHref = 'tel:+16048495329',
}: StickyBookingWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || dismissed) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 hidden md:block">
      <div className="relative">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-primary-100 overflow-hidden min-w-[280px]">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Link
                href="/book-online"
                className="flex-1 bg-primary-800 hover:bg-primary-900 text-white font-semibold py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Calendar className="h-4 w-4" />
                Book
              </Link>
              <a
                href={businessPhoneHref}
                className="bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-2.5 px-3 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <a
                href="https://wa.me/16048495329?text=Hi%2C%20I%20need%20a%20device%20repair"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1ebe57] text-white font-medium py-2.5 px-3 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat
              </a>
            </div>

            {expanded && (
              <div className="pt-3 border-t border-primary-100 space-y-2">
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <Zap className="h-3.5 w-3.5 text-accent-500" />
                  Same-day available
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <Shield className="h-3.5 w-3.5 text-accent-500" />
                  90-day warranty
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <Clock className="h-3.5 w-3.5 text-accent-500" />
                  Free quote included
                </div>
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-center text-xs text-primary-400 hover:text-primary-600 mt-2 transition-colors"
            >
              {expanded ? 'Less info' : 'More info'}
            </button>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-2 -right-2 bg-primary-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-primary-900 transition-colors"
          aria-label="Close booking widget"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
