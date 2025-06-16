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
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-primary-600"></div>
        <span className="text-xs font-medium text-gray-700">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div className="floating-progress-bar">
        <div 
          className="floating-progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 mt-1 font-medium">
        {stepNames[currentStep]}
      </div>
    </div>
  );
} 