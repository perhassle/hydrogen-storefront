import { test as base, Page } from '@playwright/test';
import { HomePage, ProductPage, CartPage, SearchPage } from '../pages';

// Fixture type definitions
type TestFixtures = {
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  searchPage: SearchPage;
};

// Test data interfaces
export interface ProductData {
  handle: string;
  title: string;
  price: string;
  available: boolean;
}

export interface CustomerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CartItem {
  productHandle: string;
  variantId: string;
  quantity: number;
}

// Extended test with page fixtures
export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  productPage: async ({ page }, use) => {
    const productPage = new ProductPage(page);
    await use(productPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);
    await use(searchPage);
  },
});

export { expect } from '@playwright/test';