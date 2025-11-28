import { ValidationResult, EventFormData } from '../../types/event';
import { FIELD_LIMITS, VALIDATION_MESSAGES } from './constants';
import { isAfter, isBefore, isFuture, differenceInDays } from 'date-fns';

// Title validation
export const validateTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < FIELD_LIMITS.title.min) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.tooShort(FIELD_LIMITS.title.min) 
    };
  }
  
  if (trimmedTitle.length > FIELD_LIMITS.title.max) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.tooLong(FIELD_LIMITS.title.max) 
    };
  }
  
  return { isValid: true };
};

// Description validation
export const validateDescription = (description: string): ValidationResult => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  
  const trimmedDescription = description.trim();
  if (trimmedDescription.length < FIELD_LIMITS.description.min) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.tooShort(FIELD_LIMITS.description.min) 
    };
  }
  
  if (trimmedDescription.length > FIELD_LIMITS.description.max) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.tooLong(FIELD_LIMITS.description.max) 
    };
  }
  
  return { isValid: true };
};

// Date validation
export const validateDates = (
  startDate: Date | null, 
  endDate: Date | null,
  isEditMode: boolean = false
): ValidationResult => {
  if (!startDate) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  
  if (!endDate) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }
  
  // Only check if date is in future for new events
  if (!isEditMode && !isFuture(startDate)) {
    return { isValid: false, error: VALIDATION_MESSAGES.pastDate };
  }
  
  if (isAfter(startDate, endDate)) {
    return { isValid: false, error: VALIDATION_MESSAGES.endBeforeStart };
  }
  
  // Check if event is too long (e.g., more than 30 days)
  const daysDifference = differenceInDays(endDate, startDate);
  if (daysDifference > 30) {
    return { 
      isValid: false, 
      error: 'Event duration cannot exceed 30 days' 
    };
  }
  
  return { isValid: true };
};

// Location validation
export const validateLocation = (formData: EventFormData): ValidationResult => {
  if (formData.isVirtual) {
    if (!formData.virtualMeetingUrl || formData.virtualMeetingUrl.trim() === '') {
      return { isValid: false, error: VALIDATION_MESSAGES.virtualUrlRequired };
    }
    
    // Basic URL validation
    try {
      new URL(formData.virtualMeetingUrl);
    } catch {
      return { isValid: false, error: VALIDATION_MESSAGES.invalidUrl };
    }
    
    return { isValid: true };
  }
  
  // Physical location validation
  if (!formData.locationName || formData.locationName.trim() === '') {
    return { isValid: false, error: 'Location name is required' };
  }
  
  if (!formData.address || formData.address.trim() === '') {
    return { isValid: false, error: 'Street address is required' };
  }
  
  if (!formData.city || formData.city.trim() === '') {
    return { isValid: false, error: 'City is required' };
  }
  
  if (!formData.state || formData.state.trim() === '') {
    return { isValid: false, error: 'State is required' };
  }
  
  if (!formData.zipCode || formData.zipCode.trim() === '') {
    return { isValid: false, error: 'ZIP code is required' };
  }
  
  // ZIP code format validation
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(formData.zipCode)) {
    return { isValid: false, error: 'Invalid ZIP code format' };
  }
  
  return { isValid: true };
};

// Capacity validation
export const validateCapacity = (
  hasCapacityLimit: boolean, 
  maxCapacity?: number
): ValidationResult => {
  if (!hasCapacityLimit) {
    return { isValid: true };
  }
  
  if (!maxCapacity || maxCapacity <= 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.capacityTooLow };
  }
  
  if (maxCapacity > FIELD_LIMITS.capacity.max) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.capacityTooHigh(FIELD_LIMITS.capacity.max) 
    };
  }
  
  return { isValid: true };
};

// Ticket price validation
export const validateTicketPrice = (
  requiresPayment: boolean, 
  ticketPrice?: number
): ValidationResult => {
  if (!requiresPayment) {
    return { isValid: true };
  }
  
  if (!ticketPrice || ticketPrice < 0) {
    return { isValid: false, error: 'Ticket price is required' };
  }
  
  if (ticketPrice > FIELD_LIMITS.ticketPrice.max) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.priceTooHigh(FIELD_LIMITS.ticketPrice.max) 
    };
  }
  
  return { isValid: true };
};

// Keywords validation
export const validateKeywords = (keywords: string[]): ValidationResult => {
  if (keywords.length > FIELD_LIMITS.keywords.max) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.tooManyKeywords(FIELD_LIMITS.keywords.max) 
    };
  }
  
  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string | undefined): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: VALIDATION_MESSAGES.invalidEmail };
  }
  
  return { isValid: true };
};

// Phone validation
export const validatePhone = (phone: string | undefined): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Phone is optional
  }
  
  // Remove all non-digits for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
    return { isValid: false, error: VALIDATION_MESSAGES.invalidPhone };
  }
  
  return { isValid: true };
};

// Age restriction validation
export const validateAgeRestriction = (
  isAgeRestricted: boolean, 
  minimumAge?: number
): ValidationResult => {
  if (!isAgeRestricted) {
    return { isValid: true };
  }
  
  if (!minimumAge || minimumAge < FIELD_LIMITS.minimumAge.min) {
    return { isValid: false, error: 'Minimum age is required' };
  }
  
  if (minimumAge > FIELD_LIMITS.minimumAge.max) {
    return { 
      isValid: false, 
      error: `Minimum age cannot exceed ${FIELD_LIMITS.minimumAge.max}` 
    };
  }
  
  return { isValid: true };
};

// Step validation
export const validateStep = (
  step: number, 
  formData: EventFormData,
  isEditMode: boolean = false
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  switch (step) {
    case 0: // Event Type
      if (!formData.eventType) {
        errors.eventType = VALIDATION_MESSAGES.required;
      }
      break;
      
    case 1: // Basic Info
      const titleResult = validateTitle(formData.title);
      if (!titleResult.isValid) {
        errors.title = titleResult.error!;
      }
      
      const descResult = validateDescription(formData.description);
      if (!descResult.isValid) {
        errors.description = descResult.error!;
      }
      
      const keywordsResult = validateKeywords(formData.keywords);
      if (!keywordsResult.isValid) {
        errors.keywords = keywordsResult.error!;
      }
      break;
      
    case 2: // Date & Time
      const dateResult = validateDates(formData.startDate, formData.endDate, isEditMode);
      if (!dateResult.isValid) {
        errors.dates = dateResult.error!;
      }
      break;
      
    case 3: // Location
      const locationResult = validateLocation(formData);
      if (!locationResult.isValid) {
        errors.location = locationResult.error!;
      }
      break;
      
    case 4: // Attendance
      const capacityResult = validateCapacity(formData.hasCapacityLimit, formData.maxCapacity);
      if (!capacityResult.isValid) {
        errors.capacity = capacityResult.error!;
      }
      
      const priceResult = validateTicketPrice(formData.requiresPayment, formData.ticketPrice);
      if (!priceResult.isValid) {
        errors.ticketPrice = priceResult.error!;
      }
      
      const ageResult = validateAgeRestriction(formData.isAgeRestricted, formData.minimumAge);
      if (!ageResult.isValid) {
        errors.ageRestriction = ageResult.error!;
      }
      break;
      
    case 5: // Images (optional)
    case 6: // Boost (optional)
    case 7: // Review
      // No validation needed for these steps
      break;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Full form validation
export const validateForm = (
  formData: EventFormData,
  isEditMode: boolean = false
): { isValid: boolean; errors: Record<string, string> } => {
  const allErrors: Record<string, string> = {};
  
  // Validate all steps
  for (let step = 0; step < 5; step++) {
    const stepValidation = validateStep(step, formData, isEditMode);
    Object.assign(allErrors, stepValidation.errors);
  }
  
  // Additional validations
  const emailResult = validateEmail(formData.contactEmail);
  if (!emailResult.isValid) {
    allErrors.contactEmail = emailResult.error!;
  }
  
  const phoneResult = validatePhone(formData.contactPhone);
  if (!phoneResult.isValid) {
    allErrors.contactPhone = phoneResult.error!;
  }
  
  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
};

// Check if form data is valid for submission
export const isFormValid = (formData: EventFormData, isEditMode: boolean = false): boolean => {
  const { isValid } = validateForm(formData, isEditMode);
  return isValid;
};