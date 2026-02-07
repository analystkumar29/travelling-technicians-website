import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { MapPin, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { CreateBookingRequest } from '@/types/booking';
import {
  checkServiceArea,
  isValidPostalCodeFormat,
} from '@/utils/locationUtils';
import AddressAutocomplete from '../AddressAutocomplete';

interface ContactLocationStepProps {
  methods: UseFormReturn<CreateBookingRequest>;
  validatedSteps: number[];
  locationWasPreFilled: boolean;
  detectingLocation: boolean;
  needsPostalCodeAttention: boolean;
  scrollToElement: (selector: string, delay?: number) => void;
  detectCurrentLocation: () => Promise<void>;
  handleAddressSelect: (address: string, isValid: boolean, postalCode?: string) => void;
  setNeedsPostalCodeAttention: (v: boolean) => void;
}

export default function ContactLocationStep({
  methods,
  validatedSteps,
  locationWasPreFilled,
  detectingLocation,
  needsPostalCodeAttention,
  scrollToElement,
  detectCurrentLocation,
  handleAddressSelect,
  setNeedsPostalCodeAttention,
}: ContactLocationStepProps) {
  const showValidationErrors = validatedSteps.includes(1);

  return (
    <div className="space-y-8">
      {/* ─── Contact Information ───────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="glass-section-header">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Your Contact Information</h3>
          <p className="text-sm text-primary-700">
            We need your contact details to confirm your booking and for our technician to reach you.
          </p>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-primary-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Controller
              name="customerName"
              control={methods.control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <>
                  <input
                    id="customerName"
                    type="text"
                    className={`glass-input w-full ${
                      fieldState.error ? 'invalid' : field.value && !fieldState.error ? 'valid' : ''
                    }`}
                    placeholder="John Smith"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      if (e.target.value.trim()) {
                        scrollToElement('label[for="customerEmail"]', 300);
                      }
                    }}
                  />
                  {fieldState.error && showValidationErrors && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-primary-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Controller
              name="customerEmail"
              control={methods.control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field, fieldState }) => (
                <>
                  <input
                    id="customerEmail"
                    type="email"
                    className={`glass-input w-full ${
                      fieldState.error ? 'invalid' : field.value && !fieldState.error ? 'valid' : ''
                    }`}
                    placeholder="you@example.com"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      if (e.target.value.trim()) {
                        scrollToElement('label[for="customerPhone"]', 300);
                      }
                    }}
                  />
                  <p className="mt-1 text-xs text-primary-500">
                    We&apos;ll send booking confirmation and updates to this email.
                  </p>
                  {fieldState.error && showValidationErrors && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-primary-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Controller
              name="customerPhone"
              control={methods.control}
              rules={{
                required: 'Phone number is required',
                pattern: {
                  value:
                    process.env.NODE_ENV === 'production'
                      ? /^(\+?1-?)?(\([2-9]([0-9]{2})\)|[2-9]([0-9]{2}))-?[2-9]([0-9]{2})-?([0-9]{4})$/
                      : /^.{2,}$/,
                  message: 'Please enter a valid phone number',
                },
              }}
              render={({ field, fieldState }) => (
                <>
                  <input
                    id="customerPhone"
                    type="tel"
                    className={`glass-input w-full ${
                      fieldState.error ? 'invalid' : field.value && !fieldState.error ? 'valid' : ''
                    }`}
                    placeholder="(555) 123-4567"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      if (e.target.value.trim()) {
                        scrollToElement('#city-postal-section', 300);
                      }
                    }}
                  />
                  <p className="mt-1 text-xs text-primary-500">
                    Our technician will call you before arriving for the repair.
                  </p>
                  {fieldState.error && showValidationErrors && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        {/* Privacy notice */}
        <div className="glass-info-banner flex items-start gap-3">
          <Info className="h-5 w-5 text-primary-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-primary-900">Privacy Notice</h4>
            <p className="mt-1 text-xs text-primary-700">
              Your information is secure and only used to facilitate your repair service. See our{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-primary-900 transition-colors">
                Privacy Policy
              </a>{' '}
              for details.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Location ─────────────────────────────────────────────────── */}
      <div className="border-t border-primary-200/50 pt-8 space-y-6">
        <div className="glass-info-banner">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-primary-700">
              We service the entire Lower Mainland area including Vancouver, Burnaby, Richmond, New Westminster,
              North Vancouver, West Vancouver, Coquitlam, and Chilliwack.
            </p>
          </div>
        </div>

        {locationWasPreFilled && (
          <div className="glass-success-banner flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">Great news! You&apos;re in our service area!</p>
              <p className="text-xs text-green-700 mt-1">
                Your location information has been pre-filled. You can edit these details if needed.
              </p>
            </div>
          </div>
        )}

        {needsPostalCodeAttention && (
          <div className="glass-warning-banner flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Please ensure your postal code is correct.</strong> We need this to verify if you&apos;re in our
              service area.
            </p>
          </div>
        )}

        {/* Address */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="address" className="block text-sm font-medium text-primary-700">
              Street Address
            </label>
            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={detectingLocation}
              className="text-sm flex items-center text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:underline"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-1" />
                  Detect my location
                </>
              )}
            </button>
          </div>
          <Controller
            name="address"
            control={methods.control}
            rules={{ required: 'Address is required' }}
            render={({ field, fieldState }) => (
              <>
                <AddressAutocomplete
                  value={field.value}
                  className=""
                  onAddressSelect={handleAddressSelect}
                  error={!!fieldState.error}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>

        {/* City & Postal Code */}
        <div id="city-postal-section" className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-primary-700 mb-1">
              City
            </label>
            <Controller
              name="city"
              control={methods.control}
              rules={{ required: 'City is required' }}
              render={({ field, fieldState }) => (
                <>
                  <select
                    id="city"
                    className="glass-input w-full appearance-none"
                    {...field}
                    value={field.value || ''}
                  >
                    <option value="" disabled>Select a city</option>
                    <option value="Vancouver">Vancouver</option>
                    <option value="Burnaby">Burnaby</option>
                    <option value="Surrey">Surrey</option>
                    <option value="Richmond">Richmond</option>
                    <option value="Coquitlam">Coquitlam</option>
                    <option value="North Vancouver">North Vancouver</option>
                    <option value="West Vancouver">West Vancouver</option>
                    <option value="New Westminster">New Westminster</option>
                    <option value="Delta">Delta</option>
                    <option value="Langley">Langley</option>
                    <option value="White Rock">White Rock</option>
                    <option value="Port Coquitlam">Port Coquitlam</option>
                    <option value="Port Moody">Port Moody</option>
                    <option value="Maple Ridge">Maple Ridge</option>
                    <option value="Pitt Meadows">Pitt Meadows</option>
                  </select>
                  {fieldState.error && showValidationErrors && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-primary-700 mb-1">
              Postal Code {needsPostalCodeAttention && <span className="text-red-500">*</span>}
            </label>
            <Controller
              name="postalCode"
              control={methods.control}
              rules={{
                required: 'Postal code is required',
                validate: {
                  validFormat: (value) =>
                    isValidPostalCodeFormat(value) || 'Please enter a valid postal code format (e.g., V6B 1A1)',
                  inServiceArea: (value) => {
                    const serviceArea = checkServiceArea(value);
                    return (
                      serviceArea?.serviceable ||
                      "Unfortunately, we don't service this postal code area. Please contact us for special arrangements."
                    );
                  },
                },
              }}
              render={({ field, fieldState }) => (
                <>
                  <input
                    id="postalCode"
                    type="text"
                    className={`glass-input w-full ${
                      fieldState.error ? 'invalid' : field.value && !fieldState.error ? 'valid' : ''
                    }`}
                    placeholder="V6B 1A1"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      field.onChange(value);
                      if (isValidPostalCodeFormat(value)) {
                        const serviceArea = checkServiceArea(value);
                        if (serviceArea?.serviceable) {
                          setNeedsPostalCodeAttention(false);
                        }
                      }
                    }}
                  />
                  {fieldState.error && showValidationErrors && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        {/* Province (read-only) */}
        <div>
          <label htmlFor="province" className="block text-sm font-medium text-primary-700 mb-1">
            Province
          </label>
          <Controller
            name="province"
            control={methods.control}
            rules={{ required: 'Province is required' }}
            render={({ field, fieldState }) => (
              <>
                <input
                  id="province"
                  type="text"
                  className="glass-input w-full bg-primary-50/40"
                  disabled
                  {...field}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
