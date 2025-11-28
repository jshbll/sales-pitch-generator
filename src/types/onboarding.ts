/**
 * Onboarding related types
 */

// Define the onboarding status type with granular levels
export enum OnboardingStatus {
  PENDING = 'pending',                         // No business profile created
  PARTIALLY_COMPLETE = 'partially_complete',   // Has business name only (minimum to access dashboard)
  BASELINE_COMPLETE = 'baseline_complete',     // Has minimum fields for promotion/event creation
  FULLY_COMPLETE = 'fully_complete',           // All fields completed (100% profile score)
  
  // Legacy statuses for backward compatibility
  IN_PROGRESS = 'in_progress',    // Deprecated - use PARTIALLY_COMPLETE
  COMPLETED = 'completed',         // Deprecated - use FULLY_COMPLETE
}
