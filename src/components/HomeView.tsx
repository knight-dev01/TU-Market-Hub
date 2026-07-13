import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Laptop, Sparkles, ShoppingBag, ArrowUpRight, MessageCircle, Shirt, Home, Briefcase, Coffee, Star, AlertCircle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { getRelativeTime, calculateDiscount } from '../utils';
import { Product, Category } from '../types';
import CampusStoryDesk from './CampusStoryDesk';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  onViewChange: (view: 'home' | 'shop' | 'about' | 'contact' | 'admin') => void;
  onSelectProduct: (productId: string) => void;
  whatsappNumber: string;
  onCategorySelect?: (categoryId: string) => void;
}

const getCategoryIcon = (id: string, className: string) => {
  switch (id) {
    case 'academics': return <BookOpen className={className} />;
    case 'electronics': return <Laptop className={className} />;
    case 'fashion': return <Shirt className={className} />;
    case 'hostel': return <Home className={className} />;
    case 'services': return <Briefcase className={className} />;
    case 'food': return <Coffee className={className} />;
    default: return <ShoppingBag className={className} />;
  }
};

function TypewriterHeading() {
  const [displayText, setDisplayText] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [showPeriod, setShowPeriod] = useState(false);

  useEffect(() => {
    const part1 = "Buying & selling shouldn't fill your WhatsApp groups with ";
    const part2 = "endless screenshots";
    
    let isMounted = true;
    let i = 0;
    let interval1: NodeJS.Timeout;
    let interval2: NodeJS.Timeout;

    // Start typing part1
    interval1 = setInterval(() => {
      if (!isMounted) return;
      if (i < part1.length) {
        setDisplayText(part1.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval1);
        
        // Start typing part2
        let j = 0;
        interval2 = setInterval(() => {
          if (!isMounted) return;
          if (j < part2.length) {
            setHighlightText(part2.substring(0, j + 1));
            j++;
          } else {
            clearInterval(interval2);
            setShowPeriod(true);
          }
        }, 75);
      }
    }, 55);

    return () => {
      isMounted = false;
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);

  return (
    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto min-h-[110px] sm:min-h-[170px] md:min-h-[200px]">
      <span>{displayText}</span>
      {highlightText && (
        <span className="text-emerald-brand underline decoration-wavy decoration-emerald-500/30">
          {highlightText}
        </span>
      )}
      {showPeriod && <span>.</span>}
      <span className="inline-block w-1 h-6 sm:h-10 md:h-12 bg-emerald-500 ml-1.5 align-middle animate-pulse" />
    </h1>
  );
}

export default function HomeView({
  products,
  categories,
  onViewChange,
  onSelectProduct,
  whatsappNumber,
  onCategorySelect
}: HomeViewProps) {
  
  // Confetti on page mount to delight the user
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#059669', '#34d399', '#f97316', '#1e293b']
    });
  }, []);

  // Filter listings
  const featuredListings = useMemo(() => 
    products.filter(p => p.featured && p.status === 'active').slice(0, 4),
  [products]);

  const recentListings = useMemo(() => 
    [...products]
      .filter(p => p.status === 'active')
      .sort((a, b) => {
        const timeA = a.updatedAt?.seconds || a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
        const timeB = b.updatedAt?.seconds || b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      })
      .slice(0, 4),
  [products]);

  const isMarketplaceEmpty = products.length === 0;

  const formatWhatsAppLink = (number: string): string => {
    let cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    }
    return cleaned;
  };

  const handleSupportClick = () => {
    const text = encodeURIComponent("Hello! I am browsing the TU Market Hub and would like to ask some questions about managing my listing or using the platform.");
    window.open(`https://wa.me/${formatWhatsAppLink(whatsappNumber)}?text=${text}`, '_blank');
  };

  return (
    <div id="home-view" className="space-y-16 sm:space-y-24">
      
      {/* 1. HERO SECTION: Clarifies the Vision Instantly */}
      <section id="hero-segment" className="relative min-h-[450px] sm:min-h-[550px] lg:min-h-[620px] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 flex items-center justify-center">
        {/* Decorative background visual matching the design system */}
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center pointer-events-none opacity-[0.25] dark:opacity-[0.35] blur-[1px]" 
          style={{ backgroundImage: "url('/og-image.jpg')" }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 py-12">
          {/* Tagline Badge */}
          <span className="inline-flex items-center space-x-2 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] sm:text-xs tracking-widest px-3 sm:px-4 py-1 uppercase rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Trinity University Organized Campus Marketplace</span>
          </span>

          <TypewriterHeading />

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            Welcome to the centralized campus platform that gives every listing a permanent, searchable home. 
            <strong> Keep WhatsApp for direct conversations—use TU Market Hub for organized peer-to-peer commerce.</strong>
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xl mx-auto">
            <button
              onClick={() => onViewChange('shop')}
              className="w-full sm:w-1/3 bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-400 font-bold text-xs tracking-wider uppercase py-3.5 px-4 transition-all cursor-pointer flex items-center justify-center space-x-2 rounded-xl shadow-sm active:scale-98"
            >
              <span>Browse Listings</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const element = document.getElementById('featured-listings-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-1/3 bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs tracking-wider uppercase py-3.5 px-4 transition-all cursor-pointer flex items-center justify-center space-x-2 rounded-xl border border-amber-500/25 active:scale-98"
            >
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Featured Listings</span>
            </button>

            <button
              onClick={() => onViewChange('admin')}
              className="w-full sm:w-1/3 bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs tracking-wider uppercase py-3.5 px-4 transition-all cursor-pointer flex items-center justify-center space-x-2 rounded-xl border border-gray-200 dark:border-slate-800 active:scale-98"
            >
              <span>List an Item</span>
              <Sparkles className="w-4 h-4 text-emerald-brand animate-pulse" />
            </button>
          </div>

          {/* Value Highlights */}
          <div className="pt-6 sm:pt-10 grid grid-cols-3 gap-2 max-w-xl mx-auto text-left border-t border-gray-200/50 dark:border-slate-900">
            <div className="text-center space-y-1">
              <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">Zero Spam</span>
              <span className="block text-[9px] sm:text-[10px] text-slate-500">No repeated reposts</span>
            </div>
            <div className="text-center space-y-1 border-x border-gray-200/50 dark:border-slate-900">
              <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">Live Search</span>
              <span className="block text-[9px] sm:text-[10px] text-slate-500">Find items instantly</span>
            </div>
            <div className="text-center space-y-1">
              <span className="block text-xs sm:text-sm font-bold text-emerald-brand font-mono">Free Trades</span>
              <span className="block text-[9px] sm:text-[10px] text-slate-500">0% commissions</span>
            </div>
          </div>
        </div>
      </section>      {/* 2. DYNAMIC INTERACTIVE CAMPUS STORY & WALKTHROUGH BOARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <CampusStoryDesk onViewChange={onViewChange} />
      </section>

      {/* 5. SHOP BY CATEGORY SEGMENT */}
      <section id="browse-by-segment" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-1 max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-brand dark:text-slate-100">
            Browse Campus Segments
          </h2>
          <p className="text-xs sm:text-sm text-slate-brand/60 dark:text-slate-400 font-medium">
            Find peer-to-peer student deals tailored for specific academic and lifestyle needs.
          </p>
          <div className="w-12 h-1 bg-emerald-brand mx-auto rounded-sm mt-1" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -3 }}
              onClick={() => onCategorySelect ? onCategorySelect(cat.id) : onViewChange('shop')}
              className="group cursor-pointer border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl p-4 text-center space-y-2 shadow-3xs hover:border-emerald-brand/30 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-emerald-brand dark:group-hover:text-emerald-400 transition-colors">
                {getCategoryIcon(cat.id, "w-5 h-5")}
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold text-[10px] sm:text-xs tracking-wider uppercase leading-tight line-clamp-1">
                {cat.name}
              </h3>
              <span className="inline-block text-slate-500 dark:text-slate-400 font-mono text-[8px] font-bold bg-slate-100 dark:bg-slate-800/60 py-0.5 px-1.5 rounded-full">
                {cat.productCount} Listing{cat.productCount !== 1 ? 's' : ''}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. DYNAMIC FEATURED LISTINGS GRID */}
      <section id="featured-listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-1 max-w-xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-brand dark:text-slate-100">
            Featured Listings
          </h2>
          <p className="text-xs sm:text-sm text-slate-brand/60 dark:text-slate-400 font-medium font-sans">
            Handpicked study gear, exclusive deals, and essential campus services vetted for trading health.
          </p>
          <div className="w-12 h-1 bg-emerald-brand mx-auto rounded-sm mt-1" />
        </div>

        {isMarketplaceEmpty ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-brand/50 dark:text-slate-400">Loading student marketplace listings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredListings.map((product, index) => {
              const catName = categories.find(c => c.id === product.category)?.name || 'Listing';
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-150 dark:border-slate-800/80 p-2 sm:p-3 hover:shadow-md transition-all flex flex-col justify-between hover:scale-[1.01]"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl bg-gray-50 dark:bg-slate-950 overflow-hidden mb-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-2 right-2 bg-slate-950/80 text-white p-1.5 rounded-lg z-10">
                        <Star className="w-3.5 h-3.5 fill-emerald-400 stroke-none" />
                      </span>
                      
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                        {product.stock === 0 && (
                          <span className="text-[9px] font-bold font-mono py-0.5 px-2 rounded-full text-white bg-red-600 shadow-sm">
                            SOLD OUT
                          </span>
                        )}
                        {product.stock > 0 && product.stock <= 3 && (
                          <span className="text-[9px] font-bold font-mono py-0.5 px-2 rounded-full text-slate-900 bg-amber-400 shadow-sm">
                            LOW STOCK
                          </span>
                        )}
                        {product.condition && (
                          <span className="text-[9px] font-bold font-mono py-0.5 px-2 rounded-full shadow-sm text-white bg-emerald-600">
                            {product.condition.toUpperCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 px-1">
                      <p className="text-[9px] tracking-widest text-emerald-brand uppercase flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand animate-pulse" />
                        {catName}
                      </p>
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-brand dark:text-white line-clamp-1 group-hover:text-emerald-brand transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-brand/50 dark:text-slate-400">
                        Seller: {product.vendorName || 'TU Peer Seller'}
                      </p>
                      <p className="text-[9px] font-mono text-emerald-brand/80">
                        {getRelativeTime(product.updatedAt || product.createdAt) || 'recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 px-1 border-t border-gray-150 dark:border-slate-800 mt-3">
                    <div className="flex flex-col font-mono font-bold text-xs">
                      {(() => {
                        const { hasDiscount, originalPrice, discountedPrice, discountPercentage } = calculateDiscount(product.price, product.discountPercentage);
                        return hasDiscount ? (
                          <>
                            <span className="text-slate-400 line-through text-[9px]">
                              ₦{originalPrice.toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                                ₦{discountedPrice.toLocaleString()}
                              </span>
                              <span className="bg-red-500/10 text-red-500 text-[8px] px-1 py-0.5 rounded ml-1 font-extrabold">
                                -{discountPercentage}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                            ₦{originalPrice.toLocaleString()}
                          </span>
                        );
                      })()}
                    </div>
                    <button className="text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <span>View Listing</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7. DYNAMIC RECENT ARRIVALS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 border-b border-gray-150 dark:border-slate-800 pb-4">
          <div>
            <span className="text-emerald-brand font-mono font-bold text-[9px] sm:text-[10px] tracking-widest uppercase block mb-0.5">
              CAMPUS BULLETIN BOARD
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-slate-100 leading-tight">
              Recently Posted Items
            </h2>
          </div>
          <button
            onClick={() => onViewChange('shop')}
            className="text-xs sm:text-sm font-bold text-emerald-brand hover:text-emerald-700 flex items-center space-x-1 uppercase tracking-wider cursor-pointer pb-1 group"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isMarketplaceEmpty ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-brand/50 dark:text-slate-400">Fetching listings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentListings.map((product, index) => {
              const catName = categories.find(c => c.id === product.category)?.name || 'Listing';
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-150 dark:border-slate-800/80 p-2 sm:p-3 hover:shadow-md transition-all flex flex-col justify-between hover:scale-[1.01]"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl bg-gray-50 dark:bg-slate-950 overflow-hidden mb-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                        {product.stock === 0 && (
                          <span className="text-[9px] font-bold font-mono py-0.5 px-2 rounded-full text-white bg-red-600 shadow-sm">
                            SOLD OUT
                          </span>
                        )}
                        {product.condition && (
                          <span className="text-[9px] font-bold font-mono py-0.5 px-2 rounded-full shadow-sm text-white bg-emerald-600">
                            {product.condition.toUpperCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 px-1">
                      <p className="text-[9px] tracking-widest text-emerald-brand uppercase flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand animate-pulse" />
                        {catName}
                      </p>
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-brand dark:text-white line-clamp-1 group-hover:text-emerald-brand transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-brand/50 dark:text-slate-400">
                        Seller: {product.vendorName || 'TU Peer Seller'}
                      </p>
                      <p className="text-[9px] font-mono text-emerald-brand/80">
                        {getRelativeTime(product.updatedAt || product.createdAt) || 'recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 px-1 border-t border-gray-150 dark:border-slate-800 mt-3">
                    <div className="flex flex-col font-mono font-bold text-xs">
                      {(() => {
                        const { hasDiscount, originalPrice, discountedPrice, discountPercentage } = calculateDiscount(product.price, product.discountPercentage);
                        return hasDiscount ? (
                          <>
                            <span className="text-slate-400 line-through text-[9px]">
                              ₦{originalPrice.toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                                ₦{discountedPrice.toLocaleString()}
                              </span>
                              <span className="bg-red-500/10 text-red-500 text-[8px] px-1 py-0.5 rounded ml-1 font-extrabold">
                                -{discountPercentage}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                            ₦{originalPrice.toLocaleString()}
                          </span>
                        );
                      })()}
                    </div>
                    <button className="text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <span>View Listing</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 8. CALL TO ACTION: READY TO KEEP YOUR GROUPS CLEAN? */}
      <section id="banner-cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative bg-slate-900 border border-slate-800 p-8 sm:p-12 md:p-16 text-center text-white space-y-6 rounded-3xl overflow-hidden">
          <div className="absolute top-4 right-4 text-white/5 font-bold text-4xl sm:text-7xl font-sans tracking-wide uppercase select-none pointer-events-none">
            TU HUB
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              Ready to keep your WhatsApp group chats clean?
            </h2>
            <p className="text-xs sm:text-base text-slate-400 font-light max-w-lg mx-auto leading-relaxed">
              List your books, devices, or room appliances on TU Market Hub once. Let peers find you organized, or reach verified external buyers looking to trade safely.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => onViewChange('admin')}
                className="bg-emerald-brand hover:bg-emerald-600 text-white font-bold text-xs tracking-widest uppercase py-3 px-6 transition-colors cursor-pointer inline-flex items-center justify-center space-x-2 rounded-xl"
              >
                <Sparkles className="w-4 h-4 fill-white stroke-none" />
                <span>List an Item Now</span>
              </button>
              <button
                onClick={handleSupportClick}
                className="bg-transparent text-white border border-slate-700 font-bold text-xs tracking-widest uppercase py-3 px-6 transition-colors hover:bg-slate-800 cursor-pointer inline-flex items-center justify-center space-x-2 rounded-xl"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact System Support</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
