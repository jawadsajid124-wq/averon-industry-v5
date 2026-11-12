import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, LogIn } from 'lucide-react';
import { Logo } from './Logo.tsx';

interface AccessDeniedProps {
  onReturnHome: () => void;
  onSignIn: () => void;
  attemptedPath?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  onReturnHome,
  onSignIn,
  attemptedPath = '/admin',
}) => {
  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-red-500 selection:text-white">
      {/* Background red & cyan ambient warning auras */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Security Card */}
      <div className="relative z-10 max-w-lg w-full bg-[#0a0d14]/90 border border-red-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(239,68,68,0.2)] text-center space-y-6 backdrop-blur-xl">
        
        {/* Brand Monogram */}
        <div className="flex justify-center">
          <Logo size="md" showTagline={true} />
        </div>

        {/* Security Shield Icon */}
        <div className="relative w-20 h-20 mx-auto rounded-2xl bg-red-950/40 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-md animate-pulse" />
          <ShieldAlert className="w-10 h-10 relative z-10" />
        </div>

        {/* Clearance Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-[10px] font-tech uppercase tracking-[0.25em] text-red-400 font-bold">
            <Lock className="w-3 h-3" />
            <span>403 · RESTRICTED EXECUTIVE CLEARANCE</span>
          </div>

          <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            Access Denied
          </h2>

          <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm mx-auto">
            The requested console path (<code className="text-red-300 font-mono text-[11px]">{attemptedPath}</code>) is strictly reserved for the verified Super Owner and authorized executive officers of AVERON INDUSTRY.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-tech space-y-1 text-left">
          <span className="text-slate-300 font-bold block uppercase tracking-wider text-[10px]">
            Security Protocol In Effect:
          </span>
          <p className="text-slate-500 leading-normal">
            Public visitors cannot view, access, or modify atelier vaults or administrative operations without cryptographic Firebase Authentication.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-tech text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique</span>
          </button>

          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 hover:border-cyan-400/80 bg-slate-900/60 hover:bg-slate-800 text-white font-tech text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4 text-cyan-400" />
            <span>Sign In to Executive Account</span>
          </button>
        </div>

        {/* Quiet Security Footnote */}
        <div className="pt-2 border-t border-slate-900 text-[10px] font-tech text-slate-600 uppercase tracking-widest">
          Sovereign Protection Layer · Zero Public Exposure
        </div>
      </div>
    </div>
  );
};
