import {useState} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';
import {inventoryAnalytics} from '~/lib/inventory-analytics';

interface PreOrderButtonProps {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  disabled?: boolean;
  className?: string;
}

export function PreOrderButton({
  product,
  selectedVariant,
  disabled = false,
  className = ''
}: PreOrderButtonProps) {
  const [isPreOrdering, setIsPreOrdering] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Only show for out-of-stock items
  if (!selectedVariant || selectedVariant.availableForSale) {
    return null;
  }

  const handlePreOrder = async () => {
    if (!selectedVariant) return;

    setIsPreOrdering(true);
    
    try {
      // In a real implementation, this would integrate with your pre-order system
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store pre-order in localStorage for demo
      const preOrders = JSON.parse(
        localStorage.getItem('preOrders') || '[]'
      ) as Array<{
        productId: string;
        variantId: string;
        productTitle: string;
        variantTitle: string;
        price: any;
        timestamp: string;
        status: string;
      }>;
      preOrders.push({
        productId: product.id,
        variantId: selectedVariant.id,
        productTitle: product.title,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });
      localStorage.setItem('preOrders', JSON.stringify(preOrders));
      
      // Track analytics event
      inventoryAnalytics.trackPreOrder(
        product.id,
        product.title,
        selectedVariant.id,
        selectedVariant.title
      );
      
      setShowConfirmation(true);
    } catch (error) {
      console.error('Pre-order failed:', error);
    } finally {
      setIsPreOrdering(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className={`pre-order-confirmation ${className}`}>
        <div className="confirmation-content">
          <span className="success-icon">🎉</span>
          <div>
            <h4>Pre-order Confirmed!</h4>
            <p>We'll charge your card and ship when the item becomes available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePreOrder}
      disabled={disabled || isPreOrdering}
      className={`pre-order-button ${className}`}
    >
      {isPreOrdering ? (
        <>
          <span className="loading-spinner">⏳</span>
          Processing Pre-order...
        </>
      ) : (
        <>
          <span className="pre-order-icon">📋</span>
          Pre-order Now
        </>
      )}
    </button>
  );
}