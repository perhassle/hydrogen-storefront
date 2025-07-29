import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useLazyLoading} from '~/lib/intersection-observer';
import {WishlistButton} from './WishlistButton';

export function ProductItem({
  product,
  loading = 'lazy',
  enableLazyLoading = true,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
  enableLazyLoading?: boolean;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const [ref, isIntersecting, hasIntersected] = useLazyLoading();

  // Determine actual loading strategy
  const shouldLoad = !enableLazyLoading || loading === 'eager' || hasIntersected;
  const imageLoading = loading === 'eager' ? 'eager' : (shouldLoad ? 'lazy' : undefined);

  // Get the first available variant to check stock status
  const firstVariant = product.variants?.nodes?.[0];
  const isOutOfStock = 'availableForSale' in product ? !product.availableForSale : !firstVariant?.availableForSale;
  const hasQuantityData = firstVariant && 'quantityAvailable' in firstVariant;
  const quantityAvailable = hasQuantityData ? firstVariant.quantityAvailable : null;
  const hasLimitedStock = quantityAvailable && quantityAvailable <= 10 && quantityAvailable > 0;
  const isLowStock = quantityAvailable && quantityAvailable < 5;

  return (
    <div ref={ref} className="relative">
      <Link
        className="product-item"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        {image && shouldLoad && (
          <div className="product-item-image-container relative">
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={imageLoading}
              sizes="(min-width: 45em) 400px, 100vw"
            />
            {isOutOfStock && (
              <div className="product-item-stock-overlay out-of-stock">
                Out of Stock
              </div>
            )}
            {!isOutOfStock && isLowStock && quantityAvailable && (
              <div className="product-item-stock-overlay low-stock">
                Only {quantityAvailable} left!
              </div>
            )}
            {/* Wishlist button overlay */}
            <div className="absolute top-2 right-2 z-10">
              <WishlistButton
                product={{
                  id: product.id,
                  handle: product.handle,
                  title: product.title,
                  featuredImage: image ? {
                    url: image.url,
                    altText: image.altText,
                  } : null,
                  priceRange: product.priceRange,
                }}
                size="md"
                className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-sm"
              />
            </div>
          </div>
        )}
        {image && !shouldLoad && (
          <div 
            className="product-image-placeholder"
            style={{
              aspectRatio: '1/1',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            <span style={{ color: '#999', fontSize: '14px' }}>Loading...</span>
          </div>
        )}
        <h4>{product.title}</h4>
        <small>
          <Money data={product.priceRange.minVariantPrice} />
        </small>
        
        {/* Stock status indicator for product items */}
        {isOutOfStock ? (
          <div className="product-item-status out-of-stock">
            <span>⭕</span> Out of Stock
          </div>
        ) : isLowStock && quantityAvailable ? (
          <div className="product-item-status low-stock urgent">
            <span>⚠️</span> Only {quantityAvailable} left - Order now!
          </div>
        ) : hasLimitedStock && quantityAvailable ? (
          <div className="product-item-status limited-stock">
            <span>📦</span> {quantityAvailable} in stock
          </div>
        ) : quantityAvailable ? (
          <div className="product-item-status in-stock">
            <span>🟠</span> {quantityAvailable} in stock
          </div>
        ) : (
          <div className="product-item-status in-stock">
            <span>🟠</span> In Stock
          </div>
        )}
      </Link>
    </div>
  );
}
