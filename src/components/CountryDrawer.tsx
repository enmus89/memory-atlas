import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Sparkles,
  ExternalLink,
  Tag,
  Compass,
  ArrowRight,
  Home,
  Check
} from 'lucide-react';
import { CountryInfo, TravelMemory, PhotoItem } from '../types';

interface CountryDrawerProps {
  country: CountryInfo | null;
  memories: TravelMemory[];
  homeCountryCode?: string;
  onSetHomeCountry?: (countryCode: string) => void;
  onClose: () => void;
  onAddNewTrip: (country: CountryInfo) => void;
  onEditMemory: (memory: TravelMemory) => void;
  onDeleteMemory: (memoryId: string) => void;
  onOpenPhotoLightbox: (photo: PhotoItem, allPhotos: PhotoItem[]) => void;
  onToggleFavorite: (memoryId: string) => void;
}

export const CountryDrawer: React.FC<CountryDrawerProps> = ({
  country,
  memories,
  homeCountryCode,
  onSetHomeCountry,
  onClose,
  onAddNewTrip,
  onEditMemory,
  onDeleteMemory,
  onOpenPhotoLightbox,
  onToggleFavorite
}) => {
  React.useEffect(() => {
    if (!country) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [country, onClose]);

  if (!country) return null;

  const allPhotos: PhotoItem[] = memories.flatMap(m => m.photos || []);
  const coverPhoto = allPhotos.find(p => p.isCover)?.url || allPhotos[0]?.url;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen sm:max-w-xl bg-white border-l border-[#e2e8f0] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* Header Banner */}
          <div className="relative h-48 bg-[#1e293b] overflow-hidden flex-shrink-0">
            {coverPhoto ? (
              <>
                <img 
                  src={coverPhoto} 
                  alt={country.name}
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/40 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-[#1e293b] flex items-center justify-center">
                <Compass className="w-16 h-16 text-slate-700" />
              </div>
            )}

            {/* Close Button */}
            <button
              id="country-drawer-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Country Title Overlay */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl leading-none">{country.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {country.name}
                    </h2>
                    {homeCountryCode && country.code.toUpperCase() === homeCountryCode.toUpperCase() ? (
                      <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Home className="w-3 h-3" />
                        Home Base
                      </span>
                    ) : onSetHomeCountry ? (
                      <button
                        onClick={() => onSetHomeCountry(country.code)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-300/40 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Set this country as your home country base"
                      >
                        <Home className="w-3 h-3 text-amber-300" />
                        <span>Set as Home</span>
                      </button>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-300 font-sans">
                    {country.capital} • {country.continent} • {memories.length} {memories.length === 1 ? 'journey' : 'journeys'} recorded
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <ImageIcon className="w-4 h-4 text-[#2563eb]" />
              <span>{allPhotos.length} {allPhotos.length === 1 ? 'photo' : 'photos'} in album</span>
            </div>
            
            <button
              id="country-drawer-add-journey-btn"
              onClick={() => onAddNewTrip(country)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Trip Here</span>
            </button>
          </div>

          {/* Content Body: Memories List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f9fa]">
            
            {memories.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#e0f2fe] border border-blue-200 text-[#2563eb] mx-auto flex items-center justify-center mb-3">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-[#1e293b] text-base mb-1">
                  No Memories Recorded Yet
                </h3>
                <p className="text-xs text-[#64748b] max-w-sm mx-auto mb-4">
                  Add photos, travel notes, favorite dishes, and memorable moments from your visit to {country.name}.
                </p>
                <button
                  onClick={() => onAddNewTrip(country)}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Memory for {country.name}</span>
                </button>
              </div>
            ) : (
              memories.map((mem) => {
                const memPhotos = mem.photos || [];
                return (
                  <div 
                    key={mem.id}
                    className="bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-2xl p-5 transition-all space-y-4 shadow-xs"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="flex items-center gap-1 text-xs text-[#2563eb] font-semibold bg-[#e0f2fe] px-2 py-0.5 rounded-md border border-blue-200">
                            <MapPin className="w-3 h-3" />
                            {mem.city || country.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#64748b] font-mono">
                            <Calendar className="w-3 h-3 text-[#94a3b8]" />
                            {mem.startDate} {mem.endDate ? `→ ${mem.endDate}` : ''}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#1a1a1a] text-lg">
                          {mem.title}
                        </h3>
                      </div>

                      {/* Top Action Icons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleFavorite(mem.id)}
                          title={mem.isFavorite ? "Remove favorite" : "Mark favorite"}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            mem.isFavorite 
                              ? 'bg-rose-50 border-rose-200 text-rose-500' 
                              : 'bg-white border-[#e2e8f0] text-[#64748b] hover:text-[#1e293b]'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${mem.isFavorite ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => onEditMemory(mem)}
                          title="Edit Memory"
                          className="p-1.5 rounded-lg bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#2563eb] hover:bg-[#f8fafc] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          title="Delete Memory"
                          className="p-1.5 rounded-lg bg-white border border-[#e2e8f0] text-[#64748b] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Highlight Box if present */}
                    {mem.highlight && (
                      <div className="p-3 bg-[#f8fafc] border-l-3 border-[#2563eb] rounded-r-xl text-xs text-[#1e293b] italic font-medium">
                        "{mem.highlight}"
                      </div>
                    )}

                    {/* Notes */}
                    <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-line font-sans">
                      {mem.notes}
                    </p>

                    {/* Photo Thumbnails */}
                    {memPhotos.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-[#64748b] flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-[#2563eb]" />
                          Photos ({memPhotos.length})
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {memPhotos.map((photo, pIdx) => (
                            <button
                              key={photo.id || pIdx}
                              onClick={() => onOpenPhotoLightbox(photo, allPhotos)}
                              className="relative aspect-square rounded-xl overflow-hidden group border border-[#e2e8f0] hover:border-[#2563eb] transition-all focus:outline-none cursor-pointer"
                            >
                              <img
                                src={photo.url}
                                alt={photo.caption || 'Travel photo'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              {photo.caption && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-end p-1.5 transition-opacity">
                                  <p className="text-[10px] text-white line-clamp-1">{photo.caption}</p>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating, Companions & Tags Footer */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f1f5f9] flex-wrap">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= mem.rating 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-[#cbd5e1]'
                            }`}
                          />
                        ))}
                        {mem.companions && (
                          <span className="text-[11px] text-[#64748b] ml-2 font-medium">
                            • {mem.companions}
                          </span>
                        )}
                      </div>

                      {/* Tag Pills */}
                      {mem.tags && mem.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {mem.tags.map((t, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#2563eb] border border-[#e2e8f0] font-semibold"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
