import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // Navigation elements present on all pages
  get cartBadge() {
    return this.page.locator('.cart-badge, [data-testid="cart-badge"]').first();
  }

  get mainNavigation() {
    return this.page.locator('nav[role="navigation"], .main-nav, [data-testid="main-nav"]').first();
  }

  get searchInput() {
    return this.page.locator('input[type="search"], input[name="search"], [data-testid="search-input"]').first();
  }

  get mobileMenuToggle() {
    return this.page.locator('.mobile-menu-toggle, [data-testid="mobile-menu-toggle"], button[aria-label*="menu" i]').first();
  }

  async openCart() {
    await this.cartBadge.click();
    await this.page.waitForTimeout(500); // Wait for animation
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForPageLoad();
  }

  async getCartCount(): Promise<number> {
    try {
      const text = await this.cartBadge.textContent();
      if (!text) return 0;
      const match = text.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    } catch {
      return 0;
    }
  }

  // Utility methods for common interactions
  async clickLink(text: string) {
    await this.page.locator(`a:has-text("${text}")`).first().click();
    await this.waitForPageLoad();
  }

  async clickButton(text: string) {
    await this.page.locator(`button:has-text("${text}")`).first().click();
  }

  // Responsive testing helpers
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }
}