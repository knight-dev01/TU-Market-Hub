import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Star, BookOpen, Laptop, Sparkles, ShoppingBag, ArrowUpRight, MessageCircle, RefreshCw, Shirt, Home, Briefcase, Coffee } from 'lucide-react';
import { Product, Category } from '../types';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  onViewChange: (view: 'home' | 'shop' | 'about' | 'contact' | 'admin') => void;
  onSelectProduct: (productId: string) => void;
  whatsappNumber: string;
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
  whatsappNumber
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

  const handleCTAClick = () => {
    const text = encodeURIComponent("Hello! I am browsing the TU MARKET HUB and would like to ask some questions about ordering or hosting a store!");
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div id="home-view" className="space-y-16">
      
      {/* 1. Hero Banner Carousel / Slider */}
      <section id="hero-slider" className="relative min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] w-full overflow-hidden bg-slate-50 flex items-center justify-center">
        {heroSlides.map((slide, index) => {
          const Icon = slide.icon;
          return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center p-4 sm:p-8 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className="opacity-80 text-emerald-brand">
                  <Icon className="w-12 h-12 sm:w-16 sm:h-16 stroke-1 mx-auto" />
                </div>
                <span className="inline-block bg-white shadow-xs text-slate-800 dark:text-slate-200 font-mono font-bold text-[10px] sm:text-xs tracking-widest px-4 py-1.5 uppercase rounded-full border border-gray-100">
                  {slide.badge}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight text-slate-900">
                  {slide.title}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 font-light leading-relaxed max-w-xl">
                  {slide.subtitle}
                </p>
                <div className="pt-2 sm:pt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
                  <button
                    onClick={() => onViewChange('shop')}
                    className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs sm:text-sm tracking-widest uppercase py-3 sm:py-3.5 px-6 sm:px-8 transition-colors cursor-pointer flex items-center space-x-2 rounded-full shadow-md"
                  >
                    <span>Explore Catalog</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </button>
                  <button
                    onClick={() => onViewChange('admin')}
                    className="bg-white hover:bg-slate-50 text-slate-900 shadow-xs font-bold text-xs sm:text-sm tracking-widest uppercase py-3 sm:py-3.5 px-6 sm:px-8 transition-colors cursor-pointer flex items-center space-x-2 rounded-full border border-gray-100"
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
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer hidden sm:block bg-white shadow-sm rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer hidden sm:block bg-white shadow-sm rounded-full"
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
                idx === currentSlide ? 'bg-slate-900 w-7' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section id="featured-categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-brand">
            Shop by Category
          </h2>
          <p className="text-sm text-slate-brand/60 font-medium">
            Find peer-to-peer student deals tailored for your specific academic and life needs.
          </p>
          <div className="w-16 h-1 bg-emerald-brand mx-auto rounded-sm" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onViewChange('shop')}
              className="group relative h-40 flex flex-col items-center justify-center cursor-pointer transition-all border border-slate-200 bg-white hover:border-emerald-brand hover:bg-emerald-50 rounded-2xl"
            >
              <div className="mb-3 text-slate-400 group-hover:text-emerald-brand transition-colors">
                {getCategoryIcon(cat.id, "w-10 h-10")}
              </div>
              <div className="text-center px-2 space-y-1">
                <h3 className="text-slate-900 font-bold text-xs sm:text-sm tracking-wide uppercase leading-tight line-clamp-1 group-hover:text-emerald-700">
                  {cat.name}
                </h3>
                <span className="block text-slate-500 text-[9px] font-mono font-bold">
                  {cat.productCount} Items
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10 border-b border-gray-150 pb-4">
          <div>
            <span className="text-emerald-brand font-mono font-bold text-[10px] tracking-widest uppercase block mb-1">
              CAMPUS BULLETIN BOARD
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand">
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
          <div className="py-12 text-center bg-gray-brand rounded-2xl border border-gray-100">
            <p className="text-sm font-medium text-slate-brand/50">Fetching student marketplace listings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => {
              const catName = categories.find(c => c.id === product.category)?.name || 'Listing';
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-150/70 p-2 sm:p-3 hover:shadow-md transition-all flex flex-col justify-between"
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
                        <span className={`absolute top-2 left-2 text-[9px] font-bold font-mono py-0.5 px-2 rounded-full shadow-sm text-white ${
                          product.condition === 'new' ? 'bg-green-600' :
                          product.condition === 'like_new' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}>
                          {product.condition.toUpperCase().replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 px-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-bold text-emerald-brand uppercase tracking-wider">
                          {catName}
                        </p>
                        <span className="text-[9px] font-medium text-slate-brand/40">
                          Qty: {product.stock}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-brand line-clamp-1 group-hover:text-emerald-brand transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-[10px] text-slate-brand/50 line-clamp-1 italic">
                        Sold by: {product.vendorName || 'TU Peer Seller'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 px-1 border-t border-gray-100 mt-3">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-brand font-mono">
                      &#8358; {product.price.toLocaleString()}
                    </span>
                    <button className="text-[10px] font-bold border border-slate-300 text-slate-600 py-1 px-2.5 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors cursor-pointer">
                      View Deal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Why Choose Us / Interactive Process section */}
      <section id="why-choose-us" className="bg-emerald-brand/5 py-16 border-y border-emerald-brand/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-orange-brand font-mono font-bold text-[10px] tracking-widest uppercase block mb-1">
              THE THREE-PILLAR PROTOCOL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand">
              How TU Market Hub Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-brand/60 font-medium">
              We make peer transactions secure, straightforward, and zero-commission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-3xs border border-gray-150 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-brand/15 text-emerald-brand rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-emerald-brand" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-brand">
                1. Browse Student Stalls
              </h3>
              <p className="text-xs text-slate-brand/60 font-sans leading-relaxed">
                Connect with student sellers offering verified gadget condition reports, tech specs, or homemade recipes right around Lagos dorm networks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-3xs border border-gray-150 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-md flex items-center justify-center mx-auto">
                <MessageCircle className="w-6 h-6 text-orange-brand" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-brand">
                2. Chat Directly on WhatsApp
              </h3>
              <p className="text-xs text-slate-brand/60 font-sans leading-relaxed">
                No middleman or complex escrow holding. Tap 'Chat' to instantly connect with the seller to arrange meetups or inquiries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-3xs border border-gray-150 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-brand/15 text-emerald-brand rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-emerald-brand" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-brand">
                3. Buy or Sell Items!
              </h3>
              <p className="text-xs text-slate-brand/60 font-sans leading-relaxed">
                Meet safely at designated TU Campus Plaza meetspots. Trade your items or complete bank transfers cleanly!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured / Highly Rated Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 max-w-xl mx-auto mb-10">
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-brand">
            Featured Listings
          </h2>
          <p className="text-sm text-slate-brand/60 font-medium font-sans">
            Handpicked study gadgets, exclusive deals, and campus services highly rated by student unions.
          </p>
          <div className="w-16 h-1 bg-slate-900 mx-auto rounded-sm" />
        </div>

        {isProductsEmpty ? (
          <div className="py-12 text-center bg-gray-brand rounded-2xl border border-gray-100">
            <p className="text-sm font-medium text-slate-brand/50">Loading selected campus deals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => {
              const catName = categories.find(c => c.id === product.category)?.name || 'Listing';
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-150/70 p-2 sm:p-3 hover:shadow-md transition-all flex flex-col justify-between"
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
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[8px] font-bold font-mono py-0.5 px-2 rounded-sm">
                          {product.condition.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 px-1">
                      <p className="text-[9px] tracking-widest text-emerald-brand font-bold uppercase">
                        {catName}
                      </p>
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-brand line-clamp-1 group-hover:text-emerald-brand transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-brand/50">
                        Seller: {product.vendorName || 'TU Stall'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 px-1 border-t border-gray-100 mt-3">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-brand font-mono">
                      &#8358; {product.price.toLocaleString()}
                    </span>
                    <button className="text-[10px] font-bold border border-slate-300 text-slate-600 py-1 px-2.5 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors cursor-pointer">
                      View Deal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Call To Action (Student sign up) */}
      <section id="banner-cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative bg-slate-900 border border-slate-800 p-8 sm:p-12 md:p-16 text-center text-white space-y-6 rounded-3xl">
          <div className="absolute top-4 right-4 text-slate-700 font-bold text-7xl font-sans tracking-wide uppercase select-none pointer-events-none">
            TU HUB
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight">
              Got Stuff to Sell?
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-light max-w-lg mx-auto leading-relaxed">
              Activate your store in seconds with zero listing charges! log in using Google Auth, update your WhatsApp number, upload your items, snacks or gadgets, and reach thousands of TU peers!
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onViewChange('admin')}
                className="bg-white text-slate-900 border border-white font-bold text-sm tracking-widest uppercase py-4 px-10 transition-colors hover:bg-slate-200 cursor-pointer inline-flex items-center space-x-2.5 rounded-full"
              >
                <Sparkles className="w-5 h-5 fill-slate-900 stroke-none" />
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
