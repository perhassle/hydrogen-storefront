import { Page, expect } from '@playwright/test';

export class VisualHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Take a full page screenshot
   */
  async takeFullPageScreenshot(name: string, options?: {
    animations?: 'disabled' | 'allow';
    clip?: { x: number; y: number; width: number; height: number };
    fullPage?: boolean;
    mask?: any[];
    threshold?: number;
  }) {
    await expect(this.page).toHaveScreenshot(`${name}.png`, {
      fullPage: options?.fullPage ?? true,
      animations: options?.animations ?? 'disabled',
      clip: options?.clip,
      mask: options?.mask,
      threshold: options?.threshold ?? 0.3,
    });
  }

  /**
   * Take an element screenshot
   */
  async takeElementScreenshot(selector: string, name: string, options?: {
    animations?: 'disabled' | 'allow';
    threshold?: number;
  }) {
    const element = this.page.locator(selector);
    await expect(element).toHaveScreenshot(`${name}.png`, {
      animations: options?.animations ?? 'disabled',
      threshold: options?.threshold ?? 0.3,
    });
  }

  /**
   * Compare visual state across different viewports
   */
  async compareAcrossViewports(
    name: string,
    viewports: Array<{ width: number; height: number; name: string }>,
    action?: () => Promise<void>
  ) {
    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(500); // Allow layout to settle
      
      if (action) {
        await action();
      }
      
      await this.takeFullPageScreenshot(`${name}-${viewport.name}`, {
        fullPage: true,
      });
    }
  }

  /**
   * Test responsive design at different breakpoints
   */
  async testResponsiveDesign(name: string, action?: () => Promise<void>) {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 1920, height: 1080, name: 'large-desktop' },
    ];

    await this.compareAcrossViewports(name, viewports, action);
  }

  /**
   * Wait for all images to load
   */
  async waitForImagesLoad() {
    await this.page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete && img.naturalHeight !== 0);
    }, { timeout: 10000 });
  }

  /**
   * Hide dynamic elements before screenshot
   */
  async hideDynamicElements() {
    // Hide elements that change frequently (timestamps, random content, etc.)
    await this.page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        .timestamp,
        .current-time,
        .cart-count,
        .dynamic-content,
        [data-dynamic="true"] {
          visibility: hidden !important;
        }
        
        /* Hide animations for consistent screenshots */
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  }

  /**
   * Mask sensitive data in screenshots
   */
  async maskSensitiveData() {
    const sensitiveSelectors = [
      '[data-testid="customer-email"]',
      '.customer-email',
      '.customer-phone',
      '.credit-card',
      '.address-details',
      '[data-sensitive="true"]',
    ];

    return sensitiveSelectors.map(selector => this.page.locator(selector));
  }

  /**
   * Prepare page for consistent visual testing
   */
  async prepareForVisualTesting() {
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle');
    
    // Wait for images to load
    await this.waitForImagesLoad();
    
    // Hide dynamic elements
    await this.hideDynamicElements();
    
    // Wait for any final layout shifts
    await this.page.waitForTimeout(1000);
  }

  /**
   * Test hover states
   */
  async testHoverStates(selector: string, name: string) {
    const element = this.page.locator(selector);
    
    // Take screenshot of default state
    await this.takeElementScreenshot(selector, `${name}-default`);
    
    // Hover and take screenshot
    await element.hover();
    await this.page.waitForTimeout(500); // Wait for hover animation
    await this.takeElementScreenshot(selector, `${name}-hover`);
  }

  /**
   * Test focus states
   */
  async testFocusStates(selector: string, name: string) {
    const element = this.page.locator(selector);
    
    // Take screenshot of default state
    await this.takeElementScreenshot(selector, `${name}-default`);
    
    // Focus and take screenshot
    await element.focus();
    await this.page.waitForTimeout(300); // Wait for focus styles
    await this.takeElementScreenshot(selector, `${name}-focus`);
  }

  /**
   * Test loading states
   */
  async testLoadingStates(name: string, triggerAction: () => Promise<void>) {
    // Take before state
    await this.takeFullPageScreenshot(`${name}-before`);
    
    // Trigger action that causes loading
    await triggerAction();
    
    // Take loading state (if loading indicators are present)
    const loadingIndicators = [
      '.loading',
      '.spinner',
      '[data-testid="loading"]',
      '.skeleton',
    ];
    
    for (const indicator of loadingIndicators) {
      if (await this.page.locator(indicator).isVisible()) {
        await this.takeFullPageScreenshot(`${name}-loading`);
        break;
      }
    }
    
    // Wait for loading to complete
    await this.page.waitForLoadState('networkidle');
    
    // Take after state
    await this.takeFullPageScreenshot(`${name}-after`);
  }

  /**
   * Test form validation states
   */
  async testFormValidation(formSelector: string, name: string) {
    const form = this.page.locator(formSelector);
    
    // Take empty form state
    await this.takeElementScreenshot(formSelector, `${name}-empty`);
    
    // Try to submit empty form to trigger validation
    await form.locator('button[type="submit"]').click();
    await this.page.waitForTimeout(500);
    
    // Take validation error state
    await this.takeElementScreenshot(formSelector, `${name}-validation-errors`);
  }

  /**
   * Test modal/overlay states
   */
  async testModalStates(triggerSelector: string, modalSelector: string, name: string) {
    // Take closed state
    await this.takeFullPageScreenshot(`${name}-closed`);
    
    // Open modal
    await this.page.locator(triggerSelector).click();
    await this.page.waitForTimeout(500); // Wait for animation
    
    // Take open state
    await this.takeFullPageScreenshot(`${name}-open`);
    
    // Take modal-only screenshot
    await this.takeElementScreenshot(modalSelector, `${name}-modal`);
  }

  /**
   * Test dark/light mode if supported
   */
  async testThemes(name: string, action?: () => Promise<void>) {
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
      // Try to set theme through various methods
      await this.page.evaluate((theme) => {
        // Try localStorage
        localStorage.setItem('theme', theme);
        
        // Try data attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Try class
        document.documentElement.className = document.documentElement.className
          .replace(/theme-\w+/g, '')
          .concat(` theme-${theme}`);
      }, theme);
      
      await this.page.reload();
      await this.prepareForVisualTesting();
      
      if (action) {
        await action();
      }
      
      await this.takeFullPageScreenshot(`${name}-${theme}-theme`);
    }
  }
}