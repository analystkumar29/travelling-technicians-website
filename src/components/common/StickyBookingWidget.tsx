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
            <div className="flex items-center gap-3 mb-3">
              <Link
                href="/book-online"
                className="flex-1 bg-primary-800 hover:bg-primary-900 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Calendar className="h-4 w-4" />
                Book a Repair
              </Link>
              <a
                href={businessPhoneHref}
                className="bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Phone className="h-4 w-4" />
                Call Us
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
