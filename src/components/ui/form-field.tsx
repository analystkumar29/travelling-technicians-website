import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input, type InputProps } from './input';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  helpText?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helpText, id, className, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('space-y-1.5', className)}>
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-primary-700"
        >
          {label}
        </label>
        <Input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
          className={cn(error && 'border-red-500 focus-visible:ring-red-400')}
          {...props}
        />
        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={`${fieldId}-help`} className="text-sm text-primary-400">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
export { FormField };
