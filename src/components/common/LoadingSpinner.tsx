import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'white';
  className?: string;
}

/**
 * LoadingSpinner component
 * 
 * A customizable loading spinner with brand colors and three sizes.
 * 
 * @example
 * // Default spinner (medium size, primary color)
 * <LoadingSpinner />
 * 
 * @example
 * // Large white spinner
 * <LoadingSpinner size="lg" color="white" />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = ''
}) => {
  // Size mapping
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  // Color mapping
  const colorMap = {
    primary: 'border-gray-200 border-t-primary-600',
    accent: 'border-gray-200 border-t-accent-500',
    white: 'border-gray-400 border-t-white',
  };
  
  return (
    <div className={`${sizeMap[size]} ${colorMap[color]} rounded-full animate-spin ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner; 