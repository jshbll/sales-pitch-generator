import { PromotionFormData, DiscountType, BoostTier, AISuggestion } from '../../types/promotion';
import { BOOST_PRICING, CODE_PATTERNS, PROMOTION_STATUS, STATUS_DISPLAY } from './constants';

/**
 * Format discount display string
 */
export const formatDiscount = (
  discountType: DiscountType,
  discountValue: number,
  bogoNeedToBuy?: number,
  bogoDiscountPercent?: number
): string => {
  switch (discountType) {
    case 'percentage':
      return `${discountValue}% off`;
    case 'fixed':
      return `$${discountValue} off`;
    case 'bogo':
      if (bogoDiscountPercent === 100) {
        return `Buy ${bogoNeedToBuy} Get 1 Free`;
      }
      return `Buy ${bogoNeedToBuy} Get ${bogoDiscountPercent}% off next`;
    default:
      return 'Special Offer';
  }
};

/**
 * Calculate boost cost based on tier and duration
 */
export const calculateBoostCost = (
  tier: BoostTier | null,
  startDate: Date | null,
  endDate: Date | null
): number => {
  if (!tier || !startDate || !endDate) {
    return 0;
  }

  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const pricing = tier === 'gold' ? BOOST_PRICING.gold : BOOST_PRICING.diamond;
  const totalCost = pricing.baseCost + (pricing.dailyRate * days);

  return totalCost;
};

/**
 * Generate a random redemption code
 */
export const generateRedemptionCode = (
  businessName?: string,
  discountType?: DiscountType
): string => {
  const prefix = CODE_PATTERNS.prefixes[
    Math.floor(Math.random() * CODE_PATTERNS.prefixes.length)
  ];
  const suffix = CODE_PATTERNS.suffixes[
    Math.floor(Math.random() * CODE_PATTERNS.suffixes.length)
  ];
  const randomNum = Math.floor(Math.random() * 100);
  
  return `${prefix}${randomNum}${suffix}`.toUpperCase();
};

/**
 * Format currency amount from cents to dollars
 */
export const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

/**
 * Parse keywords from comma-separated string
 */
export const parseKeywords = (input: string): string[] => {
  return input
    .split(',')
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0);
};

/**
 * Format keywords to comma-separated string
 */
export const formatKeywords = (keywords: string[]): string => {
  return keywords.join(', ');
};

/**
 * Get promotion status based on dates
 */
export const getPromotionStatus = (
  startDate: Date | null,
  endDate: Date | null,
  isActive: boolean = true
): string => {
  const now = new Date();
  
  if (!isActive) {
    return PROMOTION_STATUS.PAUSED;
  }
  
  if (!startDate) {
    return PROMOTION_STATUS.DRAFT;
  }
  
  if (startDate > now) {
    return PROMOTION_STATUS.SCHEDULED;
  }
  
  if (endDate && endDate < now) {
    return PROMOTION_STATUS.EXPIRED;
  }
  
  return PROMOTION_STATUS.ACTIVE;
};

/**
 * Get status display configuration
 */
export const getStatusDisplay = (status: string) => {
  return STATUS_DISPLAY[status] || {
    label: status,
    color: 'default' as const,
    description: ''
  };
};

/**
 * Calculate days remaining for a promotion
 */
export const getDaysRemaining = (endDate: Date | null): number | null => {
  if (!endDate) return null;
  
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return 0;
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Calculate hours remaining for flash sale
 */
export const getHoursRemaining = (endDate: Date | null): number | null => {
  if (!endDate) return null;
  
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return 0;
  
  return Math.ceil(diff / (1000 * 60 * 60));
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | null): string => {
  if (!date) return 'Not set';
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format date range for display
 */
export const formatDateRange = (
  startDate: Date | null,
  endDate: Date | null
): string => {
  if (!startDate && !endDate) return 'Not scheduled';
  if (!startDate) return `Until ${formatDate(endDate)}`;
  if (!endDate) return `Starting ${formatDate(startDate)}`;
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Check if promotion is currently active
 */
export const isPromotionActive = (
  startDate: Date | null,
  endDate: Date | null
): boolean => {
  const now = new Date();
  
  if (!startDate) return false;
  if (startDate > now) return false;
  if (endDate && endDate < now) return false;
  
  return true;
};

/**
 * Calculate redemption percentage
 */
export const getRedemptionPercentage = (
  redemptionsCount: number,
  redemptionLimit?: number
): number => {
  if (!redemptionLimit || redemptionLimit === 0) return 0;
  return Math.round((redemptionsCount / redemptionLimit) * 100);
};

/**
 * Get urgency message based on redemptions
 */
export const getUrgencyMessage = (
  redemptionsCount: number,
  redemptionLimit?: number
): string | null => {
  if (!redemptionLimit) return null;
  
  const percentage = getRedemptionPercentage(redemptionsCount, redemptionLimit);
  const remaining = redemptionLimit - redemptionsCount;
  
  if (percentage >= 90) {
    return `Only ${remaining} left!`;
  } else if (percentage >= 75) {
    return `Limited availability - ${remaining} remaining`;
  } else if (percentage >= 50) {
    return `${remaining} redemptions available`;
  }
  
  return null;
};

/**
 * Transform AI suggestion to form data
 */
export const applyAISuggestion = (
  currentData: PromotionFormData,
  suggestion: AISuggestion
): PromotionFormData => {
  return {
    ...currentData,
    ...(suggestion.title && { title: suggestion.title }),
    ...(suggestion.description && { description: suggestion.description }),
    ...(suggestion.keywords && { 
      keywords: suggestion.keywords,
      keywordsInput: formatKeywords(suggestion.keywords)
    }),
    ...(suggestion.discountType && { discountType: suggestion.discountType }),
    ...(suggestion.discountValue !== undefined && { discountValue: suggestion.discountValue }),
  };
};

/**
 * Get step completion percentage
 */
export const getStepCompletionPercentage = (
  currentStep: number,
  totalSteps: number
): number => {
  return Math.round((currentStep / totalSteps) * 100);
};

/**
 * Check if form data has unsaved changes
 */
export const hasUnsavedChanges = (
  currentData: PromotionFormData,
  savedData: PromotionFormData
): boolean => {
  return JSON.stringify(currentData) !== JSON.stringify(savedData);
};

/**
 * Get preview URL for promotion
 */
export const getPromotionPreviewUrl = (
  promotionId: string,
  businessSlug: string
): string => {
  return `/preview/business/${businessSlug}/promotion/${promotionId}`;
};

/**
 * Get share URL for promotion
 */
export const getPromotionShareUrl = (
  promotionId: string,
  businessSlug: string
): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/deals/${businessSlug}/${promotionId}`;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate image file
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5,
  acceptedFormats: string[] = ['.jpg', '.jpeg', '.png', '.webp']
): { isValid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }
  
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!acceptedFormats.includes(extension)) {
    return {
      isValid: false,
      error: `File type must be one of: ${acceptedFormats.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Generate SEO-friendly slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
};

/**
 * Calculate estimated reach based on boost tier
 */
export const getEstimatedReach = (
  basReach: number,
  boostTier: BoostTier | null
): number => {
  if (!boostTier) return basReach;
  
  switch (boostTier) {
    case 'gold':
      return basReach * 2;
    case 'diamond':
      return basReach * 5;
    default:
      return basReach;
  }
};

/**
 * Get time until promotion starts/ends
 */
export const getTimeUntil = (targetDate: Date | null): string => {
  if (!targetDate) return '';
  
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
};