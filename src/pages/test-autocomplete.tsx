import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { checkServiceArea } from '@/utils/locationUtils';

export default function TestAutocompletePage() {
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [serviceAreaResult, setServiceAreaResult] = useState<any>(null);
  
  const handleAddressSelect = (selectedAddress: string, selectedPostalCode: string) => {
    setAddress(selectedAddress);
    setPostalCode(selectedPostalCode);
    
    if (selectedPostalCode) {
      const result = checkServiceArea(selectedPostalCode);
      setServiceAreaResult(result);
      console.log('Service area check result:', result);
    }
  };
  
  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Address Autocomplete Test</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Address
              </label>
              
              <AddressAutocomplete 
                onAddressSelect={handleAddressSelect}
                placeholder="Enter your address (e.g., 123 Main St, Vancouver)"
              />
            </div>
            
            {address && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Results:</h3>
                <p><strong>Address:</strong> {address}</p>
                <p><strong>Postal Code:</strong> {postalCode || 'Not detected'}</p>
                
                {serviceAreaResult ? (
                  <div className="mt-2">
                    <p>
                      <strong>In Service Area:</strong> 
                      <span className={serviceAreaResult.serviceable ? 'text-green-600' : 'text-red-600'}>
                        {serviceAreaResult.serviceable ? ' Yes' : ' No'}
                      </span>
                    </p>
                    {serviceAreaResult.serviceable && (
                      <>
                        <p><strong>Area:</strong> {serviceAreaResult.city}</p>
                        <p><strong>Response Time:</strong> {serviceAreaResult.responseTime}</p>
                        {serviceAreaResult.travelFee && (
                          <p><strong>Travel Fee:</strong> ${serviceAreaResult.travelFee}</p>
                        )}
                      </>
                    )}
                  </div>
                ) : postalCode ? (
                  <p className="text-red-600">This area is not serviced</p>
                ) : null}
              </div>
            )}
            
            <div className="mt-6 text-sm text-gray-600">
              <p className="font-medium mb-1">Debug Info:</p>
              <ul className="list-disc pl-5">
                <li>Try typing "Vancouver" to see suggestions</li>
                <li>Try typing a full address like "123 Main St, Vancouver"</li>
                <li>Click "Use My Current Location" to detect your address</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 