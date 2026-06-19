import { useState, useEffect } from 'react';
import { 
  collection, query, doc, getDoc, onSnapshot, orderBy, where, addDoc, serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ShoppingBag, X, MessageSquare, RefreshCw, Trash2, ArrowUpRight, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { db, auth, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from './firebase';
import { Product, Category, StoreSettings } from './types';
import { checkAndSeedDatabase, defaultCategories, defaultProducts } from './data/seed';

import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import ProductDetailView from './components/ProductDetailView';
import AdminView from './components/AdminView';

export const formatWhatsAppLink = (number: string): string => {
  let cleaned = number.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  return cleaned;
};
import WhatsAppOrderForm from './components/WhatsAppOrderForm';

interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export default function App() {
  
  // Dark Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Views navigation and Selection
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'about' | 'contact' | 'admin'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [shopInitialCategory, setShopInitialCategory] = useState<string>('all');

  // Disclaimer State
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => localStorage.getItem('tuMarketTermsAccepted') === 'true');

  const handleAcceptTerms = () => {
    localStorage.setItem('tuMarketTermsAccepted', 'true');
    setHasAcceptedTerms(true);
  };

  // Firestore DB States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>({
    whatsappNumber: '09047226729',
    contactAddress: 'Trinity University City Campus, Off Alara Street, (Near Queens College) Yaba, Lagos.',
    contactEmail: 'greatifet12@gmail.com',
    instagramUrl: 'https://instagram.com/tumarkethub',
    facebookUrl: 'https://facebook.com/tumarkethub',
    businessHours: '24/7 Digital Student Exchanges'
  });

  // Auth States
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Shopper's Order Draft (Cart Drawer) States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutGroup, setCheckoutGroup] = useState<{
    vendorId: string;
    vendorName: string;
    vendorNumber: string;
    items: CartItem[];
  } | null>(null);

  useEffect(() => {
    if (!isCartOpen) {
      setCheckoutGroup(null);
    }
  }, [isCartOpen]);

  // 1. Listen for auth changes
  useEffect(() => {

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userEmail = currentUser.email?.toLowerCase();
        const hardcodedAdmins = ['greatifet12@gmail.com', 'aroneefashion@gmail.com'];
        const isHardcodedAdmin = userEmail ? hardcodedAdmins.includes(userEmail) : false;
        
        // Secondary Admin DB document verification
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          const isDocAdmin = adminDoc.exists();
          setIsAdmin(isHardcodedAdmin || isDocAdmin);
        } catch (err) {
          // Fallback to email match if blocked by firestore read
          setIsAdmin(isHardcodedAdmin);
        }
      } else {
        setIsAdmin(false);
      }
      setIsInitializing(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // 2. Setup real-time queries for Products, Categories, Settings relative to authorization state
  useEffect(() => {
    if (isInitializing) return;

    // Refresh/Initialize database
    const handleDbInit = async () => {
      try {
        await checkAndSeedDatabase();
      } catch (err) {
        console.warn('Initial seeding lookup bypassed:', err);
      }
    };
    handleDbInit();

    // Query active & out_of_stock products for public shoppers to prevent blank-query permissions violations
    const productsQuery = isAdmin
      ? query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'products'), where('status', 'in', ['active', 'out_of_stock']));

    const unsubscribeProducts = onSnapshot(
      productsQuery, 
      (snapshot) => {
        const prodData: Product[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          prodData.push({
            id: docSnap.id,
            name: d.name || '',
            description: d.description || '',
            price: Number(d.price || 0),
            images: d.images || [],
            category: d.category || '',
            stock: Number(d.stock || 0),
            featured: Boolean(d.featured || false),
            status: d.status || 'active',
            condition: d.condition || 'like_new',
            dealType: d.dealType || 'sell',
            vendorId: d.vendorId || 'admin',
            vendorName: d.vendorName || 'Independence Stall',
            vendorWhatsApp: d.vendorWhatsApp || '',
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          });
        });

        // Always sort by creation timestamp descending in client-side memory
        prodData.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setProducts(prodData);
      },
      (err) => {
        console.error("Products subscriber error:", err);
        handleFirestoreError(err, OperationType.GET, 'products');
      }
    );

    const unsubscribeCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('name', 'asc')), 
      (snapshot) => {
        const catData: Category[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          catData.push({
            id: docSnap.id,
            name: d.name || '',
            image: d.image || '',
            productCount: Number(d.productCount || 0),
            createdAt: d.createdAt
          });
        });
        setCategories(catData);
      },
      (err) => {
        console.error("Categories subscriber error:", err);
        handleFirestoreError(err, OperationType.GET, 'categories');
      }
    );

    const unsubscribeSettings = onSnapshot(
      doc(db, 'settings', 'current'), 
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          
          let wNum = d.whatsappNumber || '09047226729';
          if (wNum.includes('8123456789') || wNum.includes('904 722')) wNum = '09047226729';
          
          let eMail = d.contactEmail || 'greatifet12@gmail.com';
          if (eMail.includes('support@tumarket.org')) eMail = 'greatifet12@gmail.com';

          let cAdd = d.contactAddress || 'Trinity University City Campus, Off Alara Street, (Near Queens College) Yaba, Lagos.';
          if (cAdd.includes('Main Campus')) cAdd = 'Trinity University City Campus, Off Alara Street, (Near Queens College) Yaba, Lagos.';

          setSettings({
            whatsappNumber: wNum,
            contactAddress: cAdd,
            contactEmail: eMail,
            instagramUrl: d.instagramUrl || 'https://instagram.com/tumarkethub',
            facebookUrl: d.facebookUrl || 'https://facebook.com/tumarkethub',
            businessHours: d.businessHours || '24/7 Digital Student Exchanges'
          });
        }
      },
      (err) => {
        console.error("Settings subscriber error:", err);
        handleFirestoreError(err, OperationType.GET, 'settings/current');
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeSettings();
    };
  }, [isAdmin, isInitializing]);

  const forceRefreshStats = async () => {
    console.log('Orchestrating inventory statistics updates...');
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.code === 'auth/network-request-failed' || String(err).includes('network-request-failed')) {
        alert("Firebase Auth network error. Note: Because this preview applet is run inside an iframe, browser privacy settings or third-party cookie restrictions may block authentication. Please click the 'Open in New Tab' button in the top-right of the screen and log in there!");
      } else {
        alert('Login failed. Please assure popups are enabled, or click the top-right button to run the application in a New Tab.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentView('home');
    } catch (err) {
      console.error(err);
    }
  };

  // Add Item to draft list
  const handleAddToCart = (product: Product, size: string) => {
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prevItems, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (idx: number, amount: number) => {
    setCartItems((prevItems) => {
      const updated = [...prevItems];
      const target = updated[idx];
      const newQty = target.quantity + amount;
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        target.quantity = newQty;
      }
      return updated;
    });
  };

  const handleRemoveFromCart = (idx: number) => {
    setCartItems((prevItems) => {
      const updated = [...prevItems];
      updated.splice(idx, 1);
      return updated;
    });
  };

  // Helper function to record a click/pick analytic in Firestore
  const logDirectWhatsAppClick = (product: Product, quantity: number, buyerInfo?: { name: string }) => {
    addDoc(collection(db, 'clicks'), {
      vendorId: product.vendorId || 'admin',
      productId: product.id || 'system',
      productName: product.name,
      buyerName: buyerInfo?.name || 'Anonymous Campus Buyer',
      price: Number(product.price || 0),
      quantity: Number(quantity),
      createdAt: serverTimestamp()
    }).catch((err) => {
      console.warn('Logging analytics click error:', err);
    });
  };

  // Compile and Dispatch consolidated chat message FOR A SPECIFIC VENDOR
  const handleLaunchWhatsAppForVendor = (
    vendorId: string, 
    vendorName: string, 
    vendorNumber: string, 
    items: CartItem[],
    buyerInfo?: { name: string; hostel: string; phone: string }
  ) => {
    if (items.length === 0) return;
    
    let totalVal = 0;
    let orderDetailLines = '';
    
    // Log each ordered item in Firestore for tracking
    items.forEach(async (item) => {
      try {
        await addDoc(collection(db, 'clicks'), {
          vendorId: item.product.vendorId || 'admin',
          productId: item.product.id || 'system',
          productName: item.product.name,
          buyerName: buyerInfo?.name || 'Anonymous Peer',
          price: Number(item.product.price || 0),
          quantity: Number(item.quantity || 1),
          createdAt: serverTimestamp()
        });
      } catch (clickErr) {
        console.warn('Logging analytics click error:', clickErr);
      }
    });

    items.forEach((item) => {
      const rowSum = item.product.price * item.quantity;
      totalVal += rowSum;
      const sizeStr = item.size ? ` (Variation: ${item.size})` : '';
      const conditionStr = item.product.condition ? ` (${item.product.condition.toUpperCase().replace('_', ' ')})` : '';
      const dealStr = item.product.dealType ? ` [Mode: ${item.product.dealType.toUpperCase()}]` : '';
      orderDetailLines += `- ${item.product.name}${sizeStr}${conditionStr}${dealStr}\n  Qty: ${item.quantity} x ₦${item.product.price.toLocaleString()} = ₦${rowSum.toLocaleString()}\n\n`;
    });

    const buyerSection = buyerInfo
      ? `*Buyer Contact Information:*\n- *Name:* ${buyerInfo.name}\n- *Hostel Location:* ${buyerInfo.hostel}\n- *Phone/WhatsApp:* ${buyerInfo.phone}\n\n`
      : '';

    const bodyText = `Hello student seller ${vendorName},

I saw your listing on the TU MARKET HUB and would like to purchase these items:

${orderDetailLines}*Total Listed Value:* ₦${totalVal.toLocaleString()}

${buyerSection}Where is your hostel meetup point on campus? Please let me know when you are free!`;

    const encoded = encodeURIComponent(bodyText);
    const whatsappClean = vendorNumber ? formatWhatsAppLink(vendorNumber) : formatWhatsAppLink(settings?.whatsappNumber || '09047226729');
    window.open(`https://wa.me/${whatsappClean}?text=${encoded}`, '_blank');
    
    // Auto remove items belonging to this specific vendor from cart
    setCartItems((prev) => prev.filter(item => (item.product.vendorId || 'admin') !== vendorId));
  };

  const cartItemTotalCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartItemsTotalPrice = cartItems.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);

  // Synchronize deep link for shared products (e.g., ?product=id) on load or products hydration
  useEffect(() => {
    if (products.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const productIdParam = urlParams.get('product') || urlParams.get('productId');
    if (productIdParam) {
      const match = products.find(p => p.id === productIdParam);
      if (match) {
        setSelectedProductId(productIdParam);
      }
    }
  }, [products]);

  const handleViewChange = (view: 'home' | 'shop' | 'about' | 'contact' | 'admin') => {
    if (view === 'shop') {
      setShopInitialCategory('all');
    }
    setCurrentView(view);
    setSelectedProductId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    url.searchParams.delete('productId');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCategoryFromHome = (categoryId: string) => {
    setShopInitialCategory(categoryId);
    setCurrentView('shop');
    setSelectedProductId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    url.searchParams.delete('productId');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const url = new URL(window.location.href);
    url.searchParams.set('product', productId);
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedProductId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    url.searchParams.delete('productId');
    window.history.pushState({}, '', url.toString());
  };

  const fallbackProducts: Product[] = defaultProducts.map((p, idx) => ({
    id: `prod-${idx + 1}`,
    name: p.name,
    description: p.description,
    price: p.price,
    images: p.images,
    category: p.category,
    stock: p.stock,
    featured: p.featured,
    status: p.status,
    condition: p.condition || 'new',
    dealType: p.dealType || 'sell',
    vendorId: p.vendorId || 'system-vendor',
    vendorName: p.vendorName || 'TU Official Stall',
    vendorWhatsApp: p.vendorWhatsApp || settings?.whatsappNumber || '09047226729',
    createdAt: { seconds: Date.now() / 1000 },
    updatedAt: { seconds: Date.now() / 1000 }
  } as unknown as Product));

  const fallbackCategories: Category[] = defaultCategories.map(c => ({
    id: c.id,
    name: c.name,
    image: c.image,
    productCount: defaultProducts.filter(p => p.category === c.id && p.status === 'active').length
  } as Category));

  const displayProducts = products.length > 0 ? products : fallbackProducts;
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  const activeDetailProduct = selectedProductId 
    ? displayProducts.find((p) => p.id === selectedProductId) 
    : null;

  // Group items in cart by Vendor for decoupled multi-vendor checkouts
  const vendorGroups: { [key: string]: { name: string; whatsapp: string; items: CartItem[] } } = {};
  cartItems.forEach((item) => {
    const vId = item.product.vendorId || 'admin';
    const vName = item.product.vendorName || 'System Admin';
    const vWhatsApp = item.product.vendorWhatsApp || settings?.whatsappNumber || '';
    if (!vendorGroups[vId]) {
      vendorGroups[vId] = {
        name: vName,
        whatsapp: vWhatsApp,
        items: []
      };
    }
    vendorGroups[vId].items.push(item);
  });

  return (
    <div id="application-root" className="min-h-screen bg-white dark:bg-[#0b0f19] flex flex-col justify-between font-sans leading-normal tracking-normal text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Dynamic Header Component */}
      <Header
        currentView={selectedProductId ? 'shop' : currentView}
        onViewChange={handleViewChange}
        isAdmin={isAdmin}
        user={user}
        onLoginClick={() => handleViewChange('admin')}
        cartCount={cartItemTotalCount}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area containing state wrappers */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {isInitializing ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center space-y-4"
            >
              <RefreshCw className="w-8 h-8 text-emerald-brand dark:text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-brand/50 font-bold uppercase tracking-widest">Hydrating Campus Marketplace...</p>
            </motion.div>
          ) : activeDetailProduct ? (
            /* Render Product Specification Details screen */
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductDetailView
                product={activeDetailProduct}
                allProducts={displayProducts}
                categories={displayCategories}
                onBack={handleBackFromDetail}
                onSelectProduct={handleSelectProduct}
                whatsappNumber={settings?.whatsappNumber || '09047226729'}
                onAddToCart={handleAddToCart}
                onLogClick={logDirectWhatsAppClick}
              />
            </motion.div>
          ) : (
            /* Render tabbed views */
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentView === 'home' && (
                <HomeView
                  products={displayProducts}
                  categories={displayCategories}
                  onViewChange={handleViewChange}
                  onSelectProduct={handleSelectProduct}
                  whatsappNumber={settings?.whatsappNumber || '09047226729'}
                  onCategorySelect={handleViewCategoryFromHome}
                />
              )}

              {currentView === 'shop' && (
                <ShopView
                  products={displayProducts}
                  categories={displayCategories}
                  onSelectProduct={handleSelectProduct}
                  initialCategory={shopInitialCategory}
                />
              )}

              {currentView === 'about' && <AboutView />}

              {currentView === 'contact' && settings && (
                <ContactView
                  whatsappNumber={settings.whatsappNumber}
                  contactAddress={settings.contactAddress}
                  contactEmail={settings.contactEmail}
                  instagramUrl={settings.instagramUrl}
                  facebookUrl={settings.facebookUrl}
                  businessHours={settings.businessHours}
                />
              )}

              {currentView === 'admin' && (
                <AdminView
                  user={user}
                  isAdmin={isAdmin}
                  onLogin={handleGoogleLogin}
                  onLogout={handleLogout}
                  products={displayProducts}
                  categories={displayCategories}
                  settings={settings}
                  onRefreshData={forceRefreshStats}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER BLOCK */}
      {settings && (
        <Footer
          onViewChange={handleViewChange}
          whatsappNumber={settings.whatsappNumber}
          contactEmail={settings.contactEmail}
          instagramUrl={settings.instagramUrl}
          facebookUrl={settings.facebookUrl}
        />
      )}

      {/* 8. SHOPPING CART / WhatsApp Multiple-Item Draft DRAWER OVERLAY */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans hover:outline-none text-xs flex justify-end items-center p-3 sm:p-4 pointer-events-none">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsCartOpen(false)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-3xs cursor-pointer pointer-events-auto" 
            />

            {/* Draggable/Animated Floating Panel */}
            <motion.div 
               initial={{ x: '110%', opacity: 0.9 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: '110%', opacity: 0.9 }}
               transition={{ type: 'spring', damping: 28, stiffness: 240 }}
               className="pointer-events-auto w-[90vw] sm:w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 shadow-3xl flex flex-col justify-between border border-gray-150 dark:border-slate-800 h-[calc(100vh-2rem)] rounded-3xl overflow-hidden relative ml-auto"
            >
              {checkoutGroup ? (
                <WhatsAppOrderForm
                  vendorName={checkoutGroup.vendorName}
                  itemsCount={checkoutGroup.items.reduce((acc, curr) => acc + curr.quantity, 0)}
                  totalPrice={checkoutGroup.items.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0)}
                  onClose={() => setCheckoutGroup(null)}
                  onSubmit={(buyerInfo) => {
                    handleLaunchWhatsAppForVendor(
                      checkoutGroup.vendorId,
                      checkoutGroup.vendorName,
                      checkoutGroup.vendorNumber,
                      checkoutGroup.items,
                      buyerInfo
                    );
                    setCheckoutGroup(null);
                  }}
                />
              ) : (
                <>
                  {/* Drawer Header */}
                  <div className="p-5 sm:p-6 border-b border-gray-150 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-brand dark:text-slate-100 font-display">My Deal Cart Offer Board</h3>
                      <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 font-medium">Grouped by student stalls for easy secure exchange!</p>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-brand/40 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-500 cursor-pointer transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Drawer Items Center scrolling */}
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                    {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/80 text-slate-300 dark:text-slate-600 border border-gray-200 dark:border-slate-700/50 rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-brand/70 leading-none">Your Offer List is Empty</p>
                          <p className="text-[10.5px] text-slate-brand/45 leading-relaxed mt-1 max-w-[200px] mx-auto">
                            Explore study tools, hostellers mattress options, or shoes to add here!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.keys(vendorGroups).map((vId) => {
                          const group = vendorGroups[vId];
                          return (
                            <div key={vId} className="border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-900/10 p-4 rounded-3xl space-y-3.5">
                              {/* Vendor Group Header */}
                              <div className="flex items-center justify-between border-b border-gray-150/60 dark:border-slate-700/60 pb-2">
                                <div className="flex items-center space-x-1.5 min-w-0">
                                  <Store className="w-4 h-4 text-emerald-brand dark:text-emerald-400 shrink-0" />
                                  <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 font-display truncate">Stall: {group.name}</span>
                                </div>
                                <span className="text-[9px] font-mono font-bold bg-white dark:bg-slate-800 text-emerald-brand dark:text-emerald-400 px-2 py-0.5 border border-emerald-100 dark:border-emerald-900/50 rounded-full shrink-0">
                                  {group.items.length} item(s)
                                </span>
                              </div>

                              {/* Items belonging to this vendor */}
                              <div className="space-y-2.5">
                                {group.items.map((item) => {
                                  // Find exact global index of this item in state array so we can increment/remove it
                                  const originalIdx = cartItems.findIndex(ci => ci.product.id === item.product.id && ci.size === item.size);
                                  return (
                                    <div key={`${item.product.id}-${item.size}`} className="flex items-start space-x-3 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-gray-150/40 dark:border-slate-700/50 relative">
                                      <img
                                        src={item.product.images[0]}
                                        alt=""
                                        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-100 dark:border-slate-700"
                                      />
                                      <div className="flex-grow min-w-0 pr-4">
                                        <h4 className="font-bold text-[11px] text-slate-brand dark:text-slate-200 truncate leading-tight">{item.product.name}</h4>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                          {item.size && (
                                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[8px] font-mono font-bold px-1 rounded">
                                              {item.size}
                                            </span>
                                          )}
                                          <span className="text-[10px] font-mono font-bold text-slate-brand dark:text-emerald-400">
                                            &#8358;{item.product.price.toLocaleString()}
                                          </span>
                                        </div>

                                        {/* Incrementor */}
                                        <div className="flex items-center space-x-2 pt-1.5">
                                          <button
                                            onClick={() => handleUpdateCartQty(originalIdx, -1)}
                                            className="w-4.5 h-4.5 rounded bg-slate-50 dark:bg-slate-700 border border-gray-250 dark:border-slate-600 text-[10px] font-bold flex items-center justify-center cursor-pointer hover:border-emerald-brand dark:hover:border-emerald-500"
                                          >
                                            -
                                          </button>
                                          <span className="font-bold text-xs px-1 text-slate-brand dark:text-slate-200">{item.quantity}</span>
                                          <button
                                            onClick={() => handleUpdateCartQty(originalIdx, 1)}
                                            className="w-4.5 h-4.5 rounded bg-slate-50 dark:bg-slate-700 border border-gray-250 dark:border-slate-600 text-[10px] font-bold flex items-center justify-center cursor-pointer hover:border-emerald-brand dark:hover:border-emerald-500"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>

                                      {/* Absolute delete button */}
                                      <button
                                        onClick={() => handleRemoveFromCart(originalIdx)}
                                        className="absolute top-2 right-2 p-1 text-slate-brand/35 dark:text-slate-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Quick Message Button for this SPECIFIC Vendor */}
                              <button
                                onClick={() => setCheckoutGroup({
                                  vendorId: vId,
                                  vendorName: group.name,
                                  vendorNumber: group.whatsapp,
                                  items: group.items
                                })}
                                className="w-full bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-[10px] py-2 px-3 rounded-xl tracking-wider uppercase flex items-center justify-center space-x-2 shadow-3xs cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5 fill-white stroke-none" />
                                <span>Discuss with {group.name}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer summary & Info */}
                  <div className="p-5 sm:p-6 border-t border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-4">
                    
                    {cartItems.length > 0 && (
                      <div className="space-y-1.5 text-xs text-left">
                        <div className="flex justify-between font-medium text-slate-brand/60 dark:text-slate-400">
                          <span>Total draft items checklist:</span>
                          <span className="font-mono text-slate-brand dark:text-slate-300">{cartItemTotalCount} units</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-slate-brand dark:text-slate-200 pt-1 border-t border-gray-200 dark:border-slate-700/60">
                          <span>Consolidated Estimate:</span>
                          <span className="font-mono text-emerald-brand text-base">&#8358; {cartItemsTotalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-brand/40 text-center leading-relaxed">
                      Start your order now by selecting items from the shop!
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISCLAIMER OVERLAY */}
      {/* Disclaimer Modal relative to user consent */}
      {!hasAcceptedTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl shadow-2xl p-8 transform transition-all text-slate-800 dark:text-slate-100 border dark:border-slate-800/50">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-800 pb-3">Platform Disclaimer</h2>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white font-bold">Disclaimer & Responsibility:</strong> This platform is provided strictly as a peer-to-peer connection board. We do not independently verify listings or process payments. All buying and selling must be done securely between students on campus. Please use this platform responsibly and exercise caution when making financial commitments.
              </p>
              <p className="font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/20">
                By using TU MARKET HUB, you agree to comply with our academic and community guidelines.
              </p>
            </div>
            <button
              onClick={handleAcceptTerms}
              className="w-full bg-emerald-brand hover:bg-emerald-700 text-white font-bold tracking-wider uppercase py-4 rounded-full shadow-md transition-colors cursor-pointer"
            >
              I Agree & Understand
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
