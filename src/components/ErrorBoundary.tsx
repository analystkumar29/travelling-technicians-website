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

/**
 * Enhanced error boundary component that catches errors in any child component
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console for debugging
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Check for and handle specific types of errors
    this.handleSpecificErrors(error);
    
    // Update state with error details
    this.setState({
      errorInfo
    });
  }

  // Handle specific types of errors with custom solutions
  handleSpecificErrors(error: Error) {
    // Clean up JSONP script tags that may be causing errors
    if (error.message?.includes('jsonp_callback') || 
        error.message?.includes('is not defined')) {
      this.cleanupJSONPScriptTags();
    }
    
    // Handle other specific error types as needed
    if (error.message?.includes('CoreLocationProvider')) {
      console.log('Location error detected, will use fallback system');
    }
  }
  
  // Clean up JSONP script tags that might be causing errors
  cleanupJSONPScriptTags() {
    try {
      const scripts = document.querySelectorAll('script[src*="json_callback"]');
      scripts.forEach((script: Element) => {
        // Properly type the script element as HTMLScriptElement
        const scriptElement = script as HTMLScriptElement;
        console.log('Removing problematic JSONP script:', scriptElement.src);
        scriptElement.remove();
      });
    } catch (e) {
      console.error('Error cleaning up JSONP scripts:', e);
    }
  }

  // Reset the error state if possible
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }
  
  // Optional method to retry the failed operation
  retry = () => {
    this.resetError();
    // You could add additional retry logic here
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // Check if a custom fallback is provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary-fallback" style={{
          padding: '20px',
          margin: '20px',
          borderRadius: '4px',
          backgroundColor: '#fff8f8',
          border: '1px solid #ffebeb',
          color: '#333'
        }}>
          <h3 style={{ color: '#e53e3e' }}>Something went wrong</h3>
          <p>We're experiencing a technical issue. The application will recover automatically.</p>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={this.retry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
          
          {/* Auto-recovery after a delay */}
          {setTimeout(() => {
            this.resetError();
          }, 5000)}
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 