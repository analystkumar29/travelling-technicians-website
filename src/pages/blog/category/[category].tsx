import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';

// Blog post data - same as in index.tsx
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

// Get formatted slug from category name
const getCategorySlug = (category: string) => category.toLowerCase().replace(/\s+/g, '-');

// Get category name from slug
const getCategoryFromSlug = (slug: string) => {
  const formattedSlug = slug.replace(/-/g, ' ');
  return categories.find(cat => 
    getCategorySlug(cat) === slug || 
    cat.toLowerCase() === formattedSlug.toLowerCase()
  );
};

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  
  const categoryName = typeof category === 'string' ? getCategoryFromSlug(category) : null;
  
  // Filter posts by category
  const filteredPosts = categoryName && categoryName !== 'All Categories' 
    ? blogPosts.filter(post => post.category === categoryName)
    : blogPosts;

  // Get category description based on category name
  const getCategoryDescription = (name: string) => {
    switch(name) {
      case 'Mobile Repair':
        return 'Expert advice on troubleshooting and fixing common smartphone issues, from screen repairs to battery replacements.';
      case 'Laptop Maintenance':
        return 'Keep your laptop running smoothly with our guides on maintenance, cleaning, upgrades, and common repair issues.';
      case 'Emergency Repair':
        return 'Quick solutions for urgent device problems including water damage, sudden failures, and data recovery strategies.';
      case 'Consumer Guide':
        return 'Helpful information to make informed decisions about your tech devices, from buying guides to repair vs. replace considerations.';
      case 'Mobile Accessories':
        return 'Reviews and recommendations for the best phone accessories, cases, screen protectors, and other add-ons to enhance your device.';
      case 'Tech Tips':
        return 'General technology advice to help you get the most from your devices, including performance optimization and troubleshooting.';
      default:
        return 'Explore our collection of repair guides, maintenance tips, and technology advice for all your device needs.';
    }
  };

  return (
    <Layout
      title={`${categoryName || 'Category'} - The Travelling Technicians Blog`}
      canonical={typeof category === 'string' ? `https://www.travelling-technicians.ca/blog/category/${category}` : undefined}
    >
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-primary-100 hover:text-white transition-colors mb-4">
                <ChevronLeft className="w-4 h-4 mr-2 inline" /> Back to All Categories
              </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {categoryName || 'Category Not Found'}
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              {categoryName ? getCategoryDescription(categoryName) : 'The category you are looking for does not exist.'}
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat, index) => (
              <Link key={index} 
                href={index === 0 ? '/blog' : `/blog/category/${getCategorySlug(cat)}`}>
                  {cat}
                </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          {categoryName ? (
            <>
              <h2 className="text-3xl font-bold mb-8">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'} in {categoryName}
              </h2>
              
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="card hover:shadow-custom-lg transition-shadow">
                      <div className="relative h-48 w-full">
                        <Image 
                          src={post.image} 
                          alt={post.title} 
                          layout="fill"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium blog-category-badge">
                            {post.category}
                          </span>
                          <span className="text-gray-500 text-sm ml-3 flex items-center">
                            <Clock className="w-3 h-3 mr-1 inline" /> {post.readTime}
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
                            <Calendar className="w-3 h-3 inline-block mr-1" />
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
              ) : (
                <div className="text-center py-16">
                  <p className="text-xl text-gray-600 mb-6">No articles found in this category yet.</p>
                  <Link href="/blog" className="btn-primary">
                      Browse All Articles
                    </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-6">The category you are looking for does not exist.</p>
              <Link href="/blog" className="btn-primary">
                  Browse All Articles
                </Link>
            </div>
          )}
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