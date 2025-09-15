import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Disclosure } from '@headlessui/react';
import { LogoImage } from '@/components/common/OptimizedImage';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';

/**
 * Header Component
 * 
 * Main navigation header with responsive design and dropdown menus
 */
const Header = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if a menu item should be highlighted as active
  const isActiveMenuItem = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };
  
  return (
    <nav className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-20 h-20 relative mr-2 overflow-hidden">
                <LogoImage
                  src="/images/logo/logo-orange-optimized.webp"
                  alt="Travelling Technicians Logo"
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <div className="font-semibold text-white leading-tight">
                <span className="block text-lg">Travelling</span>
                <span className="block text-lg text-accent-400">Technicians</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link 
              href="/" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                isActiveMenuItem('/') 
                  ? 'text-accent-400' 
                  : 'text-white hover:text-accent-400'
              }`}
            >
              Home
            </Link>
            
            {/* Services Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-white hover:text-accent-400 transition-colors duration-300">
                Services
                <FaChevronDown className="ml-1 h-3 w-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-2">
                  <Link href="/services/mobile-repair" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    Mobile Repair
                  </Link>
                  <Link href="/services/laptop-repair" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    Laptop Repair
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link href="/doorstep-repair" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    Doorstep Service
                  </Link>
                </div>
              </div>
            </div>

            {/* City Locations Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-white hover:text-accent-400 transition-colors duration-300">
                Locations
                <FaChevronDown className="ml-1 h-3 w-3" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Repair Services By City
                  </div>
                  <Link href="/repair/vancouver" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    Vancouver Repair
                  </Link>
                  <Link href="/repair/burnaby" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    Burnaby Repair
                  </Link>
                  <Link href="/repair/richmond" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    Richmond Repair
                  </Link>
                  <Link href="/repair/new-westminster" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    New Westminster Repair
                  </Link>
                  <Link href="/repair/north-vancouver" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    North Vancouver Repair
                  </Link>
                  <Link href="/repair/west-vancouver" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    West Vancouver Repair
                  </Link>
                  <Link href="/repair/coquitlam" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    Coquitlam Repair
                  </Link>
                  <Link href="/repair/chilliwack" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    Chilliwack Repair
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link href="/service-areas" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 text-sm transition-colors">
                    View All Service Areas
                  </Link>
                </div>
              </div>
            </div>

            <Link 
              href="/service-areas" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                isActiveMenuItem('/service-areas') 
                  ? 'text-accent-400' 
                  : 'text-white hover:text-accent-400'
              }`}
            >
              Service Areas
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                isActiveMenuItem('/about') 
                  ? 'text-accent-400' 
                  : 'text-white hover:text-accent-400'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                isActiveMenuItem('/contact') 
                  ? 'text-accent-400' 
                  : 'text-white hover:text-accent-400'
              }`}
            >
              Contact
            </Link>
            <Link 
              href="/blog" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                isActiveMenuItem('/blog') 
                  ? 'text-accent-400' 
                  : 'text-white hover:text-accent-400'
              }`}
            >
              Blog
            </Link>
            
            {/* CTA Button */}
            <Link href="/book-online" className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-300">
              Book Repair
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-accent-400 focus:outline-none focus:text-accent-400 transition-colors duration-300"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-primary-600">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                  isActiveMenuItem('/') 
                    ? 'text-accent-400 bg-primary-800' 
                    : 'text-white hover:text-accent-400 hover:bg-primary-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {/* Mobile Services */}
              <div className="px-3 py-2">
                <div className="text-gray-300 text-sm font-semibold mb-2">Services</div>
                <Link 
                  href="/services/mobile-repair" 
                  className="block px-3 py-1 text-white hover:text-accent-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mobile Repair
                </Link>
                <Link 
                  href="/services/laptop-repair" 
                  className="block px-3 py-1 text-white hover:text-accent-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Laptop Repair
                </Link>
                <Link 
                  href="/doorstep-repair" 
                  className="block px-3 py-1 text-white hover:text-accent-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Doorstep Service
                </Link>
              </div>

              {/* Mobile Locations */}
              <div className="px-3 py-2">
                <div className="text-gray-300 text-sm font-semibold mb-2">Locations</div>
                <Link 
                  href="/repair/vancouver" 
                  className="block px-3 py-1 text-white hover:text-accent-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Vancouver
                </Link>
                <Link 
                  href="/repair/burnaby" 
                  className="block px-3 py-1 text-white hover:text-accent-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Burnaby
                </Link>
                <Link 
                  href="/repair/richmond" 
                  className="block px-3 py-1 text-white hover:text-accent-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Richmond
                </Link>
                <Link 
                  href="/service-areas" 
                  className="block px-3 py-1 text-accent-400 hover:text-accent-300 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  View All Areas
                </Link>
              </div>
              
              <Link 
                href="/service-areas" 
                className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                  isActiveMenuItem('/service-areas') 
                    ? 'text-accent-400 bg-primary-800' 
                    : 'text-white hover:text-accent-400 hover:bg-primary-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Service Areas
              </Link>
              <Link 
                href="/about" 
                className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                  isActiveMenuItem('/about') 
                    ? 'text-accent-400 bg-primary-800' 
                    : 'text-white hover:text-accent-400 hover:bg-primary-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                  isActiveMenuItem('/contact') 
                    ? 'text-accent-400 bg-primary-800' 
                    : 'text-white hover:text-accent-400 hover:bg-primary-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/blog" 
                className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                  isActiveMenuItem('/blog') 
                    ? 'text-accent-400 bg-primary-800' 
                    : 'text-white hover:text-accent-400 hover:bg-primary-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              
              {/* Mobile CTA */}
              <div className="px-3 py-4">
                <Link 
                  href="/book-online" 
                  className="block w-full text-center bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Repair
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header; 