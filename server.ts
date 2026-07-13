import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Helper to escape HTML characters safely
function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Highly reliable Firestore REST API fetch to support instant, lightweight server-side retrieval
async function fetchProduct(productId: string) {
  try {
    const projectId = "feisty-cathode-f3jwj";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${productId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    const fields = data.fields || {};
    const name = fields.name?.stringValue || '';
    const description = fields.description?.stringValue || '';
    const condition = fields.condition?.stringValue || '';
    const category = fields.category?.stringValue || '';
    
    let price = 0;
    if (fields.price) {
      price = parseFloat(fields.price.doubleValue || fields.price.integerValue || '0');
    }

    let stock = 0;
    if (fields.stock) {
      stock = parseInt(fields.stock.integerValue || fields.stock.doubleValue || '0', 10);
    }

    const images: string[] = [];
    if (fields.images?.arrayValue?.values) {
      for (const val of fields.images.arrayValue.values) {
        if (val.stringValue) {
          images.push(val.stringValue);
        }
      }
    }
    
    return {
      id: productId,
      name,
      description,
      images,
      price,
      condition,
      stock,
      category
    };
  } catch (err) {
    console.error('Error fetching product from REST:', err);
    return null;
  }
}

// Injects the custom dynamic metadata, Open Graph tags, Twitter cards, and Schema.org JSON-LD structured data
function injectSEOTags(
  html: string, 
  product: { id: string; name: string; description: string; images: string[]; price: number; condition: string; stock: number; category: string }, 
  imgIndex: number, 
  hostOrigin: string
): string {
  const title = `${product.name} | TU Market Hub`;
  const description = `${product.description || ''}`.substring(0, 160);
  const imageUrl = product.images?.[imgIndex] || product.images?.[0] || '';
  const productUrl = `${hostOrigin}?product=${product.id}&img=${imgIndex}`;

  // Replace Title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHTML(title)}</title>`);

  // Replace Description (both standard and facebook/twitter Open Graphs)
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHTML(description)}" />`);
  
  // Replace Open Graph metadata
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHTML(title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHTML(description)}" />`);
  
  if (html.includes('property="og:image"')) {
    html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${escapeHTML(imageUrl)}" />`);
  } else {
    html = html.replace('</head>', `<meta property="og:image" content="${escapeHTML(imageUrl)}" />\n</head>`);
  }

  // Replace Twitter Card metadata
  html = html.replace(/<meta property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${escapeHTML(title)}" />`);
  html = html.replace(/<meta property="twitter:description" content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${escapeHTML(description)}" />`);
  
  if (html.includes('property="twitter:image"')) {
    html = html.replace(/<meta property="twitter:image" content="[^"]*"\s*\/?>/, `<meta property="twitter:image" content="${escapeHTML(imageUrl)}" />`);
  } else {
    html = html.replace('</head>', `<meta property="twitter:image" content="${escapeHTML(imageUrl)}" />\n</head>`);
  }

  // Generate complete Schema.org JSON-LD
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

  const extraHeadInjections = `
    <link rel="canonical" href="${escapeHTML(productUrl)}" />
    <script type="application/ld+json" id="product-json-ld">
${JSON.stringify(schemaData, null, 2)}
    </script>
  `;

  // Append new tags right before closing head
  html = html.replace('</head>', `${extraHeadInjections}\n</head>`);

  return html;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    app.get("/", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        
        // Read raw template index.html
        let html = await fs.promises.readFile(path.resolve(process.cwd(), "index.html"), "utf-8");
        
        // Parse and resolve dynamic tags if the product ID is passed in the URL
        const productId = req.query.product as string;
        const imgIndex = parseInt(req.query.img as string || "0", 10);
        if (productId) {
          const product = await fetchProduct(productId);
          if (product) {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.headers['x-forwarded-host'] || req.get('host');
            const hostOrigin = `${protocol}://${host}`;
            html = injectSEOTags(html, product, imgIndex, hostOrigin);
          }
        }

        // Apply HMR and other index transformations
        html = await vite.transformIndexHtml(url, html);
        
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    // Delegate static assets and HMR requests to Vite middlewares
    app.use(vite.middlewares);

  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');

    // Root route handler
    app.get("/", async (req, res, next) => {
      try {
        let html = await fs.promises.readFile(path.join(distPath, "index.html"), "utf-8");
        const productId = req.query.product as string;
        const imgIndex = parseInt(req.query.img as string || "0", 10);
        if (productId) {
          const product = await fetchProduct(productId);
          if (product) {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.headers['x-forwarded-host'] || req.get('host');
            const hostOrigin = `${protocol}://${host}`;
            html = injectSEOTags(html, product, imgIndex, hostOrigin);
          }
        }
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });

    // Serve pre-built static assets (with index: false to prevent serving raw index.html bypass)
    app.use(express.static(distPath, { index: false }));

    // Dynamic routing fallback for SPA
    app.get('*all', async (req, res, next) => {
      try {
        let html = await fs.promises.readFile(path.join(distPath, "index.html"), "utf-8");
        const productId = req.query.product as string;
        const imgIndex = parseInt(req.query.img as string || "0", 10);
        if (productId) {
          const product = await fetchProduct(productId);
          if (product) {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.headers['x-forwarded-host'] || req.get('host');
            const hostOrigin = `${protocol}://${host}`;
            html = injectSEOTags(html, product, imgIndex, hostOrigin);
          }
        }
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
