import { Page } from '@playwright/test';
import { CustomerData } from '../fixtures/page-fixtures';

export class AuthHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Login with customer credentials
   */
  async login(customer: CustomerData) {
    await this.page.goto('/account/login');
    
    // Fill login form
    await this.page.locator('input[name="email"], input[type="email"]').fill(customer.email);
    await this.page.locator('input[name="password"], input[type="password"]').fill(customer.password);
    
    // Submit form
    await this.page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').click();
    
    // Wait for navigation
    await this.page.waitForLoadState('networkidle');
    
    // Verify login success
    return await this.isLoggedIn();
  }

  /**
   * Logout the current customer
   */
  async logout() {
    // Navigate to account page or look for logout link
    const logoutLink = this.page.locator('a:has-text("Logout"), a:has-text("Sign out"), [data-testid="logout"]').first();
    
    if (await logoutLink.isVisible()) {
      await logoutLink.click();
      await this.page.waitForLoadState('networkidle');
    } else {
      // Try to navigate to logout URL directly
      await this.page.goto('/account/logout');
      await this.page.waitForLoadState('networkidle');
    }
    
    return await this.isLoggedOut();
  }

  /**
   * Register a new customer account
   */
  async register(customer: CustomerData) {
    await this.page.goto('/account/register');
    
    // Fill registration form
    await this.page.locator('input[name="firstName"], input[name="first_name"]').fill(customer.firstName);
    await this.page.locator('input[name="lastName"], input[name="last_name"]').fill(customer.lastName);
    await this.page.locator('input[name="email"], input[type="email"]').fill(customer.email);
    await this.page.locator('input[name="password"], input[type="password"]').fill(customer.password);
    
    // Handle password confirmation if present
    const confirmPasswordField = this.page.locator('input[name="confirmPassword"], input[name="password_confirmation"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(customer.password);
    }
    
    // Submit form
    await this.page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Register")').click();
    
    // Wait for navigation
    await this.page.waitForLoadState('networkidle');
    
    return await this.isLoggedIn();
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Look for account-specific elements that indicate logged in state
      const loggedInIndicators = [
        'a:has-text("Account")',
        'a:has-text("Profile")',
        'a:has-text("My Account")',
        'a:has-text("Logout")',
        'a:has-text("Sign out")',
        '[data-testid="account-menu"]',
        '.account-nav',
        '.user-menu'
      ];

      for (const indicator of loggedInIndicators) {
        if (await this.page.locator(indicator).isVisible()) {
          return true;
        }
      }

      // Check if we're on an account page
      const url = this.page.url();
      if (url.includes('/account') && !url.includes('/login') && !url.includes('/register')) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is currently logged out
   */
  async isLoggedOut(): Promise<boolean> {
    return !(await this.isLoggedIn());
  }

  /**
   * Clear all authentication cookies and local storage
   */
  async clearAuth() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Navigate to account page (will redirect to login if not authenticated)
   */
  async goToAccount() {
    await this.page.goto('/account');
    await this.page.waitForLoadState('networkidle');
    
    return await this.isLoggedIn();
  }

  /**
   * Get current customer information from account page
   */
  async getCustomerInfo() {
    if (!(await this.isLoggedIn())) {
      throw new Error('Must be logged in to get customer info');
    }

    await this.page.goto('/account');
    await this.page.waitForLoadState('networkidle');

    try {
      const firstName = await this.page.locator('input[name="firstName"], [data-testid="first-name"]').inputValue();
      const lastName = await this.page.locator('input[name="lastName"], [data-testid="last-name"]').inputValue();
      const email = await this.page.locator('input[name="email"], [data-testid="email"]').inputValue();

      return {
        firstName,
        lastName,
        email,
      };
    } catch {
      // If inputs aren't available, try to get from display elements
      const name = await this.page.locator('.customer-name, [data-testid="customer-name"]').textContent();
      const email = await this.page.locator('.customer-email, [data-testid="customer-email"]').textContent();

      return {
        name: name?.trim(),
        email: email?.trim(),
      };
    }
  }

  /**
   * Update customer profile information
   */
  async updateProfile(updates: Partial<CustomerData>) {
    if (!(await this.isLoggedIn())) {
      throw new Error('Must be logged in to update profile');
    }

    await this.page.goto('/account/profile');
    await this.page.waitForLoadState('networkidle');

    if (updates.firstName) {
      await this.page.locator('input[name="firstName"], [data-testid="first-name"]').fill(updates.firstName);
    }

    if (updates.lastName) {
      await this.page.locator('input[name="lastName"], [data-testid="last-name"]').fill(updates.lastName);
    }

    if (updates.email) {
      await this.page.locator('input[name="email"], [data-testid="email"]').fill(updates.email);
    }

    // Submit the form
    await this.page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').click();
    await this.page.waitForLoadState('networkidle');

    // Check for success message
    const successMessage = this.page.locator('.success, .alert-success, [data-testid="success-message"]');
    return await successMessage.isVisible();
  }
}