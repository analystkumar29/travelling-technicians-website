import React from 'react';
import { motion } from 'framer-motion';

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
          <div className="w-2 h-2 rounded-full bg-primary-800 animate-pulse" />
          <span className="text-xs font-semibold text-primary-800">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <span className="text-xs text-accent-600 font-medium">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="floating-progress-bar bg-primary-100 h-1.5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-800 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="text-xs text-primary-700 mt-2 font-semibold">
        {stepNames[currentStep]}
      </div>
      {currentStep < totalSteps - 1 && (
        <div className="text-xs text-primary-400 mt-1">
          Next: {stepNames[currentStep + 1]}
        </div>
      )}
    </div>
  );
}
