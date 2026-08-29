// Memory Atlas AI features, as a Supabase Edge Function.
//
// This exists so the app can be served as plain static files (GitHub Pages)
// while the Gemini API key stays server-side. The key lives in this function's
// secrets and is never sent to a browser.
//
// Supabase verifies the caller's JWT before this code runs, so every request
// here is already an authenticated Memory Atlas user. That is what stops a
// stranger who finds the URL from spending the Gemini quota.
//
// Deploy:
//   supabase functions deploy ai
//   supabase secrets set GEMINI_API_KEY=...
//
// One function handles all three features, chosen by `action` in the body.

import { GoogleGenAI } from 'npm:@google/genai@^2.4.0';

// Google withdraws model ids over time — gemini-2.5-flash is already refused
// for newly created keys. Overridable without redeploying code.
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.6-flash';

// The page is served from a different origin (GitHub Pages) than this
// function, so the browser sends a preflight and needs these on every reply.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function getClient(): GoogleGenAI | null {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

async function generateJson(prompt: string, temperature: number): Promise<Record<string, unknown>> {
  const ai = getClient();
  if (!ai) throw new Error('No API key configured');

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', temperature },
  });

  return JSON.parse(response.text?.trim() || '{}');
}

// --- enhance-story ---------------------------------------------------------

async function enhanceStory(p: Record<string, any>) {
  const { notes, title, countryName, city, tags, style } = p;

  const styleGuide =
    style === 'poetic'
      ? 'poetic, evocative, literary, and atmospheric with vivid sensory textures'
      : style === 'concise'
      ? 'punchy, crisp, vivid, modern travel journal style'
      : style === 'adventure'
      ? 'high-energy, exploratory, vivid expedition diary tone'
      : 'rich, atmospheric, heartfelt, and memorable narrative prose';

  const prompt = `You are an elite travel writer and editor for National Geographic and Conde Nast Traveler.
Transform and polish this traveler's raw notes from their trip to ${countryName} ${city ? `(${city})` : ''} into an evocative, beautiful travel journal entry.

Draft Title: "${title || 'Travel Memory'}"
Raw Notes:
"${notes || ''}"
Existing Tags: ${(tags || []).join(', ')}
Desired Tone: ${styleGuide}

Instructions:
1. Write an evocative, polished narrative (2-4 paragraphs). Preserve all authentic details, locations, and personal moments while enhancing cadence, atmosphere, and sensory descriptions (sound, scent, light, flavor).
2. Create a striking, memorable title (6-10 words).
3. Extract or craft a breathtaking 1-sentence "highlight of the journey".
4. Suggest 3-5 relevant atmospheric tags.

Return ONLY a valid JSON object matching this schema:
{
  "enhancedTitle": "string",
  "enhancedNotes": "string",
  "sensoryHighlight": "string",
  "suggestedTags": ["string"]
}`;

  try {
    return json(await generateJson(prompt, 0.7));
  } catch (err) {
    console.warn('Using graceful fallback for enhance-story:', err);
    const place = city ? `${city}, ${countryName}` : countryName;
    return json({
      enhancedTitle: title ? `Echoes of ${place}: ${title}` : `Journeys Across ${place}`,
      enhancedNotes: notes
        ? `${notes}\n\nUnder golden skies in ${place}, the rhythm of the journey unfolded with timeless charm, leaving indelible memories woven into the fabric of the open road.`
        : `Wandering through the vibrant landscapes and cultural tapestry of ${place}, immersed in unforgettable moments and genuine discoveries.`,
      sensoryHighlight: `Golden twilight casting long shadows across ${place}, filled with the fragrance of local life and discovery.`,
      suggestedTags: ['Wanderlust', 'CulturalHeritage', 'Atmospheric', 'Discovery'],
    });
  }
}

// --- suggest-insights ------------------------------------------------------

async function suggestInsights(p: Record<string, any>) {
  const { countryName, city, focus } = p;

  const prompt = `You are a knowledgeable local travel expert and cultural guide.
Provide genuine, curated local travel intelligence for someone visiting or planning a trip to ${countryName} ${city ? `(${city})` : ''}.
Focus: ${focus || 'authentic local food, hidden secret gems, cultural etiquette, and magical photo spots'}

Return ONLY a valid JSON object matching this schema:
{
  "curatorSummary": "string (1-2 sentences capturing the spirit of the destination)",
  "localDishes": [
    { "name": "string", "description": "string", "whyTry": "string" }
  ],
  "hiddenGems": [
    { "title": "string", "location": "string", "tip": "string" }
  ],
  "photoSpots": [
    { "location": "string", "bestTime": "string", "advice": "string" }
  ],
  "culturalEtiquette": ["string"]
}`;

  try {
    return json(await generateJson(prompt, 0.6));
  } catch (err) {
    console.warn('Using graceful fallback for suggest-insights:', err);
    const place = city ? `${city}, ${countryName}` : countryName;
    return json({
      curatorSummary: `${place} offers a vibrant tapestry of tradition, captivating landscapes, and genuine warmth.`,
      localDishes: [
        {
          name: 'Traditional Regional Specialty',
          description: `Classic signature culinary flavors revered across ${countryName}.`,
          whyTry: 'Authentic centuries-old preparation.',
        },
        {
          name: 'Artisanal Street Bites',
          description: 'Fresh local market flavors prepared daily by seasoned vendors.',
          whyTry: 'The true pulse of local gastronomy.',
        },
      ],
      hiddenGems: [
        {
          title: 'Old Quarter Alleyways',
          location: `${place} Historic District`,
          tip: 'Explore early morning before crowds arrive to witness local artisans at work.',
        },
        {
          title: 'Panoramic Viewpoint',
          location: `Overlook at ${place}`,
          tip: 'Bring a light jacket for sunset watching.',
        },
      ],
      photoSpots: [
        {
          location: 'Central Town Square & Promenades',
          bestTime: 'Blue Hour (just after sunset)',
          advice: 'Capture the ambient street lamps reflecting off historic stone walkways.',
        },
      ],
      culturalEtiquette: [
        'Greet locals with a warm smile and respectful acknowledgment.',
        'Ask permission before photographing residents or private craft workshops.',
        'Embrace the leisurely pace of traditional dining and conversation.',
      ],
    });
  }
}

// --- generate-quote --------------------------------------------------------

const FALLBACK_QUOTES = [
  { quote: 'The world is a book, and those who do not travel read only one page.', attribution: 'Saint Augustine' },
  { quote: 'To travel is to discover that everyone is wrong about other countries.', attribution: 'Aldous Huxley' },
  { quote: 'We travel not to escape life, but for life not to escape us.', attribution: 'Anonymous' },
  { quote: 'Not all those who wander are lost.', attribution: 'J.R.R. Tolkien' },
];

function randomQuote() {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

async function generateQuote(p: Record<string, any>) {
  const { visitedCountries, homeCountry, theme } = p;

  if (!getClient()) {
    return json(randomQuote());
  }

  const prompt = `Generate an inspiring, elegant, 1-2 sentence travel quote or motto tailored for a high-res travel map poster.
Traveler has explored: ${(visitedCountries || []).slice(0, 10).join(', ')} (${(visitedCountries || []).length} countries total).
Home base: ${homeCountry || 'Global Citizen'}.
Theme: ${theme || 'vintage cartographer / modern wanderlust'}.

Return ONLY a valid JSON object matching this schema:
{
  "quote": "string",
  "attribution": "string (e.g. Memory Atlas Odyssey / Famous Author / Custom)"
}`;

  try {
    return json(await generateJson(prompt, 0.8));
  } catch (err) {
    console.error('Error generating quote with Gemini:', err);
    return json(FALLBACK_QUOTES[0]);
  }
}

// --- entry point -----------------------------------------------------------

Deno.serve(async (req) => {
  // Preflight carries no auth header and must be answered before anything else.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Expected a JSON body' }, 400);
  }

  const { action, ...payload } = body;

  switch (action) {
    case 'enhance-story':
      return await enhanceStory(payload);
    case 'suggest-insights':
      return await suggestInsights(payload);
    case 'generate-quote':
      return await generateQuote(payload);
    default:
      return json({ error: `Unknown action: ${action}` }, 400);
  }
});
