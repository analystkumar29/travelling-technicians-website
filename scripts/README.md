# Scripts Directory

This directory contains all development, deployment, and maintenance scripts for The Travelling Technicians website. Scripts are organized into logical categories for better maintainability.

## Directory Structure

```
scripts/
├── development/     # Development utilities and fixes
├── deployment/      # Deployment scripts (coming soon)
├── maintenance/     # Database and system maintenance
├── archive/         # Archived/unused scripts
├── mobileactive/    # Data extraction and cleaning scripts
└── README.md        # This file
```

## Quick Reference

### Common Development Tasks

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:clean` | Clean start with auth cleanup |
| `npm run dev:check-auth` | Check authentication configuration |
| `npm run dev:check-db` | Check database connectivity |
| `npm run fix:syntax` | Fix syntax errors automatically |
| `npm run fix:router` | Fix Next.js router issues |

### Database Operations

| Command | Description |
|---------|-------------|
| `npm run db:optimize` | Optimize database performance |
| `npm run maintenance:migration` | Run database migrations |
| `npm run maintenance:schema-update` | Update database schema |
| `npm run db:rebuild` | Full database rebuild |

### Testing & Validation

| Command | Description |
|---------|-------------|
| `npm run test:seo:full` | Complete SEO test suite |
| `npm run validate:schema` | Validate structured data |
| `npm run test:cache-full` | Cache performance testing |

## Development Scripts (`/development/`)

### Authentication & Setup
- **check-auth-config.js** - Validates authentication configuration
- **clean-auth-and-start.js** - Cleans auth state and starts dev server
- **setup-auth-env.js** - Sets up authentication environment variables
- **setup-env.js** - General environment setup

### Database Utilities
- **check-database.js** - Tests database connectivity and health
- **generate-admin-password.js** - Generates secure admin passwords

### Router & Navigation
- **fix-router.js** - Fixes Next.js router configuration issues
- **fix-router-precise.js** - Precision router fixes
- **verify-router-fixes.js** - Validates router fix implementations
- **patch-next-router.js** - Patches Next.js router issues

### Code Quality & Fixes
- **fix-all-errors.js** - Automated error fixing
- **fix-and-start.js** - Fix errors and start development
- **fix-auth-navigation.js** - Fixes authentication navigation
- **fix-booking-test.js** - Fixes booking system tests
- **fix-syntax-errors.js** - Automatic syntax error correction
- **fix-template-literals.js** - Template literal syntax fixes
- **check-template-literals.js** - Validates template literal usage

### Development Servers
- **clean-router-fix.js** - Clean router fix implementation
- **clean-start.js** - Clean development server start
- **complete-fix.js** - Complete system fix implementation
- **simple-start-dev.js** - Simple development server startup

### Testing & Validation
- **test-api-endpoint.js** - API endpoint testing
- **test-fixed-pricing-api.js** - Pricing API validation
- **test-seo-redirects.js** - SEO redirect testing
- **verify-security-fixes.js** - Security validation

## Maintenance Scripts (`/maintenance/`)

### Database Management
- **run-database-optimization.js** - Database performance optimization
- **run-improved-migration.js** - Enhanced database migrations
- **run-migration-with-env.js** - Environment-aware migrations
- **run-schema-update.js** - Schema update operations
- **run-technician-warranty-migration.js** - Warranty system migration

### System Maintenance
- **cleanup-security.sh** - Security cleanup operations
- **start-fallback-server.js** - Fallback server for emergencies
- **improved-warranty-migration.js** - Warranty system improvements

### Authentication
- **run-remove-authentication.js** - Authentication removal utility

## Data Processing Scripts (`/mobileactive/`)

### Pricing Data Extraction
- **run-extraction.ts** - Main data extraction pipeline
- **run-advanced-cleaning.js** - Advanced data cleaning algorithms
- **test-setup.ts** - Testing environment setup

### Usage Examples

#### Start Development with Clean State
```bash
npm run dev:clean
```

#### Fix Common Issues
```bash
# Fix all syntax errors
npm run fix:syntax

# Fix router issues
npm run fix:router

# Check database connection
npm run dev:check-db
```

#### Database Operations
```bash
# Run migrations
npm run maintenance:migration

# Optimize database
npm run db:optimize

# Full rebuild (use with caution)
npm run db:rebuild
```

#### Testing
```bash
# Full SEO test suite
npm run test:seo:full

# Cache performance
npm run test:cache-full

# API performance
npm run api:performance-test
```

## Troubleshooting Guide

### Common Issues

#### 1. Development Server Won't Start
```bash
# Try clean start
npm run dev:clean

# Check environment
npm run validate-env

# Check database
npm run dev:check-db
```

#### 2. Authentication Issues
```bash
# Check auth config
npm run dev:check-auth

# Fix auth navigation
npm run fix:auth

# Clean auth state
npm run dev:clean
```

#### 3. Router Issues
```bash
# Fix router configuration
npm run fix:router

# Verify fixes
npm run dev:verify-router
```

#### 4. Database Problems
```bash
# Check connectivity
npm run dev:check-db

# Run migrations
npm run maintenance:migration

# Optimize performance
npm run db:optimize
```

#### 5. Build Errors
```bash
# Fix syntax errors
npm run fix:syntax

# Fix all errors
npm run dev:fix-all

# Clean build
npm run clean && npm run build
```

### Emergency Procedures

#### Server Down
```bash
# Start fallback server
npm run dev:fallback
```

#### Database Corruption
```bash
# Run with dry-run first
npm run db:full-rebuild:dry

# If safe, run full rebuild
npm run db:full-rebuild
```

#### Security Issues
```bash
# Run security cleanup
npm run maintenance:cleanup

# Verify fixes
npm run dev:verify-security
```

## Script Development Guidelines

### Adding New Scripts

1. **Choose appropriate directory**:
   - `development/` - Development utilities, fixes, testing
   - `maintenance/` - Database operations, system maintenance
   - `deployment/` - Production deployment scripts
   - `archive/` - Deprecated/unused scripts

2. **Naming conventions**:
   - Use kebab-case for filenames
   - Prefix with action: `fix-`, `check-`, `run-`, `test-`
   - Be descriptive: `fix-auth-navigation.js` vs `fix.js`

3. **Add to package.json**:
   - Add appropriate npm script
   - Use consistent naming patterns
   - Group related scripts with prefixes

4. **Documentation**:
   - Add entry to this README
   - Include usage examples
   - Document any prerequisites

### Script Standards

- **Error handling**: All scripts should handle errors gracefully
- **Logging**: Use consistent logging with timestamps
- **Environment**: Check environment variables before execution
- **Cleanup**: Clean up temporary files and resources
- **Documentation**: Include header comments explaining purpose

## Getting Help

- **View this documentation**: `npm run scripts:help`
- **Open docs folder**: `npm run docs:open`
- **Check script status**: `npm run system:health-check`

## Maintenance

This documentation should be updated whenever:
- New scripts are added
- Scripts are moved or renamed
- Package.json scripts are modified
- New troubleshooting procedures are discovered

Last updated: $(date)
