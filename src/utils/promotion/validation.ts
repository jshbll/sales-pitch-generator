import { PromotionFormData, ValidationErrors, ValidationResult, DiscountType } from '../../types/promotion';
import { FIELD_LIMITS, VALIDATION_MESSAGES } from './constants';

/**
 * Validate promotion title
 */
export const validateTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  if (title.length < FIELD_LIMITS.title.min) {
    return { isValid: false, error: VALIDATION_MESSAGES.minLength(FIELD_LIMITS.title.min) };
  }
  if (title.length > FIELD_LIMITS.title.max) {
    return { isValid: false, error: VALIDATION_MESSAGES.maxLength(FIELD_LIMITS.title.max) };
  }
  return { isValid: true };
};

/**
 * Validate promotion description
 */
export const validateDescription = (description: string): ValidationResult => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  if (description.length < FIELD_LIMITS.description.min) {
    return { isValid: false, error: VALIDATION_MESSAGES.minLength(FIELD_LIMITS.description.min) };
  }
  if (description.length > FIELD_LIMITS.description.max) {
    return { isValid: false, error: VALIDATION_MESSAGES.maxLength(FIELD_LIMITS.description.max) };
  }
  return { isValid: true };
};

/**
 * Validate discount value based on discount type
 */
export const validateDiscountValue = (
  value: number,
  discountType: DiscountType
): ValidationResult => {
  if (value === undefined || value === null || isNaN(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }

  if (discountType === 'percentage') {
    if (value < FIELD_LIMITS.percentage.min) {
      return { isValid: false, error: VALIDATION_MESSAGES.minValue(FIELD_LIMITS.percentage.min) };
    }
    if (value > FIELD_LIMITS.percentage.max) {
      return { isValid: false, error: VALIDATION_MESSAGES.invalidPercentage };
    }
  } else if (discountType === 'fixed') {
    if (value < FIELD_LIMITS.fixedAmount.min) {
      return { isValid: false, error: VALIDATION_MESSAGES.minValue(FIELD_LIMITS.fixedAmount.min) };
    }
    if (value > FIELD_LIMITS.fixedAmount.max) {
      return { isValid: false, error: VALIDATION_MESSAGES.maxValue(FIELD_LIMITS.fixedAmount.max) };
    }
  }

  return { isValid: true };
};

/**
 * Validate BOGO configuration
 */
export const validateBogoConfig = (
  needToBuy: number,
  discountPercent: number
): ValidationResult => {
  if (!needToBuy || needToBuy < 1) {
    return { isValid: false, error: VALIDATION_MESSAGES.bogoInvalid };
  }
  if (discountPercent < 0 || discountPercent > 100) {
    return { isValid: false, error: VALIDATION_MESSAGES.invalidPercentage };
  }
  return { isValid: true };
};

/**
 * Validate date range
 */
export const validateDateRange = (
  startDate: Date | null,
  endDate: Date | null,
  isScheduled: boolean,
  hasExpiration: boolean
): ValidationResult => {
  if (isScheduled && !startDate) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }

  if (hasExpiration && !endDate) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }

  if (startDate && endDate) {
    if (startDate >= endDate) {
      return { isValid: false, error: VALIDATION_MESSAGES.startDateBeforeEnd };
    }
    if (endDate < new Date()) {
      return { isValid: false, error: VALIDATION_MESSAGES.endDateInPast };
    }
  }

  return { isValid: true };
};

/**
 * Validate redemption code
 */
export const validateRedemptionCode = (code: string): ValidationResult => {
  if (!code || code.trim().length === 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  
  const upperCode = code.toUpperCase();
  if (!FIELD_LIMITS.redemptionCode.pattern.test(upperCode)) {
    return { isValid: false, error: VALIDATION_MESSAGES.invalidCode };
  }
  
  if (upperCode.length < FIELD_LIMITS.redemptionCode.min) {
    return { isValid: false, error: VALIDATION_MESSAGES.minLength(FIELD_LIMITS.redemptionCode.min) };
  }
  
  if (upperCode.length > FIELD_LIMITS.redemptionCode.max) {
    return { isValid: false, error: VALIDATION_MESSAGES.maxLength(FIELD_LIMITS.redemptionCode.max) };
  }
  
  return { isValid: true };
};

/**
 * Validate keywords
 */
export const validateKeywords = (keywords: string[]): ValidationResult => {
  if (!keywords || keywords.length === 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.noKeywords };
  }
  
  if (keywords.length > FIELD_LIMITS.keywords.max) {
    return { isValid: false, error: VALIDATION_MESSAGES.tooManyKeywords };
  }
  
  for (const keyword of keywords) {
    if (keyword.length > FIELD_LIMITS.keywords.maxLength) {
      return { 
        isValid: false, 
        error: `Keyword "${keyword}" exceeds ${FIELD_LIMITS.keywords.maxLength} characters` 
      };
    }
  }
  
  return { isValid: true };
};

/**
 * Validate redemption limits
 */
export const validateRedemptionLimits = (
  hasLimit: boolean,
  limit?: number,
  hasPerCustomerLimit: boolean = false,
  perCustomerLimit?: number
): ValidationResult => {
  if (hasLimit && (!limit || limit < FIELD_LIMITS.redemptionLimit.min)) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.minValue(FIELD_LIMITS.redemptionLimit.min) 
    };
  }
  
  if (hasLimit && limit && limit > FIELD_LIMITS.redemptionLimit.max) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.maxValue(FIELD_LIMITS.redemptionLimit.max) 
    };
  }
  
  if (hasPerCustomerLimit && (!perCustomerLimit || perCustomerLimit < FIELD_LIMITS.perCustomerLimit.min)) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.minValue(FIELD_LIMITS.perCustomerLimit.min) 
    };
  }
  
  if (hasPerCustomerLimit && perCustomerLimit && perCustomerLimit > FIELD_LIMITS.perCustomerLimit.max) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.maxValue(FIELD_LIMITS.perCustomerLimit.max) 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate age restriction
 */
export const validateAgeRestriction = (
  isRestricted: boolean,
  minimumAge?: number
): ValidationResult => {
  if (!isRestricted) {
    return { isValid: true };
  }
  
  if (!minimumAge) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  
  if (minimumAge < FIELD_LIMITS.age.min || minimumAge > FIELD_LIMITS.age.max) {
    return { isValid: false, error: VALIDATION_MESSAGES.invalidAge };
  }
  
  return { isValid: true };
};

/**
 * Validate distance restriction and redemption location
 */
export const validateDistanceRestriction = (
  requireInPerson: boolean,
  maxDistance?: number,
  redemptionLocationType?: 'business_location' | 'custom',
  redemptionBusinessLocationId?: string,
  redemptionCustomAddress?: any
): ValidationResult => {
  if (!requireInPerson) {
    return { isValid: true };
  }

  // Validate that a redemption location is specified
  if (!redemptionLocationType) {
    return { isValid: false, error: 'Please select a redemption location type' };
  }

  // Validate business location selection
  if (redemptionLocationType === 'business_location' && !redemptionBusinessLocationId) {
    return { isValid: false, error: 'Please select a business location' };
  }

  // Validate custom address
  if (redemptionLocationType === 'custom') {
    if (!redemptionCustomAddress) {
      return { isValid: false, error: 'Please enter and verify a custom address' };
    }
    if (!redemptionCustomAddress.latitude || !redemptionCustomAddress.longitude) {
      return { isValid: false, error: 'Please verify the address using the "Verify Address" button' };
    }
  }

  // Validate max distance
  if (!maxDistance) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }

  if (maxDistance < FIELD_LIMITS.distance.min || maxDistance > FIELD_LIMITS.distance.max) {
    return { isValid: false, error: VALIDATION_MESSAGES.invalidDistance };
  }

  return { isValid: true };
};

/**
 * Validate flash sale configuration
 */
export const validateFlashSale = (
  isFlashSale: boolean,
  hours?: number
): ValidationResult => {
  if (!isFlashSale) {
    return { isValid: true };
  }
  
  if (!hours) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  
  if (hours < FIELD_LIMITS.flashSaleHours.min || hours > FIELD_LIMITS.flashSaleHours.max) {
    return { 
      isValid: false, 
      error: `Flash sale duration must be between ${FIELD_LIMITS.flashSaleHours.min} and ${FIELD_LIMITS.flashSaleHours.max} hours` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate entire step
 */
export const validateStep = (
  stepIndex: number,
  formData: PromotionFormData
): ValidationErrors => {
  const errors: ValidationErrors = {};

  switch (stepIndex) {
    case 0: // Promotion Type
      const discountResult = validateDiscountValue(formData.discountValue, formData.discountType);
      if (!discountResult.isValid) {
        errors.discountValue = discountResult.error;
      }
      
      if (formData.discountType === 'bogo') {
        const bogoResult = validateBogoConfig(
          formData.bogoNeedToBuy,
          formData.bogoDiscountPercent
        );
        if (!bogoResult.isValid) {
          errors.bogoConfig = bogoResult.error;
        }
      }
      break;

    case 1: // Basic Information
      const titleResult = validateTitle(formData.title);
      if (!titleResult.isValid) {
        errors.title = titleResult.error;
      }
      
      const descResult = validateDescription(formData.description);
      if (!descResult.isValid) {
        errors.description = descResult.error;
      }
      
      const keywordsResult = validateKeywords(formData.keywords);
      if (!keywordsResult.isValid) {
        errors.keywords = keywordsResult.error;
      }
      break;

    case 2: // Schedule
      const dateResult = validateDateRange(
        formData.startDate,
        formData.endDate,
        formData.isScheduled,
        formData.hasExpiration
      );
      if (!dateResult.isValid) {
        errors.dateRange = dateResult.error;
      }
      
      const flashResult = validateFlashSale(
        formData.isFlashSale,
        formData.flashSaleHours
      );
      if (!flashResult.isValid) {
        errors.flashSale = flashResult.error;
      }
      break;

    case 4: // Terms & Conditions
      if (!formData.termsConditions || formData.termsConditions.trim().length === 0) {
        errors.termsConditions = VALIDATION_MESSAGES.required;
      }
      break;

    case 5: // Redemption Limits
      const limitsResult = validateRedemptionLimits(
        formData.hasRedemptionLimit,
        formData.redemptionLimit,
        formData.hasPerCustomerLimit,
        formData.perCustomerLimit
      );
      if (!limitsResult.isValid) {
        errors.redemptionLimits = limitsResult.error;
      }
      
      if (formData.useCustomCode) {
        const codeResult = validateRedemptionCode(formData.customRedemptionCode);
        if (!codeResult.isValid) {
          errors.customRedemptionCode = codeResult.error;
        }
      }
      break;

    case 6: // Access & Requirements
      const ageResult = validateAgeRestriction(
        formData.isAgeRestricted,
        formData.minimumAge
      );
      if (!ageResult.isValid) {
        errors.minimumAge = ageResult.error;
      }
      
      const distanceResult = validateDistanceRestriction(
        formData.requireInPerson || false,
        formData.maxRedemptionDistance,
        formData.redemptionLocationType,
        formData.redemptionBusinessLocationId,
        formData.redemptionCustomAddress
      );
      if (!distanceResult.isValid) {
        errors.maxRedemptionDistance = distanceResult.error;
      }
      break;
  }

  return errors;
};

/**
 * Check if form data is valid for submission
 */
export const isFormValid = (formData: PromotionFormData): boolean => {
  // Required fields
  const titleResult = validateTitle(formData.title);
  const descResult = validateDescription(formData.description);
  const discountResult = validateDiscountValue(formData.discountValue, formData.discountType);
  const keywordsResult = validateKeywords(formData.keywords);
  
  if (!titleResult.isValid || !descResult.isValid || !discountResult.isValid || !keywordsResult.isValid) {
    return false;
  }
  
  // BOGO validation
  if (formData.discountType === 'bogo') {
    const bogoResult = validateBogoConfig(formData.bogoNeedToBuy, formData.bogoDiscountPercent);
    if (!bogoResult.isValid) return false;
  }
  
  // Date validation
  const dateResult = validateDateRange(
    formData.startDate,
    formData.endDate,
    formData.isScheduled,
    formData.hasExpiration
  );
  if (!dateResult.isValid) return false;
  
  // Optional validations
  if (formData.hasRedemptionLimit || formData.hasPerCustomerLimit) {
    const limitsResult = validateRedemptionLimits(
      formData.hasRedemptionLimit,
      formData.redemptionLimit,
      formData.hasPerCustomerLimit,
      formData.perCustomerLimit
    );
    if (!limitsResult.isValid) return false;
  }
  
  if (formData.useCustomCode) {
    const codeResult = validateRedemptionCode(formData.customRedemptionCode);
    if (!codeResult.isValid) return false;
  }
  
  if (formData.isAgeRestricted) {
    const ageResult = validateAgeRestriction(formData.isAgeRestricted, formData.minimumAge);
    if (!ageResult.isValid) return false;
  }
  
  if (formData.requireInPerson) {
    const distanceResult = validateDistanceRestriction(
      formData.requireInPerson,
      formData.maxRedemptionDistance,
      formData.redemptionLocationType,
      formData.redemptionBusinessLocationId,
      formData.redemptionCustomAddress
    );
    if (!distanceResult.isValid) return false;
  }
  
  if (formData.isFlashSale) {
    const flashResult = validateFlashSale(formData.isFlashSale, formData.flashSaleHours);
    if (!flashResult.isValid) return false;
  }
  
  return true;
};

/**
 * Get step validation status
 */
export const getStepValidationStatus = (
  stepIndex: number,
  formData: PromotionFormData
): boolean => {
  const errors = validateStep(stepIndex, formData);
  return Object.keys(errors).length === 0;
};

/**
 * Validate all steps and return errors
 */
export const validateAllSteps = (formData: PromotionFormData): ValidationErrors => {
  let allErrors: ValidationErrors = {};
  
  // Validate each step (0-8 based on PROMOTION_STEPS)
  for (let i = 0; i < 9; i++) {
    const stepErrors = validateStep(i, formData);
    allErrors = { ...allErrors, ...stepErrors };
  }
  
  return allErrors;
};