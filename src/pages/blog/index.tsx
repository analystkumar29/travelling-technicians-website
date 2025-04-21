import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaUser, FaTag, FaClock } from 'react-icons/fa';

// Blog post data
const blogPosts = [
  {
    id: 'signs-phone-needs-repair',
    slug: 'signs-your-phone-needs-repair',
    title: '5 Warning Signs Your Phone Needs Repair',
    excerpt: 'Learn to recognize the early warning signs that your phone needs professional attention before small issues become major problems.',
    date: 'March 15, 2023',
    author: 'Alex Chen',
    category: 'Mobile Repair',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd',
    featured: true
  },
  {
    id: 'extend-laptop-battery',
    slug: 'how-to-extend-your-laptop-battery-life',
    title: 'How to Extend Your Laptop Battery Life',
    excerpt: 'Simple but effective tips to maximize your laptop battery lifespan and get more usage time between charges.',
    date: 'April 2, 2023',
    author: 'Sarah Johnson',
    category: 'Laptop Maintenance',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
    featured: true
  },
  {
    id: 'water-damage-rescue',
    slug: 'water-damage-first-aid-for-devices',
    title: 'Water Damage First Aid for Your Devices',
    excerpt: 'The critical first steps to take when your phone or laptop gets wet that can save your device from permanent damage.',
    date: 'February 10, 2023',
    author: 'Michael Tran',
    category: 'Emergency Repair',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1563884072595-24fccfa2c5c2',
    featured: false
  },
  {
    id: 'worth-repair-replace',
    slug: 'repair-or-replace-making-the-right-decision',
    title: 'Repair or Replace? Making the Right Decision',
    excerpt: 'How to determine whether it\'s more cost-effective to repair your existing device or invest in a new one.',
    date: 'May 5, 2023',
    author: 'Jamie Garcia',
    category: 'Consumer Guide',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092',
    featured: false
  },
  {
    id: 'screen-protection',
    slug: 'ultimate-guide-to-screen-protection',
    title: 'The Ultimate Guide to Screen Protection',
    excerpt: 'Compare different types of screen protectors and learn proper installation techniques for maximum protection.',
    date: 'January 22, 2023',
    author: 'Chris Lee',
    category: 'Mobile Accessories',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1608503396060-0322b3e88af7',
    featured: false
  },
  {
    id: 'laptop-cleaning',
    slug: 'properly-cleaning-your-laptop-inside-and-out',
    title: 'Properly Cleaning Your Laptop Inside and Out',
    excerpt: 'Step-by-step guide to safely clean your laptop, including keyboard, screen, vents and internals for better performance.',
    date: 'June 12, 2023',
    author: 'Emma Wright',
    category: 'Laptop Maintenance',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
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
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${index === 0 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
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
              <div key={post.id} className="card overflow-hidden hover:shadow-custom-lg transition-shadow">
                <div className="relative h-60 w-full">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
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
              <div key={post.id} className="card hover:shadow-custom-lg transition-shadow">
                <div className="relative h-48 w-full">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
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
  );
} 