import { EventFormData } from '../../types/event';

/**
 * Format a date for display
 */
export const formatEventDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format a time for display
 */
export const formatEventTime = (time: string): string => {
  // Time is expected in HH:MM format
  if (!time || !time.includes(':')) return time;
  
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format date and time together
 */
export const formatEventDateTime = (date: Date | string, time?: string): string => {
  const formattedDate = formatEventDate(date);
  
  if (time) {
    const formattedTime = formatEventTime(time);
    return `${formattedDate} at ${formattedTime}`;
  }
  
  return formattedDate;
};

/**
 * Generate a URL-friendly slug from text
 */
export const generateEventSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Calculate event duration in minutes
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  // Handle events that go past midnight
  if (endTotalMinutes < startTotalMinutes) {
    return (24 * 60 - startTotalMinutes) + endTotalMinutes;
  }
  
  return endTotalMinutes - startTotalMinutes;
};

/**
 * Format duration for display
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minutes`;
  }
  
  if (mins === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  
  const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
  const minText = mins === 1 ? '1 minute' : `${mins} minutes`;
  
  return `${hourText} ${minText}`;
};

/**
 * Get recurring event description
 */
export const getRecurringDescription = (
  pattern: 'daily' | 'weekly' | 'monthly' | 'custom',
  customPattern?: string,
  endDate?: Date
): string => {
  let description = '';
  
  switch (pattern) {
    case 'daily':
      description = 'Repeats daily';
      break;
    case 'weekly':
      description = 'Repeats weekly';
      break;
    case 'monthly':
      description = 'Repeats monthly';
      break;
    case 'custom':
      description = customPattern || 'Custom schedule';
      break;
  }
  
  if (endDate) {
    description += ` until ${formatEventDate(endDate)}`;
  }
  
  return description;
};

/**
 * Check if an event is in the past
 */
export const isEventPast = (date: Date | string, time?: string): boolean => {
  const eventDate = typeof date === 'string' ? new Date(date) : date;
  
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
  }
  
  return eventDate < new Date();
};

/**
 * Check if an event is happening today
 */
export const isEventToday = (date: Date | string): boolean => {
  const eventDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    eventDate.getDate() === today.getDate() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Get event status based on date/time
 */
export const getEventStatus = (
  startDate: Date | string,
  startTime?: string,
  endDate?: Date | string,
  endTime?: string
): 'upcoming' | 'ongoing' | 'past' => {
  const now = new Date();
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  
  if (startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    start.setHours(hours, minutes, 0, 0);
  }
  
  if (start > now) {
    return 'upcoming';
  }
  
  if (endDate) {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (endTime) {
      const [hours, minutes] = endTime.split(':').map(Number);
      end.setHours(hours, minutes, 0, 0);
    }
    
    if (end > now) {
      return 'ongoing';
    }
  } else if (endTime && isEventToday(startDate)) {
    // If no end date but has end time, check if event is still ongoing today
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endToday = new Date();
    endToday.setHours(endHours, endMinutes, 0, 0);
    
    if (endToday > now) {
      return 'ongoing';
    }
  }
  
  return 'past';
};

/**
 * Calculate boost cost based on tier and duration
 */
export const calculateBoostCost = (
  tierPrice: number,
  durationDays: number
): number => {
  // Price is per week, so calculate proportionally
  const weeks = durationDays / 7;
  return Math.ceil(tierPrice * weeks * 100) / 100; // Round to 2 decimal places
};

/**
 * Validate event form data for completeness
 */
export const validateEventData = (data: Partial<EventFormData>): string[] => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) {
    errors.push('Event title is required');
  }
  
  if (!data.description?.trim()) {
    errors.push('Event description is required');
  }
  
  if (!data.startDate) {
    errors.push('Event date is required');
  }
  
  if (!data.startTime) {
    errors.push('Event start time is required');
  }
  
  if (data.isVirtual && !data.virtualMeetingUrl?.trim()) {
    errors.push('Virtual meeting URL is required for virtual events');
  }
  
  if (!data.isVirtual && !data.locationName?.trim()) {
    errors.push('Venue name is required for in-person events');
  }
  
  return errors;
};