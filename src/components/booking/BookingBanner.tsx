import React from 'react';
import { FaTools, FaClock, FaCalendarCheck } from 'react-icons/fa';

export const BookingBanner: React.FC = () => {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8">
      <h2 className="text-center text-indigo-800 font-bold text-lg mb-4">
        The Travelling Technicians - Doorstep Repair Service
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center p-3">
          <div className="bg-indigo-100 rounded-full p-3 mb-2">
            <FaTools className="h-6 w-6 text-indigo-700" />
          </div>
          <h3 className="font-medium text-indigo-800 mb-1">Expert Technicians</h3>
          <p className="text-sm text-gray-600">Certified professionals with years of experience</p>
        </div>
        
        <div className="flex flex-col items-center p-3">
          <div className="bg-indigo-100 rounded-full p-3 mb-2">
            <FaClock className="h-6 w-6 text-indigo-700" />
          </div>
          <h3 className="font-medium text-indigo-800 mb-1">Same-Day Service</h3>
          <p className="text-sm text-gray-600">Available for most repairs in Lower Mainland</p>
        </div>
        
        <div className="flex flex-col items-center p-3">
          <div className="bg-indigo-100 rounded-full p-3 mb-2">
            <FaCalendarCheck className="h-6 w-6 text-indigo-700" />
          </div>
          <h3 className="font-medium text-indigo-800 mb-1">Up to 6-Month Warranty</h3>
          <p className="text-sm text-gray-600">Quality parts with warranty protection</p>
        </div>
      </div>
      
      <div className="mt-3 text-center text-indigo-700 font-medium">
        We come to you - no need to visit a repair shop!
      </div>
    </div>
  );
};

export default BookingBanner; 