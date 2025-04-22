import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { checkServiceArea } from '@/utils/locationUtils';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, postalCode: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({
  onAddressSelect,
  placeholder = 'Enter your address',
  className = ''
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const callbackName = useRef(`jsonp_callback_${Date.now()}_${Math.round(Math.random() * 100000)}`);
  const [extractedPostalCode, setExtractedPostalCode] = useState('');
  const [userEnteredAddress, setUserEnteredAddress] = useState('');

  // Debouncing search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.length > 3) {
        // Save what the user has typed before fetching suggestions
        setUserEnteredAddress(inputValue);
        
        fetchSuggestions();
        // Try to extract postal code from the input
        const postalCodeRegex = /[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/i;
        const match = inputValue.match(postalCodeRegex);
        if (match) {
          const code = match[0].toUpperCase().replace(/\s/g, '');
          const formattedPostalCode = `${code.slice(0, 3)} ${code.slice(3)}`;
          setExtractedPostalCode(formattedPostalCode);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  // Setup JSONP callback
  useEffect(() => {
    // Create a global callback function
    (window as any)[callbackName.current] = (data: any) => {
      console.log("JSONP Suggestions received:", data);
      setSuggestions(data || []);
      setShowSuggestions(data && data.length > 0);
      setLoading(false);
      
      // Clean up the script tag
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
    
    return () => {
      // Clean up the callback
      delete (window as any)[callbackName.current];
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

  const fetchSuggestions = () => {
    if (!inputValue.trim()) return;
    
    setLoading(true);
    setError('');
    
    // Remove any existing script tag
    if (scriptRef.current && scriptRef.current.parentNode) {
      scriptRef.current.parentNode.removeChild(scriptRef.current);
    }
    
    // Create a new script tag for JSONP
    const script = document.createElement('script');
    script.src = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)} British Columbia, Canada&countrycodes=ca&limit=5&addressdetails=1&json_callback=${callbackName.current}`;
    document.body.appendChild(script);
    scriptRef.current = script;
    
    // Set a timeout in case the JSONP request fails
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Request timed out. Please try again.');
        if (scriptRef.current && scriptRef.current.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current);
          scriptRef.current = null;
        }
      }
    }, 5000);
  };

  const handleSuggestionClick = (suggestion: any) => {
    // Extract user-entered street number if available
    const streetNumberMatch = userEnteredAddress.match(/^\s*(\d+)\s+/);
    const userEnteredStreetNumber = streetNumberMatch ? streetNumberMatch[1] : '';
    
    // Get address components
    let street = suggestion.address?.road || suggestion.address?.street || '';
    let city = suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '';
    let postalCode = suggestion.address?.postcode || '';
    
    if (postalCode.length === 6 && !postalCode.includes(' ')) {
      postalCode = `${postalCode.slice(0, 3)} ${postalCode.slice(3)}`;
    }
    
    // Check if the suggestion already includes a number at the beginning
    const suggestionHasNumber = suggestion.display_name.match(/^\s*\d+\s+/) !== null;
    
    // Create a combined address
    let combinedAddress = '';
    
    // Only prepend the user's number if suggestion doesn't have one and the user entered one
    if (userEnteredStreetNumber && !suggestionHasNumber && street) {
      combinedAddress = `${userEnteredStreetNumber} ${street}, ${city}, BC ${postalCode}, Canada`;
    } else {
      combinedAddress = suggestion.display_name;
    }
    
    setInputValue(combinedAddress);
    setShowSuggestions(false);
    setExtractedPostalCode(postalCode);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setError('');
    
    // Use a direct approach that works better with Next.js static export
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Got coordinates:", latitude, longitude);
        
        // Create a simple fetch in a separate function to avoid CORS issues
        fetchAddressFromCoordinates(latitude, longitude);
      },
      (err) => {
        setLocationLoading(false);
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
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  const fetchAddressFromCoordinates = (latitude: number, longitude: number) => {
    // Create a fallback using direct nominatim URL that doesn't need CORS
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    
    // Use a simpler approach with direct browser fetch
    fetch(geocodeUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TheTravellingTechnicians/1.0'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to get address from coordinates');
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
        }
      } else {
        throw new Error('No address found for this location');
      }
    })
    .catch(err => {
      console.error('Error fetching address:', err);
      setError('Failed to get your location. Please enter your address manually.');
    })
    .finally(() => {
      setLocationLoading(false);
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateManualInput();
    }
  };
  
  const validateManualInput = () => {
    if (!inputValue) return;
    
    // First, check if we already have an extracted postal code
    if (extractedPostalCode) {
      validateAndSelectAddress(inputValue, extractedPostalCode);
      return;
    }
    
    // If not, try to extract postal code using regex
    const postalCodeRegex = /[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/i;
    const match = inputValue.match(postalCodeRegex);
    
    if (match) {
      const code = match[0].toUpperCase().replace(/\s/g, '');
      const formattedPostalCode = `${code.slice(0, 3)} ${code.slice(3)}`;
      validateAndSelectAddress(inputValue, formattedPostalCode);
    } else {
      setError('Please enter a valid Canadian postal code in your address (e.g., V6B 1A1)');
    }
  };
  
  const validateAndSelectAddress = (address: string, postalCode: string) => {
    // Check if it's in our service area
    const result = checkServiceArea(postalCode);
    console.log("Checking postal code:", postalCode, "Result:", result);
    
    if (result && result.serviceable) {
      onAddressSelect(address, postalCode);
      setError('');
    } else {
      setError(`We don't currently service the area with postal code ${postalCode}`);
    }
  };

  return (
    <form 
      className="relative w-full" 
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        validateManualInput();
      }}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // On blur, if there's a postal code, try to validate it
            setTimeout(() => {
              const postalCodeRegex = /[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/i;
              const match = inputValue.match(postalCodeRegex);
              if (match) {
                const code = match[0].toUpperCase().replace(/\s/g, '');
                const formattedPostalCode = `${code.slice(0, 3)} ${code.slice(3)}`;
                setExtractedPostalCode(formattedPostalCode);
              }
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 pl-10 text-gray-800 placeholder-gray-400 ${className}`}
          disabled={locationLoading} // Only disable when getting location, NOT when loading suggestions
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <FaSpinner className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={locationLoading}
        className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {locationLoading ? (
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
    </form>
  );
} 