import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';

import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';

import {Aside, useAside} from './components/Aside';
import {ProductQuickView} from './components/ProductQuickView';


export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {
      rel: 'dns-prefetch',
      href: 'https://fonts.googleapis.com',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
    // Preload critical CSS
    {
      rel: 'preload',
      href: tailwindCss,
      as: 'style',
    },
    {
      rel: 'preload',
      href: resetStyles,
      as: 'style',
    },
    {
      rel: 'preload',
      href: appStyles,
      as: 'style',
    },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const {env} = args.context;
  
  // Check if we're in local development mode
  const isLocalDev = env.PUBLIC_STOREFRONT_API_TOKEN === 'mock-token';
  
  if (isLocalDev) {
    return {
      cart: Promise.resolve(null),
      isLoggedIn: Promise.resolve(false),
      footer: Promise.resolve(null),
      publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
      shop: Promise.resolve(null),
      consent: {
        checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
        storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        withPrivacyBanner: false,
        country: args.context.storefront.i18n.country,
        language: args.context.storefront.i18n.language,
      },
      header: {
        shop: {
          id: 'gid://shopify/Shop/1',
          name: 'Demo Shop',
          description: 'A demo shop for local development',
          primaryDomain: {
            url: 'https://demo-shop.myshopify.com',
          },
        },
        menu: {
          id: 'gid://shopify/Menu/1',
          items: [
            { 
              id: 'gid://shopify/MenuItem/1',
              type: 'URL',
              title: 'Home', 
              url: '/',
              tags: [],
              resourceId: null,
              items: [],
            },
            { 
              id: 'gid://shopify/MenuItem/2',
              type: 'URL',
              title: 'Products', 
              url: '/collections/all',
              tags: [],
              resourceId: null,
              items: [],
            },
          ],
        },
      },
    };
  }

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront, env} = context;
  
  // Use mock data for local development
  const isLocalDev = env.PUBLIC_STOREFRONT_API_TOKEN === 'mock-token';
  
  if (isLocalDev) {
    return {
      header: {
        shop: {
          id: 'gid://shopify/Shop/1',
          name: 'Demo Shop',
          description: 'A demo shop for local development',
          primaryDomain: {
            url: 'https://demo-shop.myshopify.com',
          },
        },
        menu: {
          items: [
            { title: 'Home', url: '/' },
            { title: 'Products', url: '/collections/all' },
          ],
        },
      },
    };
  }

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* Performance and SEO optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <WishlistProvider>
            {data.header?.shop?.name === 'Demo Shop' ? (

              // Simple layout for local development with AsideProvider for quick view
              <Aside.Provider>
                <DemoQuickViewAside />

                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center py-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                          {data.header.shop.name}
                        </h1>
                        <nav className="flex space-x-8">
                          <a href="/" className="text-gray-500 hover:text-gray-900">
                            Home
                          </a>
                          <a href="/collections/all" className="text-gray-500 hover:text-gray-900">
                            Products
                          </a>

                          <a href="/quick-view-demo" className="text-gray-500 hover:text-gray-900">
                            Quick View Demo

                          </a>
                        </nav>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                  </main>
                  <footer className="bg-white border-t mt-auto">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                      <p className="text-center text-gray-400">
                        Demo Hydrogen Storefront - Local Development Mode
                      </p>
                    </div>
                  </footer>
                </div>

              </Aside.Provider>

            ) : (
              <PageLayout {...(data as any)}>{children}</PageLayout>
            )}
            </WishlistProvider>
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        {/* Register service worker for performance */}
        <script nonce={nonce} dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            }
          `
        }} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

function DemoQuickViewAside() {
  const {quickViewProduct, close} = useAside();
  
  return (
    <Aside type="quickview" heading="QUICK VIEW">
      {quickViewProduct ? (
        <ProductQuickView product={quickViewProduct} onClose={close} />
      ) : (
        <p>Loading product...</p>
      )}
    </Aside>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
