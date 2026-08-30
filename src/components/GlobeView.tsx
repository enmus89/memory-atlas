import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import * as topojson from 'topojson-client';
import worldAtlasData from 'world-atlas/countries-110m.json';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  Play, 
  Pause, 
  Compass, 
  Layers, 
  Map as MapIcon, 
  Orbit, 
  ArrowRight, 
  Plus, 
  X,
  Sparkles,
  CheckCircle2,
  Plane,
  Home,
  Navigation,
  Globe2,
  Radio,
  Check,
  Sun,
  Moon
} from 'lucide-react';
import { TravelMemory, CountryInfo, MapTheme } from '../types';
import { COUNTRIES_DATA, findCountry } from '../data/countries';
import { TravelStats } from '../utils/storage';
import { MAP_THEMES } from '../utils/mapTheme';

interface GlobeViewProps {
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
  onSwitchTo2D: () => void;
  activeContinent?: string;
  onContinentChange?: (continent: string) => void;
}

const CONTINENT_COORDINATES: Record<string, { lat: number; lng: number; altitude: number }> = {
  World: { lat: 20, lng: 0, altitude: 2.2 },
  Europe: { lat: 50, lng: 15, altitude: 1.4 },
  Asia: { lat: 34, lng: 85, altitude: 1.6 },
  'North America': { lat: 42, lng: -98, altitude: 1.5 },
  'South America': { lat: -18, lng: -60, altitude: 1.5 },
  Africa: { lat: 5, lng: 22, altitude: 1.5 },
  Oceania: { lat: -25, lng: 135, altitude: 1.5 }
};

// Calculate great-circle distance between two [lng, lat] coordinates in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const GlobeView: React.FC<GlobeViewProps> = ({
  memories,
  stats,
  homeCountryCode = 'US',
  onSetHomeCountry,
  mapTheme = 'light',
  onToggleMapTheme,
  onSelectCountry,
  onOpenNewEntryWithCountry,
  onSwitchTo2D,
  activeContinent = 'World',
  onContinentChange
}) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = MAP_THEMES[mapTheme] || MAP_THEMES.light;
  const isDark = mapTheme === 'dark';

  // 3D Globe sphere material (Navy Blue #2C3259 in light mode, deep dark in dark mode)
  const globeMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: theme.globeOceanSphere,
      transparent: false
    });
  }, [theme.globeOceanSphere]);
  
  const [dimensions, setDimensions] = useState({ width: 1000, height: 650 });
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [hoveredPolygon, setHoveredPolygon] = useState<any | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentContinent, setCurrentContinent] = useState<string>(activeContinent);
  
  // Flight Arcs and Home Country State
  const [showFlightArcs, setShowFlightArcs] = useState(true);
  const [isHomePickerOpen, setIsHomePickerOpen] = useState(false);
  const [homePickerSearch, setHomePickerSearch] = useState('');

  // Resolved Home Country Object
  const homeCountry = useMemo(() => {
    return findCountry(homeCountryCode) || findCountry('US') || COUNTRIES_DATA[0];
  }, [homeCountryCode]);

  // Resize handling
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 1000,
          height: containerRef.current.clientHeight || 650
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

  // Extract TopoJSON polygons to GeoJSON Feature Collection
  const countriesGeoJson = useMemo(() => {
    try {
      const featureColl = topojson.feature(
        worldAtlasData as any,
        (worldAtlasData as any).objects.countries
      ) as any;
      
      const features = featureColl.features || [];
      const homeCode = homeCountry?.code?.toUpperCase();
      
      return features.map((f: any) => {
        const numericId = String(f.id);
        const name = f.properties?.name || '';
        const countryInfo = findCountry(numericId) || findCountry(name);
        const code = countryInfo?.code?.toUpperCase();
        const countryMemories = code ? memoriesByCountryCode.get(code) || [] : [];
        const isVisited = countryMemories.length > 0 || (code && stats.visitedCountryCodes.has(code));
        const isHome = code && code === homeCode;

        return {
          ...f,
          countryInfo,
          countryCode: code,
          isVisited,
          isHome,
          countryName: countryInfo?.name || name,
          memoriesCount: countryMemories.length
        };
      });
    } catch (e) {
      console.error('Failed to parse world atlas data for Globe:', e);
      return [];
    }
  }, [memoriesByCountryCode, stats.visitedCountryCodes, homeCountry]);

  // Microstate and island labels for easy clickability on 3D globe + Home Country Pin
  const globeLabels = useMemo(() => {
    const smallCodes = [
      'KW', 'BH', 'SG', 'QA', 'LU', 'MC', 'AD', 'LI', 'SM', 'VA', 
      'MV', 'MT', 'CY', 'BN', 'CV', 'ST', 'SC', 'MU', 'BB', 'LC', 
      'VC', 'GD', 'AG', 'KN', 'DM', 'FJ', 'IS'
    ];

    const labels: any[] = [];
    const homeCode = homeCountry?.code?.toUpperCase();

    // 1. Prominent Home Country Label Pin
    if (homeCountry) {
      labels.push({
        lat: homeCountry.coordinates[1],
        lng: homeCountry.coordinates[0],
        country: homeCountry,
        // No text: the globe's label renderer has no emoji glyph, so the house
        // came out as a question mark, and the amber dot, its pulsing ring and
        // the hover card already say this is home.
        name: '',
        code: homeCountry.code,
        flag: homeCountry.flag,
        isHome: true,
        isVisited: true,
        isSelected: selectedCountry?.code?.toUpperCase() === homeCode,
        size: 1.6,
        color: theme.homeStroke
      });
    }

    // 2. Microstates & Island nations
    COUNTRIES_DATA.filter(c => smallCodes.includes(c.code.toUpperCase()) && c.code.toUpperCase() !== homeCode).forEach(c => {
      const code = c.code.toUpperCase();
      const isVisited = stats.visitedCountryCodes.has(code) || (memoriesByCountryCode.get(code)?.length ?? 0) > 0;
      const isSelected = selectedCountry?.code?.toUpperCase() === code;

      labels.push({
        lat: c.coordinates[1],
        lng: c.coordinates[0],
        country: c,
        name: c.name,
        code: c.code,
        flag: c.flag,
        isHome: false,
        isVisited,
        isSelected,
        size: isSelected ? 1.4 : isVisited ? 1.1 : 0.8,
        color: isSelected ? theme.selectedStroke : isVisited ? (isDark ? '#60a5fa' : '#2563eb') : (isDark ? '#94a3b8' : '#475569')
      });
    });

    return labels;
  }, [stats.visitedCountryCodes, memoriesByCountryCode, selectedCountry, homeCountry, theme, isDark]);

  // Compute Persistent Visual Flight Arcs from Home Country to all Visited Countries
  const flightArcsData = useMemo(() => {
    if (!showFlightArcs || !homeCountry) return [];

    const homeCode = homeCountry.code.toUpperCase();
    const [homeLng, homeLat] = homeCountry.coordinates;

    // Collect all visited country codes except home country
    const visitedCodes = Array.from(stats.visitedCountryCodes)
      .map((c: string) => String(c).toUpperCase())
      .filter(c => c !== homeCode);

    // Also include any countries that have memories recorded
    memories.forEach(m => {
      const code = m.countryCode.toUpperCase();
      if (code !== homeCode && !visitedCodes.includes(code)) {
        visitedCodes.push(code);
      }
    });

    return visitedCodes.map((code, index) => {
      const destCountry = findCountry(code);
      if (!destCountry) return null;

      const [destLng, destLat] = destCountry.coordinates;
      const destMemories = memoriesByCountryCode.get(code) || [];
      const isSelected = selectedCountry?.code?.toUpperCase() === code;
      const isHovered = hoveredPolygon?.countryCode === code;
      
      const distanceKm = calculateDistanceKm(homeLat, homeLng, destLat, destLng);
      const distanceMiles = Math.round(distanceKm * 0.621371);

      // Spherical Angular Distance for dynamic arc altitude
      const dLat = (destLat - homeLat) * (Math.PI / 180);
      const dLon = (destLng - homeLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(homeLat * (Math.PI / 180)) * Math.cos(destLat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const angularDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
      // Calculate arc elevation based on flight distance
      const arcAltitude = Math.min(0.48, Math.max(0.12, 0.08 + (angularDistance / Math.PI) * 0.38));

      // Color scheme
      let arcColors: [string, string];
      if (isSelected) {
        arcColors = ['#f59e0b', '#38bdf8'];
      } else if (isHovered) {
        arcColors = ['#fbbf24', '#60a5fa'];
      } else {
        // Luminous cyan to sky-blue flight path
        arcColors = ['rgba(56, 189, 248, 0.95)', 'rgba(96, 165, 250, 0.85)'];
      }

      return {
        id: `arc-${homeCode}-${code}`,
        startLat: homeLat,
        startLng: homeLng,
        endLat: destLat,
        endLng: destLng,
        homeCountry,
        destCountry,
        distanceKm,
        distanceMiles,
        memoriesCount: destMemories.length,
        color: arcColors,
        altitude: isSelected ? arcAltitude + 0.04 : arcAltitude,
        stroke: isSelected ? 2.8 : isHovered ? 2.4 : 1.6,
        dashLength: 0.5,
        dashGap: 0.15,
        dashInitialGap: (index % 6) * 0.18,
        dashAnimateTime: isSelected ? 1800 : 2600 + (index % 5) * 350,
        label: `
          <div style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.6); padding: 8px 12px; border-radius: 10px; font-family: sans-serif; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
            <div style="font-size: 11px; text-transform: uppercase; color: #38bdf8; font-weight: 700; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
              ✈️ Flight Path
            </div>
            <div style="font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; margin-top: 3px;">
              <span>${homeCountry.flag} ${homeCountry.name}</span>
              <span style="color: #38bdf8;">➔</span>
              <span>${destCountry.flag} ${destCountry.name}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">
              Direct distance: <strong style="color: #e2e8f0;">${distanceKm.toLocaleString()} km</strong> (${distanceMiles.toLocaleString()} mi)
            </div>
            ${destMemories.length > 0 ? `<div style="font-size: 11px; color: #60a5fa; margin-top: 4px; font-weight: 600;">✨ ${destMemories.length} Journey ${destMemories.length === 1 ? 'Memoir' : 'Memoirs'} Recorded</div>` : ''}
          </div>
        `
      };
    }).filter(Boolean);
  }, [showFlightArcs, homeCountry, stats.visitedCountryCodes, memories, memoriesByCountryCode, selectedCountry, hoveredPolygon]);

  // Rings Data: Radiating pulse on Home Base and subtle rings on visited destinations
  const ringsData = useMemo(() => {
    const rings: any[] = [];
    
    if (homeCountry) {
      const [homeLng, homeLat] = homeCountry.coordinates;
      rings.push({
        lat: homeLat,
        lng: homeLng,
        maxR: 4.8,
        speed: 1.8,
        period: 1200,
        isHome: true
      });
    }

    if (showFlightArcs) {
      const homeCode = homeCountry?.code?.toUpperCase();
      Array.from(stats.visitedCountryCodes)
        .map((c: string) => String(c).toUpperCase())
        .filter(c => c !== homeCode)
        .forEach(code => {
          const c = findCountry(code);
          if (c) {
            rings.push({
              lat: c.coordinates[1],
              lng: c.coordinates[0],
              maxR: 2.2,
              speed: 1.0,
              period: 2400,
              isHome: false
            });
          }
        });
    }

    return rings;
  }, [homeCountry, showFlightArcs, stats.visitedCountryCodes]);

  // Setup auto-rotate & controls when globe initializes
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = isAutoRotating;
        controls.autoRotateSpeed = 0.55;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
      }
    }
  }, [isAutoRotating]);

  // Animate point of view on continent switch
  const handleContinentClick = useCallback((continent: string) => {
    setCurrentContinent(continent);
    if (onContinentChange) onContinentChange(continent);
    
    const target = CONTINENT_COORDINATES[continent] || CONTINENT_COORDINATES.World;
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: target.lat, lng: target.lng, altitude: target.altitude }, 1200);
    }
  }, [onContinentChange]);

  // Focus on selected country
  const focusCountry = useCallback((country: CountryInfo) => {
    setSelectedCountry(country);
    setIsAutoRotating(false);
    if (globeRef.current) {
      const [lng, lat] = country.coordinates;
      globeRef.current.pointOfView({ lat, lng, altitude: 1.35 }, 1200);
    }
  }, []);

  // Focus on Home Country
  const focusHomeCountry = useCallback(() => {
    if (!homeCountry) return;
    setSelectedCountry(homeCountry);
    setIsAutoRotating(false);
    if (globeRef.current) {
      const [lng, lat] = homeCountry.coordinates;
      globeRef.current.pointOfView({ lat, lng, altitude: 1.4 }, 1200);
    }
  }, [homeCountry]);

  // Reset View
  const handleResetView = () => {
    setSelectedCountry(null);
    setCurrentContinent('World');
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1000);
      setIsAutoRotating(true);
    }
  };

  // Zoom controls
  const handleZoom = (dir: 'in' | 'out') => {
    if (!globeRef.current) return;
    const currentPov = globeRef.current.pointOfView();
    const currentAlt = currentPov.altitude || 2.2;
    const newAlt = dir === 'in' ? Math.max(0.3, currentAlt * 0.75) : Math.min(4.5, currentAlt * 1.3);
    globeRef.current.pointOfView({ ...currentPov, altitude: newAlt }, 400);
  };

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return COUNTRIES_DATA.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) ||
      c.capital.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  // Home Country Picker Filtered List
  const filteredHomeCountries = useMemo(() => {
    if (!homePickerSearch.trim()) return COUNTRIES_DATA;
    const q = homePickerSearch.toLowerCase().trim();
    return COUNTRIES_DATA.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) || 
      c.capital.toLowerCase().includes(q)
    );
  }, [homePickerSearch]);

  const selectedCountryMemories = useMemo(() => {
    if (!selectedCountry) return [];
    return memoriesByCountryCode.get(selectedCountry.code.toUpperCase()) || [];
  }, [selectedCountry, memoriesByCountryCode]);

  const isSelectedCountryHome = selectedCountry?.code?.toUpperCase() === homeCountry?.code?.toUpperCase();

  return (
    <div className={`relative w-full h-full min-h-0 flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#030712]' : 'bg-[#e0f2fe]'}`}>
      
      {/* Top Floating Navigation Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: 2D / 3D Switcher & Flight Arcs & Home Picker & Continents */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          
          {/* 2D vs 3D Switcher */}
          <div className={`flex items-center backdrop-blur-md rounded-2xl p-1 shadow-md border ${isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'}`}>
            <button
              id="globe-switch-2d-btn"
              onClick={onSwitchTo2D}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
              }`}
              title="Switch to Flat 2D Map"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>2D Map</span>
            </button>
            <button
              id="globe-switch-3d-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#2563eb] text-white shadow-md shadow-blue-900/30 transition-all"
            >
              <Orbit className="w-3.5 h-3.5 animate-spin-slow" />
              <span>3D Globe</span>
            </button>
          </div>

          {/* Flight Path Arcs Toggle Button */}
          <button
            id="globe-toggle-flight-arcs-btn"
            onClick={() => setShowFlightArcs(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold backdrop-blur-md border shadow-md transition-all cursor-pointer ${
              showFlightArcs
                ? isDark
                  ? 'bg-blue-600/30 border-blue-400/50 text-blue-300 shadow-blue-900/30'
                  : 'bg-blue-500/20 border-blue-400/60 text-blue-700 shadow-blue-200/50'
                : isDark
                  ? 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'bg-white/90 border-white/80 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
            }`}
            title={showFlightArcs ? 'Hide Flight Path Arcs' : 'Show Flight Path Arcs'}
          >
            <Plane className={`w-3.5 h-3.5 ${showFlightArcs ? 'text-blue-500' : ''}`} />
            <span>Flight Arcs</span>
            {showFlightArcs && flightArcsData.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#2563eb] text-white text-[10px] font-mono font-bold">
                {flightArcsData.length}
              </span>
            )}
          </button>

          {/* Home Country Selector Pill */}
          <div className="relative">
            <button
              id="globe-home-country-btn"
              onClick={() => setIsHomePickerOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold backdrop-blur-md border shadow-md transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/40 text-amber-300' 
                  : 'bg-white/90 hover:bg-[#f8fafc] border-amber-500/40 text-amber-700'
              }`}
              title="Set or change your Home Country base"
            >
              <Home className="w-3.5 h-3.5 text-amber-500" />
              <span>Home:</span>
              <span className="text-sm leading-none">{homeCountry?.flag}</span>
              <span className={isDark ? 'text-slate-200 font-medium' : 'text-[#1e293b] font-semibold'}>
                {homeCountry?.name || 'Set Home'}
              </span>
              <span className="text-[10px] text-amber-500 font-mono underline ml-0.5">Edit</span>
            </button>

            {/* Home Country Picker Popover Dropdown */}
            {isHomePickerOpen && (
              <div className={`absolute left-0 mt-2 w-72 backdrop-blur-xl border border-amber-500/50 rounded-2xl shadow-2xl p-2.5 z-40 font-sans animate-in fade-in zoom-in-95 duration-150 ${
                isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-[#e2e8f0]'
              }`}>
                <div className={`flex items-center justify-between pb-2 mb-2 border-b px-1 ${isDark ? 'border-slate-800 text-amber-300' : 'border-slate-200 text-amber-700'}`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Home className="w-3.5 h-3.5" />
                    <span>Select Home Country</span>
                  </div>
                  <button 
                    onClick={() => setIsHomePickerOpen(false)}
                    className={`text-xs p-1 rounded-md cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                  >
                    ✕
                  </button>
                </div>

                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    id="globe-home-picker-search-input"
                    placeholder="Search country..."
                    value={homePickerSearch}
                    onChange={(e) => setHomePickerSearch(e.target.value)}
                    className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 border ${
                      isDark 
                        ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-400' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    autoFocus
                  />
                </div>

                <div className={`max-h-52 overflow-y-auto space-y-0.5 pr-1 divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                  {filteredHomeCountries.slice(0, 30).map(c => {
                    const isSelected = c.code.toUpperCase() === homeCountry?.code?.toUpperCase();
                    return (
                      <button
                        key={c.code}
                        onClick={() => {
                          if (onSetHomeCountry) {
                            onSetHomeCountry(c.code);
                          }
                          setIsHomePickerOpen(false);
                          setHomePickerSearch('');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isSelected 
                            ? isDark 
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold' 
                              : 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold'
                            : isDark
                              ? 'text-slate-200 hover:bg-slate-800'
                              : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <div>
                            <p className={`font-medium leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.continent}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Continent Filter Pills */}
          <div className={`hidden xl:flex items-center backdrop-blur-md rounded-2xl p-1 shadow-md gap-0.5 border ${
            isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'
          }`}>
            {['World', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'].map(cont => {
              const isActive = currentContinent === cont;
              return (
                <button
                  key={cont}
                  onClick={() => handleContinentClick(cont)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-[#2563eb] text-white font-semibold shadow-xs' 
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {cont === 'North America' ? 'N. America' : cont === 'South America' ? 'S. America' : cont}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right: Theme Switcher, Auto-Spin & Search Box */}
        <div className="pointer-events-auto flex items-center gap-2 ml-auto">
          
          {/* Light / Dark Mode Toggle Button */}
          {onToggleMapTheme && (
            <button
              id="globe-theme-toggle-btn"
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

          {/* Globe Auto-Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotating(prev => !prev)}
            className={`p-2 rounded-xl backdrop-blur-md border shadow-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAutoRotating 
                ? isDark
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                  : 'bg-blue-100 border-blue-300 text-blue-700'
                : isDark
                  ? 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  : 'bg-white/90 border-white/80 text-slate-700 hover:bg-slate-100'
            }`}
            title={isAutoRotating ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isAutoRotating ? 'Spinning' : 'Spin Globe'}</span>
          </button>

          {/* Search Box to Rotate to Any Country */}
          <div className="relative">
            <div className={`flex items-center backdrop-blur-md border rounded-2xl shadow-md px-3.5 py-1.5 ${
              isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input
                type="text"
                id="globe-country-search-input"
                placeholder="Spin to country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent text-xs focus:outline-none w-28 sm:w-40 font-medium ${
                  isDark ? 'text-slate-100 placeholder-slate-400' : 'text-[#1e293b] placeholder-slate-400'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-200 ml-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className={`absolute right-0 mt-2 w-64 backdrop-blur-xl border rounded-2xl shadow-2xl p-1.5 z-30 font-sans divide-y ${
                isDark ? 'bg-slate-900/95 border-slate-700 divide-slate-800' : 'bg-white/95 border-[#e2e8f0] divide-slate-100'
              }`}>
                {searchResults.map(c => {
                  const isVisited = stats.visitedCountryCodes.has(c.code.toUpperCase());
                  const isHome = c.code.toUpperCase() === homeCountry?.code?.toUpperCase();
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        setSearchQuery('');
                        focusCountry(c);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#f8fafc] text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.capital} • {c.continent}</p>
                        </div>
                      </div>
                      {isHome ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-semibold border border-amber-500/30">
                          Home Base
                        </span>
                      ) : isVisited ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 text-[10px] font-semibold border border-blue-500/30">
                          Visited
                        </span>
                      ) : (
                        <span className="text-[10px] text-blue-600 font-medium hover:underline">
                          Locate
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className={`hidden lg:flex items-center gap-3 backdrop-blur-md border rounded-2xl px-4 py-1.5 text-xs shadow-md ${
            isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'
          }`}>
            <div className="flex items-center gap-1.5 text-[#2563eb] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping inline-block" />
              <span>{stats.totalVisitedCountries} Visited</span>
            </div>
            <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
            <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{stats.percentageOfWorld}%</span>
          </div>

        </div>

      </div>

      {/* 3D WebGL Globe Container */}
      <div 
        ref={containerRef} 
        className={`w-full h-full flex-1 relative cursor-grab active:cursor-grabbing ${isDark ? 'bg-[#030712]' : 'bg-[#e0f2fe]'}`}
      >
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor={theme.oceanBg}
          globeMaterial={globeMaterial}
          showAtmosphere={true}
          atmosphereColor={theme.atmosphereColor}
          atmosphereAltitude={theme.atmosphereAltitude}
          
          // Polygons (Country Boundaries - perfectly matched with 2D Map colors)
          polygonsData={countriesGeoJson}
          polygonCapColor={(feat: any) => {
            const isSelected = selectedCountry?.code?.toUpperCase() === feat.countryCode;
            const isHovered = hoveredPolygon?.countryCode === feat.countryCode;
            const isHome = feat.isHome;

            if (isSelected) return theme.selectedFill;
            if (isHovered) return theme.hoverFill;
            if (isHome) return theme.homeFill;
            if (feat.isVisited) return theme.visitedFill;
            return theme.unvisitedFill;
          }}
          polygonSideColor={(feat: any) => {
            const isSelected = selectedCountry?.code?.toUpperCase() === feat.countryCode;
            const isHome = feat.isHome;
            if (isSelected) return theme.selectedSide;
            if (isHome) return theme.homeSide;
            if (feat.isVisited) return theme.visitedSide;
            return theme.unvisitedSide;
          }}
          polygonStrokeColor={(feat: any) => {
            const isSelected = selectedCountry?.code?.toUpperCase() === feat.countryCode;
            const isHome = feat.isHome;
            if (isSelected) return theme.selectedStroke;
            if (isHome) return theme.homeStroke;
            if (feat.isVisited) return theme.visitedStroke;
            return theme.unvisitedStroke;
          }}
          polygonAltitude={(feat: any) => {
            const isSelected = selectedCountry?.code?.toUpperCase() === feat.countryCode;
            const isHovered = hoveredPolygon?.countryCode === feat.countryCode;
            const isHome = feat.isHome;
            if (isSelected) return 0.07;
            if (isHovered) return 0.05;
            if (isHome) return 0.04;
            if (feat.isVisited) return 0.03;
            return 0.008;
          }}
          polygonsTransitionDuration={250}
          polygonLabel={(feat: any) => `
            <div style="background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'}; backdrop-filter: blur(8px); border: 1px solid ${feat.isHome ? 'rgba(245, 158, 11, 0.8)' : isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(226, 232, 240, 0.9)'}; padding: 8px 12px; border-radius: 10px; font-family: sans-serif; color: ${isDark ? '#fff' : '#1e293b'}; box-shadow: 0 10px 25px rgba(0,0,0,0.25);">
              <div style="font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                <span>${feat.countryInfo?.flag || '🌍'}</span>
                <span>${feat.countryName}</span>
                ${feat.isHome ? '<span style="background: #f59e0b; color: #000; font-size: 9px; padding: 2px 6px; border-radius: 9999px; font-weight: 800; text-transform: uppercase;">🏠 Home Base</span>' : feat.isVisited ? '<span style="background: #2563eb; color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase;">Visited</span>' : ''}
              </div>
              <div style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'}; margin-top: 2px;">
                ${feat.countryInfo?.continent || 'Continent'} • ${feat.countryInfo?.capital || ''}
              </div>
              ${feat.memoriesCount > 0 ? `<div style="font-size: 11px; color: #2563eb; margin-top: 4px; font-weight: 600;">✨ ${feat.memoriesCount} Journey ${feat.memoriesCount === 1 ? 'Memoir' : 'Memoirs'}</div>` : ''}
            </div>
          `}
          onPolygonClick={(feat: any) => {
            if (feat.countryInfo) {
              focusCountry(feat.countryInfo);
            }
          }}
          onPolygonHover={(feat: any) => {
            setHoveredPolygon(feat);
          }}

          // Persistent Flight Path Arcs
          arcsData={flightArcsData}
          arcStartLat={(d: any) => d.startLat}
          arcStartLng={(d: any) => d.startLng}
          arcEndLat={(d: any) => d.endLat}
          arcEndLng={(d: any) => d.endLng}
          arcColor={(d: any) => d.color}
          arcAltitude={(d: any) => d.altitude}
          arcStroke={(d: any) => d.stroke}
          arcDashLength={(d: any) => d.dashLength}
          arcDashGap={(d: any) => d.dashGap}
          arcDashInitialGap={(d: any) => d.dashInitialGap}
          arcDashAnimateTime={(d: any) => d.dashAnimateTime}
          arcLabel={(d: any) => d.label}
          onArcClick={(d: any) => {
            if (d.destCountry) {
              focusCountry(d.destCountry);
            }
          }}

          // Radiating Rings for Home Base & Visited Countries
          ringsData={ringsData}
          ringColor={(d: any) => (t: number) => 
            d.isHome 
              ? `rgba(245, 158, 11, ${1 - t})` 
              : isDark
                ? `rgba(56, 189, 248, ${(1 - t) * 0.7})`
                : `rgba(37, 99, 235, ${(1 - t) * 0.7})`
          }
          ringMaxRadius={(d: any) => d.maxR}
          ringPropagationSpeed={(d: any) => d.speed}
          ringRepeatPeriod={(d: any) => d.period}

          // Microstate, Island & Home Base Labels
          labelsData={globeLabels}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => d.name}
          labelSize={(d: any) => d.size}
          labelDotRadius={(d: any) => (d.isHome ? 0.8 : d.isSelected ? 0.6 : 0.4)}
          labelColor={(d: any) => d.color}
          labelResolution={2}
          onLabelClick={(d: any) => {
            focusCountry(d.country);
          }}
        />
      </div>

      {/* Floating Bottom Card for Selected Country */}
      {selectedCountry && (
        <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto backdrop-blur-xl border rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4 max-w-xl w-[92%] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-200 font-sans ${
          isDark ? 'bg-slate-900/95 border-blue-500/40 text-slate-100' : 'bg-white/95 border-blue-200 text-[#1e293b]'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedCountry.flag}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-[#1e293b]'}`}>{selectedCountry.name}</h3>
                {isSelectedCountryHome ? (
                  <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Home className="w-3 h-3" />
                    Home Base
                  </span>
                ) : stats.visitedCountryCodes.has(selectedCountry.code.toUpperCase()) ? (
                  <span className="bg-[#2563eb] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Visited
                  </span>
                ) : (
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    Unexplored
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedCountry.continent} • Capital: {selectedCountry.capital}
                {homeCountry && !isSelectedCountryHome && (
                  <span className={`ml-1 ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                    • ✈️ {calculateDistanceKm(homeCountry.coordinates[1], homeCountry.coordinates[0], selectedCountry.coordinates[1], selectedCountry.coordinates[0]).toLocaleString()} km from Home
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 flex-wrap ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {!isSelectedCountryHome && (
              <button
                id="globe-set-as-home-btn"
                onClick={() => {
                  if (onSetHomeCountry) {
                    onSetHomeCountry(selectedCountry.code);
                  }
                }}
                className={`text-xs font-semibold px-2.5 py-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1 ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border-amber-500/30' 
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                }`}
                title="Set this country as your Home Base for flight path arcs"
              >
                <Home className="w-3.5 h-3.5 text-amber-500" />
                <span>Set as Home</span>
              </button>
            )}

            <button
              id="globe-country-view-details-btn"
              onClick={() => onSelectCountry(selectedCountry, selectedCountryMemories)}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md shadow-blue-900/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{selectedCountryMemories.length > 0 ? 'View Memoirs' : 'Country Details'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="globe-country-add-photos-btn"
              onClick={() => onOpenNewEntryWithCountry(selectedCountry)}
              className={`text-xs font-semibold px-2.5 py-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1 ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="Add photos and notes"
            >
              <Plus className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>+ Add Entry</span>
            </button>

            <button
              onClick={() => setSelectedCountry(null)}
              className={`text-sm p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Left Navigation Controls */}
      <div className={`absolute bottom-6 left-6 z-20 flex flex-col items-center gap-1.5 p-2 backdrop-blur-md border rounded-2xl shadow-xl font-sans pointer-events-auto ${
        isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/90 border-white/80'
      }`}>
        <button
          id="globe-reset-view-btn"
          onClick={handleResetView}
          title="Reset Globe View"
          className="p-2 rounded-xl text-[#2563eb] hover:bg-blue-500/10 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          id="globe-focus-home-btn"
          onClick={focusHomeCountry}
          title="Focus Camera on Home Country"
          className="p-2 rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
        </button>
        <div className={`w-full h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        <button
          id="globe-zoom-in-btn"
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="globe-zoom-out-btn"
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom Right Legend & Flight Route Stats */}
      <div className={`absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-3 px-4 py-2 backdrop-blur-md border rounded-xl shadow-xl text-xs font-sans pointer-events-auto ${
        isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-400' : 'bg-white/90 border-white/80 text-[#64748b]'
      }`}>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300" />
          <span className="text-amber-500 font-semibold">Home ({homeCountry?.name})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2563eb] border border-blue-400" />
          <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-[#1e293b]'}`}>Visited ({stats.totalVisitedCountries})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full border ${isDark ? 'bg-[#334155] border-slate-600' : 'bg-[#cbd5e1] border-slate-400'}`} />
          <span>Unexplored</span>
        </div>
        {showFlightArcs && flightArcsData.length > 0 && (
          <div className="flex items-center gap-1.5 text-[#2563eb] font-medium">
            <Plane className="w-3.5 h-3.5" />
            <span>{flightArcsData.length} Flight Arcs</span>
          </div>
        )}
        <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
        <span className="text-slate-400">Click arc / country to view</span>
      </div>

    </div>
  );
};
