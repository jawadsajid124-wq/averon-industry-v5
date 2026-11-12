import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Globe2, 
  Check, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { 
  WORLD_CURRENCIES, 
  POPULAR_CURRENCY_CODES, 
  CurrencyInfo 
} from '../lib/currency.ts';

interface CurrencySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  onSelectCurrency: (code: string) => void;
  exchangeRates: Record<string, number>;
}

export const CurrencySelectorModal: React.FC<CurrencySelectorModalProps> = ({
  isOpen,
  onClose,
  currentCurrency,
  onSelectCurrency,
  exchangeRates,
}) => {
  const [search, setSearch] = useState('');

  const filteredCurrencies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return WORLD_CURRENCIES;
    return WORLD_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [search]);

  const popularList = useMemo(() => {
    return WORLD_CURRENCIES.filter((c) => POPULAR_CURRENCY_CODES.includes(c.code));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#090b10] border border-slate-700/80 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Worldwide Currency Selector</span>
                <span className="text-[10px] font-tech font-normal px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  ISO 4217
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Browse prices converted with live authenticated market exchange rates. Base currency: USD.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close currency selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800/60 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by currency code (e.g. PKR, EUR, GBP), name, or country..."
              autoFocus
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Currencies Body Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Select: Most Popular Currencies */}
          {!search && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-tech uppercase tracking-[0.2em] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Frequently Selected</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Current: {currentCurrency}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {popularList.map((item) => {
                  const isSelected = item.code === currentCurrency;
                  const rate = exchangeRates[item.code];

                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        onSelectCurrency(item.code);
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg leading-none shrink-0">{item.flag}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-tech text-xs font-bold tracking-wider">{item.code}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({item.symbol})</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{item.name}</p>
                        </div>
                      </div>

                      {isSelected ? (
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
                      ) : rate && rate !== 1 ? (
                        <span className="text-[9px] font-mono text-slate-500 group-hover:text-cyan-400 shrink-0 hidden sm:inline">
                          {rate > 10 ? Math.round(rate) : rate.toFixed(2)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-tech uppercase tracking-[0.2em] text-slate-400 font-semibold">
                {search ? `Search Results (${filteredCurrencies.length})` : 'All ISO 4217 Currencies'}
              </span>
            </div>

            {filteredCurrencies.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Globe2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">No currency found matching &quot;{search}&quot;</p>
                <p className="text-[11px] text-slate-500">Try searching by ISO code like USD, PKR, EUR, or GBP</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredCurrencies.map((item) => {
                  const isSelected = item.code === currentCurrency;
                  const rate = exchangeRates[item.code];

                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        onSelectCurrency(item.code);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl leading-none shrink-0">{item.flag}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-tech text-xs font-bold tracking-wider">{item.code}</span>
                            <span className="text-xs text-slate-400 font-mono">({item.symbol})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{item.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rate && (
                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] text-slate-400 font-mono block">
                              1 USD = {rate > 100 ? Math.round(rate).toLocaleString() : rate.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
                            <Check className="w-3 h-3 text-cyan-400" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Policy Notice */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#06080d] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 font-tech">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Delivery Policy: International browsing supported · Physical delivery exclusively within Pakistan</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] uppercase tracking-wider font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
