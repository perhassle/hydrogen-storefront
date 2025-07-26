import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async goto(handle: string) {
    await super.goto(`/products/${handle}`);
  }

  // Product information elements
  get productTitle() {
    return this.page.locator('h1, .product-title, [data-testid="product-title"]').first();
  }

  get productPrice() {
    return this.page.locator('.product-price, [data-testid="product-price"], .price').first();
  }

  get productDescription() {
    return this.page.locator('.product-description, [data-testid="product-description"], .description').first();
  }

  get productImage() {
    return this.page.locator('.product-image img, [data-testid="product-image"] img, .product-gallery img').first();
  }

  get productGallery() {
    return this.page.locator('.product-gallery, [data-testid="product-gallery"], .product-images');
  }

  get galleryImages() {
    return this.productGallery.locator('img');
  }

  // Variant selection elements
  get variantOptions() {
    return this.page.locator('.variant-option, [data-testid="variant-option"], .product-option');
  }

  get sizeSelector() {
    return this.page.locator('select[name*="size"], [data-testid="size-selector"]').first();
  }

  get colorSelector() {
    return this.page.locator('select[name*="color"], [data-testid="color-selector"]').first();
  }

  get variantButtons() {
    return this.page.locator('.variant-button, [data-testid="variant-button"], button[data-variant]');
  }

  // Quantity and add to cart elements
  get quantityInput() {
    return this.page.locator('input[type="number"], input[name*="quantity"], [data-testid="quantity-input"]').first();
  }

  get quantityIncrease() {
    return this.page.locator('button[data-action="increase"], .qty-increase, [data-testid="qty-increase"]').first();
  }

  get quantityDecrease() {
    return this.page.locator('button[data-action="decrease"], .qty-decrease, [data-testid="qty-decrease"]').first();
  }

  get addToCartButton() {
    return this.page.locator(
      'button:has-text("Add to cart"), button:has-text("Add to Cart"), [data-testid="add-to-cart"], button[name="add"]'
    ).first();
  }

  get buyNowButton() {
    return this.page.locator('button:has-text("Buy now"), button:has-text("Buy Now"), [data-testid="buy-now"]').first();
  }

  // Product information sections
  get productTabs() {
    return this.page.locator('.product-tabs, [data-testid="product-tabs"]').first();
  }

  get reviewsSection() {
    return this.page.locator('.reviews, [data-testid="reviews"], .product-reviews').first();
  }

  get relatedProducts() {
    return this.page.locator('.related-products, [data-testid="related-products"], .recommendations');
  }

  get relatedProductCards() {
    return this.relatedProducts.locator('.product-card, [data-testid="product-card"]');
  }

  // Breadcrumbs
  get breadcrumbs() {
    return this.page.locator('.breadcrumbs, [data-testid="breadcrumbs"], nav[aria-label="Breadcrumb"]').first();
  }

  // Actions
  async selectVariant(option: string) {
    const variantButtons = await this.variantButtons.all();
    for (const button of variantButtons) {
      const text = await button.textContent();
      if (text && text.trim().toLowerCase() === option.toLowerCase()) {
        await button.click();
        await this.page.waitForTimeout(500); // Wait for variant to update
        break;
      }
    }
  }

  async selectSize(size: string) {
    if (await this.sizeSelector.isVisible()) {
      await this.sizeSelector.selectOption({ label: size });
    }
  }

  async selectColor(color: string) {
    if (await this.colorSelector.isVisible()) {
      await this.colorSelector.selectOption({ label: color });
    }
  }

  async setQuantity(quantity: number) {
    if (await this.quantityInput.isVisible()) {
      await this.quantityInput.fill(quantity.toString());
    }
  }

  async increaseQuantity() {
    if (await this.quantityIncrease.isVisible()) {
      await this.quantityIncrease.click();
    }
  }

  async decreaseQuantity() {
    if (await this.quantityDecrease.isVisible()) {
      await this.quantityDecrease.click();
    }
  }

  async addToCart() {
    const cartCountBefore = await this.getCartCount();
    await this.addToCartButton.click();
    
    // Wait for cart to update
    await this.page.waitForTimeout(2000);
    
    // Verify cart count increased
    const cartCountAfter = await this.getCartCount();
    return cartCountAfter > cartCountBefore;
  }

  async buyNow() {
    if (await this.buyNowButton.isVisible()) {
      await this.buyNowButton.click();
      await this.waitForPageLoad();
    }
  }

  async clickRelatedProduct(index: number = 0) {
    const products = await this.relatedProductCards.all();
    if (products[index]) {
      await products[index].click();
      await this.waitForPageLoad();
    }
  }

  async viewImage(index: number = 0) {
    const images = await this.galleryImages.all();
    if (images[index]) {
      await images[index].click();
      await this.page.waitForTimeout(500);
    }
  }

  // Validation methods
  async isLoaded(): Promise<boolean> {
    try {
      await this.productTitle.waitFor({ timeout: 10000 });
      await this.productPrice.waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getProductInfo() {
    return {
      title: await this.productTitle.textContent(),
      price: await this.productPrice.textContent(),
      description: await this.productDescription.textContent(),
    };
  }

  async getAvailableVariants(): Promise<string[]> {
    const buttons = await this.variantButtons.all();
    const variants = [];
    
    for (const button of buttons) {
      const text = await button.textContent();
      if (text) {
        variants.push(text.trim());
      }
    }
    
    return variants;
  }

  async isAddToCartEnabled(): Promise<boolean> {
    return await this.addToCartButton.isEnabled();
  }

  async getQuantity(): Promise<number> {
    try {
      const value = await this.quantityInput.inputValue();
      return parseInt(value, 10) || 1;
    } catch {
      return 1;
    }
  }
}