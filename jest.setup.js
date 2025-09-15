// Note: @testing-library/jest-dom provides custom jest matchers for DOM assertions
// We'll include basic DOM testing setup instead

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'https://travelling-technicians.ca'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-supabase-url.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'

// Global test utilities
global.mockMetaTag = (property, content) => ({
  getAttribute: jest.fn((attr) => {
    if (attr === 'property' || attr === 'name') return property
    if (attr === 'content') return content
    return null
  })
})

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock console warnings in tests (they clutter test output)
const originalWarn = console.warn
console.warn = (...args) => {
  // Suppress specific warnings that are expected in tests
  if (args[0]?.includes?.('Warning: ')) return
  originalWarn(...args)
}

// Setup global fetch mock for API tests
global.fetch = jest.fn()
