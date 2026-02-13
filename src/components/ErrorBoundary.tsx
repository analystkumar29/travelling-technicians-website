import React, { Component, ErrorInfo, ReactNode } from 'react';

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
  private errorRecoveryTimeout: NodeJS.Timeout | null = null;
  
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Set up automatic recovery only when error state changes to true
    if (this.state.hasError && !prevState.hasError) {
      // Clear any existing timeout
      if (this.errorRecoveryTimeout) {
        clearTimeout(this.errorRecoveryTimeout);
      }
      
      // Set up automatic recovery after 5 seconds
      this.errorRecoveryTimeout = setTimeout(() => {
        this.resetError();
      }, 5000);
    }
  }
  
  componentWillUnmount() {
    // Clean up timeout when component unmounts
    if (this.errorRecoveryTimeout) {
      clearTimeout(this.errorRecoveryTimeout);
    }
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
        error.message?.includes('is not defined') ||
        error.message?.includes('Script error')) {
      this.cleanupJSONPScriptTags();
    }
    
    // Handle booking-related errors
    if (error.message?.includes('booking') ||
        error.message?.includes('address') ||
        error.message?.includes('location')) {
      this.handleBookingErrors();
    }
  }
  
  // Clean up JSONP script tags that might be causing errors
  cleanupJSONPScriptTags() {
    try {
      const jsonpScripts = document.querySelectorAll('script[src*="json_callback"]');
      jsonpScripts.forEach((script: Element) => {
        script.remove();
      });

      const locationScripts = document.querySelectorAll('script[src*="nominatim"]');
      locationScripts.forEach((script: Element) => {
        script.remove();
      });

      if (typeof window !== 'undefined') {
        Object.keys(window).forEach((key) => {
          if (key.includes('jsonp_callback')) {
            delete (window as any)[key];
          }
        });
      }
    } catch (e) {
      console.error('Error cleaning up JSONP scripts:', e);
    }
  }
  
  // Handle booking-related errors
  handleBookingErrors() {
    try {
      // Reset any loading states that might be stuck
      document.body.classList.remove('loading');
      document.body.classList.remove('processing');
      
      // Remove any error overlay elements that might be present
      const errorOverlays = document.querySelectorAll('.error-overlay');
      errorOverlays.forEach((overlay) => overlay.remove());
    } catch (e) {
      console.error('Error handling booking errors:', e);
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
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 