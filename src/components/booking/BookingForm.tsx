import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaTools, FaUser, FaCheck, FaSpinner, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import AddressAutocomplete from './AddressAutocomplete';
import PostalCodeChecker from '@/components/PostalCodeChecker';
import { availableTimes, serviceTypes, getAvailableDates } from '@/utils/bookingUtils';
import { useBookingForm } from '@/hooks/useBookingForm';
import { useBooking } from '@/context/BookingContext';
import { formatTimeSlot, formatServiceType, getDeviceTypeDisplay } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import StorageService, { STORAGE_KEYS } from '@/services/StorageService';

// Logger for this module
const bookingLogger = logger.createModuleLogger('BookingForm');

type ServiceAreaType = {
  city: string;
  serviceable: boolean;
  sameDay: boolean;
  travelFee?: number;
  responseTime: string;
};

export default function BookingForm() {
  // Use our custom hook for form state management
  const { 
    state, 
    dispatch, 
    validateCurrentStep,
    goToNextStep, 
    goToPreviousStep,
    setDeviceInfo,
    setServiceInfo,
    setLocationInfo,
    setAppointmentInfo,
    setCustomerInfo,
    submitForm
  } = useBookingForm();

  // Use our booking context
  const { createNewBooking } = useBooking();

  useEffect(() => {
    // Log when component mounts
    bookingLogger.debug('BookingForm mounted');
    
    return () => {
      // Log when component unmounts
      bookingLogger.debug('BookingForm unmounted');
    };
  }, []);

  // Handle successful postal code check
  const handlePostalCodeSuccess = (result: ServiceAreaType, code: string) => {
    bookingLogger.debug('Postal code check successful', { postalCode: code });
    
    setLocationInfo({
      postalCode: code,
      isValidPostalCode: true,
      serviceAreaResult: result
    });
  };
  
  // Handle postal code check error
  const handlePostalCodeError = (error: string) => {
    bookingLogger.debug('Postal code check failed', { error });
    
    setLocationInfo({
      isValidPostalCode: false,
      serviceAreaResult: null
    });
  };

  // Handle form step navigation
  const handleContinue = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    } else {
      // Show errors if validation fails
      dispatch({ type: 'SHOW_ERRORS', payload: true });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      dispatch({ type: 'SHOW_ERRORS', payload: true });
      return;
    }
    
    bookingLogger.info('Submitting booking form');
    dispatch({ type: 'SUBMIT_FORM_START' });
    
    try {
      const formData = {
        deviceType: state.deviceInfo.deviceType,
        deviceBrand: state.deviceInfo.deviceBrand,
        deviceModel: state.deviceInfo.deviceModel,
        serviceType: state.serviceInfo.serviceType,
        issueDescription: state.serviceInfo.issueDescription,
        appointmentDate: state.appointmentInfo.date,
        appointmentTime: state.appointmentInfo.timeSlot,
        customerName: state.customerInfo.name,
        customerEmail: state.customerInfo.email,
        customerPhone: state.customerInfo.phone,
        address: state.locationInfo.address,
        postalCode: state.locationInfo.postalCode
      };
      
      // Use our context function to create a booking
      const bookingReference = await createNewBooking(formData);
      
      if (bookingReference) {
        // Store necessary information in localStorage for the confirmation page
        StorageService.setItem(STORAGE_KEYS.BOOKING_REFERENCE, bookingReference);
        
        // Prepare formatted data for the confirmation page
        const formattedData = {
          ref: bookingReference,
          device: getDeviceTypeDisplay(
            state.deviceInfo.deviceType,
            state.deviceInfo.deviceBrand,
            state.deviceInfo.deviceModel
          ),
          service: formatServiceType(state.serviceInfo.serviceType),
          date: state.appointmentInfo.date,
          time: formatTimeSlot(state.appointmentInfo.timeSlot),
          address: state.locationInfo.address,
          email: state.customerInfo.email
        };
        
        // Store formatted data for the confirmation page
        StorageService.setItem('formattedBookingData', formattedData);
        
        // Redirect to confirmation page
        window.location.href = `/booking-confirmation?ref=${bookingReference}`;
        
        dispatch({
          type: 'SUBMIT_FORM_SUCCESS',
          payload: {
            bookingReference,
            bookingData: formData
          }
        });
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      bookingLogger.error('Form submission error', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      dispatch({
        type: 'SUBMIT_FORM_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to submit booking'
      });
    }
  };

  // Determine which step content to show
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return renderDeviceSelection();
      case 2:
        return renderServiceSelection();
      case 3:
        return renderLocationCheck();
      case 4:
        return renderScheduleSelection();
      case 5:
        return renderContactInfo();
      default:
        return null;
    }
  };

  // Step 1: Device Selection
  const renderDeviceSelection = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Select Your Device</h2>
        
        {state.validation.showErrors && !state.validation.deviceInfoValid && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm font-medium text-red-800">
              Please select all required device information:
            </div>
            <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
              {!state.deviceInfo.deviceType && <li>Device type is required</li>}
              {!state.deviceInfo.deviceBrand && <li>Device brand is required</li>}
              {!state.deviceInfo.deviceModel && <li>Device model is required</li>}
            </ul>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">Device Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                state.deviceInfo.deviceType === 'mobile' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-200'
              }`}
              onClick={() => setDeviceInfo({ deviceType: 'mobile' })}
            >
              <div className="mr-3 rounded-full bg-gray-100 p-2">
                <FaTools className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-medium">Mobile Phone</span>
            </button>
            
            <button
              type="button"
              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                state.deviceInfo.deviceType === 'tablet' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-200'
              }`}
              onClick={() => setDeviceInfo({ deviceType: 'tablet' })}
            >
              <div className="mr-3 rounded-full bg-gray-100 p-2">
                <FaTools className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-medium">Tablet</span>
            </button>
            
            <button
              type="button"
              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                state.deviceInfo.deviceType === 'laptop' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-200'
              }`}
              onClick={() => setDeviceInfo({ deviceType: 'laptop' })}
            >
              <div className="mr-3 rounded-full bg-gray-100 p-2">
                <FaTools className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-medium">Laptop</span>
            </button>
          </div>
        </div>
        
        {state.deviceInfo.deviceType && (
          <>
            <div className="mb-6">
              <label htmlFor="brand" className="block text-gray-700 font-medium mb-2">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Apple, Samsung, Dell"
                value={state.deviceInfo.deviceBrand}
                onChange={(e) => setDeviceInfo({ deviceBrand: e.target.value })}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="model" className="block text-gray-700 font-medium mb-2">
                Model
              </label>
              <input
                type="text"
                id="model"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., iPhone 13, Galaxy S22, XPS 15"
                value={state.deviceInfo.deviceModel}
                onChange={(e) => setDeviceInfo({ deviceModel: e.target.value })}
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end mt-8">
          <button
            type="button"
            className="btn-primary"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Step 2: Service Selection
  const renderServiceSelection = () => {
    // Get service types based on device type
    const services = state.deviceInfo.deviceType ? 
      serviceTypes[state.deviceInfo.deviceType as keyof typeof serviceTypes] || [] : 
      [];
    
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Select Service</h2>
        
        {state.validation.showErrors && !state.validation.serviceInfoValid && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm font-medium text-red-800">
              Please select a service type to continue
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">Service Type</label>
          <div className="grid grid-cols-1 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  state.serviceInfo.serviceType === service.id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-200'
                }`}
                onClick={() => setServiceInfo({ serviceType: service.id })}
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-100 p-2 mr-3">
                    <FaTools className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">{service.name}</span>
                    {service.doorstep && (
                      <span className="text-xs text-green-600">Available at Doorstep</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-gray-700 font-medium">
                  {service.price}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="issueDescription" className="block text-gray-700 font-medium mb-2">
            Describe the Issue
          </label>
          <textarea
            id="issueDescription"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Please provide additional details about the issue you're experiencing..."
            value={state.serviceInfo.issueDescription}
            onChange={(e) => setServiceInfo({ issueDescription: e.target.value })}
          ></textarea>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="btn-outline"
            onClick={goToPreviousStep}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Location Check
  const renderLocationCheck = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Check Service Availability</h2>
        
        <div className="mb-6">
          <div className="custom-postal-code-checker">
            <PostalCodeChecker 
              className="booking-form-checker"
              variant="default"
              onSuccess={handlePostalCodeSuccess}
              onError={handlePostalCodeError}
            />
          </div>
          
          {state.locationInfo.serviceAreaResult && (
            <div className="mt-8 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <FaCheck className="h-6 w-6 text-green-500 mr-2" />
                  <span className="font-medium text-green-800">
                    {state.locationInfo.serviceAreaResult.city} is available for service! 
                    {state.locationInfo.serviceAreaResult.sameDay && " Same-day service is available."}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={handleContinue}
              >
                Continue to Schedule
              </button>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <button
              type="button"
              className="btn-outline"
              onClick={goToPreviousStep}
            >
              Back to Previous Step
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Step 4: Schedule Selection
  const renderScheduleSelection = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Choose Appointment Time</h2>
        
        {state.validation.showErrors && !state.validation.appointmentInfoValid && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm font-medium text-red-800">
              Please complete all required fields to continue:
            </div>
            <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
              {!state.locationInfo.address && <li>Service address is required</li>}
              {state.locationInfo.address && !state.locationInfo.isAddressValid && 
                <li>The provided address is outside our service area</li>}
              {!state.appointmentInfo.date && <li>Appointment date is required</li>}
              {!state.appointmentInfo.timeSlot && <li>Appointment time is required</li>}
            </ul>
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
            Service Address *
          </label>
          <AddressAutocomplete
            onAddressSelect={(newAddress, isValid, postalCode) => {
              bookingLogger.debug('Address selected', { 
                address: newAddress, 
                isValid, 
                postalCode 
              });
              
              setLocationInfo({
                address: newAddress,
                isAddressValid: isValid,
                postalCode: postalCode || state.locationInfo.postalCode
              });
            }}
            value={state.locationInfo.address}
            error={state.validation.showErrors && !state.locationInfo.address}
          />
          {state.validation.showErrors && !state.locationInfo.address && (
            <p className="mt-1 text-sm text-red-600">Service address is required</p>
          )}
          {state.validation.showErrors && state.locationInfo.address && !state.locationInfo.isAddressValid && (
            <p className="mt-1 text-sm text-red-600">The provided address is outside our service area</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-primary-600" />
              Select Date *
            </div>
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {getAvailableDates().map((dateOption) => (
              <button
                key={dateOption.value}
                type="button"
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  dateOption.value === state.appointmentInfo.date 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-primary-200 text-gray-700'
                }`}
                onClick={() => setAppointmentInfo({ date: dateOption.value })}
              >
                <div className="text-xs font-medium mb-1">{dateOption.dayOfWeek}</div>
                <div>{dateOption.display}</div>
              </button>
            ))}
          </div>
          {state.validation.showErrors && !state.appointmentInfo.date && (
            <p className="mt-1 text-sm text-red-600">Please select an appointment date</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-primary-600" />
              Select Time *
            </div>
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableTimes.map((time) => (
              <button
                key={time.id}
                type="button"
                disabled={!state.appointmentInfo.date}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  time.id === state.appointmentInfo.timeSlot 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 hover:border-primary-200 text-gray-700'
                } ${!state.appointmentInfo.date ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={() => setAppointmentInfo({ timeSlot: time.id })}
              >
                {time.label}
              </button>
            ))}
          </div>
          {state.validation.showErrors && !state.appointmentInfo.timeSlot && (
            <p className="mt-1 text-sm text-red-600">Please select an appointment time</p>
          )}
          {!state.appointmentInfo.date && !state.validation.showErrors && (
            <p className="mt-1 text-sm text-gray-500">Please select a date first</p>
          )}
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="btn-outline"
            onClick={goToPreviousStep}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Step 5: Contact Information
  const renderContactInfo = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Contact Information</h2>
        
        {state.validation.showErrors && !state.validation.customerInfoValid && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm font-medium text-red-800">
              Please provide the following required information:
            </div>
            <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
              {!state.customerInfo.name && <li>Your name is required</li>}
              {!state.customerInfo.email && <li>Your email is required</li>}
              {state.customerInfo.email && state.validation.formErrors.email && 
                <li>{state.validation.formErrors.email}</li>}
              {!state.customerInfo.phone && <li>Your phone number is required</li>}
            </ul>
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="contactName" className="block text-gray-700 font-medium mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="contactName"
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              state.validation.showErrors && !state.customerInfo.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Full Name"
            value={state.customerInfo.name}
            onChange={(e) => setCustomerInfo({ name: e.target.value })}
          />
          {state.validation.showErrors && !state.customerInfo.name && (
            <p className="mt-1 text-sm text-red-600">Your name is required</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="contactEmail" className="block text-gray-700 font-medium mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="contactEmail"
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              state.validation.showErrors && (!state.customerInfo.email || state.validation.formErrors.email) 
                ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="email@example.com"
            value={state.customerInfo.email}
            onChange={(e) => setCustomerInfo({ email: e.target.value })}
          />
          {state.validation.showErrors && !state.customerInfo.email && (
            <p className="mt-1 text-sm text-red-600">Email address is required</p>
          )}
          {state.validation.showErrors && state.customerInfo.email && state.validation.formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{state.validation.formErrors.email}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="contactPhone" className="block text-gray-700 font-medium mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="contactPhone"
            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              state.validation.showErrors && !state.customerInfo.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="(123) 456-7890"
            value={state.customerInfo.phone}
            onChange={(e) => setCustomerInfo({ phone: e.target.value })}
          />
          {state.validation.showErrors && !state.customerInfo.phone && (
            <p className="mt-1 text-sm text-red-600">Phone number is required</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              checked={state.customerInfo.contactConsent}
              onChange={(e) => setCustomerInfo({ contactConsent: e.target.checked })}
            />
            <span className="ml-2 text-gray-700">
              I agree to receive updates about my repair via email and text
            </span>
          </label>
        </div>
        
        {/* Booking Summary */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Device:</span> {getDeviceTypeDisplay(
                state.deviceInfo.deviceType,
                state.deviceInfo.deviceBrand,
                state.deviceInfo.deviceModel
              )}
            </p>
            <p>
              <span className="font-medium">Service:</span> {formatServiceType(state.serviceInfo.serviceType)}
            </p>
            <p>
              <span className="font-medium">Date:</span> {state.appointmentInfo.date || 'Not selected'}
            </p>
            <p>
              <span className="font-medium">Time:</span> {formatTimeSlot(state.appointmentInfo.timeSlot) || 'Not selected'}
            </p>
            <p>
              <span className="font-medium">Address:</span> {state.locationInfo.address || 'Not provided'}
            </p>
          </div>
        </div>
        
        {state.submission.submitError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{state.submission.submitError}</p>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="btn-outline"
            onClick={goToPreviousStep}
            disabled={state.submission.isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={state.submission.isSubmitting}
          >
            {state.submission.isSubmitting ? (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </span>
            ) : (
              'Complete Booking'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="booking-form-container">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Book Your Repair</h1>
          <div className="text-sm text-gray-500">
            Step {state.currentStep} of 5
          </div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(state.currentStep / 5) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <form>
        {renderStepContent()}
      </form>
    </div>
  );
} 