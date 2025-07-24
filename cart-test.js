import { chromium } from 'playwright';

async function testCartFunctionality() {
  console.log('🧪 Starting Hydrogen Storefront Cart Tests');
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Navigate to homepage and check cart badge visibility
    console.log('\n1. 🏠 Testing homepage and cart badge visibility...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const cartBadge = await page.locator('.cart-badge').first();
    const isCartBadgeVisible = await cartBadge.isVisible();
    console.log(`   ✅ Cart badge visible: ${isCartBadgeVisible}`);
    
    if (isCartBadgeVisible) {
      const cartText = await cartBadge.textContent();
      console.log(`   📊 Cart badge content: "${cartText}"`);
    }

    // Test 2: Check for product pages/collections
    console.log('\n2. 🛍️ Testing navigation to product/collection pages...');
    
    // Look for collections link
    const collectionsLink = await page.locator('a[href*="/collections"]').first();
    const collectionsVisible = await collectionsLink.isVisible().catch(() => false);
    
    if (collectionsVisible) {
      console.log('   ✅ Collections link found, navigating...');
      await collectionsLink.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      console.log(`   📍 Current URL: ${currentUrl}`);
      
      // Look for product items on the collections page
      const productItems = await page.locator('[data-testid="product-item"], .product-item, a[href*="/products/"]').all();
      console.log(`   📦 Found ${productItems.length} product items`);
      
      if (productItems.length > 0) {
        console.log('   ✅ Attempting to navigate to first product...');
        await productItems[0].click();
        await page.waitForLoadState('networkidle');
        
        const productUrl = page.url();
        console.log(`   📍 Product URL: ${productUrl}`);
        
        // Test 3: Look for Add to Cart functionality
        console.log('\n3. 🛒 Testing Add to Cart functionality...');
        
        const addToCartButtons = await page.locator('button:has-text("Add to cart"), button:has-text("Add to Cart"), [data-testid="add-to-cart"]').all();
        console.log(`   🔘 Found ${addToCartButtons.length} Add to Cart buttons`);
        
        if (addToCartButtons.length > 0) {
          console.log('   ✅ Attempting to add item to cart...');
          
          // Get initial cart count
          const initialCartText = await page.locator('.cart-badge').first().textContent().catch(() => '');
          console.log(`   📊 Initial cart state: "${initialCartText}"`);
          
          await addToCartButtons[0].click();
          await page.waitForTimeout(2000); // Wait for cart to update
          
          // Check updated cart count
          const updatedCartText = await page.locator('.cart-badge').first().textContent().catch(() => '');
          console.log(`   📊 Updated cart state: "${updatedCartText}"`);
          
          if (initialCartText !== updatedCartText) {
            console.log('   ✅ Cart updated successfully!');
          } else {
            console.log('   ⚠️ Cart might not have updated (or no visible change)');
          }
        } else {
          console.log('   ⚠️ No Add to Cart buttons found on this product page');
        }
      } else {
        console.log('   ⚠️ No product items found on collections page');
      }
    } else {
      console.log('   ⚠️ Collections link not found, trying alternative navigation...');
      
      // Try to find any product links directly
      const productLinks = await page.locator('a[href*="/products/"]').all();
      if (productLinks.length > 0) {
        console.log(`   ✅ Found ${productLinks.length} direct product links`);
        await productLinks[0].click();
        await page.waitForLoadState('networkidle');
        console.log(`   📍 Navigated to: ${page.url()}`);
      } else {
        console.log('   ❌ No product pages accessible from homepage');
      }
    }

    // Test 4: Test cart sidebar functionality
    console.log('\n4. 🗂️ Testing cart sidebar functionality...');
    
    // Go back to homepage to test cart sidebar
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const cartBadgeClickable = await page.locator('.cart-badge').first();
    if (await cartBadgeClickable.isVisible()) {
      console.log('   ✅ Clicking cart badge to open sidebar...');
      await cartBadgeClickable.click();
      await page.waitForTimeout(1000);
      
      // Look for cart sidebar/aside
      const cartAside = await page.locator('[data-testid="cart-aside"], .cart-aside, aside:has(.cart)').first();
      const cartAsideVisible = await cartAside.isVisible().catch(() => false);
      console.log(`   📋 Cart sidebar visible: ${cartAsideVisible}`);
      
      if (cartAsideVisible) {
        const cartContent = await cartAside.textContent();
        console.log(`   📝 Cart sidebar content preview: "${cartContent.substring(0, 100)}..."`);
      }
    }

    // Test 5: Test cart page
    console.log('\n5. 📄 Testing cart page functionality...');
    
    await page.goto('http://localhost:3000/cart');
    await page.waitForLoadState('networkidle');
    
    const cartPageTitle = await page.locator('h1').first().textContent().catch(() => '');
    console.log(`   📰 Cart page title: "${cartPageTitle}"`);
    
    const cartPageUrl = page.url();
    console.log(`   📍 Cart page URL: ${cartPageUrl}`);
    
    // Look for cart content elements
    const cartMain = await page.locator('.cart-main, [data-testid="cart-main"]').first();
    const cartMainVisible = await cartMain.isVisible().catch(() => false);
    console.log(`   🛒 Cart main component visible: ${cartMainVisible}`);
    
    if (cartMainVisible) {
      const cartItems = await page.locator('.cart-line-item, [data-testid="cart-line-item"]').all();
      console.log(`   📦 Cart items found: ${cartItems.length}`);
      
      const cartSummary = await page.locator('.cart-summary, [data-testid="cart-summary"]').first();
      const cartSummaryVisible = await cartSummary.isVisible().catch(() => false);
      console.log(`   💰 Cart summary visible: ${cartSummaryVisible}`);
    }

    // Test 6: Check for quantity update functionality (if items exist)
    console.log('\n6. 🔢 Testing quantity update functionality...');
    
    const quantityInputs = await page.locator('input[type="number"], input[name*="quantity"]').all();
    console.log(`   🔢 Quantity inputs found: ${quantityInputs.length}`);
    
    const updateButtons = await page.locator('button:has-text("Update"), button[name*="update"]').all();
    console.log(`   🔄 Update buttons found: ${updateButtons.length}`);
    
    const removeButtons = await page.locator('button:has-text("Remove"), button[name*="remove"]').all();
    console.log(`   🗑️ Remove buttons found: ${removeButtons.length}`);

    console.log('\n🎉 Cart functionality testing completed!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testCartFunctionality().catch(console.error);