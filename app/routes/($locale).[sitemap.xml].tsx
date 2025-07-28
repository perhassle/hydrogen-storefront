import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getSitemapIndex} from '@shopify/hydrogen';

export async function loader({
  request,
  context: {storefront, env},
}: LoaderFunctionArgs) {
  // Check if we're in local development mode
  const isLocalDev = env.PUBLIC_STOREFRONT_API_TOKEN === 'mock-token';
  
  if (isLocalDev) {
    // Return a simple mock sitemap for development
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap_pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap_products.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap_collections.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new Response(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `max-age=${60 * 60 * 24}`,
      },
    });
  }

  const response = await getSitemapIndex({
    storefront,
    request,
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
