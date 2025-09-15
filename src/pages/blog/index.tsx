import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import Head from 'next/head';
import { FaCalendarAlt, FaUser, FaTag, FaClock } from 'react-icons/fa';
import { LazyImage } from '@/components/common/OptimizedImage';

// Blog post data
const blogPosts = [
  {
    id: 'signs-phone-needs-repair',
    slug: 'signs-your-phone-needs-repair',
    title: 'Signs Your Phone Needs Repair',
    excerpt: 'Learn to recognize the warning signs that indicate your phone needs professional repair.',
    date: '2024-03-15',
    author: 'Alex Chen',
    category: 'Phone Repair',
    readTime: '5 min read',
    image: '/images/blog/phone-repair-signs.jpg',
    featured: true
  },
  {
    id: 'extend-laptop-battery',
    slug: 'how-to-extend-your-laptop-battery-life',
    title: 'How to Extend Your Laptop Battery Life',
    excerpt: 'Essential tips and tricks to maximize your laptop battery performance.',
    date: '2024-03-10',
    author: 'Sarah Johnson',
    category: 'Laptop Repair',
    readTime: '7 min read',
    image: '/images/blog/laptop-battery.jpg',
    featured: true
  },
  {
    id: 'water-damage-rescue',
    slug: 'water-damage-first-aid-for-devices',
    title: 'Water Damage First Aid for Your Devices',
    excerpt: 'Quick steps to take when your device gets wet - emergency response that can save your phone or laptop.',
    date: '2024-03-05',
    author: 'Michael Tran',
    category: 'Emergency Repair',
    readTime: '6 min read',
    image: '/images/blog/water-damage-repair.jpg',
    featured: false
  },
  {
    id: 'worth-repair-replace',
    slug: 'repair-or-replace-making-the-right-decision',
    title: 'Why Choose Doorstep Repair Services',
    excerpt: 'Discover the benefits of professional doorstep repair services.',
    date: '2024-03-01',
    author: 'Jamie Garcia',
    category: 'Services',
    readTime: '8 min read',
    image: '/images/blog/doorstep-service.jpg',
    featured: false
  },
  {
    id: 'screen-protection',
    slug: 'ultimate-guide-to-screen-protection',
    title: 'The Ultimate Guide to Screen Protection',
    excerpt: 'Everything you need to know about protecting your device screens from scratches, cracks, and damage.',
    date: '2024-02-25',
    author: 'Chris Lee',
    category: 'Mobile Accessories',
    readTime: '6 min read',
    image: '/images/blog/screen-protection.jpg',
    featured: false
  },
  {
    id: 'laptop-cleaning',
    slug: 'data-recovery-services-explained',
    title: 'Data Recovery Services Explained',
    excerpt: 'Understanding professional data recovery services and when you need them.',
    date: '2024-02-20',
    author: 'Emma Wright',
    category: 'Services',
    readTime: '9 min read',
    image: '/images/blog/data-recovery.jpg',
    featured: false
  }
];

// Blog categories
const categories = [
  'All Categories',
  'Mobile Repair',
  'Laptop Maintenance',
  'Emergency Repair',
  'Consumer Guide',
  'Mobile Accessories',
  'Tech Tips'
];

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Expert Tech Repair Guides & Tips | The Travelling Technicians Blog</title>
        <meta name="description" content="Get professional tech repair tips, guides, and insights from our expert technicians. Learn about mobile phone repair, laptop maintenance, and device troubleshooting." />
        <link rel="canonical" href="https://travelling-technicians.ca/blog" />
        <meta property="og:title" content="Expert Tech Repair Guides & Tips | The Travelling Technicians Blog" />
        <meta property="og:description" content="Professional tech repair tips, guides, and insights from our expert technicians. Mobile phone repair, laptop maintenance, and device troubleshooting." />
        <meta property="og:url" content="https://travelling-technicians.ca/blog" />
        <meta property="og:type" content="website" />
      </Head>
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 blog-hero text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The Repair Knowledge Hub
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Educational articles, tips, and guides to help you get the most from your devices and make informed decisions about repairs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog/category/mobile-repair" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                Mobile Repair Tips
              </Link>
              <Link href="/blog/category/laptop-maintenance" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                Laptop Maintenance
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                href={index === 0 ? '/blog' : `/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-4 py-2 rounded-md text-gray-700 ${
                  index === 0 
                    ? 'bg-primary-100 text-primary-700 font-medium' 
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.filter(post => post.featured).map((post) => (
              <div key={post.id} className="card blog-card overflow-hidden">
                <div className="relative h-60 w-full blog-image-container">
                  <LazyImage 
                    src={post.image} 
                    alt={`${post.title} - ${post.excerpt}`}
                    fill
                    className="object-cover"
                    context="blog post featured image"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium blog-category-badge">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm ml-3 flex items-center">
                      <FaClock className="mr-1" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    <Link href={`/blog/${post.slug}`} className="text-gray-900 hover:text-primary-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUser className="mr-1" /> 
                      <span>{post.author}</span>
                      <span className="mx-2">•</span>
                      <FaCalendarAlt className="mr-1" /> 
                      <span>{post.date}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8">All Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="card blog-card">
                <div className="relative h-48 w-full blog-image-container">
                  <LazyImage 
                    src={post.image} 
                    alt={`${post.title} - ${post.excerpt}`}
                    fill
                    className="object-cover"
                    context="blog post thumbnail"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium blog-category-badge">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm ml-3 flex items-center">
                      <FaClock className="mr-1" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    <Link href={`/blog/${post.slug}`} className="text-gray-900 hover:text-primary-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      <FaCalendarAlt className="inline-block mr-1" /> 
                      <span>{post.date}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 flex justify-center">
            <button className="btn-outline border-primary-600 text-primary-600 hover:bg-primary-50">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated with Repair Tips</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter for the latest device repair guides, tips, and special offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Expert Device Repair?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Our technicians bring professional repair services directly to your doorstep across the Lower Mainland.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-center">
                Book a Repair
              </Link>
              <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-700 text-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
    </>
  );
} 