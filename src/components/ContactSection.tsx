import React from 'react';
import { MessageCircle, Phone, ArrowUpRight, ShieldCheck, Globe, Mail, Edit3 } from 'lucide-react';
import { StoreSettings, User } from '../types/index.ts';

interface ContactSectionProps {
  settings: StoreSettings;
  user?: User | null;
  onOpenEditEmails?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  settings, 
  user, 
  onOpenEditEmails 
}) => {
  // If Super Owner has explicitly disabled public contact display, respect the setting
  if (settings.showPublicContact === false) {
    return null;
  }

  const rawPhone = settings.phone || '+92 305 6674374';
  const rawWhatsapp = settings.whatsapp || '+92 305 6674374';
  const whatsappUrl = settings.whatsappChatUrl || 'https://wa.me/923056674374';
  const contactEmail = settings.email || 'contact@averonindustry.com';
  const conciergeEmail = settings.supportEmail || 'concierge@averonindustry.com';

  const isOwner = Boolean(
    user && (user.role === 'super_owner' || user.role === 'owner' || user.role === 'admin')
  );

  return (
    <section id="contact-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 w-full">
      {/* Background ambient lighting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#090c14] to-[#05070b] border border-cyan-500/30 p-4 sm:p-6 shadow-[0_0_50px_rgba(0,240,255,0.06)]">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-52 h-52 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
          
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-tech uppercase tracking-[0.22em] text-cyan-300 font-bold">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>OFFICIAL BUSINESS CONCIERGE</span>
            </div>

            <h2 className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-wide">
              CONTACT AVERON INDUSTRY
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
              Connect directly with our sovereign atelier and client advisory team. Visitors and patrons worldwide are invited to contact us directly for bespoke timepiece inquiries, catalog orders, and acquisition consultations.
            </p>

            <div className="pt-0.5 flex flex-wrap items-center gap-3 text-xs font-tech text-slate-400">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Direct Line</span>
              </div>
              <span className="text-slate-700">•</span>
              <span>Delivery Available All Over Pakistan</span>
            </div>
          </div>

          {/* Right Column: Direct Contact & WhatsApp Action Card */}
          <div className="lg:col-span-5">
            <div className="p-4 sm:p-5 rounded-xl bg-[#0a0e18]/90 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 space-y-3.5 shadow-xl backdrop-blur-xl">
              
              {/* Official Displayed Information */}
              <div className="space-y-1">
                <span className="text-[10px] font-tech uppercase tracking-[0.2em] text-slate-400 block">
                  Official Public Business Line
                </span>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <a
                      href={`tel:${rawPhone.replace(/\s+/g, '')}`}
                      className="font-mono text-base font-bold text-white hover:text-cyan-400 transition-colors tracking-wide"
                    >
                      {rawPhone}
                    </a>
                    <span className="text-[9px] font-tech text-slate-500 block uppercase tracking-wider">
                      Direct Voice / Inquiry Dispatch
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action Button */}
              <div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full group p-3 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-tech font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-between transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-black/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block leading-none text-xs">Chat on WhatsApp</span>
                      <span className="text-[10px] font-mono text-emerald-100 font-normal opacity-90">{rawWhatsapp}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>

              {/* Direct Electronic Mail Section with Owner-Only Edit Option */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs font-tech">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-cyan-400" />
                    <span>Official Contact:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-cyan-400 hover:underline font-mono text-[11px]"
                    >
                      {contactEmail}
                    </a>
                    {isOwner && onOpenEditEmails && (
                      <button
                        onClick={onOpenEditEmails}
                        title="Owner: Edit Official Contact & Concierge Emails"
                        className="p-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 border border-slate-700 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Concierge Desk:</span>
                  </span>
                  <a
                    href={`mailto:${conciergeEmail}`}
                    className="text-slate-300 hover:text-cyan-300 font-mono text-[11px]"
                  >
                    {conciergeEmail}
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
