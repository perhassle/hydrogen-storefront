import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction, Await} from 'react-router';
import {Suspense} from 'react';
import {Link} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home spotlight-home">
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}


function FeaturedCollection({
  collection,
}: {
  collection: any;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <section className="hero-section">
      <div className="hero-content">
        {image && (
          <div className="hero-image">
            <img src={image.url} alt={image.altText} />
            <div className="hero-overlay">
              <div className="hero-text">
                <h1 className="hero-title">{collection.title}</h1>
                <Link to={`/collections/${collection.handle}`} className="hero-cta">
                  Shop Collection
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<any> | null;
}) {
  return (
    <section className="products-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Discover our most popular items</p>
        </div>
        <Suspense fallback={<div className="loading-state">Loading products...</div>}>
          <Await resolve={products}>
            {(response) => (
              <div className="products-grid">
                {response?.products?.nodes?.map((product: any) => (
                  <RecommendedProduct key={product.id} product={product} />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function RecommendedProduct({product}: {product: any}) {
  return (
    <div className="product-card">
      <div className="product-image-container">
        {product.featuredImage && (
          <Link to={`/products/${product.handle}`} className="product-image-link">
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              className="product-image"
            />
          </Link>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-title">
          <Link to={`/products/${product.handle}`} className="product-title-link">
            {product.title}
          </Link>
        </h3>
        <p className="product-price">
          {product.priceRange?.minVariantPrice?.amount} {product.priceRange?.minVariantPrice?.currencyCode}
        </p>
        <Link 
          to={`/products/${product.handle}`}
          className="product-cta"
        >
          View Product
        </Link>
      </div>
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
