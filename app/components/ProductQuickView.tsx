import {useState, useEffect} from 'react';
import {
  getSelectedProductOptions,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {ProductPrice} from './ProductPrice';
import {ProductForm} from './ProductForm';
import {ProductImage} from './ProductImage';
import {InventoryStatus} from './InventoryStatus';
import type {ProductFragment} from 'storefrontapi.generated';

interface ProductQuickViewProps {
  product: ProductFragment;
  onClose: () => void;
}

export function ProductQuickView({product, onClose}: ProductQuickViewProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.selectedOrFirstAvailableVariant
  );

  // Optimistically selects a variant with given available variant information
  const optimisticVariant = useOptimisticVariant(
    selectedVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: optimisticVariant,
  });

  const {title, descriptionHtml} = product;

  // Handle variant changes - simplified for quick view
  useEffect(() => {
    setSelectedVariant(product.selectedOrFirstAvailableVariant);
  }, [product]);

  return (
    <div className="product-quick-view">
      <div className="product-quick-view-content">
        {/* Product Images */}
        <div className="product-quick-view-images">
          <ProductImage 
            image={optimisticVariant?.image} 
            loading="eager"
            priority={true}
          />
          {/* TODO: Add image gallery with thumbnails and zoom */}
        </div>

        {/* Product Details */}
        <div className="product-quick-view-details">
          <h2>{title}</h2>
          
          <ProductPrice
            price={optimisticVariant?.price}
            compareAtPrice={optimisticVariant?.compareAtPrice}
          />
          
          {/* Inventory Status */}
          <InventoryStatus selectedVariant={optimisticVariant} product={product} />
          
          {/* Product Form with variant selection and add to cart */}
          <ProductForm
            productOptions={productOptions}
            selectedVariant={optimisticVariant}
          />
          
          {/* Product Description */}
          {descriptionHtml && (
            <div className="product-quick-view-description">
              <h3>Description</h3>
              <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}