import React from 'react';
import { 
  Compass, 
  MapPin, 
  Plus, 
  Sparkles, 
  Globe, 
  BookOpen,
  Camera
} from 'lucide-react';

interface EmptyStateProps {
  onOpenNewEntry: () => void;
  onLoadDemo: () => void;
  onGoToMap: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenNewEntry,
  onLoadDemo,
  onGoToMap
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in duration-500">
      
      {/* Visual Compass Globe Artifact */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-amber-600/10 to-amber-700/30 border border-amber-500/30 animate-pulse-ring" />
        <div className="w-24 h-24 rounded-2xl bg-stone-900 border border-amber-500/40 shadow-2xl flex items-center justify-center text-amber-400">
          <Compass className="w-12 h-12" />
        </div>
      </div>

      {/* Main Copy */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your World Awaits</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
          A Blank Canvas of the Planet
        </h2>

        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          You haven't added any visited countries yet. Click any country on the world map to pin your memories, upload photos, and build your personal travelogue.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        
        <button
          onClick={onOpenNewEntry}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record First Journey</span>
        </button>

        <button
          onClick={onGoToMap}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-800 rounded-xl text-sm font-semibold transition-all"
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Explore World Map</span>
        </button>

      </div>

      {/* Demo sample loader hint */}
      <div className="pt-4 border-t border-stone-800/80 max-w-sm mx-auto">
        <p className="text-xs text-stone-500 mb-2">Want to see how it looks when full?</p>
        <button
          onClick={onLoadDemo}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
        >
          ✨ Load Sample Travel Adventures (Japan, Italy, Peru, Norway...)
        </button>
      </div>

    </div>
  );
};
