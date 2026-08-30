import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense, lazy } from 'react';
import * as d3Geo from 'd3-geo';
import * as topojson from 'topojson-client';
import confetti from 'canvas-confetti';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  PlusCircle, 
  Compass, 
  Image as ImageIcon, 
  Heart, 
  ChevronRight, 
  Layers, 
  MapPin, 
  ArrowRight, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  Plus,
  Map as MapIcon,
  Orbit
} from 'lucide-react';
import worldAtlasData from 'world-atlas/countries-110m.json';
import { TravelMemory, Continent, CountryInfo, MapTheme, CityPin, WishlistItem, OptionalFeatures } from '../types';
import { COUNTRIES_DATA, findCountry, CONTINENTS } from '../data/countries';
import { TravelStats } from '../utils/storage';
import { MAP_THEMES } from '../utils/mapTheme';
import { Sun, Moon } from 'lucide-react';

// The globe drags in three.js and react-globe.gl — together the largest thing
// in the app by a wide margin. Loading it on demand keeps it out of the initial
// bundle, so the app shell (and the sign-in screen, which never shows a map at
// all) paints without waiting for it.
const GlobeView = lazy(async () => ({ default: (await import('./GlobeView')).GlobeView }));

interface MapViewProps {
  memories: TravelMemory[];
  stats: TravelStats;
  homeCountryCode?: string;
  onSetHomeCountry?: (countryCode: string | null) => void;
  mapTheme?: MapTheme;
  onToggleMapTheme?: () => void;
  onSelectCountry: (country: CountryInfo, existingMemories: TravelMemory[]) => void;
  onQuickMarkVisited: (country: CountryInfo) => void;
  onOpenNewEntryWithCountry: (country: CountryInfo) => void;
  onOpenMemory: (memory: TravelMemory) => void;
  wishlist?: WishlistItem[];
  cityPins?: CityPin[];
  onOpenCityPin?: (pin: CityPin) => void;
  features?: OptionalFeatures;
}

/**
 * Shown while the globe chunk downloads. It keeps the 2D switch reachable, so a
 * slow connection never leaves the map with nothing to press.
 */
const GlobeLoading: React.FC<{ isDark: boolean; onSwitchTo2D: () => void }> = ({ isDark, onSwitchTo2D }) => (
  <div
    className={`relative w-full h-[calc(100vh-80px)] min-h-[560px] flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${isDark ? 'bg-[#030712] text-slate-300' : 'bg-[#e0f2fe] text-slate-600'}`}
  >
    <Orbit className="w-9 h-9 animate-spin [animation-duration:2.4s]" strokeWidth={1.5} />
    <p className="text-sm font-semibold">Loading the globe…</p>
    <button
      onClick={onSwitchTo2D}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${isDark ? 'bg-slate-900/90 border-slate-700/80 hover:bg-slate-800' : 'bg-white/90 border-white/80 hover:bg-white'}`}
    >
      <MapIcon className="w-3.5 h-3.5" />
      Use the flat map instead
    </button>
  </div>
);

const CONTINENT_VIEWPORTS: Record<string, { scale: number; center: [number, number] }> = {
  World: { scale: 170, center: [0, 15] },
  Europe: { scale: 450, center: [15, 52] },
  Asia: { scale: 300, center: [90, 32] },
  'North America': { scale: 260, center: [-100, 45] },
  'South America': { scale: 320, center: [-60, -20] },
  Africa: { scale: 320, center: [20, 2] },
  Oceania: { scale: 350, center: [145, -25] }
};

export const MapView: React.FC<MapViewProps> = ({
  memories,
  stats,
  homeCountryCode,
  onSetHomeCountry,
  mapTheme = 'light',
  onToggleMapTheme,
  onSelectCountry,
  onQuickMarkVisited,
  onOpenNewEntryWithCountry,
  onOpenMemory,
  wishlist = [],
  cityPins = [],
  onOpenCityPin,
  features
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = MAP_THEMES[mapTheme] || MAP_THEMES.light;
  const isDark = mapTheme === 'dark';

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 1000, height: 600 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStartOffset, setPanStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [activeContinent, setActiveContinent] = useState<string>('World');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [selectedCityPin, setSelectedCityPin] = useState<CityPin | null>(null);

  // Set of wishlist country codes for quick map lookup
  const wishlistCountryCodes = useMemo(() => {
    if (features?.bucketList === false) return new Set<string>();
    const set = new Set<string>();
    wishlist.forEach(w => {
      if (!w.visited) set.add(w.countryCode.toUpperCase());
    });
    return set;
  }, [wishlist, features?.bucketList]);

  // Measure container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: Math.max(clientWidth, 600),
          height: Math.max(clientHeight, 500)
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Map memories by country code
  const memoriesByCountryCode = useMemo(() => {
    const map = new Map<string, TravelMemory[]>();
    memories.forEach(m => {
      const code = m.countryCode.toUpperCase();
      const list = map.get(code) || [];
      list.push(m);
      map.set(code, list);
    });
    return map;
  }, [memories]);

  // Extract topojson feature collection
  const geoData = useMemo(() => {
    try {
      const countriesFeature = topojson.feature(
        worldAtlasData as any,
        (worldAtlasData as any).objects.countries
      ) as any;
      return countriesFeature.features || [];
    } catch (e) {
      console.error('Failed to parse TopoJSON:', e);
      return [];
    }
  }, []);

  // D3 Projection and Path Generator
  const currentViewport = CONTINENT_VIEWPORTS[activeContinent] || CONTINENT_VIEWPORTS.World;
  
  const projection = useMemo(() => {
    const proj = d3Geo.geoNaturalEarth1();
    const baseScale = currentViewport.scale * (dimensions.width / 1000);
    proj
      .scale(baseScale)
      .center(currentViewport.center)
      .translate([dimensions.width / 2, dimensions.height / 2]);
    return proj;
  }, [dimensions.width, dimensions.height, currentViewport]);

  const pathGenerator = useMemo(() => {
    return d3Geo.geoPath(projection);
  }, [projection]);

  // Match each topojson feature with our country database
  const mappedFeatures = useMemo(() => {
    return geoData.map((feature: any) => {
      const numericId = String(feature.id);
      const name = feature.properties?.name || '';
      const countryInfo = findCountry(numericId) || findCountry(name);
      
      const countryCode = countryInfo?.code?.toUpperCase();
      const countryMemories = countryCode ? memoriesByCountryCode.get(countryCode) || [] : [];
      const isVisited = countryMemories.length > 0 || (countryCode && stats.visitedCountryCodes.has(countryCode));

      return {
        feature,
        countryInfo,
        name: countryInfo?.name || name || 'Unknown Region',
        countryCode,
        isVisited,
        memories: countryMemories,
        pathData: pathGenerator(feature) || ''
      };
    });
  }, [geoData, memoriesByCountryCode, pathGenerator, stats.visitedCountryCodes]);

  // Set of country codes that have rendered polygon paths
  const polygonCountryCodes = useMemo(() => {
    const set = new Set<string>();
    mappedFeatures.forEach(mf => {
      if (mf.countryCode && mf.pathData) {
        set.add(mf.countryCode);
      }
    });
    return set;
  }, [mappedFeatures]);

  // Microstate and island country nodes (unvisited and visited small countries & microstates)
  // rendered as subtle, scalable clickable targets
  const microstateNodes = useMemo(() => {
    const nodes: Array<{
      country: CountryInfo;
      memories: TravelMemory[];
      svgX: number;
      svgY: number;
      isVisited: boolean;
    }> = [];

    COUNTRIES_DATA.forEach(country => {
      const code = country.code.toUpperCase();
      const isPolygonRendered = polygonCountryCodes.has(code);
      const memories = memoriesByCountryCode.get(code) || [];
      const isVisited = memories.length > 0 || stats.visitedCountryCodes.has(code);

      // If country is small / microstate or doesn't have a distinct polygon in standard 110m TopoJSON
      const isSmallOrMicrostate = ['KW', 'BH', 'SG', 'QA', 'LU', 'MC', 'AD', 'LI', 'SM', 'VA', 'MV', 'MT', 'CY', 'BN', 'CV', 'ST', 'SC', 'MU', 'BB', 'LC', 'VC', 'GD', 'AG', 'KN', 'DM'].includes(code);
      
      if (!isPolygonRendered || isSmallOrMicrostate) {
        const projected = projection(country.coordinates);
        if (projected) {
          nodes.push({
            country,
            memories,
            svgX: projected[0],
            svgY: projected[1],
            isVisited
          });
        }
      }
    });

    return nodes;
  }, [polygonCountryCodes, projection, memoriesByCountryCode, stats.visitedCountryCodes]);

  // Slower, smooth Zoom Handlers with extended zoom capacity (up to 16x)
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      // Slower, more controlled step (1.18x instead of 1.35x)
      const factor = direction === 'in' ? 1.25 : 0.8;
      const next = Math.max(0.7, Math.min(prev * factor, 16));
      return next;
    });
  }, []);

  // Slower, controlled step panning
  const handleStepPan = useCallback((dx: number, dy: number) => {
    setPanOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveContinent('World');
  }, []);

  // Touch gesture support for mobile pinch zoom & pan
  const touchStartDistRef = React.useRef<number | null>(null);
  const touchStartZoomRef = React.useRef<number>(1);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setPanStartOffset({ x: panOffset.x, y: panOffset.y });
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartZoomRef.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = (e.touches[0].clientX - dragStartPos.x) * 0.75;
      const dy = (e.touches[0].clientY - dragStartPos.y) * 0.75;
      setPanOffset({
        x: panStartOffset.x + dx,
        y: panStartOffset.y + dy
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / touchStartDistRef.current;
      const nextZoom = Math.max(0.7, Math.min(touchStartZoomRef.current * scale, 16));
      setZoomLevel(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Drag pan handlers with smooth slower damping factor
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setPanStartOffset({ x: panOffset.x, y: panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    // Slower damping factor: 0.65x multiplier for relaxed, controllable movement
    const dx = (e.clientX - dragStartPos.x) * 0.65;
    const dy = (e.clientY - dragStartPos.y) * 0.65;
    
    setPanOffset({
      x: panStartOffset.x + dx,
      y: panStartOffset.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Slower wheel zoom (smooth 4% step instead of jumpy 10%) up to 16x
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.05 : 0.95;
    setZoomLevel(prev => Math.max(0.7, Math.min(prev * zoomDelta, 16)));
  };

  // Keyboard navigation for precise, slow control and Escape handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCountry(null);
        setSearchQuery('');
        return;
      }

      // Don't capture when typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      
      const PAN_STEP = 35;
      if (e.key === 'ArrowLeft') {
        handleStepPan(PAN_STEP, 0);
      } else if (e.key === 'ArrowRight') {
        handleStepPan(-PAN_STEP, 0);
      } else if (e.key === 'ArrowUp') {
        handleStepPan(0, PAN_STEP);
      } else if (e.key === 'ArrowDown') {
        handleStepPan(0, -PAN_STEP);
      } else if (e.key === '+' || e.key === '=') {
        handleZoom('in');
      } else if (e.key === '-' || e.key === '_') {
        handleZoom('out');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStepPan, handleZoom]);

  // Click on a country -> Country name & details visible once clicked
  const handleCountryClick = (country: CountryInfo | undefined, countryMemories: TravelMemory[], defaultName: string) => {
    if (country) {
      setSelectedCountry(country);
      // Open the country drawer to display the country name, photos, and memoirs
      onSelectCountry(country, countryMemories);
    }
  };

  // Filtered search list for jump
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return COUNTRIES_DATA.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.capital.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  const selectedCountryMemories = selectedCountry 
    ? memoriesByCountryCode.get(selectedCountry.code.toUpperCase()) || []
    : [];

  if (viewMode === '3d') {
    return (
      <Suspense fallback={<GlobeLoading isDark={isDark} onSwitchTo2D={() => setViewMode('2d')} />}>
        <GlobeView
          memories={memories}
          stats={stats}
          homeCountryCode={homeCountryCode}
          onSetHomeCountry={onSetHomeCountry}
          mapTheme={mapTheme}
          onToggleMapTheme={onToggleMapTheme}
          onSelectCountry={onSelectCountry}
          onQuickMarkVisited={onQuickMarkVisited}
          onOpenNewEntryWithCountry={onOpenNewEntryWithCountry}
          onOpenMemory={onOpenMemory}
          onSwitchTo2D={() => setViewMode('2d')}
          activeContinent={activeContinent}
          onContinentChange={(cont) => setActiveContinent(cont)}
        />
      </Suspense>
    );
  }

  return (
    <div className={`relative w-full h-[calc(100vh-80px)] min-h-[560px] overflow-hidden flex flex-col select-none transition-colors duration-300 ${isDark ? 'bg-[#030712]' : 'bg-[#e0f2fe]'}`}>
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: 2D/3D Switcher & Continent Quick Filters */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {/* 2D vs 3D Switcher */}
          <div className={`flex items-center backdrop-blur-md rounded-2xl p-1 shadow-md border ${isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'}`}>
            <button
              id="map-switch-2d-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2563eb] text-white shadow-xs"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>2D Map</span>
            </button>
            <button
              id="map-switch-3d-btn"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
              }`}
              title="Switch to Interactive 3D Globe"
            >
              <Orbit className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>3D Globe</span>
            </button>
          </div>

          {/* Continent Quick Filters */}
          <div className={`hidden sm:flex items-center gap-1 p-1 backdrop-blur-md rounded-2xl shadow-md overflow-x-auto max-w-full border ${
            isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'
          }`}>
            {['World', ...CONTINENTS].map(cont => {
              const isActive = activeContinent === cont;
              return (
                <button
                  key={cont}
                  id={`map-continent-${cont.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    setActiveContinent(cont);
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {cont.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Theme Switcher, Manual Add Country, Search, Quick Stats */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap justify-end">
          
          {/* Light / Dark Mode Toggle Button */}
          {onToggleMapTheme && (
            <button
              id="map-theme-toggle-btn"
              onClick={onToggleMapTheme}
              className={`p-2 rounded-xl backdrop-blur-md border shadow-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-900/90 border-slate-700/80 text-amber-300 hover:bg-slate-800' 
                  : 'bg-white/90 border-white/80 text-slate-700 hover:bg-slate-100'
              }`}
              title={isDark ? 'Switch to Light Map Mode' : 'Switch to Dark Map Mode'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span className="hidden md:inline">{isDark ? 'Light Map' : 'Dark Map'}</span>
            </button>
          )}

          {/* Dedicated Button for Manual Country & Photo Input */}
          <button
            id="map-manual-entry-btn"
            onClick={() => onOpenNewEntryWithCountry(selectedCountry || COUNTRIES_DATA[0])}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-full shadow-sm transition-all active:scale-95 cursor-pointer font-sans"
            title="Manually input country and photos"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Country & Photos</span>
          </button>

          {/* Map Search input */}
          <div className="relative">
            <div className={`flex items-center backdrop-blur-md border rounded-full shadow-sm px-3.5 py-1.5 ${
              isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'
            }`}>
              <Search className="w-3.5 h-3.5 text-[#94a3b8] mr-2" />
              <input
                type="text"
                id="map-country-search-input"
                placeholder="Find country on map..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent text-xs placeholder-[#94a3b8] focus:outline-none w-28 sm:w-40 font-medium ${
                  isDark ? 'text-slate-100' : 'text-[#1a1a1a]'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#94a3b8] hover:text-[#1a1a1a] ml-1 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className={`absolute right-0 mt-1.5 w-64 backdrop-blur-xl border rounded-2xl shadow-xl p-1.5 z-30 font-sans ${
                isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white border-[#e2e8f0]'
              }`}>
                {searchResults.map(c => {
                  const isVisited = memoriesByCountryCode.has(c.code.toUpperCase());
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCountry(c);
                        const proj = projection(c.coordinates);
                        if (proj) {
                          setActiveContinent(c.continent);
                          setZoomLevel(2);
                          setPanOffset({
                            x: (dimensions.width / 2 - proj[0]) * 2,
                            y: (dimensions.height / 2 - proj[1]) * 2
                          });
                        }
                        const m = memoriesByCountryCode.get(c.code.toUpperCase()) || [];
                        handleCountryClick(c, m, c.name);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#f8fafc] text-[#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-[#1a1a1a]'}`}>{c.name}</p>
                          <p className="text-[10px] text-[#64748b]">{c.capital} • {c.continent}</p>
                        </div>
                      </div>
                      {isVisited ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isDark ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-[#e0f2fe] text-[#2563eb] border-blue-200'
                        }`}>
                          Visited
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#2563eb] font-medium hover:underline">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className={`hidden lg:flex items-center gap-3 backdrop-blur-md border rounded-full px-4 py-1.5 text-xs shadow-sm ${
            isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'
          }`}>
            <div className="flex items-center gap-1.5 text-[#2563eb] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping inline-block" />
              <span>{stats.totalVisitedCountries} Visited</span>
            </div>
            <span className={isDark ? 'text-slate-700' : 'text-[#cbd5e1]'}>|</span>
            <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-[#64748b]'}`}>{stats.percentageOfWorld}%</span>
          </div>

        </div>
      </div>

      {/* Main SVG World Map Stage */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`relative flex-1 w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'} overflow-hidden touch-none ${isDark ? 'bg-[#030712]' : 'bg-[#e0f2fe]'}`}
      >
        {/* Subtle Map Grid lines */}
        <div className={`absolute inset-0 pointer-events-none [background-size:28px_28px] ${
          isDark 
            ? 'opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)]' 
            : 'opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)]'
        }`} />

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="w-full h-full select-none"
        >
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
            
            {/* Ocean sphere base */}
            <rect
              x={-800}
              y={-800}
              width={dimensions.width + 1600}
              height={dimensions.height + 1600}
              fill="transparent"
            />

            {/* Country Polygons (No name on hover, visible once clicked) */}
            {mappedFeatures.map((item, index) => {
              if (!item.pathData) return null;
              
              // Only consider selected if BOTH have valid non-empty country codes that match
              const isSelected = Boolean(
                selectedCountry?.code && 
                item.countryCode && 
                selectedCountry.code.toUpperCase() === item.countryCode.toUpperCase()
              );
              const isVisited = Boolean(item.isVisited);
              
              const isWishlisted = Boolean(item.countryCode && wishlistCountryCodes.has(item.countryCode));
              
              let fillColor = theme.unvisitedFill;
              let strokeColor = theme.unvisitedStroke;
              let strokeWidth = 0.5;

              if (isWishlisted && !isVisited) {
                fillColor = isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(251, 191, 36, 0.35)';
                strokeColor = '#f59e0b';
                strokeWidth = 0.9;
              }

              if (isVisited) {
                fillColor = theme.visitedFill;
                strokeColor = theme.visitedStroke;
                strokeWidth = 1.1;
              }

              if (isSelected) {
                // Distinct active selection state
                fillColor = theme.selectedFill;
                strokeColor = theme.selectedStroke;
                strokeWidth = 2;
              }

              return (
                <path
                  key={index}
                  d={item.pathData}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth / zoomLevel}
                  strokeLinejoin="round"
                  className="transition-colors duration-150 cursor-pointer hover:brightness-110 active:brightness-95"
                  style={{
                    filter: isVisited ? (isDark ? 'drop-shadow(0px 1px 4px rgba(37, 99, 235, 0.6))' : 'drop-shadow(0px 1px 3px rgba(37, 99, 235, 0.35))') : 'none'
                  }}
                  onClick={() => handleCountryClick(item.countryInfo, item.memories, item.name)}
                />
              );
            })}

            {/* Small Nations, Islands & Microstates Clickable Nodes (e.g. Kuwait, Bahrain, Singapore, Malta, Luxembourg, Qatar) */}
            {microstateNodes.map((node, idx) => {
              const isSelected = Boolean(
                selectedCountry?.code && 
                node.country?.code && 
                selectedCountry.code.toUpperCase() === node.country.code.toUpperCase()
              );
              
              // Scale smoothly with zoom without arbitrary fixed minimum pixel clamps
              const radius = isSelected ? (3.0 / Math.sqrt(zoomLevel)) : (2.0 / Math.sqrt(zoomLevel));
              const hitRadius = Math.max(6, 9 / Math.sqrt(zoomLevel));

              return (
                <g
                  key={`microstate-${idx}`}
                  transform={`translate(${node.svgX}, ${node.svgY})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountryClick(node.country, node.memories, node.country.name);
                  }}
                >
                  {/* Invisible Generous Hitbox */}
                  <circle
                    r={hitRadius}
                    fill="transparent"
                    className="cursor-pointer"
                  />

                  {/* Visual Node Ring for active selection */}
                  {isSelected && (
                    <circle
                      r={radius + (2.5 / Math.sqrt(zoomLevel))}
                      fill="none"
                      stroke={theme.microstateRingStroke}
                      strokeWidth={1 / Math.sqrt(zoomLevel)}
                      strokeDasharray="2,2"
                      className="animate-spin pointer-events-none"
                    />
                  )}

                  {/* Core Small Node Circle (Subtle, sleek) */}
                  <circle
                    r={radius}
                    fill={node.isVisited ? theme.microstateVisited : (isSelected ? theme.selectedFill : theme.microstateUnvisited)}
                    stroke={theme.microstateBorder}
                    strokeWidth={0.75 / Math.sqrt(zoomLevel)}
                    className="transition-transform group-hover:scale-125"
                  />
                </g>
              );
            })}

            {/* Custom Multi-City & Landmark Pins Dropped on the Map */}
            {features?.landmarkPinning !== false && cityPins.map((pin) => {
              const projected = projection(pin.coordinates);
              if (!projected) return null;
              const isPinSelected = selectedCityPin?.id === pin.id;
              const pinScale = Math.max(0.65, 1.1 / Math.sqrt(zoomLevel));

              return (
                <g
                  key={pin.id}
                  transform={`translate(${projected[0]}, ${projected[1]}) scale(${pinScale})`}
                  className="cursor-pointer group z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCityPin(pin);
                    if (onOpenCityPin) onOpenCityPin(pin);
                  }}
                >
                  {/* Outer pulse if selected */}
                  {isPinSelected && (
                    <circle
                      r={14}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                      className="animate-ping"
                    />
                  )}
                  {/* Pin Drop Pin Marker */}
                  <circle
                    r={8}
                    fill={pin.category === 'nature' ? '#10b981' : pin.category === 'food' ? '#f59e0b' : pin.category === 'landmark' ? '#8b5cf6' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth={1.8}
                    className="drop-shadow-md group-hover:scale-125 transition-transform"
                  />
                  <circle
                    r={3}
                    fill="#ffffff"
                  />
                  {/* Pin City Label (visible on zoom or hover) */}
                  {(zoomLevel > 1.8 || isPinSelected) && (
                    <text
                      y={-12}
                      textAnchor="middle"
                      fill={isDark ? '#f8fafc' : '#0f172a'}
                      stroke={isDark ? '#0f172a' : '#ffffff'}
                      strokeWidth={2.5}
                      paintOrder="stroke"
                      className="text-[9px] font-bold font-sans pointer-events-none select-none"
                    >
                      {pin.name}
                    </text>
                  )}
                </g>
              );
            })}

          </g>
        </svg>

        {/* Selected Country Banner (Visible Once Clicked on the Map) */}
        {selectedCountry && (
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-4 z-20 animate-in fade-in slide-in-from-bottom-3 duration-200 font-sans max-w-[90vw] ${
            isDark ? 'bg-slate-900/95 border-slate-700/90' : 'bg-white/95 border-white/90'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{selectedCountry.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-base leading-snug ${isDark ? 'text-slate-100' : 'text-[#1e293b]'}`}>
                    {selectedCountry.name}
                  </h3>
                  {selectedCountryMemories.length > 0 ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isDark ? 'bg-blue-900/40 border-blue-700 text-blue-300' : 'bg-[#e0f2fe] border-blue-200 text-[#2563eb]'
                    }`}>
                      Visited ({selectedCountryMemories.length})
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-[#f1f5f9] text-[#64748b]'
                    }`}>
                      Unexplored
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748b]">
                  {selectedCountry.capital} • {selectedCountry.continent}
                </p>
              </div>
            </div>

            <div className={`w-px h-8 ${isDark ? 'bg-slate-800' : 'bg-[#e2e8f0]'}`} />

            <div className="flex items-center gap-2">
              <button 
                id="selected-country-view-details-btn"
                onClick={() => onSelectCountry(selectedCountry, selectedCountryMemories)}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{selectedCountryMemories.length > 0 ? 'View Memoirs & Photos' : 'View Country'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="selected-country-add-photos-btn"
                onClick={() => onOpenNewEntryWithCountry(selectedCountry)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b]'
                }`}
                title="Input photos and memories for this country"
              >
                <Plus className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>+ Add Photos</span>
              </button>

              <button
                onClick={() => setSelectedCountry(null)}
                className={`text-sm px-1.5 py-1 rounded-lg transition-colors cursor-pointer ml-1 ${
                  isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800' : 'text-[#94a3b8] hover:text-[#1a1a1a] hover:bg-slate-100'
                }`}
                title="Deselect"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Bottom Left: Slower Navigation Controls & Directional Pan Buttons */}
        <div className={`absolute bottom-6 left-6 z-20 flex flex-col items-center gap-1.5 p-2 backdrop-blur-md border rounded-2xl shadow-md font-sans ${
          isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-[#e2e8f0]'
        }`}>
          
          {/* Smooth D-pad / Pan Directional Controls for Slower Step Navigation */}
          <div className={`flex flex-col items-center gap-0.5 pb-1 mb-1 border-b ${isDark ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
            <button
              id="map-pan-up-btn"
              onClick={() => handleStepPan(0, 40)}
              title="Pan Up (Slow)"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
              }`}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1">
              <button
                id="map-pan-left-btn"
                onClick={() => handleStepPan(40, 0)}
                title="Pan Left (Slow)"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                id="map-reset-view-btn"
                onClick={handleResetZoom}
                title="Reset Map View"
                className={`p-1.5 rounded-md text-[#2563eb] transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-blue-50'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                id="map-pan-right-btn"
                onClick={() => handleStepPan(-40, 0)}
                title="Pan Right (Slow)"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              id="map-pan-down-btn"
              onClick={() => handleStepPan(0, -40)}
              title="Pan Down (Slow)"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gentle Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              id="map-zoom-in-btn"
              onClick={() => handleZoom('in')}
              title="Zoom In (Smooth)"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
              }`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              id="map-zoom-out-btn"
              onClick={() => handleZoom('out')}
              title="Zoom Out (Smooth)"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
              }`}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Right: Map Legend & Instructions */}
        <div className={`absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-3 px-4 py-2 backdrop-blur-md border rounded-xl shadow-md text-xs font-sans ${
          isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-400' : 'bg-white/90 border-[#e2e8f0] text-[#64748b]'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2563eb] border border-blue-400" />
            <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-[#1e293b]'}`}>Visited ({stats.totalVisitedCountries})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full border ${isDark ? 'bg-[#334155] border-slate-600' : 'bg-[#cbd5e1] border-slate-400'}`} />
            <span>Unexplored</span>
          </div>
          <span className={isDark ? 'text-slate-700' : 'text-[#cbd5e1]'}>|</span>
          <span className={isDark ? 'text-slate-500' : 'text-[#94a3b8]'}>Click country to view • Arrows or drag to pan</span>
        </div>

      </div>

    </div>
  );
};

