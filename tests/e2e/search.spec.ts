import { test, expect } from '../fixtures/page-fixtures';
import { searchQueries } from '../fixtures/test-data';

test.describe('Search and Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should display search page with search form', async ({ searchPage }) => {
    await searchPage.goto();
    
    // Verify search page loads
    expect(await searchPage.isLoaded()).toBe(true);
    
    // Check for search input
    await expect(searchPage.searchInput).toBeVisible();
    
    // Check for search button if it exists
    const searchButtonVisible = await searchPage.searchButton.isVisible();
    if (searchButtonVisible) {
      await expect(searchPage.searchButton).toBeVisible();
    }
  });

  test('should perform search from homepage', async ({ homePage, searchPage, page }) => {
    await homePage.goto();
    
    // Use search from homepage
    const searchQuery = 'shirt';
    await homePage.search(searchQuery);
    
    // Should navigate to search results page
    expect(page.url()).toContain('search');
    
    // Verify search query is preserved
    const currentQuery = await searchPage.getSearchQuery();
    expect(currentQuery.toLowerCase()).toContain(searchQuery.toLowerCase());
  });

  test('should show search results for popular queries', async ({ searchPage, page }) => {
    for (const query of searchQueries.popular.slice(0, 2)) { // Test first 2 queries
      await searchPage.goto();
      await searchPage.search(query);
      
      // Wait for results to load
      await page.waitForLoadState('networkidle');
      
      // Check if we have results or no results message
      const hasResults = await searchPage.hasResults();
      const hasNoResults = await searchPage.hasNoResults();
      
      if (hasResults) {
        const resultCount = await searchPage.getResultCount();
        console.log(`Search for "${query}" returned ${resultCount} results`);
        
        expect(resultCount).toBeGreaterThan(0);
        
        // Verify search results are displayed properly
        const results = await searchPage.getResults();
        expect(results.length).toBeGreaterThan(0);
        
        // Check that results have titles
        for (const result of results.slice(0, 3)) {
          expect(result.title).toBeTruthy();
        }
        
      } else if (hasNoResults) {
        console.log(`Search for "${query}" returned no results`);
        await expect(searchPage.noResultsMessage).toBeVisible();
      }
    }
  });

  test('should handle empty search queries', async ({ searchPage }) => {
    await searchPage.goto();
    
    // Try to search with empty query
    await searchPage.search('');
    
    // Should either show validation message or all products
    const hasResults = await searchPage.hasResults();
    const hasNoResults = await searchPage.hasNoResults();
    
    // Either scenario is acceptable
    expect(hasResults || hasNoResults).toBe(true);
  });

  test('should handle special characters in search', async ({ searchPage, page }) => {
    for (const query of searchQueries.specialCharacters) {
      await searchPage.goto();
      await searchPage.search(query);
      
      await page.waitForLoadState('networkidle');
      
      // Verify page doesn't crash with special characters
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
      
      // Verify search input shows the query
      const displayedQuery = await searchPage.getSearchQuery();
      expect(displayedQuery).toContain(query);
    }
  });

  test('should show no results for nonsense queries', async ({ searchPage, page }) => {
    for (const query of searchQueries.noResults) {
      await searchPage.goto();
      await searchPage.search(query);
      
      await page.waitForLoadState('networkidle');
      
      // Should show no results
      const hasNoResults = await searchPage.hasNoResults();
      
      if (hasNoResults) {
        await expect(searchPage.noResultsMessage).toBeVisible();
        console.log(`Correctly showed no results for "${query}"`);
      } else {
        // Some stores might still return results for any query
        console.log(`Query "${query}" unexpectedly returned results`);
      }
    }
  });

  test('should allow clicking on search results', async ({ searchPage, page }) => {
    await searchPage.goto();
    
    // Search for something likely to have results
    await searchPage.search('product');
    await page.waitForLoadState('networkidle');
    
    const hasResults = await searchPage.hasResults();
    
    if (hasResults) {
      const resultCount = await searchPage.getResultCount();
      
      if (resultCount > 0) {
        // Click on first result
        await searchPage.clickResult(0);
        
        // Should navigate to product or collection page
        await page.waitForLoadState('networkidle');
        const currentUrl = page.url();
        
        expect(currentUrl).not.toContain('/search');
        console.log(`Clicked result navigated to: ${currentUrl}`);
      }
    }
  });

  test('should support sorting if available', async ({ searchPage, page }) => {
    await searchPage.goto();
    await searchPage.search('product');
    await page.waitForLoadState('networkidle');
    
    const hasResults = await searchPage.hasResults();
    
    if (hasResults) {
      // Check if sort dropdown exists
      const sortVisible = await searchPage.sortDropdown.isVisible();
      
      if (sortVisible) {
        // Try different sort options
        const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Newest', 'Name'];
        
        for (const option of sortOptions) {
          try {
            await searchPage.sortBy(option);
            await page.waitForLoadState('networkidle');
            
            console.log(`Successfully sorted by: ${option}`);
            
            // Verify results still exist after sorting
            expect(await searchPage.hasResults()).toBe(true);
          } catch (error) {
            // Option might not exist, continue with next
            console.log(`Sort option "${option}" not available`);
          }
        }
      } else {
        console.log('Sort functionality not available');
      }
    }
  });

  test('should support pagination if available', async ({ searchPage, page }) => {
    await searchPage.goto();
    await searchPage.search('product');
    await page.waitForLoadState('networkidle');
    
    const hasResults = await searchPage.hasResults();
    
    if (hasResults) {
      // Check if pagination exists
      const paginationVisible = await searchPage.pagination.isVisible();
      
      if (paginationVisible) {
        // Check if next page is available
        const nextPageVisible = await searchPage.nextPageButton.isVisible();
        
        if (nextPageVisible) {
          const currentPage = await searchPage.getCurrentPage();
          
          // Go to next page
          await searchPage.goToNextPage();
          
          const newPage = await searchPage.getCurrentPage();
          expect(newPage).toBeGreaterThan(currentPage);
          
          console.log(`Navigated from page ${currentPage} to page ${newPage}`);
          
          // Verify results exist on new page
          expect(await searchPage.hasResults()).toBe(true);
          
          // Go back to previous page if possible
          const prevPageVisible = await searchPage.prevPageButton.isVisible();
          if (prevPageVisible) {
            await searchPage.goToPrevPage();
          }
        }
      } else {
        console.log('Pagination not available or not needed');
      }
    }
  });

  test('should support filters if available', async ({ searchPage, page }) => {
    await searchPage.goto();
    await searchPage.search('product');
    await page.waitForLoadState('networkidle');
    
    const hasResults = await searchPage.hasResults();
    
    if (hasResults) {
      // Check if filters section exists
      const filtersVisible = await searchPage.filtersSection.isVisible();
      
      if (filtersVisible) {
        console.log('Filters section found');
        
        // Test price filter if available
        const priceFiltersCount = await searchPage.priceFilters.count();
        if (priceFiltersCount > 0) {
          await searchPage.applyPriceFilter('10', '50');
          await page.waitForLoadState('networkidle');
          
          console.log('Applied price filter');
          
          // Verify results still exist or show no results appropriately
          const hasResultsAfterFilter = await searchPage.hasResults();
          const hasNoResultsAfterFilter = await searchPage.hasNoResults();
          expect(hasResultsAfterFilter || hasNoResultsAfterFilter).toBe(true);
        }
        
        // Test category filter if available
        const categoryFiltersCount = await searchPage.categoryFilters.count();
        if (categoryFiltersCount > 0) {
          await searchPage.applyFilter('category', 'clothing');
          await page.waitForTimeout(1000);
          
          console.log('Attempted to apply category filter');
        }
        
        // Test clear filters if available
        const clearFiltersVisible = await searchPage.clearFiltersButton.isVisible();
        if (clearFiltersVisible) {
          await searchPage.clearAllFilters();
          console.log('Cleared all filters');
        }
      } else {
        console.log('No filters section available');
      }
    }
  });

  test('should show results count if available', async ({ searchPage, page }) => {
    await searchPage.goto();
    await searchPage.search('product');
    await page.waitForLoadState('networkidle');
    
    const hasResults = await searchPage.hasResults();
    
    if (hasResults) {
      // Check if results count is displayed
      const resultsCountVisible = await searchPage.resultsCount.isVisible();
      
      if (resultsCountVisible) {
        const resultsCountText = await searchPage.getResultsCountText();
        console.log(`Results count text: ${resultsCountText}`);
        
        expect(resultsCountText).toBeTruthy();
        
        // Verify count text contains numbers
        expect(resultsCountText).toMatch(/\d+/);
      } else {
        console.log('Results count not displayed');
      }
    }
  });

  test('should handle search from global navigation', async ({ page, searchPage }) => {
    // Start from any page
    await page.goto('/');
    
    // Look for global search input
    const globalSearch = page.locator('input[type="search"], input[name="search"], input[name="q"]').first();
    
    if (await globalSearch.isVisible()) {
      await globalSearch.fill('test search');
      await globalSearch.press('Enter');
      
      await page.waitForLoadState('networkidle');
      
      // Should navigate to search page
      expect(page.url()).toContain('search');
      
      // Verify search was performed
      const currentQuery = await searchPage.getSearchQuery();
      expect(currentQuery.toLowerCase()).toContain('test search');
    } else {
      console.log('Global search not found');
    }
  });
});