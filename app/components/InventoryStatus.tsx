import {useEffect} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';
import {inventoryAnalytics} from '~/lib/inventory-analytics';

interface InventoryStatusProps {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  product?: ProductFragment;
  className?: string;
}

export function InventoryStatus({selectedVariant, product, className = ''}: InventoryStatusProps) {
  useEffect(() => {
    if (!selectedVariant || !product) return;

    const {quantityAvailable} = selectedVariant;
    
    // Track inventory analytics
    if (quantityAvailable === null || quantityAvailable === undefined) {
      if (!selectedVariant.availableForSale) {
        inventoryAnalytics.trackOutOfStockView(
          product.id,
          product.title,
          selectedVariant.id,
          selectedVariant.title
        );
      } else {
        inventoryAnalytics.trackStockLevelView(
          product.id,
          product.title,
          selectedVariant.id,
          selectedVariant.title,
          null
        );
      }
    } else if (quantityAvailable <= 0) {
      inventoryAnalytics.trackOutOfStockView(
        product.id,
        product.title,
        selectedVariant.id,
        selectedVariant.title
      );
    } else if (quantityAvailable < 5) {
      inventoryAnalytics.trackLowStockView(
        product.id,
        product.title,
        selectedVariant.id,
        selectedVariant.title,
        quantityAvailable
      );
    } else {
      inventoryAnalytics.trackStockLevelView(
        product.id,
        product.title,
        selectedVariant.id,
        selectedVariant.title,
        quantityAvailable
      );
    }
  }, [selectedVariant, product]);

  if (!selectedVariant) {
    return null;
  }

  const {availableForSale, quantityAvailable} = selectedVariant;
  
  // If quantity is not available from API, fall back to availableForSale
  if (quantityAvailable === null || quantityAvailable === undefined) {
    if (!availableForSale) {
      return (
        <div className={`inventory-status out-of-stock ${className}`}>
          <span className="status-indicator">⭕</span>
          <span className="status-text">Out of Stock</span>
        </div>
      );
    }
    return (
      <div className={`inventory-status in-stock ${className}`}>
        <span className="status-indicator">🟠</span>
        <span className="status-text">In Stock</span>
      </div>
    );
  }

  // Handle specific quantity levels
  if (quantityAvailable <= 0) {
    return (
      <div className={`inventory-status out-of-stock ${className}`}>
        <span className="status-indicator">⭕</span>
        <span className="status-text">Out of Stock</span>
      </div>
    );
  }

  if (quantityAvailable < 10) {
    return (
      <div className={`inventory-status low-stock urgent ${className}`}>
        <span className="status-indicator">⚠️</span>
        <span className="status-text">
          Only {quantityAvailable} left - Order now!
        </span>
      </div>
    );
  }

  return (
    <div className={`inventory-status in-stock ${className}`}>
      <span className="status-indicator">🟠</span>
      <span className="status-text">{quantityAvailable} in stock</span>
    </div>
  );
}