import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async goto() {
    await super.goto('/');
  }

  // Hero section elements
  get heroSection() {
    return this.page.locator('.hero, [data-testid="hero"], .hero-section').first();
  }

  get heroTitle() {
    return this.heroSection.locator('h1').first();
  }

  get heroSubtitle() {
    return this.heroSection.locator('p, .subtitle, .hero-subtitle').first();
  }

  // Featured collections section
  get featuredCollections() {
    return this.page.locator('.featured-collections, [data-testid="featured-collections"]').first();
  }

  get collectionLinks() {
    return this.page.locator('a[href*="/collections/"]');
  }

  get productLinks() {
    return this.page.locator('a[href*="/products/"]');
  }

  // Featured products section
  get featuredProducts() {
    return this.page.locator('.featured-products, [data-testid="featured-products"]').first();
  }

  get productCards() {
    return this.page.locator('.product-card, [data-testid="product-card"], .product-item');
  }

  // Newsletter section
  get newsletterSection() {
    return this.page.locator('.newsletter, [data-testid="newsletter"]').first();
  }

  get newsletterInput() {
    return this.newsletterSection.locator('input[type="email"]').first();
  }

  get newsletterSubmit() {
    return this.newsletterSection.locator('button[type="submit"], input[type="submit"]').first();
  }

  // Footer
  get footer() {
    return this.page.locator('footer').first();
  }

  get footerLinks() {
    return this.footer.locator('a');
  }

  // Actions specific to homepage
  async clickFeaturedCollection(index: number = 0) {
    const collections = await this.collectionLinks.all();
    if (collections[index]) {
      await collections[index].click();
      await this.waitForPageLoad();
    }
  }

  async clickFeaturedProduct(index: number = 0) {
    const products = await this.productCards.all();
    if (products[index]) {
      await products[index].click();
      await this.waitForPageLoad();
    }
  }

  async subscribeToNewsletter(email: string) {
    if (await this.newsletterInput.isVisible()) {
      await this.newsletterInput.fill(email);
      await this.newsletterSubmit.click();
    }
  }

  async getAvailableCollections(): Promise<string[]> {
    const links = await this.collectionLinks.all();
    const collections = [];
    
    for (const link of links) {
      const text = await link.textContent();
      if (text) {
        collections.push(text.trim());
      }
    }
    
    return collections;
  }

  async getAvailableProducts(): Promise<string[]> {
    const cards = await this.productCards.all();
    const products = [];
    
    for (const card of cards) {
      const title = await card.locator('h2, h3, .product-title, [data-testid="product-title"]').first().textContent();
      if (title) {
        products.push(title.trim());
      }
    }
    
    return products;
  }

  // Validation methods
  async isLoaded(): Promise<boolean> {
    try {
      // Check if key elements are present
      await this.page.waitForSelector('main, [role="main"]', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async hasContent(): Promise<boolean> {
    const hasCollections = await this.collectionLinks.count() > 0;
    const hasProducts = await this.productCards.count() > 0;
    return hasCollections || hasProducts;
  }
}