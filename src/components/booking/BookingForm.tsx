import { useState, useEffect } from 'react';
import { FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaMobile, FaLaptop, FaTools, FaCheckCircle, FaEnvelope, FaSpinner } from 'react-icons/fa';
import PostalCodeChecker from '@/components/PostalCodeChecker';
import { ServiceAreaType, checkServiceArea } from '@/utils/locationUtils';
import DeviceModelSelector from './DeviceModelSelector';
import AddressAutocomplete from './AddressAutocomplete';
import { useBooking, BookingData } from '@/lib/bookingContext';

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
  const [addressError, setAddressError] = useState<boolean>(false);
  const [dateError, setDateError] = useState<boolean>(false);
  const [timeError, setTimeError] = useState<boolean>(false);
  const [showScheduleErrors, setShowScheduleErrors] = useState<boolean>(false);
  const [nameError, setNameError] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [showContactErrors, setShowContactErrors] = useState<boolean>(false);
  const [isAddressValid, setIsAddressValid] = useState<boolean>(false);
  const [addressPostalCode, setAddressPostalCode] = useState<string>('');
  // New states for confirmation email
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false);
  const [emailError2, setEmailError2] = useState<string | null>(null);
  // Add a new state to store the booking details from the API response
  const [bookingData, setBookingData] = useState<any>(null);
  
  // Add our booking context
  const { setBookingData: setContextBookingData } = useBooking();
  
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
  
  // Generate a random booking reference
  const generateBookingReference = () => {
    const prefix = 'TT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  };
  
  // Send confirmation email
  const sendConfirmationEmail = async () => {
    try {
      console.log('DEBUG - Preparing to send confirmation email');
      
      // Reference to the selected service
      const selectedService = serviceTypes[deviceType as keyof typeof serviceTypes].find(s => s.id === serviceType)?.name || '';
      
      // Format date for email
      const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }) : '';
      
      // Format time for email
      const formattedTime = availableTimes.find(t => t.id === timeSlot)?.label || '';
      
      // Log the data being sent to the email API
      console.log('DEBUG - Email data:', {
        to: contactEmail,
        name: contactName,
        bookingDate: formattedDate,
        bookingTime: formattedTime,
        deviceType: deviceType === 'mobile' ? 'Mobile Phone' : deviceType === 'laptop' ? 'Laptop' : 'Tablet',
        brand,
        model,
        service: selectedService,
        address
      });
      
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactEmail,
          name: contactName,
          bookingDate: formattedDate,
          bookingTime: formattedTime,
          deviceType: deviceType === 'mobile' ? 'Mobile Phone' : deviceType === 'laptop' ? 'Laptop' : 'Tablet',
          brand: brand,
          model: model,
          service: selectedService,
          address: address,
          bookingReference: bookingReference
        }),
      });
      
      // Log the raw response
      console.log('DEBUG - Email API response status:', response.status);
      
      // Parse the JSON response
      const data = await response.json();
      console.log('DEBUG - Email API response data:', data);
      
      if (data.success) {
        console.log('DEBUG - Email sent successfully');
        setConfirmationEmailSent(true);
        setEmailError2(null);
        return true;
      } else {
        console.error('DEBUG - Email API returned error:', data.error || 'Unknown error');
        setEmailError2('Failed to send confirmation email. Please contact support.');
        return false;
      }
    } catch (error) {
      console.error('DEBUG - Exception during email sending:', error);
      setEmailError2('An error occurred while sending the confirmation email. Please contact support.');
      return false;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEBUG: Log the current state values
    console.log('DEBUG - Form submission started with values:', {
      address: address || 'EMPTY',
      postalCode: postalCode || 'EMPTY',
      addressPostalCode: addressPostalCode || 'EMPTY',
      isAddressValid: isAddressValid,
      contactName: contactName || 'EMPTY',
      contactEmail: contactEmail || 'EMPTY',
      deviceType: deviceType || 'EMPTY',
      serviceType: serviceType || 'EMPTY',
      date: date || 'EMPTY',
      timeSlot: timeSlot || 'EMPTY'
    });
    
    // Validate all required fields first
    let hasError = false;
    
    if (!contactName) {
      setNameError(true);
      hasError = true;
    }
    
    if (!contactPhone) {
      setPhoneError(true);
      hasError = true;
    }
    
    if (!contactEmail) {
      setEmailError(true);
      hasError = true;
    }
    
    if (!address) {
      console.log('DEBUG - Address is empty, setting error');
      setAddressError(true);
      hasError = true;
    } else if (!isAddressValid) {
      console.log('DEBUG - Address is present but not valid, setting error');
      setAddressError(true);
      hasError = true;
    }
    
    if (!date) {
      setDateError(true);
      hasError = true;
    }
    
    if (!timeSlot) {
      setTimeError(true);
      hasError = true;
    }
    
    if (hasError) {
      console.log('DEBUG - Form validation failed, not submitting');
      setShowContactErrors(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Start submission process
    setIsSubmitting(true);
    
    // Generate a booking reference
    const reference = generateBookingReference();
    setBookingReference(reference);
    
    try {
      // Important: Use postalCode, then addressPostalCode as fallback if empty
      // We now set both above, so this is just an extra safeguard
      const finalPostalCode = postalCode || addressPostalCode;
      
      if (!finalPostalCode) {
        console.error('DEBUG - CRITICAL: No postal code available for submission!');
        setIsSubmitting(false);
        alert('Error: No postal code is available. Please try selecting your address again or contact support.');
        return;
      }
      
      if (!address) {
        console.error('DEBUG - CRITICAL: No address available for submission!');
        setIsSubmitting(false);
        alert('Error: No address is available. Please try selecting your address again or contact support.');
        return;
      }
      
      console.log('DEBUG - Final values being sent to API:', {
        deviceType, 
        brand, 
        model, 
        serviceType, 
        address: address || 'MISSING!', 
        postalCode: finalPostalCode || 'MISSING!', 
        date, 
        timeSlot, 
        contactName, 
        contactPhone, 
        contactEmail,
        reference
      });
      
      // Prepare the request body
      const requestBody = {
        bookingReference: reference,
        deviceType,
        brand,
        model,
        serviceType,
        issueDescription,
        address,
        postalCode: finalPostalCode, // Use the final postal code value
        appointmentDate: date,
        appointmentTime: timeSlot,
        customerName: contactName,
        customerPhone: contactPhone,
        customerEmail: contactEmail,
      };
      
      console.log('DEBUG - Full request body:', JSON.stringify(requestBody));
      
      // Call API to create booking in Supabase
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('DEBUG - API response:', data);
      
      if (data.success) {
        console.log('DEBUG - Booking created successfully, sending confirmation email');
        // Store the booking data for the confirmation screen
        setBookingData(data.booking);
        try {
          // Send confirmation email AFTER successful database insertion
          const emailResult = await sendConfirmationEmail();
          console.log('DEBUG - Email confirmation result:', emailResult);
          
          // Store booking data in the global context
          const booking = data.booking;
          setContextBookingData({
            reference_number: booking.reference_number,
            device_type: booking.device_type,
            device_brand: booking.device_brand,
            device_model: booking.device_model,
            service_type: booking.service_type,
            booking_date: booking.booking_date || booking.appointment_date,
            booking_time: booking.booking_time || booking.appointment_time,
            address: booking.address,
            postal_code: booking.postal_code,
            customer_name: booking.customer_name,
            customer_email: booking.customer_email,
            customer_phone: booking.customer_phone,
            issue_description: booking.issue_description,
            status: booking.status
          });
          
          // Get redirect URL from the confirm-redirect API
          const redirectResponse = await fetch('/api/bookings/confirm-redirect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data.booking),
          });
          
          const redirectData = await redirectResponse.json();
          console.log('DEBUG - Redirect API response:', redirectData);
          
          if (redirectData.success && redirectData.redirectUrl) {
            // Redirect to the confirmation page (no need for localStorage, using context now)
            window.location.href = redirectData.redirectUrl;
            return; // Stop execution since we're redirecting
          }
          
          // Fallback if redirect fails
          if (emailResult) {
            // Complete booking process only if both database insertion AND email were successful
            console.log('DEBUG - Setting booking complete to true');
            setBookingComplete(true);
            
            // Pass data to parent component if provided
            if (onComplete) {
              onComplete(data.booking);
            }
          } else {
            // Email failed but booking was created
            console.error('DEBUG - Booking created but email failed to send');
            alert('Your booking was created successfully, but we had trouble sending the confirmation email. Please check your booking details and contact us if you need assistance.');
            setBookingComplete(true);
          }
        } catch (emailError) {
          console.error('DEBUG - Error sending confirmation email:', emailError);
          alert('Your booking was created successfully, but we had trouble sending the confirmation email. Please check your booking details and contact us if you need assistance.');
          setBookingComplete(true);
        }
      } else {
        // Handle error
        console.error('DEBUG - Error creating booking:', data.error, data.missingFields);
        if (data.missingFields) {
          alert(`There was an error creating your booking. Missing required fields: ${Object.keys(data.missingFields).filter(key => data.missingFields[key]).join(', ')}`);
        } else {
          alert(`There was an error creating your booking: ${data.error || 'Unknown error'}`);
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('DEBUG - Exception during booking submission:', error);
      alert('There was an error creating your booking. Please try again.');
      setIsSubmitting(false);
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
  
  // Add this helper function to the component
  const getDeviceTypeDisplay = (dbDeviceType: string, deviceModel?: string, deviceBrand?: string) => {
    const brandStr = deviceBrand ? `${deviceBrand} ` : '';
    
    // Check if it's a tablet based on model name
    if (dbDeviceType === 'mobile' && deviceModel && 
        (deviceModel.toLowerCase().includes('ipad') || 
         deviceModel.toLowerCase().includes('tab') || 
         deviceModel.toLowerCase().includes('surface'))) {
      return `Tablet - ${brandStr}${deviceModel}`;
    }
    
    return `${dbDeviceType === 'mobile' ? 'Mobile Phone' : 'Laptop'} - ${brandStr}${deviceModel || ''}`;
  };
  
  // Add this helper function to format time slots
  const formatTimeSlot = (timeSlot: string): string => {
    if (!timeSlot || !timeSlot.includes('-')) return timeSlot || '';
    
    const [start, end] = timeSlot.split('-');
    const startHour = parseInt(start);
    const endHour = parseInt(end);
    
    const startTime = startHour < 12 ? 
      `${startHour}:00 AM` : 
      `${startHour === 12 ? 12 : startHour - 12}:00 PM`;
      
    const endTime = endHour < 12 ? 
      `${endHour}:00 AM` : 
      `${endHour === 12 ? 12 : endHour - 12}:00 PM`;
    
    return `${startTime} - ${endTime}`;
  };
  
  // Return JSX for Form
  if (bookingComplete) {
    // Show booking confirmation page when complete
    return (
      <div className="bg-white rounded-lg shadow-custom-lg overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="text-center">
            <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Complete!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for booking with The Travelling Technicians.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Booking Reference: <span className="text-primary-600 font-bold">
                  {bookingData?.reference_number || bookingReference}
                </span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-gray-500 mb-1">Device</p>
                  <p className="font-medium">
                    {bookingData ? (
                      `${getDeviceTypeDisplay(bookingData.device_type, bookingData.device_model, bookingData.device_brand)}`
                    ) : (
                      `${deviceType === 'mobile' ? 'Mobile Phone' : 
                        deviceType === 'laptop' ? 'Laptop' : 'Tablet'} - ${brand} ${model}`
                    )}
                  </p>
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-gray-500 mb-1">Service</p>
                  <p className="font-medium">
                    {bookingData ? (
                      // Try to find the service name based on the ID stored in the booking
                      (serviceTypes[bookingData.device_type as keyof typeof serviceTypes]?.find(s => s.id === bookingData.service_type)?.name ||
                      // Fallback to formatted service type string if not found in the serviceTypes map
                      bookingData.service_type?.replace(/_/g, ' ')
                        .split(' ')
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' '))
                    ) : (
                      serviceTypes[deviceType as keyof typeof serviceTypes]?.find(s => s.id === serviceType)?.name ||
                      "Service information not available"
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="font-medium">
                    {bookingData?.booking_date ? (
                      // For booking data from API response
                      (() => {
                        try {
                          return new Date(bookingData.booking_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          });
                        } catch (e) {
                          console.error('Error formatting date:', e);
                          return bookingData.booking_date || "Date information not available";
                        }
                      })()
                    ) : bookingData?.appointment_date ? (
                      // For booking data with appointment_date
                      (() => {
                        try {
                          return new Date(bookingData.appointment_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          });
                        } catch (e) {
                          console.error('Error formatting appointment date:', e);
                          return bookingData.appointment_date || "Date information not available";
                        }
                      })()
                    ) : date ? (
                      // For local state date
                      (() => {
                        try {
                          return new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          });
                        } catch (e) {
                          console.error('Error formatting local date:', e);
                          return date || "Date information not available";
                        }
                      })()
                    ) : "Date information not available"}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500 mb-1">Time</p>
                  <p className="font-medium">
                    {bookingData?.booking_time ? (
                      availableTimes.find(t => t.id === bookingData.booking_time)?.label ||
                      formatTimeSlot(bookingData.booking_time) ||
                      bookingData.booking_time
                    ) : bookingData?.appointment_time ? (
                      availableTimes.find(t => t.id === bookingData.appointment_time)?.label ||
                      formatTimeSlot(bookingData.appointment_time) ||
                      bookingData.appointment_time
                    ) : timeSlot ? (
                      availableTimes.find(t => t.id === timeSlot)?.label ||
                      formatTimeSlot(timeSlot) ||
                      timeSlot
                    ) : "Time information not available"}
                  </p>
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-gray-500 mb-1">Address</p>
                  <p className="font-medium">
                    {bookingData?.address || address || "Address information not available"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${confirmationEmailSent ? 'bg-green-500 text-white' : 'bg-primary-100 text-primary-600'}`}>
                  {confirmationEmailSent ? (
                    <FaCheckCircle className="h-5 w-5" />
                  ) : (
                    <FaEnvelope className="h-5 w-5" />
                  )}
                </div>
                <span className="text-gray-700">
                  {confirmationEmailSent 
                    ? `Confirmation email sent to ${contactEmail}`
                    : 'Sending confirmation email...'}
                </span>
              </div>
              
              {emailError2 && (
                <p className="text-sm text-red-600 mb-4">{emailError2}</p>
              )}
              
              <p className="text-sm text-gray-500 mb-4">
                Please check your email for booking details and verification link.
              </p>
              
              <p className="text-sm text-gray-700">
                Our technician will arrive at your address during the selected time window.
                You will receive a call about 30 minutes before the technician arrives.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="btn-outline"
              >
                Return Home
              </button>
              <button
                type="button"
                onClick={() => window.location.href = '/contact'}
                className="btn-primary"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
                    <DeviceModelSelector
                      deviceType={deviceType}
                      brand={brand}
                      value={model}
                      onChange={setModel}
                    />
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
              
              {showScheduleErrors && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-red-800">
                    Please complete all required fields to continue:
                  </div>
                  <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
                    {!address && <li>Service address is required</li>}
                    {address && !isAddressValid && <li>The provided address is outside our service area</li>}
                    {!date && <li>Appointment date is required</li>}
                    {!timeSlot && <li>Appointment time is required</li>}
                  </ul>
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                  Service Address *
                </label>
                <AddressAutocomplete
                  onAddressSelect={(newAddress, isValid, postalCode) => {
                    console.log("DEBUG - AddressAutocomplete callback triggered with:", {
                      newAddress,
                      isValid,
                      postalCode
                    });
                    
                    // Save the address in state
                    setAddress(newAddress);
                    
                    // Log the state updates
                    console.log("DEBUG - After setAddress, value is:", newAddress);
                    
                    if (postalCode) {
                      // Set both postal code variables to ensure consistency
                      setAddressPostalCode(postalCode);
                      setPostalCode(postalCode); // Set main postalCode state too
                      console.log("DEBUG - Setting postal codes to:", postalCode);
                      console.log("DEBUG - State after setting postal codes:", {
                        addressPostalCode: postalCode,
                        postalCode: postalCode
                      });
                      
                      // Check if this postal code is within our service area
                      const result = checkServiceArea(postalCode);
                      console.log("DEBUG - Service area check result:", result);
                      
                      setIsAddressValid(result !== null && result.serviceable); 
                    } else {
                      console.log("DEBUG - No postal code provided!");
                      setIsAddressValid(false);
                    }
                    
                    setAddressError(false);
                  }}
                  value={address}
                  error={addressError}
                  className={addressError ? "border-red-500" : ""}
                />
                {addressError && !address && (
                  <p className="mt-1 text-sm text-red-600">Service address is required</p>
                )}
                {addressError && address && !isAddressValid && (
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
                        dateOption.value === date 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : dateError
                            ? 'border-red-300 hover:border-primary-200 text-gray-700'
                            : 'border-gray-200 hover:border-primary-200 text-gray-700'
                      }`}
                      onClick={() => {
                        setDate(dateOption.value);
                        setDateError(false);
                      }}
                    >
                      {dateOption.label}
                    </button>
                  ))}
                </div>
                {dateError && (
                  <p className="mt-1 text-sm text-red-600">Please select an appointment date</p>
                )}
              </div>
              
              <div className={`mb-6 ${!date && !timeError ? 'opacity-60' : ''}`}>
                <label className="block text-gray-700 font-medium mb-3">Select Time *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time.id}
                      type="button"
                      disabled={!date}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        time.id === timeSlot 
                          ? 'border-primary-500 bg-primary-50 text-primary-700' 
                          : timeError
                            ? 'border-red-300 hover:border-primary-200 text-gray-700'
                            : 'border-gray-200 hover:border-primary-200 text-gray-700'
                      } ${!date ? 'cursor-not-allowed' : ''}`}
                      onClick={() => {
                        setTimeSlot(time.id);
                        setTimeError(false);
                      }}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>
                {timeError && (
                  <p className="mt-1 text-sm text-red-600">Please select an appointment time</p>
                )}
                {!date && !timeError && (
                  <p className="mt-1 text-sm text-gray-500">Please select a date first</p>
                )}
              </div>
              
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
                  onClick={() => {
                    let hasError = false;
                    console.log("Validating form: Address:", address, "Is valid:", isAddressValid);
                    
                    // Only validate address if it's empty
                    if (!address) {
                      setAddressError(true);
                      hasError = true;
                    }
                    // Only check this if address is provided but not valid
                    else if (!isAddressValid) {
                      setAddressError(true);
                      hasError = true;
                    }
                    
                    if (!date) {
                      setDateError(true);
                      hasError = true;
                    }
                    
                    if (!timeSlot) {
                      setTimeError(true);
                      hasError = true;
                    }
                    
                    if (hasError) {
                      setShowScheduleErrors(true);
                      // Scroll to top to show the error message
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setShowScheduleErrors(false);
                      setStep(5);
                    }
                  }}
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
              
              {showContactErrors && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-red-800">
                    Please complete all required fields to confirm your booking:
                  </div>
                  <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
                    {!contactName && <li>Full name is required</li>}
                    {!contactPhone && <li>Phone number is required</li>}
                    {!contactEmail && <li>Email address is required</li>}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label htmlFor="contactName" className="block text-gray-700 font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    className={`w-full px-4 py-3 border ${nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    placeholder="Enter your full name"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      if (e.target.value) setNameError(false);
                    }}
                    required
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-600">Full name is required</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contactPhone" className="block text-gray-700 font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    className={`w-full px-4 py-3 border ${phoneError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    placeholder="Enter your phone number"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      if (e.target.value) setPhoneError(false);
                    }}
                    required
                  />
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-600">Phone number is required</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    className={`w-full px-4 py-3 border ${emailError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    placeholder="Enter your email address"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      if (e.target.value) setEmailError(false);
                    }}
                    required
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">Email address is required</p>
                  )}
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
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 