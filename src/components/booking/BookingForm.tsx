import React, { useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
// Comment out the non-existent imports for now
// import { DeviceTypeStep } from './steps/DeviceTypeStep';
// import { ServiceDetailsStep } from './steps/ServiceDetailsStep';
// import { CustomerInfoStep } from './steps/CustomerInfoStep';
// import { LocationStep } from './steps/LocationStep';
// import { AppointmentStep } from './steps/AppointmentStep';
// import { ConfirmationStep } from './steps/ConfirmationStep';
import type { CreateBookingRequest } from '@/types/booking';

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

  // Create a properly typed defaultValues object
  const defaultValues: Partial<CreateBookingRequest> = {
    deviceType: initialData.deviceType || 'mobile',
    deviceBrand: initialData.deviceBrand || '',
    deviceModel: initialData.deviceModel || '',
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
    defaultValues
  });

  // Placeholder step titles
  const steps = [
    'Device Type',
    'Service Details',
    'Contact Info',
    'Location',
    'Appointment',
    'Confirm',
  ];

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (data: CreateBookingRequest) => {
    onSubmit(data);
  };
  
  // Render the Device Type step
  const renderDeviceTypeStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Device Type</label>
          <div className="flex flex-wrap gap-4">
            <label className="relative flex items-center">
              <Controller
                name="deviceType"
                control={methods.control}
                render={({ field }) => (
                  <input
                    type="radio"
                    className="sr-only"
                    value="mobile"
                    checked={field.value === 'mobile'}
                    onChange={() => field.onChange('mobile')}
                  />
                )}
              />
              <div className={`
                p-4 border-2 rounded-lg flex flex-col items-center cursor-pointer transition
                ${methods.watch('deviceType') === 'mobile' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="mt-2 font-medium">Mobile Phone</span>
              </div>
            </label>
            
            <label className="relative flex items-center">
              <Controller
                name="deviceType"
                control={methods.control}
                render={({ field }) => (
                  <input
                    type="radio"
                    className="sr-only"
                    value="laptop"
                    checked={field.value === 'laptop'}
                    onChange={() => field.onChange('laptop')}
                  />
                )}
              />
              <div className={`
                p-4 border-2 rounded-lg flex flex-col items-center cursor-pointer transition
                ${methods.watch('deviceType') === 'laptop' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="mt-2 font-medium">Laptop</span>
              </div>
            </label>
            
            <label className="relative flex items-center">
              <Controller
                name="deviceType"
                control={methods.control}
                render={({ field }) => (
                  <input
                    type="radio"
                    className="sr-only"
                    value="tablet"
                    checked={field.value === 'tablet'}
                    onChange={() => field.onChange('tablet')}
                  />
                )}
              />
              <div className={`
                p-4 border-2 rounded-lg flex flex-col items-center cursor-pointer transition
                ${methods.watch('deviceType') === 'tablet' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="mt-2 font-medium">Tablet</span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="deviceBrand" className="block text-sm font-medium text-gray-700">
            Device Brand
              </label>
          <Controller
            name="deviceBrand"
            control={methods.control}
            rules={{ required: "Brand is required" }}
            render={({ field, fieldState }) => (
              <>
              <input
                  id="deviceBrand"
                type="text"
                  className={`
                    mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                placeholder="e.g., Apple, Samsung, Dell"
                  {...field}
                />
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
              />
            </div>
            
        <div className="space-y-2">
          <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700">
            Device Model
              </label>
          <Controller
            name="deviceModel"
            control={methods.control}
            rules={{ required: "Model is required" }}
            render={({ field, fieldState }) => (
              <>
              <input
                  id="deviceModel"
                type="text"
                  className={`
                    mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                placeholder="e.g., iPhone 13, Galaxy S22, XPS 15"
                  {...field}
              />
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
          </>
        )}
          />
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
          {methods.formState.errors.serviceType && (
            <p className="mt-1 text-sm text-red-600">{methods.formState.errors.serviceType.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700">
            Describe the Issue
          </label>
          <Controller
            name="issueDescription"
            control={methods.control}
            rules={{ required: "Please describe the issue" }}
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
                  placeholder={`Please describe the issue with your ${deviceType}...`}
                  {...field}
                />
                {fieldState.error && (
                  <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            The more details you provide, the better we can prepare for your repair.
          </p>
        </div>
      </div>
    );
  };

  // Render the Customer Info step
  const renderCustomerInfoStep = () => {
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
                {fieldState.error && (
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
                {fieldState.error && (
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
                {fieldState.error && (
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

        <div className="space-y-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <Controller
            name="address"
            control={methods.control}
            rules={{ required: "Address is required" }}
            render={({ field, fieldState }) => (
              <>
                <input
                  id="address"
                  type="text"
                  className={`
                    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                    ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                    focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                  `}
                  placeholder="123 Main St, Apt 4B"
                  {...field}
                />
                {fieldState.error && (
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
                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <Controller
              name="postalCode"
              control={methods.control}
              rules={{ 
                required: "Postal code is required",
                pattern: {
                  value: process.env.NODE_ENV === 'production'
                    ? /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
                    : /^.{2,}$/,
                  message: "Please enter a valid Canadian postal code"
                }
              }}
              render={({ field, fieldState }) => (
                <>
                  <input
                    id="postalCode"
                    type="text"
                    className={`
                      block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                      ${fieldState.error ? 'border-red-300' : 'border-gray-300'}
                      focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
                    `}
                    placeholder="V6B 1A1"
                    {...field}
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
        </div>
            </div>
        
        <div className="space-y-2">
          <label htmlFor="province" className="block text-sm font-medium text-gray-700">
            Province
          </label>
          <Controller
            name="province"
            control={methods.control}
            render={({ field }) => (
              <input
                id="province"
                type="text"
                className="bg-gray-100 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                disabled
                {...field}
              />
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            We currently only service British Columbia's Lower Mainland.
          </p>
        </div>
      </div>
    );
  };

  // Render the Appointment step
  const renderAppointmentStep = () => {
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
                {fieldState.error && (
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
                {fieldState.error && (
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
    const data = methods.getValues();
    const serviceTypeMap: Record<string, string> = {
      'screen-replacement': 'Screen Replacement',
      'battery-replacement': 'Battery Replacement',
      'charging-port': 'Charging Port Repair',
      'speaker-mic': 'Speaker/Microphone Repair',
      'camera-repair': 'Camera Repair',
      'water-damage': 'Water Damage Diagnostics',
      'keyboard-repair': 'Keyboard Repair/Replacement',
      'trackpad-repair': 'Trackpad Repair',
      'ram-upgrade': 'RAM Upgrade',
      'storage-upgrade': 'HDD/SSD Replacement/Upgrade',
      'software-trouble': 'Software Troubleshooting',
      'virus-removal': 'Virus Removal',
      'cooling-repair': 'Cooling System Repair',
      'power-jack': 'Power Jack Repair',
      'button-repair': 'Button Repair',
      'software-issue': 'Software Issue',
      'other-mobile': 'Other Mobile Issue',
      'other-laptop': 'Other Laptop Issue',
      'other-tablet': 'Other Tablet Issue',
    };
    
    // Format date for display
    const formatDate = (dateString: string) => {
      if (!dateString) return 'Not selected';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-CA', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }).format(date);
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
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Device Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{data.deviceType}</dd>
            </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Brand</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.deviceBrand}</dd>
          </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Model</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.deviceModel}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Service</dt>
                <dd className="mt-1 text-sm text-gray-900">{serviceTypeMap[data.serviceType] || data.serviceType}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Issue Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.issueDescription}</dd>
              </div>
            </dl>
          </div>
          
          <div className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.customerName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.customerPhone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.customerEmail}</dd>
              </div>
            </dl>
        </div>
        
          <div className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Location</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.address}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.city}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.postalCode}</dd>
              </div>
            </dl>
        </div>
        
          <div className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Appointment</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(data.appointmentDate)}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTime(data.appointmentTime)}</dd>
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

  // Render the appropriate step based on currentStep
  const renderStepContent = () => {
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
  };

  // Override the handleSubmit function to check for terms agreement
  const handleFinalSubmit = () => {
    if (currentStep === steps.length - 1 && !agreeToTerms) {
      setSubmitAttempted(true);
      return;
    }
    
    methods.handleSubmit((data) => {
      onSubmit(data);
    })();
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
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === steps.length - 1) {
            handleFinalSubmit();
          } else {
            nextStep();
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
                onClick={nextStep}
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