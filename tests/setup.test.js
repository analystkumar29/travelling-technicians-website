/**
 * Setup Test - Validates that the test environment is correctly configured
 */

describe('Test Environment Setup', () => {
  test('should have Jest configured correctly', () => {
    expect(true).toBe(true)
  })
  
  test('should have access to DOM', () => {
    expect(document).toBeDefined()
    expect(window).toBeDefined()
  })
  
  test('should have Next.js mocks available', () => {
    const { useRouter } = require('next/router')
    const router = useRouter()
    expect(router).toBeDefined()
    expect(router.push).toBeDefined()
  })
  
  test('should have environment variables set', () => {
    expect(process.env.NEXT_PUBLIC_SITE_URL).toBe('https://travelling-technicians.ca')
  })
})
