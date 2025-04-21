import { useState, FormEvent, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaSearch, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { 
  checkServiceArea, 
  isValidPostalCodeFormat, 
  getCurrentLocationPostalCode, 
  ServiceAreaType 
} from '@/utils/locationUtils';

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
      const serviceArea = checkServiceArea(postalCode);
      setResult(serviceArea);
      
      if (!serviceArea) {
        const errMsg = "We don't currently service this area. Please contact us for special arrangements.";
        setError(errMsg);
        if (onError) onError(errMsg);
      } else {
        // Call onSuccess callback with the result and postal code
        if (onSuccess) onSuccess(serviceArea, postalCode);
      }
    } catch (err) {
      const errMsg = 'An error occurred while checking your postal code';
      setError(errMsg);
      setResult(null);
      if (onError) onError(errMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const detectLocation = async () => {
    setLoadingLocation(true);
    setError(null);
    
    try {
      const detectedPostalCode = await getCurrentLocationPostalCode();
      
      if (!detectedPostalCode) {
        const errMsg = 'Unable to detect your postal code. Please enter it manually.';
        setError(errMsg);
        if (onError) onError(errMsg);
        return;
      }
      
      setPostalCode(detectedPostalCode);
      
      // Auto-check the detected postal code
      const serviceArea = checkServiceArea(detectedPostalCode);
      setResult(serviceArea);
      setSearched(true);
      
      if (!serviceArea) {
        const errMsg = "We don't currently service this area. Please contact us for special arrangements.";
        setError(errMsg);
        if (onError) onError(errMsg);
      } else {
        // Call onSuccess callback with the result and postal code
        if (onSuccess) onSuccess(serviceArea, detectedPostalCode);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to detect your location';
      setError(errMsg);
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
              </div>
              {error.includes("don't currently service") && (
                <div className="mt-4">
                  {!onSuccess && !onError ? (
                    <a href="/contact" className="text-sm font-medium text-red-800 hover:text-red-900">
                      Contact us for special arrangements →
                    </a>
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
    
    if (result) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Good News!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>{result.city}</strong> is in our service area!
                  {postalCode && (
                    <span className="block text-xs mt-1">
                      Based on postal code: <span className="font-mono">{postalCode}</span>
                    </span>
                  )}
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>
                    {result.sameDay 
                      ? "Same-day service is available in your area!"
                      : "Same-day service is not available, but we can schedule a visit"}
                  </li>
                  <li>Typical response time: {result.responseTime}</li>
                  {result.travelFee ? (
                    <li>Travel fee: ${result.travelFee} (added to repair cost)</li>
                  ) : (
                    <li>No travel fee for your area</li>
                  )}
                </ul>
              </div>
              {!onSuccess && !onError && (
                <div className="mt-4 flex space-x-3">
                  <a 
                    href="/book-online" 
                    className="text-sm font-medium text-green-800 hover:text-green-900"
                  >
                    Book a repair now →
                  </a>
                  <a 
                    href="/services" 
                    className="text-sm font-medium text-green-800 hover:text-green-900"
                  >
                    View our services →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`${variant === 'compact' ? '' : 'bg-white rounded-lg shadow-lg'} ${className}`}>
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
                onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
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
              We service most areas in the Lower Mainland, including Vancouver, Burnaby, Richmond, Surrey, and more. 
              We also cover Squamish, Whistler, and other areas along Highway 99, plus Metro Vancouver and Fraser Valley 
              communities up to Chilliwack.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 