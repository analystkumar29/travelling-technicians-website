import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FaHome, FaTools, FaMapMarkerAlt, FaBook, FaFileAlt, FaQuestionCircle, FaPhoneAlt, FaCalendarAlt, FaDollarSign, FaShieldAlt, FaSitemap, FaExternalLinkAlt } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';

const SitemapPage: NextPage = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Layout>
      <Head>
        <title>Website Sitemap | The Travelling Technicians</title>
        <meta name="description" content="Complete sitemap of The Travelling Technicians website. Find all our mobile and laptop repair services, service areas, booking information, and resources." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.travelling-technicians.ca/sitemap" />
      </Head>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 text-white py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Website Sitemap
            </h1>
            <p className="text-xl opacity-90">
              Complete navigation guide to all pages on The Travelling Technicians website
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                <FaSitemap className="mr-2" />
                <span className="font-medium">Last Updated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <a 
                href="/sitemap.xml" 
                className="flex items-center bg-white text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaExternalLinkAlt className="mr-2" />
                View XML Sitemap (for search engines)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">About This Sitemap</h2>
            <p className="text-gray-600 mb-4">
              This comprehensive sitemap provides easy access to every page on The Travelling Technicians website. 
              Whether you're looking for specific repair services, booking information, or learning about our doorstep 
              service areas across the Lower Mainland, you'll find it here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-primary-600 font-bold text-lg mb-1">2000+ Pages</div>
                <div className="text-gray-600 text-sm">Dynamic service pages indexed</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-primary-600 font-bold text-lg mb-1">10+ Cities</div>
                <div className="text-gray-600 text-sm">Service areas across Lower Mainland</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-primary-600 font-bold text-lg mb-1">24/7 Updated</div>
                <div className="text-gray-600 text-sm">Automatically refreshed content</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Main Pages */}
            <div>
              {/* Main Navigation */}
              <SectionCard 
                title="Main Navigation" 
                icon={<FaHome className="text-primary-600" />}
                description="Essential pages for getting started"
              >
                <SitemapLink href="/" icon="🏠">Home Page</SitemapLink>
                <SitemapLink href="/book-online" icon="📅">Book Online</SitemapLink>
                <SitemapLink href="/repair" icon="🚗">Doorstep Repair</SitemapLink>
                <SitemapLink href="/pricing" icon="💰">Pricing & Quotes</SitemapLink>
                <SitemapLink href="/service-areas" icon="🗺️">Service Areas</SitemapLink>
                <SitemapLink href="/about" icon="👨‍🔧">About Us</SitemapLink>
                <SitemapLink href="/contact" icon="📞">Contact Us</SitemapLink>
              </SectionCard>

              {/* Repair Services */}
              <SectionCard 
                title="Repair Services" 
                icon={<FaTools className="text-accent-500" />}
                description="Comprehensive repair services for all devices"
              >
                <SitemapLink href="/services/mobile-repair" icon="📱">Mobile Phone Repair</SitemapLink>
                <SitemapLink href="/services/laptop-repair" icon="💻">Laptop Repair</SitemapLink>
                <SitemapLink href="/services/tablet-repair" icon="📱">Tablet Repair</SitemapLink>
                <SitemapLink href="/mobile-screen-repair" icon="🖥️">Mobile Screen Repair</SitemapLink>
                <SitemapLink href="/laptop-screen-repair" icon="💻">Laptop Screen Repair</SitemapLink>
                <SitemapLink href="/mobile-repair-near-me" icon="📍">Mobile Repair Near Me</SitemapLink>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Common Services:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <ServiceTag href="/repair/vancouver/screen-repair">Screen Repair</ServiceTag>
                    <ServiceTag href="/repair/vancouver/battery-replacement">Battery Replacement</ServiceTag>
                    <ServiceTag href="/repair/vancouver/charging-port-repair">Charging Port</ServiceTag>
                    <ServiceTag href="/repair/vancouver/water-damage-repair">Water Damage</ServiceTag>
                    <ServiceTag href="/repair/vancouver/camera-repair">Camera Repair</ServiceTag>
                    <ServiceTag href="/repair/vancouver/speaker-repair">Speaker Repair</ServiceTag>
                  </div>
                </div>
              </SectionCard>

              {/* Information & Resources */}
              <SectionCard 
                title="Information & Resources" 
                icon={<FaFileAlt className="text-blue-500" />}
                description="Helpful resources and information"
              >
                <SitemapLink href="/faq" icon="❓">Frequently Asked Questions</SitemapLink>
                <SitemapLink href="/blog" icon="📝">Blog & Articles</SitemapLink>
                <SitemapLink href="/warranty" icon="🛡️">Warranty Information</SitemapLink>
                <SitemapLink href="/repair-process" icon="⚙️">Our Repair Process</SitemapLink>
                <SitemapLink href="/technicians" icon="👨‍🔧">Our Technicians</SitemapLink>
                <SitemapLink href="/quality-parts" icon="🔧">Quality Parts We Use</SitemapLink>
              </SectionCard>
            </div>

            {/* Right Column - Dynamic Content */}
            <div>
              {/* Service Areas */}
              <SectionCard 
                title="Service Areas" 
                icon={<FaMapMarkerAlt className="text-red-500" />}
                description="Cities we serve across Lower Mainland"
              >
                <div className="grid grid-cols-2 gap-3">
                  <CityLink href="/repair/vancouver">Vancouver</CityLink>
                  <CityLink href="/repair/burnaby">Burnaby</CityLink>
                  <CityLink href="/repair/richmond">Richmond</CityLink>
                  <CityLink href="/repair/surrey">Surrey</CityLink>
                  <CityLink href="/repair/coquitlam">Coquitlam</CityLink>
                  <CityLink href="/repair/north-vancouver">North Vancouver</CityLink>
                  <CityLink href="/repair/west-vancouver">West Vancouver</CityLink>
                  <CityLink href="/repair/new-westminster">New Westminster</CityLink>
                  <CityLink href="/repair/delta">Delta</CityLink>
                  <CityLink href="/repair/langley">Langley</CityLink>
                  <CityLink href="/repair/chilliwack">Chilliwack</CityLink>
                  <CityLink href="/locations">All Locations</CityLink>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Neighborhood Services:</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    We serve specific neighborhoods within each city. Visit our location pages for detailed neighborhood coverage.
                  </p>
                  <a href="/locations" className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center">
                    Explore Neighborhoods <FaExternalLinkAlt className="ml-1 text-xs" />
                  </a>
                </div>
              </SectionCard>

              {/* Blog & Articles */}
              <SectionCard 
                title="Blog & Articles" 
                icon={<FaBook className="text-green-500" />}
                description="Latest repair tips and technology insights"
              >
                <SitemapLink href="/blog" icon="📚">All Blog Posts</SitemapLink>
                <SitemapLink href="/blog/how-to-extend-your-laptop-battery-life" icon="🔋">Extend Laptop Battery Life</SitemapLink>
                <SitemapLink href="/blog/signs-your-phone-needs-repair" icon="⚠️">Signs Your Phone Needs Repair</SitemapLink>
                <SitemapLink href="/blog/ultimate-guide-to-screen-protection" icon="🛡️">Screen Protection Guide</SitemapLink>
                <SitemapLink href="/blog/water-damage-first-aid-for-devices" icon="💧">Water Damage First Aid</SitemapLink>
                <SitemapLink href="/blog/category/mobile-repair-tips" icon="📱">Mobile Repair Tips</SitemapLink>
                <SitemapLink href="/blog/category/laptop-maintenance" icon="💻">Laptop Maintenance</SitemapLink>
                <SitemapLink href="/blog/category/device-protection" icon="🛡️">Device Protection</SitemapLink>
              </SectionCard>

              {/* Legal & Administrative */}
              <SectionCard 
                title="Legal & Administrative" 
                icon={<FaShieldAlt className="text-purple-500" />}
                description="Important legal documents and policies"
              >
                <SitemapLink href="/privacy-policy" icon="🔒">Privacy Policy</SitemapLink>
                <SitemapLink href="/terms-conditions" icon="📄">Terms & Conditions</SitemapLink>
                <SitemapLink href="/cookie-policy" icon="🍪">Cookie Policy</SitemapLink>
                <SitemapLink href="/accessibility" icon="♿">Accessibility Statement</SitemapLink>
                <SitemapLink href="/sitemap.xml" icon="🗺️">XML Sitemap</SitemapLink>
                <SitemapLink href="/robots.txt" icon="🤖">Robots.txt</SitemapLink>
              </SectionCard>

              {/* Dynamic Pages Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                  <FaExternalLinkAlt className="mr-2" />
                  Dynamic Content Pages
                </h3>
                <p className="text-blue-700 text-sm mb-3">
                  Our website includes thousands of dynamically generated pages for specific device models, 
                  services, and locations. These are automatically included in our XML sitemap for search engines.
                </p>
                <div className="text-sm text-blue-600">
                  <div className="font-medium mb-1">Examples include:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>City-specific service pages (e.g., /repair/vancouver/screen-repair)</li>
                    <li>Device model repair pages (e.g., /repair/vancouver/screen-repair/iphone-14)</li>
                    <li>Neighborhood service pages</li>
                    <li>Dynamic pricing pages</li>
                  </ul>
                </div>
                <a 
                  href="/sitemap.xml" 
                  className="mt-3 inline-flex items-center text-blue-700 hover:text-blue-900 font-medium text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View complete XML sitemap for all dynamic pages
                  <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </div>
            </div>
          </div>

          {/* SEO Note */}
          <div className="mt-12 bg-gray-800 text-white rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <FaSitemap className="mr-2" />
              SEO & Search Engine Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-primary-300 mb-2">For Search Engines:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>XML sitemap automatically updated daily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Proper lastmod, changefreq, and priority tags</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>All pages follow SEO best practices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Structured data markup on all pages</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary-300 mb-2">For Website Visitors:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">🔍</span>
                    <span>Easy navigation to all content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">🚗</span>
                    <span>Find local repair services quickly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">📱</span>
                    <span>Access device-specific repair information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">💡</span>
                    <span>Learn from our repair tips and guides</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Contact us directly for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
              >
                <FaPhoneAlt className="mr-2" />
                Contact Support
              </Link>
              <Link 
                href="/book-online" 
                className="px-6 py-3 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors inline-flex items-center justify-center"
              >
                <FaCalendarAlt className="mr-2" />
                Book Repair Online
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Reusable Components
interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, description, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start mb-4">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

interface SitemapLinkProps {
  href: string;
  icon: string;
  children: React.ReactNode;
}

const SitemapLink: React.FC<SitemapLinkProps> = ({ href, icon, children }) => {
  return (
    <Link 
      href={href} 
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-gray-100"
    >
      <span className="text-xl mr-3">{icon}</span>
      <span className="text-gray-700 group-hover:text-primary-600 transition-colors">{children}</span>
      <FaExternalLinkAlt className="ml-auto text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
};

interface ServiceTagProps {
  href: string;
  children: React.ReactNode;
}

const ServiceTag: React.FC<ServiceTagProps> = ({ href, children }) => {
  return (
    <Link 
      href={href}
      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md transition-colors text-center"
    >
      {children}
    </Link>
  );
};

interface CityLinkProps {
  href: string;
  children: React.ReactNode;
}

const CityLink: React.FC<CityLinkProps> = ({ href, children }) => {
  return (
    <Link 
      href={href}
      className="flex items-center justify-center p-3 bg-gray-50 hover:bg-primary-50 border border-gray-200 rounded-lg transition-colors group"
    >
      <FaMapMarkerAlt className="text-red-400 mr-2 text-sm" />
      <span className="text-gray-700 group-hover:text-primary-700 font-medium">{children}</span>
    </Link>
  );
};

export default SitemapPage;
