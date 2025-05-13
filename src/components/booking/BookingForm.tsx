import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import DeviceModelSelector from './DeviceModelSelector';
// Comment out the non-existent imports for now
// import { DeviceTypeStep } from './steps/DeviceTypeStep';
// import { ServiceDetailsStep } from './steps/ServiceDetailsStep';
// import { CustomerInfoStep } from './steps/CustomerInfoStep';
// import { LocationStep } from './steps/LocationStep';
// import { AppointmentStep } from './steps/AppointmentStep';
// import { ConfirmationStep } from './steps/ConfirmationStep';
import type { CreateBookingRequest } from '@/types/booking';
import { 
  checkServiceArea, 
  getCurrentLocationPostalCode,
  isValidPostalCodeFormat,
  ServiceAreaType
} from '@/utils/locationUtils';
import { formatDate } from '@/utils/formatters';
import AddressAutocomplete from './AddressAutocomplete';

interface BookingFormProps {
  onSubmit: (data: CreateBookingRequest) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateBookingRequest>;
}

/**
 * Multi-step booking form component
 * Now includes an implementation for the Device Type step
 */
export default function BookingForm({ onSubmit, onCancel, initialData = {} }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [validatedSteps, setValidatedSteps] = useState<number[]>([]);
  // Add state for location pre-fill at the component level
  const [locationWasPreFilled, setLocationWasPreFilled] = useState(false);
  // Add the detectingLocation state at the component level
  const [detectingLocation, setDetectingLocation] = useState(false);
  // Move needsPostalCodeAttention to component level
  const [needsPostalCodeAttention, setNeedsPostalCodeAttention] = useState(false);

  // Create a properly typed defaultValues object
  const defaultValues: Partial<CreateBookingRequest> = {
      deviceType: initialData.deviceType || 'mobile',
      deviceBrand: initialData.deviceBrand || '',
      deviceModel: initialData.deviceModel || '',
    customBrand: initialData.customBrand || '',
      serviceType: initialData.serviceType || '',
      issueDescription: initialData.issueDescription || '',
      appointmentDate: initialData.appointmentDate || '',
      appointmentTime: initialData.appointmentTime || '',
      customerName: initialData.customerName || '',
      customerEmail: initialData.customerEmail || '',
      customerPhone: initialData.customerPhone || '',
      address: initialData.address || '',
      postalCode: initialData.postalCode || '',
  };
  
  // Add optional fields explicitly if they exist
  if ('city' in initialData || initialData.city) {
    defaultValues.city = initialData.city || 'Vancouver';
  } else {
    defaultValues.city = 'Vancouver';
  }
  
  if ('province' in initialData || initialData.province) {
    defaultValues.province = initialData.province || 'BC';
  } else {
    defaultValues.province = 'BC';
  }

  const methods = useForm<CreateBookingRequest>({
    defaultValues,
    mode: 'onChange', // Enable validation on change
    reValidateMode: 'onSubmit' // Only revalidate when submitted (i.e., when Next is clicked)
  });

  // Watch for deviceBrand changes to apply conditional validation for customBrand
  const deviceBrand = methods.watch('deviceBrand');
  
  // Apply conditional validation for customBrand
  useEffect(() => {
    const { unregister, register } = methods;
    
    // When deviceBrand is 'other', make customBrand required
    if (deviceBrand === 'other') {
      register('customBrand', { 
        required: 'Brand name is required' 
      });
    } else {
      // Unregister to remove validation when not needed
      unregister('customBrand');
    }
  }, [deviceBrand, methods]);

  // Check localStorage for saved address data when component mounts
  useEffect(() => {
    try {
      const savedLocationData = localStorage.getItem('travellingTech_location');
      
      if (savedLocationData) {
        const locationData = JSON.parse(savedLocationData);
        console.log('Found saved location data:', locationData);
        
        // Check if the data is still fresh (less than 24 hours old)
        const savedTime = new Date(locationData.timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && locationData.serviceable) {
          // Pre-populate the form fields with stored data
          methods.setValue('address', locationData.address || ''); // Use address from localStorage
          methods.setValue('postalCode', locationData.postalCode || '');
          methods.setValue('city', locationData.city || 'Vancouver');
          methods.setValue('province', locationData.province || 'BC');
          
          console.log('Pre-filled location fields from saved data');
          setLocationWasPreFilled(true);
        } else if (hoursDiff >= 24) {
          // Data is old, remove it
          localStorage.removeItem('travellingTech_location');
          console.log('Removed outdated location data');
    }
      }
    } catch (error) {
      console.error('Error parsing saved location data:', error);
    }
  }, [methods]);

  // Placeholder step titles
  const steps = [
    'Device Type',
    'Service Details',
    'Contact Info',
    'Location',
    'Appointment',
    'Confirm',
  ];

  // Validate the current step's fields before moving to the next step
  const validateStep = async (step: number): Promise<boolean> => {
    // Get the current form values
    const data = methods.getValues();
    
    // Define required fields for each step
    switch (step) {
      case 0: // Device Type
        // Validate device type, brand, and model
        if (!data.deviceType) {
          methods.setError('deviceType', { type: 'required', message: 'Please select a device type' });
          return false;
        }
        if (!data.deviceBrand) {
          methods.setError('deviceBrand', { type: 'required', message: 'Please select a brand' });
          return false;
        }
        // If brand is 'other', validate custom brand
        if (data.deviceBrand === 'other' && !data.customBrand) {
          methods.setError('customBrand', { type: 'required', message: 'Please enter a brand name' });
          return false;
        }
        if (!data.deviceModel) {
          methods.setError('deviceModel', { type: 'required', message: 'Please select or enter a model' });
          return false;
        }
        return true;
        
      case 1: // Service Details
        // Validate service type (issue description is optional)
        return await methods.trigger(['serviceType']);
        
      case 2: // Contact Info
        // Validate name, email, and phone
        return await methods.trigger(['customerName', 'customerEmail', 'customerPhone']);
        
      case 3: // Location
        // Validate address, city, and postal code
        return await methods.trigger(['address', 'city', 'postalCode']);
        
      case 4: // Appointment
        // Validate appointment date and time
        return await methods.trigger(['appointmentDate', 'appointmentTime']);
        
      default:
        return true;
    }
  };

  const nextStep = async () => {
    // Mark the form as touched when the user tries to go to the next step
    setFormTouched(true);
    
    // Add current step to validated steps
    if (!validatedSteps.includes(currentStep)) {
      setValidatedSteps([...validatedSteps, currentStep]);
    }
    
    // Get current form values
    const data = methods.getValues();
    let isValid = true;
    
    // Validate fields based on current step
    switch (currentStep) {
      case 0: // Device Type
        if (!data.deviceType) {
          methods.setError('deviceType', { type: 'required', message: 'Please select a device type' });
          isValid = false;
        }
        if (!data.deviceBrand) {
          methods.setError('deviceBrand', { type: 'required', message: 'Please select a brand' });
          isValid = false;
        }
        if (data.deviceBrand === 'other' && !data.customBrand) {
          methods.setError('customBrand', { type: 'required', message: 'Please enter a brand name' });
          isValid = false;
        }
        if (!data.deviceModel) {
          methods.setError('deviceModel', { type: 'required', message: 'Please select or enter a model' });
          isValid = false;
        }
        break;
        
      case 1: // Service Details
        isValid = await methods.trigger(['serviceType']);
        break;
        
      case 2: // Contact Info
        isValid = await methods.trigger(['customerName', 'customerEmail', 'customerPhone']);
        break;
        
      case 3: // Location
        isValid = await methods.trigger(['address', 'city', 'postalCode']);
        break;
        
      case 4: // Appointment
        isValid = await methods.trigger(['appointmentDate', 'appointmentTime']);
        break;
    }
    
    if (isValid) {
      // Increment the step
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      
      // Scroll to the top of the form container
      const formContainer = document.querySelector('.bg-white.rounded-lg.shadow-lg');
      if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Scroll to the first error
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (data: CreateBookingRequest) => {
    // If "other" brand is selected, use customBrand as the actual brand name
    if (data.deviceBrand === 'other' && data.customBrand) {
      data.brand = data.customBrand; // For DB triggers
    } else {
      data.brand = data.deviceBrand;
    }
    
    // Set model for DB triggers
    data.model = data.deviceModel;
    
    onSubmit(data);
  };
  
  // Render the Device Type step
  const renderDeviceTypeStep = () => {
    const deviceType = methods.watch('deviceType');
    
    // Debug output - remove this after fixing the issue
    console.log('Selected device type:', deviceType);
    
    // Force brand selection section to re-render when deviceType changes
    const deviceKey = `device-${deviceType}`;
    
    // Only show validation errors if this step has been validated
    const showValidationErrors = validatedSteps.includes(0);
    
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Device</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Type <span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative flex items-center">
              <Controller
                name="deviceType"
                control={methods.control}
                  rules={{ required: "Please select a device type" }}
                render={({ field }) => (
                  <input
                    type="radio"
                    className="sr-only"
                    value="mobile"
                    checked={field.value === 'mobile'}
                      onChange={() => {
                        field.onChange('mobile');
                        methods.setValue('deviceBrand', '');
                        methods.setValue('deviceModel', '');
                        console.log('Changed to mobile');
                      }}
                  />
                )}
              />
              <div className={`
                  p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                ${methods.watch('deviceType') === 'mobile' 
                  ? 'border-primary-500 bg-primary-50' 
                    : methods.formState.errors.deviceType 
                      ? 'border-red-300 hover:border-red-400' 
                      : 'border-gray-300 hover:border-gray-400'
                }
              `}>
                  <div className="bg-primary-100 rounded-md p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                  </div>
                  <span className="font-medium text-gray-900">Mobile Phone</span>
              </div>
            </label>
            
            <label className="relative flex items-center">
              <Controller
                name="deviceType"
                control={methods.control}
                  rules={{ required: "Please select a device type" }}
                render={({ field }) => (
                  <input
                    type="radio"
                    className="sr-only"
                    value="laptop"
                    checked={field.value === 'laptop'}
                      onChange={() => {
                        field.onChange('laptop');
                        methods.setValue('deviceBrand', '');
                        methods.setValue('deviceModel', '');
                        console.log('Changed to laptop');
                      }}
                  />
                )}
              />
              <div className={`
                  p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                ${methods.watch('deviceType') === 'laptop' 
                  ? 'border-primary-500 bg-primary-50' 
                    : methods.formState.errors.deviceType 
                      ? 'border-red-300 hover:border-red-400' 
                      : 'border-gray-300 hover:border-gray-400'
                }
              `}>
                  <div className="bg-primary-100 rounded-md p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                  </div>
                  <span className="font-medium text-gray-900">Laptop</span>
              </div>
            </label>
            
            <label className="relative flex items-center">
              <Controller
                name="deviceType"
                control={methods.control}
                  rules={{ required: "Please select a device type" }}
                render={({ field }) => (
                  <input
                    type="radio"
                    className="sr-only"
                    value="tablet"
                    checked={field.value === 'tablet'}
                      onChange={() => {
                        field.onChange('tablet');
                        methods.setValue('deviceBrand', '');
                        methods.setValue('deviceModel', '');
                        console.log('Changed to tablet');
                      }}
                  />
                )}
              />
              <div className={`
                  p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                ${methods.watch('deviceType') === 'tablet' 
                  ? 'border-primary-500 bg-primary-50' 
                    : methods.formState.errors.deviceType 
                      ? 'border-red-300 hover:border-red-400' 
                      : 'border-gray-300 hover:border-gray-400'
                }
              `}>
                  <div className="bg-primary-100 rounded-md p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                  </div>
                  <span className="font-medium text-gray-900">Tablet</span>
              </div>
            </label>
          </div>
            {methods.formState.errors.deviceType && showValidationErrors && (
              <p className="mt-1 text-sm text-red-600">{methods.formState.errors.deviceType.message}</p>
            )}
        </div>
        
          {deviceType && (
            <div className="mb-4" key={deviceKey}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              
              {/* Mobile device brands */}
              {deviceType === 'mobile' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <label className="relative flex items-center">
          <Controller
            name="deviceBrand"
            control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="apple"
                          checked={field.value === 'apple'}
                          onChange={() => {
                            field.onChange('apple');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'apple' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Apple</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="samsung"
                          checked={field.value === 'samsung'}
                          onChange={() => {
                            field.onChange('samsung');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'samsung' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Samsung</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="google"
                          checked={field.value === 'google'}
                          onChange={() => {
                            field.onChange('google');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'google' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Google</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="oneplus"
                          checked={field.value === 'oneplus'}
                          onChange={() => {
                            field.onChange('oneplus');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'oneplus' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">OnePlus</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="xiaomi"
                          checked={field.value === 'xiaomi'}
                          onChange={() => {
                            field.onChange('xiaomi');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'xiaomi' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Xiaomi</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="other"
                          checked={field.value === 'other'}
                          onChange={() => {
                            field.onChange('other');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'other' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Other</span>
                    </div>
                  </label>
                </div>
              )}
              
              {/* Laptop device brands */}
              {deviceType === 'laptop' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="apple"
                          checked={field.value === 'apple'}
                          onChange={() => {
                            field.onChange('apple');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'apple' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Apple</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="dell"
                          checked={field.value === 'dell'}
                          onChange={() => {
                            field.onChange('dell');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'dell' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Dell</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="hp"
                          checked={field.value === 'hp'}
                          onChange={() => {
                            field.onChange('hp');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'hp' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">HP</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="lenovo"
                          checked={field.value === 'lenovo'}
                          onChange={() => {
                            field.onChange('lenovo');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'lenovo' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Lenovo</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="asus"
                          checked={field.value === 'asus'}
                          onChange={() => {
                            field.onChange('asus');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'asus' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">ASUS</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="other"
                          checked={field.value === 'other'}
                          onChange={() => {
                            field.onChange('other');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'other' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Other</span>
                    </div>
                  </label>
                </div>
              )}
              
              {/* Tablet device brands */}
              {deviceType === 'tablet' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="apple"
                          checked={field.value === 'apple'}
                          onChange={() => {
                            field.onChange('apple');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'apple' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Apple</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="samsung"
                          checked={field.value === 'samsung'}
                          onChange={() => {
                            field.onChange('samsung');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'samsung' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Samsung</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="microsoft"
                          checked={field.value === 'microsoft'}
                          onChange={() => {
                            field.onChange('microsoft');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'microsoft' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Microsoft</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="lenovo"
                          checked={field.value === 'lenovo'}
                          onChange={() => {
                            field.onChange('lenovo');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'lenovo' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Lenovo</span>
                    </div>
                  </label>
                  
                  <label className="relative flex items-center">
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                          value="other"
                          checked={field.value === 'other'}
                          onChange={() => {
                            field.onChange('other');
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                    <div className={`
                      p-3 border-2 rounded-md flex items-center cursor-pointer transition w-full
                      ${methods.watch('deviceBrand') === 'other' 
                        ? 'border-primary-500 bg-primary-50' 
                        : methods.formState.errors.deviceBrand 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-300 hover:border-gray-400'
                      }
                    `}>
                      <span className="font-medium text-gray-900">Other</span>
                    </div>
                  </label>
                </div>
              )}
              
              {/* Error message for device brand */}
              {methods.formState.errors.deviceBrand && showValidationErrors && (
                <p className="mt-1 text-sm text-red-600">{methods.formState.errors.deviceBrand.message}</p>
              )}
              
              {/* Custom Brand Input (when "Other Brand" is selected) */}
              {methods.watch('deviceBrand') === 'other' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Brand Name <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="customBrand"
                    control={methods.control}
            render={({ field, fieldState }) => (
              <>
              <input
                type="text"
                  className={`
                            block w-full px-4 py-3 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                          placeholder="Enter brand name..."
                  {...field}
                />
                        {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
              />
            </div>
              )}
            </div>
          )}
          
          {deviceType && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              
          <Controller
            name="deviceModel"
            control={methods.control}
            rules={{ required: "Model is required" }}
            render={({ field, fieldState }) => (
              <>
                    <DeviceModelSelector
                      deviceType={methods.watch('deviceType')}
                      brand={methods.watch('deviceBrand')}
                      value={field.value}
                      onChange={field.onChange}
              />
                    {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
          </>
        )}
          />
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Our Doorstep Repair?</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700"><strong>Convenience:</strong> We come to your home or office</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700"><strong>Speed:</strong> Most repairs completed in 30-60 minutes</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700"><strong>Quality:</strong> High-quality parts & certified technicians</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the Service Details step
  const renderServiceDetailsStep = () => {
    const deviceType = methods.watch('deviceType');
    
    // Define services based on device type
    const services = {
      mobile: [
        { id: 'screen-replacement', label: 'Screen Replacement', doorstep: true },
        { id: 'battery-replacement', label: 'Battery Replacement', doorstep: true },
        { id: 'charging-port', label: 'Charging Port Repair', doorstep: true },
        { id: 'speaker-mic', label: 'Speaker/Microphone Repair', doorstep: true },
        { id: 'camera-repair', label: 'Camera Repair', doorstep: true },
        { id: 'water-damage', label: 'Water Damage Diagnostics', doorstep: false },
        { id: 'other-mobile', label: 'Other Issue', doorstep: false }
      ],
      laptop: [
        { id: 'screen-replacement', label: 'Screen Replacement', doorstep: true },
        { id: 'battery-replacement', label: 'Battery Replacement', doorstep: true },
        { id: 'keyboard-repair', label: 'Keyboard Repair/Replacement', doorstep: true },
        { id: 'trackpad-repair', label: 'Trackpad Repair', doorstep: true },
        { id: 'ram-upgrade', label: 'RAM Upgrade', doorstep: true },
        { id: 'storage-upgrade', label: 'HDD/SSD Replacement/Upgrade', doorstep: true },
        { id: 'software-trouble', label: 'Software Troubleshooting', doorstep: true },
        { id: 'virus-removal', label: 'Virus Removal', doorstep: true },
        { id: 'cooling-repair', label: 'Cooling System Repair', doorstep: true },
        { id: 'power-jack', label: 'Power Jack Repair', doorstep: true },
        { id: 'other-laptop', label: 'Other Issue', doorstep: false }
      ],
      tablet: [
        { id: 'screen-replacement', label: 'Screen Replacement', doorstep: true },
        { id: 'battery-replacement', label: 'Battery Replacement', doorstep: true },
        { id: 'charging-port', label: 'Charging Port Repair', doorstep: true },
        { id: 'speaker-repair', label: 'Speaker Repair', doorstep: true },
        { id: 'button-repair', label: 'Button Repair', doorstep: true },
        { id: 'software-issue', label: 'Software Issue', doorstep: true },
        { id: 'other-tablet', label: 'Other Issue', doorstep: false }
      ]
    };
    
    const availableServices = services[deviceType as keyof typeof services] || [];
    
    // Only show validation errors if this step has been validated
    const showValidationErrors = validatedSteps.includes(1);
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Select Service</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableServices.map(service => (
              <label key={service.id} className="relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition
                hover:bg-gray-50 hover:border-gray-300">
                <div className="flex items-center h-5">
                  <Controller
                    name="serviceType"
                    control={methods.control}
                    rules={{ required: "Please select a service" }}
                    render={({ field }) => (
                      <input
                        type="radio"
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        value={service.id}
                        checked={field.value === service.id}
                        onChange={() => field.onChange(service.id)}
                      />
                    )}
                  />
                  </div>
                <div className="ml-3 flex-1">
                  <span className="block text-sm font-medium text-gray-700">{service.label}</span>
                  {service.doorstep ? (
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Doorstep Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      In-Shop Only
                    </span>
                    )}
                  </div>
              </label>
            ))}
          </div>
          {methods.formState.errors.serviceType && showValidationErrors && (
            <p className="mt-1 text-sm text-red-600">{methods.formState.errors.serviceType.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700">
            Describe the Issue <span className="text-gray-500 font-normal">(Recommended)</span>
          </label>
          <Controller
            name="issueDescription"
            control={methods.control}
            // Make issue description optional by removing the required rule
            rules={{}} 
            render={({ field, fieldState }) => (
              <>
          <textarea
            id="issueDescription"
            rows={4}
                  className={`
                    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                  placeholder={`Please describe your ${deviceType} issue in as much detail as possible. For example: "My screen is cracked and has black spots" or "Battery drains very quickly, only lasts 2 hours"`}
                  {...field}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
          <div className="bg-blue-50 p-3 rounded-md mt-2">
            <p className="text-sm text-blue-700 flex items-start">
              <svg className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Why this matters:</strong> A detailed description helps our technicians prepare properly, bring the right parts, and provide a more accurate estimate before arrival.
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render the Customer Info step
  const renderCustomerInfoStep = () => {
    // Only show validation errors if this step has been validated
    const showValidationErrors = validatedSteps.includes(2);
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <Controller
            name="customerName"
            control={methods.control}
            rules={{ required: "Name is required" }}
            render={({ field, fieldState }) => (
              <>
                <input
                  id="customerName"
                  type="text"
                  className={`
                    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                  placeholder="Your full name"
                  {...field}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
            />
          </div>
          
        <div className="space-y-2">
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Controller
            name="customerEmail"
            control={methods.control}
            rules={{ 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            }}
            render={({ field, fieldState }) => (
              <>
                <input
                  id="customerEmail"
                  type="email"
                  className={`
                    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                  placeholder="you@example.com"
                  {...field}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll send booking confirmation and updates to this email.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <Controller
            name="customerPhone"
            control={methods.control}
            rules={{ 
              required: "Phone number is required",
              pattern: {
                value: process.env.NODE_ENV === 'production' 
                  ? /^(\+?1-?)?(\([2-9]([0-9]{2})\)|[2-9]([0-9]{2}))-?[2-9]([0-9]{2})-?([0-9]{4})$/
                  : /^.{2,}$/,
                message: "Please enter a valid phone number"
              }
            }}
            render={({ field, fieldState }) => (
              <>
                <input
                  id="customerPhone"
                  type="tel"
                  className={`
                    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                  placeholder="(555) 123-4567"
                  {...field}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            Our technician will call you before arriving for the repair.
          </p>
        </div>
      </div>
    );
  };

  // Render the Location step
  const renderLocationStep = () => {
    // Only show validation errors if this step has been validated
    const showValidationErrors = validatedSteps.includes(3);
    
    // Function to detect current location and fill address fields
    const detectCurrentLocation = async () => {
      try {
        setDetectingLocation(true);
        
        // Get postal code from browser geolocation
        const postalCode = await getCurrentLocationPostalCode();
        
        // Check if this postal code is in our service area
        const serviceArea = checkServiceArea(postalCode);
        
        if (serviceArea && serviceArea.serviceable) {
          // Try to get a detailed address using reverse geocoding
          let detailedAddress = '';
          let city = serviceArea.city;
          
          try {
            // If geolocation is available, try to get a more detailed address
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                  // Use OpenStreetMap's Nominatim for reverse geocoding
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
                    { 
                      headers: { 
                        'Accept-Language': 'en-US,en',
                        'User-Agent': 'TheTravellingTechnicians/1.0' 
                      },
                      cache: 'no-cache'
                    }
                  );
                  
                  if (response.ok) {
                    const data = await response.json();
                    console.log('Nominatim address data:', data);
                    
                    // Build a detailed address from the address components
                    if (data.address) {
                      const addr = data.address;
                      
                      // Construct the detailed address
                      const streetNumber = addr.house_number || '';
                      const street = addr.road || addr.street || addr.footway || addr.path || '';
                      const unit = addr.unit || addr.apartment || '';
                      
                      if (streetNumber && street) {
                        detailedAddress = unit 
                          ? `${unit}-${streetNumber} ${street}` 
                          : `${streetNumber} ${street}`;
                        
                        // Update the form with the more detailed address
                        methods.setValue('address', detailedAddress);
                        
                        // If city information is available, use it
                        if (addr.city || addr.town || addr.village || addr.suburb) {
                          city = addr.city || addr.town || addr.village || addr.suburb;
                          methods.setValue('city', city);
                        }
                        
                        console.log('Set detailed address from Nominatim:', detailedAddress);
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error fetching detailed address:', error);
                }
              });
            }
          } catch (geoError) {
            console.error('Error accessing geolocation for detailed address:', geoError);
          }
          
          // Set the postal code (this is what we have most confidence in)
          methods.setValue('postalCode', postalCode);
          methods.setValue('city', city);
          methods.setValue('province', 'BC');
          
          // If we couldn't get a detailed address, use a generic one with the postal code
          if (!detailedAddress) {
            const addressPlaceholder = `${postalCode} area`;
            methods.setValue('address', addressPlaceholder);
          }
          
          // Create a location data object for more permanent storage
          const locationData = {
            postalCode: postalCode,
            city: city,
            province: 'BC',
            address: detailedAddress || `${postalCode} area`,
            serviceable: true,
            timestamp: new Date().toISOString()
          };
          
          // Save to localStorage for future use
          localStorage.setItem('travellingTech_location', JSON.stringify(locationData));
          
          setLocationWasPreFilled(true);
          setNeedsPostalCodeAttention(false);
        } else {
          alert("We couldn't determine if your location is within our service area. Please enter your address manually.");
          setNeedsPostalCodeAttention(true);
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        alert("Couldn't detect your location. Please enter your address manually.");
        setNeedsPostalCodeAttention(true);
      } finally {
        setDetectingLocation(false);
      }
    };
    
    // Function to handle address selection and set postal code attention flag if needed
    const handleAddressSelect = (address: string, isValid: boolean, postalCode?: string) => {
      // Update the form field value
      methods.setValue('address', address);
      
      if (postalCode) {
        methods.setValue('postalCode', postalCode);
        setNeedsPostalCodeAttention(!isValid); // If not valid, need attention
        
        // If postal code is not in service area, set an error
        if (!isValid) {
          methods.setError('postalCode', { 
            type: 'validate', 
            message: `Unfortunately, we don't service ${postalCode} at this time.` 
          });
        }
      } else {
        setNeedsPostalCodeAttention(true); // No postal code detected, need user input
      }
    };
    
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                We service the entire Lower Mainland area including Vancouver, Burnaby, Surrey, Richmond, Coquitlam, and more.
              </p>
          </div>
          </div>
        </div>
        
        {locationWasPreFilled && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your location information has been pre-filled based on your location. You can edit these details if needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {needsPostalCodeAttention && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Please ensure your postal code is correct.</strong> We need this to verify if you're in our service area.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
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
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Detect my location
                </>
              )}
            </button>
          </div>
          <Controller
            name="address"
            control={methods.control}
            rules={{ required: "Address is required" }}
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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
          </label>
            <Controller
              name="city"
              control={methods.control}
              rules={{ required: "City is required" }}
              render={({ field, fieldState }) => (
                <>
                  <select
                    id="city"
                    className={`
                      block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                      ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                      focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                    `}
                    {...field}
                  >
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
          
          <div className="space-y-2">
            <label htmlFor="postalCode" className={`block text-sm font-medium ${needsPostalCodeAttention ? 'text-yellow-700' : 'text-gray-700'}`}>
              Postal Code {needsPostalCodeAttention && <span className="text-red-500">*</span>}
            </label>
            <Controller
              name="postalCode"
              control={methods.control}
              rules={{ 
                required: "Postal code is required",
                validate: {
                  validFormat: (value) => isValidPostalCodeFormat(value) || "Please enter a valid postal code format (e.g., V6B 1A1)",
                  inServiceArea: (value) => {
                    const serviceArea = checkServiceArea(value);
                    return serviceArea?.serviceable || "Unfortunately, we don't service this postal code area. Please contact us for special arrangements.";
                  }
                }
              }}
              render={({ field, fieldState }) => (
                <>
                  <input
                    id="postalCode"
                    type="text"
                    className={`
                      block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                      ${needsPostalCodeAttention ? 'bg-yellow-50 border-yellow-300' : fieldState.error ? 'border-red-300' : 'border-gray-300'}
                      focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                    `}
                    placeholder="V6B 1A1"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      field.onChange(value);
                      
                      // If it's a valid postal code, remove the attention flag
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

        {/* Rest of your form fields... */}
        
        <div className="space-y-2">
          <label htmlFor="province" className="block text-sm font-medium text-gray-700">
            Province
          </label>
          <Controller
            name="province"
            control={methods.control}
            rules={{ required: "Province is required" }}
            render={({ field, fieldState }) => (
              <>
                <input
                  id="province"
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-100"
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
    );
  };

  // Render the Appointment step
  const renderAppointmentStep = () => {
    // Only show validation errors if this step has been validated
    const showValidationErrors = validatedSteps.includes(4);
    
    const currentDate = new Date();
    const minDate = new Date(currentDate);
    minDate.setDate(currentDate.getDate() + 1); // Start from tomorrow
    
    // Generate available dates (next 14 days)
    const availableDates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(minDate);
      date.setDate(minDate.getDate() + i);
      return date;
    });
    
    // Format date for display
    const formatDateForDisplay = (date: Date) => {
      return new Intl.DateTimeFormat('en-CA', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    };
    
    // Format date for value
    const formatDateForValue = (date: Date) => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    };
    
    // Available time slots
    const timeSlots = [
      { value: '09:00', label: '9:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '12:00', label: '12:00 PM' },
      { value: '13:00', label: '1:00 PM' },
      { value: '14:00', label: '2:00 PM' },
      { value: '15:00', label: '3:00 PM' },
      { value: '16:00', label: '4:00 PM' },
      { value: '17:00', label: '5:00 PM' },
    ];
    
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please select your preferred date and time. Our technician will contact you to confirm the exact time on the appointment day.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
            Select a Date
          </label>
          <Controller
            name="appointmentDate"
            control={methods.control}
            rules={{ required: "Please select a date" }}
            render={({ field, fieldState }) => (
              <>
                <select
                  id="appointmentDate"
                  className={`
                    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                  {...field}
                >
                  <option value="">Select a date</option>
                  {availableDates.map((date) => (
                    <option key={formatDateForValue(date)} value={formatDateForValue(date)}>
                      {formatDateForDisplay(date)}
                    </option>
                  ))}
                </select>
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">
            Preferred Time
          </label>
          <Controller
            name="appointmentTime"
            control={methods.control}
            rules={{ required: "Please select a time" }}
            render={({ field, fieldState }) => (
              <>
                <select
                  id="appointmentTime"
                  className={`
                    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                  {...field}
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            All times are in Pacific Time (PT). Our technician will call to confirm the exact time.
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg mt-4">
          <h4 className="font-medium text-gray-700 mb-2">What to expect:</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Confirmation email with booking details</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Call from technician on appointment day</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Doorstep repair with upfront pricing</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // Render the Confirmation step
  const renderConfirmationStep = () => {
    const formData = methods.getValues();
    
    // Set a more descriptive display name for the brand
    const displayBrand = formData.deviceBrand === 'other' 
      ? formData.customBrand 
      : formData.deviceBrand;
    
    // Service type display mapping
    const serviceTypeMap: Record<string, string> = {
      'screen-replacement': 'Screen Replacement',
      'battery-replacement': 'Battery Replacement',
      'charging-port-repair': 'Charging Port Repair',
      'speaker-repair': 'Speaker/Microphone Repair',
      'camera-repair': 'Camera Repair',
      'water-damage': 'Water Damage Assessment',
      'keyboard-repair': 'Keyboard Repair/Replacement',
      'trackpad-repair': 'Trackpad Repair',
      'ram-upgrade': 'RAM Upgrade',
      'storage-upgrade': 'Storage (HDD/SSD) Upgrade',
      'software-troubleshooting': 'Software Troubleshooting',
      'virus-removal': 'Virus Removal',
      'cooling-repair': 'Cooling System Repair',
      'power-jack-repair': 'Power Jack Repair',
      'other': 'Other Repair'
    };
    
    // Format time for display
    const formatTime = (timeString: string) => {
      if (!timeString) return 'Not selected';
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    };
    
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Please review your booking details below and click "Submit Booking" when ready.
              </p>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          <div className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Device Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Device Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{formData.deviceType}</dd>
            </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Brand</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{displayBrand}</dd>
          </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Model</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.deviceModel}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Service</dt>
                <dd className="mt-1 text-sm text-gray-900">{serviceTypeMap[formData.serviceType] || formData.serviceType}</dd>
              </div>
              {formData.issueDescription && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Issue Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formData.issueDescription}</dd>
              </div>
              )}
            </dl>
          </div>
          
          <div className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.customerName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.customerPhone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.customerEmail}</dd>
              </div>
            </dl>
        </div>
        
          <div className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Location</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.address}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.city}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.postalCode}</dd>
              </div>
            </dl>
        </div>
        
          <div className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Appointment</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(formData.appointmentDate)}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTime(formData.appointmentTime)}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
            <input
                id="terms"
              type="checkbox"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
        </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">I agree to the terms and conditions</label>
              <p className="text-gray-500">By submitting this booking, you agree to our <a href="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</a> and <a href="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</a>.</p>
              {submitAttempted && !agreeToTerms && (
                <p className="mt-1 text-sm text-red-600">You must agree to the terms to proceed</p>
              )}
          </div>
        </div>
          </div>
      </div>
    );
  };

  // Helper to get all field errors for the current step
  const getCurrentStepErrors = () => {
    const errors = methods.formState.errors;
    const errorFields: string[] = [];
    
    // Only check for errors if this step has been validated
    if (!validatedSteps.includes(currentStep)) {
      return errorFields;
    }
    
    // Check for specific fields based on current step
    switch (currentStep) {
      case 0: // Device Type
        if (errors.deviceType) errorFields.push('Device Type');
        if (errors.deviceBrand) errorFields.push('Brand');
        if (errors.customBrand) errorFields.push('Custom Brand');
        if (errors.deviceModel) errorFields.push('Model');
        break;
      case 1: // Service Details
        if (errors.serviceType) errorFields.push('Service Type');
        // Remove issueDescription from the error fields since it's optional
        break;
      case 2: // Contact Info
        if (errors.customerName) errorFields.push('Full Name');
        if (errors.customerEmail) errorFields.push('Email Address');
        if (errors.customerPhone) errorFields.push('Phone Number');
        break;
      case 3: // Location
        if (errors.address) errorFields.push('Address');
        if (errors.city) errorFields.push('City');
        if (errors.postalCode) errorFields.push('Postal Code');
        break;
      case 4: // Appointment
        if (errors.appointmentDate) errorFields.push('Appointment Date');
        if (errors.appointmentTime) errorFields.push('Appointment Time');
        break;
    }
    
    return errorFields;
  };

  // Render error summary for the current step if any errors
  const renderErrorSummary = () => {
    const errorFields = getCurrentStepErrors();
    
    // Only show errors if the form has been touched (user has interacted with it)
    if (errorFields.length === 0 || !formTouched) return null;
    
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Please fix the following issues:
            </h3>
            <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
              {errorFields.map((field, i) => (
                <li key={i}>{field} is required</li>
              ))}
            </ul>
        </div>
          </div>
      </div>
    );
  };

  // Render the appropriate step based on currentStep
  const renderStepContent = () => {
    return (
      <>
        {renderErrorSummary()}
        {(() => {
    switch (currentStep) {
      case 0:
        return renderDeviceTypeStep();
      case 1:
        return renderServiceDetailsStep();
      case 2:
        return renderCustomerInfoStep();
      case 3:
        return renderLocationStep();
      case 4:
        return renderAppointmentStep();
      case 5:
        return renderConfirmationStep();
      default:
        return (
          <div className="text-center text-gray-500">
            <p className="mb-2">This is a placeholder for the {steps[currentStep]} step.</p>
            <p>Future implementation will include all necessary fields for this step.</p>
      </div>
    );
    }
        })()}
      </>
    );
  };

  // Override the handleSubmit function to check for terms agreement
  const handleFinalSubmit = () => {
    if (!agreeToTerms) {
      setSubmitAttempted(true);
      return;
    }
    
    const data = methods.getValues();
    
    // Process the data before submitting
    const processedData: CreateBookingRequest = {
      ...data,
      // If using "other" brand, set the custom brand for database
      brand: data.deviceBrand === 'other' && data.customBrand ? data.customBrand : data.deviceBrand,
      model: data.deviceModel
    };
    
    handleSubmit(processedData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary-600">Book Your Doorstep Repair</h2>
      
      {/* Step progress indicators */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
                  ${index === currentStep 
                    ? 'bg-primary-600 text-white' 
                    : index < currentStep 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {index < currentStep ? '✓' : index + 1}
          </div>
              <span className="text-xs mt-1 text-gray-500">{step}</span>
        </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-600 transition-all" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <FormProvider {...methods}>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (currentStep === steps.length - 1) {
            handleFinalSubmit();
          } else {
            await nextStep();
          }
        }}>
          {/* Step content */}
          <div className="mb-6">
        {renderStepContent()}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => nextStep()}
                className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                disabled={methods.formState.isSubmitting}
              >
                {methods.formState.isSubmitting ? 'Submitting...' : 'Submit Booking'}
              </button>
            )}
          </div>
      </form>
      </FormProvider>
    </div>
  );
}