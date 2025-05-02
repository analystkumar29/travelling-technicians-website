/**
 * Utility functions and data structures for the booking system
 */

/**
 * Common service types available for each device type
 */
export const serviceTypes = {
  mobile: [
    { id: 'screen', name: 'Screen Replacement', price: '$99-249', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', price: '$69-129', doorstep: true },
    { id: 'charging', name: 'Charging Port Repair', price: '$79-149', doorstep: true },
    { id: 'camera', name: 'Camera Repair', price: '$89-149', doorstep: true },
    { id: 'speaker', name: 'Speaker/Mic Repair', price: '$69-119', doorstep: true },
    { id: 'water', name: 'Water Damage Repair', price: 'Varies', doorstep: false },
    { id: 'software', name: 'Software Issues', price: '$49-99', doorstep: true },
    { id: 'other', name: 'Other Issues', price: 'Custom Quote', doorstep: true },
  ],
  laptop: [
    { id: 'screen', name: 'Screen Replacement', price: '$149-399', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', price: '$99-199', doorstep: true },
    { id: 'keyboard', name: 'Keyboard Replacement', price: '$99-249', doorstep: true },
    { id: 'harddrive', name: 'HDD/SSD Upgrade', price: '$99-299', doorstep: true },
    { id: 'ram', name: 'RAM Upgrade', price: '$79-199', doorstep: true },
    { id: 'software', name: 'OS Installation', price: '$79-149', doorstep: true },
    { id: 'cooling', name: 'Cooling System Repair', price: '$99-199', doorstep: true },
    { id: 'other', name: 'Other Issues', price: 'Custom Quote', doorstep: true },
  ],
  tablet: [
    { id: 'screen', name: 'Screen Replacement', price: '$129-329', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', price: '$89-179', doorstep: true },
    { id: 'charging', name: 'Charging Port Repair', price: '$89-159', doorstep: true },
    { id: 'camera', name: 'Camera Repair', price: '$99-179', doorstep: true },
    { id: 'speaker', name: 'Speaker/Mic Repair', price: '$79-129', doorstep: true },
    { id: 'button', name: 'Button Repair', price: '$69-129', doorstep: true },
    { id: 'software', name: 'Software Issues', price: '$49-99', doorstep: true },
    { id: 'other', name: 'Other Issues', price: 'Custom Quote', doorstep: true },
  ]
};

/**
 * Available time slots for appointments
 */
export const availableTimes = [
  { id: '09-11', label: '9:00 AM - 11:00 AM' },
  { id: '11-13', label: '11:00 AM - 1:00 PM' },
  { id: '13-15', label: '1:00 PM - 3:00 PM' },
  { id: '15-17', label: '3:00 PM - 5:00 PM' },
  { id: '17-19', label: '5:00 PM - 7:00 PM' },
  { id: '19-21', label: '7:00 PM - 9:00 PM' },
];

/**
 * Generate available dates starting from tomorrow for the next 7 days
 */
export function getAvailableDates() {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const display = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    dates.push({ 
      value: dateString, 
      dayOfWeek,
      display
    });
  }
  
  return dates;
}

/**
 * Generate a random booking reference number
 */
export function generateBookingReference(): string {
  const prefix = 'TTR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Format price range from database format to display format
 */
export function formatPriceRange(price: string): string {
  if (!price) return 'Custom Quote';
  
  // Handle prices like "99-249"
  if (price.includes('-')) {
    const [min, max] = price.split('-');
    return `$${min} - $${max}`;
  }
  
  // Handle prices like "99"
  if (!isNaN(Number(price))) {
    return `$${price}`;
  }
  
  return price;
}

/**
 * Check if a date is available for booking
 * (For demo purposes, this always returns true)
 */
export function isDateAvailable(date: string): boolean {
  // In a real app, this would check against the database
  return true;
}

/**
 * Check if a time slot is available for a specific date and service
 * (For demo purposes, this always returns true)
 */
export function isTimeSlotAvailable(date: string, timeSlot: string, serviceType: string): boolean {
  // In a real app, this would check against the database
  return true;
} 