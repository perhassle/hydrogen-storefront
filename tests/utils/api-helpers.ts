import { Page, Request, Response } from '@playwright/test';

export class ApiHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Mock Shopify Storefront API responses
   */
  async mockStorefrontAPI() {
    await this.page.route('**/api/**', async (route) => {
      const request = route.request();
      const url = request.url();

      // Mock GraphQL API responses
      if (url.includes('graphql') || url.includes('storefront')) {
        await this.handleGraphQLMock(route);
      } 
      // Mock REST API responses
      else if (url.includes('/api/')) {
        await this.handleRESTMock(route);
      } 
      // Continue with normal request
      else {
        await route.continue();
      }
    });
  }

  /**
   * Handle GraphQL mock responses
   */
  private async handleGraphQLMock(route: any) {
    const request = route.request();
    const postData = request.postData();
    
    try {
      const body = postData ? JSON.parse(postData) : {};
      const query = body.query || '';

      // Mock product queries
      if (query.includes('products') || query.includes('Product')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(this.getMockProductsResponse()),
        });
        return;
      }

      // Mock collection queries
      if (query.includes('collections') || query.includes('Collection')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(this.getMockCollectionsResponse()),
        });
        return;
      }

      // Mock cart queries
      if (query.includes('cart') || query.includes('Cart')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(this.getMockCartResponse()),
        });
        return;
      }

      // Default mock response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      });
    } catch (error) {
      console.error('Error handling GraphQL mock:', error);
      await route.continue();
    }
  }

  /**
   * Handle REST API mock responses
   */
  private async handleRESTMock(route: any) {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    // Mock cart API
    if (url.includes('/api/cart')) {
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(this.getMockCart()),
        });
      } else if (method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, cart: this.getMockCart() }),
        });
      }
      return;
    }

    // Mock product API
    if (url.includes('/api/products')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(this.getMockProducts()),
      });
      return;
    }

    // Default continue
    await route.continue();
  }

  /**
   * Mock product data
   */
  private getMockProducts() {
    return [
      {
        id: 'prod_1',
        handle: 'test-product-1',
        title: 'Test Product 1',
        description: 'A sample test product for automated testing',
        price: '29.99',
        currency: 'USD',
        available: true,
        images: [
          {
            url: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Product+1',
            altText: 'Test Product 1',
          },
        ],
        variants: [
          {
            id: 'var_1',
            title: 'Default',
            price: '29.99',
            available: true,
          },
        ],
      },
      {
        id: 'prod_2',
        handle: 'test-product-2',
        title: 'Test Product 2',
        description: 'Another sample test product',
        price: '49.99',
        currency: 'USD',
        available: true,
        images: [
          {
            url: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Product+2',
            altText: 'Test Product 2',
          },
        ],
        variants: [
          {
            id: 'var_2',
            title: 'Default',
            price: '49.99',
            available: true,
          },
        ],
      },
    ];
  }

  /**
   * Mock cart data
   */
  private getMockCart() {
    return {
      id: 'cart_123',
      lines: [
        {
          id: 'line_1',
          quantity: 2,
          merchandise: {
            id: 'var_1',
            product: this.getMockProducts()[0],
          },
        },
      ],
      cost: {
        totalAmount: { amount: '59.98', currencyCode: 'USD' },
        subtotalAmount: { amount: '59.98', currencyCode: 'USD' },
      },
    };
  }

  /**
   * Mock GraphQL product response
   */
  private getMockProductsResponse() {
    return {
      data: {
        products: {
          edges: this.getMockProducts().map(product => ({
            node: product,
          })),
        },
      },
    };
  }

  /**
   * Mock GraphQL collections response
   */
  private getMockCollectionsResponse() {
    return {
      data: {
        collections: {
          edges: [
            {
              node: {
                id: 'coll_1',
                handle: 'featured',
                title: 'Featured Products',
                description: 'Our featured collection',
                products: {
                  edges: this.getMockProducts().slice(0, 1).map(product => ({
                    node: product,
                  })),
                },
              },
            },
          ],
        },
      },
    };
  }

  /**
   * Mock GraphQL cart response
   */
  private getMockCartResponse() {
    return {
      data: {
        cart: this.getMockCart(),
      },
    };
  }

  /**
   * Monitor API requests and responses
   */
  async monitorAPIRequests(): Promise<{ requests: Request[]; responses: Response[] }> {
    const requests: Request[] = [];
    const responses: Response[] = [];

    this.page.on('request', (request) => {
      if (request.url().includes('/api/') || request.url().includes('graphql')) {
        requests.push(request);
      }
    });

    this.page.on('response', (response) => {
      if (response.url().includes('/api/') || response.url().includes('graphql')) {
        responses.push(response);
      }
    });

    return { requests, responses };
  }

  /**
   * Wait for specific API call to complete
   */
  async waitForAPICall(urlPattern: string, timeout: number = 10000): Promise<Response> {
    return this.page.waitForResponse(
      (response) => response.url().includes(urlPattern),
      { timeout }
    );
  }

  /**
   * Intercept and modify API responses
   */
  async interceptAPI(urlPattern: string, modifyResponse: (body: any) => any) {
    await this.page.route(`**/*${urlPattern}*`, async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      const modifiedBody = modifyResponse(body);

      await route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: JSON.stringify(modifiedBody),
      });
    });
  }

  /**
   * Simulate API errors
   */
  async simulateAPIError(urlPattern: string, statusCode: number = 500) {
    await this.page.route(`**/*${urlPattern}*`, async (route) => {
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message: 'Simulated API error',
            code: statusCode,
          },
        }),
      });
    });
  }

  /**
   * Simulate slow API responses
   */
  async simulateSlowAPI(urlPattern: string, delayMs: number = 3000) {
    await this.page.route(`**/*${urlPattern}*`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      await route.continue();
    });
  }

  /**
   * Clear all API mocks and interceptors
   */
  async clearAPIMocks() {
    await this.page.unrouteAll();
  }
}