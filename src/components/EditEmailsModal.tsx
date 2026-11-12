import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../types/index.ts';

interface EditEmailsModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onSave: (updatedSettings: Partial<StoreSettings>) => Promise<boolean>;
}

export const EditEmailsModal: React.FC<EditEmailsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [contactEmail, setContactEmail] = useState(settings.email || 'concierge@averonindustry.com');
  const [conciergeEmail, setConciergeEmail] = useState(settings.supportEmail || 'concierge@averonindustry.com');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContactEmail(settings.email || 'concierge@averonindustry.com');
      setConciergeEmail(settings.supportEmail || 'concierge@averonindustry.com');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      setError('Please provide a valid official contact email address.');
      return;
    }
    if (!emailRegex.test(conciergeEmail.trim())) {
      setError('Please provide a valid bespoke concierge email address.');
      return;
    }

    setSaving(true);
    try {
      const ok = await onSave({
        email: contactEmail.trim().toLowerCase(),
        supportEmail: conciergeEmail.trim().toLowerCase(),
      });
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError('Failed to update email addresses. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090b10] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.2)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#06070a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wide">
                Edit Contact & Concierge Emails
              </h3>
              <p className="text-[10px] font-tech text-cyan-400 uppercase tracking-wider">
                Owner Access Control · Persistent Settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-tech flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-tech flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Email addresses successfully saved & updated across the website!</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-300 mb-1">
              Official Contact Email (Public Inquiries)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@averonindustry.com"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-1">
              Displayed in the official Contact Section, inquiries links, and website footer.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-300 mb-1">
              Bespoke Concierge Email (VIP & Commissions)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={conciergeEmail}
                onChange={(e) => setConciergeEmail(e.target.value)}
                placeholder="concierge@averonindustry.com"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-1">
              Used in the Bespoke Concierge modal, VIP advisory links, and client consultations.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-tech uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Email Addresses</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
