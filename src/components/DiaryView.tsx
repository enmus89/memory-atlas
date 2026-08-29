import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Calendar, 
  MapPin, 
  Star, 
  Heart, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Image as ImageIcon,
  Tag,
  Sun,
  CloudSun,
  CloudRain,
  Snowflake,
  Wind,
  Users,
  Compass,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import { TravelMemory, PhotoItem, WeatherType, FilterState } from '../types';
import { CONTINENTS } from '../data/countries';

interface DiaryViewProps {
  memories: TravelMemory[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenNewEntry: () => void;
  onEditMemory: (memory: TravelMemory) => void;
  onDeleteMemory: (memoryId: string) => void;
  onToggleFavorite: (memoryId: string) => void;
  onOpenPhotoLightbox: (photo: PhotoItem, allPhotos: PhotoItem[]) => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({
  memories,
  filter,
  setFilter,
  onOpenNewEntry,
  onEditMemory,
  onDeleteMemory,
  onToggleFavorite,
  onOpenPhotoLightbox
}) => {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Extract unique years from memories
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    memories.forEach(m => {
      if (m.startDate) {
        years.add(m.startDate.split('-')[0]);
      }
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [memories]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    memories.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => set.add(t));
      }
    });
    return Array.from(set);
  }, [memories]);

  // Filter and Sort memories
  const processedMemories = useMemo(() => {
    let result = [...memories];

    // Filter by search
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) ||
        m.countryName.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q) ||
        m.highlight?.toLowerCase().includes(q) ||
        m.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filter by continent
    if (filter.continent && filter.continent !== 'ALL') {
      result = result.filter(m => m.continent === filter.continent);
    }

    // Filter by tag
    if (filter.tag && filter.tag !== 'ALL') {
      result = result.filter(m => m.tags?.includes(filter.tag));
    }

    // Filter by countryCode
    if (filter.countryCode && filter.countryCode !== 'ALL') {
      result = result.filter(m => m.countryCode.toUpperCase() === filter.countryCode.toUpperCase());
    }

    // Filter by favorite
    if (filter.favoriteOnly) {
      result = result.filter(m => m.isFavorite);
    }

    // Sorting
    result.sort((a, b) => {
      if (filter.sortBy === 'date-desc') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      if (filter.sortBy === 'date-asc') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      if (filter.sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (filter.sortBy === 'name') {
        return a.countryName.localeCompare(b.countryName);
      }
      return 0;
    });

    return result;
  }, [memories, filter]);

  const toggleExpand = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderWeatherIcon = (weather?: WeatherType) => {
    switch (weather) {
      case 'sunny': return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'golden_hour': return <CloudSun className="w-3.5 h-3.5 text-amber-500" />;
      case 'rainy': return <CloudRain className="w-3.5 h-3.5 text-blue-400" />;
      case 'snowy': return <Snowflake className="w-3.5 h-3.5 text-cyan-300" />;
      case 'breezy': return <Wind className="w-3.5 h-3.5 text-teal-300" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-[calc(100vh-4rem)]">
      
      {/* Header & Filter Controls */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
        
        {/* Top title and action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Chronological Memoirs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Travel Diary & Journeys
            </h1>
            <p className="text-xs text-stone-400 font-sans mt-1">
              {processedMemories.length} {processedMemories.length === 1 ? 'journey entry' : 'journey entries'} recorded in your life travelogue
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-950/70 border border-stone-800 rounded-xl text-xs text-stone-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <select
                id="diary-sort-select"
                value={filter.sortBy}
                onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-transparent text-xs text-stone-200 focus:outline-none cursor-pointer"
              >
                <option value="date-desc" className="bg-stone-900">Newest Trips First</option>
                <option value="date-asc" className="bg-stone-900">Oldest Trips First</option>
                <option value="rating" className="bg-stone-900">Highest Rated (★ 5-1)</option>
                <option value="name" className="bg-stone-900">Country Name (A-Z)</option>
              </select>
            </div>

            <button
              id="diary-add-journey-btn"
              onClick={onOpenNewEntry}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Trip</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="space-y-3 pt-3 border-t border-stone-800/80">
          
          {/* Continents Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1 flex-shrink-0">
              Region:
            </span>
            <button
              onClick={() => setFilter(prev => ({ ...prev, continent: 'ALL' }))}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                !filter.continent || filter.continent === 'ALL'
                  ? 'bg-amber-500 text-stone-950 font-semibold'
                  : 'bg-stone-950/70 border border-stone-800 text-stone-300 hover:text-stone-100'
              }`}
            >
              All Continents
            </button>
            {CONTINENTS.map(cont => (
              <button
                key={cont}
                onClick={() => setFilter(prev => ({ ...prev, continent: prev.continent === cont ? 'ALL' : cont }))}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filter.continent === cont
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'bg-stone-950/70 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700'
                }`}
              >
                {cont}
              </button>
            ))}
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1 flex-shrink-0">
                Tags:
              </span>
              <button
                onClick={() => setFilter(prev => ({ ...prev, tag: 'ALL' }))}
                className={`px-2.5 py-0.5 rounded-md text-[11px] transition-all ${
                  !filter.tag || filter.tag === 'ALL'
                    ? 'bg-stone-700 text-stone-100 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                #All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilter(prev => ({ ...prev, tag: prev.tag === tag ? 'ALL' : tag }))}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] transition-all ${
                    filter.tag === tag
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-medium'
                      : 'text-stone-400 hover:text-stone-200 bg-stone-950/40'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Diary Entries List */}
      {processedMemories.length === 0 ? (
        <div className="text-center py-20 bg-stone-900/40 border border-dashed border-stone-800 rounded-3xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-display font-semibold text-stone-200 text-lg mb-1">
            No Travel Memories Found
          </h3>
          <p className="text-xs text-stone-400 mb-6 leading-relaxed">
            {filter.search || (filter.continent && filter.continent !== 'ALL') || filter.favoriteOnly
              ? 'No journal entries match your active filters. Try clearing your search parameters.'
              : 'Your travel diary is waiting for its first adventure. Record a journey or mark a visited country!'}
          </p>
          <button
            onClick={() => {
              if (memories.length === 0) {
                onOpenNewEntry();
              } else {
                setFilter({
                  search: '',
                  continent: 'ALL',
                  tag: 'ALL',
                  countryCode: 'ALL',
                  sortBy: 'date-desc',
                  favoriteOnly: false
                });
              }
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-xl transition-all shadow-md"
          >
            {memories.length === 0 ? 'Record Your First Trip' : 'Clear All Filters'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {processedMemories.map((mem) => {
            const isExpanded = expandedNotes[mem.id] ?? true; // expanded by default for rich reading
            const photos = mem.photos || [];
            const weatherIcon = renderWeatherIcon(mem.weather);

            return (
              <article 
                key={mem.id}
                className="bg-stone-900/90 border border-stone-800 hover:border-stone-700/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-300"
              >
                
                {/* Photo Header Mosaic or Banner */}
                {photos.length > 0 && (
                  <div className="relative bg-stone-950 border-b border-stone-800/80">
                    {photos.length === 1 ? (
                      <div 
                        onClick={() => onOpenPhotoLightbox(photos[0], photos)}
                        className="relative h-64 sm:h-80 w-full overflow-hidden cursor-pointer group"
                      >
                        <img 
                          src={photos[0].url} 
                          alt={photos[0].caption || mem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent opacity-60" />
                        {photos[0].caption && (
                          <div className="absolute bottom-4 left-6 right-6">
                            <p className="text-xs text-stone-200 bg-stone-950/70 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block border border-stone-800">
                              📷 {photos[0].caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-1 bg-stone-950">
                        {/* Main Cover Image (2 cols on sm) */}
                        <div 
                          onClick={() => onOpenPhotoLightbox(photos[0], photos)}
                          className="relative sm:col-span-2 h-56 sm:h-72 overflow-hidden rounded-xl cursor-pointer group"
                        >
                          <img 
                            src={photos[0].url} 
                            alt={photos[0].caption || mem.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-50" />
                          {photos[0].caption && (
                            <div className="absolute bottom-3 left-3">
                              <p className="text-[11px] text-stone-200 bg-stone-950/80 px-2.5 py-1 rounded-md">
                                {photos[0].caption}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Secondary Photos Column */}
                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 h-28 sm:h-72">
                          {photos.slice(1, 3).map((p, pIdx) => (
                            <div 
                              key={p.id || pIdx}
                              onClick={() => onOpenPhotoLightbox(p, photos)}
                              className="relative h-full overflow-hidden rounded-xl cursor-pointer group bg-stone-900"
                            >
                              <img 
                                src={p.url} 
                                alt={p.caption || 'Travel image'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                              />
                              {photos.length > 3 && pIdx === 1 && (
                                <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center text-white font-semibold text-xs group-hover:bg-stone-950/60 transition-colors">
                                  <span>+{photos.length - 3} more photos</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Journal Card Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Top Metadata Row: Flag, Country, City, Date, Stars */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-2xl leading-none">{mem.countryFlag}</span>
                        <span className="text-base font-bold font-display text-amber-400">
                          {mem.countryName}
                        </span>
                        <span className="text-stone-600">•</span>
                        <span className="flex items-center gap-1 text-xs text-stone-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {mem.city}
                        </span>
                        <span className="text-stone-600">•</span>
                        <span className="flex items-center gap-1 text-xs text-stone-400 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                          {mem.startDate} {mem.endDate ? `→ ${mem.endDate}` : ''}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
                        {mem.title}
                      </h2>
                    </div>

                    {/* Right Controls: Favorites & Actions */}
                    <div className="flex items-center gap-1.5 self-start sm:self-center">
                      <button
                        onClick={() => onToggleFavorite(mem.id)}
                        title={mem.isFavorite ? "Remove favorite" : "Mark as favorite"}
                        className={`p-2 rounded-xl border transition-all ${
                          mem.isFavorite 
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-sm' 
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${mem.isFavorite ? 'fill-rose-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => onEditMemory(mem)}
                        title="Edit Memory"
                        className="p-2 rounded-xl bg-stone-950/60 border border-stone-800 text-stone-400 hover:text-amber-400 hover:border-stone-700 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        title="Delete Journey"
                        className="p-2 rounded-xl bg-stone-950/60 border border-stone-800 text-stone-400 hover:text-rose-400 hover:border-stone-700 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Highlight Quote Box */}
                  {mem.highlight && (
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-r-2xl">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Highlight of the Trip
                      </p>
                      <p className="text-sm font-display text-amber-100/90 italic leading-relaxed">
                        "{mem.highlight}"
                      </p>
                    </div>
                  )}

                  {/* Travel Story & Notes */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans whitespace-pre-line">
                      {mem.notes}
                    </p>
                  </div>

                  {/* Metadata Footer: Rating, Weather, Companions, Tags */}
                  <div className="pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Star Rating + Weather + Companions */}
                    <div className="flex items-center gap-4 flex-wrap text-xs text-stone-400">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= mem.rating 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Weather Pill */}
                      {mem.weather && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-950/60 border border-stone-800 text-[11px] capitalize">
                          {weatherIcon}
                          <span>{mem.weather.replace('_', ' ')}</span>
                        </span>
                      )}

                      {/* Companions Pill */}
                      {mem.companions && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/60 border border-stone-800 text-[11px]">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>{mem.companions}</span>
                        </span>
                      )}
                    </div>

                    {/* Right: Tag Pills */}
                    {mem.tags && mem.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {mem.tags.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => setFilter(prev => ({ ...prev, tag: t }))}
                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-950/60 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:border-amber-500/40 transition-colors"
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>

                </div>

              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
