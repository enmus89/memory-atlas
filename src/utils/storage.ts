import { TravelMemory, Continent, WishlistItem, CityPin, ExpenseCategory, OptionalFeatures, DEFAULT_OPTIONAL_FEATURES } from '../types';
import { INITIAL_DEMO_MEMORIES, INITIAL_DEMO_WISHLIST, INITIAL_DEMO_PINS } from '../data/demoMemories';
import { TOTAL_WORLD_SOVEREIGN_COUNTRIES, CONTINENTS } from '../data/countries';
import { 
  getCurrentUser, 
  loadUserMemories, 
  saveUserMemories, 
  loadUserHomeCountry, 
  saveUserHomeCountry 
} from './auth';

const STORAGE_KEY = 'visited_places_travel_diary_v1';
const WISHLIST_KEY = 'visited_places_wishlist_v1';
const CITY_PINS_KEY = 'visited_places_city_pins_v1';
const HOME_COUNTRY_KEY = 'visited_places_home_country_code_v1';
const MAP_THEME_KEY = 'visited_places_map_theme_v1';
const OPTIONAL_FEATURES_KEY = 'visited_places_optional_features_v1';

export function loadOptionalFeatures(): OptionalFeatures {
  try {
    const saved = localStorage.getItem(OPTIONAL_FEATURES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        bucketList: parsed.bucketList !== false,
        posterGenerator: parsed.posterGenerator !== false,
        landmarkPinning: parsed.landmarkPinning !== false,
        budgetExpenses: parsed.budgetExpenses !== false,
        aiAssistant: parsed.aiAssistant !== false,
      };
    }
  } catch (err) {
    console.error('Failed to read optional features from localStorage:', err);
  }
  return { ...DEFAULT_OPTIONAL_FEATURES };
}

export function saveOptionalFeatures(features: OptionalFeatures): void {
  try {
    localStorage.setItem(OPTIONAL_FEATURES_KEY, JSON.stringify(features));
  } catch (err) {
    console.error('Failed to save optional features to localStorage:', err);
  }
}

export type MapTheme = 'light' | 'dark';

export function loadMapTheme(): MapTheme {
  try {
    const saved = localStorage.getItem(MAP_THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'light';
  } catch (err) {
    console.error('Failed to read map theme from localStorage:', err);
    return 'light';
  }
}

export function saveMapTheme(theme: MapTheme): void {
  try {
    localStorage.setItem(MAP_THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save map theme to localStorage:', err);
  }
}

export function loadHomeCountryCode(userId?: string): string {
  const currentUserId = userId || getCurrentUser()?.id;
  if (currentUserId) {
    return loadUserHomeCountry(currentUserId, 'US');
  }
  try {
    const saved = localStorage.getItem(HOME_COUNTRY_KEY);
    if (saved && saved.trim()) {
      return saved.trim().toUpperCase();
    }
    return 'US';
  } catch (err) {
    console.error('Failed to read home country from localStorage:', err);
    return 'US';
  }
}

export function saveHomeCountryCode(code: string | null, userId?: string): void {
  const currentUserId = userId || getCurrentUser()?.id;
  if (currentUserId) {
    saveUserHomeCountry(currentUserId, code);
  }
  try {
    if (code) {
      localStorage.setItem(HOME_COUNTRY_KEY, code.toUpperCase());
    } else {
      localStorage.removeItem(HOME_COUNTRY_KEY);
    }
  } catch (err) {
    console.error('Failed to save home country to localStorage:', err);
  }
}

export function loadMemories(userId?: string): TravelMemory[] {
  const currentUserId = userId || getCurrentUser()?.id;
  if (currentUserId) {
    return loadUserMemories(currentUserId);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_MEMORIES));
      return INITIAL_DEMO_MEMORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_MEMORIES;
  } catch (err) {
    console.error('Failed to read memories from localStorage:', err);
    return INITIAL_DEMO_MEMORIES;
  }
}

export function saveMemories(memories: TravelMemory[], userId?: string): void {
  const currentUserId = userId || getCurrentUser()?.id;
  if (currentUserId) {
    saveUserMemories(currentUserId, memories);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch (err) {
    console.error('Failed to save memories to localStorage:', err);
  }
}

export function loadWishlist(userId?: string): WishlistItem[] {
  const currentUserId = userId || getCurrentUser()?.id;
  const key = currentUserId ? `${WISHLIST_KEY}_${currentUserId}` : WISHLIST_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_WISHLIST));
      return INITIAL_DEMO_WISHLIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_WISHLIST;
  } catch (err) {
    console.error('Failed to read wishlist from localStorage:', err);
    return INITIAL_DEMO_WISHLIST;
  }
}

export function saveWishlist(wishlist: WishlistItem[], userId?: string): void {
  const currentUserId = userId || getCurrentUser()?.id;
  const key = currentUserId ? `${WISHLIST_KEY}_${currentUserId}` : WISHLIST_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(wishlist));
  } catch (err) {
    console.error('Failed to save wishlist to localStorage:', err);
  }
}

export function loadCityPins(userId?: string): CityPin[] {
  const currentUserId = userId || getCurrentUser()?.id;
  const key = currentUserId ? `${CITY_PINS_KEY}_${currentUserId}` : CITY_PINS_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_PINS));
      return INITIAL_DEMO_PINS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_PINS;
  } catch (err) {
    console.error('Failed to read city pins from localStorage:', err);
    return INITIAL_DEMO_PINS;
  }
}

export function saveCityPins(pins: CityPin[], userId?: string): void {
  const currentUserId = userId || getCurrentUser()?.id;
  const key = currentUserId ? `${CITY_PINS_KEY}_${currentUserId}` : CITY_PINS_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(pins));
  } catch (err) {
    console.error('Failed to save city pins to localStorage:', err);
  }
}

export function resetToDemoMemories(): TravelMemory[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_MEMORIES));
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(INITIAL_DEMO_WISHLIST));
  localStorage.setItem(CITY_PINS_KEY, JSON.stringify(INITIAL_DEMO_PINS));
  return INITIAL_DEMO_MEMORIES;
}

export function clearAllMemories(): TravelMemory[] {
  const empty: TravelMemory[] = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
  return empty;
}

export function exportMemoriesJSON(memories?: TravelMemory[]) {
  const data = {
    memories: memories || loadMemories(),
    wishlist: loadWishlist(),
    cityPins: loadCityPins(),
    exportedAt: new Date().toISOString(),
    appName: 'Memory Atlas'
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `memory_atlas_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export const exportMemoriesAsJSON = exportMemoriesJSON;

export function importMemoriesJSON(file: File): Promise<{ memories: TravelMemory[]; wishlist?: WishlistItem[]; cityPins?: CityPin[] } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          saveMemories(parsed);
          resolve({ memories: parsed });
        } else if (parsed && Array.isArray(parsed.memories)) {
          saveMemories(parsed.memories);
          if (Array.isArray(parsed.wishlist)) saveWishlist(parsed.wishlist);
          if (Array.isArray(parsed.cityPins)) saveCityPins(parsed.cityPins);
          resolve({
            memories: parsed.memories,
            wishlist: parsed.wishlist,
            cityPins: parsed.cityPins
          });
        } else {
          resolve(null);
        }
      } catch (err) {
        console.error('Failed to import JSON file:', err);
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

export interface TravelStats {
  totalVisitedCountries: number;
  visitedCountryCodes: Set<string>;
  percentageOfWorld: number;
  continentsVisitedCount: number;
  totalPhotosCount: number;
  totalMemoriesCount: number;
  continentStats: Record<Continent, { visited: number; totalKnown: number; percentage: number }>;
  favoriteMemoriesCount: number;
  totalFavoritesCount: number;
  mostRecentTrip?: TravelMemory;
  oldestTrip?: TravelMemory;
  tagsFrequency: Record<string, number>;
  // Financial & Expense Analytics
  totalSpendingUSD: number;
  categorySpending: Record<ExpenseCategory, number>;
  averageCostPerTrip: number;
  totalDaysTraveled: number;
  averageDailyCostUSD: number;
  mostExpensiveTrip?: { trip: TravelMemory; totalUSD: number };
}

export function calculateStats(memories: TravelMemory[]): TravelStats {
  const visitedCodes = new Set<string>();
  const continentsSet = new Set<Continent>();
  let totalPhotos = 0;
  let favorites = 0;
  const tagsCount: Record<string, number> = {};

  let totalSpendingUSD = 0;
  let totalDaysTraveled = 0;
  const categorySpending: Record<ExpenseCategory, number> = {
    flights: 0,
    lodging: 0,
    food: 0,
    activities: 0,
    transit: 0,
    shopping: 0,
    other: 0
  };

  let maxTripSpend = 0;
  let mostExpensiveTripObj: { trip: TravelMemory; totalUSD: number } | undefined = undefined;

  const continentCounts: Record<Continent, number> = {
    'Europe': 0,
    'Asia': 0,
    'North America': 0,
    'South America': 0,
    'Africa': 0,
    'Oceania': 0,
    'Antarctica': 0,
  };

  const continentTotalEstimates: Record<Continent, number> = {
    'Europe': 44,
    'Asia': 48,
    'North America': 23,
    'South America': 12,
    'Africa': 54,
    'Oceania': 14,
    'Antarctica': 0,
  };

  memories.forEach(m => {
    visitedCodes.add(m.countryCode.toUpperCase());
    if (m.continent) {
      continentsSet.add(m.continent);
      continentCounts[m.continent] = (continentCounts[m.continent] || 0) + 1;
    }
    if (Array.isArray(m.photos)) {
      totalPhotos += m.photos.length;
    }
    if (m.isFavorite) {
      favorites += 1;
    }
    if (Array.isArray(m.tags)) {
      m.tags.forEach(t => {
        tagsCount[t] = (tagsCount[t] || 0) + 1;
      });
    }

    // Days calculation
    if (m.startDate) {
      const start = new Date(m.startDate).getTime();
      const end = m.endDate ? new Date(m.endDate).getTime() : start;
      const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
      totalDaysTraveled += isNaN(days) ? 1 : days;
    }

    // Expenses calculation
    let tripSpend = 0;
    if (Array.isArray(m.expenses)) {
      m.expenses.forEach(exp => {
        // Approximate currency normalization if EUR (1.08) or GBP (1.27) or JPY (0.0067)
        let rate = 1;
        if (exp.currency === 'EUR') rate = 1.08;
        else if (exp.currency === 'GBP') rate = 1.28;
        else if (exp.currency === 'JPY') rate = 0.0066;
        else if (exp.currency === 'CAD' || exp.currency === 'AUD') rate = 0.65;

        const usdVal = exp.amount * rate;
        totalSpendingUSD += usdVal;
        tripSpend += usdVal;

        if (exp.category && categorySpending[exp.category] !== undefined) {
          categorySpending[exp.category] += usdVal;
        } else {
          categorySpending.other += usdVal;
        }
      });
    }

    if (tripSpend > maxTripSpend) {
      maxTripSpend = tripSpend;
      mostExpensiveTripObj = { trip: m, totalUSD: Math.round(tripSpend) };
    }
  });

  const continentStats: Record<Continent, { visited: number; totalKnown: number; percentage: number }> = {} as any;
  CONTINENTS.forEach(cont => {
    const visited = continentCounts[cont] || 0;
    const totalKnown = continentTotalEstimates[cont] || 1;
    continentStats[cont] = {
      visited,
      totalKnown,
      percentage: Math.min(100, Math.round((visited / totalKnown) * 100))
    };
  });

  const sortedByDate = [...memories].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const totalVisited = visitedCodes.size;
  const percentageOfWorld = Math.round((totalVisited / TOTAL_WORLD_SOVEREIGN_COUNTRIES) * 1000) / 10;
  const averageCostPerTrip = memories.length > 0 ? Math.round(totalSpendingUSD / memories.length) : 0;
  const averageDailyCostUSD = totalDaysTraveled > 0 ? Math.round(totalSpendingUSD / totalDaysTraveled) : 0;

  return {
    totalVisitedCountries: totalVisited,
    visitedCountryCodes: visitedCodes,
    percentageOfWorld,
    continentsVisitedCount: continentsSet.size,
    totalPhotosCount: totalPhotos,
    totalMemoriesCount: memories.length,
    continentStats,
    favoriteMemoriesCount: favorites,
    totalFavoritesCount: favorites,
    mostRecentTrip: sortedByDate[0],
    oldestTrip: sortedByDate[sortedByDate.length - 1],
    tagsFrequency: tagsCount,
    totalSpendingUSD: Math.round(totalSpendingUSD),
    categorySpending,
    averageCostPerTrip,
    totalDaysTraveled,
    averageDailyCostUSD,
    mostExpensiveTrip: mostExpensiveTripObj
  };
}

export const computeTravelStats = calculateStats;

