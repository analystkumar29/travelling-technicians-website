import React from 'react';
import GlobalAddressAutocomplete from '../AddressAutocomplete';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, isValid: boolean, postalCode?: string) => void;
  value: string;
  error?: boolean;
  className?: string;
}

// This is a wrapper component to adapt our global AddressAutocomplete to the booking form
export default function AddressAutocomplete({ 
  onAddressSelect, 
  value, 
  error = false,
  className = ''
}: AddressAutocompleteProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    // Graceful fallback - render a simple input field when Google Maps API is not available
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onAddressSelect(e.target.value, true, '')}
        placeholder="Enter your service address with postal code"
        className={`${className} ${error ? 'border-red-500' : 'border-gray-300'} w-full p-3 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
      />
    );
  }

  return (
    <GlobalAddressAutocomplete
      apiKey={googleMapsApiKey}
      initialValue={value}
      placeholder="Enter your service address with postal code"
      className={className}
      disabled={false}
      required={false}
      onAddressSelect={(address, postalCode, inServiceArea) => {
        const isValid = inServiceArea && Boolean(postalCode && postalCode.trim() !== '');
        const formattedAddress = address ? address.trim() : '';
        const formattedPostalCode = postalCode ? postalCode.trim() : '';
        onAddressSelect(formattedAddress, isValid, formattedPostalCode);
      }}
      onError={(errorMsg) => {
        console.log("Address error:", errorMsg);
      }}
    />
  );
} 