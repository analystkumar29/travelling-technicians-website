import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { checkServiceArea } from '@/utils/locationUtils';


// Function to extract postal code from an address string
function extractPostalCode(address: string): string {
  if (!address) return '';
  
  // Canadian postal code regex pattern
  const postalCodeRegex = /[A-Za-z]\d[A-Za-z](\s+)?\d[A-Za-z]\d/i;
  const match = address.match(postalCodeRegex);
  
  if (match) {
    const code = match[0].toUpperCase().replace(/\s/g, '');
    // Format with space in the middle
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  
  return '';
}

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (address: string, postalCode: string, inServiceArea: boolean) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  apiKey: string;
}

export default function AddressAutocomplete({
  onAddressSelect,
  placeholder = 'Enter your address',
  className = '',
  label,
  initialValue,
  onChange,
  onError,
  disabled = false,
  required = false,
  apiKey
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialValue || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const callbackName = useRef(`jsonp_callback_${Date.now()}_${Math.round(Math.random() * 100000)}`);
  const stableCallbackRef = useRef<Function | null>(null);
  const [extractedPostalCode, setExtractedPostalCode] = useState('');
  const [userEnteredAddress, setUserEnteredAddress] = useState('');
  const [userEnteredStreetNumber, setUserEnteredStreetNumber] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const placesServiceRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const debouncedFetchSuggestions = useRef<((input: string) => void) | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);


  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Always use OpenStreetMap Nominatim API for address suggestions
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5&countrycodes=ca`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TheTravellingTechnicians/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`OpenStreetMap API error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data && Array.isArray(data)) {
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setActiveSuggestionIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to extract street number from input
  useEffect(() => {
    const streetNumberMatch = inputValue.match(/^\d+/);
    if (streetNumberMatch) {
      setUserEnteredStreetNumber(streetNumberMatch[0]);
    } else {
      setUserEnteredStreetNumber('');
    }
  }, [inputValue]);

  // Debouncing search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.length > 3) {
        setUserEnteredAddress(inputValue);
        fetchSuggestions(inputValue);
        const extractedCode = extractPostalCode(inputValue);
        if (extractedCode) {
          setExtractedPostalCode(extractedCode);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, fetchSuggestions]);

  // Setup JSONP callback with improved error handling
  useEffect(() => {
    const currentCallbackName = callbackName.current;

    // Clean up any existing callbacks first
    if (typeof window !== 'undefined' && currentCallbackName) {
      delete (window as any)[currentCallbackName];
    }
    
    // Create a stable function reference
    stableCallbackRef.current = (data: any) => {
      // Safely handle the data
      try {
        setSuggestions(data || []);
        setShowSuggestions(data && data.length > 0);
      } catch (err) {
        console.error("Error processing JSONP data:", err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
        
        // Clean up the script tag
        try {
          if (scriptRef.current && scriptRef.current.parentNode) {
            scriptRef.current.parentNode.removeChild(scriptRef.current);
            scriptRef.current = null;
          }
        } catch (err) {
          console.error("Error cleaning up script tag:", err);
        }
      }
    };
    
    // Assign the callback globally
    (window as any)[currentCallbackName] = (...args: any[]) => {
      try {
        if (stableCallbackRef.current) {
          stableCallbackRef.current(...args);
        }
      } catch (err) {
        console.error("Error in JSONP callback:", err);
        setLoading(false);
      }
    };
    
    return () => {
      // Clean up the callback on unmount using the local variable
      try {
        delete (window as any)[currentCallbackName];
        
        // Clean up any lingering script tags
        const scripts = document.querySelectorAll('script[src*="json_callback"]');
        scripts.forEach((script) => {
          script.parentNode?.removeChild(script);
        });
      } catch (e) {
        console.error('Error cleaning up JSONP resources:', e);
      }
    };
  }, []);

  // Click outside handler to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== initialValue) { // Avoid fetching on initial mount if value is pre-filled
        fetchSuggestions(inputValue);
      }
    }, 500); // Debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, fetchSuggestions, initialValue]); // Added fetchSuggestions, initialValue

  // Set scriptLoaded to true immediately since we're only using OpenStreetMap
  useEffect(() => {
    setScriptLoaded(true);
  }, []);

  // Setup debounced fetch function for OpenStreetMap suggestions
  useEffect(() => {
    const DEBOUNCE_DELAY = 300;
    let timeoutId: NodeJS.Timeout;
    
    debouncedFetchSuggestions.current = (input: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchSuggestions(input);
      }, DEBOUNCE_DELAY);
    };
    
    // Initial fetch if inputValue exists and is not the same as initialValue
    if (inputValue && inputValue !== initialValue) {
      debouncedFetchSuggestions.current(inputValue);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputValue, fetchSuggestions, initialValue]);

  const handleSuggestionClick = (e: any) => {
    try {
      // Handle case when e doesn't have an address property
      if (!e || typeof e !== 'object') {
        return;
      }
      
      // For Nominatim format suggestions (OpenStreetMap)
      if (e.display_name) {
        const displayName = e.display_name;
        let postalCode = '';
        
        if (e.address && typeof e.address === 'object' && e.address.postcode) {
          postalCode = e.address.postcode;
        } else {
          // Try to extract postal code from display_name using regex for Canadian postal codes
          const postalCodeMatch = displayName.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/i);
          if (postalCodeMatch) {
            postalCode = postalCodeMatch[0];
          }
        }
        
        // Set the input value
        setInputValue(displayName);
        
        // Close suggestions
        setSuggestions([]);
        setShowSuggestions(false);
        
        // Call the onAddressSelect callback
        if (onAddressSelect && displayName) {
          const result = checkServiceArea(postalCode);
          const isValid = !!(result && result.serviceable);
          onAddressSelect(displayName, postalCode, isValid);
        }
        return;
      }
      
      // For other formats that might have address as a string
      if (e.address && typeof e.address === 'string') {
        const addressParts = e.address.split(',');
        const streetNumber = userEnteredStreetNumber || '';
        const street = addressParts[0] || '';
        const combinedAddress = streetNumber ? `${streetNumber}, ${street}` : street;
        const restOfAddress = addressParts.slice(1).join(',');
        const addressStr = `${combinedAddress},${restOfAddress}`;
        const postalCode = e.postalCode || '';
        
        // Set the input value
        setInputValue(addressStr);
        
        // Close suggestions
        setSuggestions([]);
        setShowSuggestions(false);
        
        // Call the onAddressSelect callback
        if (onAddressSelect && addressStr) {
          const result = checkServiceArea(postalCode);
          const isValid = !!(result && result.serviceable);
          onAddressSelect(addressStr, postalCode, isValid);
        }
        return;
      }
      
      // Fallback for other formats
      const addressStr = e.name || e.formatted_address || e.description || JSON.stringify(e);
      const postalCode = e.postal_code || e.postalCode || '';
      
      // Set the input value
      setInputValue(addressStr);
      
      // Close suggestions
      setSuggestions([]);
      setShowSuggestions(false);
      
      // Call the onAddressSelect callback
      if (onAddressSelect && addressStr) {
        const result = checkServiceArea(postalCode);
        const isValid = !!(result && result.serviceable);
        onAddressSelect(addressStr, postalCode, isValid);
      }
    } catch (error) {
      console.error('Error processing address selection:', error);
      setError('Error processing selected address. Please try another or enter manually.');
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setError('');
    setInputValue('Detecting your location...');
    
    // Use a direct approach that works better with Next.js static export
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Use the Nominatim reverse geocoding service
        fetchAddressFromCoordinates(latitude, longitude);
      },
      (err) => {
        setLocationLoading(false);
        setInputValue('');
        console.error("Geolocation error:", err);
        
        let errorMessage = 'Failed to get your location. Please enter your address manually.';
        if (err.code === 1) {
          errorMessage = 'Location access denied. Please grant permission or enter your address manually.';
        } else if (err.code === 2) {
          errorMessage = 'Location unavailable. Please enter your address manually.';
        } else if (err.code === 3) {
          errorMessage = 'Location request timed out. Please enter your address manually.';
        }
        
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,  // Increased timeout for more reliable results
        maximumAge: 0
      }
    );
  };
  
  const fetchAddressFromCoordinates = (latitude: number, longitude: number) => {
    try {
      // Create a fallback using direct nominatim URL that doesn't need CORS
      const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`;
      
      // Use a simpler approach with direct browser fetch
      fetch(geocodeUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TheTravellingTechnicians/1.0'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to get address from coordinates: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.display_name) {
          setInputValue(data.display_name);
          
          // Extract postal code if available
          let postalCode = '';
          if (data.address && data.address.postcode) {
            postalCode = data.address.postcode.trim();
            // Format postal code if necessary
            if (postalCode.length === 6 && !postalCode.includes(' ')) {
              postalCode = `${postalCode.slice(0, 3)} ${postalCode.slice(3)}`;
            }
            setExtractedPostalCode(postalCode);
            
            // If we have a valid postal code, call onAddressSelect
            if (postalCode) {
              if (onAddressSelect) {
                const serviceAreaResult = checkServiceArea(postalCode);
                const isServiceable = serviceAreaResult?.serviceable || false;
                onAddressSelect(data.display_name, postalCode, isServiceable);
              }
              setError('');
            } else {
              setError('Could not determine postal code from your location. Please enter it manually.');
            }
          } else {
            setError('Your location was found, but no postal code was detected. Please add it manually.');
          }
        } else {
          setInputValue('');
          throw new Error('No address found for this location');
        }
      })
      .catch(err => {
        console.error('Error fetching address:', err);
        setInputValue('');
        setError('Failed to get your location. Please enter your address manually.');
      })
      .finally(() => {
        setLocationLoading(false);
      });
    } catch (error) {
      console.error("Error in fetchAddressFromCoordinates:", error);
      setLocationLoading(false);
      setInputValue('');
      setError('Error processing your location. Please enter your address manually.');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateManualInput();
    }
  };
  
  const validateManualInput = () => {
    if (!inputValue.trim()) {
      return;
    }

    // Try to extract a postal code from the input
    const extractedCode = extractPostalCode(inputValue);
    
    if (extractedCode) {
      validateAndSelectAddress(inputValue, extractedCode);
    } else {
      // Instead of stopping here with an error, we'll still allow the user to proceed
      // and ask them to enter a postal code separately in the next step
      setError('No postal code detected in your address. You will need to enter it in the next step.');
      
      // Even without a postal code, we should call onAddressSelect to allow the user to proceed
      // We'll pass a special flag (false for inServiceArea) to indicate postal code validation is needed
      if (onAddressSelect) {
        // Use the address as entered, mark as not validated yet (third parameter false)
        onAddressSelect(inputValue, '', false);
      }
      
      // Inform parent about the error but don't block progress
      if (onError) {
        onError('No postal code detected. You will need to provide it separately.');
      }
    }
  };
  
  const validateAndSelectAddress = (address: string, postalCode: string) => {
    if (!postalCode || postalCode.trim().length < 6) {
      // Instead of stopping with an error, allow proceeding with a warning
      setError('Invalid postal code format. You will need to enter a valid postal code in the next step.');
      
      // Still call onAddressSelect to allow user to proceed
      if (onAddressSelect) {
        onAddressSelect(address, '', false);
      }
      
      if (onError) {
        onError('Invalid postal code format. Please enter a valid Canadian postal code in the next step.');
      }
      return;
    }
    
    // Format and clean the postal code
    const cleanPostalCode = postalCode.trim().toUpperCase().replace(/\s+/g, ' ');
    
    // Check if we're in service area
    const serviceAreaResult = checkServiceArea(cleanPostalCode);
    const inServiceArea = serviceAreaResult?.serviceable || false;
    
    if (!inServiceArea) {
      setError(`Unfortunately, we don't service ${cleanPostalCode} at this time.`);
      if (onError) {
        onError(`Unfortunately, we don't service ${cleanPostalCode} at this time.`);
      }
      
      // Still allow user to proceed with the address (they might enter a different postal code later)
      if (onAddressSelect) {
        onAddressSelect(address, cleanPostalCode, false);
      }
    } else {
      setError('');
      if (onError) onError('');

      if (onAddressSelect) {
        onAddressSelect(address, cleanPostalCode, inServiceArea);
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (onChange) {
              onChange(e.target.value);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // On blur, if there's a postal code, try to validate it
            setTimeout(() => {
              const extractedCode = extractPostalCode(inputValue);
              if (extractedCode) {
                setExtractedPostalCode(extractedCode);
              }
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 pl-10 text-gray-800 placeholder-gray-400 ${className}`}
          disabled={locationLoading || disabled} // Only disable when getting location, NOT when loading suggestions
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading || locationLoading ? (
            <FaSpinner className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={locationLoading || disabled}
        className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {locationLoading ? (
          <>
            <FaSpinner className="animate-spin h-5 w-5 mr-2" />
            Detecting your location...
          </>
        ) : (
          <>
            <FaMapMarkerAlt className="h-5 w-5 mr-2 text-gray-500" />
            Use My Current Location
          </>
        )}
      </button>
      
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.place_id || suggestion.osm_id}-${index}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Enter your street number first, then select a suggestion to combine them automatically.
      </div>
    </div>
  );
} 