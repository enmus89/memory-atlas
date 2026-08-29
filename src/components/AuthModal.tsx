import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Globe,
  ArrowRight,
  Check,
  Compass,
  ShieldCheck,
  LogOut,
  MailCheck,
  Camera,
  Loader2
} from 'lucide-react';
import { UserProfile, AuthCredentials } from '../types';
import { loginUser, registerNewUser, sendPasswordReset, saveUserAvatar } from '../utils/auth';
import { uploadAvatar } from '../utils/photos';
import { COUNTRIES_DATA } from '../data/countries';
import { Avatar } from './Avatar';

interface AuthModalProps {
  isOpen: boolean;
  /** False when the modal is the sign-in gate: there is nothing behind it. */
  dismissable: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthenticated: (user: UserProfile, message?: string) => void;
  onSignOut: () => void;
  /** Called after the signed-in user changes their own avatar. */
  onProfileUpdated?: (user: UserProfile) => void;
}

const inputClass =
  'w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1e293b] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  dismissable,
  onClose,
  currentUser,
  onAuthenticated,
  onSignOut,
  onProfileUpdated
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [homeCountryCode, setHomeCountryCode] = useState('US');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetFeedback = () => {
    setError(null);
    setNotice(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success && res.user) {
      setPassword('');
      onAuthenticated(res.user, `Welcome back, ${res.user.name}!`);
      onClose();
    } else {
      setError(res.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setLoading(true);

    const creds: AuthCredentials = {
      name,
      email,
      password,
      homeCountryCode
    };
    const res = await registerNewUser(creds);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create account.');
      return;
    }

    setPassword('');

    if (res.needsEmailConfirmation) {
      setNotice(
        `We sent a confirmation link to ${email}. Click it to activate your account, then sign in.`
      );
      setTab('signin');
      return;
    }

    if (res.user) {
      onAuthenticated(res.user, `Account created! Welcome to your travel journal, ${res.user.name}!`);
      onClose();
    }
  };

  const handleForgotPassword = async () => {
    resetFeedback();
    if (!email) {
      setError('Enter your email address first, then choose "Forgot password".');
      return;
    }
    setLoading(true);
    const res = await sendPasswordReset(email);
    setLoading(false);
    if (res.success) {
      setNotice(`If an account exists for ${email}, a reset link is on its way.`);
    } else {
      setError(res.error || 'Could not send the reset email.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentUser) return;

    resetFeedback();
    setUploadingAvatar(true);
    try {
      // Downscaled and stored in the user's own private folder, same as trip
      // photos; only the path is persisted, and it is re-signed on each load.
      const { path } = await uploadAvatar(currentUser.id, file);
      const updated = await saveUserAvatar(path);
      onProfileUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const showAccountPanel = Boolean(currentUser) && dismissable;

  return (
    <div
      className={`${
        dismissable ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs' : 'relative'
      } flex items-center justify-center p-4 font-sans animate-fade-in`}
      onClick={dismissable ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#2C3259] px-6 pt-6 pb-5 text-white relative">
          {dismissable && (
            <button
              onClick={onClose}
              id="auth-modal-close-btn"
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {showAccountPanel ? 'Your Account' : 'Memory Atlas'}
              </h2>
              <p className="text-xs text-slate-300">
                {showAccountPanel
                  ? 'Your trips, photos, and passport'
                  : 'Sign in to your travel journal'}
              </p>
            </div>
          </div>

          {!showAccountPanel && (
            <div className="flex items-center gap-1.5 mt-5 p-1 bg-black/20 rounded-xl">
              {(['signin', 'signup'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  id={`auth-tab-${mode}`}
                  onClick={() => {
                    setTab(mode);
                    resetFeedback();
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    tab === mode
                      ? 'bg-white text-[#1e293b] shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <span className="font-semibold text-rose-800 flex-shrink-0">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
              <MailCheck className="w-4 h-4 flex-shrink-0 mt-px" />
              <span>{notice}</span>
            </div>
          )}

          {/* Signed-in account panel */}
          {showAccountPanel && currentUser && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <label
                  className="relative group cursor-pointer flex-shrink-0"
                  title="Upload a profile picture"
                >
                  <Avatar
                    user={currentUser}
                    className="w-14 h-14 rounded-2xl"
                    textClassName="text-lg"
                  />
                  <span className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadingAvatar ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </span>
                  <input
                    id="avatar-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingAvatar}
                    onChange={handleAvatarUpload}
                  />
                </label>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1e293b] truncate">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full">
                    {currentUser.travelerLevel || 'Explorer'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                {uploadingAvatar
                  ? 'Uploading your picture…'
                  : 'Click your picture to upload one of your own.'}
              </p>

              {currentUser.bio && (
                <p className="text-xs text-slate-600 italic bg-slate-50 border border-slate-200 rounded-xl p-3">
                  "{currentUser.bio}"
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Your trips and photos are private to this account.</span>
              </div>

              <button
                type="button"
                id="auth-signout-btn"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#1e293b] font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Sign in */}
          {!showAccountPanel && tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    id="signin-email-input"
                    required
                    autoComplete="email"
                    placeholder="e.g. explorer@travel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    id="signin-password-input"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                id="signin-submit-btn"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{loading ? 'Signing in…' : 'Sign In to Journal'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full text-xs text-slate-500 hover:text-blue-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Forgot your password?
              </button>
            </form>
          )}

          {/* Create account */}
          {!showAccountPanel && tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="signup-name-input"
                    required
                    autoComplete="name"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    id="signup-email-input"
                    required
                    autoComplete="email"
                    placeholder="e.g. explorer@travel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    id="signup-password-input"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">Home Country</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    id="signup-country-select"
                    value={homeCountryCode}
                    onChange={(e) => setHomeCountryCode(e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    {COUNTRIES_DATA.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="signup-submit-btn"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{loading ? 'Creating account…' : 'Create My Atlas'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Your trips and photos are private to your account and are never shown to other travelers.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
