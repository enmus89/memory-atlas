import { PinCategory } from '../types';

export interface PredefinedCity {
  name: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number]; // [lng, lat]
  category: PinCategory;
  description: string;
}

export const POPULAR_CITIES_AND_LANDMARKS: PredefinedCity[] = [
  // Japan
  { name: 'Tokyo', countryCode: 'JP', countryName: 'Japan', coordinates: [139.6917, 35.6895], category: 'city', description: 'Metropolis of neon lights, culinary temples, and Shibuya crossing.' },
  { name: 'Kyoto', countryCode: 'JP', countryName: 'Japan', coordinates: [135.7681, 35.0116], category: 'landmark', description: 'Ancient capital of bamboo groves, geishas, and 1,000 torii gates.' },
  { name: 'Hakone', countryCode: 'JP', countryName: 'Japan', coordinates: [139.0608, 35.2323], category: 'nature', description: 'Mount Fuji views, hot spring onsens, and caldera lakes.' },
  { name: 'Osaka', countryCode: 'JP', countryName: 'Japan', coordinates: [135.5023, 34.6937], category: 'food', description: 'Japan\'s street food capital and kitchen of the nation (Dotonbori).' },
  { name: 'Hiroshima', countryCode: 'JP', countryName: 'Japan', coordinates: [132.4553, 34.3853], category: 'landmark', description: 'Peace Memorial Park and Itsukushima floating shrine in Miyajima.' },
  { name: 'Sapporo', countryCode: 'JP', countryName: 'Japan', coordinates: [141.3545, 43.0618], category: 'nature', description: 'Powder snow skiing, Sapporo beer, and ramen alleys.' },

  // Italy
  { name: 'Rome', countryCode: 'IT', countryName: 'Italy', coordinates: [12.4964, 41.9028], category: 'landmark', description: 'Eternal City of the Colosseum, Pantheon, and Vatican City.' },
  { name: 'Florence', countryCode: 'IT', countryName: 'Italy', coordinates: [11.2558, 43.7696], category: 'landmark', description: 'Cradle of Renaissance art, Duomo, and Tuscan steak.' },
  { name: 'Positano', countryCode: 'IT', countryName: 'Italy', coordinates: [14.484, 40.6281], category: 'stay', description: 'Cliffside jewel of the Amalfi Coast with pastel villas.' },
  { name: 'Venice', countryCode: 'IT', countryName: 'Italy', coordinates: [12.3155, 45.4408], category: 'city', description: 'City of canals, gondolas, and Saint Mark\'s Basilica.' },
  { name: 'Milan', countryCode: 'IT', countryName: 'Italy', coordinates: [9.19, 45.4642], category: 'city', description: 'Global fashion capital and gothic Duomo di Milano.' },
  { name: 'Cinque Terre', countryCode: 'IT', countryName: 'Italy', coordinates: [9.7288, 44.1461], category: 'nature', description: 'Five vibrant fishing villages along dramatic Ligurian cliffs.' },

  // France
  { name: 'Paris', countryCode: 'FR', countryName: 'France', coordinates: [2.3522, 48.8566], category: 'city', description: 'City of Light, Louvre, Eiffel Tower, and Parisian bistros.' },
  { name: 'Nice', countryCode: 'FR', countryName: 'France', coordinates: [7.262, 43.7102], category: 'nature', description: 'Promenade des Anglais and turquoise French Riviera waters.' },
  { name: 'Chamonix-Mont-Blanc', countryCode: 'FR', countryName: 'France', coordinates: [6.8694, 45.9237], category: 'nature', description: 'Highest alpine peaks in Western Europe and Aiguille du Midi.' },
  { name: 'Bordeaux', countryCode: 'FR', countryName: 'France', coordinates: [-0.5792, 44.8378], category: 'food', description: 'World premier wine capital and classical 18th-century architecture.' },
  { name: 'Mont Saint-Michel', countryCode: 'FR', countryName: 'France', coordinates: [-1.5115, 48.636], category: 'landmark', description: 'Legendary tidal island commune crowned by a medieval abbey.' },

  // USA
  { name: 'New York City', countryCode: 'US', countryName: 'United States', coordinates: [-74.006, 40.7128], category: 'city', description: 'Times Square, Central Park, Broadway, and world-class museums.' },
  { name: 'San Francisco', countryCode: 'US', countryName: 'United States', coordinates: [-122.4194, 37.7749], category: 'city', description: 'Golden Gate Bridge, cable cars, and rolling coastal hills.' },
  { name: 'Yosemite Valley', countryCode: 'US', countryName: 'United States', coordinates: [-119.5383, 37.8651], category: 'nature', description: 'El Capitan granite monolith, waterfalls, and giant sequoias.' },
  { name: 'Grand Canyon', countryCode: 'US', countryName: 'United States', coordinates: [-112.1129, 36.1069], category: 'nature', description: 'Vast colorful chasm carved by the Colorado River.' },
  { name: 'Maui, Hawaii', countryCode: 'US', countryName: 'United States', coordinates: [-156.3319, 20.7984], category: 'nature', description: 'Road to Hana, volcanic craters, and tropical Pacific surf.' },

  // Spain
  { name: 'Barcelona', countryCode: 'ES', countryName: 'Spain', coordinates: [2.1734, 41.3851], category: 'city', description: 'Gaudí\'s Sagrada Família, Park Güell, and vibrant tapas bars.' },
  { name: 'Madrid', countryCode: 'ES', countryName: 'Spain', coordinates: [-3.7038, 40.4168], category: 'city', description: 'Prado Museum, Retiro Park, and bustling royal squares.' },
  { name: 'Seville', countryCode: 'ES', countryName: 'Spain', coordinates: [-5.9845, 37.3891], category: 'landmark', description: 'Flamenco rhythms, Royal Alcázar palace, and orange blossoms.' },
  { name: 'Granada', countryCode: 'ES', countryName: 'Spain', coordinates: [-3.5986, 37.1773], category: 'landmark', description: 'The breathtaking Moorish fortress palace of Alhambra.' },

  // Peru
  { name: 'Cusco', countryCode: 'PE', countryName: 'Peru', coordinates: [-71.9675, -13.5319], category: 'city', description: 'Incan capital high in the Andes and gateway to the Sacred Valley.' },
  { name: 'Machu Picchu', countryCode: 'PE', countryName: 'Peru', coordinates: [-72.545, -13.1631], category: 'landmark', description: '15th-century Inca citadel nestled above cloud forest ridges.' },
  { name: 'Lima', countryCode: 'PE', countryName: 'Peru', coordinates: [-77.0428, -12.0464], category: 'food', description: 'World-renowned gastronomic epicenter of ceviche and Nikkei cuisine.' },

  // Norway
  { name: 'Tromsø', countryCode: 'NO', countryName: 'Norway', coordinates: [18.9553, 69.6492], category: 'nature', description: 'Gateway to the Arctic and premier Northern Lights hunting hub.' },
  { name: 'Reine, Lofoten', countryCode: 'NO', countryName: 'Norway', coordinates: [13.0906, 67.9344], category: 'stay', description: 'Iconic red fishing rorbuer under dramatic snowy granite monoliths.' },
  { name: 'Bergen', countryCode: 'NO', countryName: 'Norway', coordinates: [5.3221, 60.3913], category: 'city', description: 'UNESCO Bryggen wooden wharf and gateway to the majestic fjords.' },

  // United Kingdom
  { name: 'London', countryCode: 'GB', countryName: 'United Kingdom', coordinates: [-0.1278, 51.5074], category: 'city', description: 'Big Ben, Tower Bridge, British Museum, and historic pubs.' },
  { name: 'Edinburgh', countryCode: 'GB', countryName: 'United Kingdom', coordinates: [-3.1883, 55.9533], category: 'landmark', description: 'Royal Mile, volcanic castle crags, and Scottish heritage.' },
  { name: 'Isle of Skye', countryCode: 'GB', countryName: 'United Kingdom', coordinates: [-6.2348, 57.2735], category: 'nature', description: 'Quiraing, Fairy Pools, and rugged Scottish Highland vistas.' },

  // Thailand
  { name: 'Bangkok', countryCode: 'TH', countryName: 'Thailand', coordinates: [100.5018, 13.7563], category: 'city', description: 'Grand Palace, bustling night markets, and Chao Phraya river life.' },
  { name: 'Chiang Mai', countryCode: 'TH', countryName: 'Thailand', coordinates: [98.9853, 18.7883], category: 'landmark', description: 'Misty northern mountains, elephant sanctuaries, and night bazaars.' },
  { name: 'Phuket & Phi Phi', countryCode: 'TH', countryName: 'Thailand', coordinates: [98.3923, 7.8804], category: 'nature', description: 'Emerald Andaman waters, limestone karst islands, and coral reefs.' },

  // Morocco
  { name: 'Marrakech', countryCode: 'MA', countryName: 'Morocco', coordinates: [-7.9811, 31.6295], category: 'city', description: 'Jemaa el-Fnaa square, spice souks, and tranquil riad courtyards.' },
  { name: 'Chefchaouen', countryCode: 'MA', countryName: 'Morocco', coordinates: [-5.2684, 35.1716], category: 'city', description: 'The famous blue-washed pearl tucked in the Rif Mountains.' },
  { name: 'Sahara (Merzouga)', countryCode: 'MA', countryName: 'Morocco', coordinates: [-4.0133, 31.0802], category: 'nature', description: 'Towering golden Erg Chebbi dunes and star-studded desert skies.' },

  // New Zealand
  { name: 'Queenstown', countryCode: 'NZ', countryName: 'New Zealand', coordinates: [168.6626, -45.0312], category: 'nature', description: 'Adventure capital framed by Lake Wakatipu and The Remarkables.' },
  { name: 'Milford Sound', countryCode: 'NZ', countryName: 'New Zealand', coordinates: [167.9256, -44.6713], category: 'nature', description: 'Eighth Wonder of the World with cascading fiord waterfalls.' },
  { name: 'Rotorua', countryCode: 'NZ', countryName: 'New Zealand', coordinates: [176.2497, -38.1368], category: 'landmark', description: 'Geothermal geysers, bubbling mud pools, and Māori cultural villages.' },

  // South Africa
  { name: 'Cape Town', countryCode: 'ZA', countryName: 'South Africa', coordinates: [18.4241, -33.9249], category: 'city', description: 'Table Mountain, Cape Point, and Atlantic coastline drives.' },
  { name: 'Kruger National Park', countryCode: 'ZA', countryName: 'South Africa', coordinates: [31.5547, -24.0112], category: 'nature', description: 'Big Five safari wilderness and golden savannah sunrises.' },

  // Iceland
  { name: 'Reykjavik', countryCode: 'IS', countryName: 'Iceland', coordinates: [-21.9426, 64.1466], category: 'city', description: 'Hallgrímskirkja, thermal baths, and Nordic culinary scene.' },
  { name: 'South Coast (Vik & Waterfalls)', countryCode: 'IS', countryName: 'Iceland', coordinates: [-19.006, 63.4186], category: 'nature', description: 'Skógafoss, Seljalandsfoss, and Reynisfjara black sand beach.' },

  // Greece
  { name: 'Athens', countryCode: 'GR', countryName: 'Greece', coordinates: [23.7275, 37.9838], category: 'landmark', description: 'Acropolis, Parthenon, and ancient agora squares.' },
  { name: 'Santorini', countryCode: 'GR', countryName: 'Greece', coordinates: [25.4615, 36.3932], category: 'stay', description: 'Iconic blue-domed white churches and volcanic caldera sunsets.' },

  // Australia
  { name: 'Sydney', countryCode: 'AU', countryName: 'Australia', coordinates: [151.2093, -33.8688], category: 'city', description: 'Sydney Opera House, Harbour Bridge, and Bondi coastal walks.' },
  { name: 'Great Barrier Reef (Cairns)', countryCode: 'AU', countryName: 'Australia', coordinates: [145.7781, -16.9186], category: 'nature', description: 'Vibrant coral reef ecosystem and tropical rainforests.' },

  // Egypt
  { name: 'Cairo & Giza', countryCode: 'EG', countryName: 'Egypt', coordinates: [31.2357, 30.0444], category: 'landmark', description: 'Great Pyramids of Giza, Sphinx, and Grand Egyptian Museum.' },
  { name: 'Luxor', countryCode: 'EG', countryName: 'Egypt', coordinates: [32.6396, 25.6872], category: 'landmark', description: 'Valley of the Kings, Karnak Temple, and Nile felucca cruises.' }
];

export function findCitiesByCountry(countryCode: string): PredefinedCity[] {
  const code = countryCode.toUpperCase();
  return POPULAR_CITIES_AND_LANDMARKS.filter(c => c.countryCode.toUpperCase() === code);
}
