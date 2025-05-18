import React from 'react';
import { WarrantySummary } from '@/types/warranty';
import { format } from 'date-fns';

interface WarrantyCardProps {
  warranty: WarrantySummary;
  onClaimClick: (warrantyCode: string) => void;
}

const WarrantyCard: React.FC<WarrantyCardProps> = ({ warranty, onClaimClick }) => {
  // Format dates
  const issueDate = format(new Date(warranty.issue_date), 'MMM d, yyyy');
  const expiryDate = format(new Date(warranty.expiry_date), 'MMM d, yyyy');
  
  // Determine the status color
  const getStatusColor = (status: string, daysRemaining: number) => {
    if (status === 'expired' || status === 'void') return 'bg-gray-500';
    if (status === 'claimed') return 'bg-purple-500';
    if (daysRemaining < 15) return 'bg-red-500';
    if (daysRemaining < 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const statusColor = getStatusColor(warranty.status, warranty.days_remaining);
  
  // Determine if warranty can be claimed
  const isClaimable = warranty.status === 'active';
  
  return (
    <div className="border rounded-lg shadow-md p-5 bg-white">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">
          {warranty.device_brand} {warranty.device_model}
        </h3>
        <span className={`${statusColor} text-white text-xs px-2 py-1 rounded uppercase`}>
          {warranty.status}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Service:</span> {warranty.service_type}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Device:</span> {warranty.device_type}
        </p>
      </div>
      
      <div className="border-t border-gray-200 pt-3 mb-4">
        <p className="text-sm flex justify-between">
          <span className="text-gray-600">Warranty Code:</span>
          <span className="font-mono">{warranty.warranty_code}</span>
        </p>
        <p className="text-sm flex justify-between">
          <span className="text-gray-600">Issue Date:</span>
          <span>{issueDate}</span>
        </p>
        <p className="text-sm flex justify-between">
          <span className="text-gray-600">Expiry Date:</span>
          <span>{expiryDate}</span>
        </p>
        
        {warranty.status === 'active' && (
          <p className="text-sm flex justify-between mt-1">
            <span className="text-gray-600">Days Remaining:</span>
            <span className="font-semibold">
              {warranty.days_remaining}
            </span>
          </p>
        )}
      </div>
      
      <button
        onClick={() => onClaimClick(warranty.warranty_code)}
        className={`w-full py-2 rounded-md text-white transition-colors
          ${isClaimable 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-400 cursor-not-allowed'}`}
        disabled={!isClaimable}
      >
        {warranty.status === 'claimed' 
          ? 'View Claim' 
          : warranty.status === 'expired' || warranty.status === 'void' 
            ? 'Expired' 
            : 'Claim Warranty'}
      </button>
    </div>
  );
};

export default WarrantyCard; 