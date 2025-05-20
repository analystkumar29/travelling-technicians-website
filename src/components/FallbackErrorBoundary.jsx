import React from 'react';
import Image from 'next/image';

class FallbackErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("UI Rendering Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
            <div className="mb-6">
              {/* Logo implementation with SVG primary and PNG fallback */}
              <picture className="inline-block">
                <source srcSet="/images/logo.svg" type="image/svg+xml" />
                <img 
                  src="/images/logo.png" 
                  alt="The Travelling Technicians Logo" 
                  width={110} 
                  height={40} 
                  className="h-12 w-auto mx-auto"
                />
              </picture>
            </div>
            
            <h2 className="text-2xl font-bold text-primary-600 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-700 mb-6">We're having trouble loading this page. Our team has been notified.</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md shadow hover:bg-primary-700 hover:shadow-md transition-all duration-300"
              >
                Reload Page
              </button>
              
              <a 
                href="/"
                className="block w-full px-4 py-2 bg-white text-primary-600 border border-primary-600 rounded-md hover:bg-gray-50 transition-all duration-300"
              >
                Return to Homepage
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FallbackErrorBoundary; 