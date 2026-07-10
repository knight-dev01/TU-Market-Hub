import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  collection, query, doc, getDoc, onSnapshot, orderBy, where, addDoc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { ShoppingBag, X, MessageSquare, RefreshCw, Trash2, ArrowUpRight, Store, ArrowRight, LogIn, Sparkles, UserCheck, ShieldAlert, HeartHandshake, DownloadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { NetworkStatusBanner } from './components/NetworkStatusBanner';

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
  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const showToastRef = useRef<(m: string, t?: 'success' | 'error' | 'info') => void>(showToast);
  showToastRef.current = showToast;

  // Synchronously override window.alert on every render pass so background callbacks get immediate access
  if (typeof window !== 'undefined') {
    window.alert = (message: string) => {
      const lower = message.toLowerCase();
      let type: 'success' | 'error' | 'info' = 'info';
      if (
        lower.includes('success') || 
        lower.includes('secured') || 
        lower.includes('copied') || 
        lower.includes('agree') || 
        lower.includes('successful') || 
        lower.includes('activated') || 
        lower.includes('login successful') ||
        lower.includes('welcome')
      ) {
        type = 'success';
      } else if (
        lower.includes('failed') || 
        lower.includes('error') || 
        lower.includes('denied') || 
        lower.includes('invalid') || 
        lower.includes('cannot') || 
        lower.includes('issue')
      ) {
        type = 'error';
      }
      showToastRef.current(message, type);
    };
  }
  
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
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(() => localStorage.getItem('tuMarketWalkthroughSeen') === 'true');

  const handleAcceptTerms = () => {
    localStorage.setItem('tuMarketTermsAccepted', 'true');
    setHasAcceptedTerms(true);
    
    // If first time user, jump to walkthrough onboarding view
    if (!hasSeenWalkthrough) {
      handleViewChange('onboarding');
    }
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
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
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
      
      // Delay showing the banner for a 'gentle' feel on first reload
      const hasDisplayed = sessionStorage.getItem('tu_install_banner_shown');
      if (!hasDisplayed) {
        setTimeout(() => {
          setShowInstallBanner(true);
          sessionStorage.setItem('tu_install_banner_shown', 'true');
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    // Listen for successful app installation to give feedback
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      console.log('Hub marketplace has been installed locally');
      // Toast notification for background install success
      setTimeout(() => {
        alert('🚀 Platform Secured! TU Market Hub has been successfully installed in the background. You can now access it from your homescreen anytime!');
      }, 500);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const userChoice = await deferredPrompt.userChoice;
      if (userChoice.outcome === 'accepted') {
        setShowInstallBanner(false);
        setDeferredPrompt(null);
        alert('🎉 Installation Successful! TU Market Hub has been safely added to your campus application library.');
      } else {
        setShowInstallBanner(false);
      }
    } else {
      const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const instruction = isiOS 
        ? "Tap the Share icon ⎋ along the bottom tray, scroll down, and select 'Add to Home Screen'!"
        : "Tap the three dots (⋮) in the top-right corner of your browser and select 'Install App' or 'Add to Home Screen'!";
      
      alert(`Enforced PWA Installation Guide:\n\nTo access offline catalogs directly on ${isiOS ? 'iOS Safari' : 'your browser'}: ${instruction}`);
    }
  };

  // Shopper's Order Draft (Cart Drawer) States
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

  // 1. Listen for auth changes
  useEffect(() => {

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userEmail = currentUser.email?.toLowerCase();
        
        // 1. Check if user already has an existing profile in Firestore
        let hasExistingVendorProfile = false;
        let dbVendorType: 'student' | 'outside' | null = null;
        try {
          const vSnap = await getDoc(doc(db, 'vendors', currentUser.uid));
          if (vSnap.exists()) {
            hasExistingVendorProfile = true;
            const data = vSnap.data();
            dbVendorType = data.vendorType || 'student';
          }
        } catch (err) {
          console.warn("Could not check existing vendor profile:", err);
        }

        const currentVendorType = dbVendorType || localStorage.getItem('tu_vendor_login_type') as 'student' | 'outside' | null;
        
        if (currentVendorType === 'student' && !hasExistingVendorProfile) {
          // Check for surname.firstname@trinityuniversity.edu.ng format strictly ONLY FOR NEW VENDORS
          const isValidStudent = /^[^.]+\.[^.]+@trinityuniversity\.edu\.ng$/;
          if (!isValidStudent.test(userEmail || '')) {
            alert("Invalid student email format. Please use 'surname.firstname@trinityuniversity.edu.ng' to continue as a Student Vendor.");
            await signOut(auth);
            setLoginError("Invalid student email format. Please use 'surname.firstname@trinityuniversity.edu.ng'");
            localStorage.removeItem('tu_vendor_login_type');
            setVendorType(null);
            setUser(null);
            setIsInitializing(false);
            handleViewChange('admin');
            return;
          }
        }
        
        // If they have an existing vendor profile, synchronize the state
        if (dbVendorType) {
          setVendorType(dbVendorType);
          localStorage.setItem('tu_vendor_login_type', dbVendorType);
        } else if (currentVendorType) {
          setVendorType(currentVendorType);
          localStorage.setItem('tu_vendor_login_type', currentVendorType);
        }

        setLoginError(null);
        setUser(currentUser);
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
          
          // Route to dashboard
          alert("Login successful!");
          handleViewChange('admin');
        } catch (err) {
          setIsAdmin(isHardcodedAdmin);
        }

        // Seamless routing for returning vendors
        if (hasExistingVendorProfile) {
          setCurrentView('admin');
          localStorage.setItem('tu_session_view', 'admin');
        } else if (currentVendorType) {
          // New vendor registering
          if (!hasSeenWalkthrough) {
            setCurrentView('onboarding');
            localStorage.setItem('tu_session_view', 'onboarding');
          } else {
            setCurrentView('admin');
            localStorage.setItem('tu_session_view', 'admin');
          }
        }
      } else {
        setUser(null);
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

    // Handle Deep Linking ONCE after products load (?product=ID)
    const handleDeepLinking = (allProducts: Product[]) => {
      const urlParams = new URLSearchParams(window.location.search);
      const productIdParam = urlParams.get('product') || urlParams.get('productId');
      const imgIndexParam = urlParams.get('img');
      
      if (productIdParam) {
        const match = allProducts.find(p => p.id === productIdParam);
        if (match) {
          setSelectedProductId(productIdParam);
          setCurrentView('shop');
          // If we have an image index, we might need to pass it to ProductDetailView
          // via a side-effect or state
          if (imgIndexParam) {
            sessionStorage.setItem('tu_deep_link_img', imgIndexParam);
          }
        }
      }
    };

    // Refresh/Initialize database
    const handleDbInit = async () => {
      try {
        await checkAndSeedDatabase();
      } catch (err) {
        console.warn('Initial seeding lookup bypassed:', err);
      }
    };
    handleDbInit();

    // Query active & out_of_stock products for public shoppers
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
            vendorType: d.vendorType || 'student',
            discountPercentage: typeof d.discountPercentage === 'number' ? d.discountPercentage : 0,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          });
        });

        // Always sort by latest update or creation timestamp descending
        prodData.sort((a, b) => {
          const timeA = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
          const timeB = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setProducts(prodData);
        handleDeepLinking(prodData);
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showVendorOptions, setShowVendorOptions] = useState(false);
  const [isAdminLoginHint, setIsAdminLoginHint] = useState(false);
  const [vendorType, setVendorType] = useState<'student' | 'outside' | null>(() => {
    return localStorage.getItem('tu_vendor_login_type') as 'student' | 'outside' | null;
  });

  const handleVendorLogin = async (type: 'student' | 'outside') => {
    setLoginError(null);
    localStorage.setItem('tu_vendor_login_type', type);
    setVendorType(type);
    setIsLoggingIn(true);
    try {
        await loginWithGoogle();
    } catch (err) {
        setIsLoggingIn(false);
        setLoginError("Login failed. Authentication request was interrupted.");
        localStorage.removeItem('tu_vendor_login_type');
        setVendorType(null);
        console.error("Login failed:", err);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setLoginError(null);
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
      localStorage.removeItem('tu_vendor_login_type');
      setVendorType(null);
      setHasSkippedLoginGate(false);
      setCurrentView('home');
    } catch (err) {
      console.error(err);
    }
  };

  // Open Direct Checkout Form for a specific product
  const handleAddToCart = (product: Product, size: string) => {
    setCheckoutGroup({
      vendorId: product.vendorId || 'admin',
      vendorName: product.vendorName || 'TU MARKET HUB Seller',
      vendorNumber: product.vendorWhatsApp || settings?.whatsappNumber || '09047226729',
      items: [{ product, size, quantity: 1 }]
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
    if (!user) {
      alert("Please log in to contact vendors via WhatsApp.");
      handleGoogleLogin();
      return;
    }
    if (items.length === 0) return;
    
    let totalVal = 0;
    let orderDetailLines = '';
    
    // Log each ordered item in Firestore for tracking and decrement stock in real-time
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

        if (item.product.id && item.product.id !== 'system') {
          const pRef = doc(db, 'products', item.product.id);
          const pDoc = await getDoc(pRef);
          if (pDoc.exists()) {
            const currentStock = Number(pDoc.data().stock || 0);
            const category = pDoc.data().category || '';
            // Services usually have infinite stock/no limit, other physical goods decrease
            if (category !== 'services') {
              const newStock = Math.max(0, currentStock - item.quantity);
              const updatePayload: any = {
                stock: newStock,
                updatedAt: serverTimestamp()
              };
              if (newStock === 0) {
                updatePayload.status = 'out_of_stock';
                updatePayload.stock = 0;
              }
              await updateDoc(pRef, updatePayload);
            }
          }
        }
      } catch (clickErr) {
        console.warn('Logging analytics and deducting stock/updating status error:', clickErr);
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
  };

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
    if (view === 'admin' && !user) {
      setHasSkippedLoginGate(false);
      setShowVendorOptions(true);
      setCurrentView('home');
      localStorage.setItem('tu_session_view', 'home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    url.searchParams.delete('img');
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

  const displayProducts = useMemo(() => {
    return products.length > 0 ? products : fallbackProducts;
  }, [products, fallbackProducts]);

  const baseCategories = useMemo(() => {
    return categories.length > 0 ? categories : fallbackCategories;
  }, [categories, fallbackCategories]);

  const displayCategories: Category[] = useMemo(() => {
    return baseCategories.map(cat => {
      const actCount = displayProducts.filter(p => p.category === cat.id && p.status === 'active').length;
      return {
        ...cat,
        productCount: actCount
      };
    });
  }, [baseCategories, displayProducts]);

  const activeDetailProduct = useMemo(() => {
    return selectedProductId 
      ? displayProducts.find((p) => p.id === selectedProductId) 
      : null;
  }, [selectedProductId, displayProducts]);

  return (
    <div id="application-root" className="min-h-screen bg-white dark:bg-[#0b0f19] flex flex-col justify-between font-sans leading-normal tracking-normal text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      <NetworkStatusBanner isOffline={isOffline} />

      {/* Dynamic Header Component */}
      <Header
        currentView={selectedProductId ? 'shop' : currentView}
        onViewChange={handleViewChange}
        isAdmin={isAdmin}
        isVendor={user !== null && (vendorType !== null || isAdmin)}
        user={user}
        onLoginClick={() => {
          localStorage.removeItem('tu_skipped_login');
          setHasSkippedLoginGate(false);
          handleViewChange('admin');
        }}
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
                onCheckoutDirect={(vId, vName, vNum, items) => {
                  setCheckoutGroup({
                    vendorId: vId,
                    vendorName: vName,
                    vendorNumber: vNum,
                    items: items
                  });
                }}
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
              className="max-w-md mx-auto py-12 px-4 whitespace-normal select-none"
            >
              <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-2.5">
                  <div className="w-12 h-12 bg-emerald-brand/10 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                      Welcome to TU <span className="text-emerald-brand">Market</span> Hub
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                      Trinity University's official student marketplace and peer trading stall.
                    </p>
                  </div>
                </div>

                {/* Primary Action (Shopper - Frictionless) */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => {
                      localStorage.setItem('tu_skipped_login', 'true');
                      setHasSkippedLoginGate(true);
                      setCurrentView('shop');
                    }}
                    className="w-full bg-emerald-brand hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase py-4 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 focus:ring-2 focus:ring-emerald-brand/35 shadow-sm hover:scale-[1.015]"
                  >
                    <span>Explore Marketplace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium">
                    No sign-in required to browse listings or contact sellers.
                  </p>
                </div>

                {/* Aesthetic Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-150 dark:border-slate-800/80"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest font-bold">or seller portal</span>
                  <div className="flex-grow border-t border-gray-150 dark:border-slate-800/80"></div>
                </div>

                {/* Seller/Vendor Segment Controls */}
                <div className="space-y-4">
                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-3 rounded-xl"
                    >
                      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <p className="text-[10px] font-bold leading-tight uppercase tracking-wide">Authentication Alert</p>
                      </div>
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-medium leading-relaxed">{loginError}</p>
                    </motion.div>
                  )}

                  {/* Sleek Tabs */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-1 rounded-xl border border-gray-150 dark:border-slate-800/60 flex space-x-1">
                    <button
                      onClick={() => {
                        setShowVendorOptions(false);
                        localStorage.removeItem('tu_vendor_login_type');
                        setVendorType(null);
                      }}
                      className={`flex-1 text-[9px] sm:text-[10px] font-bold py-2 rounded-lg transition-all uppercase tracking-wider ${
                        !showVendorOptions
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                      }`}
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setShowVendorOptions(true);
                        localStorage.setItem('tu_vendor_login_type', 'student');
                        setVendorType('student');
                      }}
                      className={`flex-1 text-[9px] sm:text-[10px] font-bold py-2 rounded-lg transition-all uppercase tracking-wider ${
                        showVendorOptions && vendorType === 'student'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                      }`}
                    >
                      Student Reg
                    </button>
                    <button
                      onClick={() => {
                        setShowVendorOptions(true);
                        localStorage.setItem('tu_vendor_login_type', 'outside');
                        setVendorType('outside');
                      }}
                      className={`flex-1 text-[9px] sm:text-[10px] font-bold py-2 rounded-lg transition-all uppercase tracking-wider ${
                        showVendorOptions && vendorType === 'outside'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                      }`}
                    >
                      Outside Reg
                    </button>
                  </div>

                  {/* Helper Hint text depending on active tab */}
                  <div className="text-center px-1">
                    {!showVendorOptions ? (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                        Access your existing storefront, update inventory, and handle active inquiries.
                      </p>
                    ) : vendorType === 'student' ? (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                        Open a Student Stall. Requires student email format: <code className="bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[9px]">surname.firstname@trinityuniversity.edu.ng</code>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                        Open an Outside Stall to list external services, products, or books for students.
                      </p>
                    )}
                  </div>

                  {/* Combined Google authentication Action Button */}
                  <button
                    onClick={async () => {
                      if (showVendorOptions && vendorType) {
                        await handleVendorLogin(vendorType);
                      } else {
                        await handleGoogleLogin();
                      }
                    }}
                    disabled={isLoggingIn}
                    className="w-full bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700/80 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 border border-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-emerald-brand/35 shadow-sm hover:scale-[1.01]"
                  >
                    {isLoggingIn ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-brand" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5 text-emerald-brand" />
                    )}
                    <span>
                      {isLoggingIn
                        ? 'Connecting Securely...'
                        : !showVendorOptions
                        ? 'Sign In with Google'
                        : 'Register with Google'}
                    </span>
                  </button>
                </div>

                {/* System Maintenance & Secured Auth Note */}
                <div className="pt-2 text-center space-y-2.5">
                  <div className="relative">
                    <button 
                      onClick={() => setIsAdminLoginHint(!isAdminLoginHint)}
                      className="text-[9px] text-slate-300 dark:text-slate-700 hover:text-slate-400 dark:hover:text-slate-600 transition-colors cursor-help italic uppercase tracking-widest font-bold"
                    >
                      · System Maintenance ·
                    </button>
                    {isAdminLoginHint && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2"
                      >
                        <button 
                          onClick={handleGoogleLogin}
                          className="text-[10px] bg-emerald-500/10 text-emerald-500 py-1 px-3 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-bold cursor-pointer"
                        >
                          Admin Entrance
                        </button>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">
                    Secured by Google Authentication.
                  </p>
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

              {currentView === 'onboarding' && (
                <WalkthroughGuide onFinish={() => {
                  localStorage.setItem('tuMarketWalkthroughSeen', 'true');
                  setHasSeenWalkthrough(true);
                  handleViewChange('home');
                }} />
              )}

              {currentView === 'admin' && (
                <AdminView
                  user={user}
                  isAdmin={isAdmin}
                  vendorType={vendorType}
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

      {/* Checkout Details Overlay */}
      <AnimatePresence>
        {checkoutGroup && (
          <div className="fixed inset-0 z-[100] overflow-hidden font-sans text-xs flex justify-center items-center p-0 sm:p-4 pointer-events-none">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setCheckoutGroup(null)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer pointer-events-auto" 
            />

            {/* Content Container */}
            <div className="relative w-full h-full flex justify-center items-center p-4 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  className="pointer-events-auto w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl relative rounded-3xl overflow-hidden max-h-[90vh] flex flex-col ring-1 ring-black/5 dark:ring-white/10"
                >
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
                </motion.div>
            </div>
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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

      {/* Persistent PWA Install Icon Launcher (Bottom Right) */}
      {deferredPrompt && !showInstallBanner && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowInstallBanner(true)}
          className="fixed bottom-6 right-6 z-[45] w-12 h-12 bg-emerald-brand text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer border-2 border-white dark:border-slate-800"
          title="Install TU Market Hub"
        >
          <DownloadCloud className="w-5 h-5" />
          <motion.span 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-slate-800"
          />
        </motion.button>
      )}

      {/* Floating Minimalist Toast Overlay */}
      <div className="fixed bottom-6 left-6 z-[120] flex flex-col gap-3.5 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`pointer-events-auto flex items-start justify-between p-4 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/95 dark:bg-emerald-600/95 border-emerald-400/20 text-white shadow-emerald-500/10' 
                  : toast.type === 'error' 
                    ? 'bg-red-500/95 dark:bg-red-600/95 border-red-400/20 text-white shadow-red-500/10' 
                    : 'bg-slate-900/95 dark:bg-slate-850/95 border-slate-700/35 text-white shadow-slate-900/20'
              }`}
            >
              <div className="flex items-start space-x-3 pr-2">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                {toast.type === 'info' && <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />}
                <p className="leading-relaxed font-sans">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
                className="text-white/75 hover:text-white transition-colors cursor-pointer p-0.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
