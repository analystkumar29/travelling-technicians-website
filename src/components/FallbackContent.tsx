import { useEffect, useState } from 'react';

/**
 * FallbackContent - A component that shows at least some content in case the main UI fails to render
 * This helps prevent complete white screens
 */
const FallbackContent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Only show the fallback after a delay if the main content hasn't loaded
    const timer = setTimeout(() => {
      // Check if we have any visible content in the main areas
      const mainContent = document.querySelector('main');
      const visibleElements = mainContent ? Array.from(mainContent.children).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }) : [];
      
      // If no visible content, show our fallback
      if (visibleElements.length === 0) {
        setIsVisible(true);
      }
    }, 3000); // 3 second delay
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50 p-4">
      <div className="max-w-md p-6 bg-gray-100 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">The Travelling Technicians</h2>
        <p className="mb-4">Expert mobile phone and laptop repair services at your doorstep across the Lower Mainland, BC.</p>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">It looks like our website is taking a moment to load.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
        <div className="text-sm text-gray-600">
          <p>You can also contact us directly:</p>
          <p className="mt-1">Phone: (604) 555-1234</p>
          <p>Email: contact@travellingtechnicians.ca</p>
        </div>
      </div>
    </div>
  );
};

export default FallbackContent; 