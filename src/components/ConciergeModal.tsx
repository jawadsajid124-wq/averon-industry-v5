import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { StoreSettings } from '../types/index.ts';

interface ConciergeModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
}

export const ConciergeModal: React.FC<ConciergeModalProps> = ({
  isOpen,
  settings,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Bespoke Commission');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#090b10] border border-cyan-500/40 rounded-2xl shadow-[0_0_80px_rgba(0,240,255,0.2)] overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-[#06070a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white tracking-wider">
                Bespoke Concierge & Inquiries
              </h3>
              <p className="text-[10px] font-tech text-cyan-400 uppercase tracking-widest">
                AVERON INDUSTRY Client Relations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-cinzel text-xl font-bold text-white">
                Inquiry Received
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-cyan-400">{name}</strong>. Your message regarding <strong className="text-white">{inquiryType}</strong> has been recorded. Our client relations team will review your inquiry and follow up at <strong className="text-white">{email}</strong>.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-tech text-xs uppercase font-bold tracking-wider"
              >
                Return to Storefront
              </button>
            </div>
          ) : (
            <>
              {/* Direct Correspondence Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={settings.whatsappChatUrl || 'https://wa.me/923056674374'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between gap-2 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-900/60 text-emerald-400 group-hover:scale-105 transition-transform">
                      {/* WhatsApp Icon */}
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-tech uppercase text-emerald-400 block font-bold">WhatsApp Concierge</span>
                      <span className="text-xs font-mono font-bold text-white">+92 305 6674374</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-tech text-emerald-300 uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">Chat ↗</span>
                </a>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-tech uppercase text-slate-400 block">Bespoke Concierge & VIP Inquiries</span>
                      <span className="text-xs font-mono font-bold text-white truncate max-w-[150px] sm:max-w-none block">
                        {settings.supportEmail || settings.email || 'concierge@averonindustry.com'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[9px] font-tech text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confidential</span>
                  </div>
                </div>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">Inquiry Category</label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-tech uppercase"
                  >
                    <option value="Bespoke Commission">Bespoke Commission</option>
                    <option value="Watches & Timepieces">Watches & Timepieces Inquiry</option>
                    <option value="Leather Goods & Wallets">Leather Goods & Wallets</option>
                    <option value="Eyewear & Sunglasses">Eyewear & Sunglasses</option>
                    <option value="Haute Parfumerie">Haute Parfumerie Extraits</option>
                    <option value="Accessories">Accessories & Accoutrements</option>
                    <option value="Order Tracking">Order & Delivery Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">Message / Requirements</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, custom commission details, or requirements..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-[0.2em] font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
                >
                  Submit Inquiry
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
