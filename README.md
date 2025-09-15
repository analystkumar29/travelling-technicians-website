# The Travelling Technicians

**Professional mobile phone and laptop repair service with doorstep convenience across the Lower Mainland, BC.**

🚀 **Live Website**: [travelling-technicians.ca](https://travelling-technicians.ca)  
📚 **Documentation**: [Complete Documentation](./docs/)  
🔧 **Scripts Guide**: [Development Scripts](./scripts/)

---

## 🎯 Project Overview

The Travelling Technicians provides convenient doorstep repair services for mobile phones and laptops across Vancouver, Burnaby, Surrey, Richmond, and surrounding areas. Our platform features an easy online booking system, transparent pricing, and expert technician dispatch.

### ✨ Key Features

- **🚪 Doorstep Service** - Technicians come to your location
- **📱 Device Support** - Mobile phones, laptops, tablets
- **💻 Online Booking** - Simple multi-step booking process
- **💰 Transparent Pricing** - Upfront pricing with warranty options
- **📧 Email Notifications** - Booking confirmations and updates
- **🗺️ Service Area** - Lower Mainland BC coverage
- **⚡ Same-Day Service** - Fast repair turnaround

### 🏆 Business Highlights

- **1,526+** pricing entries in dynamic pricing system
- **100%** functional booking system with email confirmations
- **Fully deployed** production website on Vercel
- **SEO optimized** for local Lower Mainland searches
- **Mobile responsive** design with modern UX

---

## 🚀 Quick Start

### Development Setup

```bash
# Clone the repository
git clone https://github.com/analystkumar29/travelling-technicians-website.git
cd travelling-technicians-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and SendGrid keys

# Start development server
npm run dev

# View at http://localhost:3000
```

### Essential Commands

```bash
# Development
npm run dev                    # Start development server
npm run dev:clean             # Clean start with auth cleanup
npm run scripts:help          # View all available scripts

# Building & Testing  
npm run build                 # Production build
npm run test                  # Run test suite
npm run lint                  # Code quality check

# Database & API
npm run db:optimize           # Optimize database performance
npm run api:performance-test  # Test API response times

# Documentation
npm run docs:open            # Open documentation
```

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database with real-time features
- **SendGrid** - Transactional email delivery

### Infrastructure
- **Vercel** - Serverless hosting with edge CDN
- **Vercel Analytics** - Performance monitoring
- **Image Optimization** - WebP conversion and lazy loading

---

## 📊 Project Status

### ✅ Completed Features

- **Booking System** - Full end-to-end booking flow
- **Dynamic Pricing** - 1,526+ device pricing entries
- **Email System** - Booking confirmations and updates
- **Admin Panel** - Pricing and booking management
- **SEO Optimization** - Structured data and local search
- **Performance** - 90+ Lighthouse scores across all metrics
- **Security** - HTTPS, security headers, database RLS

### 🔄 Recent Updates (v4.0.0)

- **Directory Organization** - Cleaned up root directory with proper script structure
- **Documentation Overhaul** - Comprehensive docs in `/docs/` with API reference
- **Performance Optimization** - Enhanced caching and image optimization
- **Security Hardening** - Implemented comprehensive security checklist
- **Developer Experience** - Added 40+ npm scripts for common tasks

### 📋 Roadmap

- **Payment Integration** - Stripe/PayPal payment processing
- **SMS Notifications** - Twilio integration for SMS updates
- **Technician App** - Mobile app for technicians
- **Advanced Analytics** - Customer behavior tracking
- **Multi-language** - French language support

---

## 📚 Documentation

### Quick Links
- **[Complete Documentation](./docs/)** - Master documentation index
- **[API Reference](./docs/api/)** - Complete API documentation
- **[Deployment Guide](./docs/deployment/production.md)** - Production deployment
- **[Security Checklist](./docs/security/checklist.md)** - Security guidelines
- **[Development Scripts](./scripts/README.md)** - Development utilities

### Documentation Structure
```
docs/
├── api/           # API documentation and database schemas
├── deployment/    # Production deployment guides
├── security/      # Security documentation and checklists
├── development/   # Development guides and fixes
├── technical-reports/ # Performance and optimization reports
├── release-notes/ # Version history and changelogs
└── archive/       # Historical documentation
```

---

## 🛠️ Development

### Development Scripts

```bash
# Development Utilities
npm run dev:check-auth        # Check authentication config
npm run dev:check-db          # Check database connectivity
npm run fix:syntax           # Fix syntax errors automatically
npm run fix:router           # Fix Next.js router issues

# Database Operations
npm run maintenance:migration # Run database migrations
npm run maintenance:cleanup   # Security cleanup operations

# Testing & Validation
npm run test:seo:full        # Complete SEO test suite
npm run test:cache-full      # Cache performance testing
```

### Project Structure
```
├── src/
│   ├── components/          # React components
│   ├── pages/              # Next.js pages and API routes
│   ├── styles/             # CSS and styling
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
├── docs/                   # Documentation
├── scripts/                # Development and maintenance scripts
└── tests/                  # Test suites
```

---

## 🔧 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** the development guidelines in [`docs/development/`](./docs/development/)
4. **Test** your changes (`npm run test`)
5. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Guidelines

- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features
- Follow security guidelines in [`docs/security/`](./docs/security/)

---

## 📞 Support & Contact

### Business Contact
- **Website**: [travelling-technicians.ca](https://travelling-technicians.ca)
- **Email**: info@travelling-technicians.ca
- **Service Areas**: Vancouver, Burnaby, Surrey, Richmond, Coquitlam, North Vancouver, West Vancouver, New Westminster, Delta, Langley

### Development Support
- **Documentation**: [Complete Documentation](./docs/)
- **Scripts Help**: `npm run scripts:help`
- **API Reference**: [API Documentation](./docs/api/)
- **Security**: [Security Checklist](./docs/security/checklist.md)

### Emergency Contacts
- **Production Issues**: ops@travelling-technicians.ca
- **Security Incidents**: security@travelling-technicians.ca

---

## 📄 License

This project is proprietary software owned by The Travelling Technicians. All rights reserved.

### Third-Party Licenses
- Next.js (MIT License)
- React (MIT License)
- Tailwind CSS (MIT License)
- See `package.json` for complete dependency list

---

## 🏆 Achievements

- **Production Ready** ✅ - Fully deployed and operational
- **1,526+ Pricing Entries** 📊 - Comprehensive device pricing database
- **100% Functional** 🎯 - All core features working perfectly
- **Performance Optimized** ⚡ - 90+ Lighthouse scores
- **SEO Optimized** 🔍 - Structured data and local search ready
- **Security Hardened** 🔒 - Comprehensive security implementation

---

**Made with ❤️ for convenient device repair in the Lower Mainland**

*Last updated: September 15, 2025 | Version: 4.0.0*
