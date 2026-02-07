import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface FloatingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function FloatingProgress({ currentStep, totalSteps, stepNames }: FloatingProgressProps) {
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="glass-progress-container glass-animate-in">
      {/* Step counter + percentage */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary-700 animate-pulse" />
          <span className="text-xs font-semibold text-primary-800">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <span className="text-xs text-accent-600 font-bold">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Progress bar with gradient shimmer */}
      <div className="glass-progress-bar">
        <motion.div
          className="glass-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step pills */}
      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        {stepNames.map((name, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;
          return (
            <span
              key={name}
              className={`glass-step-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              {isCompleted && <Check className="h-3 w-3 mr-0.5" />}
              <span className="truncate">{name.split(' ')[0]}</span>
            </span>
          );
        })}
      </div>

      {/* Next step hint */}
      {currentStep < totalSteps - 1 && (
        <div className="text-[10px] text-primary-400 mt-1.5">
          Next: {stepNames[currentStep + 1]}
        </div>
      )}
    </div>
  );
}
