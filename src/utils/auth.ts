import { UserProfile, AuthCredentials, TravelMemory } from '../types';
import { INITIAL_DEMO_MEMORIES } from '../data/demoMemories';

const CURRENT_USER_KEY = 'visited_places_current_user_id_v1';
const USERS_LIST_KEY = 'visited_places_registered_users_v1';
const USER_PASSWORDS_KEY = 'visited_places_user_passwords_v1';

// Seeded preset explorer profiles for quick preview and switching
export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-sarah-chen',
    name: 'Sarah Chen',
    email: 'sarah.chen@voyager.travel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    avatarColor: '#2563eb',
    bio: 'Photographer & cultural wanderer. On a quest to visit 50 countries before 30!',
    homeCountryCode: 'US',
    travelerLevel: 'Globe Trotter',
    joinedDate: '2023-04-12',
    isGuest: false
  },
  {
    id: 'user-marco-rossi',
    name: 'Marco Rossi',
    email: 'marco.rossi@alpine.eu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    avatarColor: '#059669',
    bio: 'Alpine mountaineer, coffee connoisseur, and rail journey enthusiast.',
    homeCountryCode: 'IT',
    travelerLevel: 'Mountain Voyager',
    joinedDate: '2023-08-20',
    isGuest: false
  },
  {
    id: 'user-elena-rostova',
    name: 'Elena Rostova',
    email: 'elena.rostova@nomad.io',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    avatarColor: '#7c3aed',
    bio: 'Remote architect building while exploring architectural wonders of the world.',
    homeCountryCode: 'FR',
    travelerLevel: 'Digital Nomad',
    joinedDate: '2024-01-15',
    isGuest: false
  }
];

// Sample memories tailored for Marco Rossi
const MARCO_SAMPLE_MEMORIES: TravelMemory[] = [
  {
    id: 'marco-mem-1',
    countryCode: 'IT',
    countryName: 'Italy',
    countryFlag: '🇮🇹',
    continent: 'Europe',
    city: 'Dolomites, Cortina',
    startDate: '2024-06-10',
    endDate: '2024-06-18',
    title: 'Sunrise Ridge Trek along Tre Cime',
    notes: 'Epic high-altitude traverse under the dramatic limestone peaks of the Italian Alps.',
    photos: [
      {
        id: 'marco-p1',
        url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80',
        caption: 'Tre Cime di Lavaredo at first light',
        isCover: true,
        location: 'Cortina d\'Ampezzo'
      }
    ],
    tags: ['Mountains', 'Hiking', 'Adventure'],
    rating: 5,
    weather: 'sunny',
    companions: 'Alpine Club Friends',
    isFavorite: true,
    createdAt: '2024-06-19T10:00:00Z',
    updatedAt: '2024-06-19T10:00:00Z'
  },
  {
    id: 'marco-mem-2',
    countryCode: 'CH',
    countryName: 'Switzerland',
    countryFlag: '🇨🇭',
    continent: 'Europe',
    city: 'Zermatt',
    startDate: '2024-01-20',
    endDate: '2024-01-26',
    title: 'Matterhorn Glacier Paradise Expedition',
    notes: 'Crisp alpine air, deep powder snow, and fondue overlooking the towering Matterhorn.',
    photos: [
      {
        id: 'marco-p2',
        url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
        caption: 'Matterhorn majestic pinnacle in winter',
        isCover: true,
        location: 'Zermatt, Valais'
      }
    ],
    tags: ['Skiing', 'Winter', 'Alps'],
    rating: 5,
    weather: 'snowy',
    companions: 'Solo',
    isFavorite: true,
    createdAt: '2024-01-27T10:00:00Z',
    updatedAt: '2024-01-27T10:00:00Z'
  },
  {
    id: 'marco-mem-3',
    countryCode: 'AT',
    countryName: 'Austria',
    countryFlag: '🇦🇹',
    continent: 'Europe',
    city: 'Innsbruck & Hallstatt',
    startDate: '2023-10-12',
    endDate: '2023-10-16',
    title: 'Autumn Reflections in Salzkammergut',
    notes: 'Golden larch trees reflecting on pristine glacial lakes.',
    photos: [
      {
        id: 'marco-p3',
        url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
        caption: 'Hallstatt lakeside morning mist',
        isCover: true,
        location: 'Hallstatt'
      }
    ],
    tags: ['Lakes', 'Nature', 'Autumn'],
    rating: 4,
    weather: 'golden_hour',
    companions: 'Family',
    isFavorite: false,
    createdAt: '2023-10-17T10:00:00Z',
    updatedAt: '2023-10-17T10:00:00Z'
  }
];

export function getRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (!raw) {
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed: UserProfile[] = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch (e) {
    console.error('Failed to load registered users:', e);
    return DEFAULT_PROFILES;
  }
}

export function saveRegisteredUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered users:', e);
  }
}

export function getCurrentUser(): UserProfile {
  const users = getRegisteredUsers();
  try {
    const currentId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentId) {
      const found = users.find(u => u.id === currentId);
      if (found) return found;
    }
  } catch (e) {
    console.error('Failed to get current user:', e);
  }

  // Default to Sarah Chen
  const defaultUser = users[0] || DEFAULT_PROFILES[0];
  try {
    localStorage.setItem(CURRENT_USER_KEY, defaultUser.id);
  } catch (_) {}
  return defaultUser;
}

export function setCurrentUser(userId: string): UserProfile | null {
  const users = getRegisteredUsers();
  const found = users.find(u => u.id === userId);
  if (found) {
    localStorage.setItem(CURRENT_USER_KEY, found.id);
    return found;
  }
  return null;
}

export function registerNewUser(creds: AuthCredentials): { success: boolean; user?: UserProfile; error?: string } {
  if (!creds.email || !creds.email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!creds.name || creds.name.trim().length < 2) {
    return { success: false, error: 'Please enter your name (at least 2 characters).' };
  }

  const users = getRegisteredUsers();
  const existing = users.find(u => u.email.toLowerCase() === creds.email.toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please Sign In.' };
  }

  // Color palette for default avatar
  const avatarColors = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#db2777', '#0891b2', '#ea580c'];
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const newUser: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: creds.name.trim(),
    email: creds.email.trim().toLowerCase(),
    avatar: creds.avatar?.trim() || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(creds.name.trim())}`,
    avatarColor: randomColor,
    bio: 'World explorer documenting global adventures, culture, and photography.',
    homeCountryCode: (creds.homeCountryCode || 'US').toUpperCase(),
    travelerLevel: 'Novice Explorer',
    joinedDate: new Date().toISOString().split('T')[0],
    isGuest: false
  };

  // Save password securely in local user store
  if (creds.password) {
    try {
      const passwordsRaw = localStorage.getItem(USER_PASSWORDS_KEY);
      const passwords = passwordsRaw ? JSON.parse(passwordsRaw) : {};
      passwords[newUser.id] = creds.password;
      localStorage.setItem(USER_PASSWORDS_KEY, JSON.stringify(passwords));
    } catch (_) {}
  }

  const updatedUsers = [newUser, ...users];
  saveRegisteredUsers(updatedUsers);
  localStorage.setItem(CURRENT_USER_KEY, newUser.id);

  // Initialize empty travel memories for new user
  localStorage.setItem(`visited_places_memories_${newUser.id}`, JSON.stringify([]));
  localStorage.setItem(`visited_places_home_${newUser.id}`, newUser.homeCountryCode);

  return { success: true, user: newUser };
}

export function loginUser(email: string, password?: string): { success: boolean; user?: UserProfile; error?: string } {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const users = getRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (!found) {
    return { success: false, error: 'No account found with this email. Please create an account.' };
  }

  // If password was stored and provided, verify (for preset demo accounts, password is optional)
  try {
    const passwordsRaw = localStorage.getItem(USER_PASSWORDS_KEY);
    const passwords = passwordsRaw ? JSON.parse(passwordsRaw) : {};
    if (passwords[found.id] && password && passwords[found.id] !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
  } catch (_) {}

  localStorage.setItem(CURRENT_USER_KEY, found.id);
  return { success: true, user: found };
}

export function loginAsGuest(): UserProfile {
  const guestId = `guest-${Date.now()}`;
  const guestUser: UserProfile = {
    id: guestId,
    name: 'Guest Traveler',
    email: 'guest@voyager.travel',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    avatarColor: '#64748b',
    bio: 'Browsing travel diary in guest session.',
    homeCountryCode: 'US',
    travelerLevel: 'Guest Voyager',
    joinedDate: new Date().toISOString().split('T')[0],
    isGuest: true
  };

  const users = getRegisteredUsers();
  saveRegisteredUsers([...users, guestUser]);
  localStorage.setItem(CURRENT_USER_KEY, guestUser.id);
  
  // Provide sample memories for guest
  localStorage.setItem(`visited_places_memories_${guestId}`, JSON.stringify(INITIAL_DEMO_MEMORIES));
  localStorage.setItem(`visited_places_home_${guestId}`, 'US');

  return guestUser;
}

export function updateUserProfile(updated: Partial<UserProfile>): UserProfile {
  const current = getCurrentUser();
  const merged: UserProfile = { ...current, ...updated };
  
  const users = getRegisteredUsers().map(u => u.id === merged.id ? merged : u);
  saveRegisteredUsers(users);
  
  if (updated.homeCountryCode) {
    localStorage.setItem(`visited_places_home_${merged.id}`, updated.homeCountryCode.toUpperCase());
  }

  return merged;
}

// User-scoped storage helpers for memories & preferences
export function getUserMemoriesKey(userId: string): string {
  return `visited_places_memories_${userId}`;
}

export function getUserHomeCountryKey(userId: string): string {
  return `visited_places_home_${userId}`;
}

export function loadUserMemories(userId: string): TravelMemory[] {
  const key = getUserMemoriesKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // If default demo users, provide specialized initial trips
      if (userId === 'user-sarah-chen') {
        localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_MEMORIES));
        return INITIAL_DEMO_MEMORIES;
      } else if (userId === 'user-marco-rossi') {
        localStorage.setItem(key, JSON.stringify(MARCO_SAMPLE_MEMORIES));
        return MARCO_SAMPLE_MEMORIES;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load user memories:', e);
    return [];
  }
}

export function saveUserMemories(userId: string, memories: TravelMemory[]): void {
  const key = getUserMemoriesKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(memories));
  } catch (e) {
    console.error('Failed to save user memories:', e);
  }
}

export function loadUserHomeCountry(userId: string, defaultCountry = 'US'): string {
  const key = getUserHomeCountryKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (saved && saved.trim()) return saved.trim().toUpperCase();
  } catch (_) {}
  return defaultCountry;
}

export function saveUserHomeCountry(userId: string, code: string | null): void {
  const key = getUserHomeCountryKey(userId);
  try {
    if (code) {
      localStorage.setItem(key, code.toUpperCase());
    } else {
      localStorage.removeItem(key);
    }
  } catch (_) {}
}
