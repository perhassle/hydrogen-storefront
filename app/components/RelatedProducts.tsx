import {Link, Await} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {Suspense, useRef, useEffect, useState, useCallback} from 'react';

interface RelatedProduct {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    id: string;
    url: string;
    altText?: string;
    width: number;
    height: number;
  };
}

interface RelatedProductsProps {
  products: Promise<any> | null;
  currentProductId: string;
}

export function RelatedProducts({products, currentProductId}: RelatedProductsProps) {
  return (
    <section className="related-products-section">
      <div className="container">
        <h2 className="related-products-title">You might also like</h2>
        <Suspense fallback={<div className="related-products-loading">Loading related products...</div>}>
          <Await resolve={products}>
            {(response) => {
              if (!response) return null;
              
              // Get products from collection first, then fallback to general products
              let relatedProducts: RelatedProduct[] = [];
              
              // Collect products from all collections the product belongs to
              if (response.product?.collections?.nodes) {
                response.product.collections.nodes.forEach((collection: any) => {
                  if (collection.products?.nodes) {
                    relatedProducts.push(...collection.products.nodes);
                  }
                });
              }
              
              // If not enough products from collections, add from general products
              if (relatedProducts.length < 8 && response.products?.nodes) {
                const additionalProducts = response.products.nodes.filter(
                  (product: RelatedProduct) => 
                    product.id !== currentProductId && 
                    !relatedProducts.find(existing => existing.id === product.id)
                );
                relatedProducts = [...relatedProducts, ...additionalProducts];
              }
              
              // Remove duplicates and filter out current product
              const uniqueProducts = relatedProducts
                .filter((product, index, self) => 
                  product.id !== currentProductId &&
                  self.findIndex(p => p.id === product.id) === index
                )
                .slice(0, 12);

              if (uniqueProducts.length === 0) return null;

              return <RelatedProductsCarousel products={uniqueProducts} />;
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function RelatedProductsCarousel({products}: {products: RelatedProduct[]}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Check scroll position and update navigation buttons
  const checkScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    
    const {scrollLeft, scrollWidth, clientWidth} = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Scroll to specific position
  const scrollTo = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current || isScrolling) return;
    
    setIsScrolling(true);
    const container = scrollRef.current;
    const cardWidth = 200 + 16; // card width + gap
    const scrollAmount = cardWidth * 2; // scroll 2 cards at a time
    
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 300);
  }, [isScrolling]);

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canScrollRight) {
      scrollTo('right');
    } else if (isRightSwipe && canScrollLeft) {
      scrollTo('left');
    }
  };

  // Handle infinite scroll simulation (auto-scroll on hover)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const container = scrollRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      if (products.length <= 4) return; // Don't auto-scroll if few products
      
      intervalId = setInterval(() => {
        if (!canScrollRight) {
          // Reset to beginning when reached end
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollTo('right');
        }
      }, 3000);
    };

    const handleMouseLeave = () => {
      clearInterval(intervalId);
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      container?.removeEventListener('mouseenter', handleMouseEnter);
      container?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canScrollRight, products.length, scrollTo]);

  // Set up scroll event listener
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons(); // Initial check

    return () => container.removeEventListener('scroll', checkScrollButtons);
  }, [checkScrollButtons]);

  return (
    <div className="related-products-container">
      {/* Navigation Buttons */}
      {products.length > 4 && (
        <>
          <button
            type="button"
            className={`related-products-nav related-products-nav-left ${
              !canScrollLeft ? 'disabled' : ''
            }`}
            onClick={() => scrollTo('left')}
            disabled={!canScrollLeft || isScrolling}
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            className={`related-products-nav related-products-nav-right ${
              !canScrollRight ? 'disabled' : ''
            }`}
            onClick={() => scrollTo('right')}
            disabled={!canScrollRight || isScrolling}
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}
      
      {/* Products Scroll Container */}
      <div
        ref={scrollRef}
        className="related-products-scroll"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {products.map((product) => (
          <RelatedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function RelatedProductCard({product}: {product: RelatedProduct}) {
  return (
    <div className="related-product-card">
      <Link to={`/products/${product.handle}`} className="related-product-link">
        {product.featuredImage && (
          <div className="related-product-image-container">
            <Image
              data={product.featuredImage}
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              sizes="(min-width: 768px) 200px, 150px"
              className="related-product-image"
            />
          </div>
        )}
        <div className="related-product-info">
          <h3 className="related-product-title">{product.title}</h3>
          <p className="related-product-price">
            <Money data={product.priceRange.minVariantPrice as any} />
          </p>
        </div>
      </Link>
    </div>
  );
}