import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Compass, 
  ShieldCheck, 
  UserCheck, 
  LogOut,
  UserPlus
} from 'lucide-react';
import { UserProfile, AuthCredentials } from '../types';
import { 
  getRegisteredUsers, 
  loginUser, 
  registerNewUser, 
  loginAsGuest, 
  setCurrentUser,
  DEFAULT_PROFILES 
} from '../utils/auth';
import { COUNTRIES_DATA } from '../data/countries';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile, message?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'switch'>('signin');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [homeCountryCode, setHomeCountryCode] = useState('US');
  const [selectedAvatar, setSelectedAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const registeredUsers = getRegisteredUsers();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = loginUser(email, password);
      setLoading(false);
      if (res.success && res.user) {
        onUserChange(res.user, `Welcome back, ${res.user.name}!`);
        onClose();
      } else {
        setError(res.error || 'Failed to sign in. Please check your credentials.');
      }
    }, 300);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const creds: AuthCredentials = {
        name,
        email,
        password,
        homeCountryCode,
        avatar: selectedAvatar
      };
      const res = registerNewUser(creds);
      setLoading(false);
      if (res.success && res.user) {
        onUserChange(res.user, `Account created! Welcome to your travel journal, ${res.user.name}!`);
        onClose();
      } else {
        setError(res.error || 'Failed to create account.');
      }
    }, 350);
  };

  const handleSelectExistingUser = (user: UserProfile) => {
    const active = setCurrentUser(user.id);
    if (active) {
      onUserChange(active, `Switched traveler profile to ${active.name}`);
      onClose();
    }
  };

  const handleGuestLogin = () => {
    const guest = loginAsGuest();
    onUserChange(guest, 'Logged in as Guest Explorer');
    onClose();
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#2C3259] px-6 pt-6 pb-5 text-white relative">
          <button
            onClick={onClose}
            id="auth-modal-close-btn"
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Traveler Account</h2>
              <p className="text-xs text-slate-300">
                Manage your visited countries, passport, and photos
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 mt-5 p-1 bg-black/20 rounded-xl">
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => { setTab('signin'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-white text-[#1e293b] shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => { setTab('signup'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white text-[#1e293b] shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              id="auth-tab-switch"
              onClick={() => { setTab('switch'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'switch'
                  ? 'bg-white text-[#1e293b] shadow-xs'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Switch Profile
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <span className="font-semibold text-rose-800">Error:</span>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    id="signin-email-input"
                    required
                    placeholder="e.g. explorer@travel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1e293b] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    id="signin-password-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1e293b] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="signin-submit-btn"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Journal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Profiles Strip */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Or Quick-Select Explorer Account:
                </p>
                <div className="space-y-1.5">
                  {registeredUsers.slice(0, 3).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectExistingUser(user)}
                      className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="signup-name-input"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1e293b] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    id="signup-email-input"
                    required
                    placeholder="e.g. alex.rivera@travel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1e293b] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1e293b] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      id="signup-password-input"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1e293b] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1e293b] mb-1">
                    Home Base
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      id="signup-home-country-select"
                      value={homeCountryCode}
                      onChange={(e) => setHomeCountryCode(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1e293b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    >
                      {COUNTRIES_DATA.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#1e293b] mb-1.5">
                  Choose Profile Photo
                </label>
                <div className="flex items-center gap-2">
                  {avatarPresets.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-transform cursor-pointer ${
                        selectedAvatar === url 
                          ? 'border-blue-600 scale-110 shadow-sm' 
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                      {selectedAvatar === url && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="signup-submit-btn"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Create Traveler Account'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: SWITCH PROFILE */}
          {tab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Select an existing traveler profile or switch to a different account:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {registeredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectExistingUser(user)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-[#1e293b]">
                              {user.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-semibold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {user.email} • Base: {user.homeCountryCode}
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <Check className="w-5 h-5 text-blue-600" />
                      ) : (
                        <span className="text-xs text-blue-600 font-semibold">
                          Switch
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  type="button"
                  id="auth-guest-mode-btn"
                  onClick={handleGuestLogin}
                  className="text-xs text-slate-600 hover:text-[#1e293b] font-medium py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Continue as Guest
                </button>

                <button
                  type="button"
                  onClick={() => { setTab('signup'); setError(null); }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  + Add New Profile
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Private & securely saved per profile
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
