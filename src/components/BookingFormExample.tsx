import React, { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import { checkServiceArea } from '../utils/locationUtils';

export default function BookingFormExample() {
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [serviceAreaResult, setServiceAreaResult] = useState<any>(null);
  const [serviceAreaError, setServiceAreaError] = useState('');

  const handleAddressSelect = (selectedAddress: string, selectedPostalCode: string) => {
    setAddress(selectedAddress);
    setPostalCode(selectedPostalCode);
    
    // Check if the postal code is in our service area
    if (selectedPostalCode) {
      try {
        const result = checkServiceArea(selectedPostalCode);
        setServiceAreaResult(result);
        setServiceAreaError('');
        
        if (!result || !result.serviceable) {
          setServiceAreaError('Sorry, we do not currently service this area.');
        }
      } catch (error) {
        console.error('Error checking service area:', error);
        setServiceAreaError('Could not verify service area. Please continue with booking.');
      }
    } else {
      setServiceAreaResult(null);
      setServiceAreaError('Could not detect postal code. Please enter it manually to check service availability.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Schedule Repair Service</h2>
      
      <div className="mb-6">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Service Address
        </label>
        <AddressAutocomplete
          onAddressSelect={handleAddressSelect}
          placeholder="Enter your address for doorstep service"
        />
        
        {address && (
          <div className="mt-2 text-sm text-gray-600">
            <p><strong>Selected Address:</strong> {address}</p>
            {postalCode && <p><strong>Postal Code:</strong> {postalCode}</p>}
          </div>
        )}
        
        {serviceAreaResult && serviceAreaResult.serviceable && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 font-medium">
              Great news! We service your area.
            </p>
            <p className="text-green-600 text-sm mt-1">
              Typical response time: {serviceAreaResult.responseTime}
            </p>
            {serviceAreaResult.travelFee > 0 && (
              <p className="text-amber-600 text-sm mt-1">
                Note: A travel fee of ${serviceAreaResult.travelFee} applies to your location.
              </p>
            )}
          </div>
        )}
        
        {serviceAreaError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{serviceAreaError}</p>
          </div>
        )}
      </div>
      
      {/* Example of additional form fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
            Service Type
          </label>
          <select
            id="service"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a service</option>
            <option value="screen-replacement">Screen Replacement</option>
            <option value="battery-replacement">Battery Replacement</option>
            <option value="charging-port">Charging Port Repair</option>
            <option value="water-damage">Water Damage Assessment</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Date
          </label>
          <input
            type="date"
            id="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <button
          type="button"
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
} 