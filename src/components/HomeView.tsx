import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Star, BookOpen, Laptop, Sparkles, ShoppingBag, ArrowUpRight, MessageCircle, RefreshCw, Shirt, Home, Briefcase, Coffee } from 'lucide-react';
import { motion } from 'motion/react';
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

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Filter products
  const featuredProducts = products.filter(p => p.featured && p.status === 'active').slice(0, 4);
  const newArrivals = [...products]
    .filter(p => p.status === 'active')
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    })
    .slice(0, 8);

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
    <div id="home-view" className="space-y-16">
      
      {/* 1. Hero Banner Carousel / Slider */}
      <section id="hero-slider" className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[600px] w-full overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center">
        {/* Blurred/Faded Background Preview Image - Static Parallax */}
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center pointer-events-none opacity-[0.15] dark:opacity-[0.22] blur-[1px]" 
          style={{ backgroundImage: "url('/og-image.jpeg.20.42.jpeg')" }}
        />
        {heroSlides.map((slide, index) => {
          const Icon = slide.icon;
          return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center p-4 sm:p-8 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-6 px-2 sm:px-4">
                <div className="opacity-80 text-emerald-brand dark:text-emerald-400">
                  <Icon className="w-10 h-10 sm:w-16 sm:h-16 stroke-1 mx-auto" />
                </div>
                <span className="inline-block bg-white dark:bg-slate-800 shadow-xs text-slate-800 dark:text-slate-200 font-mono font-bold text-[9px] sm:text-xs tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 uppercase rounded-full border border-gray-150 dark:border-slate-700">
                  {slide.badge}
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight text-slate-900 dark:text-white">
                  {slide.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-xl">
                  {slide.subtitle}
                </p>
                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                  <button
                    onClick={() => onViewChange('shop')}
                    className="bg-slate-900 dark:bg-emerald-brand text-white hover:bg-slate-800 dark:hover:bg-emerald-600 font-bold text-xs tracking-widest uppercase py-3 sm:py-3.5 px-6 sm:px-8 transition-colors cursor-pointer flex items-center justify-center space-x-2 rounded-full shadow-md w-full sm:w-auto"
                  >
                    <span>Explore Catalog</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </button>
                  <button
                    onClick={() => onViewChange('admin')}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold text-xs tracking-widest uppercase py-3 sm:py-3.5 px-6 sm:px-8 transition-colors cursor-pointer flex items-center justify-center space-x-2 rounded-full border border-gray-150 dark:border-slate-700 w-full sm:w-auto"
                  >
                    <span>Sell / Register Shop</span>
                    <Sparkles className="w-4 h-4 ml-1" />
                  </button>
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
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2.5">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3.5 h-1.5 transition-all outline-none cursor-pointer rounded-full ${
                idx === currentSlide ? 'bg-slate-900 dark:bg-white w-7' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section id="featured-categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-brand dark:text-slate-100">
            Shop by Category
          </h2>
          <p className="text-sm text-slate-brand/60 dark:text-slate-400 font-medium">
            Find peer-to-peer student deals tailored for your specific academic and life needs.
          </p>
          <div className="w-16 h-1 bg-emerald-brand mx-auto rounded-sm" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
              whileHover={{ y: -5, scale: 1.025, transition: { duration: 0.15 } }}
              onClick={() => onCategorySelect ? onCategorySelect(cat.id) : onViewChange('shop')}
              className="group relative h-40 flex flex-col items-center justify-center cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-brand dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/10 rounded-2xl transition-colors shadow-3xs"
            >
              <div className="mb-3 text-slate-400 group-hover:text-emerald-brand dark:group-hover:text-emerald-400 transition-colors">
                {getCategoryIcon(cat.id, "w-10 h-10")}
              </div>
              <div className="text-center px-2 space-y-1">
                <h3 className="text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm tracking-wide uppercase leading-tight line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {cat.name}
                </h3>
                <span className="block text-slate-500 text-[9px] font-mono font-bold flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 alive-blink inline-block" />
                  {cat.productCount} Items
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10 border-b border-gray-150 dark:border-slate-800 pb-4">
          <div>
            <span className="text-emerald-brand font-mono font-bold text-[10px] tracking-widest uppercase block mb-1">
              CAMPUS BULLETIN BOARD
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-slate-100">
              Recently Posted Items
            </h2>
          </div>
          <button
            onClick={() => onViewChange('shop')}
            className="text-xs sm:text-sm font-bold text-emerald-brand hover:text-emerald-700 flex items-center space-x-1 uppercase tracking-wider cursor-pointer"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4" />
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
                      {product.condition && (
                        <span className={`absolute top-2 left-2 text-[9px] font-bold font-mono py-0.5 px-2 rounded-full shadow-sm text-white alive-blink ${
                          product.condition === 'new' ? 'bg-green-600' :
                          product.condition === 'like_new' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}>
                          {product.condition.toUpperCase().replace('_', ' ')}
                        </span>
                      )}
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
                        {getRelativeTime(product.createdAt) || 'recent'}
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
      <section id="why-choose-us" className="relative py-16 border-y border-emerald-brand/10 dark:border-emerald-900/20 overflow-hidden">
        {/* Stationary matching background image */}
        <div 
          className="absolute inset-0 bg-fixed bg-cover bg-center pointer-events-none opacity-[0.14] dark:opacity-[0.20] blur-[1px]" 
          style={{ backgroundImage: "url('/og-image.jpeg.20.42.jpeg')" }}
        />
        {/* Soft overlay tint */}
        <div className="absolute inset-0 bg-emerald-brand/[0.04] dark:bg-slate-950/80 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-orange-brand dark:text-orange-500 font-mono font-bold text-[10px] tracking-widest uppercase block mb-1">
              THE THREE-PILLAR PROTOCOL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-slate-100">
              How TU Market Hub Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-brand/60 dark:text-slate-400 font-semibold">
              We make peer transactions secure, straightforward, and zero-commission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-3xs border border-gray-150 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-brand/15 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-emerald-brand dark:text-emerald-400" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-brand dark:text-slate-200">
                1. Browse Student Stalls
              </h3>
              <p className="text-xs text-slate-brand/60 dark:text-slate-400 font-sans leading-relaxed">
                Connect with student sellers offering verified gadget condition reports, tech specs, or homemade recipes right around Lagos dorm networks.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-3xs border border-gray-150 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md flex items-center justify-center mx-auto">
                <MessageCircle className="w-6 h-6 text-orange-brand dark:text-orange-500" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-brand dark:text-slate-200">
                2. Chat Directly on WhatsApp
              </h3>
              <p className="text-xs text-slate-brand/60 dark:text-slate-400 font-sans leading-relaxed">
                No middleman or complex escrow holding. Tap 'Chat' to instantly connect with the seller to arrange meetups or inquiries.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-3xs border border-gray-150 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-brand/15 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-emerald-brand dark:text-emerald-400" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-brand dark:text-slate-200">
                3. Buy or Sell Items!
              </h3>
              <p className="text-xs text-slate-brand/60 dark:text-slate-400 font-sans leading-relaxed">
                Meet safely at designated TU Campus Plaza meetspots. Trade your items or complete bank transfers cleanly!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured / Highly Rated Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-brand dark:text-slate-100">
            Featured Listings
          </h2>
          <p className="text-sm text-slate-brand/60 dark:text-slate-400 font-medium font-sans">
            Handpicked study gadgets, exclusive deals, and campus services highly rated by student unions.
          </p>
          <div className="w-16 h-1 bg-slate-900 dark:bg-emerald-brand mx-auto rounded-sm" />
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
                      {product.condition && (
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[8px] font-bold font-mono py-0.5 px-2 rounded-sm alive-blink">
                          {product.condition.toUpperCase()}
                        </span>
                      )}
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
                        {getRelativeTime(product.createdAt)}
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
        <div className="relative bg-slate-900 border border-slate-800 p-8 sm:p-12 md:p-16 text-center text-white space-y-6 rounded-3xl overflow-hidden">
          <div className="absolute top-4 right-4 text-slate-700/50 dark:text-white/5 font-bold text-7xl font-sans tracking-wide uppercase select-none pointer-events-none">
            TU HUB
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              Got Stuff to Sell?
            </h2>
            <p className="text-sm sm:text-base text-slate-400 dark:text-slate-300/80 font-light max-w-lg mx-auto leading-relaxed">
              Activate your store in seconds with zero listing charges! log in using Google Auth, update your WhatsApp number, upload your items, snacks or gadgets, and reach thousands of TU peers!
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onViewChange('admin')}
                className="bg-white dark:bg-emerald-brand text-slate-900 dark:text-white border border-white dark:border-emerald-brand font-bold text-sm tracking-widest uppercase py-4 px-10 transition-colors hover:bg-slate-200 dark:hover:bg-emerald-600 cursor-pointer inline-flex items-center space-x-2.5 rounded-full"
              >
                <Sparkles className="w-5 h-5 fill-slate-900 dark:fill-white stroke-none" />
                <span>Go to Seller Console</span>
              </button>
              <button
                onClick={handleCTAClick}
                className="bg-transparent text-white border border-slate-700 font-bold text-sm tracking-widest uppercase py-4 px-8 transition-colors hover:bg-slate-800 cursor-pointer inline-flex items-center space-x-2 rounded-full"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Student Support</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
