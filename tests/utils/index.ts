// Utility exports
export { AuthHelpers } from './auth-helpers';
export { ApiHelpers } from './api-helpers';
export { VisualHelpers } from './visual-helpers';

// Utility factory for easy instantiation
import { Page } from '@playwright/test';
import { AuthHelpers } from './auth-helpers';
import { ApiHelpers } from './api-helpers';
import { VisualHelpers } from './visual-helpers';

export class UtilityFactory {
  static createAuthHelpers(page: Page): AuthHelpers {
    return new AuthHelpers(page);
  }

  static createApiHelpers(page: Page): ApiHelpers {
    return new ApiHelpers(page);
  }

  static createVisualHelpers(page: Page): VisualHelpers {
    return new VisualHelpers(page);
  }
}

// Common utility functions
export const testUtils = {
  /**
   * Generate random test data
   */
  generateTestEmail: () => `test.${Date.now()}@example.com`,
  generateTestUser: () => ({
    email: `test.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  }),
  
  /**
   * Wait utility
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Retry utility
   */
  retry: async <T>(
    fn: () => Promise<T>,
    options: { maxAttempts?: number; delay?: number } = {}
  ): Promise<T> => {
    const { maxAttempts = 3, delay = 1000 } = options;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await testUtils.wait(delay);
      }
    }
    
    throw new Error('Retry failed');
  },
  
  /**
   * Random selection utility
   */
  randomChoice: <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  },
  
  /**
   * Format currency for testing
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },
  
  /**
   * Clean text for comparison
   */
  cleanText: (text: string): string => {
    return text.replace(/\s+/g, ' ').trim();
  },
  
  /**
   * Extract number from text
   */
  extractNumber: (text: string): number => {
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  },
  
  /**
   * Check if URL matches pattern
   */
  urlMatches: (url: string, pattern: string): boolean => {
    return new RegExp(pattern).test(url);
  },
  
  /**
   * Generate random string
   */
  randomString: (length: number = 10): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
};

export default {
  AuthHelpers,
  ApiHelpers,
  VisualHelpers,
  UtilityFactory,
  testUtils,
};