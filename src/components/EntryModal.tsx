import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Sun, 
  CloudSun, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Users, 
  Tag, 
  Globe,
  Compass,
  Link as LinkIcon,
  DollarSign,
  Receipt,
  Utensils,
  Plane,
  Hotel,
  Ticket,
  Car,
  ShoppingBag,
  Info,
  Loader2,
  Wand2,
  Lightbulb
} from 'lucide-react';
import { TravelMemory, PhotoItem, WeatherType, CountryInfo, TravelExpense, ExpenseCategory, OptionalFeatures } from '../types';
import { COUNTRIES_DATA, findCountry } from '../data/countries';
import { PRESET_COUNTRY_PHOTOS, COMMON_TRAVEL_TAGS } from '../data/demoMemories';
import { uploadPhoto, deletePhotos } from '../utils/photos';
import { apiFetch } from '../lib/supabase';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memoryData: Partial<TravelMemory>) => void;
  initialMemory?: TravelMemory | null;
  initialCountry?: CountryInfo | null;
  features?: OptionalFeatures;
  /** Owner of any photos uploaded from this modal. */
  userId: string;
  onError: (message: string) => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMemory,
  initialCountry,
  features,
  userId,
  onError
}) => {
  const [uploadingCount, setUploadingCount] = useState(0);
  /** Storage paths to bin once the user commits this edit (not on cancel). */
  const [pendingPhotoDeletions, setPendingPhotoDeletions] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState<string>('JP');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [highlight, setHighlight] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [companions, setCompanions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [customPhotoCaption, setCustomPhotoCaption] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Expenses state
  const [expenses, setExpenses] = useState<TravelExpense[]>([]);
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<ExpenseCategory>('food');
  const [newExpenseCurrency, setNewExpenseCurrency] = useState('USD');

  // AI Story Polisher State
  const [isPolishing, setIsPolishing] = useState(false);
  const [aiStyle, setAiStyle] = useState<'literary' | 'poetic' | 'concise' | 'adventure'>('literary');
  const [aiStatusText, setAiStatusText] = useState<string | null>(null);

  // AI Local Insights State
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);
  const [localInsights, setLocalInsights] = useState<{
    curatorSummary?: string;
    localDishes?: Array<{ name: string; description: string; whyTry: string }>;
    hiddenGems?: Array<{ title: string; location: string; tip: string }>;
    culturalEtiquette?: string[];
  } | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Initialize or update form on open
  useEffect(() => {
    if (initialMemory) {
      setCountryCode(initialMemory.countryCode || 'JP');
      setCity(initialMemory.city || '');
      setStartDate(initialMemory.startDate || '');
      setEndDate(initialMemory.endDate || '');
      setTitle(initialMemory.title || '');
      setNotes(initialMemory.notes || '');
      setHighlight(initialMemory.highlight || '');
      setRating(initialMemory.rating || 5);
      setWeather(initialMemory.weather || 'sunny');
      setCompanions(initialMemory.companions || '');
      setIsFavorite(Boolean(initialMemory.isFavorite));
      setTags(initialMemory.tags || []);
      setPhotos(initialMemory.photos || []);
      setExpenses(initialMemory.expenses || []);
    } else if (initialCountry) {
      setCountryCode(initialCountry.code);
      setCity(initialCountry.capital || '');
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setTitle(`Journey to ${initialCountry.name}`);
      setNotes('');
      setHighlight('');
      setRating(5);
      setWeather('sunny');
      setCompanions('');
      setIsFavorite(false);
      setTags(['Sightseeing']);
      setExpenses([]);
      
      const presets = PRESET_COUNTRY_PHOTOS[initialCountry.code] || [];
      if (presets.length > 0) {
        setPhotos(presets.map((p, idx) => ({
          id: `preset-${Date.now()}-${idx}`,
          url: p.url,
          caption: p.caption,
          location: p.location,
          isCover: idx === 0
        })));
      } else {
        setPhotos([]);
      }
    } else {
      // Default new entry
      setCountryCode('FR');
      setCity('Paris');
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setTitle('Journey to France');
      setNotes('');
      setHighlight('');
      setRating(5);
      setWeather('sunny');
      setCompanions('Solo Exploration');
      setIsFavorite(false);
      setTags(['Sightseeing', 'Culinary']);
      setExpenses([]);
      const presets = PRESET_COUNTRY_PHOTOS['FR'] || [];
      setPhotos(presets.map((p, idx) => ({
        id: `preset-${Date.now()}-${idx}`,
        url: p.url,
        caption: p.caption,
        location: p.location,
        isCover: idx === 0
      })));
    }
  }, [initialMemory, initialCountry]);

  const selectedCountryInfo = findCountry(countryCode) || COUNTRIES_DATA[0];

  // AI Story Enhancer Handler
  const handleAIEnhanceStory = async () => {
    if (!notes.trim() && !title.trim()) {
      alert('Please write a brief draft or bullet points in the Travel Diary notes first.');
      return;
    }

    setIsPolishing(true);
    setAiStatusText('Polishing prose & crafting evocative imagery with Gemini...');

    try {
      const res = await apiFetch('/api/ai/enhance-story', {
        method: 'POST',
        body: JSON.stringify({
          notes,
          title,
          countryName: selectedCountryInfo?.name || 'World',
          city,
          tags,
          style: aiStyle
        })
      });

      if (!res.ok) {
        throw new Error('AI polishing service temporarily unavailable');
      }

      const data = await res.json();
      if (data.enhancedNotes) {
        setNotes(data.enhancedNotes);
      }
      if (data.enhancedTitle) {
        setTitle(data.enhancedTitle);
      }
      if (data.sensoryHighlight) {
        setHighlight(data.sensoryHighlight);
      }
      if (data.suggestedTags && Array.isArray(data.suggestedTags)) {
        const combined = Array.from(new Set([...tags, ...data.suggestedTags]));
        setTags(combined);
      }
      setAiStatusText('✨ Enhanced with literary elegance!');
      setTimeout(() => setAiStatusText(null), 3000);
    } catch (err: any) {
      console.error(err);
      setAiStatusText('Failed to reach AI service.');
      setTimeout(() => setAiStatusText(null), 3000);
    } finally {
      setIsPolishing(false);
    }
  };

  // AI Local Insights Handler
  const handleFetchLocalInsights = async () => {
    setIsFetchingInsights(true);
    try {
      const res = await apiFetch('/api/ai/suggest-insights', {
        method: 'POST',
        body: JSON.stringify({
          countryName: selectedCountryInfo?.name || 'World',
          city: city || selectedCountryInfo?.capital
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLocalInsights(data);
        setShowInsightsModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingInsights(false);
    }
  };

  // Expense Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseAmount || parseFloat(newExpenseAmount) <= 0) return;

    const newExp: TravelExpense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: newExpenseCategory,
      amount: parseFloat(newExpenseAmount),
      currency: newExpenseCurrency,
      description: newExpenseDesc.trim() || undefined,
      date: startDate || new Date().toISOString().split('T')[0]
    };

    setExpenses(prev => [...prev, newExp]);
    setNewExpenseDesc('');
    setNewExpenseAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const totalExpensesCost = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Country Search filtering
  const filteredCountries = COUNTRIES_DATA.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.capital.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Photo handlers
  //
  // Photos are downscaled and uploaded to private object storage as soon as
  // they are picked. Only the storage path is kept on the memory, so a trip
  // with twenty photos stays a small row rather than megabytes of base64.
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const picked = Array.from(files);
    e.target.value = '';

    setUploadingCount(count => count + picked.length);

    for (const file of picked) {
      const photoId = `photo-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const { path, url } = await uploadPhoto(userId, file, photoId);
        setPhotos(prev => [
          ...prev,
          {
            id: photoId,
            url,
            path,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            location: city || selectedCountryInfo?.name,
            isCover: prev.length === 0
          }
        ]);
      } catch (err) {
        onError(err instanceof Error ? err.message : `Could not upload ${file.name}.`);
      } finally {
        setUploadingCount(count => Math.max(0, count - 1));
      }
    }
  };

  const handleAddCustomUrl = () => {
    if (!customPhotoUrl.trim()) return;
    setPhotos(prev => [
      ...prev,
      {
        id: `photo-url-${Date.now()}`,
        url: customPhotoUrl.trim(),
        caption: customPhotoCaption.trim() || undefined,
        location: city || selectedCountryInfo?.name,
        isCover: prev.length === 0
      }
    ]);
    setCustomPhotoUrl('');
    setCustomPhotoCaption('');
  };

  const handleAddPresetPhoto = (preset: { url: string; caption: string; location: string }) => {
    setPhotos(prev => [
      ...prev,
      {
        id: `photo-preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: preset.url,
        caption: preset.caption,
        location: preset.location,
        isCover: prev.length === 0
      }
    ]);
  };

  const handleDeletePhoto = (photoId: string) => {
    const removed = photos.find(p => p.id === photoId);

    if (removed?.path) {
      const wasAlreadySaved = (initialMemory?.photos ?? []).some(p => p.id === photoId);
      if (wasAlreadySaved) {
        // The stored memory still points at this file, so the file can only go
        // once the user commits the edit. Cancelling must leave it intact.
        setPendingPhotoDeletions(prev => [...prev, removed.path as string]);
      } else {
        // Uploaded during this edit and never saved — safe to bin right away
        // rather than leaving an orphan in the bucket.
        void deletePhotos([removed.path]);
      }
    }

    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId);
      if (filtered.length > 0 && !filtered.some(p => p.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (photoId: string) => {
    setPhotos(prev => prev.map(p => ({
      ...p,
      isCover: p.id === photoId
    })));
  };

  // Tag handlers
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Save handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !countryCode) return;
    if (uploadingCount > 0) {
      onError('Please wait for your photos to finish uploading.');
      return;
    }

    // The edit is being committed, so photos the user removed can now go.
    if (pendingPhotoDeletions.length > 0) {
      void deletePhotos(pendingPhotoDeletions);
      setPendingPhotoDeletions([]);
    }

    onSave({
      countryCode: countryCode.toUpperCase(),
      countryName: selectedCountryInfo?.name || 'Unknown',
      countryFlag: selectedCountryInfo?.flag || '🌍',
      continent: selectedCountryInfo?.continent || 'Europe',
      city: city.trim() || selectedCountryInfo?.capital || selectedCountryInfo?.name || '',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || undefined,
      title: title.trim(),
      notes: notes.trim(),
      highlight: highlight.trim() || undefined,
      rating,
      weather,
      companions: companions.trim() || undefined,
      isFavorite,
      tags,
      photos,
      expenses
    });

    onClose();
  };

  const presetsForCurrentCountry = PRESET_COUNTRY_PHOTOS[countryCode] || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-white">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {initialMemory ? 'Edit Travel Memoir' : 'Record New Travel Journey'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Log authentic narratives, expenses, and photographs from your expedition
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Section 1: Country & Destination Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Country Selector */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Country Visited *
                </label>
                {features?.aiAssistant !== false && (
                  <button
                    type="button"
                    onClick={handleFetchLocalInsights}
                    disabled={isFetchingInsights}
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Lightbulb className="w-3 h-3" />
                    {isFetchingInsights ? 'Consulting Gemini...' : 'Get AI Local Insights'}
                  </button>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-left text-xs text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedCountryInfo?.flag}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedCountryInfo?.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{selectedCountryInfo?.continent} • {selectedCountryInfo?.capital}</p>
                  </div>
                </div>
                <span className="text-slate-400 text-xs">Change ▼</span>
              </button>

              {/* Dropdown Menu */}
              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 max-h-60 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none mb-2"
                  />
                  <div className="space-y-1">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(c.code);
                          setShowCountryDropdown(false);
                          setCountrySearch('');
                          if (!city) setCity(c.capital);
                          if (!title || title.startsWith('Journey to')) {
                            setTitle(`Journey to ${c.name}`);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs transition-colors cursor-pointer"
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-auto">{c.continent}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* City / Regions input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                City / Specific Region
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Kyoto & Osaka, Amalfi Coast, Tromsø"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

          </div>

          {/* Section 2: Dates & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Trip Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Trip End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Companions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Companions
              </label>
              <input
                type="text"
                placeholder="e.g. Solo, With Elena, Family"
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Journey Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Trip Title / Headline *
            </label>
            <input
              type="text"
              placeholder="e.g. Autumn Mist, Ancient Temples & Midnight Ramen"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* AI Travel Story Polisher Bar & Notes */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Travel Diary, Reflections & Notes
              </label>

              {/* AI Polisher Control Strip */}
              {features?.aiAssistant !== false && (
                <div className="flex items-center gap-2">
                  <select
                    value={aiStyle}
                    onChange={(e) => setAiStyle(e.target.value as any)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="literary">Literary & Atmospheric</option>
                    <option value="poetic">Poetic & Sensory</option>
                    <option value="adventure">Expedition Adventure</option>
                    <option value="concise">Crisp & Punchy</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAIEnhanceStory}
                    disabled={isPolishing}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isPolishing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {isPolishing ? 'Polishing Story...' : 'AI Polish Story'}
                  </button>
                </div>
              )}
            </div>

            {features?.aiAssistant !== false && aiStatusText && (
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {aiStatusText}
              </div>
            )}

            <textarea
              rows={4}
              placeholder="Write your raw memories, sensory moments, unforgettable meals..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
            />
          </div>

          {/* Highlight Quote */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Highlight of the Journey (Short Sensory Quote)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Standing at the Sun Gate in absolute silence as the first rays illuminated the citadel."
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 italic"
            />
          </div>

          {/* Section 3: Travel Expenses & Budget Tracker */}
          {features?.budgetExpenses !== false && (
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Trip Expenses & Budget Log
                  </h3>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Total: ${totalExpensesCost.toLocaleString()} USD
                </span>
              </div>

              {/* Add Expense Form Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-3">
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="food">🍽️ Food & Dining</option>
                    <option value="lodging">🏨 Hotel / Stay</option>
                    <option value="flights">✈️ Flights / Air</option>
                    <option value="activities">🎟️ Tours & Entry</option>
                    <option value="transit">🚆 Train & Transit</option>
                    <option value="shopping">🛍️ Souvenirs / Gifts</option>
                    <option value="other">📦 Other Expense</option>
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Expense description (e.g. Omakase dinner, Train pass)"
                    value={newExpenseDesc}
                    onChange={(e) => setNewExpenseDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    min="0"
                    step="1"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddExpense}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* List of recorded expenses */}
              {expenses.length > 0 && (
                <div className="space-y-1.5 pt-2 max-h-40 overflow-y-auto">
                  {expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-slate-900 dark:text-white capitalize">
                          {exp.category}:
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {exp.description || 'Uncategorized'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ${exp.amount.toLocaleString()} {exp.currency}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 4: Rating, Weather & Favorite */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Star Rating */}
              <div className="space-y-1">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Rating:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Atmosphere */}
              <div className="space-y-1">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Atmosphere:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'sunny', icon: <Sun className="w-3.5 h-3.5" />, label: 'Sunny' },
                    { id: 'golden_hour', icon: <CloudSun className="w-3.5 h-3.5" />, label: 'Golden Hour' },
                    { id: 'rainy', icon: <CloudRain className="w-3.5 h-3.5" />, label: 'Rain' },
                    { id: 'snowy', icon: <Snowflake className="w-3.5 h-3.5" />, label: 'Snow' },
                    { id: 'breezy', icon: <Wind className="w-3.5 h-3.5" />, label: 'Breezy' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWeather(w.id as WeatherType)}
                      title={w.label}
                      className={`p-2 rounded-xl border transition-all text-xs cursor-pointer ${
                        weather === w.id
                          ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {w.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Toggle */}
              <div className="space-y-1">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Favorite:
                </span>
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isFavorite ? 'Starred Favorite' : 'Mark Favorite'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Section 5: Photo Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Travel Photographs ({photos.length})</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Click a photo to set as cover
              </span>
            </div>

            {/* Upload / Add Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-all text-center">
                {uploadingCount > 0 ? (
                  <Loader2 className="w-5 h-5 text-blue-500 mb-1 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-blue-500 mb-1" />
                )}
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {uploadingCount > 0 ? `Uploading ${uploadingCount}…` : 'Upload Photos'}
                </span>
                <span className="text-[10px] text-slate-500">Select images from your device</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Photo caption (optional)..."
                    value={customPhotoCaption}
                    onChange={(e) => setCustomPhotoCaption(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    disabled={!customPhotoUrl.trim()}
                    className="px-3 py-1 bg-blue-600 disabled:opacity-30 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Preset photos */}
            {presetsForCurrentCountry.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>Curated Landmarks for {selectedCountryInfo?.name}:</span>
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presetsForCurrentCountry.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPresetPhoto(preset)}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex-shrink-0 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.caption}
                        className="w-5 h-5 rounded-md object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <span>+ {preset.caption}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative group aspect-square rounded-2xl overflow-hidden border ${
                      photo.isCover 
                        ? 'border-blue-500 ring-2 ring-blue-500/30' 
                        : 'border-slate-200 dark:border-slate-700'
                    } bg-slate-100 dark:bg-slate-800`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Travel image'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {photo.isCover && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider shadow">
                        Cover
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="self-end p-1.5 rounded-lg bg-rose-600 text-white cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {!photo.isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(photo.id)}
                          className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Section 6: Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span>Custom Tags & Themes</span>
            </label>

            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(newTagInput);
                    }
                  }}
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-32"
                />
                {newTagInput && (
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="p-1 rounded-full bg-blue-600 text-white cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_TRAVEL_TAGS.slice(0, 10).map((ct) => {
                if (tags.includes(ct)) return null;
                return (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => handleAddTag(ct)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500"
                  >
                    +{ct}
                  </button>
                );
              })}
            </div>
          </div>

        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
          >
            {initialMemory ? 'Update Travel Memoir' : 'Save to Travel Diary'}
          </button>
        </div>

      </div>

      {/* AI Local Insights Drawer/Modal */}
      {showInsightsModal && localInsights && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-white">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/40 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Curated Intelligence: {selectedCountryInfo?.name}</h3>
                  <p className="text-[11px] text-slate-500">Gems, flavors, and cultural nuances</p>
                </div>
              </div>
              <button onClick={() => setShowInsightsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {localInsights.curatorSummary && (
                <p className="text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                  "{localInsights.curatorSummary}"
                </p>
              )}

              {/* Dishes */}
              {localInsights.localDishes && localInsights.localDishes.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Must-Try Local Culinary Specialties
                  </span>
                  <div className="space-y-2">
                    {localInsights.localDishes.map((dish, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{dish.name}</div>
                        <div className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{dish.description}</div>
                        <div className="text-blue-600 dark:text-blue-400 text-[10px] font-semibold mt-1">Why try: {dish.whyTry}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden Gems */}
              {localInsights.hiddenGems && localInsights.hiddenGems.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Hidden Secrets & Photo Spots
                  </span>
                  <div className="space-y-2">
                    {localInsights.hiddenGems.map((gem, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-white">{gem.title} • <span className="font-normal text-slate-400">{gem.location}</span></div>
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5">{gem.tip}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Etiquette */}
              {localInsights.culturalEtiquette && localInsights.culturalEtiquette.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Cultural Etiquette
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    {localInsights.culturalEtiquette.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowInsightsModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Close & Return to Editor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
