import { TravelMemory, WishlistItem, CityPin } from '../types';

export const INITIAL_DEMO_WISHLIST: WishlistItem[] = [
  {
    id: 'wish-iceland',
    countryCode: 'IS',
    countryName: 'Iceland',
    countryFlag: '🇮🇸',
    continent: 'Europe',
    targetYear: '2027',
    priority: 'dream',
    estimatedBudget: 3500,
    currency: 'USD',
    dreamActivities: ['Drive Ring Road in 4x4 camper', 'Photograph Diamond Beach', 'Bathe in Secret Lagoon'],
    notes: 'Epic bucket list winter expedition to chase super-auroras and explore ice caves in Vatnajökull.',
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'wish-greece',
    countryCode: 'GR',
    countryName: 'Greece',
    countryFlag: '🇬🇷',
    continent: 'Europe',
    targetYear: '2026',
    priority: 'high',
    estimatedBudget: 2800,
    currency: 'EUR',
    dreamActivities: ['Sail the Cyclades Islands', 'Watch Oia sunset in Santorini', 'Hike the Samaria Gorge in Crete'],
    notes: 'Mediterranean summer voyage for Greek island hopping, fresh seafood, and ancient ruins.',
    createdAt: '2026-02-15T09:30:00Z'
  },
  {
    id: 'wish-thailand',
    countryCode: 'TH',
    countryName: 'Thailand',
    countryFlag: '🇹🇭',
    continent: 'Asia',
    targetYear: '2027',
    priority: 'medium',
    estimatedBudget: 2200,
    currency: 'USD',
    dreamActivities: ['Yi Peng Lantern Festival in Chiang Mai', 'Scuba diving in Similan Islands', 'Street food crawl in Chinatown Bangkok'],
    notes: 'Spiritual temples, limestone cliffs of Railay, and night markets.',
    createdAt: '2026-03-01T14:00:00Z'
  },
  {
    id: 'wish-chile',
    countryCode: 'CL',
    countryName: 'Chile',
    countryFlag: '🇨🇱',
    continent: 'South America',
    targetYear: '2028',
    priority: 'dream',
    estimatedBudget: 4200,
    currency: 'USD',
    dreamActivities: ['W Trek in Torres del Paine', 'Stargazing in Atacama Desert', 'Explore Easter Island Moai'],
    notes: 'From the driest desert on Earth to Patagonian glaciers and granite towers.',
    createdAt: '2026-03-12T18:00:00Z'
  }
];

export const INITIAL_DEMO_PINS: CityPin[] = [
  { id: 'pin-tokyo', name: 'Tokyo', countryCode: 'JP', coordinates: [139.6917, 35.6895], category: 'city', rating: 5, notes: 'Shibuya neon & Omoide Yokocho yakitori.' },
  { id: 'pin-kyoto', name: 'Kyoto', countryCode: 'JP', coordinates: [135.7681, 35.0116], category: 'landmark', rating: 5, notes: 'Fushimi Inari dawn hike and Arashiyama bamboo.' },
  { id: 'pin-hakone', name: 'Hakone', countryCode: 'JP', coordinates: [139.0608, 35.2323], category: 'nature', rating: 5, notes: 'Mt. Fuji view from ryokan open-air bath.' },
  { id: 'pin-rome', name: 'Rome', countryCode: 'IT', coordinates: [12.4964, 41.9028], category: 'landmark', rating: 5, notes: 'Colosseum & espresso at Sant Eustachio.' },
  { id: 'pin-positano', name: 'Positano', countryCode: 'IT', coordinates: [14.484, 40.6281], category: 'stay', rating: 5, notes: 'Cliffside sunset boat ride with limoncello.' },
  { id: 'pin-florence', name: 'Florence', countryCode: 'IT', coordinates: [11.2558, 43.7696], category: 'food', rating: 5, notes: 'Duomo climb & fresh handmade pici pasta.' },
  { id: 'pin-machu-picchu', name: 'Machu Picchu', countryCode: 'PE', coordinates: [-72.545, -13.1631], category: 'landmark', rating: 5, notes: 'Reaching the Sun Gate after 4-day Salkantay trail.' },
  { id: 'pin-cusco', name: 'Cusco', countryCode: 'PE', coordinates: [-71.9675, -13.5319], category: 'city', rating: 4, notes: 'San Blas artisan quarter and ancient Inca masonry.' },
  { id: 'pin-reine', name: 'Reine, Lofoten', countryCode: 'NO', coordinates: [13.0906, 67.9344], category: 'stay', rating: 5, notes: 'Aurora borealis dancing above the red rorbuer.' },
  { id: 'pin-tromso', name: 'Tromsø', countryCode: 'NO', coordinates: [18.9553, 69.6492], category: 'nature', rating: 5, notes: 'Arctic fjord cruise and husky sledding.' },
  { id: 'pin-marrakech', name: 'Marrakech', countryCode: 'MA', coordinates: [-7.9811, 31.6295], category: 'city', rating: 4, notes: 'Medina souks and mint tea in Jemaa el-Fnaa.' },
  { id: 'pin-sahara', name: 'Sahara (Merzouga)', countryCode: 'MA', coordinates: [-4.0133, 31.0802], category: 'nature', rating: 5, notes: 'Camel trek into Erg Chebbi golden dunes.' },
  { id: 'pin-queenstown', name: 'Queenstown', countryCode: 'NZ', coordinates: [168.6626, -45.0312], category: 'nature', rating: 5, notes: 'Campervan lake views and Milford Sound cruise.' },
  { id: 'pin-cape-town', name: 'Cape Town', countryCode: 'ZA', coordinates: [18.4241, -33.9249], category: 'city', rating: 5, notes: 'Lion\'s Head dawn ascent & Chapman\'s Peak drive.' },
  { id: 'pin-kruger', name: 'Kruger Safari', countryCode: 'ZA', coordinates: [31.5547, -24.0112], category: 'nature', rating: 5, notes: 'Leopard sightings and twilight savannah camp.' }
];

export const INITIAL_DEMO_MEMORIES: TravelMemory[] = [
  {
    id: 'trip-japan-2025',
    countryCode: 'JP',
    countryName: 'Japan',
    countryFlag: '🇯🇵',
    continent: 'Asia',
    city: 'Kyoto, Tokyo & Hakone',
    startDate: '2025-10-12',
    endDate: '2025-10-26',
    title: 'Autumn Mist, Ancient Temples & Midnight Ramen',
    notes: 'Wandering through the vermilion torii gates of Fushimi Inari at dawn before the crowds arrived was sheer magic. The smell of cedar, incense, and damp moss hung in the crisp autumn air. In Hakone, we soaked in an open-air onsen with views of Mt. Fuji peeking through early morning clouds. Evenings in Tokyo were spent chasing the best hidden ramen alleys in Shinjuku and vintage vinyl bars in Shibuya.',
    highlight: 'Stepping into a secluded bamboo grove in Arashiyama as golden morning light broke through the canopy.',
    rating: 5,
    weather: 'golden_hour',
    companions: 'With Maya',
    isFavorite: true,
    tags: ['Temples', 'Culinary', 'Onsen', 'Autumn Colors', 'Photography'],
    expenses: [
      { id: 'exp-jp-1', category: 'flights', amount: 1150, currency: 'USD', description: 'Roundtrip Tokyo Haneda Flight' },
      { id: 'exp-jp-2', category: 'lodging', amount: 1420, currency: 'USD', description: 'Hakone Ryokan & Kyoto Machiya' },
      { id: 'exp-jp-3', category: 'transit', amount: 380, currency: 'USD', description: '7-Day JR Shinkansen Pass' },
      { id: 'exp-jp-4', category: 'food', amount: 620, currency: 'USD', description: 'Kaiseki dinners, ramen, and matcha sweets' },
      { id: 'exp-jp-5', category: 'activities', amount: 210, currency: 'USD', description: 'TeamLab Planets & Temple admissions' }
    ],
    photos: [
      {
        id: 'jp-1',
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
        caption: 'Morning light slicing through the vermilion gates of Kyoto',
        isCover: true,
        location: 'Kyoto'
      },
      {
        id: 'jp-2',
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
        caption: 'Tokyo skyline illuminated with Tokyo Tower standing proud',
        location: 'Tokyo'
      },
      {
        id: 'jp-3',
        url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop',
        caption: 'Quiet stone paths and Japanese maple foliage',
        location: 'Hakone'
      },
      {
        id: 'jp-4',
        url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop',
        caption: 'Bustling neon reflections of Shibuya crossing after twilight rain',
        location: 'Tokyo'
      }
    ],
    createdAt: '2025-10-27T08:30:00Z',
    updatedAt: '2025-10-27T08:30:00Z'
  },
  {
    id: 'trip-italy-2025',
    countryCode: 'IT',
    countryName: 'Italy',
    countryFlag: '🇮🇹',
    continent: 'Europe',
    city: 'Rome, Florence & Positano',
    startDate: '2025-05-04',
    endDate: '2025-05-18',
    title: 'La Dolce Vita: Tuscan Hills & Amalfi Cliffs',
    notes: 'Rented a vintage Alfa Romeo and drove winding roads lined with sentinel cypress trees in the Val d\'Orcia. Every village treated us to handmade pici pasta, local pecorino, and wild boar ragù. Arriving in Positano as the sun bathed pastel houses in warm honey light was an unforgettable sight.',
    highlight: 'Private wooden boat ride around Capri at sunset with chilled Limoncello.',
    rating: 5,
    weather: 'sunny',
    companions: 'Solo Roadtrip',
    isFavorite: true,
    tags: ['Roadtrip', 'Wine & Dine', 'Coastline', 'Architecture', 'Art History'],
    expenses: [
      { id: 'exp-it-1', category: 'flights', amount: 890, currency: 'USD', description: 'Direct Rome FCO flight' },
      { id: 'exp-it-2', category: 'lodging', amount: 1650, currency: 'USD', description: 'Florence Renaissance B&B & Positano Cliff Hotel' },
      { id: 'exp-it-3', category: 'transit', amount: 480, currency: 'USD', description: 'Rental car & Frecciarossa high-speed train' },
      { id: 'exp-it-4', category: 'food', amount: 780, currency: 'USD', description: 'Tuscan wine tastings, truffles, and gelato' },
      { id: 'exp-it-5', category: 'activities', amount: 320, currency: 'USD', description: 'Capri wooden boat charter & Uffizi Gallery pass' }
    ],
    photos: [
      {
        id: 'it-1',
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
        caption: 'Pastel cliffside villas cascading into the Tyrrhenian Sea',
        isCover: true,
        location: 'Positano, Amalfi Coast'
      },
      {
        id: 'it-2',
        url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1200&auto=format&fit=crop',
        caption: 'Duomo di Firenze dominating the Renaissance skyline',
        location: 'Florence'
      },
      {
        id: 'it-3',
        url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop',
        caption: 'The majestic Colosseum glowing under the Roman afternoon sun',
        location: 'Rome'
      }
    ],
    createdAt: '2025-05-20T10:15:00Z',
    updatedAt: '2025-05-20T10:15:00Z'
  },
  {
    id: 'trip-peru-2024',
    countryCode: 'PE',
    countryName: 'Peru',
    countryFlag: '🇵🇪',
    continent: 'South America',
    city: 'Cusco, Sacred Valley & Machu Picchu',
    startDate: '2024-08-10',
    endDate: '2024-08-22',
    title: 'Echoes of the Sun: Sacred Trails of the Andes',
    notes: 'Acclimatizing in Cusco with fresh coca tea and walking the cobbled San Blas alleys. The four-day Salkantay Trek tested our endurance across high mountain passes at 4,600 meters before descending into lush cloud forests. Reaching the Sun Gate just as the mist parted over Machu Picchu brought tears to our eyes.',
    highlight: 'Standing at the Sun Gate in absolute silence as the first rays illuminated Huayna Picchu.',
    rating: 5,
    weather: 'crisp' as any,
    companions: 'With Trekking Crew',
    isFavorite: true,
    tags: ['Trekking', 'Ancient Ruins', 'Andes Mountains', 'High Altitude', 'Culture'],
    expenses: [
      { id: 'exp-pe-1', category: 'flights', amount: 980, currency: 'USD', description: 'Flight to Lima & Cusco connecting' },
      { id: 'exp-pe-2', category: 'activities', amount: 750, currency: 'USD', description: '4-day guided Salkantay trek package' },
      { id: 'exp-pe-3', category: 'lodging', amount: 460, currency: 'USD', description: 'San Blas boutique hotel in Cusco' },
      { id: 'exp-pe-4', category: 'food', amount: 310, currency: 'USD', description: 'Traditional Andean lomo saltado and ceviche' }
    ],
    photos: [
      {
        id: 'pe-1',
        url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200&auto=format&fit=crop',
        caption: 'The enigmatic stone citadel framed by jagged Andean peaks',
        isCover: true,
        location: 'Machu Picchu'
      },
      {
        id: 'pe-2',
        url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop',
        caption: 'Rainbow Mountain mineral stripes against cobalt blue skies',
        location: 'Vinicunca'
      },
      {
        id: 'pe-3',
        url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop',
        caption: 'Inca terraces and llamas grazing peacefully in the Sacred Valley',
        location: 'Ollantaytambo'
      }
    ],
    createdAt: '2024-08-25T14:00:00Z',
    updatedAt: '2024-08-25T14:00:00Z'
  },
  {
    id: 'trip-norway-2024',
    countryCode: 'NO',
    countryName: 'Norway',
    countryFlag: '🇳🇴',
    continent: 'Europe',
    city: 'Tromsø & Lofoten Islands',
    startDate: '2024-02-14',
    endDate: '2024-02-23',
    title: 'Dancing Northern Lights & Frozen Fjords',
    notes: 'Staying in a traditional red rorbu fishermen cabin on stilts over icy arctic waters in Reine. The silence of the Arctic winter was profound. On our third night, a cosmic storm ignited the sky with emerald, violet, and white aurora curtains swirling for hours above jagged snow peaks.',
    highlight: 'Kayaking in Reinefjorden surrounded by colossal sheer snowy granite walls.',
    rating: 5,
    weather: 'snowy',
    companions: 'With Leo & Sofia',
    isFavorite: true,
    tags: ['Northern Lights', 'Fjords', 'Winter', 'Arctic', 'Cabins'],
    expenses: [
      { id: 'exp-no-1', category: 'flights', amount: 720, currency: 'USD', description: 'Flights to Tromsø Arctic' },
      { id: 'exp-no-2', category: 'lodging', amount: 1350, currency: 'USD', description: 'Lofoten seaside rorbu cabin' },
      { id: 'exp-no-3', category: 'transit', amount: 540, currency: 'USD', description: 'Studded tire winter 4x4 rental' },
      { id: 'exp-no-4', category: 'activities', amount: 390, currency: 'USD', description: 'Aurora chase tour & snowshoe gear' }
    ],
    photos: [
      {
        id: 'no-1',
        url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1200&auto=format&fit=crop',
        caption: 'Aurora borealis painting the arctic night over Lofoten rorbuer',
        isCover: true,
        location: 'Reine, Lofoten'
      },
      {
        id: 'no-2',
        url: 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?q=80&w=1200&auto=format&fit=crop',
        caption: 'Dramatic fjord waters cutting through snowy monoliths',
        location: 'Tromsø'
      }
    ],
    createdAt: '2024-02-26T19:30:00Z',
    updatedAt: '2024-02-26T19:30:00Z'
  },
  {
    id: 'trip-morocco-2023',
    countryCode: 'MA',
    countryName: 'Morocco',
    countryFlag: '🇲🇦',
    continent: 'Africa',
    city: 'Marrakech, Chefchaouen & Merzouga',
    startDate: '2023-11-02',
    endDate: '2023-11-14',
    title: 'Spice Labyrinths & Starlight in the Sahara',
    notes: 'The sensory thrill of Marrakech: mint tea poured from heights, stacks of fragrant saffron and cumin, and the rhythmic calls of the medina. Later, riding camels into the Erg Chebbi dunes at sunset and sleeping beneath the densest blanket of stars I have ever witnessed.',
    highlight: 'Berber drumming around the desert campfire as shooting stars crossed the Milky Way.',
    rating: 4,
    weather: 'sunny',
    companions: 'Solo',
    isFavorite: false,
    tags: ['Desert', 'Medina', 'Sahara', 'Culinary', 'Architecture'],
    expenses: [
      { id: 'exp-ma-1', category: 'flights', amount: 640, currency: 'USD', description: 'Flight to Marrakech Menara' },
      { id: 'exp-ma-2', category: 'lodging', amount: 680, currency: 'USD', description: 'Historic medina riads' },
      { id: 'exp-ma-3', category: 'activities', amount: 420, currency: 'USD', description: '3-day Sahara desert camel expedition' },
      { id: 'exp-ma-4', category: 'shopping', amount: 240, currency: 'USD', description: 'Handcrafted Berber rugs and ceramics' }
    ],
    photos: [
      {
        id: 'ma-1',
        url: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200&auto=format&fit=crop',
        caption: 'Shades of cobalt and cyan in the enchanting alleyways of Chefchaouen',
        isCover: true,
        location: 'Chefchaouen'
      },
      {
        id: 'ma-2',
        url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?q=80&w=1200&auto=format&fit=crop',
        caption: 'Camel caravan casting long shadows across golden Sahara sand dunes',
        location: 'Merzouga, Sahara'
      }
    ],
    createdAt: '2023-11-18T11:00:00Z',
    updatedAt: '2023-11-18T11:00:00Z'
  },
  {
    id: 'trip-nz-2023',
    countryCode: 'NZ',
    countryName: 'New Zealand',
    countryFlag: '🇳🇿',
    continent: 'Oceania',
    city: 'Queenstown & Milford Sound',
    startDate: '2023-03-08',
    endDate: '2023-03-24',
    title: 'Glacial Valleys, Rainforests & Pure Wilderness',
    notes: 'Road tripping in a campervan across the South Island. Milford Sound was moody and majestic with hundreds of temporary waterfalls plunging down sheer mossy cliffs after rain. Queenstown offered world-class hiking around Lake Wakatipu with crisp mountain air and pinot noir from Central Otago.',
    highlight: 'Cruising through Milford Sound under Stirling Falls with glacial mist spraying our faces.',
    rating: 5,
    weather: 'rainy',
    companions: 'With Alex',
    isFavorite: true,
    tags: ['Campervan', 'Hiking', 'Glaciers', 'Waterfalls', 'Nature'],
    expenses: [
      { id: 'exp-nz-1', category: 'flights', amount: 1380, currency: 'USD', description: 'Trans-pacific flights to Auckland' },
      { id: 'exp-nz-2', category: 'transit', amount: 1850, currency: 'USD', description: 'Campervan rental & DOC campsite passes' },
      { id: 'exp-nz-3', category: 'activities', amount: 480, currency: 'USD', description: 'Milford Sound cruise & Franz Josef glacier tour' },
      { id: 'exp-nz-4', category: 'food', amount: 550, currency: 'USD', description: 'Central Otago wines and fresh local pies' }
    ],
    photos: [
      {
        id: 'nz-1',
        url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop',
        caption: 'Endless scenic highways winding through majestic Southern Alps valleys',
        isCover: true,
        location: 'Queenstown'
      },
      {
        id: 'nz-2',
        url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=1200&auto=format&fit=crop',
        caption: 'Mitre Peak piercing the sky above dramatic fiord waters',
        location: 'Milford Sound'
      }
    ],
    createdAt: '2023-03-28T09:00:00Z',
    updatedAt: '2023-03-28T09:00:00Z'
  },
  {
    id: 'trip-south-africa-2022',
    countryCode: 'ZA',
    countryName: 'South Africa',
    countryFlag: '🇿🇦',
    continent: 'Africa',
    city: 'Cape Town & Kruger National Park',
    startDate: '2022-09-15',
    endDate: '2022-09-28',
    title: 'Where Oceans Collide & Savannah Dawns',
    notes: 'Hiking up Lion\'s Head at dawn for panoramic views of Table Mountain and the Atlantic seaboard. The Cape Peninsula drive around Chapman\'s Peak took our breath away. Later in Kruger, seeing a mother leopard and her cub resting in a leadwood tree during twilight was an unforgettable gift.',
    highlight: 'Watching a pride of lions awake at sunrise on the savannah.',
    rating: 5,
    weather: 'golden_hour',
    companions: 'Family Trip',
    isFavorite: false,
    tags: ['Wildlife', 'Safari', 'Coastline', 'Table Mountain', 'Wine'],
    expenses: [
      { id: 'exp-za-1', category: 'flights', amount: 1120, currency: 'USD', description: 'Cape Town international flights' },
      { id: 'exp-za-2', category: 'lodging', amount: 1250, currency: 'USD', description: 'Kruger safari lodge & Camps Bay villa' },
      { id: 'exp-za-3', category: 'activities', amount: 620, currency: 'USD', description: 'Open-vehicle 4x4 game drives & guides' },
      { id: 'exp-za-4', category: 'food', amount: 440, currency: 'USD', description: 'Stellenbosch wine estate lunches and seafood' }
    ],
    photos: [
      {
        id: 'za-1',
        url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop',
        caption: 'Cape Town coastline where dramatic mountains meet azure waters',
        isCover: true,
        location: 'Cape Town'
      },
      {
        id: 'za-2',
        url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1200&auto=format&fit=crop',
        caption: 'Golden morning light filtering through acacia trees on safari',
        location: 'Kruger National Park'
      }
    ],
    createdAt: '2022-10-02T16:00:00Z',
    updatedAt: '2022-10-02T16:00:00Z'
  }
];


export const PRESET_COUNTRY_PHOTOS: Record<string, Array<{ url: string; caption: string; location: string }>> = {
  JP: [
    { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop', caption: 'Fushimi Inari Torii Gates', location: 'Kyoto' },
    { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop', caption: 'Tokyo Tower & Skyline', location: 'Tokyo' },
    { url: 'https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=1200&auto=format&fit=crop', caption: 'Mt. Fuji over Lake Kawaguchi', location: 'Yamanashi' },
    { url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=1200&auto=format&fit=crop', caption: 'Hakone Forest Paths', location: 'Hakone' }
  ],
  IT: [
    { url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop', caption: 'Positano Cliffside', location: 'Amalfi Coast' },
    { url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop', caption: 'Colosseum at Sunset', location: 'Rome' },
    { url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=1200&auto=format&fit=crop', caption: 'Venetian Gondolas & Canals', location: 'Venice' },
    { url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1200&auto=format&fit=crop', caption: 'Florence Duomo', location: 'Florence' }
  ],
  FR: [
    { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop', caption: 'Eiffel Tower from the Seine', location: 'Paris' },
    { url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop', caption: 'Lavender Fields of Provence', location: 'Provence' },
    { url: 'https://images.unsplash.com/photo-1520939817895-060bdef4ad1b?q=80&w=1200&auto=format&fit=crop', caption: 'Mont Saint-Michel Abbey', location: 'Normandy' }
  ],
  US: [
    { url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop', caption: 'New York City Skyline at Dusk', location: 'New York' },
    { url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1200&auto=format&fit=crop', caption: 'Yosemite Valley Mist', location: 'California' },
    { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', caption: 'Grand Canyon Panoramas', location: 'Arizona' }
  ],
  ES: [
    { url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1200&auto=format&fit=crop', caption: 'Sagrada Familia Cathedral', location: 'Barcelona' },
    { url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200&auto=format&fit=crop', caption: 'Plaza Mayor of Madrid', location: 'Madrid' },
    { url: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?q=80&w=1200&auto=format&fit=crop', caption: 'Alhambra Palace', location: 'Granada' }
  ],
  TH: [
    { url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop', caption: 'Grand Palace Temples', location: 'Bangkok' },
    { url: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=1200&auto=format&fit=crop', caption: 'Emerald Waters of Maya Bay', location: 'Koh Phi Phi' },
    { url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop', caption: 'Lanterns of Chiang Mai', location: 'Chiang Mai' }
  ],
  IS: [
    { url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=1200&auto=format&fit=crop', caption: 'Skógafoss Waterfall Rainbow', location: 'South Coast' },
    { url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop', caption: 'Black Sand Beach & Basalt Columns', location: 'Reynisfjara' },
    { url: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?q=80&w=1200&auto=format&fit=crop', caption: 'Glacier Lagoon Icebergs', location: 'Jökulsárlón' }
  ]
};

export const COMMON_TRAVEL_TAGS = [
  'Culinary',
  'Roadtrip',
  'Hiking',
  'Architecture',
  'Coastline',
  'Mountains',
  'Temples',
  'Ancient Ruins',
  'Photography',
  'Solo Travel',
  'Wildlife',
  'Winter & Snow',
  'Northern Lights',
  'Island Life',
  'Museums & Art',
  'Backpacking',
  'Honeymoon',
  'Street Food'
];
