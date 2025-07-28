import { ProductData, CustomerData, CartItem } from './page-fixtures';

// Sample product data for testing
export const sampleProducts: ProductData[] = [
  {
    handle: 'sample-product-1',
    title: 'Sample Product 1',
    price: '$29.99',
    available: true,
  },
  {
    handle: 'sample-product-2',
    title: 'Sample Product 2',
    price: '$49.99',
    available: true,
  },
  {
    handle: 'out-of-stock-product',
    title: 'Out of Stock Product',
    price: '$19.99',
    available: false,
  },
];

// Sample customer data for testing
export const sampleCustomers: CustomerData[] = [
  {
    email: 'test.customer1@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Customer',
  },
  {
    email: 'test.customer2@example.com',
    password: 'TestPassword456!',
    firstName: 'Jane',
    lastName: 'Doe',
  },
];

// Sample cart data
export const sampleCartItems: CartItem[] = [
  {
    productHandle: 'sample-product-1',
    variantId: 'variant-1',
    quantity: 2,
  },
  {
    productHandle: 'sample-product-2',
    variantId: 'variant-2',
    quantity: 1,
  },
];

// Search queries for testing
export const searchQueries = {
  popular: ['shirt', 'shoes', 'bag', 'dress'],
  specific: ['red shirt', 'running shoes', 'leather bag'],
  noResults: ['xyzabc123', 'nonexistentproduct'],
  specialCharacters: ['shirt & tie', 'product-name', 'test@product'],
};

// Test collections
export const testCollections = [
  'featured',
  'new-arrivals',
  'sale',
  'all',
];

// Mock data for when Shopify API is not available
export const mockStoreData = {
  products: sampleProducts,
  collections: testCollections,
  customers: sampleCustomers,
  cartItems: sampleCartItems,
};

// Discount codes for testing
export const testDiscountCodes = [
  'TEST10',
  'SAVE20',
  'FREESHIP',
  'INVALID_CODE',
];

// Email addresses for newsletter testing
export const testEmails = [
  'valid@example.com',
  'test.email+tag@domain.co.uk',
  'invalid-email',
  '',
];

// Browser viewport sizes for responsive testing
export const viewportSizes = {
  mobile: { width: 375, height: 667 },
  mobileLandscape: { width: 667, height: 375 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 720 },
  desktopLarge: { width: 1920, height: 1080 },
};

// Common test timeouts
export const testTimeouts = {
  short: 5000,
  medium: 10000,
  long: 30000,
  veryLong: 60000,
};

// URLs for different environments
export const testUrls = {
  local: 'http://localhost:3000',
  staging: process.env.STAGING_URL || 'https://staging.example.com',
  production: process.env.PRODUCTION_URL || 'https://production.example.com',
};

// API endpoints for testing
export const apiEndpoints = {
  cart: '/api/cart',
  products: '/api/products',
  collections: '/api/collections',
  customer: '/api/customer',
  search: '/api/search',
};

export default {
  products: sampleProducts,
  customers: sampleCustomers,
  cartItems: sampleCartItems,
  searchQueries,
  collections: testCollections,
  mockStoreData,
  discountCodes: testDiscountCodes,
  emails: testEmails,
  viewportSizes,
  timeouts: testTimeouts,
  urls: testUrls,
  apiEndpoints,
};