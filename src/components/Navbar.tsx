import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User as UserIcon, 
  ShieldCheck, 
  Heart, 
  Menu, 
  X, 
  PhoneCall, 
  LogOut, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Crown,
  Globe2,
  LogIn
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { User, StoreSettings } from '../types/index.ts';
import { WORLD_CURRENCIES } from '../lib/currency.ts';

interface NavbarProps {
  settings: StoreSettings;
  user: User | null;
  cartCount: number;
  wishlistCount: number;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenConcierge: () => void;
  onLogout: () => void;
  currency: string;
  onChangeCurrency: (currency: string) => void;
  onOpenCurrencyModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  user,
  cartCount,
  wishlistCount,
  activeCategory,
  onSelectCategory,
  onOpenCart,
  onOpenAuth,
  onOpenAccount,
  onOpenAdmin,
  onOpenConcierge,
  onLogout,
  currency,
  onChangeCurrency,
  onOpenCurrencyModal,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const categories = ['Watches', 'Wallets', 'Sunglasses', 'Perfumes', 'Accessories'];

  const currentCurrencyInfo = WORLD_CURRENCIES.find((c) => c.code === currency) || {
    code: currency,
    symbol: '$',
    flag: '🌐',
    name: currency,
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-[#050608] border-b border-slate-800/80 text-[11px] font-tech text-slate-300 py-1.5 px-4 sm:px-8 flex justify-between items-center transition-all">
        <div className="hidden lg:flex items-center gap-3 text-slate-400">
          <a
            href={settings.whatsappChatUrl || 'https://wa.me/923056674374'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer transition-colors text-slate-300 font-mono text-[10px]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">WhatsApp:</span>
            <span>+92 305 6674374</span>
          </a>
          <span className="text-slate-800">•</span>
          <button onClick={onOpenConcierge} className="flex items-center gap-1.5 hover:text-cyan-400 cursor-pointer transition-colors text-slate-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Bespoke Concierge</span>
          </button>
        </div>

        {/* Central Marquee / Announcement */}
        <div className="flex-1 text-center font-medium tracking-[0.2em] uppercase text-slate-200 text-[10px] sm:text-[11px] truncate px-2">
          <span className="text-cyan-400 mr-2">✦</span>
          {settings.announcement || 'ELEVATE YOUR PRESENCE — DELIVERY AVAILABLE ALL OVER PAKISTAN'}
          <span className="text-cyan-400 ml-2">✦</span>
        </div>

        {/* Currency & Header Account Icon (1.B) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Worldwide Currency Selector Trigger */}
          <button
            onClick={onOpenCurrencyModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded border border-slate-800 hover:border-cyan-400/70 bg-slate-900/80 hover:bg-slate-900 text-[10px] text-slate-300 hover:text-white transition-all cursor-pointer font-tech uppercase tracking-wider group"
            title="Open Worldwide ISO 4217 Currency Selector"
            aria-label="Select Worldwide Currency"
          >
            <span className="text-xs leading-none">{currentCurrencyInfo.flag}</span>
            <span className="font-bold text-slate-200 group-hover:text-cyan-300">{currentCurrencyInfo.code}</span>
            <span className="text-slate-400 font-mono text-[9px] hidden xs:inline">({currentCurrencyInfo.symbol})</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-cyan-400" />
          </button>

          {/* 1.B Premium Refined Metallic Silver Account Icon immediately beside currency selector */}
          <button
            onClick={user ? onOpenAccount : onOpenAuth}
            aria-label="Account / Sign In"
            title={user ? `Account: ${user.name} (${user.membershipTier})` : "Account / Sign In"}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-700/80 hover:border-cyan-400 bg-gradient-to-b from-slate-800/90 to-slate-900/90 text-slate-200 hover:text-white transition-all cursor-pointer shadow-[0_0_8px_rgba(255,255,255,0.06)] group shrink-0"
          >
            {/* Refined Metallic Silver Circular Monogram Badge */}
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-gradient-to-tr from-slate-400 via-slate-100 to-slate-300 text-slate-950 shadow-[0_0_6px_rgba(255,255,255,0.4)] shrink-0 group-hover:scale-105 transition-transform">
              <UserIcon className="w-2.5 h-2.5 text-slate-900" />
            </div>
            <span className="text-[10px] font-tech uppercase tracking-wider text-slate-300 group-hover:text-white whitespace-nowrap hidden sm:inline">
              {user ? user.name.split(' ')[0] : 'Account / Sign In'}
            </span>
          </button>

          {/* Administrative Badges: ONLY displayed after successful authentication & authorization */}
          {user && (user.role === 'super_owner' || user.role === 'owner' || user.role === 'admin') && (
            <button
              onClick={onOpenAdmin}
              className={`hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase font-tech tracking-wider px-2 py-0.5 rounded border transition-all ${
                user.role === 'super_owner'
                  ? 'border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : user.role === 'owner'
                  ? 'border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40'
                  : 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-950/40'
              }`}
              title="Launch Executive Console"
            >
              {user.role === 'super_owner' || user.role === 'owner' ? (
                <Crown className="w-3 h-3 text-amber-400" />
              ) : (
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
              )}
              <span>
                {user.role === 'super_owner'
                  ? 'Super Owner'
                  : user.role === 'owner'
                  ? 'Co-Owner'
                  : 'Admin'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="luxury-glass bg-[#07090ec7] border-b border-slate-800/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Desktop Categories */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-cyan-400 focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div onClick={() => onSelectCategory('All')}>
              <Logo size="md" showTagline={true} />
            </div>
          </div>

          {/* Center: Luxury Category Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-3">
            <button
              onClick={() => onSelectCategory('All')}
              className={`px-3 py-1.5 text-xs font-tech tracking-[0.2em] uppercase transition-all duration-300 rounded ${
                activeCategory === 'All'
                  ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Collection
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 text-xs font-tech tracking-[0.2em] uppercase transition-all duration-300 rounded relative group ${
                  activeCategory === cat
                    ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
                <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent group-hover:w-3/4 group-hover:left-[12.5%] transition-all duration-300" />
              </button>
            ))}
            <button
              onClick={onOpenConcierge}
              className="px-3 py-1.5 text-xs font-tech tracking-[0.2em] uppercase text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Bespoke
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('gallery-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 text-xs font-tech tracking-[0.2em] uppercase text-slate-400 hover:text-cyan-300 transition-colors"
            >
              Gallery
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('delivery-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 text-xs font-tech tracking-[0.2em] uppercase text-slate-400 hover:text-cyan-300 transition-colors"
            >
              Delivery
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('contact-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 text-xs font-tech tracking-[0.2em] uppercase text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Contact
            </button>
          </div>

          {/* Right Controls: Search, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button / Input */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-slate-900/90 border border-cyan-500/50 rounded-full px-3 py-1 text-sm shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-in fade-in duration-200">
                  <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search watches, perfumes..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="bg-transparent border-none text-xs text-white placeholder-slate-400 focus:outline-none w-36 sm:w-56 font-sans"
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-full text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors"
                  title="Search AVERON catalog"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Client Account Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/60 transition-all text-xs text-slate-200"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-cyan-400/50"
                  />
                  <span className="hidden md:inline font-tech tracking-wider max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 luxury-glass rounded-xl shadow-2xl p-2 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-tech uppercase tracking-wider bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                        <Sparkles className="w-2.5 h-2.5" />
                        {user.membershipTier}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAccount();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                        Client Profile & Orders
                      </button>

                      {user && (user.role === 'super_owner' || user.role === 'owner' || user.role === 'admin') && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded flex items-center gap-2 transition-colors ${
                            user.role === 'super_owner' || user.role === 'owner'
                              ? 'text-amber-300 hover:bg-amber-950/40 font-bold'
                              : 'text-cyan-300 hover:bg-cyan-950/40'
                          }`}
                        >
                          {user.role === 'super_owner' || user.role === 'owner' ? (
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span>
                            {user.role === 'super_owner'
                              ? 'Super Owner Dashboard'
                              : user.role === 'owner'
                              ? 'Executive Co-Owner Dashboard'
                              : 'Admin Operations Dashboard'}
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 rounded flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-700/80 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/30 text-xs font-tech uppercase tracking-wider text-slate-200 hover:text-white transition-all shadow-[0_0_10px_rgba(0,0,0,0.4)]"
              >
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.8)] border border-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#090b10] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
              <button
                onClick={() => {
                  onSelectCategory('All');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 text-xs font-tech uppercase tracking-wider text-left rounded ${
                  activeCategory === 'All' ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 bg-slate-900/40'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 text-xs font-tech uppercase tracking-wider text-left rounded ${
                    activeCategory === cat ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 bg-slate-900/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {/* Account / Sign In Option for Mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (user) onOpenAccount();
                  else onOpenAuth();
                }}
                className="w-full py-2.5 px-3 rounded border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 text-slate-200 font-tech text-xs uppercase tracking-wider flex items-center justify-between shadow-[0_0_12px_rgba(255,255,255,0.05)]"
              >
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-tr from-slate-400 via-slate-100 to-slate-300 text-slate-950">
                    <UserIcon className="w-3 h-3 text-slate-950" />
                  </div>
                  <span>{user ? `Account (${user.name})` : 'Account / Sign In'}</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">Access →</span>
              </button>

              {/* Worldwide Currency Option for Mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCurrencyModal();
                }}
                className="w-full py-2.5 px-3 rounded border border-slate-800 bg-slate-900 text-slate-300 font-tech text-xs uppercase tracking-wider flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  <span>Currency: {currentCurrencyInfo.flag} {currentCurrencyInfo.code} ({currentCurrencyInfo.symbol})</span>
                </span>
                <span className="text-[10px] text-cyan-400">Change ↗</span>
              </button>

              {/* Authorized Executive Portal: Only visible when signed in with Super Owner / Owner / Admin permissions */}
              {user && (user.role === 'super_owner' || user.role === 'owner' || user.role === 'admin') && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className={`w-full py-2.5 px-3 rounded border font-tech text-xs uppercase tracking-wider flex items-center justify-between ${
                    user.role === 'super_owner' || user.role === 'owner'
                      ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                      : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {user.role === 'super_owner' || user.role === 'owner' ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    )}
                    <span>
                      {user.role === 'super_owner'
                        ? 'Super Owner Console'
                        : user.role === 'owner'
                        ? 'Executive Co-Owner Console'
                        : 'Admin Operations Console'}
                    </span>
                  </span>
                  <span className="text-[10px] text-cyan-400">Launch →</span>
                </button>
              )}

              <a
                href={settings.whatsappChatUrl || 'https://wa.me/923056674374'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-tech text-xs uppercase tracking-wider flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Contact on WhatsApp (+92 305 6674374)</span>
                </span>
                <span>Chat ↗</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('gallery-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-3 rounded border border-slate-800 bg-slate-900 text-slate-300 font-tech text-xs uppercase tracking-wider flex items-center justify-between"
              >
                <span>Exquisite Gallery</span>
                <span className="text-[10px] text-cyan-400">View →</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('delivery-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-3 rounded border border-slate-800 bg-slate-900 text-slate-300 font-tech text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <span>Delivery All Over Pakistan</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConcierge();
                }}
                className="w-full py-2.5 px-3 rounded border border-slate-800 bg-slate-900 text-slate-300 font-tech text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                Contact Concierge & Inquiries
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
