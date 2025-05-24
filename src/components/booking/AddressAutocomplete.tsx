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
    console.error("Google Maps API Key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.");
    // Optionally, render a fallback or an error message to the user
    return <div className="text-red-500 p-4 border border-red-500 rounded-md">Address lookup service is unavailable. API key missing.</div>;
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