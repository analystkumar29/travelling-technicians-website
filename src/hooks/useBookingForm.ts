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
   * Validate the current step of the form
   */
  const validateCurrentStep = useCallback(() => {
    switch (state.currentStep) {
      case 1:
        {
          const { isValid, errors } = validators.deviceInfo(state);
          dispatch({ type: 'VALIDATE_STEP', payload: { step: 1, isValid, errors } });
          return isValid;
        }
      case 2:
        {
          const { isValid, errors } = validators.serviceInfo(state);
          dispatch({ type: 'VALIDATE_STEP', payload: { step: 2, isValid, errors } });
          return isValid;
        }
      case 3:
        {
          const { isValid, errors } = validators.locationInfo(state);
          dispatch({ type: 'VALIDATE_STEP', payload: { step: 3, isValid, errors } });
          return isValid;
        }
      case 4:
        {
          const { isValid, errors } = validators.appointmentInfo(state);
          dispatch({ type: 'VALIDATE_STEP', payload: { step: 4, isValid, errors } });
          return isValid;
        }
      case 5:
        {
          const { isValid, errors } = validators.customerInfo(state);
          dispatch({ type: 'VALIDATE_STEP', payload: { step: 5, isValid, errors } });
          return isValid;
        }
      default:
        return false;
    }
  }, [state]);
  
  /**
   * Move to the next step if the current step is valid
   */
  const goToNextStep = useCallback(() => {
    const isValid = validateCurrentStep();
    
    if (isValid) {
      dispatch({ type: 'NEXT_STEP' });
      return true;
    } else {
      dispatch({ type: 'SHOW_ERRORS', payload: true });
      return false;
    }
  }, [validateCurrentStep]);
  
  /**
   * Move to the previous step
   */
  const goToPrevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);
  
  /**
   * Create the form data object for submission
   */
  const getFormData = useCallback(() => {
    const { deviceInfo, serviceInfo, locationInfo, appointmentInfo, customerInfo } = state;
    
    return {
      deviceType: deviceInfo.deviceType as DeviceType,
      deviceBrand: deviceInfo.deviceBrand,
      deviceModel: deviceInfo.deviceModel,
      serviceType: serviceInfo.serviceType,
      issueDescription: serviceInfo.issueDescription,
      appointmentDate: appointmentInfo.date,
      appointmentTime: appointmentInfo.timeSlot,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      address: locationInfo.address,
      postalCode: locationInfo.postalCode,
    };
  }, [state]);
  
  /**
   * Check if the form is complete and ready for submission
   */
  const isFormComplete = useCallback(() => {
    const { validation } = state;
    
    return (
      validation.deviceInfoValid &&
      validation.serviceInfoValid &&
      validation.locationInfoValid &&
      validation.appointmentInfoValid &&
      validation.customerInfoValid
    );
  }, [state]);
  
  return {
    state,
    dispatch,
    goToNextStep,
    goToPrevStep,
    validateCurrentStep,
    getFormData,
    isFormComplete,
  };
} 