import { BusinessHours } from '../types';

/**
 * Formats a 24-hour time string to 12-hour format with AM/PM
 * @param time24 Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format with AM/PM (e.g., "2:30 PM")
 */
export const formatTime12Hour = (time24: string): string => {
  if (!time24 || !time24.includes(':')) {
    return time24 || '';
  }

  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) {
    return time24;
  }

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour; // Convert 0 to 12 for midnight

  // Format minute with leading zero if needed
  const minuteFormatted = minute.toString().padStart(2, '0');

  return `${hour}:${minuteFormatted} ${ampm}`;
};

/**
 * Determines the current operating status of a business based on its hours
 * @param hours The business hours object
 * @returns An object with status text and color
 */
export const getOperatingStatus = (hours: BusinessHours | undefined | null): { 
  status: string; 
  color: 'success' | 'error' | 'default' 
} => {
  if (!hours) {
    return { status: 'Hours not specified', color: 'default' };
  }

  // Get current day and time
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Map day names to property names in the hours object
  const dayMap: { [key: string]: keyof BusinessHours } = {
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday'
  };

  // Get today's hours
  const todayKey = dayMap[currentDay];
  const todayHours = hours[todayKey];

  if (!todayHours) {
    return { status: 'Hours not specified', color: 'default' };
  }

  if (todayHours.closed) {
    return { status: 'Closed Today', color: 'error' };
  }

  if (!todayHours.open || !todayHours.close) {
    return { status: 'Hours not specified', color: 'default' };
  }

  // Parse opening and closing times
  const openTimeParts = todayHours.open.split(':');
  const closeTimeParts = todayHours.close.split(':');

  if (openTimeParts.length !== 2 || closeTimeParts.length !== 2) {
    return { status: 'Invalid hours format', color: 'default' };
  }

  const openHour = parseInt(openTimeParts[0]);
  const openMinute = parseInt(openTimeParts[1]);
  const closeHour = parseInt(closeTimeParts[0]);
  const closeMinute = parseInt(closeTimeParts[1]);

  // Check if currently open
  const isOpen = (
    (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
    (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute))
  );

  if (isOpen) {
    return { status: 'Open Now', color: 'success' };
  } else {
    return { status: 'Closed Now', color: 'error' };
  }
};
