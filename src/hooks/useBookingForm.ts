import { useReducer, useCallback } from 'react';
import { DeviceType } from '../types/booking';
import { logger } from '../utils/logger';

// Logger for this module
const formLogger = logger.createModuleLogger('BookingForm');

/**
 * State interface for the booking form
 */
export interface BookingFormState {
  // Current step in the multi-step form
  currentStep: number;
  
  // Device information
  deviceInfo: {
    deviceType: DeviceType | '';
    deviceBrand: string;
    deviceModel: string;
  };
  
  // Service information
  serviceInfo: {
    serviceType: string;
    issueDescription: string;
  };
  
  // Location information
  locationInfo: {
    address: string;
    postalCode: string;
    isValidPostalCode: boolean;
    isAddressValid: boolean;
    serviceAreaResult: {
      city: string;
      serviceable: boolean;
      sameDay: boolean;
      travelFee?: number;
      responseTime: string;
    } | null;
  };
  
  // Appointment information
  appointmentInfo: {
    date: string;
    timeSlot: string;
  };
  
  // Customer information
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    contactConsent: boolean;
  };
  
  // Form validation
  validation: {
    deviceInfoValid: boolean;
    serviceInfoValid: boolean;
    locationInfoValid: boolean;
    appointmentInfoValid: boolean;
    customerInfoValid: boolean;
    formErrors: Record<string, string>;
    showErrors: boolean;
  };
  
  // Form submission
  submission: {
    isSubmitting: boolean;
    isSubmitSuccess: boolean;
    submitError: string | null;
    bookingReference: string | null;
    bookingData: any | null;
  };
}

/**
 * Initial state for the booking form
 */
const initialState: BookingFormState = {
  currentStep: 1,
  
  deviceInfo: {
    deviceType: '',
    deviceBrand: '',
    deviceModel: '',
  },
  
  serviceInfo: {
    serviceType: '',
    issueDescription: '',
  },
  
  locationInfo: {
    address: '',
    postalCode: '',
    isValidPostalCode: false,
    isAddressValid: false,
    serviceAreaResult: null,
  },
  
  appointmentInfo: {
    date: '',
    timeSlot: '',
  },
  
  customerInfo: {
    name: '',
    email: '',
    phone: '',
    contactConsent: true,
  },
  
  validation: {
    deviceInfoValid: false,
    serviceInfoValid: false,
    locationInfoValid: false,
    appointmentInfoValid: false,
    customerInfoValid: false,
    formErrors: {},
    showErrors: false,
  },
  
  submission: {
    isSubmitting: false,
    isSubmitSuccess: false,
    submitError: null,
    bookingReference: null,
    bookingData: null,
  },
};

/**
 * Action types for the booking form reducer
 */
export type BookingFormAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_DEVICE_INFO'; payload: Partial<BookingFormState['deviceInfo']> }
  | { type: 'UPDATE_SERVICE_INFO'; payload: Partial<BookingFormState['serviceInfo']> }
  | { type: 'UPDATE_LOCATION_INFO'; payload: Partial<BookingFormState['locationInfo']> }
  | { type: 'UPDATE_APPOINTMENT_INFO'; payload: Partial<BookingFormState['appointmentInfo']> }
  | { type: 'UPDATE_CUSTOMER_INFO'; payload: Partial<BookingFormState['customerInfo']> }
  | { type: 'VALIDATE_STEP'; payload: { step: number; isValid: boolean; errors?: Record<string, string> } }
  | { type: 'SHOW_ERRORS'; payload: boolean }
  | { type: 'SUBMIT_FORM_START' }
  | { type: 'SUBMIT_FORM_SUCCESS'; payload: { bookingReference: string; bookingData: any } }
  | { type: 'SUBMIT_FORM_ERROR'; payload: string }
  | { type: 'RESET_FORM' };

/**
 * Validator functions for each step of the form
 */
const validators = {
  deviceInfo: (state: BookingFormState): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const { deviceType, deviceBrand, deviceModel } = state.deviceInfo;
    
    if (!deviceType) {
      errors.deviceType = 'Please select a device type';
    }
    
    if (!deviceBrand) {
      errors.deviceBrand = 'Please select a device brand';
    }
    
    if (!deviceModel) {
      errors.deviceModel = 'Please enter a device model';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
  
  serviceInfo: (state: BookingFormState): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const { serviceType } = state.serviceInfo;
    
    if (!serviceType) {
      errors.serviceType = 'Please select a service type';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
  
  locationInfo: (state: BookingFormState): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const { address, isAddressValid, isValidPostalCode, serviceAreaResult } = state.locationInfo;
    
    // For step 3, we only care about valid postal code and serviceable area
    if (state.currentStep === 3) {
      // Check if postal code is valid
      if (!isValidPostalCode) {
        errors.postalCode = 'Please enter a valid postal code';
      }
      
      // Check if the area is serviceable
      if (!serviceAreaResult?.serviceable) {
        errors.serviceArea = 'We don\'t currently service this area';
      }
    } else {
      // For later steps, validate address too
      if (!address) {
        errors.address = 'Please enter an address';
      } else if (!isAddressValid) {
        errors.address = 'Please enter a valid address';
      }
      
      if (!isValidPostalCode) {
        errors.postalCode = 'Please enter a valid postal code';
      }
      
      if (!serviceAreaResult?.serviceable) {
        errors.serviceArea = 'We don\'t currently service this area';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
  
  appointmentInfo: (state: BookingFormState): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const { date, timeSlot } = state.appointmentInfo;
    
    if (!date) {
      errors.date = 'Please select a date';
    }
    
    if (!timeSlot) {
      errors.timeSlot = 'Please select a time slot';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
  
  customerInfo: (state: BookingFormState): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const { name, email, phone } = state.customerInfo;
    
    if (!name) {
      errors.name = 'Please enter your name';
    }
    
    if (!email) {
      errors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!phone) {
      errors.phone = 'Please enter your phone number';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

/**
 * Reducer function for the booking form
 */
function bookingFormReducer(state: BookingFormState, action: BookingFormAction): BookingFormState {
  formLogger.debug(`Reducer action: ${action.type}`);
  
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
      
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 5),
      };
      
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
      
    case 'UPDATE_DEVICE_INFO':
      return {
        ...state,
        deviceInfo: {
          ...state.deviceInfo,
          ...action.payload,
        },
      };
      
    case 'UPDATE_SERVICE_INFO':
      return {
        ...state,
        serviceInfo: {
          ...state.serviceInfo,
          ...action.payload,
        },
      };
      
    case 'UPDATE_LOCATION_INFO':
      return {
        ...state,
        locationInfo: {
          ...state.locationInfo,
          ...action.payload,
        },
      };
      
    case 'UPDATE_APPOINTMENT_INFO':
      return {
        ...state,
        appointmentInfo: {
          ...state.appointmentInfo,
          ...action.payload,
        },
      };
      
    case 'UPDATE_CUSTOMER_INFO':
      return {
        ...state,
        customerInfo: {
          ...state.customerInfo,
          ...action.payload,
        },
      };
      
    case 'VALIDATE_STEP':
      const { step, isValid, errors = {} } = action.payload;
      const validationKey = getValidationKeyForStep(step);
      
      if (!validationKey) {
        return state;
      }
      
      return {
        ...state,
        validation: {
          ...state.validation,
          [validationKey]: isValid,
          formErrors: {
            ...state.validation.formErrors,
            ...errors,
          },
        },
      };
      
    case 'SHOW_ERRORS':
      return {
        ...state,
        validation: {
          ...state.validation,
          showErrors: action.payload,
        },
      };
      
    case 'SUBMIT_FORM_START':
      return {
        ...state,
        submission: {
          ...state.submission,
          isSubmitting: true,
          isSubmitSuccess: false,
          submitError: null,
        },
      };
      
    case 'SUBMIT_FORM_SUCCESS':
      return {
        ...state,
        submission: {
          ...state.submission,
          isSubmitting: false,
          isSubmitSuccess: true,
          submitError: null,
          bookingReference: action.payload.bookingReference,
          bookingData: action.payload.bookingData,
        },
      };
      
    case 'SUBMIT_FORM_ERROR':
      return {
        ...state,
        submission: {
          ...state.submission,
          isSubmitting: false,
          isSubmitSuccess: false,
          submitError: action.payload,
        },
      };
      
    case 'RESET_FORM':
      return initialState;
      
    default:
      return state;
  }
}

/**
 * Maps step number to validation key
 */
function getValidationKeyForStep(step: number): keyof BookingFormState['validation'] | null {
  switch (step) {
    case 1:
      return 'deviceInfoValid';
    case 2:
      return 'serviceInfoValid';
    case 3:
      return 'locationInfoValid';
    case 4:
      return 'appointmentInfoValid';
    case 5:
      return 'customerInfoValid';
    default:
      return null;
  }
}

/**
 * Custom hook for managing booking form state
 */
export function useBookingForm() {
  const [state, dispatch] = useReducer(bookingFormReducer, initialState);
  
  /**
   * Validate the current step and show errors if needed
   */
  const validateCurrentStep = useCallback((): boolean => {
    const validationKey = getValidationKeyForStep(state.currentStep);
    if (!validationKey) return true;

    // Map validation keys to their corresponding validator functions
    const validatorMap: Record<string, string> = {
      deviceInfoValid: 'deviceInfo',
      serviceInfoValid: 'serviceInfo',
      locationInfoValid: 'locationInfo',
      appointmentInfoValid: 'appointmentInfo',
      customerInfoValid: 'customerInfo'
    };

    // Only proceed with validation if we have a valid key
    if (!Object.keys(validatorMap).includes(validationKey)) {
      formLogger.error(`Invalid validation key: ${validationKey}`);
      return false;
    }

    // Get the correct validator function name based on the validation key
    const validatorKey = validatorMap[validationKey];
    
    // Check that the validator function exists before calling it
    if (!validatorKey || typeof validators[validatorKey as keyof typeof validators] !== 'function') {
      formLogger.error(`Validator not found for key: ${validationKey}`);
      return false;
    }
    
    try {
      const { isValid, errors } = validators[validatorKey as keyof typeof validators](state);
      
      dispatch({ 
        type: 'VALIDATE_STEP', 
        payload: { 
          step: state.currentStep,
          isValid,
          errors: errors || {}
        } 
      });
      
      return isValid;
    } catch (err) {
      formLogger.error(`Error in validation: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [state]);
  
  /**
   * Move to the next step if the current step is valid
   */
  const goToNextStep = useCallback((): boolean => {
    if (validateCurrentStep()) {
      dispatch({ type: 'NEXT_STEP' });
      return true;
    }
    return false;
  }, [validateCurrentStep]);
  
  /**
   * Move to the previous step
   */
  const goToPreviousStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);
  
  /**
   * Update device information
   */
  const setDeviceInfo = useCallback((data: Partial<BookingFormState['deviceInfo']>) => {
    dispatch({ 
      type: 'UPDATE_DEVICE_INFO', 
      payload: data 
    });
  }, []);
  
  /**
   * Update service information
   */
  const setServiceInfo = useCallback((data: Partial<BookingFormState['serviceInfo']>) => {
    dispatch({ 
      type: 'UPDATE_SERVICE_INFO', 
      payload: data 
    });
  }, []);
  
  /**
   * Update location information
   */
  const setLocationInfo = useCallback((data: Partial<BookingFormState['locationInfo']>) => {
    dispatch({ 
      type: 'UPDATE_LOCATION_INFO', 
      payload: data 
    });
  }, []);
  
  /**
   * Update appointment information
   */
  const setAppointmentInfo = useCallback((data: Partial<BookingFormState['appointmentInfo']>) => {
    dispatch({ 
      type: 'UPDATE_APPOINTMENT_INFO', 
      payload: data 
    });
  }, []);
  
  /**
   * Update customer information
   */
  const setCustomerInfo = useCallback((data: Partial<BookingFormState['customerInfo']>) => {
    dispatch({ 
      type: 'UPDATE_CUSTOMER_INFO', 
      payload: data 
    });
  }, []);
  
  /**
   * Submit the form
   */
  const submitForm = useCallback(async () => {
    if (!validateCurrentStep()) {
      dispatch({ type: 'SHOW_ERRORS', payload: true });
      return false;
    }

    dispatch({ type: 'SUBMIT_FORM_START' });
    
    try {
      // Implementation would go here to submit the form data
      // and set the success or error state
      return true;
    } catch (error) {
      dispatch({ 
        type: 'SUBMIT_FORM_ERROR', 
        payload: error instanceof Error ? error.message : 'An error occurred' 
      });
      return false;
    }
  }, [validateCurrentStep]);
  
  /**
   * Get the complete form data
   */
  const getFormData = useCallback(() => {
    return {
      deviceType: state.deviceInfo.deviceType,
      deviceBrand: state.deviceInfo.deviceBrand,
      deviceModel: state.deviceInfo.deviceModel,
      serviceType: state.serviceInfo.serviceType,
      issueDescription: state.serviceInfo.issueDescription,
      address: state.locationInfo.address,
      postalCode: state.locationInfo.postalCode,
      appointmentDate: state.appointmentInfo.date,
      appointmentTime: state.appointmentInfo.timeSlot,
      customerName: state.customerInfo.name,
      customerEmail: state.customerInfo.email,
      customerPhone: state.customerInfo.phone,
      contactConsent: state.customerInfo.contactConsent
    };
  }, [state]);
  
  /**
   * Check if the form is complete and valid
   */
  const isFormComplete = useCallback((): boolean => {
    return (
      state.validation.deviceInfoValid &&
      state.validation.serviceInfoValid &&
      state.validation.locationInfoValid &&
      state.validation.appointmentInfoValid &&
      state.validation.customerInfoValid
    );
  }, [state.validation]);
  
  return {
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
    submitForm,
    getFormData,
    isFormComplete
  };
} 