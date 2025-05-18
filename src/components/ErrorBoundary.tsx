import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { FaExclamationCircle, FaHome } from 'react-icons/fa';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Here you could send the error to your analytics or error tracking service
    // Example: reportError(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="py-12 px-4">
          <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-red-50">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <FaExclamationCircle className="text-3xl text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
                  <p className="text-gray-600">We apologize for the inconvenience. Please try refreshing the page.</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Error details:</div>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-auto max-h-32">
                  {this.state.error?.toString() || 'Unknown error'}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                  <a className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    <FaHome /> Go to Homepage
                  </a>
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 