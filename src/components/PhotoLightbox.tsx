import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Tag, Maximize2 } from 'lucide-react';
import { PhotoItem } from '../types';

interface PhotoLightboxProps {
  photo: PhotoItem | null;
  allPhotos: PhotoItem[];
  onClose: () => void;
  onNavigate: (photo: PhotoItem) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  allPhotos,
  onClose,
  onNavigate
}) => {
  const currentIndex = photo 
    ? allPhotos.findIndex(p => p.url === photo.url || (p.id && p.id === photo.id))
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allPhotos.length - 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPrev) {
      onNavigate(allPhotos[currentIndex - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNext) {
      onNavigate(allPhotos[currentIndex + 1]);
    }
  };

  useEffect(() => {
    if (!photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(allPhotos[currentIndex - 1]);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(allPhotos[currentIndex + 1]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, currentIndex, hasPrev, hasNext, allPhotos, onClose, onNavigate]);

  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (diff > 50 && hasPrev) {
      onNavigate(allPhotos[currentIndex - 1]);
    } else if (diff < -50 && hasNext) {
      onNavigate(allPhotos[currentIndex + 1]);
    }
    setTouchStartX(null);
  };

  if (!photo) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top action bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 text-white pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-full text-xs pointer-events-auto">
          <span className="font-semibold text-blue-400">{currentIndex + 1}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{allPhotos.length}</span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors pointer-events-auto cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div 
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.url}
          alt={photo.caption || 'Travel photo'}
          className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
          referrerPolicy="no-referrer"
        />

        {/* Caption & Location footer */}
        {(photo.caption || photo.location) && (
          <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl px-5 py-2.5 text-center max-w-xl shadow-xl">
            {photo.caption && (
              <p className="text-sm font-medium text-white">{photo.caption}</p>
            )}
            {photo.location && (
              <p className="text-xs text-blue-400 flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{photo.location}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700 transition-all shadow-xl hover:scale-105 cursor-pointer z-20"
          title="Previous Photo (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700 transition-all shadow-xl hover:scale-105 cursor-pointer z-20"
          title="Next Photo (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
