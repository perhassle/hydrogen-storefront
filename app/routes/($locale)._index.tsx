import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction, Await} from 'react-router';
import {Suspense} from 'react';
import {Link} from 'react-router';
import type {
  FeaturedCollectionFragment,
  RecommendedProductFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {SkeletonProductGrid, ErrorBoundary} from '~/components/Skeleton';

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
  const {env} = context;
  
  // Check if we're in local development mode
  const isLocalDev = env.PUBLIC_STOREFRONT_API_TOKEN === 'mock-token';
  
  if (isLocalDev) {
    return {
      featuredCollection: {
        id: 'gid://shopify/Collection/1',
        title: 'Featured Collection',
        handle: 'featured',
        image: {
          url: 'https://via.placeholder.com/400x300?text=Featured+Collection',
          altText: 'Featured collection',
        },
      },
    };
  }

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
  const {env} = context;
  
  // Check if we're in local development mode
  const isLocalDev = env.PUBLIC_STOREFRONT_API_TOKEN === 'mock-token';
  
  if (isLocalDev) {
    return {
      recommendedProducts: Promise.resolve({
        products: {
          nodes: [
            {
              id: 'gid://shopify/Product/1',
              title: 'Demo Product 1',
              handle: 'demo-product-1',
              priceRange: {
                minVariantPrice: {
                  amount: '19.99',
                  currencyCode: 'USD',
                },
              },
              featuredImage: {
                url: 'https://via.placeholder.com/300x300?text=Product+1',
                altText: 'Demo Product 1',
              },
            },
            {
              id: 'gid://shopify/Product/2',
              title: 'Demo Product 2',
              handle: 'demo-product-2',
              priceRange: {
                minVariantPrice: {
                  amount: '29.99',
                  currencyCode: 'USD',
                },
              },
              featuredImage: {
                url: 'https://via.placeholder.com/300x300?text=Product+2',
                altText: 'Demo Product 2',
              },
            },
          ],
        },
      }),
    };
  }

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
    <div className="home">
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
    <div className="featured-collection">
      {image && (
        <div className="featured-collection-image">
          <img src={image.url} alt={image.altText} />
        </div>
      )}
      <h1>{collection.title}</h1>
    </div>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<any> | null;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <ErrorBoundary>
        <Suspense fallback={<SkeletonProductGrid count={4} className="recommended-products-grid" />}>
          <Await resolve={products}>
            {(response) => (
              <div className="recommended-products-grid">
                {response?.products?.nodes?.map((product: RecommendedProductFragment) => (
                  <RecommendedProduct key={product.id} product={product} />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </ErrorBoundary>
      <br />
    </div>
  );
}

function RecommendedProduct({product}: {product: any}) {
  return (
    <div className="recommended-product bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {product.featuredImage && (
        <Link to={`/products/${product.handle}`}>
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        </Link>
      )}
      <h3 className="text-lg font-semibold mb-2">
        <Link to={`/products/${product.handle}`} className="hover:text-blue-600">
          {product.title}
        </Link>
      </h3>
      <p className="text-2xl font-bold text-green-600 mb-4">
        {product.priceRange?.minVariantPrice?.amount} {product.priceRange?.minVariantPrice?.currencyCode}
      </p>
      <Link 
        to={`/products/${product.handle}`}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full inline-block text-center"
      >
        View Product
      </Link>
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
