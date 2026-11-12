import React from 'react';
import { 
  Sparkles, 
  Lock,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Compass,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { StoreSettings, User } from '../types/index.ts';

interface FooterProps {
  settings: StoreSettings;
  user?: User | null;
  onSelectCategory: (category: string) => void;
  onOpenConcierge: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenAccount?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  user,
  onSelectCategory,
  onOpenConcierge,
  onOpenAdmin,
  onOpenAuth,
  onOpenAccount,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#040508] border-t border-slate-800/80 text-slate-400 text-xs font-sans pt-8 pb-6 overflow-hidden">
      {/* Background cyber accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-cyan-600/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7 relative z-10">
        
        {/* 4-Column Clean E-Commerce Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo size="md" showTagline={true} />
            <p className="text-slate-400 text-xs leading-relaxed font-sans pt-1">
              AVERON INDUSTRY designs luxury timepieces, leather goods, eyewear, haute parfumerie, and bespoke accessories with cutting-edge engineering and timeless prestige.
            </p>
            <p className="font-tech text-cyan-400 text-[11px] uppercase tracking-wider font-semibold">
              ELEVATE YOUR PRESENCE
            </p>
          </div>

          {/* Catalog Collections */}
          <div className="space-y-3 font-tech">
            <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
              Collections
            </h4>
            <ul className="space-y-2 text-xs">
              {['Watches', 'Wallets', 'Sunglasses', 'Perfumes', 'Accessories'].map((cat) => (
                <li key={cat}>
                  <button 
                    onClick={() => onSelectCategory(cat)} 
                    className="hover:text-cyan-400 text-slate-300 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>{cat}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Relations & Services */}
          <div className="space-y-3 font-tech">
            <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
              Client Relations
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={onOpenConcierge}
                  className="hover:text-cyan-400 transition-colors uppercase tracking-wider flex items-center gap-1.5 text-cyan-300"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bespoke Concierge</span>
                </button>
              </li>
              <li>
                <span className="text-slate-400">WhatsApp:</span>{' '}
                <a
                  href={settings.whatsappChatUrl || 'https://wa.me/923056674374'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] font-bold"
                >
                  +92 305 6674374
                </a>
              </li>
              <li>
                <span className="text-slate-400">Contact:</span>{' '}
                <a
                  href={`mailto:${settings.email || 'contact@averonindustry.com'}`}
                  className="text-slate-200 hover:text-cyan-400 font-mono text-[11px]"
                >
                  {settings.email || 'contact@averonindustry.com'}
                </a>
              </li>
              <li>
                <span className="text-slate-400">Concierge:</span>{' '}
                <a
                  href={`mailto:${settings.supportEmail || settings.email || 'concierge@averonindustry.com'}`}
                  className="text-cyan-400 hover:underline font-mono text-[11px]"
                >
                  {settings.supportEmail || settings.email || 'concierge@averonindustry.com'}
                </a>
              </li>
              <li>
                <span className="text-slate-400">Fulfillment:</span>{' '}
                <span className="text-slate-200">Delivery All Over Pakistan</span>
              </li>
            </ul>
          </div>

          {/* Boutique Assurance */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
              Boutique Standards
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Individually Verified Craftsmanship</span>
              </div>
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Bespoke Secure Packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Insured Nationwide Transit (Pakistan)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-tech text-slate-500">
          <div className="flex items-center gap-4">
            <span>© {currentYear} AVERON INDUSTRY. All rights reserved.</span>
            <span className="text-slate-800">|</span>
            <span className="text-slate-400 uppercase tracking-wider">ELEVATE YOUR PRESENCE</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* 1.A Required Direct Authentication Access Link */}
            <button
              onClick={user ? onOpenAccount || onOpenAuth : onOpenAuth}
              className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] py-0.5 px-2 rounded bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400"
              title="Open Sign In / Register Account"
            >
              {user ? (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Account ({user.name.split(' ')[0]})</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SIGN IN / REGISTER</span>
                </>
              )}
            </button>
            <span>•</span>
            {/* Executive link strictly restricted to authenticated authorized users */}
            {user && (user.role === 'super_owner' || user.role === 'owner' || user.role === 'admin') && (
              <>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-300 text-amber-400 uppercase tracking-wider flex items-center gap-1 transition-colors font-bold"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>
                    {user.role === 'super_owner' ? 'Super Owner Console' : 'Executive Console'}
                  </span>
                </button>
                <span>•</span>
              </>
            )}
            <span className="hover:text-slate-300 cursor-pointer">Privacy Protocol</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
