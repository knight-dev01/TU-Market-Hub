import { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Star, BookOpen, Laptop, Sparkles, ShoppingBag, ArrowUpRight, MessageCircle, RefreshCw, Shirt, Home, Briefcase, Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { getRelativeTime, calculateDiscount } from '../utils';
import { Product, Category } from '../types';

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

export default function HomeView({
  products,
  categories,
  onViewChange,
  onSelectProduct,
  whatsappNumber,
  onCategorySelect
}: HomeViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Welcome to TU MARKET HUB',
      subtitle: 'The ultimate student-led platform. Buy or sell study guides, electronics, hostel room essentials, and services directly with peers.',
      icon: ShoppingBag,
      badge: 'CAMPUS LIFE REDEFINED'
    },
    {
      title: 'Hostel Essentials & Smart Gadgets',
      subtitle: 'Laptops, study fans, lamps, and room decorations at standard student-friendly pocket rates.',
      icon: Laptop,
      badge: 'TECH & UTILITIES'
    },
    {
      title: 'Declutter & Sell Your Gears',
      subtitle: 'Turn previous semester gadgets or fashion outfits into cash, completely hassle-free!',
      icon: Sparkles,
      badge: 'SECURE VALUE'
    }
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Welcome Confetti and Scroll Train
  useEffect(() => {
    // Beautiful welcoming confetti burst on page load
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#059669', '#34d399', '#f97316', '#1e293b']
    });
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Optimized memoized sections for speed
  const featuredProducts = useMemo(() => 
    products.filter(p => p.featured && p.status === 'active').slice(0, 4),
  [products]);

  const newArrivals = useMemo(() => 
    [...products]
      .filter(p => p.status === 'active')
      .sort((a, b) => {
        const timeA = a.updatedAt?.seconds || a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
        const timeB = b.updatedAt?.seconds || b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      })
      .slice(0, 4),
  [products]);

  const isProductsEmpty = products.length === 0;

  const formatWhatsAppLink = (number: string): string => {
    let cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    }
    return cleaned;
  };

  const handleCTAClick = () => {
    const text = encodeURIComponent("Hello! I am browsing the TU MARKET HUB and would like to ask some questions about ordering or hosting a store!");
    window.open(`https://wa.me/${formatWhatsAppLink(whatsappNumber)}?text=${text}`, '_blank');
  };

  return (
    <div id="home-view" className="space-y-10 sm:space-y-16">
      
      {/* 1. Hero Banner Carousel / Slider */}
      <section id="hero-slider" className="relative min-h-[380px] sm:min-h-[500px] lg:min-h-[580px] w-full overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center">
        {/* Blurred/Faded Background Preview Image - Static Parallax */}
         <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center pointer-events-none opacity-[0.35] dark:opacity-[0.45] blur-[1px]" 
          style={{ backgroundImage: "url('/og-image.jpg')" }}
        />
        {heroSlides.map((slide, index) => {
          const Icon = slide.icon;
          const isActive = index === currentSlide;
          return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center p-4 sm:p-8 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-6 px-3 sm:px-4">
                <div 
                  className="opacity-90 text-emerald-brand dark:text-emerald-400 hidden sm:block"
                >
                  <Icon className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.5] mx-auto" />
                </div>
                <span className="inline-block bg-white dark:bg-slate-800 shadow-3xs text-slate-800 dark:text-slate-200 font-mono font-bold text-[8px] sm:text-xs tracking-widest px-2.5 sm:px-4 py-0.5 sm:py-1.5 uppercase rounded-full border border-gray-150 dark:border-slate-700">
                  {slide.badge}
                </span>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight tracking-tight text-slate-900 dark:text-white"
                >
                  {slide.title}
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-[11px] sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none"
                >
                  {slide.subtitle}
                </motion.p>

                <div className="pt-2 sm:pt-4 flex flex-row flex-wrap justify-center gap-2.5 sm:gap-4 w-full sm:w-auto px-1 sm:px-0">
                  <motion.button
                    onClick={() => onViewChange('shop')}
                    animate={{
                      scale: [1, 1.04, 1],
                      boxShadow: ["0px 0px 0px rgba(249, 115, 22, 0)", "0px 0px 14px rgba(249, 115, 22, 0.45)", "0px 0px 0px rgba(249, 115, 22, 0)"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="bg-slate-900 dark:bg-orange-600/90 text-white hover:bg-slate-800 dark:hover:bg-orange-700/90 font-bold text-[9px] sm:text-xs tracking-widest uppercase py-3 px-5 sm:px-8 transition-colors cursor-pointer flex items-center justify-center space-x-1 sm:space-x-2 rounded-full shadow-md shrink-0"
                  >
                    <span>Shop Now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    onClick={() => onViewChange('admin')}
                    animate={{
                      scale: [1, 1.04, 1],
                      boxShadow: ["0px 0px 0px rgba(249, 115, 22, 0)", "0px 0px 14px rgba(249, 115, 22, 0.35)", "0px 0px 0px rgba(249, 115, 22, 0)"]
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-3xs font-bold text-[9px] sm:text-xs tracking-widest uppercase py-3 px-5 sm:px-8 transition-colors cursor-pointer flex items-center justify-center space-x-1 sm:space-x-2 rounded-full border border-gray-150 dark:border-slate-700 shrink-0"
                  >
                    <span>Sell Items</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      const el = document.getElementById('featured-listings-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ rotate: [0, 1, -1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] sm:text-xs tracking-widest uppercase py-3 px-4 sm:px-6 transition-colors cursor-pointer flex items-center justify-center space-x-1 sm:space-x-2 rounded-full border border-emerald-500/20 shadow-3xs shrink-0"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Featured Items</span>
                  </motion.button>
                </div>
            </div>
          </div>
        )})}

        {/* Carousel Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:hover:text-emerald-brand transition-colors cursor-pointer hidden sm:block bg-white dark:bg-slate-800 shadow-sm rounded-full border dark:border-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:hover:text-emerald-brand transition-colors cursor-pointer hidden sm:block bg-white dark:bg-slate-800 shadow-sm rounded-full border dark:border-slate-700"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center space-x-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-1 transition-all outline-none cursor-pointer rounded-full ${
                idx === currentSlide ? 'bg-slate-900 dark:bg-white w-5' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section id="featured-categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
        <div className="text-center space-y-1 max-w-xl mx-auto mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-brand dark:text-slate-100">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-brand/60 dark:text-slate-400 font-medium">
            Find peer-to-peer student deals tailored for your specific academic and life needs.
          </p>
          <div className="w-12 h-1 bg-emerald-brand mx-auto rounded-sm mt-1" />
        </div>

        {/* Categories Grid */}
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
        >
          {categories.map((cat) => {
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => onCategorySelect ? onCategorySelect(cat.id) : onViewChange('shop')}
                className="group relative h-24 sm:h-32 flex flex-col items-center justify-center cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl transition-all shadow-3xs"
              >
                <div className="mb-2 text-slate-450 group-hover:text-emerald-brand dark:group-hover:text-emerald-400 transition-colors duration-200">
                  {getCategoryIcon(cat.id, "w-6 h-6 sm:w-8 sm:h-8")}
                </div>
                <div className="text-center px-1.5 space-y-1">
                  <h3 className="text-slate-900 dark:text-slate-100 font-bold text-[10px] sm:text-xs tracking-wider uppercase leading-tight line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="inline-block text-slate-500 font-mono text-[8px] font-bold bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-full">
                    {cat.productCount} Items
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. New Arrivals Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 sm:mb-10 border-b border-gray-150 dark:border-slate-800 pb-2 sm:pb-4">
          <div>
            <motion.span 
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-emerald-brand font-mono font-bold text-[9px] sm:text-[10px] tracking-widest uppercase block mb-0.5"
            >
              CAMPUS BULLETIN BOARD
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-slate-100 leading-tight"
            >
              Recently Posted Items
            </motion.h2>
          </div>
          <button
            onClick={() => onViewChange('shop')}
            className="text-[10px] sm:text-sm font-bold text-emerald-brand hover:text-emerald-700 flex items-center space-x-1 uppercase tracking-wider cursor-pointer shrink-0 pb-1 group"
          >
            <span>Browse All</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </button>
        </div>

        {isProductsEmpty ? (
          <div className="py-12 text-center bg-gray-brand dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-brand/50 dark:text-slate-400">Fetching student marketplace listings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product, index) => {
              const catName = categories.find(c => c.id === product.category)?.name || 'Listing';
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: 'easeOut' }}
                  whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
                  onClick={() => onSelectProduct(product.id)}
                  className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-150/70 dark:border-slate-700/50 p-2 sm:p-3 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl bg-gray-brand overflow-hidden mb-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Condition Badge */}
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
                          <span className={`absolute top-2 left-2 text-[9px] font-bold font-mono py-0.5 px-2 rounded-full shadow-sm text-white alive-blink ${
                            displayCondition === 'ready' || displayCondition === 'new' || displayCondition === 'available' ? 'bg-green-600' :
                            displayCondition === 'like_new' ? 'bg-emerald-500' :
                            displayCondition === 'not_ready' || displayCondition === 'not_available' ? 'bg-amber-500' : 'bg-orange-500'
                          }`}>
                            {displayCondition.toUpperCase().replace('_', ' ')}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="space-y-1 px-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-bold text-emerald-brand uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-brand alive-blink" />
                          {catName}
                        </p>
                        <span className="text-[9px] font-medium text-slate-brand/40">
                          Qty: {product.stock}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-brand dark:text-slate-100 line-clamp-1 group-hover:text-emerald-brand transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 line-clamp-1 italic">
                        Sold by: {product.vendorName || 'TU Peer Seller'}
                      </p>
                      <p className="text-[9px] font-mono text-emerald-brand/80">
                        {getRelativeTime(product.updatedAt || product.createdAt) || 'recent'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 px-1 border-t border-gray-100 dark:border-slate-700 mt-3 gap-y-1">
                    <div className="flex flex-col font-mono font-bold">
                      {(() => {
                        const { hasDiscount, originalPrice, discountedPrice, discountPercentage } = calculateDiscount(product.price, product.discountPercentage);
                        return hasDiscount ? (
                          <>
                            <span className="text-slate-500 line-through text-[9px]">
                              &#8358; {originalPrice.toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs sm:text-sm font-extrabold text-slate-brand dark:text-slate-200">
                                &#8358; {discountedPrice.toLocaleString()}
                              </span>
                              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px] px-1 py-0.5 rounded ml-1 whitespace-nowrap alive-blink font-extrabold">
                                -{discountPercentage}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm font-extrabold text-slate-brand dark:text-slate-200">
                            &#8358; {originalPrice.toLocaleString()}
                          </span>
                        );
                      })()}
                    </div>
                    <button className="text-[10px] font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-1 px-2.5 rounded-xl hover:bg-slate-900 dark:hover:bg-slate-700 hover:text-white dark:hover:border-slate-700 transition-colors cursor-pointer flex items-center gap-1 alive-pulse">
                      <span>View Deal</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-brand dark:text-emerald-400 alive-blink" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Why Choose Us / Interactive Process section */}
      <section id="why-choose-us" className="relative py-10 sm:py-16 bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Stationary matching background image */}
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center pointer-events-none opacity-[0.35] dark:opacity-[0.45] blur-[1px]" 
          style={{ backgroundImage: "url('/og-image.jpg')" }}
        />
        {/* Transparent overlay tint matching hero - Removed extra overlay to match hero exactly */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-12">
            <span 
              className="text-orange-brand dark:text-orange-500 font-mono font-bold text-[9px] sm:text-[10px] tracking-widest uppercase block mb-1"
            >
              THE THREE-PILLAR PROTOCOL
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-white">
              How TU Market Hub Works
            </h2>
            <p className="text-xs text-slate-brand/60 dark:text-slate-400 font-semibold mt-1">
              We make peer transactions secure, straightforward, and zero-commission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div 
              className="relative bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-150 dark:border-slate-800/80 text-center space-y-4 sm:space-y-6"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-brand/15 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-brand dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-black text-base sm:text-lg text-slate-brand dark:text-slate-200">
                  1. Browse Stalls
                </h3>
                <p className="text-[11px] sm:text-[12px] text-slate-brand/70 dark:text-slate-400 font-medium font-sans leading-relaxed">
                  Connect with student sellers offering verified study guide files, tech accessories, or homemade recipes right around dorm networks.
                </p>
              </div>
            </div>

            <div 
              className="relative bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-150 dark:border-slate-800/80 text-center space-y-4 sm:space-y-6"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-orange-brand dark:text-orange-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-black text-base sm:text-lg text-slate-brand dark:text-slate-200">
                  2. Secure Checkout
                </h3>
                <p className="text-[11px] sm:text-[12px] text-slate-brand/70 dark:text-slate-400 font-medium font-sans leading-relaxed">
                  Lock in your order through our automated WhatsApp routing system that instantly connects you to the seller to finalize payment.
                </p>
              </div>
            </div>

            <div 
              className="relative bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-150 dark:border-slate-800/80 text-center space-y-4 sm:space-y-6"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-brand/15 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-brand dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-black text-base sm:text-lg text-slate-brand dark:text-slate-200">
                  3. Peer Pick-up
                </h3>
                <p className="text-[11px] sm:text-[12px] text-slate-brand/70 dark:text-slate-400 font-medium font-sans leading-relaxed">
                  Collect your items from trusted peers at convenient campus drop-off points. Safe, local, and incredibly fast delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured / Highly Rated Products Grid */}
      <section id="featured-listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center space-y-1 max-w-xl mx-auto mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-brand dark:text-slate-100">
            Featured Listings
          </h2>
          <p className="text-xs sm:text-sm text-slate-brand/60 dark:text-slate-400 font-medium font-sans">
            Handpicked study gadgets, exclusive deals, and campus services highly rated by student unions.
          </p>
          <div className="w-12 h-1 bg-slate-900 dark:bg-emerald-brand mx-auto rounded-sm mt-1" />
        </div>

        {isProductsEmpty ? (
          <div className="py-12 text-center bg-gray-brand dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-brand/50 dark:text-slate-400">Loading selected campus deals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product, index) => {
              const catName = categories.find(c => c.id === product.category)?.name || 'Listing';
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.45), ease: 'easeOut' }}
                  whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
                  onClick={() => onSelectProduct(product.id)}
                  className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-150/70 dark:border-slate-700/50 p-2 sm:p-3 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl bg-gray-brand overflow-hidden mb-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-2 right-2 bg-slate-900 text-white p-1.5 rounded-sm">
                        <Star className="w-3.5 h-3.5 fill-white stroke-none" />
                      </span>
                      {(() => {
                        let displayCondition = product.condition;
                        if (product.category === 'food') {
                          if (displayCondition === 'new' || displayCondition === 'ready' || !displayCondition) displayCondition = 'READY';
                          else displayCondition = 'NOT READY';
                        } else if (product.category === 'services') {
                          if (displayCondition === 'new' || displayCondition === 'available' || !displayCondition) displayCondition = 'AVAILABLE';
                          else displayCondition = 'NOT AVAILABLE';
                        }
                        if (!displayCondition) return null;
                        return (
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[8px] font-bold font-mono py-0.5 px-2 rounded-sm alive-blink">
                            {displayCondition.toUpperCase().replace('_', ' ')}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="space-y-1 px-1">
                      <p className="text-[9px] tracking-widest text-emerald-brand uppercase flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-brand alive-blink" />
                        {catName}
                      </p>
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-brand dark:text-slate-100 line-clamp-1 group-hover:text-emerald-brand transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-brand/50 dark:text-slate-400">
                        Seller: {product.vendorName || 'TU Stall'}
                      </p>
                      <p className="text-[9px] font-mono text-emerald-brand/80">
                        {getRelativeTime(product.updatedAt || product.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 px-1 border-t border-gray-100 dark:border-slate-700 mt-3 gap-y-1">
                    <div className="flex flex-col font-mono font-bold">
                      {(() => {
                        const { hasDiscount, originalPrice, discountedPrice, discountPercentage } = calculateDiscount(product.price, product.discountPercentage);
                        return hasDiscount ? (
                          <>
                            <span className="text-slate-500 line-through text-[9px]">
                              &#8358; {originalPrice.toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs sm:text-sm font-extrabold text-slate-brand dark:text-slate-200">
                                &#8358; {discountedPrice.toLocaleString()}
                              </span>
                              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px] px-1 py-0.5 rounded ml-1 whitespace-nowrap alive-blink font-extrabold">
                                -{discountPercentage}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs sm:text-sm font-extrabold text-slate-brand dark:text-slate-200">
                            &#8358; {originalPrice.toLocaleString()}
                          </span>
                        );
                      })()}
                    </div>
                    <button className="text-[10px] font-bold border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-1 px-2.5 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors cursor-pointer flex items-center gap-1">
                      <span>View Deal</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-brand dark:text-emerald-450 alive-blink" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Call To Action (Student sign up) */}
      <section id="banner-cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative bg-slate-900 border border-slate-800 p-6 sm:p-12 md:p-16 text-center text-white space-y-4 sm:space-y-6 rounded-3xl overflow-hidden">
          <div className="absolute top-4 right-4 text-slate-700/50 dark:text-white/5 font-bold text-4xl sm:text-7xl font-sans tracking-wide uppercase select-none pointer-events-none">
            TU HUB
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-3 sm:space-y-5">
            <h2 className="text-xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              Got Stuff to Sell?
            </h2>
            <p className="text-[11px] sm:text-base text-slate-400 dark:text-slate-300/80 font-light max-w-lg mx-auto leading-relaxed">
              Activate your store in seconds with zero listing charges! Log in using Google Auth, update your WhatsApp number, upload study guides, items, snacks or gadgets, and reach thousands of TU peers!
            </p>
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={() => onViewChange('admin')}
                className="bg-white dark:bg-emerald-brand text-slate-900 dark:text-white border border-white dark:border-emerald-brand font-bold text-xs tracking-widest uppercase py-3 px-6 transition-colors hover:bg-slate-200 dark:hover:bg-emerald-600 cursor-pointer inline-flex items-center justify-center space-x-2 rounded-full"
              >
                <Sparkles className="w-4 h-4 fill-slate-900 dark:fill-white stroke-none" />
                <span>Go to Seller Console</span>
              </button>
              <button
                onClick={handleCTAClick}
                className="bg-transparent text-white border border-slate-700 font-bold text-xs tracking-widest uppercase py-3 px-6 transition-colors hover:bg-slate-800 cursor-pointer inline-flex items-center justify-center space-x-2 rounded-full"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
