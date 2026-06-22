import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, LayoutDashboard, ShoppingCart, FolderTree, AlertTriangle, 
  Settings, LogOut, CheckCircle, Save, X, RefreshCw, MessageSquare, Tag, Repeat, Sparkles, AlertCircle,
  Store, ShoppingBag, PlusCircle, Link, Copy, Eye, Users
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { addDoc, doc, updateDoc, deleteDoc, collection, serverTimestamp, setDoc, getDoc, writeBatch, query, getDocs, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getRelativeTime } from '../utils';
import { Product, Category, StoreSettings } from '../types';
import { forceResetDatabase } from '../data/seed';
import imageCompression from 'browser-image-compression';
import MarketplaceChat from './MarketplaceChat';

interface AdminViewProps {
  user: FirebaseUser | null;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  products: Product[];
  categories: Category[];
  settings: StoreSettings | null;
  onRefreshData: () => Promise<void>;
}

export default function AdminView({
  user,
  isAdmin,
  onLogin,
  onLogout,
  products,
  categories,
  settings,
  onRefreshData
}: AdminViewProps) {
  
  // Dashboard navigation sub-state
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'inventory' | 'settings' | 'admins' | 'chats'>('overview');

  // Admin access list state handlers
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const unsubscribe = onSnapshot(collection(db, 'admins'), (snap) => {
      const list: any[] = [];
      snap.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      setAdminsList(list);
    }, (err) => {
      console.error('Error listening to admins:', err);
    });
    return () => unsubscribe();
  }, [user, isAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAdminEmail.trim() || !isAdmin) return;
    setAdminActionLoading(true);
    try {
      const emailLower = newAdminEmail.trim().toLowerCase();
      await setDoc(doc(db, 'admins', emailLower), {
        email: emailLower,
        addedAt: serverTimestamp()
      });
      setNewAdminEmail('');
      displayNotice(`Admin permissions granted for "${emailLower}"!`);
    } catch (err: any) {
      console.error('Failed to add admin:', err);
      alert('Failed to add admin: ' + err.message);
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!user || !isAdmin) return;
    const adminEmail = adminId.toLowerCase();
    
    if (adminEmail === user.email?.toLowerCase()) {
      alert("You cannot revoke your own admin account settings.");
      return;
    }
    const hardcoded = ['greatifet12@gmail.com', 'aroneefashion@gmail.com', 'osemenjoy448@gmail.com'];
    if (hardcoded.includes(adminEmail)) {
      alert("Hardcoded principal system admins cannot be revoked.");
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke admin permissions for "${adminId}"?`)) {
      return;
    }
    
    setAdminActionLoading(true);
    try {
      await deleteDoc(doc(db, 'admins', adminId));
      displayNotice(`Revoked admin permissions for "${adminId}" successfully.`);
    } catch (err: any) {
      console.error('Failed to revoke admin:', err);
      alert('Failed to delete admin: ' + err.message);
    } finally {
      setAdminActionLoading(false);
    }
  };

  // Load Status feedback
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Forms / Modal state
  const [productEditing, setProductEditing] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  // Personal Vendor profile state (For Student Vendors who want to persistent-save their custom Whatsapp number and Stall Shop Name)
  const [vendorWhatsApp, setVendorWhatsApp] = useState<string>('');
  const [vendorShopName, setVendorShopName] = useState<string>('');
  const [vendorWhatsAppLoading, setVendorWhatsAppLoading] = useState<boolean>(true);

  // Real-time sales estimate tracking & clicks analytics
  interface SaleClick {
    id: string;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    buyerName: string;
    createdAt: any;
  }
  const [clicksTracker, setClicksTracker] = useState<SaleClick[]>([]);
  const [clicksLoading, setClicksLoading] = useState<boolean>(true);

  // Product Form Input field binds
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodImages, setProdImages] = useState<string>('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState<number>(1);
  const [prodFeatured, setProdFeatured] = useState<boolean>(false);
  const [prodStatus, setProdStatus] = useState<'active' | 'draft' | 'out_of_stock'>('active');
  const [prodCondition, setProdCondition] = useState<'new' | 'like_new' | 'used'>('like_new');
  const [prodDealType, setProdDealType] = useState<'sell' | 'swap' | 'both'>('sell');
  const [prodDiscount, setProdDiscount] = useState<number>(0);
  const [prodWhatsApp, setProdWhatsApp] = useState('');

  // Category Form Input field binds
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');

  // Settings editable forms
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(null);

  // Feature feedback & confirm dialogs
  const [imageUploadFeedback, setImageUploadFeedback] = useState<string>('');
  const [imageUploadProgress, setImageUploadProgress] = useState<number>(0);
  const [showPublishConfirm, setShowPublishConfirm] = useState<boolean>(false);

  const splitImageUrls = (str: string): string[] => {
    if (!str) return [];
    const rawParts = str.split(',');
    const result: string[] = [];
    for (let i = 0; i < rawParts.length; i++) {
      const part = rawParts[i];
      if (part.trim().startsWith('data:image/') && part.includes('base64') && i + 1 < rawParts.length) {
        const merged = part + ',' + rawParts[i + 1];
        result.push(merged);
        i++;
      } else {
        result.push(part);
      }
    }
    return result.map(s => s.trim()).filter(Boolean);
  };

  const compressAndConvertImage = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressedFile);
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setActionLoading(true);
    setImageUploadProgress(0);
    let newImages = splitImageUrls(prodImages);
    let addedCount = 0;
    for (let i = 0; i < files.length; i++) {
        const base64 = await compressAndConvertImage(files[i]);
        if (base64) {
          newImages.push(base64);
          addedCount++;
        }
        setImageUploadProgress(((i + 1) / files.length) * 100);
    }
    setProdImages(newImages.join(', '));
    setActionLoading(false);
    setImageUploadProgress(0);
    if (addedCount > 0) {
      setImageUploadFeedback(`Successfully uploaded and compiled ${addedCount} photo(s)!`);
      setTimeout(() => setImageUploadFeedback(''), 4000);
    }
  };

  const handleRemoveImageAtIndex = (index: number) => {
    const list = splitImageUrls(prodImages);
    list.splice(index, 1);
    setProdImages(list.join(', '));
    setImageUploadFeedback('Image removed successfully.');
    setTimeout(() => setImageUploadFeedback(''), 3000);
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setActionLoading(true);
    const base64 = await compressAndConvertImage(files[0]);
    if (base64) setCatImage(base64);
    setActionLoading(false);
  };

  // Fetch Vendor Profile if user is logged in
  useEffect(() => {
    async function fetchVendorProfile() {
      if (!user) return;
      setVendorWhatsAppLoading(true);
      try {
        const vRef = doc(db, 'vendors', user.uid);
        const vSnap = await getDoc(vRef);
        if (vSnap.exists()) {
          const dat = vSnap.data();
          if (dat.whatsapp) {
            setVendorWhatsApp(dat.whatsapp);
          } else {
            setVendorWhatsApp(settings?.whatsappNumber || '2348000000000');
          }
          if (dat.shopName) {
            setVendorShopName(dat.shopName);
          } else {
            setVendorShopName(user.displayName || user.email?.split('@')[0] || 'Independent Seller');
          }
        } else {
          setVendorWhatsApp(settings?.whatsappNumber || '2348000000000');
          setVendorShopName(user.displayName || user.email?.split('@')[0] || 'Independent Seller');
        }
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
      } finally {
        setVendorWhatsAppLoading(false);
      }
    }
    fetchVendorProfile();
  }, [user, settings]);

  // Real-time listener for customer transaction clicks/leads
  useEffect(() => {
    if (!user) return;
    setClicksLoading(true);
    
    // Admins see all logs, Vendors only see theirs
    const clicksRef = collection(db, 'clicks');
    const clicksQuery = isAdmin 
      ? query(clicksRef)
      : query(clicksRef, where('vendorId', '==', user.uid));

    const unsubscribeClicks = onSnapshot(clicksQuery, (snap) => {
      const trackerData: SaleClick[] = [];
      snap.forEach((docSnap) => {
        const dat = docSnap.data();
        trackerData.push({
          id: docSnap.id,
          productId: dat.productId || '',
          productName: dat.productName || 'Classroom tool/Item',
          price: Number(dat.price || 0),
          quantity: Number(dat.quantity || 1),
          buyerName: dat.buyerName || 'Anonymous Campus Buyer',
          createdAt: dat.createdAt
        });
      });
      // Sort trackerData by timestamp descending
      trackerData.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setClicksTracker(trackerData);
      setClicksLoading(false);
    }, (err) => {
      console.error('Error fetching real-time clicks:', err);
      setClicksLoading(false);
    });

    return () => unsubscribeClicks();
  }, [user, isAdmin]);

  const displayNotice = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => setActionSuccess(''), 4500);
  };

  const displayError = (message: string) => {
    setActionError(message);
    setTimeout(() => setActionError(''), 6000);
  };

  const handleSaveVendorWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    try {
      const vRef = doc(db, 'vendors', user.uid);
      const cleanShopName = vendorShopName.trim() || user.displayName || user.email?.split('@')[0] || 'Independent Seller';
      const cleanWhatsApp = vendorWhatsApp.trim();
      
      await setDoc(vRef, { 
        whatsapp: cleanWhatsApp,
        shopName: cleanShopName
      }, { merge: true });

      // Synchronize all existing active/draft products belonging to this vendor
      try {
        const q = query(collection(db, 'products'), where('vendorId', '==', user.uid));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const batch = writeBatch(db);
          qSnap.forEach((docSnap) => {
            batch.update(docSnap.ref, {
              vendorName: cleanShopName,
              vendorWhatsApp: cleanWhatsApp
            });
          });
          await batch.commit();
        }
      } catch (syncErr) {
        console.warn('Stall products matching look-ahead skipped:', syncErr);
      }

      displayNotice('Your Vendor Stall profile and listed items have been successfully updated!');
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error updating Stall Profile.');
    } finally {
      setActionLoading(false);
    }
  };

  // Setup Product Inputs for Add or Edit
  const openProductForm = (prod: Product | null = null) => {
    if (prod) {
      setProductEditing(prod);
      setProdName(prod.name);
      setProdDesc(prod.description);
      setProdPrice(prod.price);
      setProdImages(prod.images.join(', '));
      setProdCategory(prod.category);
      setProdStock(prod.stock);
      setProdFeatured(prod.featured);
      setProdStatus(prod.status);
      setProdCondition(prod.condition || 'like_new');
      setProdDealType(prod.dealType || 'sell');
      setProdDiscount(prod.discountPercentage || 0);
      setProdWhatsApp(prod.vendorWhatsApp || vendorWhatsApp || settings?.whatsappNumber || '');
    } else {
      setProductEditing(null);
      setProdName('');
      setProdDesc('');
      setProdPrice(8000);
      setProdImages('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80');
      setProdCategory(categories[0]?.id || 'academics');
      setProdStock(1);
      setProdFeatured(false);
      setProdStatus('active');
      setProdCondition('like_new');
      setProdDealType('sell');
      setProdDiscount(0);
      setProdWhatsApp(vendorWhatsApp || settings?.whatsappNumber || '');
    }
    setShowPublishConfirm(false);
    setImageUploadFeedback('');
    setIsProductFormOpen(true);
  };

  // Pre-validate and show confirmation panel
  const handleProductPreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPublishConfirm(true);
  };

  // Submit Product Form Changes
  const executeActualProductSubmit = async () => {
    if (!user) return;
    if (actionLoading) return; // Prevent double submission
    setActionLoading(true);
    
    const preparedImages = splitImageUrls(prodImages);
    const productPayload = {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      images: preparedImages.length > 0 ? preparedImages : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
      category: prodCategory,
      stock: Number(prodStock),
      featured: prodFeatured,
      status: prodStatus,
      condition: prodCondition,
      dealType: prodDealType,
      discountPercentage: Number(prodDiscount),
      vendorId: productEditing ? (productEditing.vendorId || user.uid) : user.uid,
      vendorName: productEditing 
        ? (productEditing.vendorName || vendorShopName.trim() || user.displayName || user.email?.split('@')[0] || 'Independent Seller') 
        : (vendorShopName.trim() || user.displayName || user.email?.split('@')[0] || 'Independent Seller'),
      vendorWhatsApp: prodWhatsApp ? prodWhatsApp.trim() : (vendorWhatsApp || settings?.whatsappNumber || ''),
      updatedAt: serverTimestamp()
    };

    try {
      console.log('Starting product submit...', productEditing ? 'Editing' : 'Creating');
      if (productEditing) {
        // Safe Check: Non-admins can only edit their OWN products!
        if (!isAdmin && productEditing.vendorId !== user.uid) {
          displayError('Security Access Denied: You cannot modify products uploaded by another student seller!');
          setActionLoading(false);
          setShowPublishConfirm(false);
          return;
        }
        const pRef = doc(db, 'products', productEditing.id);
        await updateDoc(pRef, productPayload);
        console.log('Product updated successfully.');
        displayNotice(`Successfully saved changes for "${prodName}"!`);
      } else {
        // Create Mode
        const productsColRef = collection(db, 'products');
        await addDoc(productsColRef, {
          ...productPayload,
          createdAt: serverTimestamp()
        });
        console.log('Product added successfully.');
        displayNotice(`"${prodName}" has been successfully listed live on Trinity University's seeker grid!`);
      }
      
      // CLOSE ALL modal views and overlays cleanly!
      setIsProductFormOpen(false);
      setShowPublishConfirm(false);
      
      console.log('Refreshing data...');
      try {
        await onRefreshData();
      } catch (err) {
        console.error('Refresh data error (non-fatal):', err);
      }
      console.log('Data refreshed (or attempted).');
    } catch (err: any) {
      console.error('Submit error:', err);
      const errMsg = err?.message || 'Please check your connectivity or permissions.';
      displayError(`Failed to publish listing: ${errMsg}`);
      // Show failure alert too for direct notice
      alert(`Failed to save listing: ${errMsg}`);
    } finally {
      console.log('Publish action complete.');
      setActionLoading(false);
    }
  };

  // Delete product trigger
  const handleProductDelete = async (prod: Product) => {
    if (!user) return;
    // Security check
    if (!isAdmin && prod.vendorId !== user.uid) {
      alert('Security Access Denied: You cannot delete products listed by other student sellers.');
      return;
    }
    if (!window.confirm('Are you absolutely sure you want to permanently delete this listing? This action is irreversible.')) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'products', prod.id));
      displayNotice('Listing successfully taken down from the grid.');
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error removing listing. Check network constraints.');
    } finally {
      setActionLoading(false);
    }
  };

  // Category operations
  const openCategoryForm = (cat: Category | null = null) => {
    if (!isAdmin) {
      alert('Only platform system administrators can modify Category taxonomies!');
      return;
    }
    if (cat) {
      setCategoryEditing(cat);
      setCatName(cat.name);
      setCatImage(cat.image);
    } else {
      setCategoryEditing(null);
      setCatName('');
      setCatImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80');
    }
    setIsCategoryFormOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setActionLoading(true);
    
    const catId = categoryEditing ? categoryEditing.id : catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const categoryPayload = {
      name: catName,
      image: catImage,
      productCount: categoryEditing ? categoryEditing.productCount : 0,
      createdAt: categoryEditing ? categoryEditing.createdAt : serverTimestamp()
    };

    try {
      if (categoryEditing) {
        await updateDoc(doc(db, 'categories', categoryEditing.id), categoryPayload);
        displayNotice('Category details updated!');
      } else {
        const catRef = doc(db, 'categories', catId);
        await setDoc(catRef, {
          ...categoryPayload,
          productCount: 0,
          createdAt: serverTimestamp()
        }, { merge: true });
        displayNotice('New category catalog registered!');
      }
      setIsCategoryFormOpen(false);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error updating category. Check connection state.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCategoryDelete = async (catId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Deleting this category will orphan products in this catalog. Continue?')) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'categories', catId));
      displayNotice('Category reference deleted.');
      await onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Seeder force reset trigger
  const handleDatabaseReset = async () => {
    if (!isAdmin) return;
    if (!window.confirm('WARNING: This will wipe all existing store products and categories and replace them with default premium TU Student marketplace items. Proceed?')) return;
    setActionLoading(true);
    try {
      const res = await forceResetDatabase();
      if (res) {
        displayNotice('Database successfully re-seeded with default multi-vendor items!');
        await onRefreshData();
      } else {
        alert('Encountered an issue seeding. Ensure your auth has admin permissions.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkAllProductsToWhatsApp = async () => {
    if (!isAdmin) return;
    const targetNum = settings?.whatsappNumber || '09047226729';
    if (!window.confirm(`This will link ALL products in the store to the active hotline: ${targetNum}. Continue?`)) return;
    setActionLoading(true);
    try {
      const q = query(collection(db, 'products'));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;
      snap.forEach((docSnap) => {
        batch.update(docSnap.ref, { vendorWhatsApp: targetNum });
        count++;
      });
      await batch.commit();
      displayNotice(`Successfully linked all ${count} products to ${targetNum}!`);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to link products: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  // Save Settings Modification
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm || !isAdmin) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'settings', 'current'), {
        whatsappNumber: settingsForm.whatsappNumber,
        contactAddress: settingsForm.contactAddress,
        contactEmail: settingsForm.contactEmail,
        instagramUrl: settingsForm.instagramUrl,
        facebookUrl: settingsForm.facebookUrl,
        businessHours: settingsForm.businessHours
      });
      displayNotice('Global store settings locked successfully!');
      await onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const initSettingsForm = () => {
    if (settings) {
      setSettingsForm({ ...settings });
    }
  };

  // Secure locked view gate (If not logged in, show login prompt)
  if (!user) {
    return (
      <div id="admin-security-gate" className="max-w-md mx-auto my-20 px-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-md select-none">
          <div className="w-16 h-16 bg-emerald-brand/10 dark:bg-emerald-900/40 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Settings className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold font-display text-slate-brand dark:text-slate-100">
              Student Seller Portal
            </h1>
            <p className="text-xs text-slate-brand/60 dark:text-slate-400 font-medium leading-relaxed">
              Log in to instantly launch your own hostel storefront, list items, configure your WhatsApp number, and receive direct inquiries.
            </p>
          </div>

            <div id="vendor-benefits" className="p-4 bg-emerald-brand/5 dark:bg-emerald-900/10 border border-emerald-brand/15 dark:border-emerald-900/40 rounded-2xl text-left space-y-2 text-xs text-slate-brand font-medium">
            <p className="font-bold text-emerald-brand dark:text-emerald-500 uppercase tracking-wider text-[10px]">What you can do:</p>
            <div className="space-y-1 font-sans text-slate-brand/80 dark:text-slate-300">
              <p>• List gadgets, food items, hosting appliances or electronics</p>
              <p>• Connect directly to your personal WhatsApp line</p>
              <p>• Edit or update your prices and condition status any time</p>
            </div>
          </div>

          <hr className="border-gray-150 dark:border-slate-800" />

          <button
            onClick={onLogin}
            className="w-full bg-slate-900 dark:bg-emerald-brand hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold text-xs tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2.5"
          >
            <span>Sign In with student Google Mail</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter products based on user classification
  // Administrators see ALL items.
  // Standard student vendors see ONLY their own items where productId vendor matches current user uid.
  const displayProducts = isAdmin 
    ? products 
    : products.filter(p => p.vendorId === user.uid);

  // Stats Calculations for this specific seller
  const totalProducts = displayProducts.length;
  const featuredCount = displayProducts.filter(p => p.featured).length;
  const outOfStockItems = displayProducts.filter(p => p.stock === 0 || p.status === 'out_of_stock');
  const lowStockCount = displayProducts.filter(p => p.stock > 0 && p.stock <= 2).length;

  return (
    <div id="admin-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-150 mb-8">
        <div>
          <span className="text-[10px] font-bold text-emerald-brand font-mono uppercase tracking-widest leading-none">
            {isAdmin ? 'SYSTEM ADMINISTRATOR CONSOLE' : 'STUDENT SELLER WORKSPACE'}
          </span>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-slate-brand mt-1">
            {isAdmin ? 'University Platform Control' : 'My Student Stall Manager'}
          </h1>
          <p className="text-xs text-slate-brand/60 font-medium">
            Active Store Account: <span className="font-bold text-slate-brand font-mono">{user.email}</span>
          </p>
        </div>

        <button
          onClick={onLogout}
          className="bg-slate-50 hover:bg-red-50 text-slate-brand hover:text-red-700 font-bold text-xs px-4 py-2.5 rounded-xl tracking-wider uppercase border border-gray-200 hover:border-red-200 cursor-pointer transition-all flex items-center space-x-2 shrink-0 shadow-3xs alive-blink"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Portal</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-l-4 border-emerald-500 p-4 rounded-r-2xl mb-8 flex items-center space-x-3 text-xs leading-none shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-l-4 border-rose-500 p-4 rounded-r-2xl mb-8 flex items-center space-x-3 text-xs leading-none shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="font-semibold">{actionError}</span>
        </div>
      )}

      {/* Tabs list navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-4">
        {[
          { label: 'My Hub Overview', value: 'overview' as const, icon: LayoutDashboard },
          { label: 'My Listed Products', value: 'products' as const, icon: ShoppingCart },
          { label: 'Chats & Inquiries', value: 'chats' as const, icon: MessageSquare },
          ...(isAdmin ? [
            { label: 'Platform Categories', value: 'categories' as const, icon: FolderTree },
            { label: 'Platform Warnings', value: 'inventory' as const, icon: AlertTriangle },
            { label: 'Global Platform Config', value: 'settings' as const, icon: Settings },
            { label: 'Permissions / Admins', value: 'admins' as const, icon: Users }
          ] : [])
        ].map((t) => {
          const isSelected = activeTab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => {
                setActiveTab(t.value);
                if (t.value === 'settings' && !settingsForm) initSettingsForm();
              }}
              className={`flex items-center space-x-2 text-xs font-bold py-2.5 px-4.5 rounded-xl tracking-wider uppercase transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-brand text-white shadow-sm font-bold'
                  : 'bg-slate-50 text-slate-brand hover:bg-emerald-brand/5 border border-gray-150'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-fade-in">
          
          {/* Bento grids display stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-2xl space-y-2 shadow-3xs">
              <span className="text-[10px] font-bold text-slate-brand/40 uppercase tracking-widest block font-sans">My Public Listings</span>
              <p className="text-3xl font-extrabold font-mono text-slate-brand dark:text-slate-100">{totalProducts}</p>
              <p className="text-[10px] text-slate-brand/50 font-medium">Currently visible to buyers</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-2xl space-y-2 shadow-3xs">
              <span className="text-[10px] font-bold text-slate-brand/40 uppercase tracking-widest block font-sans">Global Categories</span>
              <p className="text-3xl font-extrabold font-mono text-slate-brand dark:text-slate-100">{categories.length}</p>
              <p className="text-[10px] text-slate-brand/50 font-medium">Usable active folders</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-2xl space-y-2 shadow-3xs">
              <span className="text-[10px] font-bold text-slate-brand/40 uppercase tracking-widest block font-sans">Featured Items</span>
              <p className="text-3xl font-extrabold font-mono text-emerald-brand dark:text-emerald-400">{featuredCount}</p>
              <p className="text-[10px] text-slate-brand/50 font-medium">Highlighted on home carousel</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-2xl space-y-2 shadow-3xs">
              <span className="text-[10px] font-bold text-red-600/80 dark:text-red-400 mt-1 uppercase tracking-widest block font-sans">Shortages & sold</span>
              <p className="text-3xl font-extrabold font-mono text-orange-brand dark:text-orange-500">{outOfStockItems.length + lowStockCount}</p>
              <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 font-medium">Items marked as sold out</p>
            </div>

          </div>

          {/* Core Personal Vendor Details block */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-3xs">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-brand dark:text-slate-100 flex items-center space-x-2">
                <Store className="w-5 h-5 text-emerald-brand dark:text-emerald-400" />
                <span>My Student Stall Profile settings</span>
              </h3>
              <p className="text-xs text-slate-brand/60 dark:text-slate-400 leading-relaxed font-medium mt-1">
                Configure your active campus store identity and WhatsApp contact line. Buyers on the platform will correspond directly with your customized shop name and phone number when purchase requests are dispatched!
              </p>
            </div>

            <form onSubmit={handleSaveVendorWhatsApp} className="max-w-md space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-brand/75 dark:text-slate-300 block">Student Shop / Stall Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayo Gadgets, Janet wears"
                    value={vendorShopName}
                    onChange={(e) => setVendorShopName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-2xl py-3 px-4 text-xs font-bold outline-none transition-all text-slate-brand dark:text-slate-100"
                  />
                </div>
                <p className="text-[10px] text-slate-brand/40 dark:text-slate-500 italic">This is the default name displayed as the seller on all your listed products.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-brand/75 dark:text-slate-300 block">WhatsApp Number (With Country Code)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2348123456789"
                    value={vendorWhatsApp}
                    onChange={(e) => setVendorWhatsApp(e.target.value.replace(/\+/g, ''))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-2xl py-3 px-4 text-xs font-mono font-bold tracking-widest outline-none transition-all text-slate-brand dark:text-slate-100"
                  />
                </div>
                <p className="text-[10px] text-slate-brand/40 dark:text-slate-500 italic">Include country code first without standard plus (+) symbols (e.g. 234 for Nigeria).</p>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="bg-slate-900 dark:bg-emerald-brand hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Synchronize Stall Profile</span>
              </button>
            </form>
          </div>

          {/* Core Personal Vendor Sales and Pick-ups Analytics Block */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-3xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-brand dark:text-slate-100 flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-brand dark:text-emerald-400" />
                  <span>My Sales Revenue & Customer Pick-ups Tracker</span>
                </h3>
                <p className="text-xs text-slate-brand/60 dark:text-slate-400 leading-relaxed font-semibold mt-1">
                  Track dynamic interest logs, estimated sales generated through WhatsApp checkout prompts, and campus delivery workflow estimates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRefreshData()}
                className="self-start sm:self-auto text-xs font-bold text-emerald-brand bg-emerald-brand/10 px-3.5 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-emerald-brand/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Live Tracker</span>
              </button>
            </div>

            {/* Micro Dashboard metric cards for Clicks/Picks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/30 space-y-1">
                <span className="text-[10px] font-bold text-slate-brand/45 dark:text-slate-400 uppercase tracking-widest font-sans">Total WhatsApp Checkout Leads</span>
                <p className="text-2xl font-black font-mono text-slate-brand dark:text-slate-100">
                  {clicksTracker.reduce((acc, curr) => acc + curr.quantity, 0)} Items Selected
                </p>
                <p className="text-[10.5px] text-slate-brand/40 dark:text-slate-500">Student buyer interest signals logged in real-time</p>
              </div>

              <div className="bg-emerald-brand/[0.03] dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-brand/10 space-y-1">
                <span className="text-[10px] font-bold text-emerald-brand/70 uppercase tracking-widest font-sans">Estimated Generated Value</span>
                <p className="text-2xl font-black font-mono text-emerald-brand dark:text-emerald-400">
                  &#8358; {clicksTracker.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toLocaleString()}
                </p>
                <p className="text-[10.5px] text-emerald-brand/60 dark:text-emerald-500/80">Value of items buyer has initialized to pick up</p>
              </div>
            </div>

            {/* Click Transaction Logs Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-150 dark:border-slate-800 font-sans">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-gray-150 dark:border-slate-800 text-slate-brand/60 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5 sm:p-4">Customer Name</th>
                    <th className="p-3.5 sm:p-4">Listed Item</th>
                    <th className="p-3.5 sm:p-4">Order Value</th>
                    <th className="p-3.5 sm:p-4">Pickup / Status Estimate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-slate-800 font-medium">
                  {clicksLoading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-brand/40 dark:text-slate-500 italic">
                        <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" />
                        Fetching latest orders/purchases...
                      </td>
                    </tr>
                  ) : clicksTracker.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-brand/40 dark:text-slate-500 italic">
                        No transactions or checkout requests recorded yet. Buyer clicks will log here with estimates!
                      </td>
                    </tr>
                  ) : (
                    clicksTracker.map((lead) => {
                      const dt = lead.createdAt?.toDate ? lead.createdAt.toDate() : (lead.createdAt instanceof Date ? lead.createdAt : new Date(lead.createdAt));
                      const formattedDate = dt.toLocaleDateString();
                      const formattedTime = dt.toLocaleTimeString();
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                          <td className="p-3.5 sm:p-4 font-bold text-slate-brand dark:text-slate-200">
                            {lead.buyerName}
                            <span className="block text-[8.5px] text-slate-brand/40 dark:text-slate-400 font-mono font-normal">
                              {getRelativeTime(dt)}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4 text-slate-brand/80 dark:text-slate-300">
                            {lead.productName}
                            <span className="block text-[8.5px] text-slate-brand/40 dark:text-slate-400 font-normal">
                              Qty: {lead.quantity}
                            </span>
                          </td>
                          <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-brand dark:text-slate-100">
                            &#8358; {(lead.price * lead.quantity).toLocaleString()}
                          </td>
                          <td className="p-3.5 sm:p-4 space-y-1">
                            <span className="inline-block bg-orange-brand/10 text-orange-brand dark:text-orange-400 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                              In transit / Pending chat
                            </span>
                            <span className="block text-[9px] text-slate-brand/50 dark:text-slate-400 font-normal leading-tight">
                              Estimated Delivery: Within 12-24 Hrs <br /> (Meetup configured on peer WhatsApp chat)
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Database maintenance settings card (Only visible to verified Administrators) */}
          {isAdmin && (
            <div className="bg-slate-50 border border-gray-200 p-8 rounded-3xl space-y-5">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-brand dark:text-slate-100">
                  System Admin Seeder Maintenance
                </h3>
                <p className="text-xs text-slate-brand/60 font-medium leading-relaxed">
                  Only visible to verified organization admins. Use this trigger to wipe alternative uploads and re-seed the student database with campus engineering, electronic and clothing demo portfolios.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  disabled={actionLoading}
                  onClick={handleDatabaseReset}
                  className="bg-emerald-brand/10 hover:bg-emerald-brand/20 text-emerald-brand font-bold text-xs py-3 px-6 rounded-xl transition-all tracking-wider uppercase flex items-center space-x-2 border border-emerald-brand/10 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Force Reset Database Demos</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={handleLinkAllProductsToWhatsApp}
                  className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-450 font-bold text-xs py-3 px-6 rounded-xl transition-all tracking-wider uppercase flex items-center space-x-2 border border-sky-500/10 disabled:opacity-50 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Link All Listings to Active Hotline</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: PRODUCTS TABLE */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex justify-between items-center sm:gap-2 border-b border-gray-150 pb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-brand font-display">My Listed Marketplace Stall</h3>
              <p className="text-[10.5px] text-slate-brand/55">Create new products, specify conditions, and write descriptions.</p>
            </div>
            <button
              onClick={() => openProductForm()}
              className="bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4.5 rounded-full flex items-center space-x-1.5 uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List New Item</span>
            </button>
          </div>

          {/* Custom products list table or collection */}
          {displayProducts.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl space-y-4">
              <ShoppingCart className="w-12 h-12 text-slate-brand/35 dark:text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-brand/70">Your Student Stall is active but empty!</p>
              <p className="text-xs text-slate-brand/45 max-w-sm mx-auto leading-relaxed">
                You haven't listed any student study tools, hostellers mattresses, electronics or clothing items yet. Tap 'List New Item' upper-right to begin!
              </p>
              <button
                onClick={() => openProductForm()}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer uppercase tracking-wider"
              >
                Upload First Listing
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-3xs overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-150 text-slate-brand/60 text-[10px] font-bold tracking-widest uppercase">
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4">Category / Mode</th>
                    <th className="px-6 py-4 font-mono">Condition</th>
                    <th className="px-6 py-4 font-mono">Price (₦)</th>
                    <th className="px-6 py-4">Discount</th>
                    <th className="px-6 py-4">In Stock</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-xs text-slate-brand font-medium">
                  {displayProducts.map((p) => {
                    const matchedCat = categories.find(c => c.id === p.category)?.name || p.category;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" referrerPolicy="no-referrer" />
                            <div>
                              <p className="font-bold text-slate-brand line-clamp-1 truncate max-w-[150px]">{p.name}</p>
                              {isAdmin && (
                                <p className="text-[9px] text-emerald-600/80 uppercase font-bold">Seller: {p.vendorName || 'Independent'}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-[10px] leading-tight">
                            <span className="font-bold uppercase text-slate-brand/70">{matchedCat}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold font-mono py-0.5 px-2 rounded-full text-white uppercase ${
                            p.condition === 'new' ? 'bg-green-600' :
                            p.condition === 'like_new' ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}>
                            {(p.condition || 'like_new').toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col font-mono font-bold">
                            {p.discountPercentage && p.discountPercentage > 0 ? (
                                <>
                                  <span className="text-slate-500 line-through text-[9px]">
                                    &#8358; {p.price.toLocaleString()}
                                  </span>
                                  <span className="text-slate-950 dark:text-slate-100">
                                    &#8358; {Math.round(p.price - (p.price * p.discountPercentage / 100)).toLocaleString()}
                                  </span>
                                </>
                            ) : (
                                <span className="text-slate-950 dark:text-slate-100">
                                    &#8358; {p.price.toLocaleString()}
                                </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-xs">
                          {p.discountPercentage && p.discountPercentage > 0 ? (
                            <span className="text-red-600 dark:text-red-400">-{p.discountPercentage}%</span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {p.stock} units
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px]">
                          {getRelativeTime(p.createdAt) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[9.5px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                            p.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'out_of_stock' ? 'bg-orange-100 text-orange-850' : 'bg-gray-150 text-slate-brand/60'
                          }`}>
                            {p.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openProductForm(p)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-brand hover:text-emerald-brand transition-colors cursor-pointer"
                              title="Edit Listing details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleProductDelete(p)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-brand hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Listing permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIES (System Admin Only) */}
      {isAdmin && activeTab === 'categories' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex justify-between items-center border-b border-gray-150 pb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-brand font-display">Manage Categories Taxonomy</h3>
              <p className="text-[10.5px] text-slate-brand/55">Create new major segments and filter categories displayed inside client shopfronts.</p>
            </div>
            <button
              onClick={() => openCategoryForm()}
              className="bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4.5 rounded-full flex items-center space-x-1.5 uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden p-4 flex items-center space-x-4 hover:shadow-md transition-all justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-brand truncate">{cat.name}</p>
                    <p className="text-[10px] text-slate-brand/45 font-mono">{cat.productCount} items registered</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => openCategoryForm(cat)}
                    className="p-1.5 hover:bg-slate-50 text-slate-brand hover:text-emerald-brand rounded-lg cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCategoryDelete(cat.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-brand hover:text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STOCK ALERT WARNINGS (System Admin Only) */}
      {isAdmin && activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="border-b border-gray-150 pb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-brand font-display">Platform Depletions & Shortage Alerts</h3>
            <p className="text-[10.5px] text-slate-brand/55">Automatic tracking flag identifying items nearing sell-out threshold across all collective campus stalls.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {products
              .filter(p => p.stock <= 2 || p.status === 'out_of_stock')
              .map((p) => (
                <div key={p.id} className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-3xs hover:border-orange-250 dark:hover:border-orange-500/50">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-brand dark:text-slate-100">{p.name}</h4>
                      <p className="text-[9.5px] text-slate-brand/45">
                        Seller: <strong className="text-slate-brand font-semibold">{p.vendorName || 'Independent student'}</strong> • Stock remaining: <strong className="text-red-600 font-mono font-bold">{p.stock} units</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openProductForm(p)}
                    className="bg-slate-100 hover:bg-emerald-brand/10 text-slate-brand hover:text-emerald-brand text-[10px] font-mono font-extrabold px-3 py-2 rounded-lg"
                  >
                    UPDATE STOCK
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: GLOBAL CONFIG (System Admin Only) */}
      {isAdmin && activeTab === 'settings' && settingsForm && (
        <div className="space-y-6 animate-fade-in text-left max-w-2xl">
          <div className="border-b border-gray-150 pb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-brand font-display">Global Admin Hub Settings</h3>
            <p className="text-[10.5px] text-slate-brand/55">Synchronize default platform support emails, office addresses, and primary reserve contact parameters.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 block font-sans">Default Admin WhatsApp Hotline</label>
                <input
                  type="text"
                  required
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-mono font-bold tracking-wider outline-none transition-all text-slate-brand dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 block font-sans">Support Email Address</label>
                <input
                  type="email"
                  required
                  value={settingsForm.contactEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs outline-none transition-all text-slate-brand dark:text-slate-100 font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 block font-sans">Platform Central Address</label>
              <input
                type="text"
                required
                value={settingsForm.contactAddress}
                onChange={(e) => setSettingsForm({ ...settingsForm, contactAddress: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-bold outline-none transition-all text-slate-brand dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 block font-sans">Instagram Platform Handle</label>
                <input
                  type="text"
                  required
                  value={settingsForm.instagramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-semibold outline-none transition-all text-slate-brand dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 block font-sans">Facebook Platform Page</label>
                <input
                  type="text"
                  required
                  value={settingsForm.facebookUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-semibold outline-none transition-all text-slate-brand dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 block font-sans">In-App Operations Hours</label>
              <input
                type="text"
                required
                value={settingsForm.businessHours}
                onChange={(e) => setSettingsForm({ ...settingsForm, businessHours: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-bold outline-none transition-all text-slate-brand dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Lock Configuration</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: ADMIN PERMISSIONS PROFILE (System Admin Only) */}
      {isAdmin && activeTab === 'admins' && (
        <div className="space-y-6 animate-fade-in text-left max-w-2xl">
          <div className="border-b border-gray-150 pb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-brand dark:text-slate-100 font-display">Manage Platform Administrators</h3>
            <p className="text-[10.5px] text-slate-brand/55 dark:text-slate-400">Add secure administrative access for other core members. Designated emails are vetted during Google authentication.</p>
          </div>

          <form onSubmit={handleAddAdmin} className="space-y-4 bg-white dark:bg-slate-950 border border-gray-150 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 block font-sans">New Admin Account Email Address</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  required
                  placeholder="e.g. peer.coordinator@gmail.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700/60 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs outline-none transition-all text-slate-brand dark:text-slate-100 font-mono font-bold"
                />
                <button
                  type="submit"
                  disabled={adminActionLoading}
                  className="bg-emerald-brand hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 uppercase"
                >
                  <Plus className="w-4 h-4 alive-blink animate-pulse" />
                  <span>Grant Access</span>
                </button>
              </div>
            </div>
          </form>

          <div className="bg-white dark:bg-slate-950 border border-gray-150 dark:border-slate-800 p-6 rounded-2xl shadow-3xs space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-brand/65 dark:text-slate-400 font-sans">Active Platform Administrators</h4>
            
            <div className="divide-y divide-gray-150 dark:divide-slate-800 max-h-[300px] overflow-y-auto pr-1">
              {adminsList.length === 0 ? (
                <p className="text-[11px] text-slate-brand/40 py-4 italic text-center">No secondary administrative emails found in database...</p>
              ) : (
                adminsList.map((adm) => {
                  const isSelf = adm.email?.toLowerCase() === user?.email?.toLowerCase();
                  const hardcoded = ['greatifet12@gmail.com', 'aroneefashion@gmail.com', 'osemenjoy448@gmail.com'];
                  const isStaticMaster = hardcoded.includes(adm.email?.toLowerCase());

                  return (
                    <div key={adm.id} className="flex justify-between items-center py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-brand dark:text-slate-200">
                          {adm.email}
                        </span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          {isStaticMaster && (
                            <span className="text-[8px] font-bold text-orange-brand bg-orange-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                              Platform Master
                            </span>
                          )}
                          {isSelf && (
                            <span className="text-[8px] font-bold text-emerald-brand bg-emerald-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                              Current User
                            </span>
                          )}
                        </div>
                      </div>

                      {!(isStaticMaster || isSelf) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(adm.id)}
                          disabled={adminActionLoading}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-lg hover:text-red-700 cursor-pointer transition-colors"
                          title="Revoke Admin Permission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CHATS & INQUIRIES */}
      {activeTab === 'chats' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="border-b border-gray-150 pb-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-brand dark:text-slate-100 font-display">Student Enquiries & Direct Chats</h3>
            <p className="text-[10.5px] text-slate-brand/55 dark:text-slate-400">
              Respond directly to Trinity University shoppers in real-time. Unread updates display dynamic badges. Negotiate hostel meetup locations and coordinate trading dates.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <MarketplaceChat 
              currentUser={user}
              onLoginClick={onLogin}
              isVendorDashboard={true}
            />
          </div>
        </div>
      )}

      {/* MAIN POPUP MODAL: ADD / EDIT PRODUCT FORM */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
            
            <button
              onClick={() => setIsProductFormOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-105 transition-all text-slate-brand/60 hover:text-slate-brand cursor-pointer border border-gray-100"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-brand">Item Catalog Sheet</span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-brand mt-0.5">
                {productEditing ? 'Edit Your Listing Info' : 'List a New Hostel Item'}
              </h3>
              <p className="text-[11px] text-slate-brand/50 font-medium">Synchronize study tools, electronics, utensils, apparel, and specify your trade preferences.</p>
            </div>

            <form onSubmit={handleProductPreSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Listing Title / Item name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Study tool, Laptop Stand, etc."
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-semibold outline-none transition-all text-slate-brand dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Select Hub Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-bold outline-none transition-all text-slate-brand cursor-pointer appearance-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Item Details / Features Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell student buyers about the condition, previous semesters, pages, charging port, battery health, or meeting instructions..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-medium outline-none transition-all text-slate-brand leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Condition Grade</label>
                  <select
                    value={prodCondition}
                    onChange={(e) => setProdCondition(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-semibold outline-none transition-all text-slate-brand cursor-pointer"
                  >
                    <option value="new">Brand New (Packed)</option>
                    <option value="like_new">Like New (Gently Used)</option>
                    <option value="used">Fairly Used</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Listing Price (₦)</label>
                  <input
                    type="number"
                    required
                    placeholder="8000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-mono font-bold tracking-wider outline-none transition-all text-slate-brand dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Discount (%)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={prodDiscount}
                    onChange={(e) => setProdDiscount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-mono font-bold tracking-wider outline-none transition-all text-slate-brand dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Stall Contact WhatsApp Line for this Listing</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2348123456789"
                    value={prodWhatsApp}
                    onChange={(e) => setProdWhatsApp(e.target.value.replace(/\+/g, ''))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-mono font-bold tracking-widest outline-none transition-all text-slate-brand dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Available Quantity</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-mono font-bold outline-none transition-all text-slate-brand dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 pb-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans block">Product Media & Images</label>
                
                {imageUploadFeedback && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-2.5 rounded-xl flex items-center space-x-2 text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{imageUploadFeedback}</span>
                  </div>
                )}

                {/* VISUAL IMAGE THUMBNAIL PREVIEW GRID */}
                {(() => {
                  const currentImagesArr = splitImageUrls(prodImages);
                  if (currentImagesArr.length === 0) return null;
                  return (
                    <div className="space-y-2 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-2xl border border-gray-150/40 dark:border-slate-800">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-brand/50 dark:text-slate-500 block">Uploaded Listing Catalog Media ({currentImagesArr.length})</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentImagesArr.map((imageUrl, idx) => (
                          <div key={idx} className="relative group border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden aspect-square shadow-2xs">
                            <img 
                              src={imageUrl} 
                              alt={`Preview ${idx + 1}`} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1.5 left-1.5 bg-emerald-500 text-[8px] font-extrabold text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow">Cover</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImageAtIndex(idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-600/95 hover:bg-red-750 text-white rounded-full transition-transform cursor-pointer shadow border border-red-500"
                              title="Delete this image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      id="url-input"
                      placeholder="Paste image URL here"
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:border-emerald-brand"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = (e.currentTarget as HTMLInputElement).value;
                          if (url) {
                            setActionLoading(true);
                            await new Promise(resolve => setTimeout(resolve, 600));
                            setProdImages((prev) => prev ? `${prev}, ${url}` : url);
                            (e.currentTarget as HTMLInputElement).value = '';
                            setActionLoading(false);
                            setImageUploadFeedback('Image URL added!');
                            setTimeout(() => setImageUploadFeedback(''), 3000);
                          }
                        }
                      }}
                      disabled={actionLoading}
                    />
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={async (e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          const url = input.value;
                          if (url) {
                            setActionLoading(true);
                            await new Promise(resolve => setTimeout(resolve, 600));
                            setProdImages((prev) => prev ? `${prev}, ${url}` : url);
                            input.value = '';
                            setActionLoading(false);
                            setImageUploadFeedback('Image URL added!');
                            setTimeout(() => setImageUploadFeedback(''), 3000);
                          }
                      }}
                      className="bg-emerald-brand text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Add Link'}
                    </button>
                  </div>
                  <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-emerald-brand dark:hover:border-emerald-500 rounded-2xl p-6 transition-colors bg-slate-50/50 dark:bg-slate-800/30 text-center relative group">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={handleProductImageUpload} 
                      disabled={actionLoading} 
                    />
                    {actionLoading ? (
                      <div className="flex flex-col items-center justify-center p-4">
                        {imageUploadProgress > 0 ? (
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2.5">
                            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${imageUploadProgress}%` }}></div>
                          </div>
                        ) : (
                          <RefreshCw className="w-8 h-8 text-emerald-brand animate-spin" />
                        )}
                        <p className="text-xs font-semibold text-slate-brand dark:text-slate-200 mt-2">
                          {imageUploadProgress > 0 ? `Uploading... ${imageUploadProgress}%` : 'Processing...'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm border border-gray-150 dark:border-slate-700 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-brand dark:text-slate-200">Click or drag images to upload</p>
                        <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 mt-1">High-quality JPG, PNG, WEBP (auto-compressed)</p>
                      </>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                  <hr className="flex-1 border-gray-200 dark:border-slate-700" />
                  <span className="text-[9px] uppercase tracking-widest text-slate-brand/40 dark:text-slate-500 font-bold">OR LINK EXTERNAL URL</span>
                  <hr className="flex-1 border-gray-200 dark:border-slate-700" />
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    value={prodImages}
                    onChange={(e) => setProdImages(e.target.value)}
                    placeholder="https://example.com/image1.jpg, https://ex..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700/60 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-mono font-medium outline-none transition-all text-slate-brand dark:text-slate-100 placeholder-slate-brand/30 dark:placeholder-slate-600"
                  />
                </div>

                {/* LINK LIVE OG SHARE CARD WATERMARK */}
                {(() => {
                  const currentImagesArr = splitImageUrls(prodImages);
                  if (currentImagesArr.length === 0) return null;
                  return (
                    <div className="bg-slate-50 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 mt-4 text-left">
                      <div className="flex items-center space-x-2 border-b border-gray-150/50 dark:border-slate-700/50 pb-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-brand dark:text-slate-300">Open Graph Social Share Preview</span>
                      </div>
                      <div className="bg-[#e5ddd5]/30 dark:bg-[#0b141a]/60 p-3 flex justify-center rounded-xl border border-gray-150/40 dark:border-slate-800">
                        <div className="w-full max-w-[300px]">
                          <span className="text-[8px] uppercase tracking-widest text-slate-brand/40 dark:text-slate-500 font-bold block mb-1">WhatsApp Chat Bubble Link Card</span>
                          <div className="bg-white dark:bg-[#1f2c34] rounded-xl overflow-hidden shadow-xs border border-gray-150 dark:border-slate-700/30 text-left">
                            <img 
                              src={currentImagesArr[0]} 
                              alt="Social Cover" 
                              referrerPolicy="no-referrer"
                              className="w-full h-28 sm:h-32 object-cover" 
                            />
                            <div className="p-2.5 space-y-0.5">
                              <span className="text-[9px] text-[#00a884] dark:text-[#53bdeb] font-bold flex items-center space-x-0.5">
                                <span>🌍</span>
                                <span>tu-market-hub.vercel.app/?product=id</span>
                              </span>
                              <h4 className="font-bold text-[11px] leading-tight text-slate-brand dark:text-slate-100 truncate">
                                {prodName || 'Item Title Placeholder'} | TU Student Hub
                              </h4>
                              <p className="text-[9.5px] leading-relaxed text-slate-brand/50 dark:text-slate-400 line-clamp-2 select-none">
                                {prodDesc || 'Discover price, condition grade, swap values, and chat with student seller instantly on Trinity University marketplace.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">List Visibility Status</label>
                  <select
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-semibold outline-none transition-all text-slate-brand cursor-pointer"
                  >
                    <option value="active">Active (Visible public catalog)</option>
                    <option value="draft">Draft (Private Archive)</option>
                    <option value="out_of_stock">Sold Out</option>
                  </select>
                </div>

                {isAdmin && (
                  <div className="flex items-center space-x-3 h-full pt-4">
                    <input
                      type="checkbox"
                      id="featured-check"
                      checked={prodFeatured}
                      onChange={(e) => setProdFeatured(e.target.checked)}
                      className="w-5 h-5 text-emerald-brand border-gray-350 focus:ring-emerald-brand rounded cursor-pointer"
                    />
                    <label htmlFor="featured-check" className="text-xs font-bold text-slate-brand cursor-pointer select-none">
                      Mark as Featured Item
                    </label>
                  </div>
                )}
              </div>

              {showPublishConfirm ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl space-y-3 mt-4 animate-fade-in text-left">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-800 dark:text-amber-300">Confirm Listing Publication</h4>
                      <p className="text-[10.5px] text-amber-700/90 dark:text-amber-400 leading-relaxed font-semibold mt-0.5">
                        Are you sure you want to {productEditing ? 'save changes to' : 'publish'} "{prodName || 'this item'}"?
                        It will immediately sync changes live on Trinity University's seeker grid!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPublishConfirm(false)}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-300 hover:bg-slate-50 text-slate-brand cursor-pointer"
                    >
                      Go Back
                    </button>
                    <button
                      type="button"
                      onClick={executeActualProductSubmit}
                      disabled={actionLoading}
                      className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-emerald-brand hover:bg-emerald-700 text-white shadow-3xs cursor-pointer flex items-center space-x-1"
                    >
                      {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      <span>{actionLoading ? 'Publishing...' : 'Publish Listing Live'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsProductFormOpen(false)}
                    className="px-5 py-3 rounded-xl border border-gray-300 hover:bg-slate-50 text-slate-brand text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-full cursor-pointer flex items-center space-x-2"
                  >
                    <span>{productEditing ? 'Save Changes' : 'Publish Listing'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* RENDER CATEGORY POPUP MODAL (System Admin Only) */}
      {isCategoryFormOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsCategoryFormOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-105 transition-all text-slate-brand/60 hover:text-slate-brand cursor-pointer border border-gray-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-brand">Taxonomy Category</span>
              <h3 className="text-xl font-bold font-display text-slate-brand mt-0.5">
                {categoryEditing ? 'Edit Category Segment' : 'Create High-Level Category'}
              </h3>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans">Category Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Services, Food, Lodging"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-semibold outline-none transition-all text-slate-brand dark:text-slate-100"
                />
              </div>

              <div className="space-y-3 pt-2 pb-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-brand/60 dark:text-slate-400 font-sans block">Representative Cover Image</label>
                
                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-emerald-brand dark:hover:border-emerald-500 rounded-2xl p-6 transition-colors bg-slate-50/50 dark:bg-slate-800/30 text-center relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleCategoryImageUpload} 
                    disabled={actionLoading} 
                  />
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm border border-gray-150 dark:border-slate-700 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-brand dark:text-slate-200">Click to upload image</p>
                  <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 mt-1">High resolution cover visual</p>
                </div>

                <div className="flex items-center space-x-3">
                  <hr className="flex-1 border-gray-200 dark:border-slate-700" />
                  <span className="text-[9px] uppercase tracking-widest text-slate-brand/40 dark:text-slate-500 font-bold">OR LINK EXTERNAL URL</span>
                  <hr className="flex-1 border-gray-200 dark:border-slate-700" />
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-250 dark:border-slate-700/60 focus:border-emerald-brand focus:ring-1 focus:ring-emerald-brand rounded-xl py-2.5 px-3 text-xs font-medium outline-none transition-all text-slate-brand dark:text-slate-100 placeholder-slate-brand/30 dark:placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryFormOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-gray-300 hover:bg-slate-50 text-slate-brand text-xs font-bold uppercase tracking-wide cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-slate-900 border border-slate-900 text-white font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
