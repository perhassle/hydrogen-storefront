import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async goto() {
    await super.goto('/cart');
  }

  // Cart main elements
  get cartMain() {
    return this.page.locator('.cart-main, [data-testid="cart-main"], main .cart').first();
  }

  get cartTitle() {
    return this.page.locator('h1, .cart-title, [data-testid="cart-title"]').first();
  }

  get emptyCartMessage() {
    return this.page.locator('.empty-cart, [data-testid="empty-cart"], .cart-empty').first();
  }

  get continueShoppingLink() {
    return this.page.locator('a:has-text("Continue shopping"), a:has-text("Continue Shopping"), [data-testid="continue-shopping"]').first();
  }

  // Cart line items
  get cartLineItems() {
    return this.page.locator('.cart-line-item, [data-testid="cart-line-item"], .cart-item');
  }

  get cartItemImages() {
    return this.page.locator('.cart-line-item img, [data-testid="cart-item-image"]');
  }

  get cartItemTitles() {
    return this.page.locator('.cart-line-item .title, [data-testid="cart-item-title"], .cart-item-title');
  }

  get cartItemPrices() {
    return this.page.locator('.cart-line-item .price, [data-testid="cart-item-price"], .cart-item-price');
  }

  // Quantity controls
  get quantityInputs() {
    return this.page.locator('.cart-line-item input[type="number"], [data-testid="cart-quantity"]');
  }

  get quantityIncreaseButtons() {
    return this.page.locator('.cart-line-item button[data-action="increase"], [data-testid="qty-increase"]');
  }

  get quantityDecreaseButtons() {
    return this.page.locator('.cart-line-item button[data-action="decrease"], [data-testid="qty-decrease"]');
  }

  get updateButtons() {
    return this.page.locator('button:has-text("Update"), button[name*="update"], [data-testid="update-cart"]');
  }

  get removeButtons() {
    return this.page.locator('button:has-text("Remove"), button[name*="remove"], [data-testid="remove-item"]');
  }

  // Cart summary
  get cartSummary() {
    return this.page.locator('.cart-summary, [data-testid="cart-summary"]').first();
  }

  get subtotal() {
    return this.cartSummary.locator('.subtotal, [data-testid="subtotal"]').first();
  }

  get taxes() {
    return this.cartSummary.locator('.taxes, [data-testid="taxes"]').first();
  }

  get shipping() {
    return this.cartSummary.locator('.shipping, [data-testid="shipping"]').first();
  }

  get total() {
    return this.cartSummary.locator('.total, [data-testid="total"]').first();
  }

  // Checkout elements
  get checkoutButton() {
    return this.page.locator('button:has-text("Checkout"), a:has-text("Checkout"), [data-testid="checkout"]').first();
  }

  get paypalButton() {
    return this.page.locator('[data-testid="paypal-button"], .paypal-button').first();
  }

  get applePay() {
    return this.page.locator('[data-testid="apple-pay"], .apple-pay-button').first();
  }

  // Discount codes
  get discountSection() {
    return this.page.locator('.discount-section, [data-testid="discount-section"]').first();
  }

  get discountInput() {
    return this.discountSection.locator('input[type="text"], input[name*="discount"]').first();
  }

  get applyDiscountButton() {
    return this.discountSection.locator('button[type="submit"], button:has-text("Apply")').first();
  }

  // Actions
  async updateQuantity(itemIndex: number, quantity: number) {
    const quantityInputs = await this.quantityInputs.all();
    if (quantityInputs[itemIndex]) {
      await quantityInputs[itemIndex].fill(quantity.toString());
      
      // Look for update button and click it
      const updateButtons = await this.updateButtons.all();
      if (updateButtons.length > 0) {
        await updateButtons[0].click();
      }
      
      await this.page.waitForTimeout(1000); // Wait for cart to update
    }
  }

  async increaseQuantity(itemIndex: number) {
    const increaseButtons = await this.quantityIncreaseButtons.all();
    if (increaseButtons[itemIndex]) {
      await increaseButtons[itemIndex].click();
      await this.page.waitForTimeout(1000);
    }
  }

  async decreaseQuantity(itemIndex: number) {
    const decreaseButtons = await this.quantityDecreaseButtons.all();
    if (decreaseButtons[itemIndex]) {
      await decreaseButtons[itemIndex].click();
      await this.page.waitForTimeout(1000);
    }
  }

  async removeItem(itemIndex: number) {
    const removeButtons = await this.removeButtons.all();
    if (removeButtons[itemIndex]) {
      await removeButtons[itemIndex].click();
      await this.page.waitForTimeout(1000);
    }
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await this.waitForPageLoad();
  }

  async applyDiscountCode(code: string) {
    if (await this.discountInput.isVisible()) {
      await this.discountInput.fill(code);
      await this.applyDiscountButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  async continueShopping() {
    if (await this.continueShoppingLink.isVisible()) {
      await this.continueShoppingLink.click();
      await this.waitForPageLoad();
    }
  }

  // Validation methods
  async isEmpty(): Promise<boolean> {
    return await this.emptyCartMessage.isVisible();
  }

  async getItemCount(): Promise<number> {
    return await this.cartLineItems.count();
  }

  async getCartItems() {
    const items = [];
    const lineItems = await this.cartLineItems.all();
    
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      const title = await item.locator('.title, [data-testid="cart-item-title"]').textContent();
      const price = await item.locator('.price, [data-testid="cart-item-price"]').textContent();
      const quantity = await item.locator('input[type="number"]').inputValue();
      
      items.push({
        title: title?.trim(),
        price: price?.trim(),
        quantity: parseInt(quantity || '1', 10),
      });
    }
    
    return items;
  }

  async getTotalPrice(): Promise<string> {
    const totalText = await this.total.textContent();
    return totalText?.trim() || '';
  }

  async getSubtotal(): Promise<string> {
    const subtotalText = await this.subtotal.textContent();
    return subtotalText?.trim() || '';
  }

  async isCheckoutEnabled(): Promise<boolean> {
    return await this.checkoutButton.isEnabled();
  }

  async hasDiscountSection(): Promise<boolean> {
    return await this.discountSection.isVisible();
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.cartTitle.waitFor({ timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  // Cart manipulation helpers
  async clearCart() {
    const itemCount = await this.getItemCount();
    
    // Remove all items one by one
    for (let i = itemCount - 1; i >= 0; i--) {
      await this.removeItem(i);
      await this.page.waitForTimeout(1000);
    }
  }

  async updateAllQuantities(quantity: number) {
    const itemCount = await this.getItemCount();
    
    for (let i = 0; i < itemCount; i++) {
      await this.updateQuantity(i, quantity);
    }
  }
}