/**
 * Application-wide constants
 */

// Cloudflare account ID - used for image URL generation
export const CLOUDFLARE_ACCOUNT_ID = 'O5xSC37lvKr01NMd5n69gQ';

// Industry categories for business profiles
export const INDUSTRY_CATEGORIES: Record<string, string[]> = {
  'Food & Dining': [
    'Restaurant',
    'Cafe',
    'Bar & Nightclub',
    'Bakery',
    'Food Truck',
    'Catering',
  ],
  'Retail': [
    'Clothing & Apparel',
    'Electronics',
    'Home & Garden',
    'Grocery',
    'Specialty Retail',
  ],
  'Health & Wellness': [
    'Gym & Fitness',
    'Spa & Salon',
    'Medical Practice',
    'Dental',
    'Mental Health',
  ],
  'Professional Services': [
    'Legal',
    'Accounting',
    'Consulting',
    'Real Estate',
    'Insurance',
  ],
  'Home Services': [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Landscaping',
    'Cleaning',
  ],
  'Automotive': [
    'Auto Repair',
    'Car Dealership',
    'Auto Detailing',
    'Tire Shop',
  ],
  'Entertainment': [
    'Event Venue',
    'Movie Theater',
    'Amusement',
    'Gaming',
  ],
  'Other': [
    'Other',
  ],
};
