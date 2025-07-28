// Page Object Models
export { BasePage } from './BasePage';
export { HomePage } from './HomePage';
export { ProductPage } from './ProductPage';
export { CartPage } from './CartPage';
export { SearchPage } from './SearchPage';

// Page Object Factory for easy instantiation
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HomePage } from './HomePage';
import { ProductPage } from './ProductPage';
import { CartPage } from './CartPage';
import { SearchPage } from './SearchPage';

export class PageFactory {
  static createHomePage(page: Page): HomePage {
    return new HomePage(page);
  }

  static createProductPage(page: Page): ProductPage {
    return new ProductPage(page);
  }

  static createCartPage(page: Page): CartPage {
    return new CartPage(page);
  }

  static createSearchPage(page: Page): SearchPage {
    return new SearchPage(page);
  }

  static createBasePage(page: Page): BasePage {
    return new BasePage(page);
  }
}