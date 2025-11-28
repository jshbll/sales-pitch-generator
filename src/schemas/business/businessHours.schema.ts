/**
 * Business Hours Schema
 * 
 * Zod schema for validating business hours data.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';
import { dayHoursBaseSchema } from './businessCommon.schema';

/**
 * Schema for DayHours
 */
export const dayHoursSchema = dayHoursBaseSchema;

/**
 * Type definition for DayHours
 */
export type DayHours = z.infer<typeof dayHoursSchema>;

/**
 * Schema for BusinessHours
 */
export const businessHoursSchema = z.object({
  monday: dayHoursSchema.optional(),
  tuesday: dayHoursSchema.optional(),
  wednesday: dayHoursSchema.optional(),
  thursday: dayHoursSchema.optional(),
  friday: dayHoursSchema.optional(),
  saturday: dayHoursSchema.optional(),
  sunday: dayHoursSchema.optional()
}).catchall(dayHoursSchema.optional());

/**
 * Type definition for BusinessHours
 */
export type BusinessHours = z.infer<typeof businessHoursSchema>;

/**
 * Get a specific day's hours from business hours
 * 
 * @param businessHours - The business hours object
 * @param day - The day to get hours for
 * @returns The day's hours or undefined
 */
export function getDayHours(businessHours: BusinessHours, day: string): DayHours | undefined {
  return businessHours[day as keyof BusinessHours];
}

/**
 * Check if a business is open on a specific day
 * 
 * @param businessHours - The business hours object
 * @param day - The day to check
 * @returns True if the business is open on the specified day
 */
export function isOpenOnDay(businessHours: BusinessHours, day: string): boolean {
  const dayHours = getDayHours(businessHours, day);
  return dayHours ? !dayHours.closed : false;
}

/**
 * Get all days that a business is open
 * 
 * @param businessHours - The business hours object
 * @returns Array of days the business is open
 */
export function getOpenDays(businessHours: BusinessHours): string[] {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.filter(day => isOpenOnDay(businessHours, day));
}

/**
 * Format business hours for display
 * 
 * @param businessHours - The business hours object
 * @returns Formatted business hours for display
 */
export function formatBusinessHours(businessHours: BusinessHours): Record<string, string> {
  const formattedHours: Record<string, string> = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const dayHours = getDayHours(businessHours, day);
    if (dayHours) {
      if (dayHours.closed) {
        formattedHours[day] = 'Closed';
      } else {
        formattedHours[day] = `${dayHours.open} - ${dayHours.close}`;
      }
    } else {
      formattedHours[day] = 'Not specified';
    }
  });
  
  return formattedHours;
}
