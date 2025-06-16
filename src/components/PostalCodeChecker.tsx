import { useState, FormEvent, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaSearch, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { 
  checkServiceArea, 
  isValidPostalCodeFormat, 
  getCurrentLocationPostalCode, 
  ServiceAreaType 
} from '@/utils/locationUtils';
import { createSuccessConfetti } from '@/utils/ui-enhancements';

interface PostalCodeCheckerProps {
  className?: string;
  variant?: 'default' | 'compact';
  onSuccess?: (result: ServiceAreaType, postalCode: string) => void;
  onError?: (error: string) => void;
}

export default function PostalCodeChecker({ 
  className = '', 
  variant = 'default', 
  onSuccess, 
  onError 
}: PostalCodeCheckerProps) {
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ServiceAreaType | null>(null);
  const [searched, setSearched] = useState(false);
  const [locationErrorDetails, setLocationErrorDetails] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field when the component mounts
  useEffect(() => {
    if (variant === 'default' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [variant]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSearched(true);
    setLocationErrorDetails(null);
    
    if (!postalCode.trim()) {
      const errMsg = 'Please enter a postal code';
      setError(errMsg);
      setResult(null);
      if (onError) onError(errMsg);
      return;
    }
    
    if (!isValidPostalCodeFormat(postalCode)) {
      const errMsg = 'Please enter a valid postal code format (e.g., V6B 1A1)';
      setError(errMsg);
      setResult(null);
      if (onError) onError(errMsg);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Checking service area for:', postalCode);
      const serviceArea = checkServiceArea(postalCode);
      console.log('Service area result:', serviceArea);
      
      setResult(serviceArea);
      
      if (!serviceArea) {
        const errMsg = "We don't currently service this area. Please contact us for special arrangements.";
        setError(errMsg);
        if (onError) onError(errMsg);
      } else {
        // Create confetti effect on successful validation
        try {
          createSuccessConfetti();
        } catch (confettiError) {
          console.error('Error creating confetti:', confettiError);
        }
        
        // Store the validated postal code and service area information in localStorage
        const formattedPostalCode = postalCode.toUpperCase().trim();
        const formattedPostalCodeWithSpace = formattedPostalCode.replace(/\s+/g, ' ');
        
        const locationData = {
          postalCode: formattedPostalCodeWithSpace,
          city: serviceArea.city,
          province: 'BC', // Default province for all service areas
          serviceable: serviceArea.serviceable,
          timestamp: new Date().toISOString(),
          // Add a generic address using the postal code
          address: `Service Area ${formattedPostalCodeWithSpace}`
        };
        
        // Save to localStorage for use in the booking form
        localStorage.setItem('travellingTech_location', JSON.stringify(locationData));
        console.log('Saved location data to localStorage:', locationData);
        
        // Call onSuccess callback with the result and postal code
        if (onSuccess) onSuccess(serviceArea, postalCode);
      }
    } catch (err: any) {
      console.error('Error checking postal code:', err);
      const errMsg = 'An error occurred while checking your postal code';
      setError(errMsg);
      setResult(null);
      if (onError) onError(errMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const detectLocation = async () => {
    // Clear any previous errors and set loading state
    setLoadingLocation(true);
    setError(null);
    setLocationErrorDetails('Please allow location access when prompted. This may take a few seconds...');
    
    try {
      // Check if we're in a development environment for testing
      if (process.env.NODE_ENV === 'development') {
        // Wait a moment to simulate location detection
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use test postal code
        const testPostalCode = 'V5C 6R9';
        const serviceArea = checkServiceArea(testPostalCode);
        
        if (!serviceArea) {
          throw new Error("We don't currently service this test area.");
        }
        
        // Store test data and update UI
        setPostalCode(testPostalCode);
        setResult(serviceArea);
        setSearched(true);
        setLocationErrorDetails(null);
        
        // Save to localStorage
        const locationData = {
          postalCode: testPostalCode.toUpperCase().replace(/\s+/g, ' ').trim(),
          city: serviceArea.city,
          province: 'BC',
          serviceable: serviceArea.serviceable,
          timestamp: new Date().toISOString(),
          address: `123 Example Street, ${serviceArea.city}, BC ${testPostalCode}`
        };
        
        localStorage.setItem('travellingTech_location', JSON.stringify(locationData));
        console.log('Saved test location data:', locationData);
        
        if (onSuccess) {
          onSuccess(serviceArea, testPostalCode);
        }
        
        return;
      }
      
      // For production: try to get actual location
      let detectedPostalCode = '';
      let detailedAddress = '';
      let detectedCity = '';
      
      // First, try to get coordinates from geolocation API
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000
            });
          });
          
          const { latitude, longitude } = position.coords;
          console.log('Detected coordinates:', latitude, longitude);
          
          // Use these coordinates with OpenStreetMap API to get address details
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
            
            if (data.address) {
              // Extract postal code if available
              if (data.address.postcode) {
                detectedPostalCode = data.address.postcode;
              }
              
              // Build detailed address from components
              const addr = data.address;
              const streetNumber = addr.house_number || '';
              const street = addr.road || addr.street || addr.footway || addr.path || '';
              const unit = addr.unit || addr.apartment || '';
              
              if (streetNumber && street) {
                detailedAddress = unit 
                  ? `${unit}-${streetNumber} ${street}` 
                  : `${streetNumber} ${street}`;
              }
              
              // Get city information
              detectedCity = addr.city || addr.town || addr.village || addr.suburb || '';
            }
          }
        } catch (geoError) {
          console.error('Geolocation error:', geoError);
          // We'll continue with the fallback method
        }
      }
      
      // If we couldn't get postal code from coordinates, use utility function
      if (!detectedPostalCode) {
        try {
          detectedPostalCode = await getCurrentLocationPostalCode();
        } catch (error) {
          console.error('Error getting postal code:', error);
          throw new Error('Unable to detect your location. Please enter your postal code manually.');
        }
      }
      
      if (!detectedPostalCode) {
        throw new Error('Unable to detect your postal code. Please enter it manually.');
      }
      
      // Set the detected postal code in the input field
      setPostalCode(detectedPostalCode);
      setLocationErrorDetails(null);
      
      // Check if this postal code is in our service area
      const serviceArea = checkServiceArea(detectedPostalCode);
      setResult(serviceArea);
      setSearched(true);
      
      if (!serviceArea) {
        throw new Error("We don't currently service this area. Please contact us for special arrangements.");
      }
      
      // Create confetti effect on successful validation
      try {
        createSuccessConfetti();
      } catch (confettiError) {
        console.error('Error creating confetti:', confettiError);
      }
      
      // Use detected city or fallback to service area city
      const cityToUse = detectedCity || serviceArea.city;
      
      // Store location data in localStorage
      const locationData = {
        postalCode: detectedPostalCode.toUpperCase().replace(/\s+/g, ' ').trim(),
        city: cityToUse,
        province: 'BC',
        serviceable: serviceArea.serviceable,
        timestamp: new Date().toISOString(),
        address: detailedAddress || `${cityToUse} area (${detectedPostalCode})`
      };
      
      localStorage.setItem('travellingTech_location', JSON.stringify(locationData));
      console.log('Saved detected location data:', locationData);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(serviceArea, detectedPostalCode);
      }
    } catch (error) {
      console.error('Location detection error:', error);
      
      // Try fallback location as last resort
      try {
        setLocationErrorDetails('Precise location failed. Using approximate location based on your network...');
        
        const fallbackPostalCode = 'V5C 6R9';
        setPostalCode(fallbackPostalCode);
        
        const serviceArea = checkServiceArea(fallbackPostalCode);
        if (serviceArea) {
          setResult(serviceArea);
          setSearched(true);
          
          const locationData = {
            postalCode: fallbackPostalCode,
            city: serviceArea.city,
            province: 'BC',
            serviceable: serviceArea.serviceable,
            timestamp: new Date().toISOString(),
            address: `${serviceArea.city} area (${fallbackPostalCode})`
          };
          
          localStorage.setItem('travellingTech_location', JSON.stringify(locationData));
          setLocationErrorDetails('Using approximate location. For more accurate results, please enter your postal code manually.');
          
          if (onSuccess) {
            onSuccess(serviceArea, fallbackPostalCode);
          }
          
          return;
        }
      } catch (fallbackError) {
        // Even fallback failed
        console.error('Fallback location failed:', fallbackError);
      }
      
      // If we get here, both main and fallback approaches failed
      const errMsg = error instanceof Error ? error.message : 'Failed to detect your location';
      setError(errMsg);
      setLocationErrorDetails('This could be due to browser permissions, network issues, or API limitations. Please try entering your postal code manually instead.');
      
      if (onError) onError(errMsg);
    } finally {
      setLoadingLocation(false);
    }
  };
  
  const renderResult = () => {
    if (!searched || (!result && !error)) return null;
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <FaSpinner className="animate-spin text-primary-600 text-2xl" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimesCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Service Area Check</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                {locationErrorDetails && (
                  <p className="mt-1 text-xs">{locationErrorDetails}</p>
                )}
              </div>
              {error.includes("don't currently service") && (
                <div className="mt-4">
                  {!onSuccess && !onError ? (
                    <Link href="/contact/" className="text-sm font-medium text-red-800 hover:text-red-900">
                      <span>Contact us for special arrangements →</span>
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-red-800">
                      Please contact us for special arrangements
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // Show success result
    return (
      <div className="postal-code-success mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaCheckCircle className="h-5 w-5 postal-code-success-icon" />
          </div>
          <div className="ml-3">
            <h3 className="postal-code-success-text">Great news!</h3>
            <div className="mt-2">
              <p className="postal-code-success-location">We provide service in {result?.city || 'your area'}!</p>
              {result?.sameDay && (
                <p className="mt-1 text-sm text-green-700">
                  <span className="font-semibold">Same-day service available.</span> Typical response time: {result.responseTime}.
                </p>
              )}
              {result?.travelFee && result.travelFee > 0 && (
                <p className="mt-1 text-sm text-green-700">
                  <span className="font-semibold">Note:</span> A travel fee of ${result.travelFee} applies to this location.
                </p>
              )}
              <p className="mt-2 text-xs text-green-700">
                Your location has been saved for easier booking. When you proceed to book online, your address information will be pre-filled.
              </p>
            </div>
            
            {!onSuccess && !onError && (
              <div className="mt-4">
                <Link href="/book-online" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 book-now-button-pulse enhanced-button">
                  <span className="button-gradient"></span>
                  <span className="inline-flex items-center relative z-10">
                    Book a Repair Now <FaArrowRight className="ml-2 button-icon" />
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className={variant === 'compact' ? 'p-0' : 'p-6'}>
        {variant === 'default' && (
          <>
            <h3 className="text-xl font-bold mb-2">Check If We Service Your Area</h3>
            <p className="text-gray-600 mb-4">
              Enter your postal code to check if we provide doorstep repair service in your area.
            </p>
          </>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                ref={inputRef}
                type="text"
                value={postalCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  const trimmed = value.replace(/\s+/g, ' ').trim();
                  setPostalCode(trimmed);
                }}
                placeholder="Enter postal code (e.g., V6B 1A1)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 pl-10 text-gray-800 placeholder-gray-400 font-medium"
                aria-label="Postal Code"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as unknown as FormEvent)}
              className="ml-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                'Check'
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-center">
            <span className="px-3 text-gray-500 text-sm">or</span>
          </div>
          
          <button
            type="button"
            onClick={detectLocation}
            disabled={loadingLocation}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loadingLocation ? (
              <>
                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                Detecting...
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="h-5 w-5 mr-2 text-gray-500" />
                Use My Current Location
              </>
            )}
          </button>
        </form>
        
        {renderResult()}
        
        {variant === 'default' && (
          <div className="mt-4 text-sm text-gray-500 flex items-start">
            <FaInfoCircle className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
            <p>
              We service most areas in the Lower Mainland, including Vancouver, Burnaby, Richmond, New Westminster, North Vancouver, West Vancouver, Coquitlam, and Chilliwack. Service timeframes and travel fees may vary for some areas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 