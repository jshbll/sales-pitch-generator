import { Promotion } from '../types';

/**
 * Validates a promotion title
 * @param title The promotion title to validate
 * @returns Error message or null if valid
 */
export const validateTitle = (title: string): string | null => {
  if (!title || title.trim() === '') {
    return 'Title is required';
  }
  
  if (title.length < 5) {
    return 'Title must be at least 5 characters long';
  }
  
  if (title.length > 100) {
    return 'Title must be less than 100 characters';
  }
  
  return null;
};

/**
 * Validates a promotion description
 * @param description The promotion description to validate
 * @returns Error message or null if valid
 */
export const validateDescription = (description: string): string | null => {
  if (!description || description.trim() === '') {
    return 'Description is required';
  }
  
  if (description.length < 10) {
    return 'Description must be at least 10 characters long';
  }
  
  if (description.length > 500) {
    return 'Description must be less than 500 characters';
  }
  
  return null;
};

/**
 * Validates a discount value
 * @param value The discount value to validate
 * @param type The discount type (percentage, fixed, etc.)
 * @returns Error message or null if valid
 */
export const validateDiscount = (value: string, type: string): string | null => {
  if (!value || value.trim() === '') {
    return 'Discount value is required';
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return 'Discount must be a valid number';
  }
  
  if (numValue <= 0) {
    return 'Discount must be greater than 0';
  }
  
  if (type === 'percentage' && numValue > 100) {
    return 'Percentage discount cannot exceed 100%';
  }
  
  return null;
};

/**
 * Validates promotion dates
 * @param startDate The start date of the promotion
 * @param endDate The end date of the promotion
 * @returns Object with error messages for start and end dates
 */
export const validateDates = (startDate: string | null, endDate: string | null): { startDate: string | null, endDate: string | null } => {
  const errors: { startDate: string | null, endDate: string | null } = {
    startDate: null,
    endDate: null
  };
  
  if (!startDate) {
    errors.startDate = 'Start date is required';
  }
  
  if (!endDate) {
    errors.endDate = 'End date is required';
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date';
    }
    
    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date';
    }
    
    if (!errors.startDate && !errors.endDate && start >= end) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  return errors;
};

/**
 * Validates a single field in a promotion
 * @param field The field name to validate
 * @param value The value to validate
 * @param promotion The current promotion object (for context-dependent validation)
 * @returns Error message or null if valid
 */
export const validateField = (field: string, value: unknown, promotion: Partial<Promotion>): string | null => {
  switch (field) {
    case 'title':
      return validateTitle(value as string);
    
    case 'description':
      return validateDescription(value as string);
    
    case 'discount':
      return validateDiscount(value as string, promotion.discountType || 'percentage');
    
    case 'startDate':
      return validateDates(value as string, promotion.endDate || null).startDate;
    
    case 'endDate':
      return validateDates(promotion.startDate || null, value as string).endDate;
    
    default:
      return null;
  }
};

/**
 * Validates an entire promotion object
 * @param promotion The promotion to validate
 * @returns Object with field names as keys and error messages as values
 */
export const validatePromotion = (promotion: Partial<Promotion>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validate title
  const titleError = validateTitle(promotion.title || '');
  if (titleError) errors.title = titleError;
  
  // Validate description
  const descriptionError = validateDescription(promotion.description || '');
  if (descriptionError) errors.description = descriptionError;
  
  // Validate discount
  const discountError = validateDiscount(promotion.discount || '', promotion.discountType || 'percentage');
  if (discountError) errors.discount = discountError;
  
  // Validate dates
  const dateErrors = validateDates(promotion.startDate || null, promotion.endDate || null);
  if (dateErrors.startDate) errors.startDate = dateErrors.startDate;
  if (dateErrors.endDate) errors.endDate = dateErrors.endDate;
  
  return errors;
};

/**
 * Checks if a promotion is valid
 * @param promotion The promotion to validate
 * @returns True if the promotion is valid, false otherwise
 */
export const isPromotionValid = (promotion: Partial<Promotion>): boolean => {
  const errors = validatePromotion(promotion);
  return Object.keys(errors).length === 0;
};
