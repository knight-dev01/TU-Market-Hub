import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Star, Tag, RefreshCw as SwapIcon, ArrowLeft } from 'lucide-react';
import { getRelativeTime, calculateDiscount } from '../utils';
import { Product, Category } from '../types';

interface ShopViewProps {
  products: Product[];
  categories: Category[];
  onSelectProduct: (productId: string) => void;
  initialCategory?: string;
  onBack?: () => void;
}

export default function ShopView({
  products,
  categories,
  onSelectProduct,
  initialCategory,
  onBack
}: ShopViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all'); // 'all', 'instock', 'outofstock'
  const [conditionFilter, setConditionFilter] = useState<string>('all'); // 'all', 'new', 'like_new', 'used'
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest', 'price-asc', 'price-desc', 'popular'
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Synchronize state when home page category selector triggers a navigation search
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Constants
  const priceOptions = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₦5,000', value: 'under-5' },
    { label: '₦5,000 - ₦20,000', value: '5-20' },
    { label: '₦20,000 - ₦50,000', value: '20-50' },
    { label: 'Over ₦50,000', value: 'over-50' }
  ];

  const sortOptions = [
    { label: 'Recently Listed', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Featured First', value: 'popular' }
  ];

  const conditionOptions = [
    { label: 'All Conditions', value: 'all' },
    { label: 'New / Packed', value: 'new' },
    { label: 'Like New (Gently Used)', value: 'like_new' },
    { label: 'Fairly Used', value: 'used' }
  ];

  // Filtering Logic
  const filteredProducts = products
    .filter((product) => {
      // 1. Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (product.vendorName && product.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // 2. Category filter
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      // 3. Price filter
      let matchesPrice = true;
      if (priceRange === 'under-5') matchesPrice = product.price < 5000;
      else if (priceRange === '5-20') matchesPrice = product.price >= 5000 && product.price <= 20000;
      else if (priceRange === '20-50') matchesPrice = product.price >= 20000 && product.price <= 50000;
      else if (priceRange === 'over-50') matchesPrice = product.price > 50000;

      // 4. Stock filter
      let matchesStock = true;
      if (stockFilter === 'instock') matchesStock = product.stock > 0 && product.status !== 'out_of_stock';
      else if (stockFilter === 'outofstock') matchesStock = product.stock === 0 || product.status === 'out_of_stock';

      // 5. Condition filter
      let matchesCondition = true;
      if (conditionFilter !== 'all') {
        matchesCondition = product.condition === conditionFilter;
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesCondition;
    })
    // Sorting Logic
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setStockFilter('all');
    setConditionFilter('all');
    setSortBy('newest');
  };

  return (
    <div id="shop-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title Header with back navigation */}
      <div className="mb-8 space-y-4">
        <button
          onClick={onBack || (() => window.location.href = '/')}
          className="flex items-center space-x-1.5 text-xs text-slate-brand/60 dark:text-slate-400 font-bold uppercase tracking-wider hover:text-emerald-brand cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-brand">
            Campus Storefront
          </h1>
          <p className="text-xs sm:text-sm text-slate-brand/60 font-medium">
            Showing <span className="text-emerald-brand font-bold">{filteredProducts.length}</span> verified student listings available. Buy or bargain instantly!
          </p>
        </div>
      </div>

      {/* Controls: Search and Mobile Filter Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search input bar */}
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-brand/40">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search study guide name, laptops, hoodies, vendor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-brand dark:focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium transition-all text-slate-brand dark:text-slate-100 outline-none"
          />
        </div>

        {/* Sort Trigger */}
        <div className="flex gap-3">
          <div className="relative flex-grow sm:flex-grow-0 min-w-[180px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-brand/40 pointer-events-none">
              <ArrowUpDown className="w-4 h-4" />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-11 pr-10 text-xs sm:text-sm font-semibold text-slate-brand dark:text-slate-100 outline-none focus:border-emerald-brand transition-all cursor-pointer appearance-none w-full"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Toggle Slide Panel on Mobile */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-brand dark:text-slate-100 hover:text-emerald-brand p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center"
            title="Toggle Filters"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters Widget (Desktop Only) */}
        <aside id="desktop-filters" className="hidden md:block w-64 shrink-0 space-y-7 pr-4">
          
          {/* Headline & Reset */}
          <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
            <h3 className="font-display font-semibold text-xs tracking-widest uppercase text-slate-brand dark:text-slate-100">
              Filter Options
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-emerald-brand dark:text-emerald-400 hover:text-opacity-80 font-bold flex items-center space-x-1 uppercase tracking-wider cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories select list */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-brand/50 dark:text-slate-400">Category</h4>
            <div className="space-y-1.5 flex flex-col">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-left text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all uppercase tracking-wider ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-brand text-white'
                    : 'bg-slate-100 text-slate-brand hover:bg-emerald-brand/5'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all uppercase tracking-wider flex justify-between items-center ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-brand text-white'
                      : 'bg-slate-100 text-slate-brand hover:bg-emerald-brand/5'
                  }`}
                >
                  <span className="truncate max-w-[130px]">{cat.name}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 rounded-full flex items-center gap-1 ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-brand/5 text-slate-brand/40'}`}>
                    <span className={`w-1 h-1 rounded-full alive-blink ${selectedCategory === cat.id ? 'bg-white' : 'bg-emerald-500'}`} />
                    {cat.productCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Condition filters */}
          <div className="space-y-2.5 border-t border-gray-150 dark:border-slate-800 pt-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-brand/50 dark:text-slate-400">Item Condition</h4>
            <div className="space-y-1.5 flex flex-col">
              {conditionOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center space-x-3 text-xs font-medium text-slate-brand/80 dark:text-slate-300 hover:text-slate-brand dark:hover:text-white cursor-pointer select-none py-1"
                >
                  <input
                    type="radio"
                    name="condition-desktop"
                    value={opt.value}
                    checked={conditionFilter === opt.value}
                    onChange={() => setConditionFilter(opt.value)}
                    className="w-4 h-4 text-emerald-brand border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-emerald-brand cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Prices filters */}
          <div className="space-y-2.5 border-t border-gray-150 dark:border-slate-800 pt-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-brand/50 dark:text-slate-400">Price Range</h4>
            <div className="space-y-1.5 flex flex-col">
              {priceOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center space-x-3 text-xs font-medium text-slate-brand/80 dark:text-slate-300 hover:text-slate-brand dark:hover:text-white cursor-pointer select-none py-1"
                >
                  <input
                    type="radio"
                    name="priceFilter-desktop"
                    value={opt.value}
                    checked={priceRange === opt.value}
                    onChange={() => setPriceRange(opt.value)}
                    className="w-4 h-4 text-emerald-brand border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-emerald-brand cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability filters */}
          <div className="space-y-2.5 border-t border-gray-150 dark:border-slate-800 pt-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-brand/50 dark:text-slate-400">Availability</h4>
            <div className="space-y-1.5 flex flex-col">
              {[
                { label: 'All Items', value: 'all' },
                { label: 'In Stock only', value: 'instock' },
                { label: 'Out of Stock / Sold', value: 'outofstock' }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center space-x-3 text-xs font-medium text-slate-brand/80 dark:text-slate-300 hover:text-slate-brand dark:hover:text-white cursor-pointer select-none py-1"
                >
                  <input
                    type="radio"
                    name="stockFilter-desktop"
                    value={opt.value}
                    checked={stockFilter === opt.value}
                    onChange={() => setStockFilter(opt.value)}
                    className="w-4 h-4 text-emerald-brand border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-emerald-brand cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* Mobile Filters Drawer Panel */}
        {showFiltersMobile && (
          <div id="mobile-filters-drawer" className="md:hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 mb-4 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
              <span className="font-bold text-sm tracking-widest uppercase text-slate-brand dark:text-slate-100">Filters Drawer</span>
              <button onClick={handleResetFilters} className="text-xs text-emerald-brand dark:text-emerald-400 font-bold uppercase tracking-wider">
                Reset All
              </button>
            </div>

            {/* Mobile category button selectors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-brand/60 dark:text-slate-400 block uppercase tracking-wide">Category</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-[10px] font-bold py-2 px-3.5 rounded-full transition-all uppercase tracking-wider ${
                    selectedCategory === 'all' ? 'bg-emerald-brand text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-brand dark:text-slate-300'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-[10px] font-bold py-2 px-3.5 rounded-full transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                      selectedCategory === cat.id ? 'bg-emerald-brand text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-brand dark:text-slate-300'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="opacity-75 font-bold">({cat.productCount})</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 alive-blink shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Select Fields */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-brand/65 dark:text-slate-400 uppercase tracking-wider">Condition</span>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs text-slate-brand dark:text-slate-100 outline-none focus:border-emerald-brand w-full"
                >
                  {conditionOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-brand/65 dark:text-slate-400 uppercase tracking-wider">Price Limit</span>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs text-slate-brand dark:text-slate-100 outline-none focus:border-emerald-brand w-full"
                >
                  {priceOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-brand/65 dark:text-slate-400 uppercase tracking-wider">Availability</span>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs text-slate-brand dark:text-slate-100 outline-none focus:border-emerald-brand w-full"
                >
                  <option value="all">All Items</option>
                  <option value="instock">In Stock</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowFiltersMobile(false)}
              className="w-full bg-slate-900 dark:bg-emerald-brand border border-slate-900 dark:border-emerald-brand hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold text-xs tracking-widest uppercase py-3.5 rounded-full cursor-pointer transition-colors"
            >
              Apply Filter Selections
            </button>
          </div>
        )}

        {/* Listings Grid Section */}
        <div className="flex-grow">
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl space-y-4 bg-white dark:bg-slate-900 shadow-2xs">
              <p className="text-base font-semibold text-slate-brand/70 dark:text-slate-300">No matching campus deals found</p>
              <p className="text-xs text-slate-brand/40 dark:text-slate-500 font-medium max-w-sm mx-auto p-2">
                Try loosening your filters, resetting choices, or searching with a broader keyword (e.g., laptop, fan, snack)!
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-slate-900 border border-slate-900 dark:bg-emerald-brand dark:border-emerald-brand text-white font-semibold text-xs py-3 px-6 rounded-full hover:bg-slate-800 dark:hover:bg-emerald-600 transition-colors cursor-pointer uppercase tracking-wider shadow-sm"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const catName = categories.find(c => c.id === product.category)?.name || 'Listing';
                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product.id)}
                    className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-150/70 dark:border-slate-700/50 p-2 sm:p-3 hover:shadow-lg transition-all flex flex-col justify-between"
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
                        {product.featured && (
                          <span className="absolute top-2 right-2 bg-orange-brand text-white p-1 rounded-full shadow-xs">
                            <Star className="w-3.5 h-3.5 fill-white stroke-none" />
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold font-mono py-1 px-2 rounded-full">
                            SOLD OUT
                          </span>
                        )}
                        {product.stock > 0 && product.stock <= 3 && (
                          <span className="absolute top-2 left-2 bg-amber-500 text-slate-brand text-[9px] font-bold font-mono py-1 px-2 rounded-full">
                            LOW STOCK
                          </span>
                        )}

                        {/* Condition Badge */}
                        {product.condition && product.stock > 0 && (
                          <span className={`absolute top-2 left-2 text-[9px] font-bold font-mono py-0.5 px-2 rounded-full shadow-sm text-white alive-blink ${
                            product.condition === 'new' ? 'bg-green-600' :
                            product.condition === 'like_new' ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}>
                            {product.condition.toUpperCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 px-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-emerald-brand dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-brand alive-blink" />
                          <span>{catName}</span>
                        </div>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-brand dark:text-slate-100 line-clamp-1 group-hover:text-emerald-brand transition-colors leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 line-clamp-1 italic">
                          From: {product.vendorName || 'TU Peer Store'}
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
                                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px] px-1 py-0.5 rounded ml-1 whitespace-nowrap">
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
                      <span className="text-[10px] font-bold text-emerald-brand dark:text-emerald-400 hover:underline uppercase tracking-wide shrink-0 flex items-center gap-1.5 alive-pulse">
                        <span>View details</span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-emerald-brand dark:text-emerald-400 alive-blink shrink-0" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
