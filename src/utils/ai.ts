import { supabase } from '../lib/supabase';

/**
 * Calls into the `ai` Supabase Edge Function.
 *
 * The Gemini API key lives in that function's secrets, never in this bundle —
 * which is what lets the app be served as static files without exposing it.
 * `functions.invoke` attaches the signed-in user's access token, and Supabase
 * rejects the request before our code runs if it is missing or invalid.
 */
async function callAI<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { action, ...payload },
  });

  if (error) {
    throw new Error(error.message || 'The AI service could not be reached.');
  }
  return data as T;
}

export interface EnhancedStory {
  enhancedTitle?: string;
  enhancedNotes?: string;
  sensoryHighlight?: string;
  suggestedTags?: string[];
}

export function enhanceStory(payload: {
  notes: string;
  title: string;
  countryName: string;
  city: string;
  tags: string[];
  style: string;
}): Promise<EnhancedStory> {
  return callAI<EnhancedStory>('enhance-story', payload);
}

export interface LocalInsights {
  curatorSummary?: string;
  localDishes?: Array<{ name: string; description: string; whyTry: string }>;
  hiddenGems?: Array<{ title: string; location: string; tip: string }>;
  photoSpots?: Array<{ location: string; bestTime: string; advice: string }>;
  culturalEtiquette?: string[];
}

export function suggestInsights(payload: {
  countryName: string;
  city?: string;
}): Promise<LocalInsights> {
  return callAI<LocalInsights>('suggest-insights', payload);
}

export interface PosterQuote {
  quote: string;
  attribution: string;
}

export function generateQuote(payload: {
  visitedCountries: string[];
  homeCountry: string;
  theme: string;
}): Promise<PosterQuote> {
  return callAI<PosterQuote>('generate-quote', payload);
}
