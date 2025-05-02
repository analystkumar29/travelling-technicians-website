import React, { createContext, useContext, useState } from 'react';

// Strong typing for booking data
export interface BookingData {
  reference_number: string;
  device_type: string;
  device_brand?: string;
  device_model?: string;
  service_type: string;
  booking_date?: string;
  booking_time?: string;
  appointment_date?: string;
  appointment_time?: string;
  address: string;
  postal_code?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  issue_description?: string;
  status?: string;
}

interface BookingContextType {
  bookingData: BookingData | null;
  setBookingData: (data: BookingData) => void;
  clearBookingData: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage if available
  const [bookingData, setBookingDataState] = useState<BookingData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('booking_data');
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error('Error reading booking data from localStorage:', error);
        return null;
      }
    }
    return null;
  });

  const setBookingData = (data: BookingData) => {
    setBookingDataState(data);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('booking_data', JSON.stringify(data));
      } catch (error) {
        console.error('Error saving booking data to localStorage:', error);
      }
    }
  };

  const clearBookingData = () => {
    setBookingDataState(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('booking_data');
      } catch (error) {
        console.error('Error removing booking data from localStorage:', error);
      }
    }
  };

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData, clearBookingData }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
} 