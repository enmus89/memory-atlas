import { supabase } from '../lib/supabase';
import { PhotoItem, TravelMemory } from '../types';
import { compressImage } from './images';

const BUCKET = 'memory-photos';

/** Signed URLs are re-minted on every app load, so a few hours is ample. */
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 8;

/**
 * Upload one photo to the caller's private folder and return a PhotoItem
 * carrying both the storage path (what we persist) and a signed URL (what the
 * UI renders right now).
 */
export async function uploadPhoto(
  userId: string,
  file: File,
  photoId: string
): Promise<{ path: string; url: string }> {
  const { blob, extension, contentType } = await compressImage(file);
  const path = `${userId}/${photoId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType, upsert: true });

  if (uploadError) {
    throw new Error(`Could not upload photo: ${uploadError.message}`);
  }

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (signError || !data?.signedUrl) {
    throw new Error(`Photo uploaded but could not be displayed: ${signError?.message ?? 'unknown error'}`);
  }

  return { path, url: data.signedUrl };
}

/** Remove photos from storage. Missing files are not an error worth raising. */
export async function deletePhotos(paths: string[]): Promise<void> {
  const real = paths.filter(Boolean);
  if (real.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET).remove(real);
  if (error) {
    // A failed cleanup leaves an orphaned file but must never block the user
    // from deleting the memory itself.
    console.error('Failed to remove photos from storage:', error.message);
  }
}

/**
 * Mint fresh signed URLs for every stored photo across a set of memories.
 *
 * Photos added by pasting an external URL have no `path` and are left alone.
 * Signing is batched into a single request per call rather than one per photo.
 */
export async function attachSignedUrls(memories: TravelMemory[]): Promise<TravelMemory[]> {
  const paths = Array.from(
    new Set(
      memories.flatMap((memory) =>
        (memory.photos ?? []).map((photo) => photo.path).filter((p): p is string => Boolean(p))
      )
    )
  );

  if (paths.length === 0) return memories;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    console.error('Failed to sign photo URLs:', error?.message);
    return memories;
  }

  const urlByPath = new Map<string, string>();
  data.forEach((entry) => {
    if (entry.path && entry.signedUrl) {
      urlByPath.set(entry.path, entry.signedUrl);
    }
  });

  return memories.map((memory) => ({
    ...memory,
    photos: (memory.photos ?? []).map((photo: PhotoItem) =>
      photo.path && urlByPath.has(photo.path)
        ? { ...photo, url: urlByPath.get(photo.path) as string }
        : photo
    ),
  }));
}

/** Storage paths held by a memory, for cleanup when it is deleted. */
export function photoPathsOf(memory: TravelMemory): string[] {
  return (memory.photos ?? [])
    .map((photo) => photo.path)
    .filter((p): p is string => Boolean(p));
}

/**
 * Replace the signed-in user's avatar.
 *
 * Avatars live in the same private bucket as trip photos, under the user's own
 * folder, so the existing storage policies cover them. The path is timestamped
 * so a new upload never collides with a cached copy of the old one.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ path: string; url: string }> {
  return uploadPhoto(userId, file, `avatar-${Date.now()}`);
}

/** Mint a signed URL for a single stored object, or null if it cannot be signed. */
export async function signPath(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error('Failed to sign path:', error?.message);
    return null;
  }
  return data.signedUrl;
}
