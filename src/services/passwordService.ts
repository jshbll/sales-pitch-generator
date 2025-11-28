import { apiService } from './api';

/**
 * Service for handling password-related operations
 */
export const passwordService = {
  /**
   * Change the authenticated user's password
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Promise that resolves when password is changed
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/password/change', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Request a password reset email
   * @param email User's email address
   * @returns Promise that resolves when reset email is sent
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiService.post('/password/forgot', { email });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  /**
   * Reset password using a token
   * @param token Reset token from email
   * @param password New password
   * @returns Promise that resolves when password is reset
   */
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiService.post('/password/reset', {
        token,
        password
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  /**
   * Check password strength
   * @param password Password to check
   * @returns Score from 0-100 and feedback
   */
  checkPasswordStrength(password: string): { score: number; feedback: string } {
    if (!password) {
      return { score: 0, feedback: 'Password is required' };
    }

    let score = 0;
    const feedback = [];

    // Length check
    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long');
    } else {
      score += 20;
      if (password.length >= 12) score += 10;
    }

    // Complexity checks
    if (!/[A-Z]/.test(password)) {
      feedback.push('Add uppercase letters');
    } else {
      score += 15;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Add lowercase letters');
    } else {
      score += 15;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Add numbers');
    } else {
      score += 15;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Add special characters');
    } else {
      score += 15;
    }

    // Check for common patterns
    if (/^123|password|qwerty|abc/i.test(password)) {
      feedback.push('Avoid common patterns');
      score -= 20;
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      feedback: feedback.length > 0 ? feedback.join('. ') : 'Strong password'
    };
  }
};

export default passwordService;
