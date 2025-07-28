import {useMemo} from 'react';
import type {SeoConfig} from '~/lib/seo';
import {
  generateOpenGraphTags,
  generateTwitterCardTags,
  generateCanonicalUrl,
  truncateText,
} from '~/lib/seo';

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  structuredData?: object | object[];
  canonicalUrl?: string;
  config?: SeoConfig;
}

interface MetaTag {
  title?: string;
  name?: string;
  content?: string;
  property?: string;
  rel?: string;
  href?: string;
}

/**
 * SEO component that generates meta tags, Open Graph, Twitter Cards, and structured data
 */
export function Seo({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  structuredData,
  canonicalUrl,
  config = {},
}: SeoProps) {
  const {
    defaultTitle = 'Hydrogen Storefront',
    titleTemplate = '%s | Hydrogen',
    defaultDescription = 'Modern e-commerce experience powered by Shopify Hydrogen',
    siteUrl = '',
    defaultImage,
    twitterSite,
    twitterCreator,
  } = config;

  const metaTags = useMemo(() => {
    const finalTitle = title ? titleTemplate.replace('%s', title) : defaultTitle;
    const finalDescription = description ? truncateText(description) : defaultDescription;
    const finalImage = image || defaultImage;
    const finalUrl = url || canonicalUrl || '';
    const finalCanonicalUrl = canonicalUrl || (siteUrl && url ? generateCanonicalUrl(url, siteUrl) : '');

    const tags: MetaTag[] = [
      {title: finalTitle},
      ...(finalDescription ? [{name: 'description', content: finalDescription}] : []),
      ...(noIndex ? [{name: 'robots', content: 'noindex,nofollow'}] : []),
      ...(finalCanonicalUrl ? [{rel: 'canonical', href: finalCanonicalUrl}] : []),
    ];

    // Add Open Graph tags
    if (finalTitle) {
      tags.push(...generateOpenGraphTags({
        title: finalTitle,
        description: finalDescription,
        image: finalImage,
        url: finalUrl,
        type,
        siteName: defaultTitle,
      }));
    }

    // Add Twitter Card tags
    if (finalTitle) {
      tags.push(...generateTwitterCardTags({
        title: finalTitle,
        description: finalDescription,
        image: finalImage,
        site: twitterSite,
        creator: twitterCreator,
      }));
    }

    return tags;
  }, [
    title,
    description,
    image,
    url,
    type,
    noIndex,
    canonicalUrl,
    config,
    defaultTitle,
    titleTemplate,
    defaultDescription,
    siteUrl,
    defaultImage,
    twitterSite,
    twitterCreator,
  ]);

  const structuredDataScript = useMemo(() => {
    if (!structuredData) return null;

    const data = Array.isArray(structuredData) ? structuredData : [structuredData];
    
    return {
      __html: JSON.stringify(data.length === 1 ? data[0] : data),
    };
  }, [structuredData]);

  return (
    <>
      {metaTags.map((tag, index) => {
        if ('title' in tag) {
          return <title key={`title-${index}`}>{tag.title}</title>;
        }
        if ('name' in tag) {
          return <meta key={`meta-${index}`} name={tag.name} content={tag.content} />;
        }
        if ('property' in tag) {
          return <meta key={`og-${index}`} property={tag.property} content={tag.content} />;
        }
        if ('rel' in tag) {
          return <link key={`link-${index}`} rel={tag.rel} href={tag.href} />;
        }
        return null;
      })}
      {structuredDataScript && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={structuredDataScript}
        />
      )}
    </>
  );
}