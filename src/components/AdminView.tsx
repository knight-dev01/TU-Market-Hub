import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, LayoutDashboard, ShoppingCart, FolderTree, AlertTriangle, 
  Settings, LogOut, CheckCircle, Save, X, RefreshCw, MessageSquare, Tag, Repeat, Sparkles, AlertCircle 
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { addDoc, doc, updateDoc, deleteDoc, collection, serverTimestamp, setDoc, getDoc, writeBatch, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category, StoreSettings } from '../types';
import { forceResetDatabase } from '../data/seed';
import imageCompression from 'browser-image-compression';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'inventory' | 'settings'>('overview');

  // Load Status feedback
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Forms / Modal state
  const [productEditing, setProductEditing] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  // Personal Vendor profile state (For Student Vendors who want to persistent-save their custom Whatsapp number)
  const [vendorWhatsApp, setVendorWhatsApp] = useState<string>('');
  const [vendorWhatsAppLoading, setVendorWhatsAppLoading] = useState<boolean>(true);

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
  const [prodWhatsApp, setProdWhatsApp] = useState('');

  // Category Form Input field binds
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');

  // Settings editable forms
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(null);

  // Feature feedback & confirm dialogs
  const [imageUploadFeedback, setImageUploadFeedback] = useState<string>('');
  const [showPublishConfirm, setShowPublishConfirm] = useState<boolean>(false);

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
    let newImages = prodImages ? prodImages.split(',').map(s=>s.trim()).filter(Boolean) : [];
    let addedCount = 0;
    for (let i = 0; i < files.length; i++) {
        const base64 = await compressAndConvertImage(files[i]);
        if (base64) {
          newImages.push(base64);
          addedCount++;
        }
    }
    setProdImages(newImages.join(', '));
    setActionLoading(false);
    if (addedCount > 0) {
      setImageUploadFeedback(`Successfully uploaded and compiled ${addedCount} photo(s)!`);
      setTimeout(() => setImageUploadFeedback(''), 4000);
    }
  };

  const handleRemoveImageAtIndex = (index: number) => {
    const list = prodImages.split(',').map(s=>s.trim()).filter(Boolean);
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

  // Fetch Vendor WhatsApp number if user is logged in
  useEffect(() => {
    async function fetchVendorWhatsApp() {
      if (!user) return;
      setVendorWhatsAppLoading(true);
      try {
        const vRef = doc(db, 'vendors', user.uid);
        const vSnap = await getDoc(vRef);
        if (vSnap.exists() && vSnap.data().whatsapp) {
          setVendorWhatsApp(vSnap.data().whatsapp);
        } else {
          // Default to settings number if not set yet
          setVendorWhatsApp(settings?.whatsappNumber || '2348000000000');
        }
      } catch (err) {
        console.error('Error fetching vendor whatsapp:', err);
      } finally {
        setVendorWhatsAppLoading(false);
      }
    }
    fetchVendorWhatsApp();
  }, [user, settings]);

  const displayNotice = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => setActionSuccess(''), 4500);
  };

  const handleSaveVendorWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    try {
      const vRef = doc(db, 'vendors', user.uid);
      await setDoc(vRef, { whatsapp: vendorWhatsApp.trim() }, { merge: true });
      displayNotice('Your Vendor WhatsApp number has been successfully synchronized!');
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
    setActionLoading(true);
    
    const preparedImages = prodImages.split(',').map(img => img.trim()).filter(img => img.length > 0);
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
      vendorId: productEditing ? (productEditing.vendorId || user.uid) : user.uid,
      vendorName: productEditing ? (productEditing.vendorName || user.displayName || user.email?.split('@')[0]) : (user.displayName || user.email?.split('@')[0]),
      vendorWhatsApp: prodWhatsApp ? prodWhatsApp.trim() : (vendorWhatsApp || settings?.whatsappNumber || ''),
      updatedAt: serverTimestamp()
    };

    try {
      if (productEditing) {
        // Safe Check: Non-admins can only edit their OWN products!
        if (!isAdmin && productEditing.vendorId !== user.uid) {
          alert('Security Access Denied: You cannot modify products uploaded by another student seller!');
          setActionLoading(false);
          return;
        }
        const pRef = doc(db, 'products', productEditing.id);
        await updateDoc(pRef, productPayload);
        displayNotice('Successfully updated listed product!');
      } else {
        // Create Mode
        const productsColRef = collection(db, 'products');
        await addDoc(productsColRef, {
          ...productPayload,
          createdAt: serverTimestamp()
        });
        displayNotice('Your hostel product has been successfully listed on the public grid!');
      }
      setIsProductFormOpen(false);
      await onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error saving product in database. Please review parameters.');
    } finally {
      setActionLoading(false);
      setShowPublishConfirm(false);
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
          className="bg-slate-50 hover:bg-red-50 text-slate-brand hover:text-red-700 font-bold text-xs px-4 py-2.5 rounded-xl tracking-wider uppercase border border-gray-200 hover:border-red-200 cursor-pointer transition-all flex items-center space-x-2 shrink-0 shadow-3xs"
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

      {/* Tabs list navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-4">
        {[
          { label: 'My Hub Overview', value: 'overview' as const, icon: LayoutDashboard },
          { label: 'My Listed Products', value: 'products' as const, icon: ShoppingCart },
          ...(isAdmin ? [
            { label: 'Platform Categories', value: 'categories' as const, icon: FolderTree },
            { label: 'Platform Warnings', value: 'inventory' as const, icon: AlertTriangle },
            { label: 'Global Platform Config', value: 'settings' as const, icon: Settings }
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
              <h3 className="font-display font-bold text-lg text-slate-brand flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-brand dark:text-emerald-400" />
                <span>My Stall Personal Phone Synchronization</span>
              </h3>
              <p className="text-xs text-slate-brand/60 leading-relaxed font-medium mt-1">
                Configure your active campus WhatsApp line. Buyers on the platform will correspond directly with this specific phone number when querying your mattress, laptop, study tools or other student goods!
              </p>
            </div>

            <form onSubmit={handleSaveVendorWhatsApp} className="max-w-md space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-brand/75 block">WhatsApp Number (With Country Code)</label>
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
                <p className="text-[10px] text-slate-brand/40 italic">Include country code first without standard plus (+) symbols (e.g. 234 for Nigeria).</p>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Synchronize Stall Info</span>
              </button>
            </form>
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
                    <th className="px-6 py-4">In Stock</th>
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
                        <td className="px-6 py-4 font-mono font-bold text-slate-brand/85">
                          &#8358; {p.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {p.stock} units
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
                  const currentImagesArr = prodImages.split(',').map(s => s.trim()).filter(Boolean);
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

                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-emerald-brand dark:hover:border-emerald-500 rounded-2xl p-6 transition-colors bg-slate-50/50 dark:bg-slate-800/30 text-center relative group">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleProductImageUpload} 
                    disabled={actionLoading} 
                  />
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 shadow-sm border border-gray-150 dark:border-slate-700 text-emerald-brand dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-brand dark:text-slate-200">Click or drag images to upload</p>
                  <p className="text-[10px] text-slate-brand/50 dark:text-slate-400 mt-1">High-quality JPG, PNG, WEBP (auto-compressed)</p>
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
                  const currentImagesArr = prodImages.split(',').map(s => s.trim()).filter(Boolean);
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
                                <span>tu-market-hub.firebaseapp.com/?product=id</span>
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
                      <span>Publish Listing Live</span>
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
