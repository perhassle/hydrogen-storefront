import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...');
  
  // Ensure the app is running and accessible
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log(`🌐 Checking if app is accessible at ${baseURL}...`);
    await page.goto(baseURL, { timeout: 30000 });
    
    // Wait for the app to be fully loaded
    await page.waitForLoadState('networkidle');
    
    console.log('✅ App is accessible and ready for testing');
    
    await browser.close();
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
  
  console.log('🎯 Global setup completed successfully');
}

export default globalSetup;