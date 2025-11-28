/**
 * businessValidation.ts
 * Utility functions for business-related form validation
 */
import { BusinessCategory } from '../../types/business.types';

/**
 * Interface for business category validation results
 */
export interface CategoryValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates if a business category has been selected
 * @param category The selected category ID
 * @returns Validation result with isValid flag and optional error message
 */
export const validateCategorySelection = (
  category?: string
): CategoryValidationResult => {
  if (!category) {
    return {
      isValid: false,
      errorMessage: 'Please select a business category',
    };
  }
  
  return { isValid: true };
};

/**
 * Validates if a subcategory has been selected when required
 * @param selectedCategory The currently selected category object
 * @param subcategory The selected subcategory ID
 * @returns Validation result with isValid flag and optional error message
 */
export const validateSubcategorySelection = (
  selectedCategory: BusinessCategory | null | undefined,
  subcategory?: string
): CategoryValidationResult => {
  // If no category is selected or selected category has no subcategories, validation passes
  if (!selectedCategory || !selectedCategory.subcategories || selectedCategory.subcategories.length === 0) {
    return { isValid: true };
  }
  
  // If subcategories exist but none selected, validation fails
  if (!subcategory) {
    return {
      isValid: false,
      errorMessage: 'Please select a subcategory',
    };
  }
  
  return { isValid: true };
};

/**
 * Validates if a custom category has been entered when "Other" is selected
 * @param category The selected category ID
 * @param customCategory The custom category string
 * @returns Validation result with isValid flag and optional error message
 */
export const validateCustomCategory = (
  category?: string,
  customCategory?: string
): CategoryValidationResult => {
  // Only validate custom category if "Other" is selected
  if (category === 'Other') {
    if (!customCategory || !customCategory.trim()) {
      return {
        isValid: false,
        errorMessage: 'Please specify your business category',
      };
    }
  }
  
  return { isValid: true };
};

/**
 * Combines all business category validations
 * @param data Business data containing category and subcategory
 * @param selectedCategory The currently selected category object
 * @returns Object with validation results for each field and overall validity
 */
export const validateBusinessCategoryStep = (
  data: {
    category?: string;
    subcategory?: string;
  },
  selectedCategory: BusinessCategory | null
): {
  categoryValid: CategoryValidationResult;
  subcategoryValid: CategoryValidationResult;
  customCategoryValid: CategoryValidationResult;
  isValid: boolean;
} => {
  const categoryValid = validateCategorySelection(data.category);
  const subcategoryValid = validateSubcategorySelection(selectedCategory, data.subcategory);
  const customCategoryValid = validateCustomCategory(data.category, data.subcategory);
  
  const isValid = categoryValid.isValid && subcategoryValid.isValid && customCategoryValid.isValid;
  
  return {
    categoryValid,
    subcategoryValid,
    customCategoryValid,
    isValid
  };
};
