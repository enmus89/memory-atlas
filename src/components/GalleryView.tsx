import React, { useState, useMemo } from 'react';
import { 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Heart, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink,
  Layers,
  Compass,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { TravelMemory, PhotoItem, FilterState, CountryInfo } from '../types';
import { COUNTRIES_DATA } from '../data/countries';

interface GalleryViewProps {
  memories: TravelMemory[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenPhotoLightbox: (photo: PhotoItem, allPhotos: PhotoItem[]) => void;
  onOpenNewEntry: () => void;
  onSelectCountryFromGallery: (countryCode: string) => void;
}

interface PhotoWithContext extends PhotoItem {
  countryCode: string;
  countryName: string;
  countryFlag: string;
  tripTitle: string;
  tripDate: string;
  memoryId: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  memories,
  filter,
  setFilter,
  onOpenPhotoLightbox,
  onOpenNewEntry,
  onSelectCountryFromGallery
}) => {
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL');

  // Extract all photos enriched with their memory metadata
  const allPhotosWithContext = useMemo(() => {
    const photos: PhotoWithContext[] = [];
    memories.forEach(mem => {
      if (Array.isArray(mem.photos)) {
        mem.photos.forEach(p => {
          photos.push({
            ...p,
            countryCode: mem.countryCode,
            countryName: mem.countryName,
            countryFlag: mem.countryFlag,
            tripTitle: mem.title,
            tripDate: mem.startDate,
            memoryId: mem.id
          });
        });
      }
    });
    return photos;
  }, [memories]);

  // Countries that currently have photos
  const countriesWithPhotos = useMemo(() => {
    const map = new Map<string, { code: string; name: string; flag: string; count: number }>();
    allPhotosWithContext.forEach(p => {
      const code = p.countryCode.toUpperCase();
      const curr = map.get(code);
      if (curr) {
        curr.count += 1;
      } else {
        map.set(code, {
          code,
          name: p.countryName,
          flag: p.countryFlag,
          count: 1
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allPhotosWithContext]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    let result = [...allPhotosWithContext];

    // Filter by country pill
    if (selectedCountryFilter !== 'ALL') {
      result = result.filter(p => p.countryCode.toUpperCase() === selectedCountryFilter.toUpperCase());
    }

    // Filter by search query
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(p =>
        p.caption?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.countryName.toLowerCase().includes(q) ||
        p.tripTitle.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allPhotosWithContext, selectedCountryFilter, filter.search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-full">
      
      {/* Header & Albums Filter Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#2563eb] text-xs font-bold uppercase tracking-wider mb-1">
              <ImageIcon className="w-4 h-4" />
              <span>Visual Travel Album</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a]">
              Global Photo Gallery
            </h1>
            <p className="text-xs text-[#64748b] font-sans mt-1">
              {allPhotosWithContext.length} {allPhotosWithContext.length === 1 ? 'photograph' : 'photographs'} curated across {countriesWithPhotos.length} visited {countriesWithPhotos.length === 1 ? 'country' : 'countries'}
            </p>
          </div>

          <button
            id="gallery-add-photo-btn"
            onClick={onOpenNewEntry}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload New Photos</span>
          </button>
        </div>

        {/* Country Album Filter Bar */}
        {countriesWithPhotos.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-[#f1f5f9]">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              Filter by Country Album:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCountryFilter('ALL')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCountryFilter === 'ALL'
                    ? 'bg-[#2563eb] text-white font-semibold shadow-xs'
                    : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                <span>🌍 All Albums</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedCountryFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-[#e2e8f0] text-[#64748b]'}`}>
                  {allPhotosWithContext.length}
                </span>
              </button>

              {countriesWithPhotos.map(c => {
                const isActive = selectedCountryFilter === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCountryFilter(isActive ? 'ALL' : c.code)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#2563eb] text-white font-semibold shadow-xs'
                        : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] hover:text-[#1e293b]'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-[#e2e8f0] text-[#64748b]'}`}>
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-[#cbd5e1] rounded-3xl p-8 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#e0f2fe] border border-blue-200 text-[#2563eb] mx-auto flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-[#1e293b] text-lg mb-1">
            No Travel Photographs Yet
          </h3>
          <p className="text-xs text-[#64748b] mb-6 leading-relaxed">
            {allPhotosWithContext.length > 0 
              ? 'No photos match your current filter or search criteria.' 
              : 'Add photos from your past trips, camera rolls, or explore landmark presets.'}
          </p>
          <button
            onClick={() => {
              if (allPhotosWithContext.length === 0) {
                onOpenNewEntry();
              } else {
                setSelectedCountryFilter('ALL');
                setFilter(prev => ({ ...prev, search: '' }));
              }
            }}
            className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {allPhotosWithContext.length === 0 ? 'Upload Photos for a Trip' : 'Clear Photo Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => onOpenPhotoLightbox(photo, filteredPhotos)}
              className="group bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Photo Frame with Aspect Ratio */}
              <div className="relative aspect-4/3 overflow-hidden bg-[#f1f5f9]">
                <img
                  src={photo.url}
                  alt={photo.caption || photo.tripTitle}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Country Pill Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/80 text-[11px] font-semibold text-[#1e293b] shadow-sm">
                  <span>{photo.countryFlag}</span>
                  <span>{photo.countryName}</span>
                </div>

                {/* Cover Tag */}
                {photo.isCover && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#2563eb] text-white font-bold text-[9px] uppercase tracking-wider shadow">
                    Cover
                  </span>
                )}

                {/* Hover Stage Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <span className="px-3 py-1.5 rounded-xl bg-white/90 text-[#1e293b] font-bold text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    Expand Photo
                  </span>
                </div>
              </div>

              {/* Photo Caption & Context info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-semibold text-[#1e293b] text-xs line-clamp-1">
                    {photo.caption || photo.tripTitle}
                  </h4>
                  {photo.location && (
                    <p className="text-[11px] text-[#64748b] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#2563eb]" />
                      <span>{photo.location}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                  <span>{photo.tripDate}</span>
                  <span className="text-[#2563eb] font-sans font-medium group-hover:underline">
                    View in diary →
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
