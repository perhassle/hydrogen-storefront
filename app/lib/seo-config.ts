import type {SeoConfig} from '~/lib/seo';

/**
 * Global SEO configuration for the Hydrogen storefront
 */
export const seoConfig: SeoConfig = {
  defaultTitle: 'Hydrogen Storefront',
  titleTemplate: '%s | Hydrogen Storefront',
  defaultDescription: 'Modern e-commerce experience powered by Shopify Hydrogen. Discover amazing products with fast, sustainable shopping.',
  siteUrl: '', // Will be set dynamically in the application
  defaultImage: '/images/og-default.jpg', // You can add a default Open Graph image
  twitterSite: '@hydrogen', // Replace with your Twitter handle
  twitterCreator: '@shopify', // Replace with your Twitter handle
};

/**
 * Organization structured data for the website
 */
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hydrogen Storefront',
  url: seoConfig.siteUrl,
  logo: `${seoConfig.siteUrl}/logo.png`, // Add your logo URL
  sameAs: [
    // Add your social media URLs
    'https://twitter.com/shopify',
    'https://www.facebook.com/shopify',
    'https://www.instagram.com/shopify',
  ],
};

/**
 * Website structured data
 */
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: seoConfig.defaultTitle,
  url: seoConfig.siteUrl,
  description: seoConfig.defaultDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${seoConfig.siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};