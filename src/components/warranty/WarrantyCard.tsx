import React from 'react';
import { WarrantySummary } from '@/types/warranty';
import { format } from 'date-fns';

interface WarrantyCardProps {
  warranty: WarrantySummary;
  onClaimClick: (code: string) => void;
}

const WarrantyCard: React.FC<WarrantyCardProps> = ({ warranty, onClaimClick }) => {
  // Format dates for display
  const serviceDate = format(new Date(warranty.service_date), 'MMM d, yyyy');
  const expiryDate = format(new Date(warranty.expiry_date), 'MMM d, yyyy');
  
  // Determine the status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'void':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-primary-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {warranty.device_brand} {warranty.device_model}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Warranty Code: <span className="font-mono">{warranty.warranty_code}</span>
        </p>
      </div>
      
      <div className="px-4 py-4 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Service Performed</dt>
            <dd className="mt-1 text-sm text-gray-900">{warranty.service_type}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Service Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{serviceDate}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Expires</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {expiryDate}
            </dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(warranty.status)}`}>
                {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
              </span>
            </dd>
          </div>
        </dl>
        
        <div className="mt-5 pt-5 border-t border-gray-200">
          <button
            onClick={() => onClaimClick(warranty.warranty_code)}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
            disabled={warranty.status !== 'active'}
          >
            File Warranty Claim
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarrantyCard; 