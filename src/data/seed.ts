import { doc, getDocs, collection, writeBatch, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface SeedCategory {
  id: string;
  name: string;
  image: string;
}

export interface SeedProduct {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string; // references SeedCategory.id
  stock: number;
  featured: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
  vendorId?: string;
  vendorName?: string;
  vendorWhatsApp?: string;
  condition?: 'new' | 'used' | 'like_new';
  dealType?: 'sell' | 'swap' | 'both';
}

export const defaultCategories: SeedCategory[] = [
  {
    id: 'academics',
    name: 'Study Tools & Resources',
    image: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'electronics',
    name: 'Electronics & Gadgets',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hostel',
    name: 'Hostel Essentials',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'services',
    name: 'Student Services',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'food',
    name: 'Food & Snacks',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  }
];

export const defaultProducts: SeedProduct[] = [
  {
    name: 'Engineering Mathematics (Vol 2)',
    description: 'Highly requested TU engineering mathematics guide. Minimal annotations, pages clean, covers differential equations, matrices, and complex numbers.',
    price: 8500,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'],
    category: 'academics',
    stock: 2,
    featured: true,
    status: 'active',
    vendorId: 'vendor-1',
    vendorName: 'Niyi Peters',
    vendorWhatsApp: '+2348031234567',
    condition: 'used',
    dealType: 'both'
  },
  {
    name: 'MacBook Air 2018 Gold',
    description: 'Perfect for student programmers or designers. Intel i5, 8GB RAM, 256GB SSD, dual Thunderbolt 3 ports. Clean battery cycle, high performance, Lagos campus pickup.',
    price: 240000,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
    category: 'electronics',
    stock: 1,
    featured: true,
    status: 'active',
    vendorId: 'vendor-2',
    vendorName: 'GadgetHub TU',
    vendorWhatsApp: '+2348123456789',
    condition: 'used',
    dealType: 'sell'
  },
  {
    name: 'Retro Corduroy Jacket (Warm Brown)',
    description: 'Oversized aesthetic corduroy jacket with heavy buttons. In pristine condition. Can be styled for hot or cool evenings. Swap accepted for active sneakers.',
    price: 12000,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'],
    category: 'fashion',
    stock: 1,
    featured: true,
    status: 'active',
    vendorId: 'vendor-3',
    vendorName: 'Tunde Wears',
    vendorWhatsApp: '+2348098765432',
    condition: 'like_new',
    dealType: 'swap'
  },
  {
    name: 'Rechargeable Foldable Desk Fan',
    description: 'Essential for hot campus days and power cuts. Comes with a 3-speed selector, a built-in LED reading lamp, and a modern micro-USB charging port.',
    price: 10500,
    images: ['https://images.unsplash.com/photo-1618944847828-82e943c3beb6?auto=format&fit=crop&w=800&q=80'],
    category: 'hostel',
    stock: 5,
    featured: true,
    status: 'active',
    vendorId: 'vendor-4',
    vendorName: 'Hostel Hub',
    vendorWhatsApp: '+2348144556677',
    condition: 'new',
    dealType: 'sell'
  },
  {
    name: 'Coding & Debugging Support (React/Node)',
    description: 'Stuck on your semester project? Get 1-on-1 expert troubleshooting, React setup, Git guidance, or database integration reviews.',
    price: 5000,
    images: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80'],
    category: 'services',
    stock: 10,
    featured: false,
    status: 'active',
    vendorId: 'vendor-5',
    vendorName: 'DevAyo TU',
    vendorWhatsApp: '+2347012345678',
    condition: 'new',
    dealType: 'sell'
  },
  {
    name: 'Spicy Ghana Jollof & Chicken Pack',
    description: 'Freshly made student lunch boxes cooked in clean, rich spices. Large chicken lap and fried plantains included! Place orders 2 hours before delivery.',
    price: 3500,
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
    category: 'food',
    stock: 50,
    featured: true,
    status: 'active',
    vendorId: 'vendor-6',
    vendorName: 'Shades Kitchen',
    vendorWhatsApp: '+2348088990011',
    condition: 'new',
    dealType: 'sell'
  }
];

export const defaultSettings = {
  id: 'current',
  whatsappNumber: '+234 904 722 6729',
  contactAddress: 'Trinity University City Campus, Off Alara Street, (Near Queens College) Yaba, Lagos.',
  contactEmail: 'greatifet12@gmail.com',
  instagramUrl: 'https://instagram.com/tumarketplace',
  facebookUrl: 'https://facebook.com/tumarketplace',
  businessHours: 'Open 24/7 online for TU Students'
};

export async function checkAndSeedDatabase() {
  try {
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.size >= 3) {
      console.log('Database already has items. Skipping seeding...');
      return false;
    }

    console.log('Database missing items. Seeding starting...');
    const settingsDocRef = doc(db, 'settings', 'current');
    const batch = writeBatch(db);
    
    // 1. Seed global settings
    batch.set(settingsDocRef, {
      whatsappNumber: defaultSettings.whatsappNumber,
      contactAddress: defaultSettings.contactAddress,
      contactEmail: defaultSettings.contactEmail,
      instagramUrl: defaultSettings.instagramUrl,
      facebookUrl: defaultSettings.facebookUrl,
      businessHours: defaultSettings.businessHours
    });
    
    // 2. Seed classes/categories
    defaultCategories.forEach((cat) => {
      const catRef = doc(db, 'categories', cat.id);
      const activeProdCount = defaultProducts.filter(p => p.category === cat.id && p.status === 'active').length;
      batch.set(catRef, {
        name: cat.name,
        image: cat.image,
        productCount: activeProdCount,
        createdAt: serverTimestamp()
      });
    });
    
    // 3. Seed student marketplace products
    defaultProducts.forEach((prod, idx) => {
      const prodId = `prod-${idx + 1}`;
      const prodRef = doc(db, 'products', prodId);
      batch.set(prodRef, {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        images: prod.images,
        category: prod.category,
        stock: prod.stock,
        featured: prod.featured,
        status: prod.status,
        vendorId: prod.vendorId || 'system-vendor',
        vendorName: prod.vendorName || 'TU Official Stall',
        vendorWhatsApp: prod.vendorWhatsApp || defaultSettings.whatsappNumber,
        condition: prod.condition || 'new',
        dealType: prod.dealType || 'sell',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    // 4. Seed Admins
    const adminRef = doc(db, 'admins', 'greatifet12_id');
    batch.set(adminRef, {
      email: 'greatifet12@gmail.com',
      addedAt: serverTimestamp()
    });

    await batch.commit();
    console.log('Database successfully seeded with student items!');
    return true;
  } catch (error) {
    console.warn('Seeding database skipped (requires admin login or already seeded).', error);
    return false;
  }
}

export async function forceResetDatabase() {
  try {
    const batch = writeBatch(db);
    
    // Clear products
    const productsSnap = await getDocs(collection(db, 'products'));
    productsSnap.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Clear categories
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    categoriesSnap.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Reset settings
    const settingsRef = doc(db, 'settings', 'current');
    batch.set(settingsRef, {
      whatsappNumber: defaultSettings.whatsappNumber,
      contactAddress: defaultSettings.contactAddress,
      contactEmail: defaultSettings.contactEmail,
      instagramUrl: defaultSettings.instagramUrl,
      facebookUrl: defaultSettings.facebookUrl,
      businessHours: defaultSettings.businessHours
    });

    // Write default categories
    defaultCategories.forEach((cat) => {
      const catRef = doc(db, 'categories', cat.id);
      const activeProdCount = defaultProducts.filter(p => p.category === cat.id && p.status === 'active').length;
      batch.set(catRef, {
        name: cat.name,
        image: cat.image,
        productCount: activeProdCount,
        createdAt: serverTimestamp()
      });
    });

    // Write default products
    defaultProducts.forEach((prod, idx) => {
      const prodId = `prod-${idx + 1}`;
      const prodRef = doc(db, 'products', prodId);
      batch.set(prodRef, {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        images: prod.images,
        category: prod.category,
        stock: prod.stock,
        featured: prod.featured,
        status: prod.status,
        vendorId: prod.vendorId || 'system-vendor',
        vendorName: prod.vendorName || 'TU Official Stall',
        vendorWhatsApp: prod.vendorWhatsApp || defaultSettings.whatsappNumber,
        condition: prod.condition || 'new',
        dealType: prod.dealType || 'sell',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    const adminRef = doc(db, 'admins', 'greatifet12_id');
    batch.set(adminRef, {
      email: 'greatifet12@gmail.com',
      addedAt: serverTimestamp()
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Force resetting database failed:', error);
    return false;
  }
}

