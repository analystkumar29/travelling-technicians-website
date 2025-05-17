import React from 'react';
import Layout from '@/components/layout/Layout';
import useSafeRouter from '@/hooks/useSafeRouter';
import Link from 'next/link';

/**
 * Example page demonstrating how to safely use router properties
 * with our custom useSafeRouter hook to avoid common router errors
 */
const SafeRouterExample: React.FC = () => {
  const { 
    getQuery, 
    getAllQueryParams, 
    getPathname,
    isReady, 
    push,
    router 
  } = useSafeRouter();
  
  // Safely access query parameters (won't throw errors if undefined)
  const name = router.query.name || 'Guest';
  const page = router.query.page || '1';
  
  // Safely get all query params as an object
  const allParams = router.query;
  
  // Safely get the current pathname
  const currentPath = router.pathname;
  
  // Handle navigation
  const handleNavigation = () => {
    // Safe navigation that falls back to window.location if router fails
    push('/examples/safe-router-usage?name=Technician&page=2');
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Safe Router Usage Example</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Router State</h2>
          
          <div className="mb-4">
            <p><span className="font-medium">Router Ready:</span> {isReady ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Current Path:</span> {currentPath}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Query Parameters</h3>
            <p><span className="font-medium">name:</span> {name}</p>
            <p><span className="font-medium">page:</span> {page}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">All Query Parameters</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm">
              {JSON.stringify(allParams, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleNavigation}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            Navigate with Query Params
          </button>
          
          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            Go to Home Page
          </Link>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Why Use Safe Router?</h3>
          <p className="text-blue-700">
            The <code>useSafeRouter</code> hook provides protection against common Next.js router errors like
            "Cannot read properties of undefined". It safely accesses router properties with fallbacks
            and provides error handling for navigation.
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Usage Example</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
{`import useSafeRouter from '@/hooks/useSafeRouter';

function MyComponent() {
  const { 
    getQuery, 
    getAllQueryParams,
    push 
  } = useSafeRouter();
  
  // Safely get query param with default value
  const id = getQuery('id', 'default-id');
  
  // Safe navigation with fallback
  const handleClick = () => {
    push('/some-page?id=123');
  };
  
  return (
    <div>
      <p>ID: {id}</p>
      <button onClick={handleClick}>Navigate</button>
    </div>
  );
}`}
          </pre>
        </div>
      </div>
    </Layout>
  );
};

export default SafeRouterExample; 