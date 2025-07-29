import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {Suspense} from 'react';
import {Await} from 'react-router';

interface RelatedProduct {
  id: string;
  title: string;
  handle: string;
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
        <h2 className="related-products-title">Du kanske också gillar</h2>
        <Suspense fallback={<div className="related-products-loading">Laddar liknande produkter...</div>}>
          <Await resolve={products}>
            {(response) => {
              if (!response) return null;
              
              // Get products from collection first, then fallback to general products
              let relatedProducts: RelatedProduct[] = [];
              
              if (response.product?.collections?.nodes?.[0]?.products?.nodes) {
                relatedProducts = response.product.collections.nodes[0].products.nodes;
              }
              
              // If not enough products from collection, add from general products
              if (relatedProducts.length < 6 && response.products?.nodes) {
                const additionalProducts = response.products.nodes.filter(
                  (product: RelatedProduct) => 
                    product.id !== currentProductId && 
                    !relatedProducts.find(existing => existing.id === product.id)
                );
                relatedProducts = [...relatedProducts, ...additionalProducts];
              }
              
              // Filter out current product and limit to 8 products
              const filteredProducts = relatedProducts
                .filter(product => product.id !== currentProductId)
                .slice(0, 8);

              if (filteredProducts.length === 0) return null;

              return (
                <div className="related-products-container">
                  <div className="related-products-scroll">
                    {filteredProducts.map((product) => (
                      <RelatedProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
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
            <Money data={product.priceRange.minVariantPrice} />
          </p>
        </div>
      </Link>
    </div>
  );
}