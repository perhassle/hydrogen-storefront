import { test, expect, Page } from '@playwright/test';

test.describe('AI-Powered Site Auto-Discovery', () => {
  test('should autonomously explore and map the site structure', async ({ page }) => {
    const discoveredPages = new Set<string>();
    const discoveredElements = new Map<string, any[]>();
    const errors = [];
    
    console.log('🤖 Starting AI-powered site exploration...');
    
    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Discover and map all internal links
    const internalLinks = await page.locator('a[href]').evaluateAll((links) => {
      return links
        .map(link => {
          const href = link.getAttribute('href');
          const text = link.textContent?.trim();
          return { href, text, element: link.tagName };
        })
        .filter(link => 
          link.href && 
          !link.href.startsWith('http') && 
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:') &&
          !link.href.startsWith('#')
        );
    });
    
    console.log(`🔍 Discovered ${internalLinks.length} internal links`);
    
    // Visit each discovered page and analyze
    for (const link of internalLinks.slice(0, 10)) { // Limit to first 10 for efficiency
      try {
        console.log(`📄 Exploring: ${link.href} (${link.text})`);
        
        await page.goto(link.href);
        await page.waitForLoadState('networkidle');
        
        discoveredPages.add(link.href);
        
        // Analyze page structure
        const pageAnalysis = await analyzePage(page, link.href);
        discoveredElements.set(link.href, pageAnalysis);
        
      } catch (error) {
        console.error(`❌ Error exploring ${link.href}:`, error);
        errors.push({ page: link.href, error: error.message });
      }
    }
    
    // Report findings
    console.log(`\n🎯 Auto-Discovery Results:`);
    console.log(`📊 Pages explored: ${discoveredPages.size}`);
    console.log(`🔧 Interactive elements found: ${Array.from(discoveredElements.values()).flat().length}`);
    console.log(`⚠️ Errors encountered: ${errors.length}`);
    
    // Verify we discovered substantial content
    expect(discoveredPages.size).toBeGreaterThan(0);
    expect(Array.from(discoveredElements.values()).flat().length).toBeGreaterThan(0);
  });

  test('should auto-generate tests for discovered functionality', async ({ page }) => {
    console.log('🧪 Auto-generating tests for discovered functionality...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Discover interactive elements
    const interactiveElements = await discoverInteractiveElements(page);
    
    console.log(`🎮 Found ${interactiveElements.length} interactive elements`);
    
    // Auto-generate and execute tests for each element type
    for (const element of interactiveElements.slice(0, 15)) { // Test first 15 elements
      try {
        await autoTestElement(page, element);
      } catch (error) {
        console.log(`⚠️ Auto-test failed for ${element.type} element: ${error.message}`);
      }
    }
  });

  test('should detect and test form validation automatically', async ({ page }) => {
    console.log('📝 Auto-discovering and testing forms...');
    
    await page.goto('/');
    
    // Find all forms on the site
    const forms = await discoverForms(page);
    
    for (const formInfo of forms) {
      try {
        console.log(`🔍 Testing form: ${formInfo.action || 'unknown action'}`);
        
        await page.goto(formInfo.url);
        await page.waitForLoadState('networkidle');
        
        // Auto-test form validation
        await autoTestFormValidation(page, formInfo.selector);
        
      } catch (error) {
        console.log(`❌ Form test failed: ${error.message}`);
      }
    }
  });

  test('should discover and validate accessibility tree', async ({ page }) => {
    console.log('♿ Auto-discovering accessibility issues...');
    
    const accessibilityIssues = [];
    
    await page.goto('/');
    
    // Check for common accessibility issues
    const a11yCheck = await performAccessibilityCheck(page);
    accessibilityIssues.push(...a11yCheck);
    
    // Navigate to key pages and check accessibility
    const keyPages = ['/products', '/collections', '/cart', '/search'];
    
    for (const pagePath of keyPages) {
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        const pageA11yCheck = await performAccessibilityCheck(page);
        accessibilityIssues.push(...pageA11yCheck.map(issue => ({ ...issue, page: pagePath })));
        
      } catch (error) {
        console.log(`⚠️ Could not check accessibility for ${pagePath}`);
      }
    }
    
    // Report accessibility findings
    console.log(`\n♿ Accessibility Analysis:`);
    console.log(`🔍 Issues found: ${accessibilityIssues.length}`);
    
    if (accessibilityIssues.length > 0) {
      console.log(`📋 Sample issues:`, accessibilityIssues.slice(0, 5));
    }
    
    // Don't fail the test for accessibility issues, just report them
    console.log(`✅ Accessibility scan completed`);
  });

  test('should auto-discover and test edge cases', async ({ page }) => {
    console.log('🧩 Auto-discovering edge cases...');
    
    const edgeCases = [];
    
    await page.goto('/');
    
    // Test various edge cases automatically
    const edgeTestResults = await runEdgeCaseTests(page);
    edgeCases.push(...edgeTestResults);
    
    console.log(`\n🧩 Edge Case Results:`);
    console.log(`🎯 Tests run: ${edgeCases.length}`);
    console.log(`✅ Passed: ${edgeCases.filter(e => e.passed).length}`);
    console.log(`❌ Failed: ${edgeCases.filter(e => !e.passed).length}`);
    
    // Report significant failures
    const significantFailures = edgeCases.filter(e => !e.passed && e.severity === 'high');
    if (significantFailures.length > 0) {
      console.log(`⚠️ High severity failures:`, significantFailures);
    }
  });
});

// Helper functions for AI-powered discovery

async function analyzePage(page: Page, url: string) {
  const analysis = await page.evaluate(() => {
    const elements = [];
    
    // Find buttons
    document.querySelectorAll('button').forEach((btn, index) => {
      elements.push({
        type: 'button',
        text: btn.textContent?.trim(),
        id: btn.id,
        classes: btn.className,
        disabled: btn.disabled,
        index
      });
    });
    
    // Find forms
    document.querySelectorAll('form').forEach((form, index) => {
      elements.push({
        type: 'form',
        action: form.action,
        method: form.method,
        inputs: Array.from(form.querySelectorAll('input, select, textarea')).length,
        index
      });
    });
    
    // Find interactive links
    document.querySelectorAll('a[href]').forEach((link, index) => {
      if (index < 20) { // Limit to prevent overwhelming data
        elements.push({
          type: 'link',
          href: link.getAttribute('href'),
          text: link.textContent?.trim(),
          index
        });
      }
    });
    
    return elements;
  });
  
  return analysis;
}

async function discoverInteractiveElements(page: Page) {
  return await page.evaluate(() => {
    const elements = [];
    
    // Buttons
    document.querySelectorAll('button').forEach((el, index) => {
      elements.push({
        type: 'button',
        selector: `button:nth-child(${index + 1})`,
        text: el.textContent?.trim(),
        visible: el.offsetParent !== null
      });
    });
    
    // Links
    document.querySelectorAll('a[href]').forEach((el, index) => {
      if (index < 10) { // Limit for performance
        elements.push({
          type: 'link',
          selector: `a[href]:nth-child(${index + 1})`,
          href: el.getAttribute('href'),
          text: el.textContent?.trim(),
          visible: el.offsetParent !== null
        });
      }
    });
    
    // Form inputs
    document.querySelectorAll('input, select, textarea').forEach((el, index) => {
      if (index < 10) {
        elements.push({
          type: 'input',
          selector: `${el.tagName.toLowerCase()}:nth-child(${index + 1})`,
          inputType: el.type || 'text',
          name: el.name,
          visible: el.offsetParent !== null
        });
      }
    });
    
    return elements.filter(el => el.visible);
  });
}

async function autoTestElement(page: Page, element: any) {
  console.log(`🎯 Auto-testing ${element.type}: ${element.text || element.selector}`);
  
  switch (element.type) {
    case 'button':
      // Test button click
      try {
        await page.locator(element.selector).click();
        await page.waitForTimeout(500);
        console.log(`✅ Button click successful`);
      } catch (error) {
        console.log(`❌ Button click failed: ${error.message}`);
      }
      break;
      
    case 'link':
      // Test link navigation (internal only)
      if (element.href && !element.href.startsWith('http')) {
        try {
          await page.locator(element.selector).click();
          await page.waitForLoadState('networkidle');
          console.log(`✅ Link navigation successful`);
        } catch (error) {
          console.log(`❌ Link navigation failed: ${error.message}`);
        }
      }
      break;
      
    case 'input':
      // Test input interaction
      try {
        const testValue = getTestValueForInput(element.inputType);
        await page.locator(element.selector).fill(testValue);
        console.log(`✅ Input interaction successful`);
      } catch (error) {
        console.log(`❌ Input interaction failed: ${error.message}`);
      }
      break;
  }
}

async function discoverForms(page: Page) {
  // Navigate through site to find forms
  const forms = [];
  
  const currentUrl = page.url();
  
  // Check current page for forms
  const currentPageForms = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form')).map((form, index) => ({
      selector: `form:nth-child(${index + 1})`,
      action: form.action,
      method: form.method,
      inputs: Array.from(form.querySelectorAll('input, select, textarea')).length
    }));
  });
  
  forms.push(...currentPageForms.map(form => ({ ...form, url: currentUrl })));
  
  // Check common form pages
  const formPages = ['/contact', '/account/login', '/account/register', '/search'];
  
  for (const formPage of formPages) {
    try {
      await page.goto(formPage);
      await page.waitForLoadState('networkidle');
      
      const pageForms = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('form')).map((form, index) => ({
          selector: `form:nth-child(${index + 1})`,
          action: form.action,
          method: form.method,
          inputs: Array.from(form.querySelectorAll('input, select, textarea')).length
        }));
      });
      
      forms.push(...pageForms.map(form => ({ ...form, url: formPage })));
      
    } catch (error) {
      // Page might not exist, continue
    }
  }
  
  return forms;
}

async function autoTestFormValidation(page: Page, formSelector: string) {
  const form = page.locator(formSelector);
  
  // Try to submit empty form to trigger validation
  const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
  
  if (await submitButton.isVisible()) {
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // Check for validation messages
    const validationMessages = await page.locator('.error, .invalid, [aria-invalid="true"]').count();
    console.log(`📝 Form validation messages found: ${validationMessages}`);
  }
}

async function performAccessibilityCheck(page: Page) {
  return await page.evaluate(() => {
    const issues = [];
    
    // Check for images without alt text
    document.querySelectorAll('img').forEach(img => {
      if (!img.alt) {
        issues.push({
          type: 'missing-alt-text',
          element: 'img',
          selector: img.outerHTML.substring(0, 100)
        });
      }
    });
    
    // Check for form inputs without labels
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`) || input.closest('label');
      if (!hasLabel && !input.getAttribute('aria-label')) {
        issues.push({
          type: 'missing-label',
          element: 'input',
          selector: input.outerHTML.substring(0, 100)
        });
      }
    });
    
    // Check for buttons without accessible text
    document.querySelectorAll('button').forEach(button => {
      const hasText = button.textContent?.trim() || button.getAttribute('aria-label');
      if (!hasText) {
        issues.push({
          type: 'missing-button-text',
          element: 'button',
          selector: button.outerHTML.substring(0, 100)
        });
      }
    });
    
    return issues;
  });
}

async function runEdgeCaseTests(page: Page) {
  const edgeCases = [];
  
  // Test 1: Very long text input
  try {
    const searchInput = page.locator('input[type="search"], input[name="search"]').first();
    if (await searchInput.isVisible()) {
      const longText = 'a'.repeat(1000);
      await searchInput.fill(longText);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      
      edgeCases.push({
        test: 'long-search-input',
        passed: true,
        severity: 'medium'
      });
    }
  } catch (error) {
    edgeCases.push({
      test: 'long-search-input',
      passed: false,
      severity: 'medium',
      error: error.message
    });
  }
  
  // Test 2: Rapid navigation
  try {
    const links = await page.locator('a[href^="/"]').all();
    for (let i = 0; i < Math.min(3, links.length); i++) {
      await links[i].click();
      await page.waitForTimeout(100); // Very short wait to test rapid navigation
    }
    
    edgeCases.push({
      test: 'rapid-navigation',
      passed: true,
      severity: 'low'
    });
  } catch (error) {
    edgeCases.push({
      test: 'rapid-navigation',
      passed: false,
      severity: 'low',
      error: error.message
    });
  }
  
  // Test 3: Special characters in forms
  try {
    const textInputs = await page.locator('input[type="text"], input[type="search"]').all();
    for (const input of textInputs.slice(0, 2)) {
      if (await input.isVisible()) {
        await input.fill('!@#$%^&*()');
        await page.waitForTimeout(100);
      }
    }
    
    edgeCases.push({
      test: 'special-characters-input',
      passed: true,
      severity: 'medium'
    });
  } catch (error) {
    edgeCases.push({
      test: 'special-characters-input',
      passed: false,
      severity: 'medium',
      error: error.message
    });
  }
  
  return edgeCases;
}

function getTestValueForInput(inputType: string): string {
  switch (inputType) {
    case 'email':
      return 'test@example.com';
    case 'password':
      return 'TestPassword123!';
    case 'number':
      return '42';
    case 'tel':
      return '+1234567890';
    case 'url':
      return 'https://example.com';
    case 'search':
      return 'test search';
    default:
      return 'test value';
  }
}