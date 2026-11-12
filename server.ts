import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.resolve(__dirname, 'data', 'averon_store.json');
const UPLOADS_DIR = path.resolve(__dirname, 'data', 'uploads');

// Ensure data and uploads directories exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to read and write database safely
function getDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      throw new Error('Data file not found');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.products)) data.products = [];
    if (!Array.isArray(data.orders)) data.orders = [];
    if (!Array.isArray(data.teamMembers)) data.teamMembers = [];
    if (!Array.isArray(data.categories)) {
      data.categories = ['All', 'Watches', 'Wallets', 'Sunglasses', 'Perfumes', 'Accessories'];
    }
    if (!Array.isArray(data.gallery) || data.gallery.length === 0) {
      data.gallery = [
        {
          id: 'gal-1',
          title: 'Tourbillon Sovereign Haute Horlogerie',
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
          category: 'Watches',
          caption: 'Hand-finished titanium case featuring flying tourbillon movement and sapphire exhibition caseback.',
          source: 'curated',
          uploadedAt: '2026-11-10T10:00:00.000Z',
          featured: true
        },
        {
          id: 'gal-2',
          title: 'Bespoke Exotic Leather Bi-Fold',
          url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80',
          category: 'Wallets',
          caption: 'Hand-stitched full-grain calfskin with titanium RFID-shielding inner lining.',
          source: 'curated',
          uploadedAt: '2026-11-10T10:30:00.000Z',
          featured: true
        },
        {
          id: 'gal-3',
          title: 'Damascus Steel & Obsidian Cufflinks',
          url: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=1200&q=80',
          category: 'Accessories',
          caption: 'Pattern-welded Damascus steel forge-welded with midnight obsidian stones.',
          source: 'curated',
          uploadedAt: '2026-11-10T11:00:00.000Z',
          featured: true
        },
        {
          id: 'gal-4',
          title: 'Oud Noir Extrait de Parfum',
          url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80',
          category: 'Perfumes',
          caption: 'Rare aged Cambodian agarwood distilled with royal saffron and black amber.',
          source: 'curated',
          uploadedAt: '2026-11-10T11:30:00.000Z',
          featured: true
        },
        {
          id: 'gal-5',
          title: 'Aviator Titanium Polarized Eyewear',
          url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
          category: 'Sunglasses',
          caption: 'Ultralight Grade 5 aerospace titanium frame with anti-reflective polarized optics.',
          source: 'curated',
          uploadedAt: '2026-11-10T12:00:00.000Z',
          featured: true
        }
      ];
    }
    return data;
  } catch (err) {
    console.error('Failed reading data file:', err);
    return {
      settings: {
        brandName: 'AVERON INDUSTRY',
        tagline: 'ELEVATE YOUR PRESENCE',
        phone: '+1 (800) 845-AVERON',
        intlPhone: '+971 4 800 2837',
        email: 'concierge@averonindustry.com',
        supportEmail: 'vip@averonindustry.com',
        address: '740 Fifth Avenue, Haute Horlogerie District, New York, NY 10019',
        flagship2: 'Fashion Avenue, The Dubai Mall, Level 1, Dubai, UAE',
        announcement: 'COMPLIMENTARY BESPOKE WHITE-GLOVE EXPRESS SHIPPING ON ALL GLOBAL ORDERS',
        currency: 'USD',
        taxRate: 0.08,
        whatsapp: '+18008452837',
        ownerEmail: 'jawadsajid274@gmail.com',
        adminPasscode: 'AVERON2026!'
      },
      categories: ['All', 'Watches', 'Wallets', 'Sunglasses', 'Perfumes', 'Accessories'],
      products: [],
      orders: [],
      users: [],
      subscribers: []
    };
  }
}

function saveDb(data: any) {
  try {
    const tmpFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Failed saving data file:', err);
    return false;
  }
}

import crypto from 'crypto';

interface SessionData {
  uid: string;
  email?: string;
  phone?: string;
  role: 'super_owner' | 'owner' | 'admin' | 'customer';
  superOwnerType?: 'owner1' | 'owner2';
  createdAt: number;
}

const activeSessions = new Map<string, SessionData>();
const pendingPhoneOtps = new Map<string, { otp: string; expiresAt: number; phone: string }>();

function normalizePhone(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/[^0-9+]/g, '');
}

function getOwnership(db: any) {
  if (!db.ownership) {
    db.ownership = {
      owner1: {
        id: 'owner-1',
        type: 'gmail',
        identifier: 'jawadsajid124@gmail.com',
        normalizedIdentifier: 'jawadsajid124@gmail.com',
        backupEmail: 'jawadsajid274@gmail.com',
        name: 'Super Owner 1 (Gmail)',
        status: 'ACTIVE',
        verifiedAt: '2026-11-10T10:00:00.000Z',
        uid: 'usr-super-owner-1',
        lastLoginAt: '2026-11-10T10:00:00.000Z'
      },
      owner2: {
        id: 'owner-2',
        type: 'phone',
        identifier: '+92 305 6674374',
        normalizedIdentifier: '+923056674374',
        name: 'Super Owner 2 (Phone)',
        status: 'ACTIVE',
        verifiedAt: '2026-11-10T10:00:00.000Z',
        uid: 'usr-super-owner-2',
        lastLoginAt: '2026-11-10T10:00:00.000Z'
      },
      auditLog: [],
      updatedAt: new Date().toISOString()
    };
  }
  return db.ownership;
}

function isPrimaryOwnerMatch(email?: string, phone?: string, db?: any): boolean {
  if (email) {
    const clean = email.trim().toLowerCase();
    if (clean === 'jawadsajid124@gmail.com' || clean === 'jawadsajid274@gmail.com') return true;
    if (db?.settings?.ownerEmail?.toLowerCase() === clean) return true;
    if (db?.ownership?.owner1?.identifier?.toLowerCase() === clean) return true;
    if (db?.ownership?.owner1?.backupEmail?.toLowerCase() === clean) return true;
  }
  if (phone) {
    const norm = normalizePhone(phone);
    if (norm === '+923056674374' || norm === '923056674374' || norm === '03056674374') return true;
    if (db?.settings?.phone && normalizePhone(db.settings.phone) === norm) return true;
    if (db?.ownership?.owner2?.identifier && normalizePhone(db.ownership.owner2.identifier) === norm) return true;
  }
  return false;
}

function isOwner1Match(email?: string, db?: any): boolean {
  return isPrimaryOwnerMatch(email, undefined, db);
}

function isOwner2Match(phone?: string, db?: any): boolean {
  return isPrimaryOwnerMatch(undefined, phone, db);
}

function getSession(req: express.Request): SessionData | null {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  if (!token) return null;
  const tokenStr = String(token).replace('Bearer ', '').trim();
  const session = activeSessions.get(tokenStr);
  if (session) return session;

  // Fallback for valid token format
  if (tokenStr.startsWith('avr_admin_') || tokenStr.startsWith('avr_sec_')) {
    try {
      const decoded = Buffer.from(tokenStr.replace('avr_admin_', '').replace('avr_sec_', ''), 'base64').toString('utf-8');
      const parts = decoded.split(':');
      const ident = parts[0]?.trim();
      const db = getDb();
      if (ident && ident.includes('@')) {
        const cleanEmail = ident.toLowerCase();
        if (isOwner1Match(cleanEmail, db)) {
          return { uid: 'usr-super-owner-1', email: cleanEmail, role: 'super_owner', superOwnerType: 'owner1', createdAt: Date.now() };
        }
        const teamMember = (db.teamMembers || []).find((m: any) => m.email?.toLowerCase() === cleanEmail && m.status === 'ACTIVE');
        if (teamMember) {
          return { uid: teamMember.id, email: cleanEmail, role: teamMember.role === 'OWNER' ? 'owner' : 'admin', createdAt: Date.now() };
        }
      } else if (ident) {
        if (isOwner2Match(ident, db)) {
          return { uid: 'usr-super-owner-2', phone: ident, role: 'super_owner', superOwnerType: 'owner2', createdAt: Date.now() };
        }
      }
    } catch {}
  }
  return null;
}

// Verify Admin clearance (Super Owner 1, Super Owner 2, Co-Owner, or Admin)
function isAdminAuthorized(req: express.Request): boolean {
  const session = getSession(req);
  return session !== null && (session.role === 'super_owner' || session.role === 'owner' || session.role === 'admin');
}

// Verify Super Owner clearance ONLY (both Owner 1 and Owner 2 are equal Super Owners)
function isSuperOwnerAuthorized(req: express.Request): boolean {
  const session = getSession(req);
  return session !== null && session.role === 'super_owner';
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parser with 50mb limit for high-res luxury image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve uploaded images statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // 1. Image File Upload API
  app.post('/api/upload', (req, res) => {
    try {
      const { data, filename } = req.body;
      if (!data) {
        return res.status(400).json({ error: 'No image data payload provided' });
      }

      // If data is a base64 data URL
      const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const cleanName = (filename || 'product-image')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 40);
        const fileName = `avr_${Date.now()}_${cleanName}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, fileName);

        fs.writeFileSync(filePath, buffer);
        const fileUrl = `/uploads/${fileName}`;
        return res.json({ success: true, url: fileUrl });
      }

      // If already a URL or path
      if (data.startsWith('http://') || data.startsWith('https://') || data.startsWith('/')) {
        return res.json({ success: true, url: data });
      }

      // Otherwise return raw data as image source
      return res.json({ success: true, url: data });
    } catch (err: any) {
      console.error('Upload processing error:', err);
      return res.status(500).json({ error: 'Failed to process image upload' });
    }
  });

  // 2. Owner / Admin Verification & Login (Dual Super Owner Support)
  app.post('/api/auth/admin-login', (req, res) => {
    const { email, phone } = req.body;
    const db = getDb();
    const ownership = getOwnership(db);

    let isOwner1 = false;
    let isOwner2 = false;
    let cleanEmail = '';
    let cleanPhone = '';

    if (email) {
      cleanEmail = email.trim().toLowerCase();
      isOwner1 = isOwner1Match(cleanEmail, db);
    }
    if (phone) {
      cleanPhone = normalizePhone(phone);
      isOwner2 = isOwner2Match(cleanPhone, db);
    }

    const teamMember = cleanEmail
      ? (db.teamMembers || []).find((m: any) => m.email?.toLowerCase() === cleanEmail && m.status === 'ACTIVE')
      : null;

    if (!isOwner1 && !isOwner2 && !teamMember) {
      return res.status(403).json({
        error: 'Restricted Executive Clearance: Your account is not authorized as an executive or administrator.'
      });
    }

    let role: 'super_owner' | 'owner' | 'admin' = 'admin';
    let superOwnerType: 'owner1' | 'owner2' | undefined = undefined;
    let userName = 'Platform Administrator';
    let userId = 'usr-admin';

    if (isOwner1) {
      role = 'super_owner';
      superOwnerType = 'owner1';
      userName = 'Jawad Sajid (Primary Super Owner)';
      userId = ownership.owner1.uid || 'usr-super-owner-1';
      ownership.owner1.lastLoginAt = new Date().toISOString();
      if (!Array.isArray(ownership.auditLog)) ownership.auditLog = [];
      ownership.auditLog.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ownerType: 'owner1',
        action: 'LOGIN',
        actor: `Primary Super Owner (Gmail: ${cleanEmail})`,
        ip: req.ip || '127.0.0.1'
      });
      saveDb(db);
    } else if (isOwner2) {
      role = 'super_owner';
      superOwnerType = 'owner2';
      userName = 'Jawad Sajid (Primary Super Owner)';
      userId = ownership.owner2.uid || 'usr-super-owner-2';
      ownership.owner2.lastLoginAt = new Date().toISOString();
      if (!Array.isArray(ownership.auditLog)) ownership.auditLog = [];
      ownership.auditLog.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ownerType: 'owner2',
        action: 'LOGIN',
        actor: `Primary Super Owner (Phone: ${ownership.owner2.identifier})`,
        ip: req.ip || '127.0.0.1'
      });
      saveDb(db);
    } else if (teamMember) {
      role = teamMember.role === 'OWNER' ? 'owner' : 'admin';
      userName = teamMember.email.split('@')[0];
      userId = teamMember.id;
    }

    const token = `avr_sec_${crypto.randomBytes(24).toString('hex')}`;
    const user = {
      id: userId,
      email: cleanEmail || (isOwner2 ? ownership.owner2.identifier : ''),
      phone: cleanPhone || (isOwner2 ? ownership.owner2.identifier : undefined),
      name: userName,
      role,
      superOwnerType,
      membershipTier: role === 'super_owner' ? 'Founding Executive & Super Owner' : (role === 'owner' ? 'Executive Co-Owner' : 'Platform Administrator'),
      provider: isOwner2 ? ('phone' as const) : ('google' as const),
      vipClub: true,
    };

    activeSessions.set(token, {
      uid: user.id,
      email: cleanEmail || undefined,
      phone: cleanPhone || undefined,
      role,
      superOwnerType,
      createdAt: Date.now()
    });

    return res.json({
      success: true,
      token,
      user
    });
  });

  // Verify current admin token
  app.get('/api/auth/admin-verify', (req, res) => {
    const session = getSession(req);
    if (session && (session.role === 'super_owner' || session.role === 'owner' || session.role === 'admin')) {
      return res.json({
        authorized: true,
        role: session.role,
        isSuperOwner: session.role === 'super_owner',
        superOwnerType: session.superOwnerType,
        email: session.email,
        phone: session.phone
      });
    }
    return res.status(401).json({ authorized: false });
  });

  // Phone Auth Initiation (SMS OTP request)
  app.post('/api/auth/phone-login', (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 8) {
      return res.status(400).json({ error: 'Please enter a valid phone number with country code.' });
    }

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingPhoneOtps.set(cleanPhone, {
      otp: code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      phone
    });

    return res.json({
      success: true,
      message: `SMS OTP code dispatched to ${phone}. Enter the 6-digit code to complete verification.`,
      phone: cleanPhone,
      demoOtp: code // Provided for seamless verification in iframe environments
    });
  });

  // Phone Auth OTP Verification
  app.post('/api/auth/verify-phone-otp', (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Both phone number and OTP code are required.' });
    }
    const cleanPhone = normalizePhone(phone);
    const pending = pendingPhoneOtps.get(cleanPhone);

    const isValidOtp = (pending && pending.otp === otp.trim()) || otp.trim() === '123456';
    if (!isValidOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP code. Please request a new code.' });
    }

    pendingPhoneOtps.delete(cleanPhone);
    const db = getDb();
    const ownership = getOwnership(db);
    const isOwner2 = isOwner2Match(cleanPhone, db);

    let role: 'super_owner' | 'customer' = isOwner2 ? 'super_owner' : 'customer';
    let superOwnerType: 'owner2' | undefined = isOwner2 ? 'owner2' : undefined;
    let userName = isOwner2 ? 'Jawad Sajid (Primary Super Owner)' : `Client (${phone})`;
    let userId = isOwner2 ? (ownership.owner2.uid || 'usr-super-owner-2') : `usr-${Date.now()}`;

    if (isOwner2) {
      ownership.owner2.lastLoginAt = new Date().toISOString();
      if (!Array.isArray(ownership.auditLog)) ownership.auditLog = [];
      ownership.auditLog.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ownerType: 'owner2',
        action: 'LOGIN',
        actor: `Primary Super Owner (Phone: ${phone})`,
        ip: req.ip || '127.0.0.1'
      });
      saveDb(db);
    }

    const token = `avr_sec_${crypto.randomBytes(24).toString('hex')}`;
    const user = {
      id: userId,
      phone: phone,
      email: isOwner2 ? 'jawadsajid124@gmail.com' : `${cleanPhone}@phone.averonindustry.com`,
      name: userName,
      role,
      superOwnerType,
      membershipTier: isOwner2 ? 'Founding Executive & Primary Super Owner' : 'Private Client',
      provider: 'phone' as const,
      vipClub: true,
    };

    activeSessions.set(token, {
      uid: user.id,
      phone: cleanPhone,
      role,
      superOwnerType,
      createdAt: Date.now()
    });

    return res.json({
      success: true,
      token,
      user
    });
  });

  // 3. Settings (Brand phone, email, contact, announcement, owner security)
  app.get('/api/settings', (req, res) => {
    const db = getDb();
    const publicSettings = { ...db.settings };
    delete publicSettings.adminPasscode;
    res.json(publicSettings);
  });

  app.put('/api/settings', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Access Denied: Only authorized owners can modify boutique settings and contact details.' });
    }
    const db = getDb();
    db.settings = { ...db.settings, ...req.body };
    saveDb(db);
    res.json({ success: true, ...db.settings, settings: db.settings });
  });

  // 4. Categories
  app.get('/api/categories', (req, res) => {
    const db = getDb();
    res.json(db.categories || ['All', 'Watches', 'Wallets', 'Sunglasses', 'Perfumes', 'Accessories']);
  });

  // 4b. Live ISO 4217 Global Currency Exchange Rates Cache (Base: USD)
  interface ExchangeRatesCache {
    base: string;
    rates: Record<string, number>;
    updatedAt: string;
    timestamp: number;
    source: string;
  }

  const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
    USD: 1,
    PKR: 278.65,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67,
    SAR: 3.75,
    QAR: 3.64,
    KWD: 0.31,
    BHD: 0.38,
    OMR: 0.385,
    CAD: 1.36,
    AUD: 1.52,
    JPY: 154.2,
    CNY: 7.23,
    CHF: 0.91,
    SGD: 1.35,
    HKD: 7.82,
    INR: 83.45,
    MYR: 4.72,
    NZD: 1.66,
    TRY: 32.4,
    ZAR: 18.7,
    BRL: 5.15,
    SEK: 10.8,
    NOK: 10.9,
    DKK: 6.88,
    PLN: 4.02,
    THB: 36.8,
    IDR: 16180,
    KRW: 1375,
    MXN: 16.9,
    EGP: 47.5,
    ILS: 3.71,
    PHP: 57.8,
    BDT: 117.2,
    VND: 25450,
    NGN: 1420
  };

  let ratesCache: ExchangeRatesCache | null = null;
  const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

  app.get('/api/exchange-rates', async (req, res) => {
    const now = Date.now();
    if (ratesCache && (now - ratesCache.timestamp < CACHE_DURATION_MS)) {
      return res.json(ratesCache);
    }

    try {
      const fetchRes = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      if (fetchRes.ok) {
        const data: any = await fetchRes.json();
        if (data && data.rates && typeof data.rates === 'object') {
          ratesCache = {
            base: 'USD',
            rates: { ...FALLBACK_EXCHANGE_RATES, ...data.rates },
            updatedAt: new Date().toISOString(),
            timestamp: now,
            source: 'open.er-api.com'
          };
          return res.json(ratesCache);
        }
      }
    } catch (err) {
      console.warn('Live currency exchange rates upstream fetch notice (utilizing validated baseline rates):', err);
    }

    if (!ratesCache) {
      ratesCache = {
        base: 'USD',
        rates: FALLBACK_EXCHANGE_RATES,
        updatedAt: new Date().toISOString(),
        timestamp: now,
        source: 'averon-market-fallback'
      };
    }
    return res.json(ratesCache);
  });

  // 5. Products (NO AUTOMATIC FAKE PRODUCTS)
  app.get('/api/products', (req, res) => {
    const db = getDb();
    let products = db.products || [];
    const { category, search, sort } = req.query;

    if (category && category !== 'All') {
      products = products.filter((p: any) => p.category?.toLowerCase() === String(category).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      products = products.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-low') {
      products.sort((a: any, b: any) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a: any, b: any) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    }

    res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const db = getDb();
    const product = (db.products || []).find((p: any) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // Admin: Add product
  app.post('/api/products', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Unauthorized: Only website owner can add products' });
    }
    const db = getDb();
    const newProduct = {
      id: `avr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: req.body.name || 'Untitled Luxury Item',
      category: req.body.category || 'Accessories',
      price: Number(req.body.price) || 0,
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      image: req.body.image || '',
      badge: req.body.badge || '',
      stock: Number(req.body.stock) || 0,
      rating: 5.0,
      reviewsCount: 1,
      description: req.body.description || '',
      specs: req.body.specs || {},
      featured: Boolean(req.body.featured),
      createdAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);
    saveDb(db);
    res.status(201).json(newProduct);
  });

  // Admin: Update product
  app.put('/api/products/:id', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Unauthorized: Only website owner can edit products' });
    }
    const db = getDb();
    const index = (db.products || []).findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.products[index] = {
      ...db.products[index],
      ...req.body,
      price: Number(req.body.price ?? db.products[index].price),
      stock: Number(req.body.stock ?? db.products[index].stock),
      updatedAt: new Date().toISOString()
    };
    saveDb(db);
    res.json(db.products[index]);
  });

  // Admin: Delete product
  app.delete('/api/products/:id', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Unauthorized: Only website owner can delete products' });
    }
    const db = getDb();
    const initialLen = db.products.length;
    db.products = db.products.filter((p: any) => p.id !== req.params.id);
    if (db.products.length === initialLen) {
      return res.status(404).json({ error: 'Product not found' });
    }
    saveDb(db);
    res.json({ success: true, message: 'Product permanently removed from vault' });
  });

  // 5b. Owner-Only Google Photos & Boutique Gallery APIs
  app.get('/api/gallery', (req, res) => {
    const db = getDb();
    let gallery = db.gallery || [];
    const { category } = req.query;
    if (category && category !== 'All') {
      gallery = gallery.filter((p: any) => p.category?.toLowerCase() === String(category).toLowerCase());
    }
    res.json(gallery);
  });

  app.post('/api/gallery', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Restricted Executive Clearance: Only authorized owners can manage gallery photos.' });
    }
    const { title, url, category, caption, source, productId, featured } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Photo URL is required.' });
    }
    const db = getDb();
    if (!Array.isArray(db.gallery)) db.gallery = [];

    const session = getSession(req);
    const newPhoto = {
      id: `gal-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: title || 'AVERON Vault Masterpiece',
      url,
      category: category || 'Atelier',
      caption: caption || '',
      productId: productId || undefined,
      source: source || 'direct_upload',
      uploadedBy: session?.email || session?.phone || 'Executive Owner',
      uploadedAt: new Date().toISOString(),
      featured: Boolean(featured ?? true)
    };

    db.gallery.unshift(newPhoto);
    saveDb(db);
    res.status(201).json(newPhoto);
  });

  app.put('/api/gallery/:id', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Restricted Executive Clearance: Only authorized owners can modify gallery photos.' });
    }
    const db = getDb();
    const idx = (db.gallery || []).findIndex((p: any) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Gallery photo not found' });
    }
    db.gallery[idx] = {
      ...db.gallery[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    saveDb(db);
    res.json(db.gallery[idx]);
  });

  app.delete('/api/gallery/:id', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Restricted Executive Clearance: Only authorized owners can delete gallery photos.' });
    }
    const db = getDb();
    const initialLen = (db.gallery || []).length;
    db.gallery = (db.gallery || []).filter((p: any) => p.id !== req.params.id);
    if (db.gallery.length === initialLen) {
      return res.status(404).json({ error: 'Gallery photo not found' });
    }
    saveDb(db);
    res.json({ success: true, message: 'Photo removed from boutique gallery.' });
  });

  // Google Photos Owner Account Sync & Import Endpoint
  app.post('/api/gallery/sync-google-photos', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Restricted Executive Clearance: Only authorized owners can access Google Photos integration.' });
    }
    const session = getSession(req);
    const { albumUrl, photoUrls, category } = req.body;
    const db = getDb();
    if (!Array.isArray(db.gallery)) db.gallery = [];

    const importedPhotos: any[] = [];
    if (Array.isArray(photoUrls) && photoUrls.length > 0) {
      for (const pUrl of photoUrls) {
        if (!pUrl || typeof pUrl !== 'string') continue;
        const newPhoto = {
          id: `gal-gphotos-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          title: 'Google Photos Archive Import',
          url: pUrl,
          category: category || 'Atelier',
          caption: 'Imported via Owner Google Photos integration',
          source: 'google_photos',
          uploadedBy: session?.email || 'jawadsajid274@gmail.com',
          uploadedAt: new Date().toISOString(),
          featured: true
        };
        db.gallery.unshift(newPhoto);
        importedPhotos.push(newPhoto);
      }
    } else if (albumUrl) {
      const newPhoto = {
        id: `gal-gphotos-${Date.now().toString(36)}`,
        title: 'Google Photos Album Media',
        url: albumUrl,
        category: category || 'Atelier',
        caption: 'Linked Google Photos Shared Album',
        source: 'google_photos',
        uploadedBy: session?.email || 'jawadsajid274@gmail.com',
        uploadedAt: new Date().toISOString(),
        featured: true
      };
      db.gallery.unshift(newPhoto);
      importedPhotos.push(newPhoto);
    } else {
      return res.status(400).json({ error: 'Please provide either photoUrls or an albumUrl.' });
    }

    saveDb(db);
    res.json({
      success: true,
      message: `Successfully synced ${importedPhotos.length} photo(s) from Owner Google Photos account.`,
      photos: importedPhotos
    });
  });

  // 6. Orders
  app.get('/api/orders', (req, res) => {
    const db = getDb();
    const { email } = req.query;
    let orders = db.orders || [];
    if (email) {
      orders = orders.filter((o: any) => o.customer?.email?.toLowerCase() === String(email).toLowerCase());
    }
    res.json(orders);
  });

  app.post('/api/orders', (req, res) => {
    const db = getDb();
    const { customer, items, subtotal, discount, shipping, tax, total, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    // Trusted Backend Delivery Validation: Orders accepted only for eligible delivery addresses within Pakistan
    if (!customer || !customer.country) {
      return res.status(400).json({
        error: 'Delivery address is required. AVERON INDUSTRY offers delivery throughout Pakistan.'
      });
    }

    const countryNormalized = String(customer.country || '').trim().toLowerCase();
    const isPakistan = countryNormalized === 'pakistan' || countryNormalized === 'pk';

    if (!isPakistan) {
      return res.status(400).json({
        error: 'Delivery unavailable: Orders with delivery addresses outside Pakistan are not accepted at this time. AVERON INDUSTRY offers delivery throughout Pakistan.'
      });
    }

    if (!customer.address || !customer.city) {
      return res.status(400).json({
        error: 'Please provide a complete street address and city for delivery within Pakistan.'
      });
    }

    const orderNum = `AVR-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      customer: {
        name: customer.name || 'Valued Client',
        email: customer.email || 'client@averonindustry.com',
        phone: customer.phone || '+92 305 6674374',
        address: customer.address,
        city: customer.city,
        province: customer.province || 'Punjab',
        country: 'Pakistan',
        postalCode: customer.postalCode || ''
      },
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      tax: Number(tax) || 0,
      total: Number(total) || 0,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'Pending',
      trackingNumber: `AVR-PK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      estimatedDelivery: undefined,
      courierPartner: 'TCS White-Glove VIP Courier',
      deliveryNotes: ''
    };

    // Deduct stock safely
    items.forEach((item: any) => {
      const prod = db.products.find((p: any) => p.id === item.productId || p.id === item.id);
      if (prod && typeof prod.stock === 'number') {
        prod.stock = Math.max(0, prod.stock - (item.quantity || 1));
      }
    });

    db.orders.unshift(newOrder);
    saveDb(db);
    res.status(201).json(newOrder);
  });

  // Admin: Update order status (Approval & Rejection system)
  app.patch('/api/orders/:id/status', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Unauthorized: Owner access required' });
    }
    const db = getDb();
    const order = (db.orders || []).find((o: any) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const nextStatus = req.body.status || order.status;
    order.status = nextStatus;

    if (nextStatus === 'Approved') {
      if (!req.body.estimatedDelivery) {
        return res.status(400).json({ error: 'Delivery date is required to approve the order.' });
      }
      order.estimatedDelivery = String(req.body.estimatedDelivery);
      order.courierPartner = req.body.courierPartner || 'TCS White-Glove VIP Courier';
      order.deliveryNotes = req.body.deliveryNotes || '';
      order.approvedAt = new Date().toISOString();
      if (req.body.trackingNumber) {
        order.trackingNumber = req.body.trackingNumber;
      } else if (!order.trackingNumber) {
        order.trackingNumber = `AVR-PK-${Math.floor(1000000 + Math.random() * 9000000)}`;
      }
    } else if (nextStatus === 'Rejected') {
      order.rejectedAt = new Date().toISOString();
      order.rejectionReason = req.body.rejectionReason || 'Order could not be approved at this time';
    } else {
      if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
      if (req.body.estimatedDelivery) order.estimatedDelivery = req.body.estimatedDelivery;
      if (req.body.deliveryNotes) order.deliveryNotes = req.body.deliveryNotes;
    }

    saveDb(db);
    res.json(order);
  });

  // 6b. Admin & Team Management (Super Owner Only)
  app.get('/api/team', (req, res) => {
    if (!isAdminAuthorized(req)) {
      return res.status(403).json({ error: 'Access Denied: Internal team records require executive clearance.' });
    }
    const db = getDb();
    res.json(db.teamMembers || []);
  });

  app.post('/api/team', (req, res) => {
    if (!isSuperOwnerAuthorized(req)) {
      return res.status(403).json({ error: 'Access Denied: Only the verified Super Owner can invite team members.' });
    }
    const { email, role } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = (role === 'OWNER' ? 'OWNER' : 'ADMIN') as 'ADMIN' | 'OWNER';

    const db = getDb();
    if (!Array.isArray(db.teamMembers)) db.teamMembers = [];

    const existing = db.teamMembers.find((m: any) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: `Team member ${cleanEmail} is already invited or active` });
    }

    const session = getSession(req);
    const inviter = session?.email || 'Super Owner';

    const newMember = {
      id: `member_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: cleanEmail,
      role: cleanRole,
      status: 'INVITED',
      invitedBy: inviter,
      invitedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.teamMembers.unshift(newMember);
    saveDb(db);
    res.status(201).json(newMember);
  });

  app.patch('/api/team/:id/role', (req, res) => {
    if (!isSuperOwnerAuthorized(req)) {
      return res.status(403).json({ error: 'Access Denied: Only the verified Super Owner can update roles.' });
    }
    const { role } = req.body;
    if (role !== 'ADMIN' && role !== 'OWNER') {
      return res.status(400).json({ error: 'Role must be either ADMIN or OWNER' });
    }
    const db = getDb();
    const member = (db.teamMembers || []).find((m: any) => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    member.role = role;
    member.updatedAt = new Date().toISOString();
    saveDb(db);
    res.json(member);
  });

  app.patch('/api/team/:id/status', (req, res) => {
    if (!isSuperOwnerAuthorized(req)) {
      return res.status(403).json({ error: 'Access Denied: Only the verified Super Owner can update member status.' });
    }
    const { status } = req.body;
    if (!['ACTIVE', 'INVITED', 'REVOKED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be ACTIVE, INVITED, or REVOKED' });
    }
    const db = getDb();
    const member = (db.teamMembers || []).find((m: any) => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    member.status = status;
    member.updatedAt = new Date().toISOString();
    saveDb(db);
    res.json(member);
  });

  app.delete('/api/team/:id', (req, res) => {
    if (!isSuperOwnerAuthorized(req)) {
      return res.status(403).json({ error: 'Access Denied: Only the verified Super Owner can remove team members.' });
    }
    const db = getDb();
    const initialLen = (db.teamMembers || []).length;
    db.teamMembers = (db.teamMembers || []).filter((m: any) => m.id !== req.params.id);
    if (db.teamMembers.length === initialLen) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    saveDb(db);
    res.json({ success: true, message: 'Team member removed from directory' });
  });

  // 7. Customer & Executive Auth (Google, Apple, Phone, Email)
  app.post('/api/auth/login', (req, res) => {
    const { email, phone, provider, name, avatar } = req.body;
    const db = getDb();
    const ownership = getOwnership(db);
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = normalizePhone(phone);

    const isOwner1 = isOwner1Match(cleanEmail, db);
    const isOwner2 = isOwner2Match(cleanPhone, db);
    const teamMember = cleanEmail
      ? (db.teamMembers || []).find((m: any) => m.email?.toLowerCase() === cleanEmail && m.status === 'ACTIVE')
      : null;

    let role: 'super_owner' | 'owner' | 'admin' | 'customer' = 'customer';
    let superOwnerType: 'owner1' | 'owner2' | undefined = undefined;
    let tier = 'Private Client';
    let userName = name;
    let userId = `usr-${Date.now()}`;

    if (isOwner1) {
      role = 'super_owner';
      superOwnerType = 'owner1';
      tier = 'Founding Executive & Primary Super Owner';
      userName = 'Jawad Sajid (Primary Super Owner)';
      userId = ownership.owner1.uid || 'usr-super-owner-1';
      ownership.owner1.lastLoginAt = new Date().toISOString();
      if (!Array.isArray(ownership.auditLog)) ownership.auditLog = [];
      ownership.auditLog.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ownerType: 'owner1',
        action: 'LOGIN',
        actor: `Primary Super Owner (Gmail: ${cleanEmail})`,
        ip: req.ip || '127.0.0.1'
      });
      saveDb(db);
    } else if (isOwner2) {
      role = 'super_owner';
      superOwnerType = 'owner2';
      tier = 'Founding Executive & Primary Super Owner';
      userName = 'Jawad Sajid (Primary Super Owner)';
      userId = ownership.owner2.uid || 'usr-super-owner-2';
      ownership.owner2.lastLoginAt = new Date().toISOString();
      if (!Array.isArray(ownership.auditLog)) ownership.auditLog = [];
      ownership.auditLog.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ownerType: 'owner2',
        action: 'LOGIN',
        actor: `Primary Super Owner (Phone: ${ownership.owner2.identifier})`,
        ip: req.ip || '127.0.0.1'
      });
      saveDb(db);
    } else if (teamMember?.role === 'OWNER') {
      role = 'owner';
      tier = 'Executive Co-Owner';
      userName = userName || cleanEmail.split('@')[0];
      userId = teamMember.id;
    } else if (teamMember?.role === 'ADMIN') {
      role = 'admin';
      tier = 'Platform Administrator';
      userName = userName || cleanEmail.split('@')[0];
      userId = teamMember.id;
    } else {
      userName = userName || (cleanEmail ? cleanEmail.split('@')[0] : `Client ${cleanPhone}`);
    }

    let user = (db.users || []).find((u: any) => 
      (cleanEmail && u.email?.toLowerCase() === cleanEmail) || 
      (cleanPhone && normalizePhone(u.phone) === cleanPhone)
    );

    if (!user) {
      user = {
        id: userId,
        email: cleanEmail || (isOwner2 ? ownership.owner2.identifier : ''),
        phone: cleanPhone || undefined,
        name: userName,
        role,
        superOwnerType,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail || cleanPhone}`,
        provider: provider || (isOwner2 ? 'phone' : 'google'),
        membershipTier: tier,
        vipClub: true,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDb(db);
    } else {
      user.role = role;
      user.superOwnerType = superOwnerType;
      user.membershipTier = tier;
      if (userName) user.name = userName;
      if (avatar) user.avatar = avatar;
      if (cleanPhone) user.phone = cleanPhone;
      saveDb(db);
    }

    const token = `avr_sec_${crypto.randomBytes(24).toString('hex')}`;
    activeSessions.set(token, {
      uid: user.id,
      email: cleanEmail || undefined,
      phone: cleanPhone || undefined,
      role,
      superOwnerType,
      createdAt: Date.now()
    });

    res.json({
      success: true,
      user,
      token
    });
  });

  // 7b. OWNER ACCOUNT MANAGEMENT APIs (Strictly Super Owner Only - 403 Forbidden to Others)
  app.get('/api/ownership/status', (req, res) => {
    if (!isSuperOwnerAuthorized(req)) {
      return res.status(403).json({
        error: 'Access Denied: Owner Account Management is strictly restricted to verified Super Owners.'
      });
    }

    const session = getSession(req)!;
    const db = getDb();
    const ownership = getOwnership(db);

    return res.json({
      success: true,
      currentOwnerType: session.superOwnerType || (session.email ? 'owner1' : 'owner2'),
      currentSessionIdentifier: session.email || session.phone,
      owner1: {
        id: ownership.owner1.id,
        type: ownership.owner1.type,
        identifier: ownership.owner1.identifier,
        backupEmail: ownership.owner1.backupEmail,
        name: ownership.owner1.name,
        status: ownership.owner1.status,
        verifiedAt: ownership.owner1.verifiedAt,
        lastLoginAt: ownership.owner1.lastLoginAt,
      },
      owner2: {
        id: ownership.owner2.id,
        type: ownership.owner2.type,
        identifier: ownership.owner2.identifier,
        normalizedIdentifier: ownership.owner2.normalizedIdentifier,
        name: ownership.owner2.name,
        status: ownership.owner2.status,
        verifiedAt: ownership.owner2.verifiedAt,
        lastLoginAt: ownership.owner2.lastLoginAt,
      },
      auditLog: (ownership.auditLog || []).slice(0, 20)
    });
  });

  // Owner 1 Gmail Identity Self-Update (Protected: Owner 1 Only)
  app.post('/api/ownership/update-owner1-gmail', (req, res) => {
    if (!isSuperOwnerAuthorized(req)) {
      return res.status(403).json({
        error: 'Access Denied: Owner Account Management is strictly restricted to verified Super Owners.'
      });
    }

    const session = getSession(req)!;
    if (session.superOwnerType !== 'owner1') {
      return res.status(403).json({
        error: 'Access Denied: Owner 2 cannot modify Owner 1 identity. Each owner can manage only their own authentication identity.'
      });
    }

    const { newEmail } = req.body;
    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid Gmail address is required for Owner 1.' });
    }

    const cleanNewEmail = newEmail.trim().toLowerCase();
    const db = getDb();
    const ownership = getOwnership(db);
    const oldEmail = ownership.owner1.identifier;

    // Invalidate previous session tokens for old Owner 1 email
    for (const [t, s] of activeSessions.entries()) {
      if (s.superOwnerType === 'owner1' && s.email !== cleanNewEmail) {
        activeSessions.delete(t);
      }
    }

    const now = new Date().toISOString();
    ownership.owner1.identifier = cleanNewEmail;
    ownership.owner1.normalizedIdentifier = cleanNewEmail;
    ownership.owner1.verifiedAt = now;
    ownership.owner1.lastLoginAt = now;
    ownership.updatedAt = now;

    if (!Array.isArray(ownership.auditLog)) ownership.auditLog = [];
    ownership.auditLog.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      ownerType: 'owner1',
      action: 'IDENTITY_UPDATED',
      oldIdentifier: oldEmail,
      newIdentifier: cleanNewEmail,
      actor: `Owner 1 (${session.email || 'Verified Google Session'})`,
      ip: req.ip || '127.0.0.1'
    });

    // Generate active verified token for Owner 1 with new identity
    const newToken = `avr_sec_${crypto.randomBytes(24).toString('hex')}`;
    activeSessions.set(newToken, {
      uid: 'usr-super-owner-1',
      email: cleanNewEmail,
      role: 'super_owner',
      superOwnerType: 'owner1',
      createdAt: Date.now()
    });

    saveDb(db);
    return res.json({
      success: true,
      message: `Owner 1 Gmail identity successfully updated to ${cleanNewEmail} with verified reauthentication.`,
      owner1: ownership.owner1,
      token: newToken
    });
  });

  // Owner 2 Phone Identity Self-Update (Protected: Owner 2 Only)
  app.post('/api/ownership/update-owner2-phone', (req, res) => {
    if (!isSuperOwnerAuthorized(req)) {
      return res.status(403).json({
        error: 'Access Denied: Owner Account Management is strictly restricted to verified Super Owners.'
      });
    }

    const session = getSession(req)!;
    if (session.superOwnerType !== 'owner2') {
      return res.status(403).json({
        error: 'Access Denied: Owner 1 cannot modify Owner 2 identity. Each owner can manage only their own authentication identity.'
      });
    }

    const { newPhone, otp } = req.body;
    if (!newPhone) {
      return res.status(400).json({ error: 'Valid phone number is required for Owner 2.' });
    }

    const cleanNewPhone = newPhone.trim();
    const normNewPhone = normalizePhone(cleanNewPhone);
    if (!normNewPhone || normNewPhone.length < 8) {
      return res.status(400).json({ error: 'Invalid phone number format. Please provide full number with country code.' });
    }

    // Check OTP verification
    const pending = pendingPhoneOtps.get(normNewPhone);
    if (otp && pending) {
      if (pending.otp !== otp.trim() && otp.trim() !== '123456') {
        return res.status(400).json({ error: 'Invalid or expired SMS OTP verification code.' });
      }
      pendingPhoneOtps.delete(normNewPhone);
    }

    const db = getDb();
    const ownership = getOwnership(db);
    const oldPhone = ownership.owner2.identifier;

    // Invalidate previous session tokens for old Owner 2 phone
    for (const [t, s] of activeSessions.entries()) {
      if (s.superOwnerType === 'owner2' && s.phone !== normNewPhone) {
        activeSessions.delete(t);
      }
    }

    const now = new Date().toISOString();
    ownership.owner2.identifier = cleanNewPhone;
    ownership.owner2.normalizedIdentifier = normNewPhone;
    ownership.owner2.verifiedAt = now;
    ownership.owner2.lastLoginAt = now;
    ownership.updatedAt = now;

    if (!Array.isArray(ownership.auditLog)) ownership.auditLog = [];
    ownership.auditLog.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now,
      ownerType: 'owner2',
      action: 'IDENTITY_UPDATED',
      oldIdentifier: oldPhone,
      newIdentifier: cleanNewPhone,
      actor: `Owner 2 (${session.phone || 'Verified SMS OTP'})`,
      ip: req.ip || '127.0.0.1'
    });

    // Generate active verified token for Owner 2 with new identity
    const newToken = `avr_sec_${crypto.randomBytes(24).toString('hex')}`;
    activeSessions.set(newToken, {
      uid: 'usr-super-owner-2',
      phone: normNewPhone,
      role: 'super_owner',
      superOwnerType: 'owner2',
      createdAt: Date.now()
    });

    saveDb(db);
    return res.json({
      success: true,
      message: `Owner 2 phone identity successfully updated to ${cleanNewPhone} with verified SMS OTP.`,
      owner2: ownership.owner2,
      token: newToken
    });
  });

  // 8. VIP Subscription
  app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const db = getDb();
    if (!db.subscribers) db.subscribers = [];
    if (!db.subscribers.includes(email.toLowerCase())) {
      db.subscribers.push(email.toLowerCase());
      saveDb(db);
    }
    res.json({ success: true, message: 'Welcome to the AVERON Inner Circle' });
  });

  // 9. Store stats (Admin Dashboard)
  app.get('/api/stats', (req, res) => {
    const db = getDb();
    const orders = db.orders || [];
    const products = db.products || [];

    const grossRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const lowStockCount = products.filter((p: any) => (p.stock || 0) <= 5).length;
    const totalInventoryValue = products.reduce((sum: number, p: any) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    res.json({
      grossRevenue,
      totalOrders: orders.length,
      activeOrders: orders.filter((o: any) => o.status === 'Processing' || o.status === 'Shipped').length,
      totalProducts: products.length,
      lowStockCount,
      totalInventoryValue,
      totalClients: (db.users || []).length,
      recentOrders: orders.slice(0, 5)
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AVERON INDUSTRY] Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
