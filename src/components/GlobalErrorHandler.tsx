import React, { useState, useEffect } from 'react';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timeout?: number;
}

// Create a global event system for error messages
type ErrorEventCallback = (error: ErrorMessage) => void;
const errorCallbacks: ErrorEventCallback[] = [];

export const addErrorListener = (callback: ErrorEventCallback) => {
  errorCallbacks.push(callback);
  return () => {
    const index = errorCallbacks.indexOf(callback);
    if (index !== -1) {
      errorCallbacks.splice(index, 1);
    }
  };
};

export const showError = (message: string, type: 'error' | 'warning' | 'info' = 'error', timeout = 5000) => {
  const errorMessage: ErrorMessage = {
    id: Math.random().toString(36).substring(2, 11),
    message,
    type,
    timeout,
  };
  
  errorCallbacks.forEach(callback => callback(errorMessage));
};

const GlobalErrorHandler: React.FC = () => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  useEffect(() => {
    // Subscribe to error events
    const removeListener = addErrorListener((error) => {
      setErrors((prevErrors) => [...prevErrors, error]);

      // Auto-remove after timeout if specified
      if (error.timeout) {
        setTimeout(() => {
          setErrors((prevErrors) => 
            prevErrors.filter((e) => e.id !== error.id)
          );
        }, error.timeout);
      }
    });

    return removeListener;
  }, []);

  const removeError = (id: string) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error.id !== id));
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {errors.map((error) => (
        <div 
          key={error.id}
          className={`rounded-lg shadow-lg p-4 flex items-start ${
            error.type === 'error' 
              ? 'bg-red-50 border-l-4 border-red-500' 
              : error.type === 'warning'
                ? 'bg-amber-50 border-l-4 border-amber-500'
                : 'bg-blue-50 border-l-4 border-blue-500'
          }`}
        >
          <div className="flex-shrink-0 mr-3">
            <FaExclamationCircle className={`
              mt-0.5 text-lg
              ${error.type === 'error' 
                ? 'text-red-500' 
                : error.type === 'warning'
                  ? 'text-amber-500'
                  : 'text-blue-500'
              }
            `} />
          </div>
          <div className="flex-1 mr-2">
            <p className={`text-sm ${
              error.type === 'error' 
                ? 'text-red-800' 
                : error.type === 'warning'
                  ? 'text-amber-800'
                  : 'text-blue-800'
            }`}>
              {error.message}
            </p>
          </div>
          <button 
            onClick={() => removeError(error.id)}
            className={`flex-shrink-0 p-1 rounded-full ${
              error.type === 'error' 
                ? 'text-red-500 hover:bg-red-100' 
                : error.type === 'warning'
                  ? 'text-amber-500 hover:bg-amber-100'
                  : 'text-blue-500 hover:bg-blue-100'
            }`}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default GlobalErrorHandler; 