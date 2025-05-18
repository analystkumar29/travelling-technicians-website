import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  
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
    } else if (dropdownName === 'More') {
      setIsMoreOpen(!isMoreOpen);
      if (isServicesOpen) setIsServicesOpen(false);
    }
  };

  return (
    <Disclosure as="nav" className={`bg-white bg-opacity-95 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md py-1' : 'py-2'}`}>
      {({ open }) => (
        <>
          <div className="container-custom">
            <div className="flex justify-between items-center h-20">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center">
                  {/* Logo with text beside it */}
                  <div className="flex items-center">
                    <div className="w-auto h-12 relative mr-3">
                      {/* Direct inline SVG logo for guaranteed display */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="110" height="40" viewBox="0 0 110 40" className="h-full w-auto">
                        <rect x="5" y="8" width="24" height="24" rx="4" fill="#0d9488"/>
                        <text x="37" y="24" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#1e293b">TT</text>
                        <path d="M5 32 H 35" stroke="#1e293b" strokeWidth="2.5"/>
                        <circle cx="5" cy="8" r="3" fill="#f97316"/>
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-primary-600 hidden md:block">
                      The Travelling Technicians
                    </span>
                  </div>
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
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActivePath(item.href) 
                            ? 'text-primary-600 bg-gray-50' 
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        } ${item.highlight ? 'bg-accent-500 text-white hover:bg-accent-600 hover:text-white font-medium shadow-sm hover:shadow-md transition-all duration-300' : ''}`}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <div key={item.name} className="relative">
                        <button
                          onClick={() => handleDropdownToggle(item.name)}
                          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            isAnySubmenuActive(item.submenu) 
                              ? 'text-primary-600 bg-gray-50' 
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`}
                        >
                          {item.name}
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 ml-1" 
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
                          <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`block px-4 py-2 text-sm ${
                                    isActiveSubmenuItem(subItem.href) 
                                      ? 'text-primary-600 bg-gray-50' 
                                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    if (item.name === 'Services') setIsServicesOpen(false);
                                    if (item.name === 'More') setIsMoreOpen(false);
                                  }}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  ))}
                </div>
                <div className="ml-4 pl-4 border-l border-gray-200">
                  <Link 
                    href="/book-online/"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-1px]"
                  >
                    Book Online
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

          {/* Mobile Menu - Update to include the "More" submenu items */}
          <Disclosure.Panel className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1.5 bg-white border-t border-gray-100 rounded-b-lg shadow-lg">
              {/* Home and first level items */}
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/') 
                    ? 'text-primary-600 bg-gray-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              
              {/* Services Dropdown */}
              <Disclosure as="div" className="space-y-1.5">
                {({ open }) => (
                  <>
                    <Disclosure.Button
                      className={`flex w-full items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                        isAnySubmenuActive(navigation[1].submenu) 
                          ? 'text-primary-600 bg-gray-50' 
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>Services</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${open ? 'transform rotate-180' : ''} h-5 w-5`}
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
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 py-2 space-y-1.5">
                      {navigation[1]?.submenu?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-3 py-2 rounded-md text-sm font-medium ${
                            isActiveSubmenuItem(subItem.href) 
                              ? 'text-primary-600 bg-gray-50' 
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
              
              {/* Doorstep Repair */}
              <Link
                href="/doorstep"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-accent-500 hover:bg-accent-600 shadow-sm hover:shadow-md transition-all duration-300"
              >
                Doorstep Repair
              </Link>
              
              {/* Pricing */}
              <Link
                href="/pricing"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/pricing') 
                    ? 'text-primary-600 bg-gray-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Pricing
              </Link>
              
              {/* About Us */}
              <Link
                href="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/about') 
                    ? 'text-primary-600 bg-gray-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                About Us
              </Link>
              
              {/* Service Areas */}
              <Link
                href="/service-areas"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/service-areas') 
                    ? 'text-primary-600 bg-gray-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Service Areas
              </Link>
              
              {/* FAQ */}
              <Link
                href="/faq"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/faq') 
                    ? 'text-primary-600 bg-gray-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                FAQ
              </Link>
              
              {/* Blog */}
              <Link
                href="/blog"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/blog') 
                    ? 'text-primary-600 bg-gray-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Blog
              </Link>
              
              {/* Contact */}
              <Link
                href="/contact"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/contact') 
                    ? 'text-primary-600 bg-gray-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Contact
              </Link>
              
              <div className="pt-3 mt-4 border-t border-gray-200">
                <Link 
                  href="/book-online"
                  className="w-full block px-3 py-2 rounded-md text-center text-base font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  Book Online
                </Link>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 