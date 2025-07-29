import {useState} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';
import {inventoryAnalytics} from '~/lib/inventory-analytics';

interface BackInStockNotificationProps {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}

export function BackInStockNotification({
  product, 
  selectedVariant
}: BackInStockNotificationProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only show if product is out of stock
  if (!selectedVariant || selectedVariant.availableForSale) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API to register the email
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage for demo purposes
      const notifications = JSON.parse(
        localStorage.getItem('backInStockNotifications') || '[]'
      ) as Array<{
        email: string;
        productId: string;
        variantId: string;
        productTitle: string;
        variantTitle: string;
        timestamp: string;
      }>;
      notifications.push({
        email,
        productId: product.id,
        variantId: selectedVariant.id,
        productTitle: product.title,
        variantTitle: selectedVariant.title,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('backInStockNotifications', JSON.stringify(notifications));
      
      setIsSubmitted(true);
      
      // Track analytics event
      inventoryAnalytics.trackBackInStockSignup(
        product.id,
        product.title,
        selectedVariant.id,
        selectedVariant.title
      );
    } catch (error) {
      console.error('Failed to register back-in-stock notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="back-in-stock-notification success">
        <div className="notification-content">
          <span className="success-icon">✅</span>
          <div>
            <h4>Thanks! We'll notify you</h4>
            <p>We'll send you an email when this item is back in stock.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="back-in-stock-notification">
      <div className="notification-content">
        <span className="notification-icon">📧</span>
        <div>
          <h4>Get notified when it's back!</h4>
          <p>Enter your email and we'll let you know when this item is available again.</p>
          <form onSubmit={handleSubmit} className="notification-form">
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
                className="email-input"
              />
              <button 
                type="submit" 
                disabled={isLoading || !email.trim()}
                className="notify-button"
              >
                {isLoading ? 'Saving...' : 'Notify Me'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}