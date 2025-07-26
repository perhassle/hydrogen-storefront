import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async goto(query?: string) {
    const path = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
    await super.goto(path);
  }

  // Search elements
  get searchInput() {
    return this.page.locator('input[type="search"], input[name="search"], input[name="q"], [data-testid="search-input"]').first();
  }

  get searchButton() {
    return this.page.locator('button[type="submit"], button:has-text("Search"), [data-testid="search-button"]').first();
  }

  get searchForm() {
    return this.page.locator('form[role="search"], .search-form, [data-testid="search-form"]').first();
  }

  get searchTitle() {
    return this.page.locator('h1, .search-title, [data-testid="search-title"]').first();
  }

  // Results elements
  get searchResults() {
    return this.page.locator('.search-results, [data-testid="search-results"]').first();
  }

  get resultItems() {
    return this.page.locator('.result-item, [data-testid="result-item"], .product-card, .search-result');
  }

  get productResults() {
    return this.page.locator('.product-result, [data-testid="product-result"]');
  }

  get collectionResults() {
    return this.page.locator('.collection-result, [data-testid="collection-result"]');
  }

  get pageResults() {
    return this.page.locator('.page-result, [data-testid="page-result"]');
  }

  get articleResults() {
    return this.page.locator('.article-result, [data-testid="article-result"]');
  }

  // No results state
  get noResultsMessage() {
    return this.page.locator('.no-results, [data-testid="no-results"], .empty-results').first();
  }

  get suggestedQueries() {
    return this.page.locator('.suggested-queries, [data-testid="suggested-queries"]').first();
  }

  get popularSearches() {
    return this.page.locator('.popular-searches, [data-testid="popular-searches"]').first();
  }

  // Filters and sorting
  get filtersSection() {
    return this.page.locator('.filters, [data-testid="filters"], .search-filters').first();
  }

  get sortDropdown() {
    return this.page.locator('select[name*="sort"], [data-testid="sort-select"]').first();
  }

  get priceFilters() {
    return this.filtersSection.locator('.price-filter, [data-testid="price-filter"]');
  }

  get categoryFilters() {
    return this.filtersSection.locator('.category-filter, [data-testid="category-filter"]');
  }

  get brandFilters() {
    return this.filtersSection.locator('.brand-filter, [data-testid="brand-filter"]');
  }

  get colorFilters() {
    return this.filtersSection.locator('.color-filter, [data-testid="color-filter"]');
  }

  get sizeFilters() {
    return this.filtersSection.locator('.size-filter, [data-testid="size-filter"]');
  }

  get clearFiltersButton() {
    return this.page.locator('button:has-text("Clear"), button:has-text("Reset"), [data-testid="clear-filters"]').first();
  }

  // Pagination
  get pagination() {
    return this.page.locator('.pagination, [data-testid="pagination"]').first();
  }

  get nextPageButton() {
    return this.pagination.locator('a:has-text("Next"), button:has-text("Next"), [data-testid="next-page"]').first();
  }

  get prevPageButton() {
    return this.pagination.locator('a:has-text("Previous"), button:has-text("Previous"), [data-testid="prev-page"]').first();
  }

  get pageNumbers() {
    return this.pagination.locator('a[href*="page="], button[data-page]');
  }

  // Results info
  get resultsCount() {
    return this.page.locator('.results-count, [data-testid="results-count"]').first();
  }

  get resultsInfo() {
    return this.page.locator('.results-info, [data-testid="results-info"]').first();
  }

  // Actions
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async quickSearch(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForPageLoad();
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async sortBy(option: string) {
    if (await this.sortDropdown.isVisible()) {
      await this.sortDropdown.selectOption({ label: option });
      await this.waitForPageLoad();
    }
  }

  async applyPriceFilter(minPrice?: string, maxPrice?: string) {
    const priceFilters = await this.priceFilters.all();
    
    if (priceFilters.length > 0) {
      const priceFilter = priceFilters[0];
      
      if (minPrice) {
        const minInput = priceFilter.locator('input[name*="min"], input[placeholder*="min" i]').first();
        if (await minInput.isVisible()) {
          await minInput.fill(minPrice);
        }
      }
      
      if (maxPrice) {
        const maxInput = priceFilter.locator('input[name*="max"], input[placeholder*="max" i]').first();
        if (await maxInput.isVisible()) {
          await maxInput.fill(maxPrice);
        }
      }
      
      // Submit filter
      const applyButton = priceFilter.locator('button[type="submit"], button:has-text("Apply")').first();
      if (await applyButton.isVisible()) {
        await applyButton.click();
        await this.waitForPageLoad();
      }
    }
  }

  async applyFilter(filterType: string, value: string) {
    const filter = this.page.locator(`[data-filter="${filterType}"], .${filterType}-filter`).first();
    
    if (await filter.isVisible()) {
      const option = filter.locator(`input[value="${value}"], label:has-text("${value}")`).first();
      
      if (await option.isVisible()) {
        await option.click();
        await this.page.waitForTimeout(1000); // Wait for filter to apply
      }
    }
  }

  async clearAllFilters() {
    if (await this.clearFiltersButton.isVisible()) {
      await this.clearFiltersButton.click();
      await this.waitForPageLoad();
    }
  }

  async goToPage(pageNumber: number) {
    const pageLink = this.pagination.locator(`a[href*="page=${pageNumber}"], button[data-page="${pageNumber}"]`).first();
    
    if (await pageLink.isVisible()) {
      await pageLink.click();
      await this.waitForPageLoad();
    }
  }

  async goToNextPage() {
    if (await this.nextPageButton.isVisible()) {
      await this.nextPageButton.click();
      await this.waitForPageLoad();
    }
  }

  async goToPrevPage() {
    if (await this.prevPageButton.isVisible()) {
      await this.prevPageButton.click();
      await this.waitForPageLoad();
    }
  }

  async clickResult(index: number) {
    const results = await this.resultItems.all();
    if (results[index]) {
      await results[index].click();
      await this.waitForPageLoad();
    }
  }

  // Validation methods
  async hasResults(): Promise<boolean> {
    const resultCount = await this.resultItems.count();
    return resultCount > 0;
  }

  async hasNoResults(): Promise<boolean> {
    return await this.noResultsMessage.isVisible();
  }

  async getResultCount(): Promise<number> {
    return await this.resultItems.count();
  }

  async getSearchQuery(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  async getResults() {
    const results = [];
    const resultItems = await this.resultItems.all();
    
    for (const item of resultItems) {
      const title = await item.locator('h2, h3, .title, [data-testid="result-title"]').first().textContent();
      const price = await item.locator('.price, [data-testid="result-price"]').first().textContent();
      const link = await item.locator('a').first().getAttribute('href');
      
      results.push({
        title: title?.trim(),
        price: price?.trim(),
        link: link,
      });
    }
    
    return results;
  }

  async getResultsCountText(): Promise<string> {
    const countText = await this.resultsCount.textContent();
    return countText?.trim() || '';
  }

  async getCurrentPage(): Promise<number> {
    try {
      const url = this.page.url();
      const match = url.match(/page=(\d+)/);
      return match ? parseInt(match[1], 10) : 1;
    } catch {
      return 1;
    }
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.searchInput.waitFor({ timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}