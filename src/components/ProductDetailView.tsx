import { useState } from 'react';
import { ArrowLeft, MessageSquare, ZoomIn, X, ShieldAlert, ShoppingBag, CheckCircle, ArrowRight, ClipboardCheck, MessageCircle, Share2 } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  categories: Category[];
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  whatsappNumber: string;
  onAddToCart: (product: Product, size: string) => void;
}

export default function ProductDetailView({
  product,
  allProducts,
  categories,
  onBack,
  onSelectProduct,
  whatsappNumber,
  onAddToCart
}: ProductDetailViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [addFeedback, setAddFeedback] = useState(false);

  const isFashion = product.category === 'fashion';
  const sizes = isFashion ? ['XS', 'S', 'M', 'L', 'XL', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'] : [];

  const categoryObject = categories.find(c => c.id === product.category);

  // Filter related products
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id && p.status === 'active')
    .slice(0, 4);

  // Determine which WhatsApp number to use
  const targetWhatsApp = product.vendorWhatsApp || whatsappNumber;

  const handleWhatsAppOrder = () => {
    if (!product.stock || product.status === 'out_of_stock') return;
    
    if (isFashion && !selectedSize) {
      alert("Please select a size/spec option before ordering!");
      return;
    }

    const formattingPrice = product.price.toLocaleString();
    const sizeLine = isFashion && selectedSize ? `\nSize Preference: ${selectedSize}` : '';

    const text = `Hello ${product.vendorName || 'TU MARKET HUB Seller'},

I saw your listing on the TU MARKET HUB:
  
*Item:* ${product.name}
*Condition:* ${product.condition?.toUpperCase().replace('_', ' ') || 'Good'}
*Price:* ₦${formattingPrice}${sizeLine}

Is this item still available? I would like to arrange a purchase.`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${targetWhatsApp.replace(/\+/g, '')}?text=${encodedText}`, '_blank');
  };

  const handleAddToCartClick = () => {
    if (isFashion && !selectedSize) {
      alert("Please select your preferred specification or size first!");
      return;
    }
    onAddToCart(product, selectedSize || 'One Size');
    setAddFeedback(true);
    setTimeout(() => setAddFeedback(false), 2500);
  };

  const handleShare = async () => {
    // Generate a link that works with the SPA. 
    // Since we don't have a specific router, we might share the origin. 
    // If the app has routing, we'd use the current location.
    const shareUrl = window.location.href;
    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} on TU Market Hub!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying link:', error);
      }
    }
  };

  return (
    <div id="product-detail-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Back button link */}
      <button
        onClick={onBack}
        className="mb-8 font-sans font-bold text-xs sm:text-sm text-slate-brand hover:text-emerald-brand flex items-center space-x-1.5 uppercase tracking-wider cursor-pointer py-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campuses Marketplace</span>
      </button>

      {/* Main product presentation block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* Left Side: Images Section */}
        <div className="space-y-4">
          
          {/* Main Visual Window with zoom */}
          <div className="relative aspect-square w-full rounded-3xl bg-gray-brand overflow-hidden border border-gray-150 group select-none shadow-xs">
            <img
              src={product.images[activeImageIndex]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
            />
            {/* Quick Zoom Trigger */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 p-3 rounded-full bg-white/90 shadow-md hover:bg-emerald-brand hover:text-white transition-all text-slate-brand cursor-pointer"
              title="Fullscreen Preview"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            {/* Condition overlay labels */}
            {product.condition && (
              <span className={`absolute top-4 left-4 text-xs font-mono font-bold py-1.5 px-3.5 rounded-full shadow-md text-white ${
                product.condition === 'new' ? 'bg-green-600' :
                product.condition === 'like_new' ? 'bg-emerald-500' : 'bg-orange-500'
              }`}>
                {product.condition.toUpperCase().replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Gallery Thumbnails List */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative w-20 aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-gray-brand ${
                    i === activeImageIndex ? 'border-emerald-brand' : 'border-transparent select-none'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover object-center" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right Side: Specifications Details */}
        <div className="space-y-6 bg-white border border-gray-150 p-6 sm:p-8 rounded-3xl shadow-3xs">
          
          {/* Headline Metadata */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-brand tracking-[0.2em] block uppercase">
              {categoryObject?.name || 'Academic'} Segment Deal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-[1.2] tracking-tight text-slate-brand">
              {product.name}
            </h1>
            
            {/* Price block */}
            <div className="flex items-center space-x-3.5 pt-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-black text-slate-brand">
                &#8358; {product.price.toLocaleString()}
              </span>
              <span className="text-[10px] bg-emerald-brand/10 text-emerald-brand font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                COMMISSION-FREE
              </span>
            </div>
          </div>

          <hr className="border-gray-150" />

          {/* Vendor Identification Card */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2.5">
            <h4 className="font-mono text-[10px] font-bold text-emerald-brand uppercase tracking-wider">VERIFIED STUDENT SELLER</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-brand">{product.vendorName || 'TU MARKET HUB Seller'}</p>
                <p className="text-xs text-slate-brand/45">Active response: Within 1 hour</p>
              </div>
              <a 
                href={`https://wa.me/${targetWhatsApp.replace(/\+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-brand/10 hover:bg-emerald-brand/20 text-emerald-brand px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Quick WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Description Copy */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-[11px] sm:text-xs text-slate-brand tracking-widest uppercase font-display border-b border-gray-100 pb-1 w-max">
              Listing Description
            </h4>
            <p className="text-sm text-slate-brand/70 font-sans leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Sizing & custom variation Selector if applicable */}
          {isFashion && sizes.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-brand uppercase tracking-wider">Option specification</span>
                <span className="text-emerald-brand font-mono font-bold text-[10px] uppercase">Required</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[42px] px-3 h-[42px] border font-semibold text-xs rounded-xl transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'border-emerald-brand bg-emerald-brand text-white shadow-sm'
                        : 'border-gray-250 hover:border-emerald-brand text-slate-brand'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Operational ordering buttons */}
          <div className="pt-4 space-y-3">
            {product.stock === 0 ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed border border-red-100">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-bold">Deal Completed / Sold</p>
                  <p>This listing has already been claimed or marked as sold. Keep exploring the public catalog for similar deals!</p>
                </div>
              </div>
            ) : null}

            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row gap-3.5">
                
                {/* 1. Direct WhatsApp Purchase (Primary CTA) */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="flex-1 bg-slate-900 border border-slate-900 text-white font-bold text-xs tracking-widest uppercase py-4.5 px-6 rounded-full transition-colors hover:bg-slate-800 cursor-pointer flex items-center justify-center space-x-2 w-full"
                >
                  <MessageSquare className="w-4 h-4 fill-white stroke-none" />
                  <span>Trade / WhatsApp Seller</span>
                </button>

                {/* 2. Add to Order Draft/Cart and Share */}
                <div className="flex gap-3.5 w-full sm:w-auto">
                  <button
                    onClick={handleAddToCartClick}
                    className="flex-1 sm:flex-none bg-transparent border border-gray-300 text-slate-brand font-bold text-xs tracking-widest uppercase py-4 px-6 rounded-full transition-colors hover:bg-gray-50 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-brand/80" />
                    <span>Draft Offer</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-none bg-transparent border border-gray-300 text-slate-brand font-bold py-4 px-5 rounded-full transition-colors hover:bg-gray-50 cursor-pointer flex items-center justify-center"
                    title="Share this product"
                  >
                    <Share2 className="w-4 h-4 text-slate-brand/80" />
                  </button>
                </div>

              </div>
            )}

            {addFeedback && (
              <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-3.5 rounded-r-xl flex items-center space-x-2.5 text-xs animate-fade-in mt-3">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span className="font-semibold">Added to your shopping draft. Click Cart or Basket in header to view.</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Related Products Collections */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-gray-150">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-brand">
                Related Campus Recommendations
              </h2>
              <p className="text-xs text-slate-brand/60 font-medium font-sans">
                Other peer options matching this category segment near your hostel.
              </p>
            </div>
            <button
              onClick={onBack}
              className="text-xs font-bold text-emerald-brand hover:underline uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p.id);
                  setActiveImageIndex(0);
                  setSelectedSize('');
                }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-150/70 p-2 sm:p-3 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-square w-full rounded-xl bg-gray-brand overflow-hidden mb-3">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  {p.condition && (
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                      {p.condition.toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-slate-brand line-clamp-1 group-hover:text-emerald-brand transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs font-extrabold text-slate-brand font-mono pt-1">
                  &#8358; {p.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Image Fullscreen Modal View zoom */}
      {isFullscreen && (
        <div
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={product.images[activeImageIndex]}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

    </div>
  );
}
