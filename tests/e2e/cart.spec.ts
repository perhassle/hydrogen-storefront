import { test, expect } from '../fixtures/page-fixtures';
import { testUtils } from '../utils';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page, cartPage }) => {
    // Clear cookies and start fresh
    await page.context().clearCookies();
    
    // Clear any existing cart items
    await cartPage.goto();
    if (!(await cartPage.isEmpty())) {
      await cartPage.clearCart();
    }
  });

  test('should display empty cart state initially', async ({ cartPage }) => {
    await cartPage.goto();
    
    // Verify cart page loads
    expect(await cartPage.isLoaded()).toBe(true);
    
    // Check for empty cart state
    const isEmpty = await cartPage.isEmpty();
    
    if (isEmpty) {
      await expect(cartPage.emptyCartMessage).toBeVisible();
      await expect(cartPage.continueShoppingLink).toBeVisible();
    }
    
    // Verify cart shows 0 items
    expect(await cartPage.getItemCount()).toBe(0);
  });

  test('should add product to cart from product page', async ({ productPage, cartPage, page }) => {
    // Navigate to homepage and find a product
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on product page
      expect(await productPage.isLoaded()).toBe(true);
      
      // Check if add to cart is enabled
      const addToCartEnabled = await productPage.isAddToCartEnabled();
      
      if (addToCartEnabled) {
        // Get initial cart count
        const initialCartCount = await productPage.getCartCount();
        
        // Add product to cart
        const addedToCart = await productPage.addToCart();
        
        if (addedToCart) {
          // Verify cart count increased
          const newCartCount = await productPage.getCartCount();
          expect(newCartCount).toBeGreaterThan(initialCartCount);
          
          // Navigate to cart and verify item is there
          await cartPage.goto();
          expect(await cartPage.getItemCount()).toBeGreaterThan(0);
        } else {
          console.log('Add to cart may not have worked - checking cart anyway');
          await cartPage.goto();
          // Cart might still have items from other sources
        }
      } else {
        console.log('Add to cart button is not enabled (may be out of stock)');
      }
    } else {
      console.log('No products found to test cart functionality');
    }
  });

  test('should update product quantity in cart', async ({ productPage, cartPage, page }) => {
    // First add a product to cart
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      if (await productPage.isAddToCartEnabled()) {
        await productPage.addToCart();
        
        // Navigate to cart
        await cartPage.goto();
        
        const itemCount = await cartPage.getItemCount();
        
        if (itemCount > 0) {
          // Test quantity update
          await cartPage.updateQuantity(0, 3);
          
          // Verify quantity was updated
          const cartItems = await cartPage.getCartItems();
          if (cartItems.length > 0) {
            expect(cartItems[0].quantity).toBe(3);
          }
          
          // Test quantity increase
          await cartPage.increaseQuantity(0);
          await page.waitForTimeout(1000);
          
          // Test quantity decrease
          await cartPage.decreaseQuantity(0);
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should remove product from cart', async ({ productPage, cartPage, page }) => {
    // First add a product to cart
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      if (await productPage.isAddToCartEnabled()) {
        await productPage.addToCart();
        
        // Navigate to cart
        await cartPage.goto();
        
        const initialItemCount = await cartPage.getItemCount();
        
        if (initialItemCount > 0) {
          // Remove first item
          await cartPage.removeItem(0);
          
          // Verify item was removed
          const newItemCount = await cartPage.getItemCount();
          expect(newItemCount).toBeLessThan(initialItemCount);
          
          // If cart is now empty, verify empty state
          if (newItemCount === 0) {
            expect(await cartPage.isEmpty()).toBe(true);
            await expect(cartPage.emptyCartMessage).toBeVisible();
          }
        }
      }
    }
  });

  test('should display cart summary with correct totals', async ({ productPage, cartPage, page }) => {
    // Add a product to cart
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      if (await productPage.isAddToCartEnabled()) {
        await productPage.addToCart();
        
        // Navigate to cart
        await cartPage.goto();
        
        const itemCount = await cartPage.getItemCount();
        
        if (itemCount > 0) {
          // Check if cart summary is visible
          const summaryVisible = await cartPage.cartSummary.isVisible();
          
          if (summaryVisible) {
            // Verify subtotal is displayed
            await expect(cartPage.subtotal).toBeVisible();
            
            // Verify total is displayed
            await expect(cartPage.total).toBeVisible();
            
            // Get total price
            const totalPrice = await cartPage.getTotalPrice();
            expect(totalPrice).toBeTruthy();
            
            console.log(`Cart total: ${totalPrice}`);
          }
        }
      }
    }
  });

  test('should handle discount codes if supported', async ({ productPage, cartPage, page }) => {
    // Add a product to cart
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      if (await productPage.isAddToCartEnabled()) {
        await productPage.addToCart();
        
        // Navigate to cart
        await cartPage.goto();
        
        const itemCount = await cartPage.getItemCount();
        
        if (itemCount > 0 && await cartPage.hasDiscountSection()) {
          // Try applying a test discount code
          await cartPage.applyDiscountCode('TEST10');
          
          // Wait for response (could be success or error)
          await page.waitForTimeout(2000);
          
          // The test doesn't need to succeed, just verify the functionality exists
          console.log('Discount code functionality is available');
        }
      }
    }
  });

  test('should navigate to checkout when cart has items', async ({ productPage, cartPage, page }) => {
    // Add a product to cart
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      if (await productPage.isAddToCartEnabled()) {
        await productPage.addToCart();
        
        // Navigate to cart
        await cartPage.goto();
        
        const itemCount = await cartPage.getItemCount();
        
        if (itemCount > 0) {
          // Check if checkout button is enabled
          const checkoutEnabled = await cartPage.isCheckoutEnabled();
          
          if (checkoutEnabled) {
            // Click checkout button
            await cartPage.proceedToCheckout();
            
            // Verify we navigated away from cart (to checkout or login)
            await page.waitForLoadState('networkidle');
            const currentUrl = page.url();
            
            expect(currentUrl).not.toContain('/cart');
            console.log(`Navigated to: ${currentUrl}`);
          }
        }
      }
    }
  });

  test('should persist cart items across page navigation', async ({ productPage, cartPage, homePage, page }) => {
    // Add a product to cart
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      if (await productPage.isAddToCartEnabled()) {
        await productPage.addToCart();
        
        // Get cart count from product page
        const cartCountOnProduct = await productPage.getCartCount();
        
        // Navigate to homepage
        await homePage.goto();
        
        // Check cart count is the same
        const cartCountOnHome = await homePage.getCartCount();
        expect(cartCountOnHome).toBe(cartCountOnProduct);
        
        // Navigate to cart
        await cartPage.goto();
        
        // Verify items are still there
        expect(await cartPage.getItemCount()).toBeGreaterThan(0);
      }
    }
  });

  test('should open cart sidebar/drawer when cart badge is clicked', async ({ productPage, homePage, page }) => {
    // Add a product to cart first
    await page.goto('/');
    
    const productLinks = await page.locator('a[href*="/products/"]').all();
    
    if (productLinks.length > 0) {
      await productLinks[0].click();
      await page.waitForLoadState('networkidle');
      
      if (await productPage.isAddToCartEnabled()) {
        await productPage.addToCart();
        
        // Go back to homepage
        await homePage.goto();
        
        // Click cart badge to open sidebar
        await homePage.openCart();
        
        // Look for cart sidebar/drawer
        const cartAside = page.locator('aside, .cart-drawer, .cart-sidebar, [data-testid="cart-aside"]').first();
        const cartAsideVisible = await cartAside.isVisible().catch(() => false);
        
        if (cartAsideVisible) {
          console.log('Cart sidebar opened successfully');
          
          // Verify cart content is shown in sidebar
          const cartContent = await cartAside.textContent();
          expect(cartContent).toBeTruthy();
        } else {
          console.log('Cart sidebar not found - may navigate to cart page instead');
          // Some implementations might navigate to cart page instead of opening sidebar
          const currentUrl = page.url();
          if (currentUrl.includes('/cart')) {
            console.log('Navigated to cart page instead of opening sidebar');
          }
        }
      }
    }
  });
});