import React from 'react';
import { ArrowRight, Shield, Award, Clock, Sparkles, Plus } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Product, User } from '../types/index.ts';
import { formatCurrencyPrice } from '../lib/currency.ts';

interface HeroProps {
  featuredProduct?: Product | null;
  currency?: string;
  exchangeRates?: Record<string, number>;
  user?: User | null;
  onExplore: () => void;
  onOpenConcierge: () => void;
  onQuickView?: (product: Product) => void;
  onOpenAdmin?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  featuredProduct, 
  currency = 'USD', 
  exchangeRates,
  user,
  onExplore, 
  onOpenConcierge,
  onQuickView,
  onOpenAdmin 
}) => {
  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, currency, exchangeRates);
  };

  return (
    <section className="relative min-h-[44vh] lg:min-h-[48vh] flex items-center justify-center overflow-hidden py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      {/* Luxury Metallic & Electric Blue Radial Backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[650px] h-[340px] bg-gradient-to-tr from-cyan-600/12 via-blue-600/8 to-transparent rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[240px] h-[240px] bg-slate-400/5 rounded-full blur-[70px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
        
        {/* Left Column: Brand Statement & Typography */}
        <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
          
          {/* Haute Luxury Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-950/25 backdrop-blur-md mb-2 shadow-[0_0_16px_rgba(0,240,255,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[9px] sm:text-[10px] font-tech uppercase tracking-[0.25em] text-cyan-300">
              HAUTE INGENUITY & TIMELESS PRESTIGE
            </span>
          </div>

          {/* Main Title with Metallic Gradient & Electric Blue Accent */}
          <h1 className="font-cinzel text-2xl sm:text-4xl xl:text-5xl font-extrabold tracking-wider leading-[1.08] text-white">
            <span className="text-metallic block">AVERON</span>
            <span className="text-electric block drop-shadow-[0_0_25px_rgba(0,240,255,0.35)]">
              INDUSTRY
            </span>
          </h1>

          {/* Tagline */}
          <div className="mt-1.5 flex items-center gap-2.5">
            <div className="w-8 h-[1px] bg-gradient-to-r from-cyan-400 to-transparent" />
            <p className="font-tech text-xs sm:text-sm font-bold uppercase tracking-[0.32em] text-slate-300">
              ELEVATE YOUR PRESENCE
            </p>
          </div>

          {/* Luxury Description */}
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-sans max-w-xl leading-relaxed">
            Curated luxury timepieces, leather goods, eyewear, haute parfumerie, and bespoke accessories. Crafted with cutting-edge engineering and timeless prestige.
          </p>

          {/* Action CTAs */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onExplore}
              className="relative group px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 text-black font-tech font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.55)] transition-all duration-300 flex items-center gap-2 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                DISCOVER COLLECTION
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <button
              onClick={onOpenConcierge}
              className="px-4 py-2.5 rounded-lg border border-slate-700/80 hover:border-cyan-400/80 bg-slate-900/60 hover:bg-slate-800/80 text-white font-tech text-xs uppercase tracking-[0.18em] transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Bespoke Concierge
            </button>
          </div>

          {/* Prestige Proof Badges */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-3 gap-3 sm:gap-5 w-full max-w-lg">
            <div>
              <p className="font-cinzel text-base sm:text-lg font-bold text-white">Curated</p>
              <p className="font-tech text-[9px] tracking-wider uppercase text-slate-400 mt-0.5">Luxury Artisanship</p>
            </div>
            <div>
              <p className="font-cinzel text-base sm:text-lg font-bold text-cyan-400">Pakistan</p>
              <p className="font-tech text-[9px] tracking-wider uppercase text-slate-400 mt-0.5">Nationwide Transit</p>
            </div>
            <div>
              <p className="font-cinzel text-base sm:text-lg font-bold text-white">Bespoke</p>
              <p className="font-tech text-[9px] tracking-wider uppercase text-slate-400 mt-0.5">VIP Relations</p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Masterpiece Card */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          
          {/* Pulsing Backlight Ring */}
          <div className="absolute inset-0 rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 via-transparent to-blue-600/10 blur-xl animate-cyber-glow" />

          {/* If there is a featured product, display it */}
          {featuredProduct ? (
            <div 
              onClick={() => onQuickView && onQuickView(featuredProduct)}
              className="relative w-full max-w-sm sm:max-w-md luxury-glass rounded-2xl p-3.5 sm:p-5 border border-slate-700/60 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden group cursor-pointer"
            >
              <div className="flex justify-between items-center mb-3 text-[10px] font-tech uppercase tracking-[0.2em] text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {featuredProduct.badge || 'FEATURED MASTERPIECE'}
                </span>
                <span className="text-slate-500">{featuredProduct.category}</span>
              </div>

              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-black border border-slate-800">
                <img
                  src={featuredProduct.image}
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-transparent opacity-80" />

                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-cyan-500/30">
                  <Logo size="sm" />
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-lg bg-black/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-cinzel font-bold text-white">{featuredProduct.name}</h4>
                    <p className="text-[9px] font-tech text-cyan-400">{featuredProduct.category} • Certified Sovereign</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white font-tech">{formatPrice(featuredProduct.price)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-tech text-slate-300">
                <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Hand-Assembled</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Vault Certified</span>
                </div>
              </div>
            </div>
          ) : (
            /* When no products are uploaded yet: Exquisite Vault Emblem Showcase */
            <div className="relative w-full max-w-sm luxury-glass rounded-2xl p-5 sm:p-6 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.12)] overflow-hidden group text-center space-y-4">
              
              <div className="flex justify-between items-center text-[9px] font-tech uppercase tracking-[0.2em] text-slate-400 pb-2 border-b border-slate-800/80">
                <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  VAULT ARCHIVES
                </span>
                <span className="text-slate-500">HAUTE PRESTIGE</span>
              </div>

              {/* Large Centered Logo Emblem with Electric Glow */}
              <div className="py-4 flex flex-col items-center justify-center relative">
                <div className="absolute w-28 h-28 rounded-full bg-cyan-500/10 blur-xl animate-cyber-glow pointer-events-none" />
                <Logo size="lg" showTagline={true} />
              </div>

              <div className="space-y-1">
                <h3 className="font-cinzel text-base font-bold text-white tracking-wide">
                  New Collection Arriving Soon
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-xs mx-auto">
                  Limited production pieces and bespoke creations are currently being cataloged. Discover our categories below.
                </p>
              </div>

              {/* Owner Action Shortcut: Strictly restricted to verified Super Owner */}
              {user && user.role === 'super_owner' && onOpenAdmin && (
                <div className="pt-2">
                  <button
                    onClick={onOpenAdmin}
                    className="w-full py-2.5 rounded-lg border border-cyan-500/50 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 font-tech text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Super Owner: Catalog Management</span>
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[9px] font-tech text-slate-500 uppercase tracking-widest">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>AVERON INDUSTRY · ELEVATE YOUR PRESENCE</span>
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
};
