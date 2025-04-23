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
      onAddressSelect={(address, postalCode) => {
        // For backward compatibility with the booking form
        const isValid = Boolean(postalCode && postalCode.trim() !== '');
        console.log("Address selected:", address, "Postal code:", postalCode, "Is valid:", isValid);
        onAddressSelect(address, isValid, postalCode);
      }}
      placeholder={value || "Enter your service address with postal code"}
      className={className}
    />
  );
} 