import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Disclosure } from '@headlessui/react';
import { AuthContext } from '@/context/AuthContext';
import useAuthNavigation from '@/hooks/useAuthNavigation';
import Image from 'next/image';

// Define navigation items
const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'Services', 
    href: '/services',
    submenu: [
      { name: 'Mobile Repair', href: '/services/mobile-repair' },
      { name: 'Laptop Repair', href: '/services/laptop-repair' },
      { name: 'All Services', href: '/services' }
    ] 
  },
  { name: 'Doorstep Repair', href: '/doorstep-repair' },
  { name: 'Service Areas', href: '/service-areas' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Blog', href: '/blog' }
];

/**
 * Header Component
 * 
 * Main navigation header with responsive design, dropdown menus, and
 * authentication-aware user menu.
 * 
 * IMPROVED: Uses safe authenticated navigation to prevent redirect loops
 */
const Header = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, userProfile, isStateCorrupted, signOut, forceSignOut } = useContext(AuthContext) || {};
  const authNavigation = useAuthNavigation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const handleDropdownToggle = (dropdownName: string) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
      setIsServicesMenuOpen(false);
      setIsUserMenuOpen(false);
    } else {
      setActiveDropdown(dropdownName);
      setIsServicesMenuOpen(dropdownName === 'Services');
      setIsUserMenuOpen(dropdownName === 'User');
    }
  };
  
  const handleSignOut = async () => {
    try {
      if (typeof signOut === 'function') {
        await signOut();
        // Use regular router for homepage navigation (not protected)
        router.push('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleEmergencyReset = async () => {
    try {
      if (typeof forceSignOut === 'function') {
        await forceSignOut();
        window.location.href = '/';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during emergency reset:', error);
      window.location.href = '/';
    }
  };
  
  // Check if a menu item should be highlighted as active
  const isActiveMenuItem = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };
  
  // Check if a submenu item should be highlighted as active
  const isActiveSubmenuItem = (href: string) => {
    return router.pathname === href;
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Services dropdown
      const servicesDropdown = document.querySelector('.services-dropdown');
      if (isServicesMenuOpen && servicesDropdown && !servicesDropdown.contains(event.target as Node)) {
        setIsServicesMenuOpen(false);
        if (activeDropdown === 'Services') {
          setActiveDropdown(null);
        }
      }
      
      // User dropdown
      const userDropdown = document.querySelector('.user-menu');
      if (isUserMenuOpen && userDropdown && !userDropdown.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
        if (activeDropdown === 'User') {
          setActiveDropdown(null);
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isServicesMenuOpen, isUserMenuOpen, activeDropdown]);
  
  // Navigate to profile using safe navigation
  const goToProfile = (event: React.MouseEvent) => {
    event.preventDefault();
    authNavigation.navigateToProfile();
  };
  
  // Navigate to bookings using safe navigation
  const goToBookings = (event: React.MouseEvent) => {
    event.preventDefault();
    authNavigation.navigateToBookings();
  };
  
  // Navigate to warranties using safe navigation
  const goToWarranties = (event: React.MouseEvent) => {
    event.preventDefault();
    authNavigation.navigateToWarranties();
  };
  
  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              {/* Logo and Main Navigation */}
              <div className="flex">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/">
                    <a className="flex items-center">
                      <div className="w-10 h-10 relative mr-2">
                        <Image
                          src="/images/logo/logo-icon.png"
                          alt="The Travelling Technicians"
                          layout="fill"
                          objectFit="contain"
                          priority
                        />
                      </div>
                      <div className="hidden lg:block font-semibold text-gray-900 leading-tight">
                        <span className="block text-sm">The Travelling</span>
                        <span className="block text-lg text-primary-600">Technicians</span>
                      </div>
                    </a>
                  </Link>
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
                  {navigation.map((item) => (
                    !item.submenu ? (
                      <Link key={item.name} href={item.href}>
                        <a
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            isActiveMenuItem(item.href)
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          } transition-colors duration-200`}
                        >
                          {item.name}
                        </a>
                      </Link>
                    ) : (
                      <div key={item.name} className="relative services-dropdown">
                        <button
                          onClick={() => handleDropdownToggle('Services')}
                          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                            isActiveMenuItem(item.href)
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          } transition-colors duration-200`}
                        >
                          {item.name}
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 ml-1 transition-transform duration-300 ${isServicesMenuOpen ? 'rotate-180' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {isServicesMenuOpen && (
                          <div className="absolute z-10 -ml-4 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              {item.submenu.map((subItem) => (
                                <Link key={subItem.name} href={subItem.href}>
                                  <a
                                    className={`block px-4 py-2 text-sm ${
                                      isActiveSubmenuItem(subItem.href)
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                                    }`}
                                    role="menuitem"
                                  >
                                    {subItem.name}
                                  </a>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>
              
              {/* Right Side - Book Online, Account etc. */}
              <div className="flex items-center">
                {/* Book Online Button */}
                <div className="mr-2 sm:mr-4">
                  <Link href="/book-online">
                    <a className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                      Book Online
                    </a>
                  </Link>
                </div>
                
                <div className="ml-4 pl-4 border-l border-gray-200 flex items-center space-x-4">
                  {/* User Account Menu */}
                  {isLoading ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                  ) : isAuthenticated ? (
                    <div className="relative user-menu">
                      <button
                        onClick={() => handleDropdownToggle('User')}
                        className={`flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 focus:outline-none ${isStateCorrupted ? 'account-link' : ''}`}
                      >
                        <span className={`h-8 w-8 rounded-full ${isStateCorrupted ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'} flex items-center justify-center font-semibold`}>
                          {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-4 w-4 ml-1 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="py-1">
                            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                              {userProfile?.email || 'User'}
                              {isStateCorrupted && (
                                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  ⚠️ State Issue
                                </span>
                              )}
                            </div>
                            <a 
                              href="/account/profile"
                              onClick={goToProfile}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 profile-link"
                            >
                              Your Profile
                            </a>
                            <a 
                              href="/account/bookings"
                              onClick={goToBookings}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                            >
                              Your Bookings
                            </a>
                            <a 
                              href="/my-warranties"
                              onClick={goToWarranties}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                            >
                              Your Warranties
                            </a>
                            
                            {/* Emergency Reset Option */}
                            {isStateCorrupted && (
                              <button 
                                onClick={handleEmergencyReset}
                                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 emergency-reset-btn"
                              >
                                🔄 Emergency Reset
                              </button>
                            )}
                            
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                            >
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href="/auth/login">
                      <a className="text-gray-700 hover:text-primary-600 text-sm font-medium">
                        Sign In
                      </a>
                    </Link>
                  )}

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-50 focus:outline-none"
                  >
                    <span className="sr-only">Open main menu</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-6 w-6 ${isOpen ? 'hidden' : 'block'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-6 w-6 ${isOpen ? 'block' : 'hidden'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile menu, show/hide based on menu state */}
          <Disclosure.Panel className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                !item.submenu ? (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActiveMenuItem(item.href)
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                      }`}
                    >
                      {item.name}
                    </a>
                  </Link>
                ) : (
                  <Disclosure key={item.name} as="div" className="space-y-1">
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={`flex justify-between w-full px-3 py-2 text-base font-medium rounded-md ${
                            isActiveMenuItem(item.href)
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                          }`}
                        >
                          <span>{item.name}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`ml-2 h-5 w-5 transform ${
                              open ? 'rotate-180' : 'rotate-0'
                            } transition-transform duration-200`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Disclosure.Button>

                        <Disclosure.Panel className="px-4 pt-2 pb-2 space-y-1">
                          {item.submenu.map((subItem) => (
                            <Link key={subItem.name} href={subItem.href}>
                              <a
                                className={`block pl-3 pr-4 py-2 border-l-2 text-base font-medium transition-colors duration-200 ${
                                  isActiveSubmenuItem(subItem.href)
                                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                }`}
                              >
                                {subItem.name}
                              </a>
                            </Link>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                )
              ))}
            </div>
            
            {/* Account and Book Online in mobile menu */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full ${isStateCorrupted ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'} flex items-center justify-center text-lg font-bold`}>
                        {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {userProfile?.full_name || 'User'}
                        {isStateCorrupted && (
                          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠️
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-500">{userProfile?.email || 'Not available'}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 border-t border-gray-100 pt-2">
                    <a 
                      href="/account/profile"
                      onClick={goToProfile}
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    >
                      Your Profile
                    </a>
                    <a 
                      href="/account/bookings"
                      onClick={goToBookings}
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    >
                      Your Bookings
                    </a>
                    <a 
                      href="/my-warranties"
                      onClick={goToWarranties}
                      className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    >
                      Your Warranties
                    </a>
                    
                    {/* Emergency Reset Option */}
                    {isStateCorrupted && (
                      <button 
                        onClick={handleEmergencyReset}
                        className="w-full text-left block px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 emergency-reset-btn"
                      >
                        🔄 Emergency Reset
                      </button>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 space-y-3">
                  <Link href="/auth/login">
                    <a className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Sign In
                    </a>
                  </Link>
                  <Link href="/book-online">
                    <a className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                      Book Online
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header; 