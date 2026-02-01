/**
 * Utility functions for generating and formatting booking time slots
 * based on configuration stored in site_settings table
 */

export interface TimeSlot {
  value: string;      // e.g., "8:00", "10:00"
  label: string;      // e.g., "8:00 AM - 10:00 AM"
  startHour: number;  // 8, 10, 12, etc.
  endHour: number;    // 10, 12, 14, etc.
}

/**
 * Fetches time slot configuration from site_settings
 * Returns weekday and weekend slots in 24h format
 */
export async function fetchTimeSlotConfig(): Promise<{
  weekdaySlots: string[];
  weekendSlots: string[];
  slotDuration: number;
}> {
  try {
    // Default configuration if API fails
    const defaultConfig = {
      weekdaySlots: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      weekendSlots: ['9:00', '11:00', '13:00', '15:00', '17:00'],
      slotDuration: 120 // 2 hours in minutes
    };

    // Try to fetch from API
    const response = await fetch('/api/site-settings/time-slots');
    
    if (response.ok) {
      const data = await response.json();
      return {
        weekdaySlots: data.weekdaySlots || defaultConfig.weekdaySlots,
        weekendSlots: data.weekendSlots || defaultConfig.weekendSlots,
        slotDuration: data.slotDuration || defaultConfig.slotDuration
      };
    }
    
    return defaultConfig;
  } catch (error) {
    console.error('Error fetching time slot config:', error);
    // Return default configuration
    return {
      weekdaySlots: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      weekendSlots: ['9:00', '11:00', '13:00', '15:00', '17:00'],
      slotDuration: 120
    };
  }
}

/**
 * Generates time slots for a specific date
 * @param date The date to generate slots for (can be Date object or date string)
 * @param weekdaySlots Array of start times for weekdays (24h format)
 * @param weekendSlots Array of start times for weekends (24h format)
 * @param slotDuration Duration of each slot in minutes
 */
export function generateTimeSlotsForDate(
  date: Date | string,
  weekdaySlots: string[],
  weekendSlots: string[],
  slotDuration: number = 120
): TimeSlot[] {
  // Parse date correctly - handle both Date objects and date strings
  // Always extract the date components safely to avoid timezone issues
  let year: number, month: number, day: number;
  
  if (typeof date === 'string') {
    // Parse date string (YYYY-MM-DD format)
    [year, month, day] = date.split('-').map(Number);
  } else {
    // For Date objects, use UTC methods to get the correct date
    // This handles the case where date is in UTC midnight (e.g., from date picker)
    year = date.getUTCFullYear();
    month = date.getUTCMonth() + 1; // getUTCMonth() returns 0-11
    day = date.getUTCDate();
  }
  
  // Create date in local timezone at noon to avoid day boundary issues
  const localDate = new Date(year, month - 1, day, 12, 0, 0);
  
  const dayOfWeek = localDate.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const startTimes = isWeekend ? weekendSlots : weekdaySlots;
  
  return startTimes.map(startTime => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startHour = hours;
    const endHour = startHour + (slotDuration / 60);
    
    // Format for display
    const startLabel = formatTimeForDisplay(startHour, minutes);
    const endLabel = formatTimeForDisplay(endHour, minutes);
    
    return {
      value: startTime, // e.g., "8:00"
      label: `${startLabel} - ${endLabel}`, // e.g., "8:00 AM - 10:00 AM"
      startHour,
      endHour
    };
  });
}

/**
 * Formats time for display (24h to 12h AM/PM)
 */
function formatTimeForDisplay(hours: number, minutes: number = 0): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Parses a time slot value into a Date object
 * @param dateString The date string (YYYY-MM-DD)
 * @param timeSlot The time slot value (e.g., "8:00")
 */
export function parseTimeSlotToDate(dateString: string, timeSlot: string): Date {
  // Parse date in local timezone (not UTC)
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Month is 0-indexed
  
  const [hours, minutes] = timeSlot.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Calculates end time for a time slot
 * @param startDate The start date/time
 * @param slotDuration Duration in minutes
 */
export function calculateEndTime(startDate: Date, slotDuration: number = 120): Date {
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + slotDuration);
  return endDate;
}

/**
 * Gets time slots for a specific date (convenience function)
 */
export async function getTimeSlotsForDate(date: Date): Promise<TimeSlot[]> {
  const config = await fetchTimeSlotConfig();
  return generateTimeSlotsForDate(
    date,
    config.weekdaySlots,
    config.weekendSlots,
    config.slotDuration
  );
}

/**
 * Validates if a time slot is available for booking
 * (Placeholder for future availability checking)
 */
export function isTimeSlotAvailable(date: Date, timeSlot: string): boolean {
  // For now, all slots are available
  // In the future, this could check against booked appointments
  return true;
}

/**
 * Gets the next available date (skipping today if it's too late)
 */
export function getNextAvailableDate(): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if it's past cutoff time for same-day bookings
  const cutoffHour = 15; // 3 PM
  if (today.getHours() >= cutoffHour) {
    // Too late for same-day booking, start from tomorrow
    return tomorrow.toISOString().split('T')[0];
  }
  
  return today.toISOString().split('T')[0];
}

/**
 * Gets the maximum booking date (e.g., 60 days from now)
 */
export function getMaxBookingDate(daysFromNow: number = 60): string {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + daysFromNow);
  return maxDate.toISOString().split('T')[0];
}