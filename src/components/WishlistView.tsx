import React, { useState, useMemo } from 'react';
import { WishlistItem, WishlistPriority, Continent, CountryInfo } from '../types';
import { COUNTRIES_DATA, findCountry } from '../data/countries';
import { 
  Compass, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Check, 
  Star, 
  PlaneTakeoff, 
  ArrowRight,
  Filter,
  Search,
  MapPin,
  Flame,
  Globe2,
  Bookmark
} from 'lucide-react';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  onAddWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt'>) => void;
  onRemoveWishlistItem: (id: string) => void;
  onConvertWishlistToMemory: (item: WishlistItem) => void;
  onSelectCountryForMap: (country: CountryInfo) => void;
}

export function WishlistView({
  wishlist,
  onAddWishlistItem,
  onRemoveWishlistItem,
  onConvertWishlistToMemory,
  onSelectCountryForMap
}: WishlistViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State for new dream destination
  const [formCountryCode, setFormCountryCode] = useState<string>('IS');
  const [formTargetYear, setFormTargetYear] = useState<string>(String(new Date().getFullYear() + 1));
  const [formPriority, setFormPriority] = useState<WishlistPriority>('dream');
  const [formBudget, setFormBudget] = useState<string>('2500');
  const [formCurrency, setFormCurrency] = useState<string>('USD');
  const [formActivities, setFormActivities] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Filtered wishlist
  const filteredWishlist = useMemo(() => {
    return wishlist.filter(item => {
      if (selectedContinent !== 'ALL' && item.continent !== selectedContinent) return false;
      if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCountry = item.countryName.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        const matchActs = item.dreamActivities?.some(a => a.toLowerCase().includes(q));
        if (!matchCountry && !matchNotes && !matchActs) return false;
      }
      return true;
    });
  }, [wishlist, selectedContinent, selectedPriority, searchQuery]);

  // Aggregate stats
  const totalBudgetEst = useMemo(() => {
    return wishlist.reduce((sum, item) => sum + (item.estimatedBudget || 0), 0);
  }, [wishlist]);

  const dreamCount = useMemo(() => {
    return wishlist.filter(i => i.priority === 'dream').length;
  }, [wishlist]);

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    const country = findCountry(formCountryCode);
    if (!country) return;

    const activityList = formActivities
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    onAddWishlistItem({
      countryCode: country.code.toUpperCase(),
      countryName: country.name,
      countryFlag: country.flag,
      continent: country.continent,
      targetYear: formTargetYear || undefined,
      priority: formPriority,
      estimatedBudget: formBudget ? parseFloat(formBudget) : undefined,
      currency: formCurrency,
      dreamActivities: activityList,
      notes: formNotes || undefined
    });

    setIsAddModalOpen(false);
    setFormNotes('');
    setFormActivities('');
  };

  const getPriorityBadge = (priority: WishlistPriority) => {
    switch (priority) {
      case 'dream':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            Top Dream
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Star className="w-3 h-3 text-blue-500 fill-blue-500" />
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            Medium
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5 fill-amber-500" />
            Travel Bucket List & Dream Destinations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Next Horizons to Explore
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Curate and budget your future expeditions. Countries added here glow in golden amber on your 2D & 3D maps.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Dream Destination
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bucket List Total</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {wishlist.length} <span className="text-xs font-normal text-slate-500">Destinations</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Top Priority Dreams</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {dreamCount} <span className="text-xs font-normal text-slate-500">Must-Go</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Timeframe</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {new Date().getFullYear()} — {new Date().getFullYear() + 4}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimated Budget</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalBudgetEst.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dream destinations, activities, or notes..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Priority & Continent filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="dream">🔥 Top Dream</option>
            <option value="high">⭐ High Priority</option>
            <option value="medium">Medium</option>
          </select>

          <select
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Continents</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Africa">Africa</option>
            <option value="Oceania">Oceania</option>
          </select>
        </div>
      </div>

      {/* Grid of Wishlist Cards */}
      {filteredWishlist.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No dream destinations match</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Start adding your dream countries and future travel bucket list items!
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Add First Destination
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWishlist.map(item => {
            const countryInfo = findCountry(item.countryCode);
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  
                  {/* Top Row: Flag, Name, Priority Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl filter drop-shadow-sm">{item.countryFlag}</span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {item.countryName}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {item.continent}
                        </span>
                      </div>
                    </div>
                    <div>{getPriorityBadge(item.priority)}</div>
                  </div>

                  {/* Details Pill Ribbon: Target Year & Budget */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {item.targetYear && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        Target: {item.targetYear}
                      </span>
                    )}
                    {item.estimatedBudget && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        Est: {item.estimatedBudget.toLocaleString()} {item.currency || 'USD'}
                      </span>
                    )}
                  </div>

                  {/* Dream Activities */}
                  {item.dreamActivities && item.dreamActivities.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Must-Do Activities
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.dreamActivities.map((act, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 font-medium border border-amber-500/20"
                          >
                            ✦ {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 leading-relaxed italic">
                      "{item.notes}"
                    </p>
                  )}

                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  
                  {/* Mark as Visited Conversion Button */}
                  <button
                    onClick={() => onConvertWishlistToMemory(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors cursor-pointer"
                  >
                    <PlaneTakeoff className="w-3.5 h-3.5" />
                    Turn into Journey Memoir
                  </button>

                  {/* Quick Locate On Map */}
                  {countryInfo && (
                    <button
                      onClick={() => onSelectCountryForMap(countryInfo)}
                      title="View on Map"
                      className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                    >
                      <Globe2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Item */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${item.countryName} from your travel bucket list?`)) {
                        onRemoveWishlistItem(item.id);
                      }
                    }}
                    title="Remove from Bucket List"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Dream Destination Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 dark:text-white">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 fill-amber-500" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Add to Travel Bucket List</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNewItem} className="p-6 space-y-4">
              
              {/* Country Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Destination / Country
                </label>
                <select
                  value={formCountryCode}
                  onChange={(e) => setFormCountryCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                >
                  {COUNTRIES_DATA.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.continent})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority & Target Year */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as WishlistPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="dream">🔥 Top Dream Destination</option>
                    <option value="high">⭐ High Priority</option>
                    <option value="medium">Medium Priority</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Year</label>
                  <input
                    type="number"
                    min="2025"
                    max="2035"
                    value={formTargetYear}
                    onChange={(e) => setFormTargetYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Budget & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estimated Budget</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="e.g. 3000"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Currency</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
              </div>

              {/* Dream Activities */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Dream Activities & Bucket List Goals (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photograph Diamond Beach, Scuba Dive Coral Reef, Taste Street Food"
                  value={formActivities}
                  onChange={(e) => setFormActivities(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notes & Inspiration
                </label>
                <textarea
                  rows={3}
                  placeholder="Why do you want to visit? What sparked this dream trip?"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  Save Dream Destination
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
