import React, { useMemo } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { Calendar, Clock, Check, Info, Loader2 } from 'lucide-react';
import type { CreateBookingRequest } from '@/types/booking';
import type { Brand, DeviceModel, Service, PricingData } from '@/hooks/useBookingData';
import type { TimeSlot } from '@/utils/bookingTimeSlots';
import { formatDate, formatTimeSlot } from '@/utils/formatters';
import PriceDisplay from '../PriceDisplay';

interface ScheduleConfirmStepProps {
  methods: UseFormReturn<CreateBookingRequest>;
  timeSlots: TimeSlot[];
  isLoadingTimeSlots: boolean;
  agreeToTerms: boolean;
  setAgreeToTerms: (v: boolean) => void;
  submitAttempted: boolean;
  pricingData: PricingData | undefined;
  quotedPrice: number | undefined;
  brandsData: Brand[] | undefined;
  modelsData: DeviceModel[] | undefined;
  servicesData: Service[] | undefined;
  validatedSteps: number[];
  scrollToElement: (selector: string, delay?: number) => void;
  watchedAppointmentDate: string;
}

// Service display name mapping
const SERVICE_TYPE_MAP: Record<string, string> = {
  'screen-replacement': 'Screen Replacement',
  'battery-replacement': 'Battery Replacement',
  'charging-port-repair': 'Charging Port Repair',
  'charging-port': 'Charging Port Repair',
  'speaker-repair': 'Speaker/Microphone Repair',
  'speaker-mic': 'Speaker/Microphone Repair',
  'camera-repair': 'Camera Repair',
  'water-damage': 'Water Damage Assessment',
  'keyboard-repair': 'Keyboard Repair/Replacement',
  'trackpad-repair': 'Trackpad Repair',
  'ram-upgrade': 'RAM Upgrade',
  'storage-upgrade': 'Storage (HDD/SSD) Upgrade',
  'software-trouble': 'Software Troubleshooting',
  'software-troubleshooting': 'Software Troubleshooting',
  'virus-removal': 'Virus Removal',
  'cooling-repair': 'Cooling System Repair',
  'power-jack': 'Power Jack Repair',
  'power-jack-repair': 'Power Jack Repair',
  other: 'Other Repair',
};

export default function ScheduleConfirmStep({
  methods,
  timeSlots,
  isLoadingTimeSlots,
  agreeToTerms,
  setAgreeToTerms,
  submitAttempted,
  pricingData,
  quotedPrice,
  brandsData,
  modelsData,
  servicesData,
  validatedSteps,
  scrollToElement,
  watchedAppointmentDate,
}: ScheduleConfirmStepProps) {
  const showValidationErrors = validatedSteps.includes(2);

  const tomorrowDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  }, []);

  const formData = methods.getValues();
  const displayBrand =
    formData.deviceBrand === 'other' ? formData.customBrand : formData.deviceBrand;

  const getServiceDisplay = (st: string | string[]) => {
    if (Array.isArray(st)) {
      return st.map((s) => SERVICE_TYPE_MAP[s] || s).join(', ');
    }
    return SERVICE_TYPE_MAP[st as string] || st;
  };

  return (
    <div className="space-y-8">
      {/* ─── Appointment Scheduling ────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="glass-section-header">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Schedule Your Appointment</h3>
          <p className="text-sm text-primary-700">
            Choose your preferred date and time for the repair. Our technician will arrive during your selected
            timeframe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="appointmentDate"
              control={methods.control}
              rules={{ required: 'Date is required' }}
              render={({ field, fieldState }) => (
                <>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400 pointer-events-none" />
                    <input
                      type="date"
                      className={`glass-input w-full pl-10 ${fieldState.error ? 'invalid' : ''}`}
                      min={tomorrowDate}
                      max={maxDate}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) scrollToElement('#time-slot-selection', 400);
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-primary-500">We accept bookings up to 60 days in advance.</p>
                  {fieldState.error && showValidationErrors && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Time */}
          <div id="time-slot-selection">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Preferred Time <span className="text-red-500">*</span>
            </label>
            <Controller
              name="appointmentTime"
              control={methods.control}
              rules={{ required: 'Time slot is required' }}
              render={({ field, fieldState }) => (
                <>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400 pointer-events-none" />
                    <select
                      className={`glass-input w-full pl-10 appearance-none ${fieldState.error ? 'invalid' : ''}`}
                      {...field}
                      value={field.value || ''}
                      disabled={isLoadingTimeSlots || !watchedAppointmentDate}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) scrollToElement('#terms-section', 500);
                      }}
                    >
                      <option value="">
                        {!watchedAppointmentDate
                          ? 'Select a date first'
                          : isLoadingTimeSlots
                          ? 'Loading available slots...'
                          : timeSlots.length === 0
                          ? 'No slots available for this date'
                          : 'Select a time slot...'}
                      </option>
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-primary-500">Our technicians work 7 days a week.</p>
                  {fieldState.error && showValidationErrors && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        {/* Additional notes */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Additional Notes (Optional)</label>
          <Controller
            name="issueDescription"
            control={methods.control}
            render={({ field }) => (
              <textarea
                className="glass-input w-full"
                rows={3}
                placeholder="Any special instructions about access to your location, parking details, or additional information..."
                {...field}
              />
            )}
          />
        </div>

        {/* Important info */}
        <div className="glass-info-banner">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-primary-700" />
            <h3 className="text-base font-medium text-primary-900">Important Information</h3>
          </div>
          <ul className="space-y-2 ml-7">
            {[
              'Our technician will call to confirm your appointment.',
              "We'll arrive within your selected time window.",
              'Please ensure someone (18+) will be present.',
            ].map((text) => (
              <li key={text} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary-700 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-primary-800">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Booking Review ────────────────────────────────────────────── */}
      <div className="border-t border-primary-200/50 pt-8 space-y-6">
        <div className="glass-success-banner flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Please review your booking details below and click &quot;Submit Booking&quot; when ready.
          </p>
        </div>

        <div className="divide-y divide-primary-200/50">
          {/* Device Details */}
          <div className="py-4">
            <h3 className="text-lg font-medium text-primary-900 mb-3">Device Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-primary-500">Device Type</dt>
                <dd className="mt-1 text-sm text-primary-900 capitalize">{formData.deviceType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-primary-500">Brand</dt>
                <dd className="mt-1 text-sm text-primary-900 capitalize">{displayBrand}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-primary-500">Model</dt>
                <dd className="mt-1 text-sm text-primary-900">{formData.deviceModel}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-primary-500">
                  Service{Array.isArray(formData.serviceType) && formData.serviceType.length > 1 ? 's' : ''}
                </dt>
                <dd className="mt-1 text-sm text-primary-900">{getServiceDisplay(formData.serviceType)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-primary-500">Service Tier & Pricing</dt>
                <dd className="mt-1">
                  <div className="glass-surface-light rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary-900">
                        {formData.pricingTier === 'premium' ? 'Premium Service' : 'Standard Repair'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formData.pricingTier === 'premium'
                            ? 'bg-amber-100/80 text-amber-800'
                            : 'bg-primary-100/80 text-primary-900'
                        }`}
                      >
                        {formData.pricingTier === 'premium' ? 'Express Service' : 'Most Popular'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-primary-600">Warranty:</span>
                        <span className="ml-2 font-medium">
                          {formData.pricingTier === 'premium' ? '6 Months' : '3 Months'}
                        </span>
                      </div>
                      <div>
                        <span className="text-primary-600">Turnaround:</span>
                        <span className="ml-2 font-medium">
                          {formData.pricingTier === 'premium' ? '12-24 Hours' : '24-48 Hours'}
                        </span>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              {formData.issueDescription && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-primary-500">Issue Description</dt>
                  <dd className="mt-1 text-sm text-primary-900">{formData.issueDescription}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Contact Details */}
          <div className="py-4">
            <h3 className="text-lg font-medium text-primary-900 mb-3">Contact Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-primary-500">Name</dt>
                <dd className="mt-1 text-sm text-primary-900">{formData.customerName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-primary-500">Phone</dt>
                <dd className="mt-1 text-sm text-primary-900">{formData.customerPhone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-primary-500">Email</dt>
                <dd className="mt-1 text-sm text-primary-900">{formData.customerEmail}</dd>
              </div>
            </dl>
          </div>

          {/* Location */}
          <div className="py-4">
            <h3 className="text-lg font-medium text-primary-900 mb-3">Location</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-primary-500">Address</dt>
                <dd className="mt-1 text-sm text-primary-900">{formData.address}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-primary-500">City</dt>
                <dd className="mt-1 text-sm text-primary-900">{formData.city}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-primary-500">Postal Code</dt>
                <dd className="mt-1 text-sm text-primary-900">{formData.postalCode}</dd>
              </div>
            </dl>
          </div>

          {/* Appointment */}
          <div className="py-4">
            <h3 className="text-lg font-medium text-primary-900 mb-3">Appointment</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-primary-500">Date</dt>
                <dd className="mt-1 text-sm text-primary-900">{formatDate(formData.appointmentDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-primary-500">Time</dt>
                <dd className="mt-1 text-sm text-primary-900">
                  {formData.appointmentTime ? formatTimeSlot(formData.appointmentTime) : 'Not selected'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Final Pricing Summary */}
        <PriceDisplay
          deviceType={formData.deviceType}
          brand={formData.deviceBrand}
          model={formData.deviceModel}
          services={formData.serviceType}
          tier={formData.pricingTier || 'standard'}
          postalCode={formData.postalCode}
          enabled={true}
          className="mt-6"
        />

        {/* Terms */}
        <div id="terms-section" className="border-t border-primary-200/50 pt-6">
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              className="h-5 w-5 mt-0.5 text-primary-600 focus:ring-primary-400 border-primary-300 rounded transition-all duration-300"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
            <div className="text-sm">
              <label htmlFor="terms" className="font-medium text-primary-700 cursor-pointer">
                I agree to the terms and conditions <span className="text-red-500">*</span>
              </label>
              <p className="text-primary-500 mt-1">
                By submitting this booking, you agree to our{' '}
                <a href="/terms-conditions" className="text-primary-600 hover:text-primary-800 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="text-primary-600 hover:text-primary-800 underline">
                  Privacy Policy
                </a>
                .
              </p>
              {submitAttempted && !agreeToTerms && (
                <p className="mt-2 text-sm text-red-600">You must agree to the terms and conditions to proceed</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
