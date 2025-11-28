import { BusinessProfile, BusinessHours } from '../types';

// Define the WizardData interface to match what's used in BusinessProfileWizard
export interface WizardData { 
  id?: string; 
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  phone?: string;
  phoneNumber?: string; // Added to match form field name
  email?: string;
  businessHours?: BusinessHours;
  category?: string;
  subcategory?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  snapchatUrl?: string;
  logoFile?: File | null;
  bannerFile?: File | null;
}

/**
 * Helper function to convert a BusinessProfile to WizardData format
 * 
 * @param profile The business profile to convert
 * @returns WizardData object
 */
export const mapBusinessProfileToWizardData = (profile: BusinessProfile): WizardData => {
  return {
    id: profile.id || '',
    name: (profile.business_name || profile.name || '') as string,
    description: profile.description || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    zip: profile.zip || '',
    website: profile.website || '',
    phone: profile.phone || '',
    phoneNumber: profile.phone || '', // Use same source as phone field
    email: profile.email || profile.contactEmail || '',
    businessHours: profile.businessHours || {} as BusinessHours,
    category: profile.category || '',
    subcategory: profile.subcategory || '',
    facebookUrl: profile.facebookUrl || '',
    instagramUrl: profile.instagramUrl || '',
    twitterUrl: profile.twitterUrl || '',
    linkedinUrl: profile.linkedinUrl || '',
    snapchatUrl: profile.snapchatUrl || '',
    // We can't load File objects from API, only URLs
    logoFile: null, 
    bannerFile: null
  };
};

/**
 * Helper function to process URL fields for proper validation
 * If empty/undefined, return undefined so field is omitted from payload
 * Otherwise ensure URL has proper format with https://
 * 
 * @param url URL to process
 * @returns Properly formatted URL or undefined
 */
const processUrlField = (url: string | undefined): string | undefined => {
  if (!url || url.trim() === '') {
    return undefined; // Omit from payload entirely
  }
  
  // If URL doesn't start with http:// or https://, prepend https://
  // This ensures the URL passes backend validation
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`;
  }
  
  return url;
};

/**
 * Creates a business profile payload from WizardData for API requests
 * 
 * @param data WizardData from the form
 * @returns Formatted payload for API
 */
export const createProfilePayload = (data: WizardData) => {
  // Extract all fields from businessData
  const { 
    name, 
    description, 
    website, 
    address, 
    city, 
    state, 
    zip, 
    phone, 
    email, 
    category, 
    subcategory, 
    businessHours, 
    facebookUrl, 
    instagramUrl, 
    twitterUrl, 
    linkedinUrl, 
    snapchatUrl 
  } = data;

  // Start with basic profile data
  const payload: Record<string, string | object | undefined> = {
    name,
    description,
    website,
    address,
    city,
    state,
    zip,
    phone,
    email,
    category,
    subcategory,
    businessHours: businessHours || {}
  };
  
  // Only add social media URLs if they have valid content
  const facebook = processUrlField(facebookUrl);
  if (facebook) payload.facebook_url = facebook;
  
  const instagram = processUrlField(instagramUrl);
  if (instagram) payload.instagram_url = instagram;
  
  const twitter = processUrlField(twitterUrl);
  if (twitter) payload.twitter_url = twitter;
  
  const linkedin = processUrlField(linkedinUrl);
  if (linkedin) payload.linkedin_url = linkedin;
  
  const snapchat = processUrlField(snapchatUrl);
  if (snapchat) payload.snapchat_url = snapchat;
  
  return payload;
};

/**
 * Validates Business URL
 * 
 * @param url URL to validate
 * @returns boolean indicating if URL is valid
 */
export const validateBusinessUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true; // Empty URLs are valid (optional fields)
  try {
    const testUrl = url.match(/^https?:\/\//) ? url : `http://${url}`;
    new URL(testUrl);
    return true;
  } catch {
    return false;
  }
};

/**
 * Creates default empty WizardData
 * This prevents "cannot read property of undefined" errors
 * 
 * @returns Default WizardData object
 */
export const getDefaultWizardData = (): WizardData => {
  return {
    id: '',
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    phone: '',
    phoneNumber: '', // Added to match form field name
    email: '',
    businessHours: {} as BusinessHours,
    category: '',
    subcategory: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    snapchatUrl: '',
    logoFile: null,
    bannerFile: null
  };
};
