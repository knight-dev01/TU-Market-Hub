export const getRelativeTime = (timestamp: any): string => {
  if (!timestamp) return '';
  
  let date: Date;
  // Handle Firestore Timestamp object (both class instance and plain JSON object)
  if (typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return '';
  }

  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
};

export const calculateDiscount = (price: number, discountPercentage?: number | null) => {
  if (!discountPercentage || discountPercentage <= 0) {
    return {
      hasDiscount: false,
      originalPrice: price,
      discountedPrice: price,
      discountPercentage: 0
    };
  }

  // Ensure discount isn't > 100% or < 0%
  const validDiscount = Math.max(0, Math.min(100, discountPercentage));
  
  const discounted = Math.round(price - (price * validDiscount / 100));
  
  return {
    hasDiscount: validDiscount > 0,
    originalPrice: price,
    discountedPrice: Math.min(price, Math.max(0, discounted)),
    discountPercentage: validDiscount
  };
};

export function updateProductSEO(product: any, activeImageIndex: number) {
  if (typeof window === 'undefined') return;

  const title = `${product.name} | TU Market Hub`;
  const description = `${product.description || ''}`.substring(0, 160);
  const imageUrl = product.images?.[activeImageIndex] || product.images?.[0] || '';
  const currentUrl = `${window.location.origin}?product=${product.id}&img=${activeImageIndex}`;

  // 1. Update Title
  document.title = title;

  // 2. Helper to set or create meta tag
  const setMetaTag = (attribute: 'name' | 'property', attrVal: string, contentVal: string) => {
    let element = document.querySelector(`meta[${attribute}="${attrVal}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, attrVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', contentVal);
  };

  // 3. Set standard and social meta tags
  setMetaTag('name', 'description', description);
  
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:url', currentUrl);
  setMetaTag('property', 'og:type', 'product');
  setMetaTag('property', 'og:image:width', '800');
  setMetaTag('property', 'og:image:height', '800');

  // Set Twitter Card properties
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', imageUrl);

  setMetaTag('property', 'twitter:card', 'summary_large_image');
  setMetaTag('property', 'twitter:title', title);
  setMetaTag('property', 'twitter:description', description);
  setMetaTag('property', 'twitter:image', imageUrl);

  // 4. Set Canonical URL Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', currentUrl);

  // 5. Schema.org JSON-LD structured data for Product
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
      "url": currentUrl,
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

export function resetSEO() {
  if (typeof window === 'undefined') return;

  // Restore Default Title
  document.title = "TU Market Hub | Trinity University Campus Marketplace";

  // Helper to update/remove
  const setMetaTag = (attribute: 'name' | 'property', attrVal: string, contentVal: string) => {
    const element = document.querySelector(`meta[${attribute}="${attrVal}"]`);
    if (element) {
      element.setAttribute('content', contentVal);
    }
  };

  // Restore Default Metas
  setMetaTag('name', 'description', "Keep WhatsApp for conversations, use TU Market Hub for organized buying & selling. Centralized, searchable campus peer listings with zero spam and zero commissions.");
  
  setMetaTag('property', 'og:title', "TU Market Hub | Trinity University Campus Marketplace");
  setMetaTag('property', 'og:description', "Keep WhatsApp for conversations, use TU Market Hub for organized listings. The clean, searchable student-to-student catalog for Trinity University with direct WhatsApp checks.");
  setMetaTag('property', 'og:image', `${window.location.origin}/og-image.jpg`);
  setMetaTag('property', 'og:url', window.location.origin);
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:image:width', '1200');
  setMetaTag('property', 'og:image:height', '630');

  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', "TU Market Hub | Trinity University Campus Marketplace");
  setMetaTag('name', 'twitter:description', "Keep WhatsApp for conversations, use TU Market Hub for organized buying & selling. Searchable campus peer listings with zero spam.");
  setMetaTag('name', 'twitter:image', `${window.location.origin}/og-image.jpg`);

  setMetaTag('property', 'twitter:card', 'summary_large_image');
  setMetaTag('property', 'twitter:title', "TU Market Hub | Trinity University Campus Marketplace");
  setMetaTag('property', 'twitter:description', "Keep WhatsApp for conversations, use TU Market Hub for organized buying & selling. Searchable campus peer listings with zero spam.");
  setMetaTag('property', 'twitter:image', `${window.location.origin}/og-image.jpg`);

  // Reset Canonical Link
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', window.location.origin);
  }

  // Remove Product JSON-LD Script
  const jsonLdScript = document.getElementById('product-json-ld');
  if (jsonLdScript) {
    jsonLdScript.remove();
  }
}

