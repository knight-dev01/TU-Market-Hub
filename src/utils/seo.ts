import { Product } from '../types';

/**
 * Dynamically generates and injects Schema.org JSON-LD structured data 
 * and social media meta tags (Open Graph, Twitter Cards, Canonical URL) 
 * for individual product pages into the document <head>.
 * This ensures search engines and social media crawlers detect the correct,
 * specific product images, prices, and descriptions.
 * 
 * @param product The product object
 * @param activeImageIndex Optional index of the currently active/selected image
 */
export function injectProductSchema(product: Product, activeImageIndex: number = 0) {
  if (typeof window === 'undefined') return;

  const origin = window.location.origin;
  const productUrl = `${origin}?product=${product.id}&img=${activeImageIndex}`;
  const title = `${product.name} | TU Market Hub`;
  const description = `${product.description || ''}`.substring(0, 160);
  
  // Ensure the crawler detects the specific selected image
  const imageUrl = product.images?.[activeImageIndex] || product.images?.[0] || '';

  // 1. Set Title
  document.title = title;

  // 2. Set Meta Tag helper
  const setMetaTag = (attribute: 'name' | 'property', attrVal: string, contentVal: string) => {
    let element = document.querySelector(`meta[${attribute}="${attrVal}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, attrVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', contentVal);
  };

  // 3. Inject standard, Open Graph, and Twitter Cards Meta tags for crawler detection
  setMetaTag('name', 'description', description);
  
  // Open Graph / Facebook / LinkedIn
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:url', productUrl);
  setMetaTag('property', 'og:type', 'product');
  setMetaTag('property', 'og:image:width', '800');
  setMetaTag('property', 'og:image:height', '800');

  // Twitter
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', imageUrl);

  // Duplicate Twitter property mappings to cover variations
  setMetaTag('property', 'twitter:card', 'summary_large_image');
  setMetaTag('property', 'twitter:title', title);
  setMetaTag('property', 'twitter:description', description);
  setMetaTag('property', 'twitter:image', imageUrl);

  // 4. Inject Canonical URL Link tag
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', productUrl);

  // 5. Generate and inject JSON-LD Script block
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description,
    "sku": product.id,
    "mpn": product.id,
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "NGN",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": product.condition === 'new' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "TU Market Hub"
      }
    }
  };

  let jsonLdScript = document.getElementById('product-json-ld');
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.setAttribute('id', 'product-json-ld');
    jsonLdScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.textContent = JSON.stringify(schemaData, null, 2);
}

/**
 * Resets the document head SEO and JSON-LD markup back to platform defaults
 * when leaving a specific product detail view.
 */
export function resetProductSchema() {
  if (typeof window === 'undefined') return;

  const origin = window.location.origin;

  // Restore Default Title
  document.title = "TU Market Hub | Trinity University Campus Marketplace";

  const setMetaTag = (attribute: 'name' | 'property', attrVal: string, contentVal: string) => {
    const element = document.querySelector(`meta[${attribute}="${attrVal}"]`);
    if (element) {
      element.setAttribute('content', contentVal);
    }
  };

  // Restore default metas
  const defaultDesc = "Keep WhatsApp for conversations, use TU Market Hub for organized buying & selling. Centralized, searchable campus peer listings with zero spam and zero commissions.";
  
  setMetaTag('name', 'description', defaultDesc);
  setMetaTag('property', 'og:title', "TU Market Hub | Trinity University Campus Marketplace");
  setMetaTag('property', 'og:description', defaultDesc);
  setMetaTag('property', 'og:image', `${origin}/og-image.jpg`);
  setMetaTag('property', 'og:url', origin);
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:image:width', '1200');
  setMetaTag('property', 'og:image:height', '630');

  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', "TU Market Hub | Trinity University Campus Marketplace");
  setMetaTag('name', 'twitter:description', defaultDesc);
  setMetaTag('name', 'twitter:image', `${origin}/og-image.jpg`);

  setMetaTag('property', 'twitter:card', 'summary_large_image');
  setMetaTag('property', 'twitter:title', "TU Market Hub | Trinity University Campus Marketplace");
  setMetaTag('property', 'twitter:description', defaultDesc);
  setMetaTag('property', 'twitter:image', `${origin}/og-image.jpg`);

  // Reset canonical link
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', origin);
  }

  // Remove the product-specific schema script
  const jsonLdScript = document.getElementById('product-json-ld');
  if (jsonLdScript) {
    jsonLdScript.remove();
  }
}
