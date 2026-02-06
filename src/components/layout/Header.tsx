import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoImage } from '@/components/common/OptimizedImage';
import { ChevronDown, Menu, X } from 'lucide-react';

const Header = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  const isActiveMenuItem = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    `px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActiveMenuItem(href)
        ? 'text-accent-600'
        : 'text-primary-700 hover:text-accent-600'
    }`;

  const mobileNavLinkClass = (href: string) =>
    `block px-3 py-2.5 text-base font-medium transition-colors duration-200 rounded-md ${
      isActiveMenuItem(href)
        ? 'text-accent-600 bg-primary-50'
        : 'text-primary-700 hover:text-accent-600 hover:bg-primary-50'
    }`;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-primary-100'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-16 h-16 relative mr-2 overflow-hidden">
                <LogoImage
                  src="/images/logo/logo-orange-optimized.webp"
                  alt="Travelling Technicians Logo"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div className="font-heading font-bold leading-tight">
                <span className="block text-lg text-primary-800">Travelling</span>
                <span className="block text-lg text-accent-600">Technicians</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            <Link href="/" className={navLinkClass('/')}>Home</Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-primary-700 hover:text-accent-600 transition-colors duration-200">
                Services
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-primary-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1.5">
                  <Link href="/services/mobile-repair" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">
                    Mobile Repair
                  </Link>
                  <Link href="/services/laptop-repair" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">
                    Laptop Repair
                  </Link>
                  <Link href="/services/tablet-repair" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">
                    Tablet Repair
                  </Link>
                  <div className="border-t border-primary-100 my-1" />
                  <Link href="/repair" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">
                    Doorstep Service
                  </Link>
                </div>
              </div>
            </div>

            {/* Locations Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-primary-700 hover:text-accent-600 transition-colors duration-200">
                Locations
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-primary-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1.5">
                  <div className="px-4 py-2 text-xs font-semibold text-primary-400 uppercase tracking-wide">
                    Repair Services By City
                  </div>
                  <Link href="/repair/vancouver" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">Vancouver Repair</Link>
                  <Link href="/repair/burnaby" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">Burnaby Repair</Link>
                  <Link href="/repair/richmond" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">Richmond Repair</Link>
                  <Link href="/repair/new-westminster" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">New Westminster Repair</Link>
                  <Link href="/repair/north-vancouver" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">North Vancouver Repair</Link>
                  <Link href="/repair/west-vancouver" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">West Vancouver Repair</Link>
                  <Link href="/repair/coquitlam" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">Coquitlam Repair</Link>
                  <Link href="/repair/chilliwack" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">Chilliwack Repair</Link>
                  <div className="border-t border-primary-100 my-1" />
                  <Link href="/service-areas" className="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors">View All Service Areas</Link>
                </div>
              </div>
            </div>

            <Link href="/service-areas" className={navLinkClass('/service-areas')}>Service Areas</Link>
            <Link href="/about" className={navLinkClass('/about')}>About</Link>
            <Link href="/contact" className={navLinkClass('/contact')}>Contact</Link>
            <Link href="/blog" className={navLinkClass('/blog')}>Blog</Link>

            {/* CTA Button */}
            <Link
              href="/book-online"
              className="ml-4 bg-primary-800 hover:bg-primary-900 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
            >
              Book Repair
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-primary-700 hover:text-accent-600 focus:outline-none transition-colors duration-200 p-2"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t border-primary-100"
            >
              <div className="px-2 pt-2 pb-4 space-y-1">
                <Link href="/" className={mobileNavLinkClass('/')}>Home</Link>

                {/* Mobile Services */}
                <div className="px-3 py-2">
                  <div className="text-primary-400 text-xs font-semibold uppercase tracking-wide mb-2">Services</div>
                  <Link href="/services/mobile-repair" className="block px-3 py-1.5 text-primary-600 hover:text-accent-600 transition-colors text-sm">
                    Mobile Repair
                  </Link>
                  <Link href="/services/laptop-repair" className="block px-3 py-1.5 text-primary-600 hover:text-accent-600 transition-colors text-sm">
                    Laptop Repair
                  </Link>
                  <Link href="/services/tablet-repair" className="block px-3 py-1.5 text-primary-600 hover:text-accent-600 transition-colors text-sm">
                    Tablet Repair
                  </Link>
                  <Link href="/repair" className="block px-3 py-1.5 text-primary-600 hover:text-accent-600 transition-colors text-sm">
                    Doorstep Service
                  </Link>
                </div>

                {/* Mobile Locations */}
                <div className="px-3 py-2">
                  <div className="text-primary-400 text-xs font-semibold uppercase tracking-wide mb-2">Locations</div>
                  <Link href="/repair/vancouver" className="block px-3 py-1.5 text-primary-600 hover:text-accent-600 transition-colors text-sm">Vancouver</Link>
                  <Link href="/repair/burnaby" className="block px-3 py-1.5 text-primary-600 hover:text-accent-600 transition-colors text-sm">Burnaby</Link>
                  <Link href="/repair/richmond" className="block px-3 py-1.5 text-primary-600 hover:text-accent-600 transition-colors text-sm">Richmond</Link>
                  <Link href="/service-areas" className="block px-3 py-1.5 text-accent-600 hover:text-accent-700 transition-colors text-sm font-medium">View All Areas</Link>
                </div>

                <Link href="/service-areas" className={mobileNavLinkClass('/service-areas')}>Service Areas</Link>
                <Link href="/about" className={mobileNavLinkClass('/about')}>About</Link>
                <Link href="/contact" className={mobileNavLinkClass('/contact')}>Contact</Link>
                <Link href="/blog" className={mobileNavLinkClass('/blog')}>Blog</Link>

                {/* Mobile CTA */}
                <div className="px-3 pt-3">
                  <Link
                    href="/book-online"
                    className="block w-full text-center bg-primary-800 hover:bg-primary-900 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Book Repair
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Header;
