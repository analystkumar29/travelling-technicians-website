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
  }, [deviceBrand]); // Remove methods from dependency array to prevent infinite loop

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
  }, []); // Empty dependency array - only run on mount

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
        if (data.deviceBrand === 'other' && data.customBrand) {
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
        if (data.deviceBrand === 'other' && data.customBrand) {
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
              <label className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                deviceType === 'mobile' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
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
                <div className="flex items-center p-4 cursor-pointer">
                  <div className={`bg-primary-100 rounded-full p-3 mr-3 transition-all duration-300 ${
                    deviceType === 'mobile' ? 'bg-primary-200' : ''
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                  </div>
                  <div>
                  <span className="font-medium text-gray-900">Mobile Phone</span>
                    {deviceType === 'mobile' && (
                      <div className="h-1 w-full bg-primary-500 absolute bottom-0 left-0 rounded-b-lg"></div>
                    )}
                  </div>
              </div>
            </label>
            
              <label className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                deviceType === 'laptop' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
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
                <div className="flex items-center p-4 cursor-pointer">
                  <div className={`bg-primary-100 rounded-full p-3 mr-3 transition-all duration-300 ${
                    deviceType === 'laptop' ? 'bg-primary-200' : ''
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                  </div>
                  <div>
                  <span className="font-medium text-gray-900">Laptop</span>
                    {deviceType === 'laptop' && (
                      <div className="h-1 w-full bg-primary-500 absolute bottom-0 left-0 rounded-b-lg"></div>
                    )}
                  </div>
              </div>
            </label>
            
              <label className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                deviceType === 'tablet' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
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
                <div className="flex items-center p-4 cursor-pointer">
                  <div className={`bg-primary-100 rounded-full p-3 mr-3 transition-all duration-300 ${
                    deviceType === 'tablet' ? 'bg-primary-200' : ''
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                  </div>
                  <div>
                  <span className="font-medium text-gray-900">Tablet</span>
                    {deviceType === 'tablet' && (
                      <div className="h-1 w-full bg-primary-500 absolute bottom-0 left-0 rounded-b-lg"></div>
                    )}
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { value: 'apple', label: 'Apple', icon: '🍎' },
                    { value: 'samsung', label: 'Samsung', icon: '📱' },
                    { value: 'google', label: 'Google', icon: 'G' },
                    { value: 'oneplus', label: 'OnePlus', icon: '1+' },
                    { value: 'xiaomi', label: 'Xiaomi', icon: 'Mi' },
                    { value: 'other', label: 'Other', icon: '...' }
                  ].map((brand) => (
                    <label 
                      key={brand.value}
                      className={`relative rounded-md border overflow-hidden transition-all duration-200 ${
                        methods.watch('deviceBrand') === brand.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
          <Controller
            name="deviceBrand"
            control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                            value={brand.value}
                            checked={field.value === brand.value}
                          onChange={() => {
                              field.onChange(brand.value);
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                      <div className="flex items-center p-3 cursor-pointer">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 text-lg font-medium rounded-full bg-gray-100 text-gray-700">
                          {brand.icon}
                    </div>
                        <span className="font-medium text-gray-900">{brand.label}</span>
                        {methods.watch('deviceBrand') === brand.value && (
                          <div className="ml-auto">
                            <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                    </div>
                        )}
                    </div>
                  </label>
                  ))}
                    </div>
              )}
              
              {/* Laptop device brands */}
              {deviceType === 'laptop' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { value: 'apple', label: 'Apple', icon: '🍎' },
                    { value: 'dell', label: 'Dell', icon: 'D' },
                    { value: 'hp', label: 'HP', icon: 'HP' },
                    { value: 'lenovo', label: 'Lenovo', icon: 'L' },
                    { value: 'asus', label: 'ASUS', icon: 'A' },
                    { value: 'other', label: 'Other', icon: '...' }
                  ].map((brand) => (
                    <label 
                      key={brand.value}
                      className={`relative rounded-md border overflow-hidden transition-all duration-200 ${
                        methods.watch('deviceBrand') === brand.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                            value={brand.value}
                            checked={field.value === brand.value}
                          onChange={() => {
                              field.onChange(brand.value);
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                      <div className="flex items-center p-3 cursor-pointer">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 text-lg font-medium rounded-full bg-gray-100 text-gray-700">
                          {brand.icon}
                    </div>
                        <span className="font-medium text-gray-900">{brand.label}</span>
                        {methods.watch('deviceBrand') === brand.value && (
                          <div className="ml-auto">
                            <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                    </div>
                        )}
                    </div>
                  </label>
                  ))}
                    </div>
              )}
              
              {/* Tablet device brands */}
              {deviceType === 'tablet' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { value: 'apple', label: 'Apple', icon: '🍎' },
                    { value: 'samsung', label: 'Samsung', icon: '📱' },
                    { value: 'microsoft', label: 'Microsoft', icon: 'MS' },
                    { value: 'lenovo', label: 'Lenovo', icon: 'L' },
                    { value: 'other', label: 'Other', icon: '...' }
                  ].map((brand) => (
                    <label 
                      key={brand.value}
                      className={`relative rounded-md border overflow-hidden transition-all duration-200 ${
                        methods.watch('deviceBrand') === brand.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                    <Controller
                      name="deviceBrand"
                      control={methods.control}
                      rules={{ required: "Please select a brand" }}
                      render={({ field }) => (
                        <input
                          type="radio"
                          className="sr-only"
                            value={brand.value}
                            checked={field.value === brand.value}
                          onChange={() => {
                              field.onChange(brand.value);
                            methods.setValue('deviceModel', '');
                          }}
                        />
                      )}
                    />
                      <div className="flex items-center p-3 cursor-pointer">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 text-lg font-medium rounded-full bg-gray-100 text-gray-700">
                          {brand.icon}
                    </div>
                        <span className="font-medium text-gray-900">{brand.label}</span>
                        {methods.watch('deviceBrand') === brand.value && (
                          <div className="ml-auto">
                            <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                    </div>
                        )}
                    </div>
                  </label>
                  ))}
                </div>
              )}
              
              {/* Error message for device brand */}
              {methods.formState.errors.deviceBrand && showValidationErrors && (
                <p className="mt-1 text-sm text-red-600">{methods.formState.errors.deviceBrand.message}</p>
              )}
              
              {/* Custom Brand Input (when "Other Brand" is selected) */}
              {methods.watch('deviceBrand') === 'other' && (
                <div className="mb-4 bg-gray-50 p-4 rounded-md border border-gray-200 animate-fadeIn">
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
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200"
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
            <div className="mb-4 transition-opacity duration-300" style={{ opacity: deviceType ? '1' : '0.5' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model <span className="text-red-500">*</span>
              </label>
              
          <Controller
            name="deviceModel"
            control={methods.control}
            rules={{ required: "Model is required" }}
                render={({ field, fieldState }) => {
                  // Debug output for device selection
                  console.log('DeviceModelSelector props from BookingForm:', {
                    deviceType: methods.watch('deviceType'), 
                    brand: methods.watch('deviceBrand'),
                    value: field.value
                  });
                  
                  return (
                    <>
                      <div className="rounded-md border border-gray-300 overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all duration-300">
                    <DeviceModelSelector
                      deviceType={methods.watch('deviceType')}
                      brand={methods.watch('deviceBrand')}
                      value={field.value}
                      onChange={field.onChange}
              />
                      </div>
                    {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
          </>
                  );
                }}
          />
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-5 rounded-lg border border-primary-100 shadow-sm">
          <h3 className="text-lg font-semibold text-primary-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            Why Choose Our Doorstep Repair?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start bg-white bg-opacity-70 p-3 rounded-md hover:shadow-sm transition-all duration-300">
              <div className="flex-shrink-0 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700"><strong className="text-primary-700">Convenience:</strong> We come to your home or office</p>
              </div>
            </div>
            <div className="flex items-start bg-white bg-opacity-70 p-3 rounded-md hover:shadow-sm transition-all duration-300">
              <div className="flex-shrink-0 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700"><strong className="text-primary-700">Speed:</strong> Most repairs completed in 30-60 minutes</p>
              </div>
            </div>
            <div className="flex items-start bg-white bg-opacity-70 p-3 rounded-md hover:shadow-sm transition-all duration-300">
              <div className="flex-shrink-0 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700"><strong className="text-primary-700">Quality:</strong> High-quality parts & certified technicians</p>
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
    
    // Enhanced services with icons, time estimates, and price ranges
    const services = {
      mobile: [
        { 
          id: 'screen-replacement', 
          label: 'Screen Replacement', 
          doorstep: true,
          icon: 'M12 18h-1.5v-2H18v2H12zM6 11v-1h12v1H6zm0 6H4.5v-2H6v2zm10.5-6a.75.75 0 100-1.5.75.75 0 000 1.5zM12 6V4h6v2h-6zM6 6V4h4.5v2H6z',
          time: '30-60 min',
          price: '$89-199',
          group: 'common'
        },
        { 
          id: 'battery-replacement', 
          label: 'Battery Replacement', 
          doorstep: true,
          icon: 'M20 10V8h-3V4H7v4H4v2h3v8a2 2 0 002 2h6a2 2 0 002-2v-8h3zM13 8V6h1v2h-1zm-3 0V6h1v2h-1z',
          time: '20-40 min',
          price: '$69-129',
          group: 'common'
        },
        { 
          id: 'charging-port', 
          label: 'Charging Port Repair', 
          doorstep: true,
          icon: 'M9 4v4h6V4h2v4h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1V4h2zm1 16h4v-4h-4v4z',
          time: '30-45 min',
          price: '$79-119',
          group: 'common'
        },
        { 
          id: 'speaker-mic', 
          label: 'Speaker/Microphone Repair', 
          doorstep: true,
          icon: 'M10 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zm0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3zm7-5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2z',
          time: '25-45 min',
          price: '$69-119',
          group: 'common'
        },
        { 
          id: 'camera-repair', 
          label: 'Camera Repair', 
          doorstep: true,
          icon: 'M12 9a3 3 0 100 6 3 3 0 000-6zm0 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-8 11a5 5 0 110-10 5 5 0 010 10z',
          time: '30-60 min',
          price: '$89-149',
          group: 'common'
        },
        { 
          id: 'water-damage', 
          label: 'Water Damage Diagnostics', 
          doorstep: false,
          icon: 'M12 3.25a.75.75 0 01.75.75v6.701a4.25 4.25 0 11-1.5 0V4a.75.75 0 01.75-.75zM7.266 7.5a7 7 0 1113.468 2.5 7 7 0 01-13.468-2.5z',
          time: '45-90 min',
          price: '$99-249',
          group: 'special'
        },
        { 
          id: 'other-mobile', 
          label: 'Other Issue', 
          doorstep: false,
          icon: 'M10.975 8.75a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zm0 7a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zM12 4a8 8 0 100 16 8 8 0 000-16zm-6.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z',
          time: 'Varies',
          price: 'Custom quote',
          group: 'special'
        }
      ],
      laptop: [
        { 
          id: 'screen-replacement', 
          label: 'Screen Replacement', 
          doorstep: true,
          icon: 'M20 4H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 11.5H4V6h16v9.5zM4 20h16v-2H4v2z',
          time: '45-75 min',
          price: '$149-349',
          group: 'common'
        },
        { 
          id: 'battery-replacement', 
          label: 'Battery Replacement', 
          doorstep: true,
          icon: 'M20 10V8h-3V4H7v4H4v2h3v8a2 2 0 002 2h6a2 2 0 002-2v-8h3z',
          time: '30-45 min',
          price: '$99-199',
          group: 'common'
        },
        { 
          id: 'keyboard-repair', 
          label: 'Keyboard Repair/Replacement', 
          doorstep: true,
          icon: 'M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm0 11.5H4V7h16v9.5zM6 10h2v2H6v-2zm3 0h2v2H9v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z',
          time: '45-75 min',
          price: '$99-189',
          group: 'common'
        },
        { 
          id: 'trackpad-repair', 
          label: 'Trackpad Repair', 
          doorstep: true,
          icon: 'M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 13a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h14a1 1 0 011 1v10zm-8-7a2 2 0 100 4 2 2 0 000-4z',
          time: '45-90 min',
          price: '$99-179',
          group: 'common'
        },
        { 
          id: 'ram-upgrade', 
          label: 'RAM Upgrade', 
          doorstep: true,
          icon: 'M4 4h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zm0 8h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4a1 1 0 011-1zm3-6h2v2H7V6zm0 8h2v2H7v-2z',
          time: '20-40 min',
          price: '$69-249',
          group: 'upgrades'
        },
        { 
          id: 'storage-upgrade', 
          label: 'HDD/SSD Replacement/Upgrade', 
          doorstep: true,
          icon: 'M15 15a2 2 0 100-4 2 2 0 000 4zm4-11h-1V3a1 1 0 00-1-1H7a1 1 0 00-1 1v1H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-4 10a4 4 0 110-8 4 4 0 010 8zm-6-8.5a.5.5 0 100-1 .5.5 0 000 1z',
          time: '30-60 min',
          price: '$89-349',
          group: 'upgrades'
        },
        { 
          id: 'software-trouble', 
          label: 'Software Troubleshooting', 
          doorstep: true,
          icon: 'M13 13.5a1 1 0 11-2 0 1 1 0 012 0zm-.25-5v2.992l.25.26a1 1 0 11-2 0l.25-.26V8.5a1 1 0 112 0zM12 4a8 8 0 100 16 8 8 0 000-16zm-6.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z',
          time: '45-90 min',
          price: '$79-149',
          group: 'software'
        },
        { 
          id: 'virus-removal', 
          label: 'Virus Removal', 
          doorstep: true,
          icon: 'M11 16.75a.75.75 0 001.5 0v-1.061l.344-.282a4.5 4.5 0 10-2.196.003l.352.279v1.06zm1.956-8.909a1 1 0 00-1.912 0L9.96 9.575A3 3 0 008.633 11H7a1 1 0 100 2h1.633A3.001 3.001 0 0012 15a3.001 3.001 0 003.367-2H17a1 1 0 100-2h-1.633a3 3 0 00-1.327-1.425l-1.084-1.734z',
          time: '60-120 min',
          price: '$99-199',
          group: 'software'
        },
        { 
          id: 'cooling-repair', 
          label: 'Cooling System Repair', 
          doorstep: true,
          icon: 'M10 8a1 1 0 11-2 0 1 1 0 012 0zm5 0a1 1 0 11-2 0 1 1 0 012 0zM8.5 12.5L7 11l-3 3 3 3 1.5-1.5L7 14l1.5-1.5zm7 0L14 14l1.5 1.5L17 14l-3-3-3 3 1.5 1.5 1.5-1.5zM12 2a10 10 0 100 20 10 10 0 000-20zm-8 10a8 8 0 1116 0 8 8 0 01-16 0z',
          time: '45-90 min',
          price: '$89-179',
          group: 'hardware'
        },
        { 
          id: 'power-jack', 
          label: 'Power Jack Repair', 
          doorstep: true,
          icon: 'M12 7V5M8 9l-2-2M16 9l2-2M7 13H5M19 13h-2M12 17a2 2 0 100-4 2 2 0 000 4z',
          time: '60-90 min',
          price: '$99-179',
          group: 'hardware'
        },
        { 
          id: 'other-laptop', 
          label: 'Other Issue', 
          doorstep: false,
          icon: 'M10.975 8.75a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zm0 7a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zM12 4a8 8 0 100 16 8 8 0 000-16zm-6.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z',
          time: 'Varies',
          price: 'Custom quote',
          group: 'special'
        }
      ],
      tablet: [
        { 
          id: 'screen-replacement', 
          label: 'Screen Replacement', 
          doorstep: true,
          icon: 'M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm0 17H6V5h12v14zm-7-3h2v-2h-2v2z',
          time: '45-75 min',
          price: '$129-299',
          group: 'common'
        },
        { 
          id: 'battery-replacement', 
          label: 'Battery Replacement', 
          doorstep: true,
          icon: 'M20 10V8h-3V4H7v4H4v2h3v8a2 2 0 002 2h6a2 2 0 002-2v-8h3z',
          time: '30-60 min',
          price: '$89-169',
          group: 'common'
        },
        { 
          id: 'charging-port', 
          label: 'Charging Port Repair', 
          doorstep: true,
          icon: 'M9 4v4h6V4h2v4h1a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2h1V4h2zm1 16h4v-4h-4v4z',
          time: '30-60 min',
          price: '$79-149',
          group: 'common'
        },
        { 
          id: 'speaker-repair', 
          label: 'Speaker Repair', 
          doorstep: true,
          icon: 'M10 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zm0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3zm7-5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2z',
          time: '30-60 min',
          price: '$69-129',
          group: 'common'
        },
        { 
          id: 'button-repair', 
          label: 'Button Repair', 
          doorstep: true,
          icon: 'M12 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-.75-15v12h1.5v-12h-1.5zM12 2a10 10 0 100 20 10 10 0 000-20zm-8 10a8 8 0 1116 0 8 8 0 01-16 0z',
          time: '30-60 min',
          price: '$69-129',
          group: 'common'
        },
        { 
          id: 'software-issue', 
          label: 'Software Issue', 
          doorstep: true,
          icon: 'M13 13.5a1 1 0 11-2 0 1 1 0 012 0zm-.25-5v2.992l.25.26a1 1 0 11-2 0l.25-.26V8.5a1 1 0 112 0zM12 4a8 8 0 100 16 8 8 0 000-16zm-6.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z',
          time: '30-90 min',
          price: '$69-129',
          group: 'software'
        },
        { 
          id: 'other-tablet', 
          label: 'Other Issue', 
          doorstep: false,
          icon: 'M10.975 8.75a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zm0 7a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zM12 4a8 8 0 100 16 8 8 0 000-16zm-6.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z',
          time: 'Varies',
          price: 'Custom quote',
          group: 'special'
        }
      ]
    };
    
    const availableServices = services[deviceType as keyof typeof services] || [];
    
    // Group services by category for better organization
    const groupedServices = availableServices.reduce((acc, service) => {
      const group = service.group || 'other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(service);
      return acc;
    }, {} as Record<string, typeof availableServices>);
    
    // Group order and labels
    const groupOrder = ['common', 'hardware', 'software', 'upgrades', 'special'];
    const groupLabels: Record<string, string> = {
      common: 'Common Repairs',
      hardware: 'Hardware Services',
      software: 'Software Services',
      upgrades: 'Upgrades & Improvements',
      special: 'Special Services'
    };
    
    // Only show validation errors if this step has been validated
    const showValidationErrors = validatedSteps.includes(1);
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Select Your Service</h3>
          <p className="text-sm text-gray-700">
            Choose the service that best matches your {deviceType}'s issue. All doorstep services include free diagnostics.
          </p>
        </div>
        
        {groupOrder.map(group => {
          const services = groupedServices[group];
          if (!services || services.length === 0) return null;
          
          return (
            <div key={group} className="space-y-3">
              <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                {groupLabels[group]}
              </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map(service => (
                  <div 
                    key={service.id} 
                    className={`relative rounded-lg border-2 transition overflow-hidden ${
                      methods.watch('serviceType') === service.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <label className="flex p-4 cursor-pointer">
                      <div className="flex items-center h-5 mt-0.5">
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
                        <div className="flex items-center mb-1">
                          <svg className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d={service.icon} />
                          </svg>
                          <span className="font-medium text-gray-900">{service.label}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">{service.time}</span>
                          </div>
                          
                          <div className="flex items-center ml-4">
                            <svg className="h-4 w-4 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">{service.price}</span>
                          </div>
                        </div>
                      </div>
                    </label>
                    
                  {service.doorstep ? (
                      <div className="absolute top-0 right-0 mt-2 mr-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Doorstep
                    </span>
                      </div>
                  ) : (
                      <div className="absolute top-0 right-0 mt-2 mr-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      In-Shop Only
                    </span>
                      </div>
                    )}
                  </div>
            ))}
          </div>
            </div>
          );
        })}
        
          {methods.formState.errors.serviceType && showValidationErrors && (
            <p className="mt-1 text-sm text-red-600">{methods.formState.errors.serviceType.message}</p>
          )}
        
        <div className="space-y-2 mt-8">
          <div className="flex justify-between items-center">
          <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700">
              Describe Your Issue
          </label>
            <span className="text-sm text-gray-500">Recommended</span>
          </div>
          
          <Controller
            name="issueDescription"
            control={methods.control}
            rules={{}} 
            render={({ field, fieldState }) => (
              <>
          <textarea
            id="issueDescription"
            rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder={`Please describe your ${deviceType} issue in as much detail as possible. For example: "My screen is cracked and has black spots" or "Battery drains very quickly, only lasts 2 hours"`}
                  {...field}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
          
          <div className="bg-blue-50 p-4 rounded-md mt-3 border border-blue-100">
            <div className="flex">
              <svg className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-18a8 8 0 100 16 8 8 0 000-16zm1 6a1 1 0 00-2 0v4a1 1 0 002 0V10zm-1-3a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-700 text-sm">Why this matters:</h4>
                <p className="text-sm text-blue-700 mt-1">
                  A detailed description helps our technicians prepare properly, bring the right parts, and provide a more accurate estimate before arrival.
                </p>
              </div>
            </div>
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
        <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Your Contact Information</h3>
          <p className="text-sm text-gray-700">
            We need your contact details to confirm your booking and for our technician to reach you.
          </p>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
          </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
          <Controller
            name="customerName"
            control={methods.control}
            rules={{ required: "Name is required" }}
            render={({ field, fieldState }) => (
              <>
                <input
                  id="customerName"
                  type="text"
                      className={`block w-full pl-10 pr-3 py-2 border ${fieldState.error ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200`}
                      placeholder="John Smith"
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
          
          <div className="relative">
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
          </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
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
                      className={`block w-full pl-10 pr-3 py-2 border ${fieldState.error ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200`}
                  placeholder="you@example.com"
                  {...field}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              We'll send booking confirmation and updates to this email. We won't share it with third parties.
          </p>
        </div>
        
          <div className="relative">
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
          </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
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
                      className={`block w-full pl-10 pr-3 py-2 border ${fieldState.error ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200`}
                  placeholder="(555) 123-4567"
                  {...field}
                />
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
            </div>
            <p className="mt-1 text-xs text-gray-500">
            Our technician will call you before arriving for the repair.
          </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Privacy Notice</h4>
              <p className="mt-1 text-xs text-blue-700">
                Your information is secure and only used to facilitate your repair service. See our 
                <a href="/privacy-policy" className="underline ml-1 font-medium hover:text-blue-900 transition-colors">
                  Privacy Policy
                </a> for details.
              </p>
            </div>
          </div>
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
                We service the entire Lower Mainland area including Vancouver, Burnaby, Richmond, New Westminster, North Vancouver, West Vancouver, Coquitlam, and Chilliwack.
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
                    className={`$1`}
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
          
          <div className="space-y-2">
            <label htmlFor="postalCode" className={`$1`}>
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
                    className={`$1`}
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
    
    // Function to get tomorrow's date in YYYY-MM-DD format
    const getTomorrowDate = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    };

    // Function to get today's date plus 60 days for max date range
    const getMaxDate = () => {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 60);
      return maxDate.toISOString().split('T')[0];
    };
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">Schedule Your Appointment</h3>
          <p className="text-sm text-gray-700">
            Choose your preferred date and time for the repair. Our technician will arrive during your selected timeframe.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date <span className="text-red-500">*</span>
          </label>
          <Controller
            name="appointmentDate"
            control={methods.control}
              rules={{ required: "Date is required" }}
            render={({ field, fieldState }) => (
              <>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      className={`block w-full pl-10 pr-10 py-2 border ${fieldState.error ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                      min={getTomorrowDate()}
                      max={getMaxDate()}
                  {...field}
                    />
                  </div>
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
            <p className="mt-1 text-xs text-gray-500">We accept bookings up to 60 days in advance.</p>
        </div>
        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time <span className="text-red-500">*</span>
          </label>
          <Controller
            name="appointmentTime"
            control={methods.control}
              rules={{ required: "Time slot is required" }}
            render={({ field, fieldState }) => (
              <>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                <select
                      className={`block w-full pl-10 pr-10 py-2 border ${fieldState.error ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none`}
                  {...field}
                  value={field.value || ''}
                >
                      <option value="">Select a time slot...</option>
                      <option value="morning">Morning (9AM - 12PM)</option>
                      <option value="afternoon">Afternoon (12PM - 4PM)</option>
                      <option value="evening">Evening (4PM - 7PM)</option>
                </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                {fieldState.error && showValidationErrors && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
            <p className="mt-1 text-xs text-gray-500">Our technicians work 7 days a week.</p>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <Controller
            name="issueDescription"
            control={methods.control}
            render={({ field }) => (
              <div className="relative rounded-md shadow-sm">
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-300"
                  rows={4}
                  placeholder="Any special instructions about access to your location, parking details, or additional information about your repair..."
                  {...field}
                />
              </div>
            )}
          />
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-5">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-1">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="ml-3 text-base font-medium text-blue-800">Important Information</h3>
          </div>
          <ul className="space-y-3 ml-6">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-blue-700">Our technician will call to confirm your appointment.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-blue-700">We'll arrive within your selected time window.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-blue-700">Please ensure someone (18+) will be present.</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-all duration-300"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">
                I agree to the terms and conditions <span className="text-red-500">*</span>
              </label>
              <p className="text-gray-500 mt-1">
                By proceeding, you agree to our <a href="/terms" className="text-primary-600 hover:text-primary-800 underline">Terms of Service</a> and <a href="/privacy" className="text-primary-600 hover:text-primary-800 underline">Privacy Policy</a>.
              </p>
              {submitAttempted && !agreeToTerms && (
                <p className="mt-2 text-sm text-red-600">
                  You must agree to the terms and conditions to proceed
                </p>
              )}
            </div>
          </div>
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
    
    // Map field names to error messages
    const fieldErrorMessages: Record<string, string> = {
      deviceType: 'Please select a device type',
      deviceBrand: 'Please select a brand',
      deviceModel: 'Please enter a model',
      issueDescription: 'Please describe the issue',
      name: 'Please enter your name',
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      address: 'Please enter your address',
      postalCode: 'Please enter a valid postal code',
      city: 'Please select a city',
      preferredDate: 'Please select a preferred date',
      preferredTime: 'Please select a preferred time',
      customBrand: 'Please enter the brand name'
    };
    
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                {errorFields.map((fieldName, index) => (
                  <li key={index}>{fieldErrorMessages[fieldName] || `${fieldName} is required`}</li>
              ))}
            </ul>
            </div>
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
    <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8 max-w-3xl mx-auto border border-gray-100">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center text-primary-600 relative">
        <span className="relative inline-block">
          Book Your Doorstep Repair
          <span className="absolute bottom-0 left-0 w-full h-1 bg-primary-300 opacity-40"></span>
        </span>
      </h2>
      
      {/* Step progress indicators */}
      <div className="mb-8 sm:mb-12">
        {/* Mobile: Vertical stepper */}
        <div className="block sm:hidden">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 flex-shrink-0 ${
                    index < currentStep 
                      ? 'bg-primary-600 text-white shadow-md' 
                      : index === currentStep 
                        ? 'bg-primary-100 text-primary-800 border-2 border-primary-500 shadow-md' 
                        : 'bg-gray-100 text-gray-500 border border-gray-300'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium leading-tight ${
                    index === currentStep ? 'text-primary-700 font-semibold' : index < currentStep ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    {step}
                  </span>
                  {index === currentStep && (
                    <div className="h-0.5 w-full bg-primary-500 mt-1 rounded-full"></div>
                  )}
                </div>
                {/* Vertical connection line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-4 mt-8 w-0.5 h-4 bg-gray-300 transform translate-y-full"></div>
                )}
              </div>
            ))}
          </div>
          {/* Mobile progress bar */}
          <div className="relative mt-6">
            <div className="w-full h-2 bg-gray-200 rounded-full"></div>
            <div 
              className="absolute left-0 top-0 h-2 bg-primary-600 rounded-full transition-all duration-700 ease-in-out" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Desktop: Horizontal stepper */}
        <div className="hidden sm:block">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index < currentStep 
                      ? 'bg-primary-600 text-white scale-110 shadow-md' 
                      : index === currentStep 
                        ? 'bg-primary-100 text-primary-800 border-2 border-primary-500 scale-125 shadow-md' 
                        : 'bg-gray-100 text-gray-500 border border-gray-300'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium max-w-[80px] text-center leading-tight ${
                  index === currentStep ? 'text-primary-700 font-semibold' : index < currentStep ? 'text-primary-600' : 'text-gray-600'
                } ${index === currentStep ? 'scale-110' : ''} transition-all duration-300`}>
                  {step}
                </span>
                
                {index === currentStep && (
                  <div className="h-1 w-10 bg-primary-500 mt-1 rounded-full"></div>
                )}
                
                {/* Connection lines between step indicators */}
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-[calc(100%+0.5rem)] w-[calc(100%-2rem)] h-[2px] -translate-y-1/2" style={{ left: '100%', width: 'calc(100% - 1rem)' }}>
                    <div className={`h-full ${index < currentStep ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Desktop progress bar */}
          <div className="relative mt-5">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-2 bg-primary-600 rounded-full transition-all duration-700 ease-in-out" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
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
          {/* Step content with improved styling */}
          <div className="mb-6 sm:mb-8 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100 shadow-sm">
        {renderStepContent()}
          </div>
          
          {/* Navigation buttons with improved styling */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm"
              >
                Cancel
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => nextStep()}
                className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
                disabled={methods.formState.isSubmitting}
              >
                {methods.formState.isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Booking
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
      </form>
      </FormProvider>
    </div>
  );
}