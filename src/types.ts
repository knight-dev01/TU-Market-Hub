import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string; // Category ID
  stock: number;
  featured: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Multivendor fields
  vendorId?: string;
  vendorName?: string;
  vendorWhatsApp?: string;
  condition?: 'new' | 'used' | 'like_new';
  dealType?: 'sell' | 'swap' | 'both';
  discountPercentage?: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  createdAt: Timestamp;
}

export interface StoreSettings {
  whatsappNumber: string;
  contactAddress: string;
  contactEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  businessHours: string;
}

export interface VendorProfile {
  uid: string;
  name: string;
  shopName: string;
  whatsappNumber: string;
  email: string;
  bio?: string;
  createdAt: Timestamp;
}

export interface Admin {
  email: string;
  addedAt: Timestamp;
}

