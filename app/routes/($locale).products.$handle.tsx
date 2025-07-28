import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Seo, Breadcrumbs} from '~/components/seo';
import {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
  stripHtml,
  type SeoConfig,
  type BreadcrumbItem,
} from '~/lib/seo';

export const meta: MetaFunction<typeof loader> = ({data, location}) => {
  if (!data?.product) {
    return [{title: 'Product Not Found'}];
  }

  const {product} = data;
  const variant = product.selectedOrFirstAvailableVariant || product.variants?.nodes?.[0];
  const title = product.seo?.title || product.title;
  const description = product.seo?.description || stripHtml(product.descriptionHtml || product.description || '');
  const image = variant?.image?.url || product.featuredImage?.url;
  const url = location.pathname;

  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'product'},
    {property: 'og:url', content: url},
    ...(image ? [{property: 'og:image', content: image}] : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    ...(image ? [{name: 'twitter:image', content: image}] : []),
    {rel: 'canonical', href: url},
  ];
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
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront, env} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // Check if we're in local development mode
  const isLocalDev = env.PUBLIC_STOREFRONT_API_TOKEN === 'mock-token';
  
  if (isLocalDev) {
    // Return mock product data
    return {
      product: {
        id: 'gid://shopify/Product/1',
        title: handle === 'demo-product-1' ? 'Demo Product 1' : 'Demo Product 2',
        vendor: 'Demo Vendor',
        handle,
        descriptionHtml: `<p>This is a demo product description for ${handle}. It showcases the SEO implementation with structured data.</p>`,
        description: `This is a demo product description for ${handle}. It showcases the SEO implementation with structured data.`,
        featuredImage: {
          url: `https://via.placeholder.com/600x600?text=${handle}`,
          altText: handle === 'demo-product-1' ? 'Demo Product 1' : 'Demo Product 2',
          width: 600,
          height: 600,
        },
        selectedOrFirstAvailableVariant: {
          id: 'gid://shopify/ProductVariant/1',
          availableForSale: true,
          price: {
            amount: handle === 'demo-product-1' ? '19.99' : '29.99',
            currencyCode: 'USD',
          },
          compareAtPrice: null,
          image: {
            url: `https://via.placeholder.com/600x600?text=${handle}`,
            altText: handle === 'demo-product-1' ? 'Demo Product 1' : 'Demo Product 2',
          },
          sku: `DEMO-${handle.toUpperCase()}`,
          title: 'Default Title',
          selectedOptions: [
            { name: 'Title', value: 'Default Title' }
          ],
          product: {
            handle,
            title: handle === 'demo-product-1' ? 'Demo Product 1' : 'Demo Product 2',
          },
        },
        adjacentVariants: [],
        variants: {
          nodes: [],
        },
        options: [],
        seo: {
          title: handle === 'demo-product-1' ? 'Demo Product 1 - Best Choice' : 'Demo Product 2 - Premium Option',
          description: `Buy ${handle === 'demo-product-1' ? 'Demo Product 1' : 'Demo Product 2'} today. High quality product with great features.`,
        },
        encodedVariantExistence: '',
        encodedVariantAvailability: '',
      },
    };
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: LoaderFunctionArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  // Generate breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    {name: 'Home', url: '/'},
    {name: 'Products', url: '/collections/all'},
    {name: title, url: `/products/${product.handle}`},
  ];

  // Generate structured data
  const productStructuredData = generateProductStructuredData({
    product,
    selectedVariant,
    url: `/products/${product.handle}`,
  });

  const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbs);

  return (
    <>
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productStructuredData, breadcrumbStructuredData]),
        }}
      />
      
      <div className="product">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbs} includeStructuredData={false} />
        </div>

        <ProductImage 
          image={selectedVariant?.image} 
          loading="eager"
          priority={true}
        />
        <div className="product-main">
          <h1>{title}</h1>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <br />
          {/* ProductForm temporarily disabled for demo due to AsideProvider requirement */}
          {/* <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          /> */}
          <br />
          <br />
          <p>
            <strong>Description</strong>
          </p>
          <br />
          <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          <br />
        </div>
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>
    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    featuredImage {
      url
      altText
      width
      height
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
