import { useEffect } from 'react';

export type PageMetaInput = {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string;
  jsonLdSchema?: Record<string, any>;
};

export function usePageMeta({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://recrutaria.com.br/og-image.jpg',
  keywords,
  jsonLdSchema,
}: PageMetaInput) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const previousTitle = document.title;
    document.title = title;

    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
      return meta;
    };

    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
      return link;
    };

    // Standard Meta Tags
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);

    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:image', ogImage, true);
    if (canonicalUrl) setMetaTag('og:url', canonicalUrl, true);

    // Twitter Cards
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Canonical
    if (canonicalUrl) {
      setLinkTag('canonical', canonicalUrl);
    }

    // JSON-LD Schema (AIO)
    let schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (jsonLdSchema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(jsonLdSchema);
    } else if (schemaScript) {
      // Remove if not provided to avoid polluting next page
      schemaScript.remove();
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, canonicalUrl, ogImage, keywords, jsonLdSchema]);
}
