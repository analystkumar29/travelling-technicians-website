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
  const { isAuthenticated, isLoading, userProfile, signOut } = useAuth();
  
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

  return (
    <Disclosure as="nav" className={`bg-white bg-opacity-90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg py-1' : 'py-2'}`}>
      {({ open }) => (
        <>
          <div className="container-custom">
            <div className="flex justify-between items-center h-20">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <a className="flex items-center">
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
                        <a className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
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
                          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
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
                    <div className="relative">
                      <button
                        onClick={() => handleDropdownToggle('User')}
                        className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 focus:outline-none"
                      >
                        <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
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
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                              {userProfile?.email}
                            </div>
                            <Link href="/account/profile">
                              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
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
                            <button 
                              onClick={signOut}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                            >
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Link href="/auth/login">
                        <a className="text-sm font-medium text-gray-700 hover:text-primary-600">
                          Sign In
                        </a>
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link href="/auth/register">
                        <a className="text-sm font-medium text-gray-700 hover:text-primary-600">
                          Register
                        </a>
                      </Link>
                    </div>
                  )}

                  {/* Book Online button */}
                  <Link href="/book-online/">
                    <a className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white shadow-sm transition-all duration-300 hover:bg-primary-700 hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0">
                      Book Online
                    </a>
                  </Link>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center lg:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200">
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

          {/* Mobile Menu - Update to include the "More" submenu items and user account */}
          <Disclosure.Panel className="lg:hidden">
            <div className="px-3 pt-3 pb-4 space-y-2 bg-white border-t border-gray-100 rounded-b-lg shadow-xl">
              {/* User account section for mobile */}
              {isAuthenticated ? (
                <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg">
                      {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">{userProfile?.full_name}</p>
                      <p className="text-xs text-gray-500">{userProfile?.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link href="/account/profile">
                      <a className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        Your Profile
                      </a>
                    </Link>
                    <Link href="/account/bookings">
                      <a className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        Your Bookings
                      </a>
                    </Link>
                    <Link href="/my-warranties">
                      <a className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        Your Warranties
                      </a>
                    </Link>
                    <button 
                      onClick={signOut}
                      className="w-full text-left block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mb-3">
                  <Link href="/auth/login">
                    <a className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Sign In
                    </a>
                  </Link>
                  <Link href="/auth/register">
                    <a className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Register
                    </a>
                  </Link>
                </div>
              )}

              {/* Home and first level items */}
              <Link href="/">
                <a
                  className={`block px-4 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath('/') 
                      ? 'text-primary-600 bg-gray-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </a>
              </Link>
              
              {/* Services Dropdown */}
              <Disclosure as="div" className="space-y-1.5">
                {({ open }) => (
                  <>
                    <Disclosure.Button
                      className={`flex w-full items-center justify-between px-4 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
                        isAnySubmenuActive(navigation[1].submenu) 
                          ? 'text-primary-600 bg-gray-50' 
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      Services
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </Disclosure.Button>
                    <Disclosure.Panel className="pl-4 pr-2">
                      {navigation[1].submenu?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                        >
                          <a
                            className={`block px-4 py-2.5 rounded-md text-sm transition-colors duration-200 ${
                              isActiveSubmenuItem(subItem.href) 
                                ? 'text-primary-600 bg-gray-50 font-medium' 
                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
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
              
              {/* Doorstep Repair - With highlight styling */}
              <Link href="/doorstep">
                <a
                  className={`block px-4 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath('/doorstep') 
                      ? 'text-primary-600 bg-gray-50' 
                      : 'doorstep-repair-button'
                  }`}
                >
                  Doorstep Repair
                </a>
              </Link>
              
              {/* Other first-level items */}
              <Link href="/pricing">
                <a
                  className={`block px-4 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath('/pricing') 
                      ? 'text-primary-600 bg-gray-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Pricing
                </a>
              </Link>
              
              <Link href="/about">
                <a
                  className={`block px-4 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath('/about') 
                      ? 'text-primary-600 bg-gray-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  About Us
                </a>
              </Link>
              
              {/* More Dropdown */}
              <Disclosure as="div" className="space-y-1.5">
                {({ open }) => (
                  <>
                    <Disclosure.Button
                      className={`flex w-full items-center justify-between px-4 py-2.5 rounded-md text-base font-medium transition-colors duration-200 ${
                        isAnySubmenuActive(navigation[5].submenu) 
                          ? 'text-primary-600 bg-gray-50' 
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      More
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </Disclosure.Button>
                    <Disclosure.Panel className="pl-4 pr-2">
                      {navigation[5].submenu?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                        >
                          <a
                            className={`block px-4 py-2.5 rounded-md text-sm transition-colors duration-200 ${
                              isActiveSubmenuItem(subItem.href) 
                                ? 'text-primary-600 bg-gray-50 font-medium' 
                                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
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
              
              {/* Book Online CTA */}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <Link href="/book-online">
                  <a className="block w-full px-4 py-3 text-center rounded-md text-base font-medium bg-primary-600 text-white shadow-sm transition-all duration-300 hover:bg-primary-700 hover:shadow-md">
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