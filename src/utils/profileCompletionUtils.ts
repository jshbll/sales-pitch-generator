/**
 * Utility functions for profile completion tracking and calculations
 */

export interface CompletionMilestone {
  percentage: number;
  label: string;
  message: string;
  icon: string;
}

/**
 * Get milestone information based on completion percentage
 */
export const getCompletionMilestone = (percentage: number): CompletionMilestone => {
  if (percentage === 100) {
    return {
      percentage: 100,
      label: 'Complete',
      message: 'Your profile is 100% complete! Great job!',
      icon: '🎉',
    };
  } else if (percentage >= 90) {
    return {
      percentage: 90,
      label: 'Almost There',
      message: 'Just a few more details to complete your profile!',
      icon: '🌟',
    };
  } else if (percentage >= 75) {
    return {
      percentage: 75,
      label: 'Great Progress',
      message: 'Your profile is looking good! Keep going!',
      icon: '💪',
    };
  } else if (percentage >= 50) {
    return {
      percentage: 50,
      label: 'Halfway There',
      message: "You're making good progress on your profile!",
      icon: '📈',
    };
  } else if (percentage >= 25) {
    return {
      percentage: 25,
      label: 'Getting Started',
      message: 'Good start! Continue adding information to your profile.',
      icon: '🚀',
    };
  } else {
    return {
      percentage: 0,
      label: 'Just Beginning',
      message: "Let's get started on completing your profile!",
      icon: '✨',
    };
  }
};

/**
 * Get color scheme based on completion percentage
 */
export const getCompletionColor = (percentage: number): string => {
  if (percentage === 100) return 'success.main';
  if (percentage >= 80) return 'success.light';
  if (percentage >= 60) return 'warning.main';
  if (percentage >= 40) return 'info.main';
  return 'primary.main';
};

/**
 * Get priority sections that should be completed first
 */
export const getPrioritySections = (incompleteSections: any[]): string[] => {
  const priorityOrder = [
    'basic_info',     // Most important - basic business details
    'contact_info',   // Critical for customer contact
    'location',       // Essential for discovery
    'business_hours', // Important for customer planning
    'photos',         // Visual appeal
    'menu',          // Service/product information
    'social_media',  // Extended presence
  ];

  return incompleteSections
    .sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.id);
      const bIndex = priorityOrder.indexOf(b.id);
      return aIndex - bIndex;
    })
    .map(section => section.id);
};

/**
 * Get next recommended action based on profile state
 */
export const getNextRecommendedAction = (
  sections: any[],
  businessData: any
): { section: string; action: string; reason: string } | null => {
  // Find first incomplete required section
  const incompleteRequired = sections.find(s => s.required && !s.completed);
  if (incompleteRequired) {
    return {
      section: incompleteRequired.label,
      action: `Complete ${incompleteRequired.label}`,
      reason: 'This is a required section for your profile',
    };
  }

  // Check for missing logo (high impact)
  if (!businessData.logo_url && !businessData.logo_id) {
    return {
      section: 'Basic Information',
      action: 'Upload a business logo',
      reason: 'A logo helps customers recognize your business',
    };
  }

  // Check for missing business hours
  if (!businessData.business_hours || Object.keys(businessData.business_hours).length === 0) {
    return {
      section: 'Business Hours',
      action: 'Add your business hours',
      reason: 'Customers need to know when you\'re open',
    };
  }

  // Check for social media presence
  const socialLinks = [
    businessData.website,
    businessData.facebook_url,
    businessData.instagram_url,
    businessData.twitter_url,
    businessData.linkedin_url,
  ].filter(Boolean);

  if (socialLinks.length < 2) {
    return {
      section: 'Social Media',
      action: 'Add social media links',
      reason: 'Connect with customers on multiple platforms',
    };
  }

  // Find first incomplete optional section
  const incompleteOptional = sections.find(s => !s.required && !s.completed);
  if (incompleteOptional) {
    return {
      section: incompleteOptional.label,
      action: `Add ${incompleteOptional.label}`,
      reason: 'Enhance your profile with additional information',
    };
  }

  return null;
};

/**
 * Calculate time estimate to complete profile
 */
export const estimateCompletionTime = (incompleteSections: any[]): number => {
  const timeEstimates: Record<string, number> = {
    basic_info: 5,      // 5 minutes for basic info
    contact_info: 3,    // 3 minutes for contact
    location: 5,        // 5 minutes for address
    business_hours: 10, // 10 minutes to set up hours
    photos: 15,         // 15 minutes to upload photos
    menu: 20,           // 20 minutes for menu/services
    social_media: 5,    // 5 minutes for social links
  };

  return incompleteSections.reduce((total, section) => {
    return total + (timeEstimates[section.id] || 5);
  }, 0);
};

/**
 * Format time estimate for display
 */
export const formatTimeEstimate = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Check if profile meets minimum requirements for public visibility
 */
export const meetsMinimumRequirements = (businessData: any): boolean => {
  const businessName = businessData?.name || businessData?.business_name;
  const hasCategories = (businessData?.categories && businessData.categories.length > 0) || !!businessData?.category;
  const hasLocation = !!(businessData?.address && businessData?.city && businessData?.state && businessData?.zip) ||
                     (businessData?.customersDoNotVisit === true && businessData?.serviceZip && businessData?.serviceRadius);

  return !!(
    businessName &&
    businessData?.description &&
    hasCategories &&
    businessData?.phone &&
    hasLocation
  );
};

/**
 * Get profile score based on weighted importance of fields
 */
export const calculateProfileScore = (businessData: any): number => {
  const weights = {
    name: 10,
    description: 10,
    categories: 10,
    phone: 10,
    address: 8,
    logo: 7,
    business_hours: 6,
    website: 5,
    social_media: 4,
    photos: 5,
    menu: 4,
  };

  let totalWeight = 0;
  let achievedWeight = 0;

  // Basic info
  totalWeight += weights.name;
  if (businessData?.name || businessData?.business_name) achievedWeight += weights.name;

  totalWeight += weights.description;
  if (businessData?.description) achievedWeight += weights.description;

  totalWeight += weights.categories;
  if ((businessData?.categories && businessData.categories.length > 0) || businessData?.category) {
    achievedWeight += weights.categories;
  }

  // Contact
  totalWeight += weights.phone;
  if (businessData?.phone) achievedWeight += weights.phone;

  // Location
  totalWeight += weights.address;
  const hasLocation = !!(businessData?.address && businessData?.city && businessData?.state && businessData?.zip) ||
                     (businessData?.customersDoNotVisit === true && businessData?.serviceZip && businessData?.serviceRadius);
  if (hasLocation) achievedWeight += weights.address;

  // Logo
  totalWeight += weights.logo;
  if (businessData?.logo_url || businessData?.logo_id) achievedWeight += weights.logo;

  // Hours
  totalWeight += weights.business_hours;
  if (businessData?.business_hours && Object.keys(businessData.business_hours).length > 0) {
    achievedWeight += weights.business_hours;
  }

  // Website
  totalWeight += weights.website;
  if (businessData?.website) achievedWeight += weights.website;

  // Social Media (count as complete if has 2+ links)
  totalWeight += weights.social_media;
  const socialLinks = [
    businessData?.facebook_url,
    businessData?.instagram_url,
    businessData?.twitter_url,
    businessData?.linkedin_url,
    businessData?.tiktok_url,
    businessData?.pinterest_url,
  ].filter(Boolean);
  if (socialLinks.length >= 2) achievedWeight += weights.social_media;

  return Math.round((achievedWeight / totalWeight) * 100);
};

export default {
  getCompletionMilestone,
  getCompletionColor,
  getPrioritySections,
  getNextRecommendedAction,
  estimateCompletionTime,
  formatTimeEstimate,
  meetsMinimumRequirements,
  calculateProfileScore,
};