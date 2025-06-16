import React from 'react';

interface FloatingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function FloatingProgress({ currentStep, totalSteps, stepNames }: FloatingProgressProps) {
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;
  
  return (
    <div className="floating-progress">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></div>
          <span className="text-xs font-semibold text-gray-800">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <span className="text-xs text-primary-600 font-medium">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="floating-progress-bar">
        <div 
          className="floating-progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-700 mt-2 font-semibold">
        {stepNames[currentStep]}
      </div>
      {currentStep < totalSteps - 1 && (
        <div className="text-xs text-gray-500 mt-1">
          Next: {stepNames[currentStep + 1]}
        </div>
      )}
    </div>
  );
} 