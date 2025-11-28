/**
 * Business Contact Schema
 * 
 * Zod schema for validating business contact information.
 * 
 * @version 1.0.0
 * @author Cold Pitch Team
 */

import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema } from './businessCommon.schema';
import { normalizeUrl } from './businessTransformation.utils';

/**
 * Schema for business contact information
 */
export const businessContactSchema = z.object({
  email: emailSchema,
  contactEmail: emailSchema,
  phone: phoneSchema,
  phone_number: phoneSchema,
  website: urlSchema
});

/**
 * Type definition for BusinessContact
 */
export type BusinessContact = z.infer<typeof businessContactSchema>;

/**
 * Get the primary contact email for a business
 * 
 * @param contact - The business contact information
 * @returns The primary contact email
 */
export function getPrimaryEmail(contact: BusinessContact): string | undefined {
  return contact.email || contact.contactEmail;
}

/**
 * Get the primary phone number for a business
 * 
 * @param contact - The business contact information
 * @returns The primary phone number
 */
export function getPrimaryPhone(contact: BusinessContact): string | undefined {
  return contact.phone || contact.phone_number;
}

/**
 * Format a phone number for display
 * 
 * @param phone - The phone number to format
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) {
    return '';
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if it's a 10-digit number
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  // Return the original format if it's not a 10-digit number
  return phone;
}

/**
 * Get the formatted website URL
 * 
 * @param contact - The business contact information
 * @returns The formatted website URL
 */
export function getFormattedWebsite(contact: BusinessContact): string {
  if (!contact.website) {
    return '';
  }
  
  return normalizeUrl(contact.website) || '';
}

/**
 * Create a contact object with default values
 * 
 * @returns A new business contact object
 */
export function createDefaultContact(): BusinessContact {
  return {
    email: undefined,
    contactEmail: undefined,
    phone: undefined,
    phone_number: undefined,
    website: undefined
  };
}
