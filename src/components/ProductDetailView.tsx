import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, ZoomIn, X, ShieldAlert, ShoppingBag, CheckCircle, ArrowRight, ClipboardCheck, MessageCircle, Share2, Sparkles, ChevronLeft, ChevronRight, MessageSquareCode, ArrowUpRight, Star } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Product, Category } from '../types';
import { calculateDiscount, updateProductSEO, resetSEO } from '../utils';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  categories: Category[];
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  whatsappNumber: string;
  onAddToCart: (product: Product, size: string) => void;
  onLogClick?: (product: Product, quantity: number, buyerInfo?: { name: string }) => void;
  currentUser: FirebaseUser | null;
  onLoginClick: () => void;
  onCheckoutDirect?: (vendorId: string, vendorName: string, vendorNumber: string, items: any[]) => void;
}

export default function ProductDetailView({
  product,
  allProducts,
  categories,
  onBack,
  onSelectProduct,
  whatsappNumber,
  onAddToCart,
  onLogClick,
  currentUser,
  onLoginClick,
  onCheckoutDirect
}: ProductDetailViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [promoCopied, setPromoCopied] = useState(false);
  const [redirectingWA, setRedirectingWA] = useState(false);

  const isFashion = product.category === 'fashion';
  const sizes = isFashion ? ['XS', 'S', 'M', 'L', 'XL', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'] : [];

  const categoryObject = categories.find(c => c.id === product.category);

  // Filter related products
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id && p.status === 'active')
    .slice(0, 4);

  // Determine which WhatsApp number to use
  const targetWhatsApp = product.vendorWhatsApp || whatsappNumber;
  const { hasDiscount, originalPrice, discountedPrice, discountPercentage } = calculateDiscount(product.price, product.discountPercentage);

  // Hydrate image parameter index from load URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const imgParam = urlParams.get('img');
    if (imgParam) {
      const idx = parseInt(imgParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < product.images.length) {
        setActiveImageIndex(idx);
      }
    }
  }, [product]);

  // Synchronize browser history query param dynamically on image slide change
  useEffect(() => {
    const cleanUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}&img=${activeImageIndex}`;
    window.history.replaceState({}, '', cleanUrl);
  }, [activeImageIndex, product]);

  // Dynamically update document head SEO tags on product and active image change, and restore on unmount
  useEffect(() => {
    updateProductSEO(product, activeImageIndex);
    return () => {
      resetSEO();
    };
  }, [product, activeImageIndex]);

  const formatWhatsAppLink = (number: string): string => {
    let cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    }
    return cleaned;
  };

  const handleWhatsAppOrder = (type: 'buy' | 'negotiate' = 'buy') => {
    if (!product.stock || product.status === 'out_of_stock') return;
    
    if (isFashion && !selectedSize) {
      alert("Please select a size/spec option before purchasing!");
      return;
    }

    // Call dynamic analytics click logger if provided
    onLogClick?.(product, 1);

    if (type === 'buy' && onCheckoutDirect) {
      onCheckoutDirect(
        product.vendorId || 'admin',
        product.vendorName || 'TU MARKET HUB Seller',
        targetWhatsApp,
        [{ product, quantity: 1, size: selectedSize }]
      );
      return;
    }

    const formattingPrice = discountedPrice.toLocaleString();
    const sizeLine = isFashion && selectedSize ? `\nSize Preference: ${selectedSize}` : '';

    const greeting = type === 'buy'
      ? `Hello ${product.vendorName || 'TU MARKET HUB Seller'},\n\nI would like to BUY your listing instantly on campus:`
      : `Hello ${product.vendorName || 'TU MARKET HUB Seller'},\n\nI am interested in your listing on TU Market Hub. Can we NEGOTIATE the price?`;

    const text = `${greeting}
  
*Item:* ${product.name}
*${product.category === 'food' ? 'Preparation Status' : product.category === 'services' ? 'Availability Status' : 'Condition Grade'}:* ${(product.condition || (product.category === 'food' ? 'ready' : product.category === 'services' ? 'available' : 'new')).toUpperCase().replace('_', ' ')}
*Price:* ₦${formattingPrice}${sizeLine}
*Image Link:* ${window.location.origin}?product=${product.id}&img=${activeImageIndex}

Please let me know if it's available so we can arrange a secure meetup!`;

    const encodedText = encodeURIComponent(text);
    setRedirectingWA(true);
    setTimeout(() => setRedirectingWA(false), 3000);
    window.open(`https://wa.me/${formatWhatsAppLink(targetWhatsApp)}?text=${encodedText}`, '_blank');
  };

  const handleShare = async () => {
    // Generate a link representing the specific image slide
    const shareUrl = `${window.location.origin}?product=${product.id}&img=${activeImageIndex}`;
    const shareData = {
      title: product.name,
      text: `Check out image #${activeImageIndex + 1} of ${product.name} on TU Market Hub!`,
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
        alert('Product specific image slide preview link copied smoothly!');
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
          <div 
            className="relative aspect-square w-full rounded-3xl bg-gray-brand overflow-hidden border border-gray-150 group select-none shadow-xs"
            onTouchStart={(e) => {
              const touchDown = e.touches[0].clientX;
              e.currentTarget.dataset.touchDown = touchDown.toString();
            }}
            onTouchMove={(e) => {
              const touchDownStr = e.currentTarget.dataset.touchDown;
              if (!touchDownStr) return;
              
              const touchDown = parseFloat(touchDownStr);
              const touchMove = e.touches[0].clientX;
              const diff = touchDown - touchMove;
              
              if (Math.abs(diff) > 5) {
                e.currentTarget.dataset.swiping = 'true';
              }
            }}
            onTouchEnd={(e) => {
              const touchDownStr = e.currentTarget.dataset.touchDown;
              const swiping = e.currentTarget.dataset.swiping;
              
              e.currentTarget.dataset.touchDown = '';
              e.currentTarget.dataset.swiping = 'false';
              
              if (!touchDownStr || !swiping) return;

              const touchDown = parseFloat(touchDownStr);
              const touchUp = e.changedTouches[0].clientX;
              const diff = touchDown - touchUp;

              if (Math.abs(diff) > 50 && product.images.length > 1) {
                if (diff > 0) {
                  // Swipe left (next)
                  setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                } else {
                  // Swipe right (prev)
                  setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                }
              }
            }}
          >
            <div className="w-full h-full relative" style={{ overflow: 'hidden' }}>
              <div 
                className="w-full h-full flex transition-transform duration-300 ease-in-out" 
                style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
              >
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} - Image ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center shrink-0"
                  />
                ))}
              </div>
            </div>
            
            {/* Image Slider Navigation Controls */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md hover:bg-emerald-brand hover:text-white dark:hover:bg-emerald-brand text-slate-brand dark:text-slate-100 transition-all cursor-pointer z-20"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md hover:bg-emerald-brand hover:text-white dark:hover:bg-emerald-brand text-slate-brand dark:text-slate-100 transition-all cursor-pointer z-20"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Quick Zoom Trigger */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 p-3 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md hover:bg-emerald-brand hover:text-white transition-all text-slate-brand dark:text-slate-100 cursor-pointer z-10"
              title="Fullscreen Preview"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            {/* Top Left Badges flex layout prevents overlap */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-10">
              {product.stock === 0 && (
                <span className="text-xs font-bold font-mono py-1.5 px-3.5 rounded-full text-white bg-red-600 shadow-md">
                  SOLD OUT
                </span>
              )}
              {product.stock > 0 && product.stock <= 3 && (
                <span className="text-xs font-bold font-mono py-1.5 px-3.5 rounded-full text-slate-900 bg-amber-400 shadow-md">
                  LOW STOCK
                </span>
              )}
              {(() => {
                let displayCondition = product.condition;
                if (product.category === 'food') {
                  if (displayCondition === 'new' || displayCondition === 'ready' || !displayCondition) displayCondition = 'ready';
                  else displayCondition = 'not_ready';
                } else if (product.category === 'services') {
                  if (displayCondition === 'new' || displayCondition === 'available' || !displayCondition) displayCondition = 'available';
                  else displayCondition = 'not_available';
                }
                if (!displayCondition) return null;
                return (
                  <span className={`text-xs font-mono font-bold py-1.5 px-3.5 rounded-full shadow-md text-white alive-blink ${
                    displayCondition === 'ready' || displayCondition === 'new' || displayCondition === 'available' ? 'bg-green-600' :
                    displayCondition === 'like_new' ? 'bg-emerald-500' :
                    displayCondition === 'not_ready' || displayCondition === 'not_available' ? 'bg-amber-500' : 'bg-orange-500'
                  }`}>
                    {displayCondition.toUpperCase().replace('_', ' ')}
                  </span>
                );
              })()}
            </div>
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
        <div className="space-y-6 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-3xs">
          
          {/* Headline Metadata */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-brand tracking-[0.2em] block uppercase">
              {categoryObject?.name || 'Academic'} Segment Deal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-[1.2] tracking-tight text-slate-brand dark:text-slate-100">
              {product.name}
            </h1>
            
            {/* Price block */}
            <div className="flex items-center space-x-3.5 pt-1.5 flex-wrap gap-y-2">
              <div className="flex flex-col font-mono">
                {hasDiscount ? (
                  <>
                    <span className="text-slate-500 line-through text-sm">
                      &#8358; {originalPrice.toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-brand dark:text-slate-100">
                        &#8358; {discountedPrice.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded alive-blink">
                        -{discountPercentage}% Off
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-brand dark:text-slate-100">
                    &#8358; {originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-[10px] bg-emerald-brand/10 text-emerald-brand font-bold px-2.5 py-1 rounded-full uppercase tracking-wider alive-blink">
                COMMISSION-FREE
              </span>
            </div>
          </div>

          <hr className="border-gray-150 dark:border-slate-800" />

          {/* Vendor Identification Card */}
          <div className={`border p-4 rounded-2xl space-y-2.5 ${product.vendorType === 'outside' ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'}`}>
            <h4 className={`font-mono text-[10px] font-bold uppercase tracking-wider ${product.vendorType === 'outside' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-brand dark:text-emerald-500'}`}>
              {product.vendorType === 'outside' ? 'VERIFIED OUTSIDE VENDOR' : 'VERIFIED STUDENT SELLER'}
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-brand dark:text-slate-200">{product.vendorName || 'TU MARKET HUB Seller'}</p>
                <p className="text-xs text-slate-brand/45 dark:text-slate-400">Active response: Within 1 hour</p>
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
            <h4 className="font-semibold text-[11px] sm:text-xs text-slate-brand dark:text-slate-300 tracking-widest uppercase font-display border-b border-gray-100 dark:border-slate-700 pb-1 w-max">
              Listing Description
            </h4>
            <p className="text-sm text-slate-brand/70 dark:text-slate-400 font-sans leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Sizing & custom variation Selector if applicable */}
          {isFashion && sizes.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-brand dark:text-slate-300 uppercase tracking-wider">Option specification</span>
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
                        : 'border-gray-250 dark:border-slate-700 hover:border-emerald-brand text-slate-brand dark:text-slate-300'
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
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed border border-red-100 dark:border-red-900/50">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-bold">Deal Completed / Sold</p>
                  <p>This listing has already been claimed or marked as sold. Keep exploring the public catalog for similar deals!</p>
                </div>
              </div>
            ) : null}

            {product.stock > 0 && (
              <div className="flex flex-col space-y-3">
                
                {/* 1. Direct WhatsApp Purchase (Primary CTA) */}
                <button
                  onClick={() => handleWhatsAppOrder('buy')}
                  disabled={redirectingWA}
                  className={`w-full text-white font-bold text-xs tracking-widest uppercase py-4.5 px-6 rounded-full transition-colors flex items-center justify-center space-x-2 ${
                    redirectingWA 
                      ? 'bg-emerald-600 border border-emerald-600 opacity-90 cursor-default' 
                      : 'bg-emerald-brand border border-emerald-brand hover:bg-emerald-700 cursor-pointer shadow-md'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 fill-white stroke-none alive-blink ${redirectingWA ? 'animate-bounce' : ''}`} />
                  <span>{redirectingWA ? 'Opening WhatsApp...' : 'Buy Instantly via WhatsApp'}</span>
                </button>

                {/* 2. Direct Negotiate / Make Offer Row */}
                <div className="flex gap-3.5 w-full">
                  <button
                    onClick={() => handleWhatsAppOrder('negotiate')}
                    disabled={redirectingWA}
                    className="flex-1 bg-transparent border border-gray-300 dark:border-slate-700 text-slate-brand dark:text-slate-200 font-bold text-xs tracking-widest uppercase py-4 px-6 rounded-full transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <ClipboardCheck className="w-4 h-4 text-slate-brand/80 dark:text-slate-300" />
                    <span>Negotiate Price</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-none bg-transparent border border-gray-300 dark:border-slate-600 text-slate-brand dark:text-slate-200 font-bold py-4 px-5 rounded-full transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
                    title="Share this product"
                  >
                    <Share2 className="w-4 h-4 text-slate-brand/80 dark:text-slate-400 alive-blink" />
                  </button>
                </div>

              </div>
            )}

            {/* Direct WhatsApp Ordering */}

            {/* Social Share Link Card / Open Graph Preview Card Mockup */}
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
            {relatedProducts.map((p) => {
              const catName = categories.find(c => c.id === p.category)?.name || 'Listing';
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p.id);
                    setActiveImageIndex(0);
                    setSelectedSize('');
                  }}
                  className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-150/70 dark:border-slate-700/50 p-2 sm:p-3 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl bg-gray-brand overflow-hidden mb-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Top Left Badges flex layout prevents overlap */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                        {p.stock === 0 && (
                          <span className="text-[9px] font-bold font-mono py-0.5 px-2 rounded-full text-white bg-red-600 shadow-sm">
                            SOLD OUT
                          </span>
                        )}
                        {p.stock > 0 && p.stock <= 3 && (
                          <span className="text-[9px] font-bold font-mono py-0.5 px-2 rounded-full text-slate-900 bg-amber-400 shadow-sm font-sans">
                            LOW STOCK
                          </span>
                        )}
                        {(() => {
                          let displayCondition = p.condition;
                          if (p.category === 'food') {
                            if (displayCondition === 'new' || displayCondition === 'ready' || !displayCondition) displayCondition = 'ready';
                            else displayCondition = 'not_ready';
                          } else if (p.category === 'services') {
                            if (displayCondition === 'new' || displayCondition === 'available' || !displayCondition) displayCondition = 'available';
                            else displayCondition = 'not_available';
                          }
                          if (!displayCondition) return null;
                          return (
                            <span className={`text-[9px] font-bold font-mono py-0.5 px-2 rounded-full shadow-sm text-white alive-blink ${
                              displayCondition === 'ready' || displayCondition === 'new' || displayCondition === 'available' ? 'bg-green-600' :
                              displayCondition === 'like_new' ? 'bg-emerald-500' :
                              displayCondition === 'not_ready' || displayCondition === 'not_available' ? 'bg-amber-500' : 'bg-orange-500'
                            }`}>
                              {displayCondition.toUpperCase().replace('_', ' ')}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="space-y-1 px-1">
                      <p className="text-[9px] tracking-widest text-emerald-brand uppercase flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-brand alive-blink" />
                        {catName}
                      </p>
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-brand dark:text-slate-100 line-clamp-1 group-hover:text-emerald-brand transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 line-clamp-1 italic">
                        Sold by: {p.vendorName || 'TU Peer Seller'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 px-1 border-t border-gray-100 dark:border-slate-700 mt-3 gap-y-1">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-brand dark:text-slate-200 font-mono">
                      &#8358; {p.price.toLocaleString()}
                    </p>
                    <button className="text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-1.5 px-3.5 rounded-xl hover:bg-emerald-brand hover:text-white dark:hover:bg-emerald-500 hover:border-emerald-brand dark:hover:border-emerald-500 transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-3xs group-hover:scale-[1.02]">
                      <span>View Deal</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-brand dark:text-emerald-400 group-hover:text-white transition-colors duration-300 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Image Fullscreen Modal View zoom */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onTouchStart={(e) => {
            const touchDown = e.touches[0].clientX;
            e.currentTarget.dataset.touchDown = touchDown.toString();
          }}
          onTouchEnd={(e) => {
            const touchDownStr = e.currentTarget.dataset.touchDown;
            e.currentTarget.dataset.touchDown = '';
            
            if (!touchDownStr) return;

            const touchDown = parseFloat(touchDownStr);
            const touchUp = e.changedTouches[0].clientX;
            const diff = touchDown - touchUp;

            if (Math.abs(diff) > 50 && product.images.length > 1) {
              if (diff > 0) {
                // Swipe left (next)
                setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
              } else {
                // Swipe right (prev)
                setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
              }
            }
          }}
        >
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setIsFullscreen(false)} />
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center pointer-events-none">
            <div className="w-full h-[90vh] relative pointer-events-auto overflow-hidden">
              <div 
                className="w-full h-full flex transition-transform duration-300 ease-in-out" 
                style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
              >
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} - Image ${idx + 1}`}
                    className="w-full h-full object-contain shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            </div>
          </div>
          
          {product.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 cursor-pointer z-10"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 cursor-pointer z-10"
                aria-label="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
}
