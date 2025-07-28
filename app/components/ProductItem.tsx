import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useLazyLoading} from '~/lib/intersection-observer';

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

  return (
    <div ref={ref}>
      <Link
        className="product-item"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        {image && shouldLoad && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={imageLoading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
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
      </Link>
    </div>
  );
}
