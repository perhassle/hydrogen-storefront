import {useState, useEffect} from 'react';
import {
  getSelectedProductOptions,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  Image,
} from '@shopify/hydrogen';
import {ProductPrice} from './ProductPrice';
import {ProductForm} from './ProductForm';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

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

  // Create images array - use variant image first, then product images
  const images = [];
  if (optimisticVariant?.image) {
    images.push(optimisticVariant.image);
  }
  if (product.images?.nodes) {
    // Add other product images that aren't the current variant image
    product.images.nodes.forEach((image) => {
      if (!optimisticVariant?.image || image.id !== optimisticVariant.image.id) {
        images.push(image);
      }
    });
  }
  // Fallback to featured image if no other images
  if (images.length === 0 && product.featuredImage) {
    images.push(product.featuredImage);
  }

  // Handle variant changes - update selected image if variant has a different image
  useEffect(() => {
    setSelectedVariant(product.selectedOrFirstAvailableVariant);
    if (optimisticVariant?.image) {
      const variantImageIndex = images.findIndex(
        (img) => img.id === optimisticVariant.image?.id
      );
      if (variantImageIndex >= 0) {
        setSelectedImageIndex(variantImageIndex);
      }
    }
  }, [product, optimisticVariant?.image?.id]);

  const currentImage = images[selectedImageIndex];

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleThumbnailClick = (index: number) => {
    setImageLoading(true);
    setSelectedImageIndex(index);
  };

  return (
    <div className="product-quick-view">
      <div className="product-quick-view-content">
        {/* Product Images */}
        <div className="product-quick-view-images">
          {currentImage && (
            <div className="product-quick-view-main-image">
              {imageLoading && (
                <div className="quick-view-image-loading">
                  <div className="loading-spinner"></div>
                </div>
              )}
              <Image 
                data={currentImage}
                loading="eager"
                sizes="(min-width: 768px) 400px, 90vw"
                className={`quick-view-image ${imageLoading ? 'loading' : ''}`}
                onLoad={handleImageLoad}
              />
            </div>
          )}
          
          {/* Image thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="product-quick-view-thumbnails">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`quick-view-thumbnail ${
                    index === selectedImageIndex ? 'active' : ''
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    data={image}
                    sizes="80px"
                    className="thumbnail-image"
                  />
                </button>
              ))}
            </div>
          )}
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