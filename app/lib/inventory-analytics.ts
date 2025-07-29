// Inventory Analytics Helper
// This module provides functions to track inventory-related events

export interface InventoryAnalyticsEvent {
  event: string;
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  quantityAvailable?: number | null;
  timestamp: string;
}

export class InventoryAnalytics {
  private static instance: InventoryAnalytics;
  private events: InventoryAnalyticsEvent[] = [];

  private constructor() {
    // Load existing events from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('inventoryAnalytics');
      if (stored) {
        try {
          this.events = JSON.parse(stored) as InventoryAnalyticsEvent[];
        } catch (error) {
          console.warn('Failed to parse stored inventory analytics:', error);
        }
      }
    }
  }

  public static getInstance(): InventoryAnalytics {
    if (!InventoryAnalytics.instance) {
      InventoryAnalytics.instance = new InventoryAnalytics();
    }
    return InventoryAnalytics.instance;
  }

  private persistEvents(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('inventoryAnalytics', JSON.stringify(this.events));
      } catch (error) {
        console.warn('Failed to persist inventory analytics:', error);
      }
    }
  }

  private sendToGoogleAnalytics(event: InventoryAnalyticsEvent): void {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      gtag('event', event.event, {
        event_category: 'inventory',
        event_label: `${event.productTitle}${event.variantTitle ? ` - ${event.variantTitle}` : ''}`,
        custom_parameter_product_id: event.productId,
        custom_parameter_variant_id: event.variantId,
        custom_parameter_quantity_available: event.quantityAvailable,
      });
    }
  }

  public trackStockLevelView(
    productId: string,
    productTitle: string,
    variantId?: string,
    variantTitle?: string,
    quantityAvailable?: number | null
  ): void {
    const event: InventoryAnalyticsEvent = {
      event: 'stock_level_view',
      productId,
      productTitle,
      variantId,
      variantTitle,
      quantityAvailable,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    this.persistEvents();
    this.sendToGoogleAnalytics(event);
  }

  public trackLowStockView(
    productId: string,
    productTitle: string,
    variantId?: string,
    variantTitle?: string,
    quantityAvailable?: number | null
  ): void {
    const event: InventoryAnalyticsEvent = {
      event: 'low_stock_view',
      productId,
      productTitle,
      variantId,
      variantTitle,
      quantityAvailable,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    this.persistEvents();
    this.sendToGoogleAnalytics(event);
  }

  public trackOutOfStockView(
    productId: string,
    productTitle: string,
    variantId?: string,
    variantTitle?: string
  ): void {
    const event: InventoryAnalyticsEvent = {
      event: 'out_of_stock_view',
      productId,
      productTitle,
      variantId,
      variantTitle,
      quantityAvailable: 0,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    this.persistEvents();
    this.sendToGoogleAnalytics(event);
  }

  public trackBackInStockSignup(
    productId: string,
    productTitle: string,
    variantId?: string,
    variantTitle?: string
  ): void {
    const event: InventoryAnalyticsEvent = {
      event: 'back_in_stock_signup',
      productId,
      productTitle,
      variantId,
      variantTitle,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    this.persistEvents();
    this.sendToGoogleAnalytics(event);
  }

  public trackPreOrder(
    productId: string,
    productTitle: string,
    variantId?: string,
    variantTitle?: string
  ): void {
    const event: InventoryAnalyticsEvent = {
      event: 'pre_order',
      productId,
      productTitle,
      variantId,
      variantTitle,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    this.persistEvents();
    this.sendToGoogleAnalytics(event);
  }

  public getEvents(): InventoryAnalyticsEvent[] {
    return [...this.events];
  }

  public getEventsByType(eventType: string): InventoryAnalyticsEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  public clearEvents(): void {
    this.events = [];
    this.persistEvents();
  }

  public getAnalyticsSummary(): {
    totalEvents: number;
    stockLevelViews: number;
    lowStockViews: number;
    outOfStockViews: number;
    backInStockSignups: number;
    preOrders: number;
  } {
    return {
      totalEvents: this.events.length,
      stockLevelViews: this.getEventsByType('stock_level_view').length,
      lowStockViews: this.getEventsByType('low_stock_view').length,
      outOfStockViews: this.getEventsByType('out_of_stock_view').length,
      backInStockSignups: this.getEventsByType('back_in_stock_signup').length,
      preOrders: this.getEventsByType('pre_order').length,
    };
  }
}

// Export a singleton instance for convenience
export const inventoryAnalytics = InventoryAnalytics.getInstance();