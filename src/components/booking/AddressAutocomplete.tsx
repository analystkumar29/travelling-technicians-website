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
  // Just pass through to the global implementation
  return (
    <GlobalAddressAutocomplete
      initialValue={value}
      placeholder="Enter your service address with postal code"
      className={className}
      disabled={false}
      required={false}
      onAddressSelect={(address, postalCode, inServiceArea) => {
        // For backward compatibility with the booking form
        const isValid = inServiceArea && Boolean(postalCode && postalCode.trim() !== '');
        
        // Ensure address and postal code are properly formatted
        const formattedAddress = address ? address.trim() : '';
        const formattedPostalCode = postalCode ? postalCode.trim() : '';
        
        // Always call onAddressSelect with the best information we have
        onAddressSelect(formattedAddress, isValid, formattedPostalCode);
      }}
      onError={(errorMsg) => {
        console.log("Address error:", errorMsg);
        // Error handling is done through the isValid parameter in onAddressSelect
      }}
    />
  );
} 