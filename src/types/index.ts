export interface Product {
  id: string;
  name: string;
  category: 'Watches' | 'Wallets' | 'Sunglasses' | 'Perfumes' | 'Accessories' | string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  description: string;
  specs?: Record<string, string>;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  engraving?: string;
  giftWrapping?: boolean;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  country: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  engraving?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'Google Pay' | 'Apple Pay' | 'Credit Card' | string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  estimatedDelivery?: string;
  courierPartner?: string;
  deliveryNotes?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  productId?: string;
  caption?: string;
  source: 'google_photos' | 'direct_upload' | 'curated';
  uploadedBy?: string;
  uploadedAt: string;
  featured?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_owner' | 'owner' | 'admin' | 'customer';
  avatar?: string;
  provider: 'google' | 'apple' | 'email' | 'phone';
  membershipTier: string;
  vipClub?: boolean;
  phone?: string;
  superOwnerType?: 'owner1' | 'owner2';
}

export interface OwnerAccount {
  id: string;
  type: 'gmail' | 'phone';
  identifier: string;
  normalizedIdentifier?: string;
  backupEmail?: string;
  name: string;
  status: 'ACTIVE' | 'UPDATING';
  verifiedAt: string;
  uid?: string;
  lastLoginAt?: string;
}

export interface OwnershipAuditEntry {
  id: string;
  timestamp: string;
  ownerType: 'owner1' | 'owner2';
  action: 'LOGIN' | 'IDENTITY_UPDATE_REQUESTED' | 'IDENTITY_UPDATED' | 'VERIFIED';
  oldIdentifier?: string;
  newIdentifier?: string;
  actor: string;
  ip?: string;
}

export interface OwnershipState {
  owner1: OwnerAccount;
  owner2: OwnerAccount;
  auditLog: OwnershipAuditEntry[];
  updatedAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  // Business Contact Settings
  phone: string;
  intlPhone?: string;
  whatsapp?: string;
  whatsappCountryCode?: string;
  whatsappChatUrl?: string;
  showPublicContact?: boolean;
  email: string;
  supportEmail: string;
  address?: string;
  flagship2?: string;
  // Delivery Settings
  deliveryCountry?: string;
  deliveryArea?: string;
  deliveryAvailability?: string;
  blockInternationalOrders?: boolean;
  // Operations & Display
  announcement: string;
  currency: string;
  taxRate: number;
  ownerEmail?: string;
  adminPasscode?: string;
}

export interface StoreStats {
  grossRevenue: number;
  totalOrders: number;
  activeOrders: number;
  totalProducts: number;
  lowStockCount: number;
  totalInventoryValue: number;
  totalClients: number;
  recentOrders: Order[];
}

export type TeamRole = 'ADMIN' | 'OWNER';
export type TeamMemberStatus = 'ACTIVE' | 'INVITED' | 'REVOKED';

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  invitedBy: string;
  invitedAt: string;
  updatedAt?: string;
}
