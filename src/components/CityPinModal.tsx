import React, { useState } from 'react';
import { CityPin, PinCategory } from '../types';
import { POPULAR_CITIES_AND_LANDMARKS, PredefinedCity } from '../data/cities';
import { COUNTRIES_DATA, findCountry } from '../data/countries';
import { 
  MapPin, 
  X, 
  Search, 
  Star, 
  Compass, 
  Landmark, 
  Trees, 
  Utensils, 
  Bed, 
  Building2,
  Plus
} from 'lucide-react';

interface CityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePin: (pin: CityPin) => void;
  onDeletePin?: (id: string) => void;
  initialPin?: CityPin | null;
  initialCoordinates?: [number, number];
  initialCountryCode?: string;
}

export function CityPinModal({
  isOpen,
  onClose,
  onSavePin,
  onDeletePin,
  initialPin,
  initialCoordinates,
  initialCountryCode
}: CityPinModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<PredefinedCity | null>(null);

  // Form Fields
  const [name, setName] = useState(initialPin ? initialPin.name : '');
  const [countryCode, setCountryCode] = useState(initialPin ? initialPin.countryCode : (initialCountryCode || 'JP'));
  const [lng, setLng] = useState<number>(initialPin ? initialPin.coordinates[0] : (initialCoordinates ? initialCoordinates[0] : 139.6917));
  const [lat, setLat] = useState<number>(initialPin ? initialPin.coordinates[1] : (initialCoordinates ? initialCoordinates[1] : 35.6895));
  const [category, setCategory] = useState<PinCategory>(initialPin ? initialPin.category : 'city');
  const [rating, setRating] = useState<number>(initialPin?.rating || 5);
  const [notes, setNotes] = useState<string>(initialPin?.notes || '');

  // Keep form in sync when initialPin changes
  React.useEffect(() => {
    if (initialPin) {
      setName(initialPin.name);
      setCountryCode(initialPin.countryCode);
      setLng(initialPin.coordinates[0]);
      setLat(initialPin.coordinates[1]);
      setCategory(initialPin.category);
      setRating(initialPin.rating || 5);
      setNotes(initialPin.notes || '');
    }
  }, [initialPin]);

  const filteredPresets = POPULAR_CITIES_AND_LANDMARKS.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.countryName.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const handleSelectPreset = (p: PredefinedCity) => {
    setSelectedPreset(p);
    setName(p.name);
    setCountryCode(p.countryCode);
    setLng(p.coordinates[0]);
    setLat(p.coordinates[1]);
    setCategory(p.category);
    setNotes(p.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSavePin({
      id: initialPin ? initialPin.id : `pin-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      countryCode: countryCode.toUpperCase(),
      coordinates: [Number(lng), Number(lat)],
      category,
      rating,
      notes: notes.trim() || undefined,
      visitedDate: initialPin?.visitedDate || new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Pin City or Specific Landmark</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pin exact cities, mountain passes, sacred temples, and retreats on your atlas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          
          {/* Preset City Search (5 cols) */}
          <div className="md:col-span-5 p-4 bg-slate-50/40 dark:bg-slate-950/40 space-y-3 overflow-y-auto max-h-[70vh]">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Quick World Presets
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search 40+ destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 overflow-y-auto">
              {filteredPresets.slice(0, 15).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    selectedPreset?.name === p.name
                      ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{p.name}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">{p.countryName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Details (7 cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-7 p-5 space-y-4">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                City / Landmark / Place Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kyoto, Positano, Machu Picchu, Reine"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Country Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Country
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {COUNTRIES_DATA.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Place Category
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'city', label: 'City', icon: Building2 },
                  { id: 'landmark', label: 'Landmark', icon: Landmark },
                  { id: 'nature', label: 'Nature', icon: Trees },
                  { id: 'food', label: 'Culinary', icon: Utensils },
                  { id: 'stay', label: 'Stay', icon: Bed }
                ].map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as PinCategory)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                        category === cat.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exact Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Longitude (°)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Latitude (°)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Personal Memories or Notes
              </label>
              <textarea
                rows={2}
                placeholder="What was unforgettable about this specific place?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Save Pin to Atlas
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
