import React, { useState } from 'react';
import { 
  Compass, 
  Globe, 
  Map as MapIcon, 
  Image as ImageIcon, 
  BookOpen, 
  BarChart3, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2,
  Sparkles,
  Heart,
  MoreHorizontal,
  User,
  LogOut,
  ChevronDown,
  UserCheck,
  Bookmark,
  Printer,
  MapPin,
  SlidersHorizontal,
  CheckSquare,
  Square,
  DollarSign,
  Wand2
} from 'lucide-react';
import { AppView, FilterState, UserProfile, OptionalFeatures } from '../types';
import { TravelStats } from '../utils/storage';
import { Avatar } from './Avatar';
import { findCountry } from '../data/countries';

interface NavbarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  stats: TravelStats;
  currentUser: UserProfile;
  wishlistCount: number;
  features: OptionalFeatures;
  onToggleFeature: (featureKey: keyof OptionalFeatures) => void;
  onOpenAuthModal: () => void;
  onOpenNewEntry: () => void;
  onOpenPosterModal: () => void;
  onOpenPinModal: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDemo: () => void;
  onClearAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  filter,
  setFilter,
  stats,
  currentUser,
  wishlistCount,
  features,
  onToggleFeature,
  onOpenAuthModal,
  onOpenNewEntry,
  onOpenPosterModal,
  onOpenPinModal,
  onExport,
  onImport,
  onResetDemo,
  onClearAll
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const homeCountry = findCountry(currentUser.homeCountryCode);

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'map', label: 'Atlas Map', icon: <MapIcon className="w-4 h-4" />, badge: stats.totalVisitedCountries },
    { id: 'diary', label: 'Travel Diary', icon: <BookOpen className="w-4 h-4" />, badge: stats.totalMemoriesCount },
    ...(features.bucketList ? [{ id: 'wishlist' as AppView, label: 'Bucket List', icon: <Bookmark className="w-4 h-4" />, badge: wishlistCount }] : []),
    { id: 'gallery', label: 'Photo Gallery', icon: <ImageIcon className="w-4 h-4" />, badge: stats.totalPhotosCount },
    { id: 'stats', label: features.budgetExpenses ? 'Passport & Budget' : 'Passport & Stats', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e9ecef] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[72px] sm:min-h-[80px] py-2.5 sm:py-3 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-9 flex-1">
            <button 
              onClick={() => setActiveView('map')}
              className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none cursor-pointer min-w-9"
              id="brand-logo-btn"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#2563eb] rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-[#1d4ed8] transition-colors flex-shrink-0">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="text-base sm:text-xl font-bold tracking-tight text-[#1a1a1a] font-display truncate">
                    Memory Atlas
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#f1f5f9] text-[#2563eb] border border-[#e2e8f0] hidden xs:inline-block">
                    TRAVEL JOURNAL
                  </span>
                </div>
                {/* Prominent country visited stats counter */}
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 mt-0.5 min-w-0">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-[#1e293b] bg-blue-50 border border-blue-100 px-1.5 sm:px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="text-blue-700 font-bold">{stats.totalVisitedCountries} / 195</span>
                    <span className="text-blue-600 font-normal">visited</span>
                  </span>
                  <span className="text-[11px] text-[#64748b] hidden md:inline">
                    • {stats.percentageOfWorld}% of world explored
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center p-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#2563eb] shadow-xs font-bold'
                      : 'text-[#64748b] hover:text-[#1e293b] hover:bg-white/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive 
                          ? 'bg-[#e0f2fe] text-[#2563eb] font-bold' 
                          : 'bg-[#e2e8f0] text-[#64748b]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Quick Search */}
            <div className={`relative hidden xl:flex items-center transition-all ${searchFocused ? 'w-52' : 'w-40'}`}>
              <Search className="w-4 h-4 absolute left-3 text-[#94a3b8] pointer-events-none" />
              <input
                type="text"
                id="navbar-search-input"
                placeholder="Search atlas..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-full text-xs text-[#1a1a1a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all"
              />
              {filter.search && (
                <button
                  onClick={() => setFilter(prev => ({ ...prev, search: '' }))}
                  className="absolute right-2.5 text-xs text-[#94a3b8] hover:text-[#1a1a1a] cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Poster Generator Button */}
            {features.posterGenerator && (
              <button
                id="navbar-poster-btn"
                onClick={onOpenPosterModal}
                title="Generate Souvenir Travel Poster"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Poster</span>
              </button>
            )}

            {/* Pin Landmark Button */}
            {features.landmarkPinning && (
              <button
                id="navbar-pin-btn"
                onClick={onOpenPinModal}
                title="Pin Specific City or Landmark"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Pin Place</span>
              </button>
            )}

            {/* Favorite Filter Toggle */}
            <button
              id="navbar-favorite-filter-btn"
              onClick={() => setFilter(prev => ({ ...prev, favoriteOnly: !prev.favoriteOnly }))}
              title={filter.favoriteOnly ? "Show all entries" : "Show starred favorites"}
              className={`max-[359px]:hidden p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                filter.favoriteOnly
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-[#e2e8f0] text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8fafc]'
              }`}
            >
              <Heart className={`w-4 h-4 ${filter.favoriteOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Record New Journey Button */}
            <button
              id="navbar-add-entry-btn"
              onClick={onOpenNewEntry}
              title="Add country, photos, and travel memories"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-[#2563eb] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#1d4ed8] shadow-sm transition-all active:scale-95 cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Journey</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* User Login & Profile Dropdown */}
            <div className="relative">
              <button
                id="navbar-user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={`Logged in as ${currentUser.name}`}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <Avatar
                  user={currentUser}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
                  textClassName="text-[9px]"
                />
                <div className="hidden 2xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#1e293b] leading-tight flex items-center gap-1">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-none">
                    {homeCountry?.flag || '🌍'} {homeCountry?.name || currentUser.homeCountryCode}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl z-50 p-2 text-xs text-[#1e293b] font-sans animate-fade-in">
                    {/* User Card Header */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          user={currentUser}
                          className="w-10 h-10 rounded-full"
                          textClassName="text-xs"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm text-[#1e293b] truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {currentUser.email}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                              {currentUser.travelerLevel || 'Explorer'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {stats.totalVisitedCountries} visited
                            </span>
                          </div>
                        </div>
                      </div>
                      {currentUser.bio && (
                        <p className="text-[11px] text-slate-600 mt-2 italic line-clamp-2">
                          "{currentUser.bio}"
                        </p>
                      )}
                    </div>

                    {/* Menu Actions */}
                    <button
                      id="user-menu-switch-account-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer text-[#1e293b]"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Switch / Login Account</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        Sign In
                      </span>
                    </button>

                    <button
                      id="user-menu-edit-profile-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer text-[#1e293b]"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Manage Traveler Profiles</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      id="user-menu-signout-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Switch Traveler / Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Backup & Settings Menu */}
            <div className="relative">
              <button
                id="navbar-menu-toggle-btn"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                title="Options & Data"
                className="p-2 rounded-xl bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8fafc] transition-all cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSettingsMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl z-50 p-2 text-xs text-[#1e293b] font-sans">
                    {/* Optional Features Selection with Checkboxes */}
                    <div className="px-2.5 py-1.5 border-b border-[#f1f5f9] mb-1.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#1e293b] flex items-center gap-1.5 text-xs">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563eb]" />
                          <span>Feature Modules (Optional)</span>
                        </p>
                        <p className="text-[10px] text-[#64748b]">Select active features with checkboxes</p>
                      </div>
                    </div>

                    <div className="space-y-1 mb-2">
                      {/* 1. Bucket List & Wishlist */}
                      <label 
                        htmlFor="feature-checkbox-bucket-list"
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          id="feature-checkbox-bucket-list"
                          checked={features.bucketList}
                          onChange={() => onToggleFeature('bucketList')}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#2563eb]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Bookmark className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span className="font-semibold text-[#1e293b] text-xs">Bucket List & Wishlist</span>
                          </div>
                          <p className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                            Dream destinations, target years, activities & budget estimates
                          </p>
                        </div>
                      </label>

                      {/* 2. Travel Souvenir Poster Generator */}
                      <label 
                        htmlFor="feature-checkbox-poster"
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          id="feature-checkbox-poster"
                          checked={features.posterGenerator}
                          onChange={() => onToggleFeature('posterGenerator')}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#2563eb]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Printer className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span className="font-semibold text-[#1e293b] text-xs">Souvenir Poster Generator</span>
                          </div>
                          <p className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                            Exportable high-res map canvas, themes & passport stamps
                          </p>
                        </div>
                      </label>

                      {/* 3. Multi-City & Landmark Pinning */}
                      <label 
                        htmlFor="feature-checkbox-pins"
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          id="feature-checkbox-pins"
                          checked={features.landmarkPinning}
                          onChange={() => onToggleFeature('landmarkPinning')}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#2563eb]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span className="font-semibold text-[#1e293b] text-xs">Multi-City & Landmark Pins</span>
                          </div>
                          <p className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                            Sub-national pins for cities, landmarks, stays & dining
                          </p>
                        </div>
                      </label>

                      {/* 4. Travel Expenses & Budget Tracker */}
                      <label 
                        htmlFor="feature-checkbox-expenses"
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          id="feature-checkbox-expenses"
                          checked={features.budgetExpenses}
                          onChange={() => onToggleFeature('budgetExpenses')}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#2563eb]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="font-semibold text-[#1e293b] text-xs">Expenses & Budget Tracker</span>
                          </div>
                          <p className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                            Categorized trip ledgers, average cost & burn rate analytics
                          </p>
                        </div>
                      </label>

                      {/* 5. AI Travel Story Polisher & Insights */}
                      <label 
                        htmlFor="feature-checkbox-ai"
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          id="feature-checkbox-ai"
                          checked={features.aiAssistant}
                          onChange={() => onToggleFeature('aiAssistant')}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#2563eb]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                            <span className="font-semibold text-[#1e293b] text-xs">AI Story Polisher & Insights</span>
                          </div>
                          <p className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                            Gemini literary narrative polisher, local tips & etiquette
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="my-1.5 border-t border-[#f1f5f9]" />

                    {/* Data Storage & Management */}
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                      Storage & Data
                    </div>

                    <button
                      id="menu-export-json-btn"
                      onClick={() => {
                        onExport();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#f8fafc] text-left transition-colors cursor-pointer text-[#1e293b]"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Export JSON Backup</span>
                    </button>

                    <label 
                      htmlFor="import-json-file"
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#f8fafc] text-left transition-colors cursor-pointer text-[#1e293b]"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>Restore from JSON File</span>
                      <input
                        id="import-json-file"
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          onImport(e);
                          setShowSettingsMenu(false);
                        }}
                        className="hidden"
                      />
                    </label>

                    <button
                      id="menu-reset-demo-btn"
                      onClick={() => {
                        onResetDemo();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#f8fafc] text-[#2563eb] text-left transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reload Sample Demo Trips</span>
                    </button>

                    <button
                      id="menu-clear-all-btn"
                      onClick={() => {
                        onClearAll();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 text-left transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Travel History</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around py-1.5 border-t border-[#e9ecef] -mx-4 px-2 bg-white/95 backdrop-blur-xs">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveView(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-2 min-h-[44px] rounded-xl text-[11px] font-medium transition-all active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-[#2563eb] font-bold bg-blue-50/80 shadow-2xs'
                    : 'text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-0.5 bg-[#2563eb] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="leading-tight text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
