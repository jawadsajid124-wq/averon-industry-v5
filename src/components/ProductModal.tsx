import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Heart, 
  Check, 
  Sparkles, 
  Layers, 
  Gift
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { formatCurrencyPrice } from '../lib/currency.ts';

interface ProductModalProps {
  product: Product | null;
  currency: string;
  exchangeRates?: Record<string, number>;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, engraving?: string, giftWrapping?: boolean) => void;
  onBuyNow: (product: Product, quantity: number, engraving?: string, giftWrapping?: boolean) => void;
  onToggleWishlist: (productId: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  currency,
  exchangeRates,
  isWishlisted,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [engravingText, setEngravingText] = useState('');
  const [wantEngraving, setWantEngraving] = useState(false);
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'artisan' | 'reviews'>('specs');
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, currency, exchangeRates);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, wantEngraving ? engravingText : undefined, giftWrapping);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleInstantBuy = () => {
    onBuyNow(product, quantity, wantEngraving ? engravingText : undefined, giftWrapping);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#090b10] border border-slate-700/80 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Product Imagery Stage */}
          <div className="relative bg-[#050608] flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-slate-800">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-cyan-400/50 text-cyan-300 font-tech text-xs uppercase tracking-wider font-semibold">
                    {product.badge}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded bg-slate-900/90 text-slate-300 font-tech text-[10px] tracking-wider uppercase border border-slate-700">
                  {product.category}
                </span>
              </div>

              {/* Wishlist button */}
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md border transition-all ${
                  isWishlisted
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-black/70 text-slate-300 hover:text-cyan-400 border-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Prestige Guarantees */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-slate-400 text-[10px] font-tech uppercase tracking-wider">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Express Courier</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>5-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>30-Day Vault Returns</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Customization, Order CTAs */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Reviews & Stock */}
              <div className="flex items-center justify-between text-xs font-tech text-slate-400 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-cyan-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-cyan-400" />
                    ))}
                  </div>
                  <span className="text-white font-bold">{(product.rating || 5.0).toFixed(1)}</span>
                  <span className="text-slate-500">({product.reviewsCount || 1} VIP reviews)</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                  product.stock > 5 ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30' : 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                }`}>
                  {product.stock > 0 ? `${product.stock} units available` : 'Sold Out'}
                </span>
              </div>

              {/* Name */}
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wide">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-tech text-2xl font-bold text-cyan-400 tracking-wide">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-tech text-sm line-through text-slate-500">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-[11px] font-tech text-slate-400 uppercase tracking-widest">
                  TAX INCLUDED
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                {product.description}
              </p>

              {/* Tabs for Specs, Craftsmanship, Reviews */}
              <div className="mt-6 border-b border-slate-800 flex gap-4 text-xs font-tech uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'specs' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('artisan')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'artisan' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Artisanship
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'reviews' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Client Critiques
                </button>
              </div>

              {/* Tab Contents */}
              <div className="py-4">
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {product.specs && Object.keys(product.specs).length > 0 ? (
                      Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="p-2 rounded bg-slate-900/50 border border-slate-800">
                          <span className="font-tech text-slate-400 block text-[10px] uppercase tracking-wider">{key}</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">Engineered to AVERON Master Specifications.</p>
                    )}
                  </div>
                )}

                {activeTab === 'artisan' && (
                  <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                    <p>
                      Every AVERON creation undergoes a rigorous 48-point quality benchmark inspection by certified Swiss and French ateliers prior to vault dispatch.
                    </p>
                    <p className="text-cyan-400 font-tech uppercase text-[10px] tracking-wider">
                      Accompanied by an NFC-embedded tamper-proof Certificate of Authenticity.
                    </p>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                      <div className="flex justify-between items-center text-slate-400 text-[10px] font-tech">
                        <span className="text-white font-semibold">Julian de Saint-Hilaire (Monaco)</span>
                        <span className="text-cyan-400">Verified Collector</span>
                      </div>
                      <p className="mt-1 text-slate-300">
                        "The weight, Damascus graining, and luminescence exceed even high-complication Geneva manufactures. An absolute triumph."
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bespoke Customization Section */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                {/* Engraving toggle */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={wantEngraving}
                      onChange={(e) => setWantEngraving(e.target.checked)}
                      className="accent-cyan-400 w-3.5 h-3.5 rounded"
                    />
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Complimentary Bespoke Laser Engraving</span>
                  </label>
                  <span className="text-[10px] font-tech text-cyan-400 uppercase">Complimentary</span>
                </div>

                {wantEngraving && (
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="Enter initials or date (e.g. A.V. · 2026)"
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-tech uppercase tracking-widest"
                  />
                )}

                {/* Gift wrapping toggle */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={giftWrapping}
                      onChange={(e) => setGiftWrapping(e.target.checked)}
                      className="accent-cyan-400 w-3.5 h-3.5 rounded"
                    />
                    <Gift className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Signature Obsidian & Electric Blue Gift Box</span>
                  </label>
                  <span className="text-[10px] font-tech text-cyan-400 uppercase">Included</span>
                </div>
              </div>
            </div>

            {/* Bottom Purchase Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity controller */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-slate-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-tech font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-slate-300 hover:text-white"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  disabled={product.stock === 0}
                  onClick={handleAdd}
                  className="flex-1 py-3 px-4 rounded-lg border border-cyan-400/80 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 font-tech text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to Shopping Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-cyan-400" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instant Buy Now */}
              <button
                disabled={product.stock === 0}
                onClick={handleInstantBuy}
                className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-[0.2em] font-extrabold shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2"
              >
                Instant Vault Checkout
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
