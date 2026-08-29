import { supabase } from '../lib/supabase';
import {
  CityPin,
  Continent,
  ExpenseCategory,
  OptionalFeatures,
  TravelMemory,
  WishlistItem,
  DEFAULT_OPTIONAL_FEATURES,
} from '../types';
import { INITIAL_DEMO_MEMORIES, INITIAL_DEMO_WISHLIST, INITIAL_DEMO_PINS } from '../data/demoMemories';
import { TOTAL_WORLD_SOVEREIGN_COUNTRIES, CONTINENTS } from '../data/countries';
import { attachSignedUrls, deletePhotos, photoPathsOf } from './photos';

/**
 * Persistence for travel data, backed by Supabase Postgres.
 *
 * Every table has row level security keyed on auth.uid(), so these queries
 * only ever see the signed-in user's own rows — the user_id filters below are
 * belt-and-braces, not the security boundary.
 *
 * Writes are per-item (upsert one memory, delete one pin) rather than
 * rewriting the whole collection, so editing one trip does not re-send every
 * other one.
 *
 * Map theme and optional feature toggles stay in localStorage: they are
 * per-device display preferences, not user data worth a round trip.
 */

const MAP_THEME_KEY = 'visited_places_map_theme_v1';
const OPTIONAL_FEATURES_KEY = 'visited_places_optional_features_v1';

// ---------------------------------------------------------------------------
// Device-local UI preferences
// ---------------------------------------------------------------------------

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
    console.error('Failed to read optional features:', err);
  }
  return { ...DEFAULT_OPTIONAL_FEATURES };
}

export function saveOptionalFeatures(features: OptionalFeatures): void {
  try {
    localStorage.setItem(OPTIONAL_FEATURES_KEY, JSON.stringify(features));
  } catch (err) {
    console.error('Failed to save optional features:', err);
  }
}

export type MapTheme = 'light' | 'dark';

export function loadMapTheme(): MapTheme {
  try {
    const saved = localStorage.getItem(MAP_THEME_KEY);
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  } catch (err) {
    console.error('Failed to read map theme:', err);
    return 'light';
  }
}

export function saveMapTheme(theme: MapTheme): void {
  try {
    localStorage.setItem(MAP_THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save map theme:', err);
  }
}

// ---------------------------------------------------------------------------
// Row <-> app model mapping
// ---------------------------------------------------------------------------

/** Postgres hands back null for absent columns; the app models use undefined. */
function orUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

function rowToMemory(row: Record<string, any>): TravelMemory {
  return {
    id: row.id,
    countryCode: row.country_code,
    countryName: row.country_name,
    countryFlag: row.country_flag ?? '',
    continent: row.continent as Continent,
    city: row.city ?? '',
    startDate: row.start_date,
    endDate: orUndefined(row.end_date),
    title: row.title ?? '',
    notes: row.notes ?? '',
    highlight: orUndefined(row.highlight),
    photos: Array.isArray(row.photos) ? row.photos : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    rating: row.rating ?? 5,
    weather: orUndefined(row.weather),
    companions: orUndefined(row.companions),
    isFavorite: Boolean(row.is_favorite),
    expenses: Array.isArray(row.expenses) ? row.expenses : [],
    cityPins: Array.isArray(row.city_pins) ? row.city_pins : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function memoryToRow(memory: TravelMemory, userId: string): Record<string, any> {
  return {
    user_id: userId,
    id: memory.id,
    country_code: memory.countryCode.toUpperCase(),
    country_name: memory.countryName,
    country_flag: memory.countryFlag ?? '',
    continent: memory.continent,
    city: memory.city ?? '',
    start_date: memory.startDate,
    end_date: memory.endDate || null,
    title: memory.title ?? '',
    notes: memory.notes ?? '',
    highlight: memory.highlight ?? null,
    // Signed URLs expire, so only the durable storage path is persisted for
    // uploaded photos. Externally linked photos keep their permanent url.
    photos: (memory.photos ?? []).map((photo) =>
      photo.path ? { ...photo, url: '' } : photo
    ),
    tags: memory.tags ?? [],
    rating: memory.rating ?? 5,
    weather: memory.weather ?? null,
    companions: memory.companions ?? null,
    is_favorite: Boolean(memory.isFavorite),
    expenses: memory.expenses ?? [],
    city_pins: memory.cityPins ?? [],
  };
}

function rowToWishlist(row: Record<string, any>): WishlistItem {
  return {
    id: row.id,
    countryCode: row.country_code,
    countryName: row.country_name,
    countryFlag: row.country_flag ?? '',
    continent: row.continent as Continent,
    targetYear: orUndefined(row.target_year),
    priority: row.priority ?? 'medium',
    estimatedBudget: orUndefined(row.estimated_budget),
    currency: orUndefined(row.currency),
    dreamActivities: Array.isArray(row.dream_activities) ? row.dream_activities : [],
    notes: orUndefined(row.notes),
    visited: Boolean(row.visited),
    createdAt: row.created_at,
  };
}

function wishlistToRow(item: WishlistItem, userId: string): Record<string, any> {
  return {
    user_id: userId,
    id: item.id,
    country_code: item.countryCode.toUpperCase(),
    country_name: item.countryName,
    country_flag: item.countryFlag ?? '',
    continent: item.continent,
    target_year: item.targetYear ?? null,
    priority: item.priority ?? 'medium',
    estimated_budget: item.estimatedBudget ?? null,
    currency: item.currency ?? null,
    dream_activities: item.dreamActivities ?? [],
    notes: item.notes ?? null,
    visited: Boolean(item.visited),
  };
}

function rowToPin(row: Record<string, any>): CityPin {
  return {
    id: row.id,
    name: row.name,
    countryCode: row.country_code,
    coordinates: [row.lng, row.lat],
    category: row.category ?? 'city',
    rating: orUndefined(row.rating),
    notes: orUndefined(row.notes),
    memoryId: orUndefined(row.memory_id),
    photoUrl: orUndefined(row.photo_url),
    visitedDate: orUndefined(row.visited_date),
  };
}

function pinToRow(pin: CityPin, userId: string): Record<string, any> {
  return {
    user_id: userId,
    id: pin.id,
    name: pin.name,
    country_code: pin.countryCode.toUpperCase(),
    lng: pin.coordinates[0],
    lat: pin.coordinates[1],
    category: pin.category ?? 'city',
    rating: pin.rating ?? null,
    notes: pin.notes ?? null,
    memory_id: pin.memoryId ?? null,
    photo_url: pin.photoUrl ?? null,
    visited_date: pin.visitedDate || null,
  };
}

// ---------------------------------------------------------------------------
// Memories
// ---------------------------------------------------------------------------

export async function loadMemories(userId: string): Promise<TravelMemory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) {
    throw new Error(`Could not load your travel memories: ${error.message}`);
  }

  const memories = (data ?? []).map(rowToMemory);
  return attachSignedUrls(memories);
}

export async function upsertMemory(memory: TravelMemory, userId: string): Promise<void> {
  const { error } = await supabase
    .from('memories')
    .upsert(memoryToRow(memory, userId), { onConflict: 'user_id,id' });

  if (error) {
    throw new Error(`Could not save "${memory.title}": ${error.message}`);
  }
}

export async function deleteMemory(memory: TravelMemory, userId: string): Promise<void> {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('user_id', userId)
    .eq('id', memory.id);

  if (error) {
    throw new Error(`Could not delete "${memory.title}": ${error.message}`);
  }

  // Only once the row is gone, so a failed delete never orphans the photos.
  await deletePhotos(photoPathsOf(memory));
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export async function loadWishlist(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Could not load your bucket list: ${error.message}`);
  }
  return (data ?? []).map(rowToWishlist);
}

export async function upsertWishlistItem(item: WishlistItem, userId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist_items')
    .upsert(wishlistToRow(item, userId), { onConflict: 'user_id,id' });

  if (error) {
    throw new Error(`Could not save bucket list entry: ${error.message}`);
  }
}

export async function deleteWishlistItem(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);

  if (error) {
    throw new Error(`Could not remove bucket list entry: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// City pins
// ---------------------------------------------------------------------------

export async function loadCityPins(userId: string): Promise<CityPin[]> {
  const { data, error } = await supabase
    .from('city_pins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Could not load your pinned places: ${error.message}`);
  }
  return (data ?? []).map(rowToPin);
}

export async function upsertCityPin(pin: CityPin, userId: string): Promise<void> {
  const { error } = await supabase
    .from('city_pins')
    .upsert(pinToRow(pin, userId), { onConflict: 'user_id,id' });

  if (error) {
    throw new Error(`Could not save pin "${pin.name}": ${error.message}`);
  }
}

export async function deleteCityPin(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('city_pins')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);

  if (error) {
    throw new Error(`Could not remove pin: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Bulk operations: demo data, wipe, backup, restore
// ---------------------------------------------------------------------------

export interface AtlasSnapshot {
  memories: TravelMemory[];
  wishlist: WishlistItem[];
  cityPins: CityPin[];
}

/** Replace everything the user has with the curated sample trips. */
export async function resetToDemoMemories(userId: string): Promise<AtlasSnapshot> {
  await clearAllMemories(userId);
  return replaceAll(
    {
      memories: INITIAL_DEMO_MEMORIES,
      wishlist: INITIAL_DEMO_WISHLIST,
      cityPins: INITIAL_DEMO_PINS,
    },
    userId
  );
}

/** Delete every row this user owns, and the photos they point at. */
export async function clearAllMemories(userId: string): Promise<void> {
  const existing = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId);

  const paths = (existing.data ?? []).flatMap((row) => photoPathsOf(rowToMemory(row)));

  for (const table of ['memories', 'wishlist_items', 'city_pins']) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      throw new Error(`Could not clear your travel history: ${error.message}`);
    }
  }

  await deletePhotos(paths);
}

/** Write a whole snapshot, overwriting rows that share an id. */
async function replaceAll(snapshot: AtlasSnapshot, userId: string): Promise<AtlasSnapshot> {
  if (snapshot.memories.length > 0) {
    const { error } = await supabase
      .from('memories')
      .upsert(snapshot.memories.map((m) => memoryToRow(m, userId)), { onConflict: 'user_id,id' });
    if (error) throw new Error(`Could not restore memories: ${error.message}`);
  }

  if (snapshot.wishlist.length > 0) {
    const { error } = await supabase
      .from('wishlist_items')
      .upsert(snapshot.wishlist.map((w) => wishlistToRow(w, userId)), { onConflict: 'user_id,id' });
    if (error) throw new Error(`Could not restore bucket list: ${error.message}`);
  }

  if (snapshot.cityPins.length > 0) {
    const { error } = await supabase
      .from('city_pins')
      .upsert(snapshot.cityPins.map((p) => pinToRow(p, userId)), { onConflict: 'user_id,id' });
    if (error) throw new Error(`Could not restore pinned places: ${error.message}`);
  }

  return {
    memories: await loadMemories(userId),
    wishlist: await loadWishlist(userId),
    cityPins: await loadCityPins(userId),
  };
}

export function exportMemoriesJSON(snapshot: AtlasSnapshot): void {
  const data = { ...snapshot, exportedAt: new Date().toISOString(), appName: 'Memory Atlas' };
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const anchor = document.createElement('a');
  anchor.setAttribute('href', dataStr);
  anchor.setAttribute('download', `memory_atlas_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export const exportMemoriesAsJSON = exportMemoriesJSON;

/**
 * Restore a backup file into the signed-in user's account.
 *
 * Accepts both the current export shape and a bare array of memories, which
 * is what the pre-Supabase version of the app produced.
 */
export async function importMemoriesJSON(
  file: File,
  userId: string
): Promise<AtlasSnapshot | null> {
  const text = await file.text();

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse backup file:', err);
    return null;
  }

  const snapshot: AtlasSnapshot = Array.isArray(parsed)
    ? { memories: parsed, wishlist: [], cityPins: [] }
    : {
        memories: Array.isArray(parsed?.memories) ? parsed.memories : [],
        wishlist: Array.isArray(parsed?.wishlist) ? parsed.wishlist : [],
        cityPins: Array.isArray(parsed?.cityPins) ? parsed.cityPins : [],
      };

  if (snapshot.memories.length === 0 && snapshot.wishlist.length === 0 && snapshot.cityPins.length === 0) {
    return null;
  }

  // Photos in an old localStorage backup are base64 data URLs with no storage
  // path. Dropping them keeps a multi-megabyte string out of every row; the
  // trips, notes, and ratings all come across intact.
  snapshot.memories = snapshot.memories.map((memory) => ({
    ...memory,
    photos: (memory.photos ?? []).filter(
      (photo) => photo.path || !String(photo.url ?? '').startsWith('data:')
    ),
  }));

  return replaceAll(snapshot, userId);
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

