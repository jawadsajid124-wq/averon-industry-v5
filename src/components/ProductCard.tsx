import React from 'react';
import { ShoppingBag, Eye, Heart, Star, Sparkles } from 'lucide-react';
import { Product } from '../types/index.ts';
import { formatCurrencyPrice } from '../lib/currency.ts';

interface ProductCardProps {
  product: Product;
  currency: string;
  exchangeRates?: Record<string, number>;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  exchangeRates,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, currency, exchangeRates);
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative flex flex-col luxury-glass rounded-xl overflow-hidden border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_35px_rgba(0,240,255,0.18)]">
      
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full bg-[#0a0d14] overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Soft dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-tech text-[10px] uppercase tracking-wider font-semibold shadow-sm">
              {product.badge}
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-tech text-[9px] uppercase tracking-wider">
              Special Privilege
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${
            isWishlisted
              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
              : 'bg-black/60 text-slate-300 hover:text-cyan-400 border border-slate-700/60 hover:border-cyan-400/60'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Floating Action Bar on Hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-black/85 backdrop-blur-md border border-slate-700 hover:border-cyan-400 text-xs font-tech text-white uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Inspect
          </button>
          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="py-2 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-700 text-black font-tech text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            title="Add to Shopping Bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-transparent to-[#050608]/90">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-tech uppercase tracking-widest text-slate-400 mb-1">
            <span className="text-cyan-400/90 font-medium">{product.category}</span>
            <div className="flex items-center gap-1 text-slate-300">
              <Star className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              <span>{(product.rating || 5.0).toFixed(1)}</span>
              <span className="text-slate-500">({product.reviewsCount || 1})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-cinzel text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Snippet Description */}
          <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Stock Status */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-tech text-base sm:text-lg font-bold text-white tracking-wide">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-tech text-xs line-through text-slate-500">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-tech uppercase tracking-wider">
              {isOutOfStock ? (
                <span className="text-red-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Reserved Out
                </span>
              ) : isLowStock ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Only {product.stock} Allocated
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Vault In Stock
                </span>
              )}
            </div>
          </div>

          {/* Add to Bag Direct Button */}
          <button
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400/80 hover:bg-cyan-950/40 text-slate-200 hover:text-cyan-300 font-tech text-xs tracking-wider uppercase transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3 h-3 text-cyan-400" />
            <span>Bag</span>
          </button>
        </div>

      </div>
    </div>
  );
};
