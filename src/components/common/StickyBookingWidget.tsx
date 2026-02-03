'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaWhatsapp, FaPhone, FaCalendarAlt } from 'react-icons/fa';

interface StickyBookingWidgetProps {
  businessPhone?: string;
  businessPhoneHref?: string;
}

export default function StickyBookingWidget({ 
  businessPhone = '(604) 849-5329',
  businessPhoneHref = 'tel:+16048495329'
}: StickyBookingWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [slotsLeft, setSlotsLeft] = useState(3); // Mock data - would come from API
  const [showDetails, setShowDetails] = useState(false);

  // Show widget after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate slot countdown (mock)
  useEffect(() => {
    const interval = setInterval(() => {
      setSlotsLeft(prev => {
        if (prev > 0 && Math.random() > 0.7) {
          return prev - 1;
        }
        return prev;
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 hidden md:block">
      <div className="relative">
        {/* Main widget */}
        <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-xl shadow-2xl overflow-hidden min-w-[280px]">
          {/* Header with urgency */}
          <div className="bg-red-500 px-3 py-1 text-center text-xs font-bold animate-pulse">
            🚨 ONLY {slotsLeft} SAME-DAY SLOTS LEFT!
          </div>
          
          {/* Widget content */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">⚡ Get Fixed Today</h3>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-white/80 hover:text-white text-sm"
              >
                {showDetails ? '▲' : '▼'}
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Quick actions */}
              <Link 
                href="/book-online" 
                className="w-full bg-white text-accent-600 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <FaCalendarAlt />
                Book Online Now
              </Link>
              
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href={businessPhoneHref}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                >
                  <FaPhone size={12} />
                  Call Now
                </a>
                <a 
                  href="https://wa.me/16048495329"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1da851] text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                >
                  <FaWhatsapp size={14} />
                  WhatsApp
                </a>
              </div>
            </div>
            
            {/* Expanded details */}
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Same-Day Service:</span>
                    <span className="font-bold">✅ Available</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Free Diagnosis:</span>
                    <span className="font-bold">✅ Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Warranty:</span>
                    <span className="font-bold">🛡️ 90 Days</span>
                  </div>
                  <div className="text-center text-xs text-white/70 mt-2">
                    ⏱️ Avg. repair time: 45 minutes
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-900"
          aria-label="Close booking widget"
        >
          ×
        </button>
      </div>
    </div>
  );
}