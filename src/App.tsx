import { useState, useEffect } from 'react';
import { 
  collection, query, doc, getDoc, onSnapshot, orderBy, where, addDoc, serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ShoppingBag, X, MessageSquare, RefreshCw, Trash2, ArrowUpRight, Store, ArrowRight, LogIn, Sparkles, UserCheck, ShieldAlert, HeartHandshake } from 'lucide-react';
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
import WalkthroughGuide from './components/WalkthroughGuide';
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
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'about' | 'contact' | 'admin' | 'onboarding'>(() => {
    const saved = localStorage.getItem('tu_session_view');
    return (saved && ['home', 'shop', 'about', 'contact', 'admin', 'onboarding'].includes(saved))
      ? (saved as any)
      : 'home';
  });
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
  const [hasSkippedLoginGate, setHasSkippedLoginGate] = useState<boolean>(() => {
    return localStorage.getItem('tu_skipped_login') === 'true';
  });

  // PWA offline installation promotion state handlers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone;
    
    if (isStandalone) {
      console.log('Hub loaded in standalone app shell environment');
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const userChoice = await deferredPrompt.userChoice;
      if (userChoice.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("Enforced PWA Installation Guide:\nTo access offline catalogs directly on iOS Safari: Tap the Share icon along the bottom tray of your screen, scroll down, and select 'Add to Home Screen'!");
    }
  };

  // Shopper's Order Draft (Cart Drawer) States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutGroup, setCheckoutGroup] = useState<{
    vendorId: string;
    vendorName: string;
    vendorNumber: string;
    items: CartItem[];
  } | null>(null);

  // 30-minutes Inactivity Auto-Logout listener (Safeguard user stalls)
  useEffect(() => {
    if (!user) return;

    // Set initial timestamp
    const STORAGE_KEY = `tu_last_activity_${user.uid}`;
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    const updateActivity = () => {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    };

    // User interaction gestures
    const gestures = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    gestures.forEach(g => window.addEventListener(g, updateActivity));

    const checkInactivityInterval = setInterval(async () => {
      const lastActive = Number(localStorage.getItem(STORAGE_KEY) || Date.now());
      const maxInactivityMs = 30 * 60 * 1000; // 30 minutes of inactivity
      
      if (Date.now() - lastActive >= maxInactivityMs) {
        clearInterval(checkInactivityInterval);
        console.warn('Logging out seller due to 30 mins platform inactivity');
        try {
          await logoutUser();
          alert('You have been logged out automatically due to 30 minutes of inactivity to safeguard your platform credentials.');
        } catch (err) {
          console.error('Session auto-logout warning:', err);
        }
      }
    }, 10000); // Audit every 10 seconds

    return () => {
      gestures.forEach(g => window.removeEventListener(g, updateActivity));
      clearInterval(checkInactivityInterval);
    };
  }, [user]);

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
        const hardcodedAdmins = ['greatifet12@gmail.com', 'aroneefashion@gmail.com', 'osemenjoy448@gmail.com'];
        const isHardcodedAdmin = userEmail ? hardcodedAdmins.includes(userEmail) : false;
        
        // Secondary Admin DB document verification
        try {
          let isDocAdmin = false;
          const adminDocUid = await getDoc(doc(db, 'admins', currentUser.uid));
          if (adminDocUid.exists()) {
            isDocAdmin = true;
          } else if (userEmail) {
            const adminDocEmail = await getDoc(doc(db, 'admins', userEmail));
            isDocAdmin = adminDocEmail.exists();
          }
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
            discountPercentage: typeof d.discountPercentage === 'number' ? d.discountPercentage : 0,
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

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      const isIframe = window.self !== window.top;
      
      if (err?.code === 'auth/network-request-failed' || String(err).includes('network-request-failed')) {
        if (isIframe) {
          alert("Firebase Auth network error. Because this applet is run inside an iframe, browser privacy settings may block authentication. Please click the 'Open in New Tab' button in the top-right of the screen and log in there!");
        } else {
          alert("Firebase Auth network error. Please check your internet connection and try again.");
        }
      } else if (err?.code === 'auth/cancelled-popup-request') {
         // Silently ignore or show a friendly message
         console.log('Popup closed by user');
      } else {
        if (isIframe) {
          alert("Login failed. Please assure popups are enabled, or click the top-right button to run the application in a New Tab.");
        } else {
          alert("Login failed. Please assure popups are enabled, and try again.");
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('tu_skipped_login');
      setHasSkippedLoginGate(false);
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

  const handleViewChange = (view: 'home' | 'shop' | 'about' | 'contact' | 'admin' | 'onboarding') => {
    if (view === 'shop') {
      setShopInitialCategory('all');
    }
    setCurrentView(view);
    localStorage.setItem('tu_session_view', view);
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
    localStorage.setItem('tu_session_view', 'shop');
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
  const baseCategories = categories.length > 0 ? categories : fallbackCategories;
  const displayCategories: Category[] = baseCategories.map(cat => {
    const actCount = displayProducts.filter(p => p.category === cat.id && p.status === 'active').length;
    return {
      ...cat,
      productCount: actCount
    };
  });

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
        onLoginClick={() => {
          localStorage.removeItem('tu_skipped_login');
          setHasSkippedLoginGate(false);
          handleViewChange('admin');
        }}
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
                currentUser={user}
                onLoginClick={handleGoogleLogin}
              />
            </motion.div>
          ) : (!user && !hasSkippedLoginGate) ? (
            /* Welcome / Dual-Role Login Gateway */
            <motion.div
              key="gateway"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl mx-auto py-12 px-4 whitespace-normal select-none"
            >
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-brand/10 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Store className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                      Welcome to TU <span className="text-emerald-brand">Market</span> Hub
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                      Trinity University's official student marketplace and peer trading stall. Create, explore, and transact instantly within our safe hostel storefronts.
                    </p>
                  </div>
                </div>

                <hr className="border-gray-150 dark:border-slate-800" />

                {/* Left/Right Split Card Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Buyer Section */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200/50 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 font-display">Buyer / Shopper Hub</h3>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Browse & secure campus deals</p>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <div className="flex items-start space-x-2">
                          <span className="text-emerald-brand font-bold">✓</span>
                          <span>Browse gadgets, books, and fashion listings instantly</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-emerald-brand font-bold">✓</span>
                          <span>Draft orders and click to open pre-filled WhatsApp templates</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-emerald-brand font-bold">✓</span>
                          <span>Chat live inside the web browser with verified student sellers</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-150 dark:border-slate-800/60">
                      <button
                        onClick={() => {
                          localStorage.setItem('tu_skipped_login', 'true');
                          setHasSkippedLoginGate(true);
                          setCurrentView('shop');
                        }}
                        className="w-full bg-emerald-brand hover:bg-emerald-600 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 focus:ring-2 focus:ring-emerald-brand/35"
                      >
                        <span>Redirect to Shop / Marketplace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs tracking-wider uppercase py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-brand" />
                        <span>Sign In as Buyer</span>
                      </button>
                    </div>
                  </div>

                  {/* Seller Section */}
                  <div className="bg-emerald-brand/[0.01] dark:bg-emerald-500/[0.01] border border-emerald-brand/10 dark:border-emerald-500/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 font-display">Seller / Vendor Portal</h3>
                          <p className="text-[10px] text-emerald-500 dark:text-emerald-400 uppercase tracking-wider font-bold">List and manage hostel listings</p>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium font-sans">
                        <div className="flex items-start space-x-2">
                          <span className="text-emerald-brand font-bold">✓</span>
                          <span>Launch your own hostel storefront and list gadgets or fashion</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-emerald-brand font-bold">✓</span>
                          <span>Access personal real-time peer chats and live visitor clicks</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-emerald-brand font-bold">✓</span>
                          <span>Map listings directly to your personal WhatsApp number</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-150 dark:border-slate-800/60">
                      <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-slate-950 dark:bg-emerald-brand hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 border border-slate-800 dark:border-slate-700"
                      >
                        <LogIn className="w-3.5 h-3.5 text-emerald-brand dark:text-white" />
                        <span>Sign In as Student Seller</span>
                      </button>
                      <p className="text-[9px] text-center text-slate-400 dark:text-slate-500 mt-3 italic">
                        Secured with built-in student @google provider auth.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
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
                  onBack={() => setCurrentView('home')}
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

              {currentView === 'onboarding' && <WalkthroughGuide />}

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
          onInstallClick={() => setShowInstallBanner(true)}
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

      {/* PWA PERSISTENT INSTALL ENFORCEMENT BANNER */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 35, duration: 1.5 }}
            className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900 text-slate-100 border border-slate-800 p-5 rounded-2xl shadow-2xl flex flex-col space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <span className="alive-blink animate-pulse">🚀</span>
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white leading-none">Install TU Market Hub</h4>
                  <p className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider mt-0.5 animate-pulse">Enforced Platform Application</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInstallBanner(false)} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed text-left">
              For secure offline access on campus, faster loading, and resilient session saving, enforce the proper installed version of this student marketplace stall!
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleInstallApp}
                className="flex-1 bg-emerald-brand hover:bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase py-2.5 rounded-xl transition-all cursor-pointer alive-blink flex items-center justify-center space-x-1"
              >
                <span>Install App Instantly</span>
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] tracking-wider uppercase py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
