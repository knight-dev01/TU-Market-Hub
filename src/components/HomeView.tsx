import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Laptop, Sparkles, ShoppingBag, ArrowUpRight, MessageCircle, Shirt, Home, Briefcase, Coffee, Star, AlertCircle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
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

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto">
            Buying & selling shouldn't fill your WhatsApp groups with <span className="text-emerald-brand underline decoration-wavy decoration-emerald-500/30">endless screenshots</span>.
          </h1>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            Welcome to the centralized campus platform that gives every listing a permanent, searchable home. 
            <strong> Keep WhatsApp for direct conversations—use TU Market Hub for organized peer-to-peer commerce.</strong>
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
            <button
              onClick={() => onViewChange('shop')}
              className="w-full sm:w-1/2 bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-400 font-bold text-xs tracking-wider uppercase py-3.5 px-6 transition-all cursor-pointer flex items-center justify-center space-x-2 rounded-xl shadow-sm active:scale-98"
            >
              <span>Browse Listings</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onViewChange('admin')}
              className="w-full sm:w-1/2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs tracking-wider uppercase py-3.5 px-6 transition-all cursor-pointer flex items-center justify-center space-x-2 rounded-xl border border-gray-200 dark:border-slate-800 active:scale-98"
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
      </section>

      {/* 2. THE CHAT CHAOS PROBLEM SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-850 p-6 sm:p-12 shadow-3xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            
            {/* Visual Comparison / Clutter representation */}
            <div className="space-y-4 order-2 lg:order-1">
              <div className="bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>The WhatsApp Group Chat Problem</span>
                </span>
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                  <div className="flex items-start gap-2.5 bg-rose-500/5 p-2 rounded-xl border border-rose-500/5">
                    <span className="text-rose-500 font-bold shrink-0">❌</span>
                    <p><strong>Immediate Disappearance:</strong> Listings get buried under hundreds of unrelated group messages in minutes.</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-rose-500/5 p-2 rounded-xl border border-rose-500/5">
                    <span className="text-rose-500 font-bold shrink-0">❌</span>
                    <p><strong>Spam & Repetition:</strong> Students must manually copy-paste the exact same screenshots day after day to stay visible.</p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-rose-500/5 p-2 rounded-xl border border-rose-500/5">
                    <span className="text-rose-500 font-bold shrink-0">❌</span>
                    <p><strong>Annoyance & Muting:</strong> Vital academic discussions get drowned out, prompting group members to mute notifications entirely.</p>
                  </div>
                </div>
              </div>

              {/* Connected Visual Block */}
              <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/15 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>The TU Market Hub Solution</span>
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-medium">
                  We turn this chaos into a structured database. List your item <strong>once</strong>. It remains beautifully indexed and searchable until sold. Buyers search instantly, compare pricing transparently, and initiate one-click custom WhatsApp checkout scripts only when they are ready to transact.
                </p>
              </div>
            </div>

            {/* Explanatory Text */}
            <div className="space-y-5 order-1 lg:order-2">
              <span className="text-emerald-brand font-mono font-bold text-xs uppercase tracking-[0.2em] block">THE EVERYDAY EXPERIENCE</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-brand dark:text-white leading-tight">
                Relieving the Campus from Marketplace Clutter
              </h2>
              <p className="text-xs sm:text-sm text-slate-brand/70 dark:text-slate-350 leading-relaxed font-sans">
                At Trinity University, hostel lists and study plazas are hives of student commerce. However, relying entirely on random chat channels to post drawing boards, textbooks, kettles, or fashion items creates friction for both sides.
              </p>
              <p className="text-xs sm:text-sm text-slate-brand/70 dark:text-slate-350 leading-relaxed font-sans">
                By offering a persistent, searchable catalog, we keep hostel and department groups clean for academic announcements, while expanding your listing's reach to student peers and external off-campus buyers alike.
              </p>
              <div className="pt-1.5">
                <button
                  onClick={() => onViewChange('about')}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-brand hover:underline uppercase tracking-wider"
                >
                  <span>Read our full Vision Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CORE PLATFORM BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-emerald-brand font-mono font-bold text-[10px] uppercase tracking-widest block">TAILORED ADVANTAGES</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-white">
            Designed for Campus Needs
          </h2>
          <div className="w-10 h-1 bg-emerald-brand mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* For Sellers */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-brand dark:text-white">For Student Sellers</h3>
            <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans font-medium list-disc list-inside">
              <li><strong>List Once, Stay Visible:</strong> No need to repeatedly spam screenshots.</li>
              <li><strong>Rich Listings:</strong> Showcase multiple high-res photos.</li>
              <li><strong>Broadened Reach:</strong> Get discovered by external off-campus buyers.</li>
              <li><strong>No Commission Costs:</strong> Keep 100% of your listed value.</li>
            </ul>
          </div>

          {/* For Buyers */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-brand dark:text-white">For Smart Buyers</h3>
            <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans font-medium list-disc list-inside">
              <li><strong>Instant Search Queries:</strong> Find study guides or appliances immediately.</li>
              <li><strong>Category Filtering:</strong> Sift through items with clean filter tools.</li>
              <li><strong>Condition Status Grades:</strong> Know whether an item is New or Like New.</li>
              <li><strong>One-Click Chat Drafts:</strong> Contact vendors without messy introductions.</li>
            </ul>
          </div>

          {/* For the University */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-brand dark:text-white">For the TU Community</h3>
            <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans font-medium list-disc list-inside">
              <li><strong>Cleaner WhatsApp Groups:</strong> Maintain chat channels for announcement alerts.</li>
              <li><strong>Sustainable Peer Reuse:</strong> Keep high-quality goods circulating on campus.</li>
              <li><strong>Academic Preservation:</strong> Reduce visual spam that disrupts study groups.</li>
              <li><strong>Secure Peer Meetups:</strong> Encourage safe, transparent physical exchanges.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. DESIGNED WORKFLOW */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-900 border-y border-gray-150 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-mono font-bold text-emerald-brand uppercase tracking-[0.2em] block">SIMPLE & LINEAR</span>
            <h2 className="text-xl sm:text-3xl font-extrabold font-display text-slate-brand dark:text-white">
              The Hub Workspace Flow
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-brand/60 dark:text-slate-400 font-semibold font-sans">
              Designed as a streamlined, non-intrusive utility with direct student communication.
            </p>
          </div>

          {/* Steps Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-4 text-center relative">
            
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center mx-auto border border-emerald-500/20">
                1
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-brand dark:text-white">List Item once</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans px-2">
                Sellers log in securely and post their items, prices, conditions, and WhatsApp contact lines.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center mx-auto border border-emerald-500/20">
                2
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-brand dark:text-white">Browse Marketplace</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans px-2">
                Buyers search listings easily and filter items by category, condition, or listing types.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center mx-auto border border-emerald-500/20">
                3
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-brand dark:text-white">Find your Match</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans px-2">
                View detailed specs and read transparent seller notes about the item's condition.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center mx-auto border border-emerald-500/20">
                4
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-brand dark:text-white">Open WhatsApp</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans px-2">
                The platform prepares a fully pre-filled, editable inquiry draft directly addressed to the seller.
              </p>
            </div>

            {/* Step 5 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center mx-auto border border-emerald-500/20">
                5
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-brand dark:text-white">Complete Deal</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans px-2">
                Meet in open campus daylight spots to inspect the item first and conclude the purchase safely.
              </p>
            </div>

          </div>
        </div>
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
