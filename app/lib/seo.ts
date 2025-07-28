import type {Product, ProductVariant, Collection} from '@shopify/hydrogen/storefront-api-types';

export interface SeoConfig {
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  siteUrl?: string;
  defaultImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ProductSeoData {
  product: any; // More flexible type to handle GraphQL response variations
  selectedVariant?: any;
  url: string;
}

export interface CollectionSeoData {
  collection: any; // More flexible type to handle GraphQL response variations
  url: string;
}

/**
 * Generate structured data for products following Schema.org Product specification
 */
export function generateProductStructuredData(data: ProductSeoData) {
  const {product, selectedVariant, url} = data;
  const variant = selectedVariant || product.variants?.nodes?.[0];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.seo?.title || product.title,
    description: product.seo?.description || product.description,
    url,
    image: variant?.image?.url || product.featuredImage?.url,
    brand: {
      '@type': 'Brand',
      name: product.vendor,
    },
    sku: variant?.sku,
    ...(variant?.availableForSale && {
      offers: {
        '@type': 'Offer',
        availability: variant.availableForSale 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        price: variant.price?.amount,
        priceCurrency: variant.price?.currencyCode,
        url,
        seller: {
          '@type': 'Organization',
          name: product.vendor,
        },
      },
    }),
  };

  return structuredData;
}

/**
 * Generate structured data for collections
 */
export function generateCollectionStructuredData(data: CollectionSeoData) {
  const {collection, url} = data;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.seo?.title || collection.title,
    description: collection.seo?.description || collection.description,
    url,
    ...(collection.image && {
      image: collection.image.url,
    }),
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName,
}: {
  title: string;
  description?: string;
  image?: string;
  url: string;
  type?: 'website' | 'product' | 'article';
  siteName?: string;
}) {
  const tags = [
    {property: 'og:title', content: title},
    {property: 'og:type', content: type},
    {property: 'og:url', content: url},
    ...(description ? [{property: 'og:description', content: description}] : []),
    ...(image ? [{property: 'og:image', content: image}] : []),
    ...(siteName ? [{property: 'og:site_name', content: siteName}] : []),
  ];

  return tags;
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags({
  title,
  description,
  image,
  card = 'summary_large_image',
  site,
  creator,
}: {
  title: string;
  description?: string;
  image?: string;
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
}) {
  const tags = [
    {name: 'twitter:card', content: card},
    {name: 'twitter:title', content: title},
    ...(description ? [{name: 'twitter:description', content: description}] : []),
    ...(image ? [{name: 'twitter:image', content: image}] : []),
    ...(site ? [{name: 'twitter:site', content: site}] : []),
    ...(creator ? [{name: 'twitter:creator', content: creator}] : []),
  ];

  return tags;
}

/**
 * Generate canonical URL with proper formatting
 */
export function generateCanonicalUrl(path: string, baseUrl?: string): string {
  if (!baseUrl) {
    return path;
  }
  
  // Remove trailing slash from baseUrl and leading slash from path if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBaseUrl}${cleanPath}`;
}

/**
 * Truncate text for meta descriptions with word boundary respect
 */
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Generate SEO-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract plain text from HTML
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}