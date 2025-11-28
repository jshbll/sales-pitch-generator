import { DiscountTypeConfig, StepConfig, PromotionFormData } from '../../types/promotion';

/**
 * Discount type configurations
 */
export const DISCOUNT_TYPES: DiscountTypeConfig[] = [
  { 
    value: 'percentage', 
    label: 'Percentage Off', 
    example: '20% off',
    description: 'Most popular choice'
  },
  { 
    value: 'fixed', 
    label: 'Dollar Amount Off', 
    example: '$10 off',
    description: 'Best for high-value items'
  },
  { 
    value: 'bogo', 
    label: 'Buy X Get Y Off', 
    example: 'Buy 2 Get 1 Free',
    description: 'Flexible bulk deals'
  }
];

/**
 * Stepper steps configuration
 */
export const PROMOTION_STEPS: StepConfig[] = [
  {
    label: 'Promotion Type',
    description: 'Choose your discount structure',
    fields: ['discountType', 'discountValue', 'bogoNeedToBuy', 'bogoDiscountPercent'],
  },
  {
    label: 'Basic Information',
    description: 'Title, description, and keywords',
    fields: ['title', 'description', 'keywords', 'keywordsInput'],
  },
  {
    label: 'Schedule',
    description: 'Set start and end dates',
    fields: ['startDate', 'endDate', 'isScheduled', 'hasExpiration', 'isFlashSale', 'flashSaleHours'],
  },
  {
    label: 'Images',
    description: 'Add promotional images',
    fields: ['galleryImages'],
    optional: true,
  },
  {
    label: 'Terms & Conditions',
    description: 'Define redemption rules',
    fields: ['termsConditions'],
  },
  {
    label: 'Redemption Limits',
    description: 'Set usage restrictions',
    fields: [
      'hasRedemptionLimit',
      'redemptionLimit',
      'hasPerCustomerLimit',
      'perCustomerLimit',
      'useCustomCode',
      'customRedemptionCode',
    ],
    optional: true,
  },
  {
    label: 'Access & Requirements',
    description: 'Define who can access this promotion',
    fields: [
      'isFollowerExclusive',
      'isAgeRestricted',
      'minimumAge',
      'requireInPerson',
      'maxRedemptionDistance',
    ],
    optional: true,
  },
  {
    label: 'Boost Options',
    description: 'Increase visibility with boost',
    fields: ['isBoostEnabled', 'boostTargetTier', 'boostCost'],
    optional: true,
  },
  {
    label: 'Review & Create',
    description: 'Review your promotion before publishing',
    fields: [], // All fields are reviewed here
  },
];

/**
 * Validation messages
 */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  minValue: (min: number) => `Must be at least ${min}`,
  maxValue: (max: number) => `Must be no more than ${max}`,
  invalidEmail: 'Please enter a valid email address',
  invalidDate: 'Please enter a valid date',
  startDateBeforeEnd: 'Start date must be before end date',
  endDateInPast: 'End date cannot be in the past',
  invalidCode: 'Code must be alphanumeric and 4-6 characters',
  codeAlreadyExists: 'This redemption code is already in use',
  invalidPercentage: 'Percentage must be between 1 and 100',
  invalidAge: 'Age must be between 13 and 120',
  invalidDistance: 'Distance must be between 0.1 and 100 miles',
  bogoInvalid: 'BOGO configuration is invalid',
  noKeywords: 'Please add at least one keyword',
  tooManyKeywords: 'Maximum 10 keywords allowed',
};

/**
 * Field limits and constraints
 */
export const FIELD_LIMITS = {
  title: {
    min: 3,
    max: 100,
  },
  description: {
    min: 10,
    max: 500,
  },
  termsConditions: {
    min: 0,
    max: 1000,
  },
  redemptionCode: {
    min: 4,
    max: 6,  // Maximum 6 characters for custom codes
    pattern: /^[A-Z0-9]+$/,
  },
  keywords: {
    min: 1,
    max: 10,
    maxLength: 30, // Per keyword
  },
  percentage: {
    min: 1,
    max: 100,
  },
  fixedAmount: {
    min: 0.01,
    max: 10000,
  },
  redemptionLimit: {
    min: 1,
    max: 100000,
  },
  perCustomerLimit: {
    min: 1,
    max: 100,
  },
  age: {
    min: 13,
    max: 120,
  },
  distance: {
    min: 0.1,
    max: 100, // miles
  },
  flashSaleHours: {
    min: 1,
    max: 72,
  },
  images: {
    maxCount: 5,
    maxSizeMB: 5,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
};

/**
 * Default boost pricing (in cents)
 */
export const BOOST_PRICING = {
  gold: {
    baseCost: 500, // $5 base
    dailyRate: 100, // $1 per day
    minDays: 7,
    maxDays: 30,
    description: '2x visibility boost',
  },
  diamond: {
    baseCost: 1000, // $10 base
    dailyRate: 200, // $2 per day
    minDays: 7,
    maxDays: 30,
    description: '5x visibility boost + featured placement',
  },
};

/**
 * Status labels for promotions
 */
export const PROMOTION_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  SCHEDULED: 'scheduled',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PAUSED: 'paused',
} as const;

/**
 * Status display configuration
 */
export const STATUS_DISPLAY = {
  [PROMOTION_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'default' as const,
    description: 'Not yet published',
  },
  [PROMOTION_STATUS.PENDING]: {
    label: 'Pending',
    color: 'warning' as const,
    description: 'Awaiting approval or payment',
  },
  [PROMOTION_STATUS.ACTIVE]: {
    label: 'Active',
    color: 'success' as const,
    description: 'Currently live',
  },
  [PROMOTION_STATUS.SCHEDULED]: {
    label: 'Scheduled',
    color: 'info' as const,
    description: 'Will go live automatically',
  },
  [PROMOTION_STATUS.EXPIRED]: {
    label: 'Expired',
    color: 'default' as const,
    description: 'Past end date',
  },
  [PROMOTION_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'error' as const,
    description: 'Manually cancelled',
  },
  [PROMOTION_STATUS.PAUSED]: {
    label: 'Paused',
    color: 'warning' as const,
    description: 'Temporarily disabled',
  },
};

/**
 * Redemption code patterns
 */
export const CODE_PATTERNS = {
  prefixes: ['SAVE', 'DEAL', 'GET', 'OFF', 'PROMO', 'FLASH', 'VIP', 'SPECIAL'],
  suffixes: ['NOW', 'TODAY', '2024', 'SALE', 'DEAL'],
  separators: ['', '-'],
};

/**
 * Flash sale duration options (in hours)
 */
export const FLASH_SALE_DURATIONS = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 4, label: '4 hours' },
  { value: 8, label: '8 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
  { value: 48, label: '48 hours' },
  { value: 72, label: '72 hours' },
];

/**
 * Age restriction presets
 */
export const AGE_PRESETS = [
  { value: 13, label: '13+ (Teen)' },
  { value: 18, label: '18+ (Adult)' },
  { value: 21, label: '21+ (Legal drinking age)' },
  { value: 55, label: '55+ (Senior)' },
  { value: 65, label: '65+ (Senior citizen)' },
];

/**
 * Distance restriction presets (in miles)
 */
export const DISTANCE_PRESETS = [
  { value: 0.5, label: 'Within 0.5 miles' },
  { value: 1, label: 'Within 1 mile' },
  { value: 5, label: 'Within 5 miles' },
  { value: 10, label: 'Within 10 miles' },
  { value: 25, label: 'Within 25 miles' },
  { value: 50, label: 'Within 50 miles' },
];