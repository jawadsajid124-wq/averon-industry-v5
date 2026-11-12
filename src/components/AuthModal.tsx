import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Phone,
  Key,
  Shield,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { User } from '../types/index.ts';

import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../lib/firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthView = 'signin' | 'signup' | 'forgot-password';
type AuthMethod = 'email' | 'phone';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [view, setView] = useState<AuthView>('signin');
  const [method, setMethod] = useState<AuthMethod>('email');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('+92 305 6674374');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInfoMessage, setOtpInfoMessage] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Reset states when opening/closing
  useEffect(() => {
    if (isOpen) {
      setError('');
      setNotice('');
      setResetEmailSent(false);
      setVerificationEmailSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Genuine Google Sign In via Firebase
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      if (!fbUser || !fbUser.email) {
        throw new Error('Google authentication did not return a valid email address.');
      }

      const idToken = await fbUser.getIdToken();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          provider: 'google',
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.email}`,
          idToken
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server session synchronization failed');

      if (data.token) {
        localStorage.setItem('averon_admin_token', data.token);
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.error('Firebase Google Auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completion. Please click Continue with Google again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in cancelled due to multiple open popups.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is being authorized in Firebase Console. Please verify authorized domains in Firebase.');
      } else {
        setError(err.message || 'Google authentication encountered an unexpected error.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Genuine Apple Sign In via Firebase OAuthProvider
  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await signInWithPopup(auth, appleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser.email || 'client.apple@averonindustry.com',
          name: fbUser.displayName || 'Private Apple Client',
          provider: 'apple',
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          idToken
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Apple login synchronization failed');

      if (data.token) {
        localStorage.setItem('averon_admin_token', data.token);
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.warn('Firebase Apple Auth status:', err);
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        setError(
          'Apple Sign In provider requires configuration in Firebase Console. To enable: Go to Firebase Console > Authentication > Sign-in method > Apple, and configure your Apple Services ID & Team ID.'
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Apple sign-in window was closed by the user.');
      } else {
        setError(
          err.message ||
          'Apple Sign In is currently awaiting Apple Services ID configuration in the Firebase Console.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Email & Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your VIP email and passkey.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      let fbUser: any = null;
      try {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        fbUser = userCred.user;
      } catch (fbErr: any) {
        // If user does not exist in Firebase Auth yet, check backend directly or explain clearly
        if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or passkey. If you have not created an account yet, click "Create an exclusive account".');
        } else if (fbErr.code === 'auth/wrong-password') {
          throw new Error('Incorrect passkey. Click "Forgot Passkey?" to reset your password.');
        } else if (fbErr.code === 'auth/too-many-requests') {
          throw new Error('Access temporarily blocked due to multiple failed attempts. Please reset your password or try again later.');
        } else {
          throw fbErr;
        }
      }

      const idToken = fbUser ? await fbUser.getIdToken() : undefined;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser?.email || email.trim(),
          name: fbUser?.displayName || email.split('@')[0],
          provider: 'email',
          idToken
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication verification failed');

      if (data.token) {
        localStorage.setItem('averon_admin_token', data.token);
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Email & Password Registration with Genuine Email Verification
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and passkey.');
      return;
    }
    if (password.length < 6) {
      setError('Passkey must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      // 1. Create account in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCred.user;

      // 2. Set profile name if provided
      if (name.trim()) {
        try {
          await updateProfile(fbUser, { displayName: name.trim() });
        } catch {}
      }

      // 3. Send Genuine Email Verification
      try {
        await sendEmailVerification(fbUser);
        setVerificationEmailSent(true);
      } catch (vErr) {
        console.warn('Email verification dispatch notice:', vErr);
      }

      const idToken = await fbUser.getIdToken();

      // 4. Sync user record in backend (strictly customer role for public signups)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser.email || email.trim(),
          name: name.trim() || email.split('@')[0],
          provider: 'email',
          idToken
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize client profile');

      if (data.token) {
        localStorage.setItem('averon_admin_token', data.token);
      }

      setNotice(
        `Profile created successfully! A verification email has been dispatched to ${email}. You may now explore your private account.`
      );

      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered with AVERON. Please sign in or use password reset.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Passkey is too weak. Please use at least 6 characters including numbers or symbols.');
      } else {
        setError(err.message || 'Account registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 5. Genuine Password Reset via Firebase
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered VIP email address.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetEmailSent(true);
      setNotice(`Official password recovery link has been dispatched to ${email}. Please check your inbox and spam folder.`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No registered profile found matching this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Password reset could not be processed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 6. Phone Authentication Initiation (SMS OTP)
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber) {
      setError('Please provide a valid phone number with country code (e.g. +92 305 6674374).');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');
    setOtpInfoMessage('');

    try {
      // Try server-backed SMS verification endpoint
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch SMS OTP');

      setOtpSent(true);
      setOtpInfoMessage(data.message || `SMS verification code dispatched to ${phoneNumber}`);
      if (data.demoOtp) {
        setPhoneOtp(data.demoOtp);
      }
    } catch (err: any) {
      setError(err.message || 'SMS OTP could not be dispatched.');
    } finally {
      setLoading(false);
    }
  };

  // 7. Phone Authentication OTP Verification
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !phoneOtp) {
      setError('Please provide both your phone number and 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim(), otp: phoneOtp.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP code verification failed');

      if (data.token) {
        localStorage.setItem('averon_admin_token', data.token);
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Phone verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div 
        className="relative w-full max-w-md bg-[#090b10] border border-slate-700/80 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden p-6 sm:p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Monogram */}
        <div className="text-center mb-6">
          <div className="inline-block">
            <Logo size="md" showTagline={true} />
          </div>

          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white mt-4 tracking-wide">
            {view === 'signin' 
              ? 'Sign In to AVERON' 
              : view === 'signup' 
              ? 'Join the Inner Circle' 
              : 'Recover VIP Access'}
          </h3>

          <p className="text-xs text-slate-400 font-sans mt-1">
            {view === 'signin'
              ? 'Access your private client vault, orders, and priority concierge.'
              : view === 'signup'
              ? 'Register an exclusive profile to track acquisitions and receive private releases.'
              : 'Enter your email to receive an official password reset link.'}
          </p>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {notice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{notice}</div>
          </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot-password' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                Registered VIP Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@averonindustry.com"
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-[0.2em] font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching Reset Link...</span>
                </>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setView('signin');
                  setError('');
                  setNotice('');
                }}
                className="text-xs font-tech text-cyan-400 hover:underline uppercase tracking-wider"
              >
                ← Return to Sign In
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* 1-Click Social Providers (Google, Apple) */}
            <div className="space-y-2.5 mb-5">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-tech text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Apple ID Button */}
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-black hover:bg-slate-900 text-white font-tech text-xs uppercase tracking-wider font-bold transition-all border border-slate-700 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span className="text-base"></span>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-[#090b10] px-3 text-[10px] font-tech uppercase tracking-[0.2em] text-slate-500">
                Or Continue With
              </span>
            </div>

            {/* Method Switcher Tabs (Email / Phone) */}
            <div className="flex rounded-lg bg-slate-900/90 p-1 mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => { setMethod('email'); setError(''); }}
                className={`flex-1 py-2 text-xs font-tech uppercase tracking-wider font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                  method === 'email'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Passkey</span>
              </button>
              <button
                type="button"
                onClick={() => { setMethod('phone'); setError(''); }}
                className={`flex-1 py-2 text-xs font-tech uppercase tracking-wider font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                  method === 'phone'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>SMS OTP</span>
              </button>
            </div>

            {/* METHOD 1: EMAIL & PASSWORD FORM */}
            {method === 'email' && (
              <form onSubmit={view === 'signup' ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
                {view === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jawad Sajid"
                        className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                      />
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                    VIP Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@averonindustry.com"
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-tech uppercase tracking-wider text-slate-400">
                      Secret Passkey
                    </label>
                    {view === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setView('forgot-password');
                          setError('');
                        }}
                        className="text-[10px] text-cyan-400 hover:underline font-tech"
                      >
                        Forgot Passkey?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                  {view === 'signup' && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Minimum 6 characters. Genuine email verification will be dispatched.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-[0.2em] font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{view === 'signup' ? 'Creating Profile...' : 'Authenticating...'}</span>
                    </>
                  ) : (
                    <span>{view === 'signup' ? 'Create Exclusive Profile' : 'Sign In Securely'}</span>
                  )}
                </button>
              </form>
            )}

            {/* METHOD 2: PHONE AUTHENTICATION (SMS OTP) */}
            {method === 'phone' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-slate-300 text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>International Phone & SMS Verification</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Direct mobile authentication for Super Owner 2 and registered clientele. Enter country code followed by number.
                  </p>
                </div>

                {otpInfoMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{otpInfoMessage}</span>
                  </div>
                )}

                {!otpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                        Mobile Phone Number (with Country Code)
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+92 305 6674374"
                          className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                        />
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Supported: Pakistan (+92) and all global international destinations (+XX XXXXXXXXXX)
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-[0.2em] font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching SMS Code...</span>
                        </>
                      ) : (
                        <span>Send SMS Verification Code</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-tech uppercase tracking-wider text-slate-400">
                          6-Digit SMS Verification Code
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-[10px] text-cyan-400 hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full bg-slate-900/80 border border-cyan-500/60 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2.5 text-base tracking-[0.3em] font-tech text-center text-cyan-300 placeholder-slate-600 focus:outline-none"
                        />
                        <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        SMS code sent to {phoneNumber}. Enter the 6 digits to verify.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3.5 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-[0.2em] font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendPhoneOtp()}
                        disabled={loading}
                        className="px-3 py-3.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-tech cursor-pointer"
                        title="Resend SMS Code"
                      >
                        Resend
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Clear Navigation Between: Sign In & Create Account */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              {view === 'signin' ? (
                <div className="text-xs font-tech text-slate-400">
                  <span>New to AVERON INDUSTRY? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('signup');
                      setError('');
                      setNotice('');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              ) : (
                <div className="text-xs font-tech text-slate-400">
                  <span>Already registered? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('signin');
                      setError('');
                      setNotice('');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider underline cursor-pointer"
                  >
                    Sign In to Profile
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
