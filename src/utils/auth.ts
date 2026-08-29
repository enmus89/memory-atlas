import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthCredentials, UserProfile } from '../types';

/**
 * Authentication, backed by Supabase Auth.
 *
 * Passwords are hashed and held by Supabase; they never reach this code or
 * the browser's storage. Profile rows live in `public.profiles` and are
 * created by the `on_auth_user_created` trigger at signup time.
 */

const AVATAR_COLORS = [
  '#2563eb', '#059669', '#7c3aed', '#d97706', '#db2777', '#0891b2', '#ea580c',
];

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function defaultAvatarFor(name: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`;
}

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  avatar: string;
  avatar_color: string;
  bio: string;
  home_country_code: string;
  traveler_level: string;
  joined_date: string;
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar || defaultAvatarFor(row.name),
    avatarColor: row.avatar_color,
    bio: row.bio,
    homeCountryCode: (row.home_country_code || 'US').toUpperCase(),
    travelerLevel: row.traveler_level,
    joinedDate: row.joined_date,
  };
}

/**
 * Profile for a signed-in user.
 *
 * The signup trigger normally has the row ready, but a profile can be missing
 * if the schema was applied after a user already existed. Rather than leave
 * the app unusable, fall back to creating the row from the auth record.
 */
export async function fetchProfile(user: User): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load your profile: ${error.message}`);
  }

  if (data) {
    return rowToProfile(data as ProfileRow);
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, string>;
  const name = metadata.name || user.email?.split('@')[0] || 'Traveler';

  const seeded = {
    id: user.id,
    email: user.email ?? '',
    name,
    avatar: metadata.avatar || defaultAvatarFor(name),
    avatar_color: metadata.avatar_color || randomAvatarColor(),
    bio: 'World explorer documenting global adventures, culture, and photography.',
    home_country_code: (metadata.home_country_code || 'US').toUpperCase(),
    traveler_level: 'Novice Explorer',
    joined_date: new Date().toISOString().split('T')[0],
  };

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .upsert(seeded, { onConflict: 'id' })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Could not create your profile: ${insertError.message}`);
  }

  return rowToProfile(inserted as ProfileRow);
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Current signed-in user's profile, or null when signed out. */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const session = await getSession();
  if (!session?.user) return null;
  return fetchProfile(session.user);
}

/**
 * Subscribe to sign-in / sign-out. Fires on token refresh and on sign-in from
 * another tab, which is what keeps two open tabs consistent.
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  /** Set when the project requires email confirmation before first sign-in. */
  needsEmailConfirmation?: boolean;
  error?: string;
}

export async function registerNewUser(creds: AuthCredentials): Promise<AuthResult> {
  if (!creds.email || !creds.email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!creds.name || creds.name.trim().length < 2) {
    return { success: false, error: 'Please enter your name (at least 2 characters).' };
  }
  if (!creds.password || creds.password.length < 8) {
    return { success: false, error: 'Please choose a password of at least 8 characters.' };
  }

  const name = creds.name.trim();

  const { data, error } = await supabase.auth.signUp({
    email: creds.email.trim().toLowerCase(),
    password: creds.password,
    options: {
      data: {
        name,
        avatar: creds.avatar?.trim() || defaultAvatarFor(name),
        avatar_color: randomAvatarColor(),
        home_country_code: (creds.homeCountryCode || 'US').toUpperCase(),
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // With email confirmation switched on, signUp returns a user but no
  // session — the account is not usable until the emailed link is clicked.
  if (!data.session) {
    return { success: true, needsEmailConfirmation: true };
  }

  if (!data.user) {
    return { success: false, error: 'Account created but no session was returned. Please sign in.' };
  }

  try {
    return { success: true, user: await fetchProfile(data.user) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Could not load your profile.' };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  if (!data.user) {
    return { success: false, error: 'Sign in failed. Please try again.' };
  }

  try {
    return { success: true, user: await fetchProfile(data.user) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Could not load your profile.' };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: window.location.origin,
  });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('You must be signed in to update your profile.');
  }

  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.avatar !== undefined) patch.avatar = updates.avatar;
  if (updates.avatarColor !== undefined) patch.avatar_color = updates.avatarColor;
  if (updates.bio !== undefined) patch.bio = updates.bio;
  if (updates.travelerLevel !== undefined) patch.traveler_level = updates.travelerLevel;
  if (updates.homeCountryCode !== undefined) {
    patch.home_country_code = updates.homeCountryCode.toUpperCase();
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', session.user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Could not save your profile: ${error.message}`);
  }

  return rowToProfile(data as ProfileRow);
}

/** Home country lives on the profile; this is a convenience wrapper. */
export async function saveUserHomeCountry(code: string | null): Promise<void> {
  await updateUserProfile({ homeCountryCode: (code || 'US').toUpperCase() });
}
