import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
  loading = 'eager',
  sizes = '(min-width: 45em) 50vw, 100vw',
  priority = false,
}: {
  image: ProductVariantFragment['image'];
  loading?: 'eager' | 'lazy';
  sizes?: string;
  priority?: boolean;
}) {
  if (!image) {
    return <div className="product-image" />;
  }

  // Enhanced sizes for better responsive loading
  const responsiveSizes = sizes || [
    '(min-width: 1024px) 50vw',
    '(min-width: 768px) 60vw', 
    '(min-width: 640px) 80vw',
    '100vw'
  ].join(', ');

  return (
    <div className="product-image">
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        loading={priority ? 'eager' : loading}
        sizes={responsiveSizes}
        // Add width and height hints for better CLS
        width={image.width || undefined}
        height={image.height || undefined}
      />
    </div>
  );
}
