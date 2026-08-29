export interface PhotoItem {
  id: string;
  /**
   * Displayable URL. For uploaded photos this is a short-lived signed URL
   * minted from `path` on load, so it is not durable — never persist it as
   * the source of truth. Photos added by pasting a link have no `path` and
   * carry a permanent external URL here instead.
   */
  url: string;
  /** Path inside the private `memory-photos` bucket, for uploaded photos. */
  path?: string;
  caption?: string;
  isCover?: boolean;
  location?: string;
}

export type WeatherType = 'sunny' | 'golden_hour' | 'cloudy' | 'rainy' | 'snowy' | 'breezy';

export type Continent = 
  | 'Europe'
  | 'Asia'
  | 'North America'
  | 'South America'
  | 'Africa'
  | 'Oceania'
  | 'Antarctica';

export type ExpenseCategory = 
  | 'flights' 
  | 'lodging' 
  | 'food' 
  | 'activities' 
  | 'transit' 
  | 'shopping' 
  | 'other';

export interface TravelExpense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string;
  date?: string;
}

export type PinCategory = 'city' | 'nature' | 'landmark' | 'food' | 'stay';

export interface CityPin {
  id: string;
  name: string;
  countryCode: string;
  coordinates: [number, number]; // [lng, lat]
  category: PinCategory;
  rating?: number;
  notes?: string;
  memoryId?: string;
  photoUrl?: string;
  visitedDate?: string;
}

export type WishlistPriority = 'dream' | 'high' | 'medium';

export interface WishlistItem {
  id: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  continent: Continent;
  targetYear?: string;
  priority: WishlistPriority;
  estimatedBudget?: number;
  currency?: string;
  dreamActivities?: string[];
  notes?: string;
  visited?: boolean;
  createdAt: string;
}

export interface TravelMemory {
  id: string;
  countryCode: string; // ISO 2-letter or 3-letter code
  countryName: string;
  countryFlag: string;
  continent: Continent;
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  title: string;
  notes: string;
  highlight?: string;
  photos: PhotoItem[];
  tags: string[];
  rating: number; // 1 to 5
  weather?: WeatherType;
  companions?: string;
  isFavorite?: boolean;
  expenses?: TravelExpense[];
  cityPins?: CityPin[];
  createdAt: string;
  updatedAt: string;
}

export interface CountryInfo {
  code: string; // ISO 2-letter
  code3: string; // ISO 3-letter
  numericId: string; // TopoJSON numeric id (e.g., "392" for Japan)
  name: string;
  continent: Continent;
  flag: string;
  capital: string;
  coordinates: [number, number]; // [lng, lat]
}

export type AppView = 'map' | 'gallery' | 'diary' | 'stats' | 'wishlist';
export type MapTheme = 'light' | 'dark';

export interface FilterState {
  search: string;
  continent: string;
  tag: string;
  countryCode: string;
  sortBy: 'date-desc' | 'date-asc' | 'rating' | 'name';
  favoriteOnly: boolean;
  showWishlistOnly?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  /** Displayable avatar URL. Empty means "show initials". */
  avatar: string;
  /** Storage path for an uploaded avatar; `avatar` is signed from this. */
  avatarPath?: string;
  avatarColor?: string;
  bio?: string;
  homeCountryCode: string;
  travelerLevel?: string;
  joinedDate: string;
}

export interface AuthCredentials {
  email: string;
  password?: string;
  name?: string;
  homeCountryCode?: string;
}

export interface OptionalFeatures {
  bucketList: boolean;
  posterGenerator: boolean;
  landmarkPinning: boolean;
  budgetExpenses: boolean;
  aiAssistant: boolean;
}

export const DEFAULT_OPTIONAL_FEATURES: OptionalFeatures = {
  bucketList: true,
  posterGenerator: true,
  landmarkPinning: true,
  budgetExpenses: true,
  aiAssistant: true,
};

