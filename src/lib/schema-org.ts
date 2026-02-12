/**
 * Schema.org JSON-LD generator for SEO
 * Generates structured data for various content types
 */

import type { SEOMetadata } from '@/types/database';

export type SchemaType =
  | 'Article'
  | 'BlogPosting'
  | 'Product'
  | 'Service'
  | 'FAQPage'
  | 'WebPage'
  | 'Organization'
  | 'BreadcrumbList';

interface SchemaOrgOptions {
  type: SchemaType;
  organizationName?: string;
  organizationLogo?: string;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
  faqItems?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; url: string }>;
  // Product/Service specific
  price?: string;
  currency?: string;
  availability?: string;
  rating?: number;
  ratingCount?: number;
}

/**
 * Generate Schema.org JSON-LD structured data based on page metadata
 */
export function generateSchema(
  page: SEOMetadata,
  options: SchemaOrgOptions,
  baseUrl: string
): Record<string, any> | null {
  const pageUrl = `${baseUrl}/${page.slug}`;
  
  switch (options.type) {
    case 'Article':
    case 'BlogPosting':
      return generateArticleSchema(page, options, pageUrl);
    
    case 'Product':
      return generateProductSchema(page, options, pageUrl);
    
    case 'Service':
      return generateServiceSchema(page, options, pageUrl);
    
    case 'FAQPage':
      return generateFAQSchema(page, options, pageUrl);
    
    case 'WebPage':
      return generateWebPageSchema(page, options, pageUrl);
    
    case 'Organization':
      return generateOrganizationSchema(options, baseUrl);
    
    case 'BreadcrumbList':
      return generateBreadcrumbSchema(options, baseUrl);
    
    default:
      return null;
  }
}

function generateArticleSchema(
  page: SEOMetadata,
  options: SchemaOrgOptions,
  url: string
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': options.type,
    headline: page.title,
    description: page.meta_description || page.description || '',
    url,
    datePublished: options.datePublished || page.published_at || page.created_at,
    dateModified: options.dateModified || page.updated_at,
    author: {
      '@type': 'Person',
      name: options.authorName || 'Rédacteur',
    },
    ...(page.og_image && {
      image: page.og_image,
    }),
    ...(options.organizationName && {
      publisher: {
        '@type': 'Organization',
        name: options.organizationName,
        ...(options.organizationLogo && {
          logo: {
            '@type': 'ImageObject',
            url: options.organizationLogo,
          },
        }),
      },
    }),
  };
}

function generateProductSchema(
  page: SEOMetadata,
  options: SchemaOrgOptions,
  url: string
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: page.title,
    description: page.meta_description || page.description || '',
    url,
    ...(page.og_image && {
      image: page.og_image,
    }),
    ...(options.price && {
      offers: {
        '@type': 'Offer',
        price: options.price,
        priceCurrency: options.currency || 'EUR',
        availability: `https://schema.org/${options.availability || 'InStock'}`,
        url,
      },
    }),
    ...(options.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: options.rating,
        reviewCount: options.ratingCount || 1,
      },
    }),
  };
}

function generateServiceSchema(
  page: SEOMetadata,
  options: SchemaOrgOptions,
  url: string
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.title,
    description: page.meta_description || page.description || '',
    url,
    ...(page.og_image && {
      image: page.og_image,
    }),
    ...(options.organizationName && {
      provider: {
        '@type': 'Organization',
        name: options.organizationName,
      },
    }),
  };
}

function generateFAQSchema(
  page: SEOMetadata,
  options: SchemaOrgOptions,
  url: string
): Record<string, any> {
  if (!options.faqItems || options.faqItems.length === 0) {
    return generateWebPageSchema(page, options, url);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: options.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function generateWebPageSchema(
  page: SEOMetadata,
  options: SchemaOrgOptions,
  url: string
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.meta_description || page.description || '',
    url,
    ...(page.og_image && {
      image: page.og_image,
    }),
  };
}

function generateOrganizationSchema(
  options: SchemaOrgOptions,
  baseUrl: string
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: options.organizationName || 'Organization',
    url: baseUrl,
    ...(options.organizationLogo && {
      logo: options.organizationLogo,
    }),
  };
}

function generateBreadcrumbSchema(
  options: SchemaOrgOptions,
  baseUrl: string
): Record<string, any> | null {
  if (!options.breadcrumbs || options.breadcrumbs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: options.breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Extract FAQ items from page content
 * Looks for common FAQ HTML patterns
 */
export function extractFAQFromContent(html: string): Array<{ question: string; answer: string }> {
  const faqItems: Array<{ question: string; answer: string }> = [];
  
  // Simple regex-based extraction for common patterns
  // This is a basic implementation - can be enhanced
  const parser = typeof window !== 'undefined' ? new DOMParser() : null;
  if (!parser) return faqItems;

  try {
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for dt/dd pairs (definition list)
    const dts = doc.querySelectorAll('dt');
    dts.forEach((dt) => {
      const dd = dt.nextElementSibling;
      if (dd && dd.tagName === 'DD') {
        faqItems.push({
          question: dt.textContent?.trim() || '',
          answer: dd.textContent?.trim() || '',
        });
      }
    });

    // Look for h3/p pairs
    if (faqItems.length === 0) {
      const headings = doc.querySelectorAll('h3, h4');
      headings.forEach((h) => {
        const nextP = h.nextElementSibling;
        if (nextP && nextP.tagName === 'P') {
          faqItems.push({
            question: h.textContent?.trim() || '',
            answer: nextP.textContent?.trim() || '',
          });
        }
      });
    }
  } catch (err) {
    console.error('Error extracting FAQ:', err);
  }

  return faqItems;
}

/**
 * Generate multiple schemas for a page (can include multiple types)
 */
export function generateMultipleSchemas(
  page: SEOMetadata,
  schemas: SchemaOrgOptions[],
  baseUrl: string
): Array<Record<string, any>> {
  return schemas
    .map((schema) => generateSchema(page, schema, baseUrl))
    .filter((s): s is Record<string, any> => s !== null);
}
