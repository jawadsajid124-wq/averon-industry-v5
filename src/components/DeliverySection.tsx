import React from 'react';
import { Truck, ShieldCheck, MapPin, AlertCircle, CheckCircle2, PackageCheck } from 'lucide-react';
import { StoreSettings } from '../types/index.ts';

interface DeliverySectionProps {
  settings: StoreSettings;
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({ settings }) => {
  const provincesAndTerritories = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad Capital Territory',
    'Gilgit-Baltistan',
    'Azad Jammu and Kashmir'
  ];

  return (
    <section id="delivery-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
      {/* Background container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#080b12] to-[#04060a] border border-cyan-500/30 p-4 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        {/* Ambient accent aura */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          
          {/* Section Header */}
          <div className="max-w-3xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-tech uppercase tracking-[0.22em] text-cyan-300 font-bold">
              <Truck className="w-3 h-3 text-cyan-400" />
              <span>NATIONWIDE FULFILLMENT</span>
            </div>

            <h2 className="font-cinzel text-lg sm:text-2xl font-extrabold text-white tracking-wide">
              DELIVERY AVAILABLE ALL OVER PAKISTAN
            </h2>

            {/* Exact Required Messages */}
            <p className="font-cinzel text-sm sm:text-base text-cyan-300 font-semibold tracking-wide">
              AVERON INDUSTRY offers delivery throughout Pakistan.
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
              Delivery is available across all eligible locations within Pakistan. Orders with delivery addresses outside Pakistan are not accepted at this time.
            </p>
          </div>

          {/* Service Grid: Provinces & Eligibility Guarantee */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
            
            {/* Left Card: Provinces & Territories Coverage */}
            <div className="lg:col-span-7 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#0a0d17]/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-tech text-xs uppercase tracking-widest text-white font-bold">
                    Eligible Provinces & Administrative Territories
                  </h3>
                </div>
                <span className="text-[10px] font-tech text-cyan-400 font-mono">100% Nationwide</span>
              </div>

              {/* Provinces Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {provincesAndTerritories.map((province) => (
                  <div
                    key={province}
                    className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-sans text-slate-200 font-medium">{province}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-tech text-slate-400">
                <span>Direct Courier Courier Logistics</span>
                <span className="text-cyan-300">White-Glove Sealed Transit</span>
              </div>
            </div>

            {/* Right Card: Geographic Restriction Notice & Transit Standards */}
            <div className="lg:col-span-5 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#0a0d17]/80 border border-slate-800 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-tech text-xs uppercase tracking-widest text-white font-bold">
                    Transit & Logistics Protocol
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 font-sans">
                  <div className="flex items-start gap-2">
                    <PackageCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-white font-tech uppercase text-[10px] tracking-wider block">Tamper-Evident Packaging</strong>
                      Every parcel is sealed inside an airtight, serialized vault box ensuring piece integrity during transit.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong className="text-white font-tech uppercase text-[10px] tracking-wider block">Bespoke Transit Insurance</strong>
                      100% full coverage from the atelier dispatch floor to the recipient's signature.
                    </p>
                  </div>
                </div>
              </div>

              {/* Geographic Scope Banner */}
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5 text-amber-200/90 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-tech uppercase text-[10px] tracking-wider font-bold block text-amber-300">
                    Geographic Delivery Scope Notice
                  </span>
                  <p className="text-[11px] leading-relaxed text-amber-200/80 font-sans">
                    Orders with delivery addresses outside Pakistan cannot be fulfilled at this time.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
