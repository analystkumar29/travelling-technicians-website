import React from 'react';
import { FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Loader2, Home, Zap, ShieldCheck } from 'lucide-react';
import FloatingProgress from './FloatingProgress';
import { useBookingController } from '@/hooks/useBookingController';
import DeviceServiceStep from './steps/DeviceServiceStep';
import ContactLocationStep from './steps/ContactLocationStep';
import ScheduleConfirmStep from './steps/ScheduleConfirmStep';
import type { CreateBookingRequest } from '@/types/booking';

interface BookingFormProps {
  onSubmit: (data: CreateBookingRequest) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateBookingRequest>;
}

const liquidSpring = { type: 'spring' as const, stiffness: 300, damping: 30 };

const WHY_CHOOSE_ITEMS = [
  { Icon: Home, title: 'Convenience', desc: 'We come to you' },
  { Icon: Zap, title: 'Speed', desc: '30-60 min repairs' },
  { Icon: ShieldCheck, title: 'Quality', desc: 'Certified techs' },
] as const;

export default function BookingForm({ onSubmit, onCancel, initialData = {} }: BookingFormProps) {
  const controller = useBookingController({ onSubmit, initialData });
  const { methods, currentStep, steps } = controller;

  // Detect slide direction for animation
  const [slideDirection, setSlideDirection] = React.useState(1);

  const handleNext = async () => {
    setSlideDirection(1);
    await controller.nextStep();
  };

  const handlePrev = () => {
    setSlideDirection(-1);
    controller.prevStep();
  };

  // ── Error Summary ────────────────────────────────────────────────────
  const getCurrentStepErrors = () => {
    const errors = methods.formState.errors;
    const errorFields: string[] = [];
    if (!controller.validatedSteps.includes(currentStep)) return errorFields;
    switch (currentStep) {
      case 0:
        if (errors.deviceType) errorFields.push('Device Type');
        if (errors.deviceBrand) errorFields.push('Brand');
        if (errors.customBrand) errorFields.push('Custom Brand');
        if (errors.deviceModel) errorFields.push('Model');
        if (errors.serviceType) errorFields.push('Service Type');
        if (errors.pricingTier) errorFields.push('Service Tier');
        break;
      case 1:
        if (errors.customerName) errorFields.push('Full Name');
        if (errors.customerEmail) errorFields.push('Email Address');
        if (errors.customerPhone) errorFields.push('Phone Number');
        if (errors.address) errorFields.push('Address');
        if (errors.city) errorFields.push('City');
        if (errors.postalCode) errorFields.push('Postal Code');
        break;
      case 2:
        if (errors.appointmentDate) errorFields.push('Appointment Date');
        if (errors.appointmentTime) errorFields.push('Appointment Time');
        break;
    }
    return errorFields;
  };

  const errorFields = getCurrentStepErrors();

  return (
    <>
      <FloatingProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        stepNames={steps}
      />

      <div className="glass-form-container p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-primary-800">
          <span className="relative inline-block">
            Book Your Doorstep Repair
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-400 to-accent-400 opacity-60 rounded-full"></span>
          </span>
        </h2>

        {/* Why Choose Banner */}
        <div className="mb-6 sm:mb-8 glass-surface-light rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHY_CHOOSE_ITEMS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-white/40 transition-all duration-300 cursor-default group"
              >
                <div className="bg-primary-600/90 rounded-full p-3 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-bold text-primary-700 text-sm mb-0.5">{title}</h4>
                <p className="text-xs text-primary-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (currentStep === steps.length - 1) {
                controller.handleFinalSubmit();
              } else {
                await handleNext();
              }
            }}
          >
            {/* Error summary */}
            {errorFields.length > 0 && controller.formTouched && (
              <div className="bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200/50 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                      {errorFields.map((f) => (
                        <li key={f}>{f} is required</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step content with liquid transitions */}
            <div className="mb-6 sm:mb-8 glass-surface-light p-4 sm:p-6 rounded-xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: slideDirection * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDirection * -40 }}
                  transition={liquidSpring}
                  className="step-content"
                >
                  {currentStep === 0 && (
                    <DeviceServiceStep
                      methods={methods}
                      brandsData={controller.brandsData}
                      brandsLoading={controller.brandsLoading}
                      modelsData={controller.modelsData}
                      modelsLoading={controller.modelsLoading}
                      servicesData={controller.servicesData}
                      servicesLoading={controller.servicesLoading}
                      pricingData={controller.pricingData}
                      quotedPrice={controller.quotedPrice}
                      validatedSteps={controller.validatedSteps}
                      visibleSections={controller.visibleSections}
                      showBrandWarning={controller.showBrandWarning}
                      revealSection={controller.revealSection}
                      scrollToElement={controller.scrollToElement}
                      handleModelSelectionAttempt={controller.handleModelSelectionAttempt}
                      getBrandLogo={controller.getBrandLogo}
                      getServiceIcon={controller.getServiceIcon}
                      selectedBrandId={controller.selectedBrandId}
                      setSelectedBrandId={controller.setSelectedBrandId}
                      selectedModelId={controller.selectedModelId}
                      setSelectedModelId={controller.setSelectedModelId}
                      watchedDeviceType={controller.watchedDeviceType}
                      watchedDeviceBrand={controller.watchedDeviceBrand}
                      watchedDeviceModel={controller.watchedDeviceModel}
                      watchedServiceType={controller.watchedServiceType}
                      watchedPricingTier={controller.watchedPricingTier}
                    />
                  )}
                  {currentStep === 1 && (
                    <ContactLocationStep
                      methods={methods}
                      validatedSteps={controller.validatedSteps}
                      locationWasPreFilled={controller.locationWasPreFilled}
                      detectingLocation={controller.detectingLocation}
                      needsPostalCodeAttention={controller.needsPostalCodeAttention}
                      scrollToElement={controller.scrollToElement}
                      detectCurrentLocation={controller.detectCurrentLocation}
                      handleAddressSelect={controller.handleAddressSelect}
                      setNeedsPostalCodeAttention={controller.setNeedsPostalCodeAttention}
                    />
                  )}
                  {currentStep === 2 && (
                    <ScheduleConfirmStep
                      methods={methods}
                      timeSlots={controller.timeSlots}
                      isLoadingTimeSlots={controller.isLoadingTimeSlots}
                      agreeToTerms={controller.agreeToTerms}
                      setAgreeToTerms={controller.setAgreeToTerms}
                      submitAttempted={controller.submitAttempted}
                      pricingData={controller.pricingData}
                      quotedPrice={controller.quotedPrice}
                      brandsData={controller.brandsData}
                      modelsData={controller.modelsData}
                      servicesData={controller.servicesData}
                      validatedSteps={controller.validatedSteps}
                      scrollToElement={controller.scrollToElement}
                      watchedAppointmentDate={controller.watchedAppointmentDate}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div id="form-navigation" className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="glass-btn-outline w-full sm:w-auto px-6 py-3 flex items-center justify-center"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCancel}
                  className="glass-btn-outline w-full sm:w-auto px-6 py-3"
                >
                  Cancel
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="glass-btn-primary w-full sm:w-auto px-6 py-3 flex items-center justify-center"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={controller.handleFinalSubmit}
                  className="glass-btn-accent w-full sm:w-auto px-6 py-3 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={controller.isSubmitting || methods.formState.isSubmitting}
                >
                  {controller.isSubmitting || methods.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Booking
                      <Check className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Mobile Swipe Indicator */}
      {controller.showSwipeIndicator && (
        <div className="swipe-indicator visible">Swipe or tap Next to continue</div>
      )}
    </>
  );
}
