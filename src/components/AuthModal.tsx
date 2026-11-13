import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  User 
} from 'firebase/auth';
import { auth } from '../game/firebase';
import { PixelChick, PixelRooster, PixelLock, PixelCheck } from './PixelIcons';
import { Mail, KeyRound, User as UserIcon, RefreshCw, Send, LogOut, AlertCircle, ShieldCheck } from 'lucide-react';
import { audio } from '../game/audio';

interface AuthModalProps {
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ currentUser, onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'verify' | 'forgot'>(
    currentUser && !currentUser.emailVerified ? 'verify' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sync state if user changes or requires verification
  useEffect(() => {
    if (currentUser) {
      if (!currentUser.emailVerified) {
        setTab('verify');
        if (currentUser.email) setEmail(currentUser.email);
      } else {
        onAuthSuccess(currentUser);
      }
    }
  }, [currentUser, onAuthSuccess]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle Email & Password Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      // Send verification email to registered email address
      await sendEmailVerification(cred.user);
      audio.playBadgeUnlock?.();
      setSuccessMsg('Account registered! A verification email has been sent.');
      setTab('verify');
      setResendCooldown(30);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please log in.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email/Password sign-in is disabled in Firebase Console. Enable it in Authentication -> Sign-in method, or use Google Sign-In below.');
      } else {
        setErrorMsg(err.message || 'Failed to register account.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Email & Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      
      // Critical Check: Has the user verified their email?
      if (!cred.user.emailVerified) {
        setErrorMsg('Email not verified! Please check your inbox or click resend.');
        setTab('verify');
        setResendCooldown(15);
      } else {
        audio.playPowerUp?.();
        onAuthSuccess(cred.user);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Incorrect email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Too many failed attempts. Please wait a few minutes.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email/Password sign-in is disabled in Firebase Console. Enable it in Authentication -> Sign-in method, or use Google Sign-In below.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check Email Verification Status
  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Reload current user to get fresh token and emailVerified state
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;

      if (updatedUser?.emailVerified) {
        audio.playPowerUp?.();
        setSuccessMsg('Email verified successfully! Entering game...');
        setTimeout(() => {
          onAuthSuccess(updatedUser);
        }, 800);
      } else {
        setErrorMsg('Email not verified yet! Please click the verification link in your email and tap Check again.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to refresh status: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Verification Link
  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    if (resendCooldown > 0) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setSuccessMsg(`Verification email resent to ${auth.currentUser.email}!`);
      setResendCooldown(45);
    } catch (err: any) {
      setErrorMsg('Failed to resend email: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Enter your email to receive password reset link.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg('Password reset link sent to your email!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login Fallback
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      if (cred.user) {
        audio.playPowerUp?.();
        onAuthSuccess(cred.user);
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setErrorMsg(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Log Out / Reset to login form
  const handleLogOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setTab('login');
      setErrorMsg(null);
      setSuccessMsg(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md overflow-y-auto select-text"
    >
      {/* 8-Bit Pixel Frame Dialog Box */}
      <div className="relative w-full max-w-md my-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-[3px] border-amber-500 shadow-[6px_6px_0_#000000] p-4 sm:p-6 flex flex-col items-center text-center">
        
        {/* Corner 8-Bit Studs */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-yellow-400 border border-black shadow-[1px_1px_0_#000]" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 border border-black shadow-[1px_1px_0_#000]" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-yellow-400 border border-black shadow-[1px_1px_0_#000]" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-yellow-400 border border-black shadow-[1px_1px_0_#000]" />

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <PixelChick className="w-5 h-5 animate-bounce" />
          <span className="font-pixel-arcade text-yellow-400 text-xs sm:text-sm tracking-wider font-bold drop-shadow-[0_2px_0_#3b1302]">
            COCK A DOODLE
          </span>
          <PixelRooster className="w-5 h-5 animate-bounce" />
        </div>

        <h2 className="font-pixel-arcade text-[10px] sm:text-xs text-amber-200 uppercase tracking-widest mb-4">
          ★ ADVENTURER PASSPORT GATEWAY ★
        </h2>

        {/* Tab Selector: Login / Register (Hidden on verification screen) */}
        {tab !== 'verify' && (
          <div className="w-full flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 font-pixel-arcade text-[9px] sm:text-[10px] border-2 border-black transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-yellow-400 text-slate-950 font-bold shadow-[2px_2px_0_#000000]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 font-pixel-arcade text-[9px] sm:text-[10px] border-2 border-black transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-yellow-400 text-slate-950 font-bold shadow-[2px_2px_0_#000000]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              REGISTER
            </button>
          </div>
        )}

        {/* Alert & Notice Messages */}
        {errorMsg && (
          <div className="w-full mb-3 p-2 bg-red-950/90 border-2 border-red-500 flex items-start gap-2 text-left shadow-[2px_2px_0_#000]">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-pixel text-[8.5px] sm:text-[9.5px] text-red-200 leading-tight">
              {errorMsg}
            </span>
          </div>
        )}

        {successMsg && (
          <div className="w-full mb-3 p-2 bg-emerald-950/90 border-2 border-emerald-500 flex items-start gap-2 text-left shadow-[2px_2px_0_#000]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="font-pixel text-[8.5px] sm:text-[9.5px] text-emerald-200 leading-tight">
              {successMsg}
            </span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODE 1: LOGIN FORM
            ══════════════════════════════════════════════════════════ */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-2.5 text-left">
            <div>
              <label className="block font-pixel text-[8.5px] text-yellow-300 mb-1">
                REGISTERED EMAIL:
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hero@farm.com"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 pl-8 pr-3 py-2 font-pixel text-[9px] sm:text-[10px] text-yellow-100 placeholder:text-slate-600 outline-none shadow-[inset_1px_1px_2px_#000] select-text cursor-text"
                />
              </div>
            </div>

            <div>
              <label className="block font-pixel text-[8.5px] text-yellow-300 mb-1">
                PASSWORD:
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 pl-8 pr-3 py-2 font-pixel text-[9px] sm:text-[10px] text-yellow-100 placeholder:text-slate-600 outline-none shadow-[inset_1px_1px_2px_#000] select-text cursor-text"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-0.5">
              <button
                type="button"
                onClick={() => { setTab('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                className="font-pixel text-[8px] text-amber-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
              <span className="font-pixel text-[8px] text-slate-500">
                Email verification required
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 border-[2.5px] border-black text-slate-950 font-pixel-arcade text-[9.5px] sm:text-[10.5px] font-bold shadow-[3px_3px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer disabled:opacity-50"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN & PLAY ▶'}
            </button>

            {/* Quick Google Sign In */}
            <div className="relative my-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <span className="relative px-2 bg-slate-900 font-pixel text-[7.5px] text-slate-400">
                OR QUICK SIGN-IN
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border-2 border-black text-slate-200 font-pixel text-[8.5px] sm:text-[9.5px] shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-transform cursor-pointer flex items-center justify-center gap-2"
            >
              <span>SIGN IN WITH GOOGLE</span>
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODE 2: REGISTRATION FORM
            ══════════════════════════════════════════════════════════ */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="w-full flex flex-col gap-2.5 text-left">
            <div>
              <label className="block font-pixel text-[8.5px] text-yellow-300 mb-1">
                ADVENTURER NICKNAME (OPTIONAL):
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoComplete="nickname"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Mighty Clucker"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 pl-8 pr-3 py-2 font-pixel text-[9px] sm:text-[10px] text-yellow-100 placeholder:text-slate-600 outline-none shadow-[inset_1px_1px_2px_#000] select-text cursor-text"
                />
              </div>
            </div>

            <div>
              <label className="block font-pixel text-[8.5px] text-yellow-300 mb-1">
                EMAIL ADDRESS (FOR VERIFICATION):
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hero@farm.com"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 pl-8 pr-3 py-2 font-pixel text-[9px] sm:text-[10px] text-yellow-100 placeholder:text-slate-600 outline-none shadow-[inset_1px_1px_2px_#000] select-text cursor-text"
                />
              </div>
            </div>

            <div>
              <label className="block font-pixel text-[8.5px] text-yellow-300 mb-1">
                PASSWORD (MIN 6 CHARS):
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 pl-8 pr-3 py-2 font-pixel text-[9px] sm:text-[10px] text-yellow-100 placeholder:text-slate-600 outline-none shadow-[inset_1px_1px_2px_#000] select-text cursor-text"
                />
              </div>
            </div>

            <div>
              <label className="block font-pixel text-[8.5px] text-yellow-300 mb-1">
                CONFIRM PASSWORD:
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 pl-8 pr-3 py-2 font-pixel text-[9px] sm:text-[10px] text-yellow-100 placeholder:text-slate-600 outline-none shadow-[inset_1px_1px_2px_#000] select-text cursor-text"
                />
              </div>
            </div>

            <div className="p-2 bg-yellow-950/40 border border-yellow-700/60 font-pixel text-[8px] text-yellow-200">
              ℹ A verification link will be sent to your email. You must click it before playing!
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 border-[2.5px] border-black text-slate-950 font-pixel-arcade text-[9.5px] sm:text-[10.5px] font-bold shadow-[3px_3px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer disabled:opacity-50"
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER & SEND EMAIL ▶'}
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODE 3: VERIFICATION EMAIL PENDING SCREEN
            ══════════════════════════════════════════════════════════ */}
        {tab === 'verify' && (
          <div className="w-full flex flex-col items-center gap-3 py-2">
            <div className="w-14 h-14 bg-yellow-950/60 border-2 border-yellow-400 flex items-center justify-center shadow-[3px_3px_0_#000]">
              <Mail className="w-8 h-8 text-yellow-300 animate-pulse" />
            </div>

            <h3 className="font-pixel-arcade text-xs text-yellow-300">
              VERIFICATION EMAIL SENT!
            </h3>

            <div className="w-full p-3 bg-slate-950 border-2 border-slate-800 text-left font-pixel text-[9px] text-slate-300 space-y-2">
              <p>
                A verification link has been delivered to:
              </p>
              <p className="font-bold text-yellow-400 break-all bg-slate-900 p-1.5 border border-slate-700">
                {auth.currentUser?.email || email}
              </p>
              <p className="text-[8px] text-slate-400">
                1. Open your email inbox (and check Spam/Junk folder if needed).<br />
                2. Click the verification link from Firebase.<br />
                3. Come back here and tap <strong>CHECK VERIFICATION STATUS</strong> below.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={handleCheckVerification}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 border-2 border-black text-slate-950 font-pixel-arcade text-[9.5px] font-bold shadow-[3px_3px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-transform cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>CHECK VERIFICATION STATUS ↺</span>
              </button>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading || resendCooldown > 0}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 border-2 border-black text-yellow-300 font-pixel text-[8.5px] shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-transform cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {resendCooldown > 0 ? `RESEND AVAILABLE IN ${resendCooldown}s` : 'RESEND VERIFICATION EMAIL'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogOut}
                disabled={loading}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 font-pixel text-[8px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-1"
              >
                <LogOut className="w-3 h-3" />
                <span>USE DIFFERENT ACCOUNT / LOG OUT</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODE 4: FORGOT PASSWORD
            ══════════════════════════════════════════════════════════ */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="w-full flex flex-col gap-2.5 text-left">
            <p className="font-pixel text-[8.5px] text-slate-300 mb-1">
              Enter your registered email and we will send you a password reset link:
            </p>

            <div>
              <label className="block font-pixel text-[8.5px] text-yellow-300 mb-1">
                REGISTERED EMAIL:
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hero@farm.com"
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 pl-8 pr-3 py-2 font-pixel text-[9px] text-yellow-100 placeholder:text-slate-600 outline-none shadow-[inset_1px_1px_2px_#000] select-text cursor-text"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 bg-yellow-400 hover:bg-yellow-300 border-2 border-black text-slate-950 font-pixel-arcade text-[9.5px] font-bold shadow-[3px_3px_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-transform cursor-pointer"
            >
              {loading ? 'SENDING LINK...' : 'SEND RESET LINK ▶'}
            </button>

            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className="w-full text-center font-pixel text-[8.5px] text-slate-400 hover:text-white mt-1 cursor-pointer"
            >
              ← Back to Login
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="mt-4 pt-2 border-t border-slate-800 w-full flex items-center justify-between text-[7.5px] font-pixel text-slate-500">
          <span>SECURED BY FIREBASE AUTH</span>
          <span>EMAIL VERIFICATION ENFORCED</span>
        </div>
      </div>
    </div>
  );
};
