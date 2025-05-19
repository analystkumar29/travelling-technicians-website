import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

// Updated navigation with some items potentially moved to a "More" dropdown
const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'Services', 
    href: '#',
    submenu: [
      { name: 'Mobile Phone Repair', href: '/services/mobile' },
      { name: 'Laptop & Computer Repair', href: '/services/laptop' },
    ],
  },
  { name: 'Doorstep Repair', href: '/doorstep', highlight: true },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About Us', href: '/about' },
  { 
    name: 'More',
    href: '#',
    submenu: [
      { name: 'Service Areas', href: '/service-areas' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ]
  }
];

export default function Header() {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading, userProfile, signOut, isStateCorrupted, forceSignOut } = useAuth();
  
  // Add scroll effect to header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Add class to body when auth state is corrupted
  useEffect(() => {
    // Skip applying auth corruption class on the homepage
    const isHomepage = router.pathname === '/';
    
    if (isStateCorrupted && !isHomepage) {
      document.body.classList.add('auth-corrupted');
    } else {
      document.body.classList.remove('auth-corrupted');
    }
  }, [isStateCorrupted, router.pathname]);
  
  // Function to check if the current path matches the navigation item
  const isActivePath = (path: string): boolean => {
    if (path === '/') {
      return router.pathname === path;
    }
    return router.pathname.startsWith(path);
  };

  // Function to check if a submenu item is active
  const isActiveSubmenuItem = (path: string): boolean => {
    return router.pathname === path;
  };

  // Function to check if any submenu item is active
  const isAnySubmenuActive = (submenu: {name: string, href: string}[] | undefined): boolean => {
    return submenu ? submenu.some(subItem => isActiveSubmenuItem(subItem.href)) : false;
  };

  // Handle dropdown toggles
  const handleDropdownToggle = (dropdownName: string) => {
    if (dropdownName === 'Services') {
      setIsServicesOpen(!isServicesOpen);
      if (isMoreOpen) setIsMoreOpen(false);
      if (isUserMenuOpen) setIsUserMenuOpen(false);
    } else if (dropdownName === 'More') {
      setIsMoreOpen(!isMoreOpen);
      if (isServicesOpen) setIsServicesOpen(false);
      if (isUserMenuOpen) setIsUserMenuOpen(false);
    } else if (dropdownName === 'User') {
      setIsUserMenuOpen(!isUserMenuOpen);
      if (isServicesOpen) setIsServicesOpen(false);
      if (isMoreOpen) setIsMoreOpen(false);
    }
  };

  // Handle emergency reset
  const handleEmergencyReset = async () => {
    // Close user menu
    setIsUserMenuOpen(false);
    
    // Show confirmation before proceeding
    if (confirm('This will reset your authentication state and log you out. Continue?')) {
      try {
        await forceSignOut();
      } catch (error) {
        console.error('Error during emergency reset:', error);
        // Force reload as a fallback
        window.location.href = '/';
      }
    }
  };

  // Handle sign out
  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
  };

  return (
    <Disclosure as="nav" className={`bg-white bg-opacity-90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg py-1' : 'py-2'}`}>
      {({ open }) => (
        <>
          <div className="container-custom">
            <div className="flex justify-between items-center h-20">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <a className="flex items-center logo">
                    {/* Logo with integrated text */}
                    <div className="h-10 md:h-12 w-auto relative transition-all duration-300 ease-in-out hover:scale-105">
                      <Image 
                        src="/images/logo/tt-logo-rect.svg" 
                        alt="The Travelling Technicians Logo" 
                        width={370}
                        height={60}
                        layout="intrinsic"
                        className="h-full w-auto"
                        priority
                      />
                    </div>
                  </a>
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex lg:items-center lg:justify-end lg:flex-1">
                <div className="flex space-x-3">
                  {navigation.map((item) => (
                    !item.submenu ? (
                      <Link 
                        key={item.name}
                        href={item.href}
                      >
                        <a className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 nav-link ${
                          isActivePath(item.href) 
                            ? 'text-primary-600 bg-gray-50 shadow-sm' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 hover:shadow-sm'
                          } ${item.highlight ? 'doorstep-repair-button nav-item-doorstep-repair' : 'nav-item-hover'}`}
                        >
                          {item.name}
                        </a>
                      </Link>
                    ) : (
                      <div key={item.name} className="relative">
                        <button
                          onClick={() => handleDropdownToggle(item.name)}
                          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 menu-item ${
                            isAnySubmenuActive(item.submenu) 
                              ? 'text-primary-600 bg-gray-50 shadow-sm' 
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                        >
                          {item.name}
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 ml-1 transition-transform duration-300 ${
                              (item.name === 'Services' && isServicesOpen) || 
                              (item.name === 'More' && isMoreOpen) ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 9l-7 7-7-7" 
                            />
                          </svg>
                        </button>

                        {(item.name === 'Services' && isServicesOpen) || 
                         (item.name === 'More' && isMoreOpen) ? (
                          <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 ease-out opacity-100 scale-100 origin-top-left submenu-animation">
                            <div className="py-1">
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                >
                                  <a 
                                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                      isActiveSubmenuItem(subItem.href) 
                                        ? 'text-primary-600 bg-gray-50 font-medium' 
                                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      if (item.name === 'Services') setIsServicesOpen(false);
                                      if (item.name === 'More') setIsMoreOpen(false);
                                    }}
                                  >
                                    {subItem.name}
                                  </a>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  ))}
                </div>

                {/* Account and Book Online buttons */}
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
                            <Link href="/account/profile">
                              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 profile-link">
                                Your Profile
                              </a>
                            </Link>
                            <Link href="/account/bookings">
                              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                                Your Bookings
                              </a>
                            </Link>
                            <Link href="/my-warranties">
                              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                                Your Warranties
                              </a>
                            </Link>
                            
                            {/* Emergency Reset Option */}
                            {isStateCorrupted && (
                              <button 
                                onClick={handleEmergencyReset}
                                className="w-full text-left block px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 emergency-reset-btn"
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
                      <a className="text-gray-700 hover:text-primary-600 font-medium">
                        Sign In
                      </a>
                    </Link>
                  )}

                  {/* Book Now Button */}
                  <Link href="/book-online">
                    <a className="btn-primary shadow-md transform hover:scale-105 transition duration-300">
                      Book Online
                    </a>
                  </Link>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center lg:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="lg:hidden bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                !item.submenu ? (
                  <Link key={item.name} href={item.href}>
                    <a className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActivePath(item.href) 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    } ${item.highlight ? 'border-l-4 border-primary-500 pl-2' : ''}`}>
                      {item.name}
                    </a>
                  </Link>
                ) : (
                  <Disclosure key={item.name} as="div" className="space-y-1">
                    {({ open }) => (
                      <>
                        <Disclosure.Button
                          className={`flex justify-between w-full px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                            isAnySubmenuActive(item.submenu)
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                          }`}
                        >
                          {item.name}
                          <svg
                            className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
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
                    <Link href="/account/profile">
                      <a className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        Your Profile
                      </a>
                    </Link>
                    <Link href="/account/bookings">
                      <a className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        Your Bookings
                      </a>
                    </Link>
                    <Link href="/my-warranties">
                      <a className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        Your Warranties
                      </a>
                    </Link>
                    
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
                <div className="flex flex-col space-y-3 px-4">
                  <Link href="/auth/login">
                    <a className="text-primary-600 font-medium hover:text-primary-700">
                      Sign In
                    </a>
                  </Link>
                </div>
              )}
              
              <div className="mt-4 px-4">
                <Link href="/book-online">
                  <a className="w-full block text-center btn-primary shadow-md">
                    Book Online
                  </a>
                </Link>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 