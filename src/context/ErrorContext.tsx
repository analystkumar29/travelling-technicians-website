import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timeout?: number;
}

interface ErrorContextState {
  errors: ErrorMessage[];
  addError: (error: Omit<ErrorMessage, 'id'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextState | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const addError = (error: Omit<ErrorMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newError = { ...error, id };
    setErrors(prevErrors => [...prevErrors, newError]);
    
    // Auto-remove after timeout if specified
    if (error.timeout) {
      setTimeout(() => {
        removeError(id);
      }, error.timeout);
    }
  };

  const removeError = (id: string) => {
    setErrors(prevErrors => prevErrors.filter(error => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextState => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext; 