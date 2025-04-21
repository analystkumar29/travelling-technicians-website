import { useState, useEffect } from 'react';
import { FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaMobile, FaLaptop, FaTools, FaCheckCircle } from 'react-icons/fa';
import PostalCodeChecker from '@/components/PostalCodeChecker';
import { ServiceAreaType } from '@/utils/locationUtils';

// Device types
const deviceTypes = [
  { id: 'mobile', name: 'Mobile Phone', icon: <FaMobile className="h-5 w-5" /> },
  { id: 'laptop', name: 'Laptop', icon: <FaLaptop className="h-5 w-5" /> },
  { id: 'tablet', name: 'Tablet', icon: <FaMobile className="h-5 w-5" /> },
];

// Common brands
const deviceBrands = {
  mobile: [
    { id: 'apple', name: 'Apple iPhone' },
    { id: 'samsung', name: 'Samsung Galaxy' },
    { id: 'google', name: 'Google Pixel' },
    { id: 'oneplus', name: 'OnePlus' },
    { id: 'xiaomi', name: 'Xiaomi' },
    { id: 'other', name: 'Other Brand' },
  ],
  laptop: [
    { id: 'apple', name: 'Apple MacBook' },
    { id: 'dell', name: 'Dell' },
    { id: 'hp', name: 'HP' },
    { id: 'lenovo', name: 'Lenovo' },
    { id: 'asus', name: 'ASUS' },
    { id: 'other', name: 'Other Brand' },
  ],
  tablet: [
    { id: 'apple', name: 'Apple iPad' },
    { id: 'samsung', name: 'Samsung Galaxy Tab' },
    { id: 'microsoft', name: 'Microsoft Surface' },
    { id: 'lenovo', name: 'Lenovo Tab' },
    { id: 'other', name: 'Other Brand' },
  ]
};

// Service types
const serviceTypes = {
  mobile: [
    { id: 'screen', name: 'Screen Replacement', price: '$99-249', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', price: '$69-129', doorstep: true },
    { id: 'charging', name: 'Charging Port Repair', price: '$79-149', doorstep: true },
    { id: 'camera', name: 'Camera Repair', price: '$89-149', doorstep: true },
    { id: 'speaker', name: 'Speaker/Mic Repair', price: '$69-119', doorstep: true },
    { id: 'water', name: 'Water Damage Repair', price: 'Varies', doorstep: false },
    { id: 'software', name: 'Software Issues', price: '$49-99', doorstep: true },
    { id: 'other', name: 'Other Issues', price: 'Custom Quote', doorstep: true },
  ],
  laptop: [
    { id: 'screen', name: 'Screen Replacement', price: '$149-399', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', price: '$99-199', doorstep: true },
    { id: 'keyboard', name: 'Keyboard Replacement', price: '$99-249', doorstep: true },
    { id: 'harddrive', name: 'HDD/SSD Upgrade', price: '$99-299', doorstep: true },
    { id: 'ram', name: 'RAM Upgrade', price: '$79-199', doorstep: true },
    { id: 'software', name: 'OS Installation', price: '$79-149', doorstep: true },
    { id: 'cooling', name: 'Cooling System Repair', price: '$99-199', doorstep: true },
    { id: 'other', name: 'Other Issues', price: 'Custom Quote', doorstep: true },
  ],
  tablet: [
    { id: 'screen', name: 'Screen Replacement', price: '$129-329', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', price: '$89-179', doorstep: true },
    { id: 'charging', name: 'Charging Port Repair', price: '$89-159', doorstep: true },
    { id: 'camera', name: 'Camera Repair', price: '$99-179', doorstep: true },
    { id: 'speaker', name: 'Speaker/Mic Repair', price: '$79-129', doorstep: true },
    { id: 'button', name: 'Button Repair', price: '$69-129', doorstep: true },
    { id: 'software', name: 'Software Issues', price: '$49-99', doorstep: true },
    { id: 'other', name: 'Other Issues', price: 'Custom Quote', doorstep: true },
  ]
};

// Available times
const availableTimes = [
  { id: '09-11', label: '9:00 AM - 11:00 AM' },
  { id: '11-13', label: '11:00 AM - 1:00 PM' },
  { id: '13-15', label: '1:00 PM - 3:00 PM' },
  { id: '15-17', label: '3:00 PM - 5:00 PM' },
  { id: '17-19', label: '5:00 PM - 7:00 PM' },
  { id: '19-21', label: '7:00 PM - 9:00 PM' },
];

type BookingFormProps = {
  onComplete?: (bookingData: any) => void;
};

export default function BookingForm({ onComplete }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [deviceType, setDeviceType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [serviceAreaResult, setServiceAreaResult] = useState<ServiceAreaType | null>(null);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  
  // Handle successful postal code check
  const handlePostalCodeSuccess = (result: ServiceAreaType, code: string) => {
    setServiceAreaResult(result);
    setPostalCode(code);
    setPostalCodeError(null);
    // Instead of immediately moving to the next step, show success message first
    // setStep(4) will be triggered by a button click
  };
  
  // Handle postal code check error
  const handlePostalCodeError = (error: string) => {
    setServiceAreaResult(null);
    setPostalCodeError(error);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData = {
      deviceType,
      brand,
      model,
      serviceType,
      issueDescription,
      postalCode,
      address,
      date,
      timeSlot,
      contactName,
      contactPhone,
      contactEmail,
    };
    
    if (onComplete) {
      onComplete(bookingData);
    }
  };
  
  // Get available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      dates.push({ value: dateString, label: displayDate });
    }
    
    return dates;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-custom-lg overflow-hidden">
      {/* Progress Indicator */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-2">
            <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Device</span>
            <FaChevronRight className="text-gray-300" />
            
            <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Issue</span>
            <FaChevronRight className="text-gray-300" />
            
            <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Location</span>
            <FaChevronRight className="text-gray-300" />
            
            <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 4 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              4
            </div>
            <span className={step >= 4 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Schedule</span>
            <FaChevronRight className="text-gray-300" />
            
            <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 5 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              5
            </div>
            <span className={step >= 5 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Confirm</span>
          </div>
          
          <div className="flex md:hidden w-full">
            <div className="h-2 bg-gray-200 rounded-full flex-grow flex">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Step {step} of 5
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Device Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Select Your Device</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">Device Type *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {deviceTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                        deviceType === type.id 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-gray-200 hover:border-primary-200 text-gray-700'
                      }`}
                      onClick={() => setDeviceType(type.id)}
                    >
                      <div className="rounded-full bg-gray-100 p-2 mr-3">
                        {type.icon}
                      </div>
                      <span className="font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {deviceType && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-3">Brand *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {deviceBrands[deviceType as keyof typeof deviceBrands].map((brandItem) => (
                        <button
                          key={brandItem.id}
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            brandItem.id === brand 
                              ? 'border-primary-500 bg-primary-50 text-primary-700' 
                              : 'border-gray-200 hover:border-primary-200 text-gray-700'
                          }`}
                          onClick={() => setBrand(brandItem.id)}
                        >
                          {brandItem.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {brand && (
                    <div className="mb-6">
                      <label htmlFor="model" className="block text-gray-700 font-medium mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        id="model"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your device model (e.g., iPhone 13 Pro, XPS 15)"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!deviceType || !brand || !model}
                  onClick={() => setStep(2)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Issue Selection */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">What's the Issue?</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">Service Type *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serviceTypes[deviceType as keyof typeof serviceTypes].map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        serviceType === service.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                      onClick={() => setServiceType(service.id)}
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
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!serviceType}
                  onClick={() => setStep(3)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Location Check */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Check Service Availability</h2>
              
              <div className="mb-6">
                <div className="custom-postal-code-checker">
                  <PostalCodeChecker 
                    className="booking-form-checker"
                    variant="default"
                    onSuccess={(result, code) => handlePostalCodeSuccess(result, code)}
                    onError={(error) => handlePostalCodeError(error)}
                  />
                </div>
                
                {serviceAreaResult && (
                  <div className="mt-8 text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center">
                        <FaCheckCircle className="h-6 w-6 text-green-500 mr-2" />
                        <span className="font-medium text-green-800">
                          {serviceAreaResult.city} is available for service! 
                          {serviceAreaResult.sameDay && " Same-day service is available."}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setStep(4)}
                    >
                      Continue to Schedule
                    </button>
                  </div>
                )}
                
                {postalCodeError && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setStep(2)}
                    >
                      Back to Previous Step
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 4: Schedule */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Choose Appointment Time</h2>
              
              <div className="mb-6">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                  Service Address *
                </label>
                <div className="flex items-center">
                  <div className="mr-2 text-primary-600">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    id="address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
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
                        dateOption.value === date 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : 'border-gray-200 hover:border-primary-200 text-gray-700'
                      }`}
                      onClick={() => setDate(dateOption.value)}
                    >
                      {dateOption.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {date && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-3">Select Time *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <button
                        key={time.id}
                        type="button"
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          time.id === timeSlot 
                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                            : 'border-gray-200 hover:border-primary-200 text-gray-700'
                        }`}
                        onClick={() => setTimeSlot(time.id)}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setStep(3)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!address || !date || !timeSlot}
                  onClick={() => setStep(5)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 5: Contact Information & Confirmation */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label htmlFor="contactName" className="block text-gray-700 font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contactPhone" className="block text-gray-700 font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-3">Booking Summary</h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Device:</div>
                  <div className="font-medium">{deviceType === 'mobile' ? 'Mobile Phone' : deviceType === 'laptop' ? 'Laptop' : 'Tablet'}</div>
                  
                  <div className="text-gray-600">Model:</div>
                  <div className="font-medium">{brand} {model}</div>
                  
                  <div className="text-gray-600">Service:</div>
                  <div className="font-medium">
                    {serviceTypes[deviceType as keyof typeof serviceTypes].find(s => s.id === serviceType)?.name}
                  </div>
                  
                  <div className="text-gray-600">Date & Time:</div>
                  <div className="font-medium">
                    {date && new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, {' '}
                    {availableTimes.find(t => t.id === timeSlot)?.label}
                  </div>
                  
                  <div className="text-gray-600">Address:</div>
                  <div className="font-medium">{address}</div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setStep(4)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!contactName || !contactPhone || !contactEmail}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 