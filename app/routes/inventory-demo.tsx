import {useState} from 'react';
import {InventoryStatus} from '~/components/InventoryStatus';
import {BackInStockNotification} from '~/components/BackInStockNotification';
import {PreOrderButton} from '~/components/PreOrderButton';
import {inventoryAnalytics} from '~/lib/inventory-analytics';

// Mock product data for demo
const mockProduct = {
  id: 'demo-product-1',
  title: 'Demo Product with Inventory Management',
  vendor: 'Demo Store',
  handle: 'demo-product',
  description: 'This is a demo product to showcase inventory management features.',
  descriptionHtml: '<p>This is a demo product to showcase inventory management features.</p>',
};

const mockPrice = {
  amount: '99.99',
  currencyCode: 'USD',
};

export default function InventoryDemo() {
  const [selectedVariantType, setSelectedVariantType] = useState<'inStock' | 'lowStock' | 'outOfStock'>('inStock');
  const [analyticsData, setAnalyticsData] = useState(inventoryAnalytics.getAnalyticsSummary());

  // Create mock variants based on selected type
  const createMockVariant = (type: 'inStock' | 'lowStock' | 'outOfStock') => {
    const baseVariant = {
      id: `demo-variant-${type}`,
      title: `${type === 'inStock' ? 'In Stock' : type === 'lowStock' ? 'Low Stock' : 'Out of Stock'} Variant`,
      price: mockPrice,
      compareAtPrice: null,
      selectedOptions: [{name: 'Type', value: type}],
      sku: `demo-${type}`,
    };

    switch (type) {
      case 'inStock':
        return {
          ...baseVariant,
          availableForSale: true,
          quantityAvailable: 25,
        };
      case 'lowStock':
        return {
          ...baseVariant,
          availableForSale: true,
          quantityAvailable: 3,
        };
      case 'outOfStock':
        return {
          ...baseVariant,
          availableForSale: false,
          quantityAvailable: 0,
        };
    }
  };

  const selectedVariant = createMockVariant(selectedVariantType);

  const refreshAnalytics = () => {
    setAnalyticsData(inventoryAnalytics.getAnalyticsSummary());
  };

  const clearAnalytics = () => {
    inventoryAnalytics.clearEvents();
    setAnalyticsData(inventoryAnalytics.getAnalyticsSummary());
  };

  return (
    <div className="inventory-demo-page" style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
      <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem'}}>
        Inventory Management Demo
      </h1>
      
      {/* Demo Controls */}
      <div style={{marginBottom: '2rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb'}}>
        <h2 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>Demo Controls</h2>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          <button
            onClick={() => setSelectedVariantType('inStock')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedVariantType === 'inStock' ? '#16a34a' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            In Stock (25 items)
          </button>
          <button
            onClick={() => setSelectedVariantType('lowStock')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedVariantType === 'lowStock' ? '#dc2626' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Low Stock (3 items)
          </button>
          <button
            onClick={() => setSelectedVariantType('outOfStock')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedVariantType === 'outOfStock' ? '#dc2626' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Out of Stock (0 items)
          </button>
        </div>
      </div>

      {/* Product Demo Layout */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem'}}>
        
        {/* Mock Product Image */}
        <div>
          <div style={{
            aspectRatio: '1/1',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#6b7280',
            border: '2px dashed #d1d5db'
          }}>
            📦 Product Image Placeholder
          </div>
        </div>

        {/* Product Info with Inventory Components */}
        <div>
          <h1 style={{fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            {mockProduct.title}
          </h1>
          
          <div style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>
            ${selectedVariant.price.amount} {selectedVariant.price.currencyCode}
          </div>

          {/* Inventory Status Component */}
          <InventoryStatus selectedVariant={selectedVariant} product={mockProduct} />

          <br />

          {/* Product Options Demo */}
          <div style={{marginBottom: '1rem'}}>
            <h5 style={{marginBottom: '0.5rem'}}>Stock Level</h5>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <span style={{
                padding: '0.5rem 1rem',
                border: '1px solid #000',
                borderRadius: '4px',
                backgroundColor: '#f3f4f6'
              }}>
                {selectedVariant.title}
              </span>
            </div>
          </div>

          {/* Add to Cart / Out of Stock Button */}
          <button
            disabled={!selectedVariant.availableForSale}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: selectedVariant.availableForSale ? '#000' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: selectedVariant.availableForSale ? 'pointer' : 'not-allowed',
              marginBottom: '1rem',
            }}
          >
            {selectedVariant.availableForSale ? 'Add to cart' : 'Out of Stock'}
          </button>

          {/* Back-in-Stock Notification */}
          <BackInStockNotification product={mockProduct} selectedVariant={selectedVariant} />

          {/* Pre-order Button */}
          <PreOrderButton product={mockProduct} selectedVariant={selectedVariant} />

          <br />
          <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
            <strong>Product Description:</strong><br />
            {mockProduct.description}
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div style={{marginTop: '2rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: '600'}}>Inventory Analytics Dashboard</h2>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <button
              onClick={refreshAnalytics}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
            <button
              onClick={clearAnalytics}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Clear Data
            </button>
          </div>
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6'}}>{analyticsData.totalEvents}</div>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Total Events</div>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#16a34a'}}>{analyticsData.stockLevelViews}</div>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Stock Level Views</div>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#ca8a04'}}>{analyticsData.lowStockViews}</div>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Low Stock Views</div>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#dc2626'}}>{analyticsData.outOfStockViews}</div>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Out of Stock Views</div>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed'}}>{analyticsData.backInStockSignups}</div>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Email Signups</div>
          </div>
          <div style={{textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px'}}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed'}}>{analyticsData.preOrders}</div>
            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Pre-orders</div>
          </div>
        </div>
      </div>

      {/* Feature Description */}
      <div style={{marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9'}}>
        <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0c4a6e'}}>
          🎯 Inventory Management Features Demonstrated
        </h3>
        <ul style={{fontSize: '0.875rem', color: '#0c4a6e', lineHeight: '1.5'}}>
          <li><strong>Stock Level Display:</strong> Visual indicators showing available quantity</li>
          <li><strong>Low Stock Warnings:</strong> Alert when inventory drops below 5 items</li>
          <li><strong>Out of Stock Notifications:</strong> Clear messaging when items are unavailable</li>
          <li><strong>Back-in-Stock Email Signup:</strong> Customer notification system for restocked items</li>
          <li><strong>Pre-order Functionality:</strong> Allow customers to order unavailable items</li>
          <li><strong>Inventory Analytics:</strong> Track customer behavior around stock levels</li>
        </ul>
      </div>
    </div>
  );
}