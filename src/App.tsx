/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Watch, 
  Wallet, 
  Glasses, 
  Droplets, 
  Gem, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Compass,
  ArrowRight,
  PackageX,
  Plus,
  Shield,
  Layers,
  Crown
} from 'lucide-react';
import { 
  Product, 
  CartItem, 
  Order, 
  User, 
  StoreSettings,
  GalleryPhoto
} from './types/index.ts';
import { checkOwnershipStatus } from './lib/firebase.ts';
import { CurrencySelectorModal } from './components/CurrencySelectorModal.tsx';
import { detectUserCurrency } from './lib/currency.ts';
import { PREVIEW_DEMO_PRODUCTS, isPreviewEnvironment } from './data/demoProducts.ts';

// Components
import { MouseGlow } from './components/MouseGlow.tsx';
import { AnimatedBackground } from './components/AnimatedBackground.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductModal } from './components/ProductModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AccountDashboard } from './components/AccountDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ConciergeModal } from './components/ConciergeModal.tsx';
import { AccessDenied } from './components/AccessDenied.tsx';
import { DeliverySection } from './components/DeliverySection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { EditEmailsModal } from './components/EditEmailsModal.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([
    'All',
    'Watches',
    'Wallets',
    'Sunglasses',
    'Perfumes',
    'Accessories'
  ]);
  const [settings, setSettings] = useState<StoreSettings>({
    brandName: 'AVERON INDUSTRY',
    tagline: 'ELEVATE YOUR PRESENCE',
    phone: '+92 305 6674374',
    intlPhone: '+92 305 6674374',
    email: 'concierge@averonindustry.com',
    supportEmail: 'concierge@averonindustry.com',
    address: '740 Fifth Avenue, Haute Horlogerie District, New York, NY 10019',
    flagship2: 'Fashion Avenue, The Dubai Mall, Level 1, Dubai, UAE',
    announcement: 'ELEVATE YOUR PRESENCE — DELIVERY AVAILABLE ALL OVER PAKISTAN',
    currency: 'USD',
    taxRate: 0.08,
    whatsapp: '+92 305 6674374',
    ownerEmail: 'jawadsajid274@gmail.com'
  });

  // Client Session & UI States
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [loading, setLoading] = useState(true);

  // Gallery State
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);

  // Modals & Panels
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscountPercent, setCheckoutDiscountPercent] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isEditEmailsOpen, setIsEditEmailsOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Listen for /admin or #admin protected navigation
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || path === '/admin') {
        setIsAdminRoute(true);
      } else {
        setIsAdminRoute(false);
      }
    };
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  // Initial Fetch, Exchange Rates & Ownership check
  useEffect(() => {
    loadAllData();
    checkSuperOwnership();

    // Auto-detect visitor currency from country/locale or restore saved preference
    const detectedCurrency = detectUserCurrency();
    setCurrency(detectedCurrency);

    // Fetch live ISO 4217 exchange rates from server cache
    fetch('/api/exchange-rates')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch((err) => console.warn('Currency rates fetch notice:', err));

    try {
      const savedCart = localStorage.getItem('averon_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('averon_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedUser = localStorage.getItem('averon_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.warn('Storage restore error:', e);
    }
  }, []);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem('averon_currency', newCurrency);
    } catch {}
    showToast(`Currency converted to ${newCurrency}`);
  };

  const checkSuperOwnership = async () => {
    try {
      await checkOwnershipStatus();
    } catch (e) {
      console.warn('Could not verify ownership status on load:', e);
    }
  };

  // Save Cart & Wishlist persistence
  useEffect(() => {
    try {
      localStorage.setItem('averon_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('averon_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('averon_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('averon_user');
      }
    } catch (e) {}
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, settRes, catRes, galRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/settings'),
        fetch('/api/categories'),
        fetch('/api/gallery')
      ]);
      const [prodData, settData, catData, galData] = await Promise.all([
        prodRes.json(),
        settRes.json(),
        catRes.json(),
        galRes.json()
      ]);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setSettings(settData || {});
      if (catData && catData.length) setCategories(catData);
      if (Array.isArray(galData)) setGalleryPhotos(galData);
    } catch (err) {
      console.error('Error loading initial store data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Owner Email Configuration Save Handler
  const handleSaveEmails = async (updated: Partial<StoreSettings>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('averon_admin_token') || '';
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const resData = await res.json();
        const savedSettings = resData.settings || resData;
        setSettings((prev) => ({ ...prev, ...savedSettings }));
        showToast('Official Contact & Concierge emails updated');
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Failed to update email addresses');
        return false;
      }
    } catch (e) {
      console.error('Error saving emails:', e);
      showToast('Network error while updating emails');
      return false;
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, engraving?: string, giftWrapping?: boolean) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.engraving === engraving && item.giftWrapping === giftWrapping
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, engraving, giftWrapping }];
    });
    showToast(`Added ${product.name} to Shopping Bag`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Instant Buy from Modal
  const handleBuyNow = (product: Product, quantity = 1, engraving?: string, giftWrapping?: boolean) => {
    handleAddToCart(product, quantity, engraving, giftWrapping);
    setInspectProduct(null);
    setCheckoutDiscountPercent(0);
    setIsCheckoutOpen(true);
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from Curated Wishlist' : 'Saved to Curated Wishlist');
      return next;
    });
  };

  // Checkout flow
  const handleOpenCheckout = (discountPercent: number) => {
    setCheckoutDiscountPercent(discountPercent);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (order: Order) => {
    setCart([]);
    loadAllData();
    showToast(`Order ${order.orderNumber} Confirmed!`);
  };

  // Absolute production separation for preview demo products:
  // Demo products appear strictly in dev/preview/sandbox environments when no live database products exist
  const isPreview = isPreviewEnvironment();
  const activeProducts = (products.length === 0 && isPreview) ? PREVIEW_DEMO_PRODUCTS : products;
  const isUsingDemoProducts = products.length === 0 && isPreview;

  // Filtered & Sorted Products
  const displayedProducts = activeProducts
    .filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistProducts = activeProducts.filter((p) => wishlist.includes(p.id));

  // Category Icon helper
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'watches':
        return <Watch className="w-4 h-4" />;
      case 'wallets':
        return <Wallet className="w-4 h-4" />;
      case 'sunglasses':
        return <Glasses className="w-4 h-4" />;
      case 'perfumes':
        return <Droplets className="w-4 h-4" />;
      case 'accessories':
        return <Gem className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  // Featured Product for Hero
  const heroFeaturedProduct = activeProducts.find((p) => p.featured) || activeProducts[0] || null;

  return (
    <div className="relative min-h-screen bg-[#07080C] text-slate-100 flex flex-col selection:bg-cyan-400 selection:text-black">
      
      {/* 1. Electric-Blue Mouse-Follow Glow Effect */}
      <MouseGlow />

      {/* 2. Live Animated Dark Background with Subtle Glowing Particles */}
      <AnimatedBackground />

      {/* 3. Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 px-5 rounded-xl luxury-glass border border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.4)] text-xs font-tech text-cyan-300 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}



      {/* 4. Luxury Navigation Header */}
      <Navbar
        settings={settings}
        user={user}
        cartCount={cartItemsCount}
        wishlistCount={wishlist.length}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => {
          if (user) setIsAccountOpen(true);
          else setIsAuthOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('averon_user');
          localStorage.removeItem('averon_admin_token');
          showToast('Signed out of AVERON session');
        }}
        currency={currency}
        onChangeCurrency={handleCurrencyChange}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 5. Hero Section (Dynamic Product Showcase or Vault Emblem) */}
      <Hero
        featuredProduct={heroFeaturedProduct}
        currency={currency}
        exchangeRates={exchangeRates}
        user={user}
        onExplore={() => {
          const el = document.getElementById('catalog-section') || document.getElementById('delivery-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onQuickView={setInspectProduct}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 6. Interactive Category Navigation Bar */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 w-full">
        <div className="luxury-glass p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-800/80 shadow-[0_0_25px_rgba(0,0,0,0.5)] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
            const count =
              cat === 'All'
                ? activeProducts.length
                : activeProducts.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg font-tech text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.35)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 7. Product Catalog Gallery (Displayed when catalog items or search results exist) */}
      {displayedProducts.length > 0 ? (
        <section id="catalog-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
          {/* Section Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-tech text-cyan-400 text-xs uppercase tracking-[0.25em] font-semibold">
                  CURATED ACQUISITIONS
                </span>
                {isUsingDemoProducts && (
                  <span className="ml-2 text-[10px] font-tech text-slate-400 border border-slate-700 bg-slate-900/80 px-2 py-0.5 rounded-full">
                    Preview Demonstration · Isolated from DB
                  </span>
                )}
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-wide">
                {activeCategory === 'All' ? 'Boutique Collection' : `${activeCategory} Collection`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-sans">
                Displaying {displayedProducts.length} authentic pieces engineered with metallurgical mastery.
              </p>
            </div>

            {/* Controls: Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-tech">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 uppercase text-[10px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer uppercase tracking-wider text-xs"
                >
                  <option value="featured" className="bg-[#0b0f19]">Featured Sovereign</option>
                  <option value="price-low" className="bg-[#0b0f19]">Price: Low to High</option>
                  <option value="price-high" className="bg-[#0b0f19]">Price: High to Low</option>
                  <option value="rating" className="bg-[#0b0f19]">VIP Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                exchangeRates={exchangeRates}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={setInspectProduct}
                onAddToCart={(p) => handleAddToCart(p, 1)}
              />
            ))}
          </div>
        </section>
      ) : searchQuery || (activeCategory !== 'All' && activeProducts.length > 0) ? (
        <section id="catalog-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full text-center">
          <p className="text-sm text-slate-400 font-sans">
            No pieces currently match {searchQuery ? `"${searchQuery}"` : `the ${activeCategory} category`}.{' '}
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="text-cyan-400 hover:underline font-tech uppercase tracking-wider ml-1"
            >
              View all collections
            </button>
          </p>
        </section>
      ) : null}

      {/* 8. Owner-Integrated Google Photos & Vault Gallery */}
      <GallerySection
        photos={galleryPhotos}
        user={user}
        onOpenOwnerGallery={() => setIsAdminOpen(true)}
      />

      {/* 9. Dedicated Nationwide Delivery Section */}
      <DeliverySection settings={settings} />

      {/* 10. Dedicated Official Contact Section with Owner Edit Trigger */}
      <ContactSection
        settings={settings}
        user={user}
        onOpenEditEmails={() => setIsEditEmailsOpen(true)}
      />

      {/* 10. Footer with Direct Authentication Access */}
      <Footer
        settings={settings}
        user={user}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalog-section') || document.getElementById('delivery-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => {
          if (user) setIsAccountOpen(true);
          else setIsAuthOpen(true);
        }}
      />

      {/* 10. Modals & Portals */}
      
      {/* Product Inspection Modal */}
      <ProductModal
        product={inspectProduct}
        currency={currency}
        exchangeRates={exchangeRates}
        isWishlisted={inspectProduct ? wishlist.includes(inspectProduct.id) : false}
        onClose={() => setInspectProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        currency={currency}
        exchangeRates={exchangeRates}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleOpenCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cart}
        discountPercent={checkoutDiscountPercent}
        currency={currency}
        exchangeRates={exchangeRates}
        user={user}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Authentication Modal (Google, Apple ID, Email & Password, SMS OTP, Verification) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          showToast(`Welcome, ${loggedInUser.name}`);
        }}
      />

      {/* Customer Account Dashboard */}
      <AccountDashboard
        isOpen={isAccountOpen}
        user={user}
        currency={currency}
        exchangeRates={exchangeRates}
        wishlistProducts={wishlistProducts}
        onClose={() => setIsAccountOpen(false)}
        onLogout={() => {
          setUser(null);
          setIsAccountOpen(false);
          localStorage.removeItem('averon_user');
          localStorage.removeItem('averon_admin_token');
          showToast('Signed out of AVERON session');
        }}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onRemoveFromWishlist={handleToggleWishlist}
      />

      {/* Worldwide ISO 4217 Currency Selector Modal */}
      <CurrencySelectorModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentCurrency={currency}
        onSelectCurrency={handleCurrencyChange}
        exchangeRates={exchangeRates}
      />

      {/* Access Denied Gate for unauthorized visitors accessing /admin or #admin */}
      {((isAdminRoute || isAdminOpen) && (!user || (user.role !== 'super_owner' && user.role !== 'owner' && user.role !== 'admin'))) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
          <AccessDenied
            onReturnHome={() => {
              setIsAdminRoute(false);
              setIsAdminOpen(false);
              if (window.location.hash === '#admin') window.location.hash = '';
            }}
            onSignIn={() => {
              setIsAdminRoute(false);
              setIsAdminOpen(false);
              if (window.location.hash === '#admin') window.location.hash = '';
              setIsAuthOpen(true);
            }}
            attemptedPath="/admin"
          />
        </div>
      )}

      {/* Fully Functional Secure Owner Admin Dashboard */}
      <AdminDashboard
        isOpen={(isAdminOpen || isAdminRoute) && Boolean(user && (user.role === 'super_owner' || user.role === 'owner' || user.role === 'admin'))}
        currentUser={user}
        settings={settings}
        currency={currency}
        exchangeRates={exchangeRates}
        onClose={() => {
          setIsAdminOpen(false);
          setIsAdminRoute(false);
          if (window.location.hash === '#admin') window.location.hash = '';
        }}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('Store settings updated successfully');
        }}
        onProductChange={loadAllData}
      />

      {/* Bespoke Concierge Modal */}
      <ConciergeModal
        isOpen={isConciergeOpen}
        settings={settings}
        onClose={() => setIsConciergeOpen(false)}
      />

      {/* Owner-Only Contact & Concierge Email Editor Modal */}
      <EditEmailsModal
        isOpen={isEditEmailsOpen}
        settings={settings}
        onClose={() => setIsEditEmailsOpen(false)}
        onSave={handleSaveEmails}
      />

    </div>
  );
}
