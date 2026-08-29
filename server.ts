import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // AI Feature: Enhance Journal Entry & Story Polisher
  app.post('/api/ai/enhance-story', async (req, res) => {
    const { notes, title, countryName, city, tags, style } = req.body;
    try {
      const ai = getGeminiClient();

      if (!ai) {
        throw new Error('No API key');
      }

      const styleGuide = style === 'poetic' 
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.warn('Using graceful fallback for enhance-story:', err?.message || err);
      const place = city ? `${city}, ${countryName}` : countryName;
      res.json({
        enhancedTitle: title ? `Echoes of ${place}: ${title}` : `Journeys Across ${place}`,
        enhancedNotes: notes 
          ? `${notes}\n\nUnder golden skies in ${place}, the rhythm of the journey unfolded with timeless charm, leaving indelible memories woven into the fabric of the open road.`
          : `Wandering through the vibrant landscapes and cultural tapestry of ${place}, immersed in unforgettable moments and genuine discoveries.`,
        sensoryHighlight: `Golden twilight casting long shadows across ${place}, filled with the fragrance of local life and discovery.`,
        suggestedTags: ['Wanderlust', 'CulturalHeritage', 'Atmospheric', 'Discovery']
      });
    }
  });

  // AI Feature: Local Culture, Hidden Gems & Food Suggestions
  app.post('/api/ai/suggest-insights', async (req, res) => {
    const { countryName, city, focus } = req.body;
    try {
      const ai = getGeminiClient();

      if (!ai) {
        throw new Error('No API key');
      }

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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        }
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.warn('Using graceful fallback for suggest-insights:', err?.message || err);
      const place = city ? `${city}, ${countryName}` : countryName;
      res.json({
        curatorSummary: `${place} offers a vibrant tapestry of tradition, captivating landscapes, and genuine warmth.`,
        localDishes: [
          { name: "Traditional Regional Specialty", description: `Classic signature culinary flavors revered across ${countryName}.`, whyTry: "Authentic centuries-old preparation." },
          { name: "Artisanal Street Bites", description: "Fresh local market flavors prepared daily by seasoned vendors.", whyTry: "The true pulse of local gastronomy." }
        ],
        hiddenGems: [
          { title: "Old Quarter Alleyways", location: `${place} Historic District`, tip: "Explore early morning before crowds arrive to witness local artisans at work." },
          { title: "Panoramic Viewpoint", location: `Overlook at ${place}`, tip: "Bring a light jacket for sunset watching." }
        ],
        photoSpots: [
          { location: "Central Town Square & Promenades", bestTime: "Blue Hour (just after sunset)", advice: "Capture the ambient street lamps reflecting off historic stone walkways." }
        ],
        culturalEtiquette: [
          "Greet locals with a warm smile and respectful acknowledgment.",
          "Ask permission before photographing residents or private craft workshops.",
          "Embrace the leisurely pace of traditional dining and conversation."
        ]
      });
    }
  });

  // AI Feature: Custom Poster Tagline & Poetic Inscription
  app.post('/api/ai/generate-quote', async (req, res) => {
    try {
      const { visitedCountries, homeCountry, theme } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // High quality fallback quotes
        const fallbacks = [
          { quote: "The world is a book, and those who do not travel read only one page.", attribution: "Saint Augustine" },
          { quote: "To travel is to discover that everyone is wrong about other countries.", attribution: "Aldous Huxley" },
          { quote: "We travel not to escape life, but for life not to escape us.", attribution: "Anonymous" },
          { quote: "Not all those who wander are lost.", attribution: "J.R.R. Tolkien" }
        ];
        const random = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        return res.json(random);
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        }
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error generating quote with Gemini:', err);
      res.json({
        quote: "The world is a book, and those who do not travel read only one page.",
        attribution: "Saint Augustine"
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Memory Atlas Server listening on port ${PORT}`);
  });
}

startServer();
