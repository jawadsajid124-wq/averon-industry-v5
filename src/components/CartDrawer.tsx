import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Tag, 
  Check, 
  Gift, 
  Sparkles 
} from 'lucide-react';
import { CartItem } from '../types/index.ts';
import { formatCurrencyPrice } from '../lib/currency.ts';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  currency: string;
  exchangeRates?: Record<string, number>;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (discountPercent: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  currency,
  exchangeRates,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, currency, exchangeRates);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.percent) / 100 : 0;
  const shipping = 0; // Complimentary white glove
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + tax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'AVERON20' || clean === 'VIP20') {
      setAppliedPromo({ code: clean, percent: 20 });
      setPromoError('');
    } else if (clean === 'ELEVATE10' || clean === 'PRESENCE10') {
      setAppliedPromo({ code: clean, percent: 10 });
      setPromoError('');
    } else {
      setPromoError('Invalid VIP credential or promotional token');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#090b10] border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-cinzel text-lg font-bold text-white tracking-wider">
                  Shopping Bag
                </h3>
                <p className="text-[11px] font-tech text-slate-400 uppercase tracking-widest">
                  {items.length} {items.length === 1 ? 'Curated Piece' : 'Curated Pieces'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-cinzel text-base font-bold text-white">Your Bag is Empty</h4>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs">
                    Explore the AVERON catalogue to acquire mastercrafted horology, leather goods and bespoke artifacts.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg border border-cyan-500/40 text-cyan-300 font-tech text-xs uppercase tracking-wider hover:bg-cyan-950/30 transition-all"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex gap-3.5 items-start group"
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-cinzel font-bold text-white truncate pr-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] font-tech uppercase text-cyan-400 mt-0.5">
                      {item.product.category}
                    </p>

                    {item.engraving && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-tech text-slate-400">
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Engraved: "{item.engraving}"</span>
                      </div>
                    )}

                    {item.giftWrapping && (
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] font-tech text-slate-400">
                        <Gift className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Signature Luxury Box</span>
                      </div>
                    )}

                    {/* Price and Quantity */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-tech text-xs font-bold text-white">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>

                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-tech text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Checkout Panel */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-[#07080c] space-y-4">
              
              {/* VIP Promo Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="VIP Code (e.g. AVERON20)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white uppercase font-tech tracking-wider placeholder-slate-500 focus:outline-none"
                  />
                  <Tag className="w-3 h-3 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-tech text-white uppercase tracking-wider rounded-lg transition-colors"
                >
                  Apply
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs text-cyan-400 font-tech bg-cyan-950/30 p-2 rounded border border-cyan-500/30">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    VIP Privilege Applied ({appliedPromo.code} -{appliedPromo.percent}%)
                  </span>
                  <button onClick={() => setAppliedPromo(null)} className="text-slate-400 hover:text-white text-[10px]">
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-red-400 font-tech">{promoError}</p>
              )}

              {/* Price Calculation breakdown */}
              <div className="space-y-1.5 text-xs font-tech text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-cyan-400">
                    <span>VIP Privilege Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>White-Glove Express Delivery</span>
                  <span className="text-emerald-400 uppercase">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Vault Duties / VAT (8%)</span>
                  <span className="text-slate-300">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
                  <span className="font-cinzel">Total Acquisition</span>
                  <span className="font-tech text-cyan-400 text-base">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => onCheckout(appliedPromo ? appliedPromo.percent : 0)}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-[0.25em] font-extrabold shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 group"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-tech text-slate-500 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>256-Bit Bank Grade Vault Encryption</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
