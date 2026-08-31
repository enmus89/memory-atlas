import { CountryInfo, Continent } from '../types';

export const COUNTRIES_DATA: CountryInfo[] = [
  // Western & Southern Europe
  { code: 'FR', code3: 'FRA', numericId: '250', name: 'France', continent: 'Europe', flag: '🇫🇷', capital: 'Paris', coordinates: [2.2137, 46.2276] },
  { code: 'IT', code3: 'ITA', numericId: '380', name: 'Italy', continent: 'Europe', flag: '🇮🇹', capital: 'Rome', coordinates: [12.5674, 41.8719] },
  { code: 'ES', code3: 'ESP', numericId: '724', name: 'Spain', continent: 'Europe', flag: '🇪🇸', capital: 'Madrid', coordinates: [-3.7492, 40.4637] },
  { code: 'DE', code3: 'DEU', numericId: '276', name: 'Germany', continent: 'Europe', flag: '🇩🇪', capital: 'Berlin', coordinates: [10.4515, 51.1657] },
  { code: 'GB', code3: 'GBR', numericId: '826', name: 'United Kingdom', continent: 'Europe', flag: '🇬🇧', capital: 'London', coordinates: [-3.436, 55.3781] },
  { code: 'PT', code3: 'PRT', numericId: '620', name: 'Portugal', continent: 'Europe', flag: '🇵🇹', capital: 'Lisbon', coordinates: [-8.2245, 39.3999] },
  { code: 'GR', code3: 'GRC', numericId: '300', name: 'Greece', continent: 'Europe', flag: '🇬🇷', capital: 'Athens', coordinates: [21.8243, 39.0742] },
  { code: 'CH', code3: 'CHE', numericId: '756', name: 'Switzerland', continent: 'Europe', flag: '🇨🇭', capital: 'Bern', coordinates: [8.2275, 46.8182] },
  { code: 'AT', code3: 'AUT', numericId: '040', name: 'Austria', continent: 'Europe', flag: '🇦🇹', capital: 'Vienna', coordinates: [14.5501, 47.5162] },
  { code: 'NL', code3: 'NLD', numericId: '528', name: 'Netherlands', continent: 'Europe', flag: '🇳🇱', capital: 'Amsterdam', coordinates: [5.2913, 52.1326] },
  { code: 'BE', code3: 'BEL', numericId: '056', name: 'Belgium', continent: 'Europe', flag: '🇧🇪', capital: 'Brussels', coordinates: [4.4699, 50.5039] },
  { code: 'IE', code3: 'IRL', numericId: '372', name: 'Ireland', continent: 'Europe', flag: '🇮🇪', capital: 'Dublin', coordinates: [-8.2439, 53.4129] },
  { code: 'LU', code3: 'LUX', numericId: '442', name: 'Luxembourg', continent: 'Europe', flag: '🇱🇺', capital: 'Luxembourg', coordinates: [6.1296, 49.8153] },
  { code: 'MC', code3: 'MCO', numericId: '492', name: 'Monaco', continent: 'Europe', flag: '🇲🇨', capital: 'Monaco', coordinates: [7.4246, 43.7384] },
  { code: 'AD', code3: 'AND', numericId: '020', name: 'Andorra', continent: 'Europe', flag: '🇦🇩', capital: 'Andorra la Vella', coordinates: [1.5218, 42.5063] },
  { code: 'LI', code3: 'LIE', numericId: '438', name: 'Liechtenstein', continent: 'Europe', flag: '🇱🇮', capital: 'Vaduz', coordinates: [9.5209, 47.166] },
  { code: 'SM', code3: 'SMR', numericId: '674', name: 'San Marino', continent: 'Europe', flag: '🇸🇲', capital: 'San Marino', coordinates: [12.4578, 43.9424] },
  { code: 'VA', code3: 'VAT', numericId: '336', name: 'Vatican City', continent: 'Europe', flag: '🇻🇦', capital: 'Vatican City', coordinates: [12.4534, 41.9029] },

  // Northern Europe & Nordics
  { code: 'NO', code3: 'NOR', numericId: '578', name: 'Norway', continent: 'Europe', flag: '🇳🇴', capital: 'Oslo', coordinates: [8.4689, 60.472] },
  { code: 'SE', code3: 'SWE', numericId: '752', name: 'Sweden', continent: 'Europe', flag: '🇸🇪', capital: 'Stockholm', coordinates: [18.6435, 60.1282] },
  { code: 'FI', code3: 'FIN', numericId: '246', name: 'Finland', continent: 'Europe', flag: '🇫🇮', capital: 'Helsinki', coordinates: [25.7482, 61.9241] },
  { code: 'DK', code3: 'DNK', numericId: '208', name: 'Denmark', continent: 'Europe', flag: '🇩🇰', capital: 'Copenhagen', coordinates: [9.5018, 56.2639] },
  { code: 'IS', code3: 'ISL', numericId: '352', name: 'Iceland', continent: 'Europe', flag: '🇮🇸', capital: 'Reykjavik', coordinates: [-19.0208, 64.9631] },
  { code: 'EE', code3: 'EST', numericId: '233', name: 'Estonia', continent: 'Europe', flag: '🇪🇪', capital: 'Tallinn', coordinates: [25.0136, 58.5953] },
  { code: 'LV', code3: 'LVA', numericId: '428', name: 'Latvia', continent: 'Europe', flag: '🇱🇻', capital: 'Riga', coordinates: [24.6032, 56.8796] },
  { code: 'LT', code3: 'LTU', numericId: '440', name: 'Lithuania', continent: 'Europe', flag: '🇱🇹', capital: 'Vilnius', coordinates: [23.8813, 55.1694] },

  // Eastern & Central Europe
  { code: 'PL', code3: 'POL', numericId: '616', name: 'Poland', continent: 'Europe', flag: '🇵🇱', capital: 'Warsaw', coordinates: [19.1451, 51.9194] },
  { code: 'CZ', code3: 'CZE', numericId: '203', name: 'Czechia', continent: 'Europe', flag: '🇨🇿', capital: 'Prague', coordinates: [15.473, 49.8175] },
  { code: 'SK', code3: 'SVK', numericId: '703', name: 'Slovakia', continent: 'Europe', flag: '🇸🇰', capital: 'Bratislava', coordinates: [19.699, 48.669] },
  { code: 'HU', code3: 'HUN', numericId: '348', name: 'Hungary', continent: 'Europe', flag: '🇭🇺', capital: 'Budapest', coordinates: [19.5033, 47.1625] },
  { code: 'RO', code3: 'ROU', numericId: '642', name: 'Romania', continent: 'Europe', flag: '🇷🇴', capital: 'Bucharest', coordinates: [24.9668, 45.9432] },
  { code: 'BG', code3: 'BGR', numericId: '100', name: 'Bulgaria', continent: 'Europe', flag: '🇧🇬', capital: 'Sofia', coordinates: [25.4858, 42.7339] },
  { code: 'HR', code3: 'HRV', numericId: '191', name: 'Croatia', continent: 'Europe', flag: '🇭🇷', capital: 'Zagreb', coordinates: [15.2, 45.1] },
  { code: 'SI', code3: 'SVN', numericId: '705', name: 'Slovenia', continent: 'Europe', flag: '🇸🇮', capital: 'Ljubljana', coordinates: [14.9955, 46.1512] },
  { code: 'RS', code3: 'SRB', numericId: '688', name: 'Serbia', continent: 'Europe', flag: '🇷🇸', capital: 'Belgrade', coordinates: [21.0059, 44.0165] },
  { code: 'BA', code3: 'BIH', numericId: '070', name: 'Bosnia and Herzegovina', continent: 'Europe', flag: '🇧🇦', capital: 'Sarajevo', coordinates: [17.6791, 43.9159] },
  { code: 'ME', code3: 'MNE', numericId: '499', name: 'Montenegro', continent: 'Europe', flag: '🇲🇪', capital: 'Podgorica', coordinates: [19.3744, 42.7087] },
  // Kosovo has no official ISO 3166-1 numeric code — it's outside UN
  // membership — so it also has no id in the world-atlas topology. The map
  // still matches it correctly by name (see MapView/GlobeView's
  // `findCountry(numericId) || findCountry(name)` fallback); code3 and
  // numericId here follow the "user-assigned" values (XKX / 926) that the
  // World Bank and other systems use in practice.
  { code: 'XK', code3: 'XKX', numericId: '926', name: 'Kosovo', continent: 'Europe', flag: '🇽🇰', capital: 'Pristina', coordinates: [20.9028, 42.6026] },
  { code: 'AL', code3: 'ALB', numericId: '008', name: 'Albania', continent: 'Europe', flag: '🇦🇱', capital: 'Tirana', coordinates: [20.1683, 41.1533] },
  { code: 'MK', code3: 'MKD', numericId: '807', name: 'North Macedonia', continent: 'Europe', flag: '🇲🇰', capital: 'Skopje', coordinates: [21.7453, 41.6086] },
  { code: 'UA', code3: 'UKR', numericId: '804', name: 'Ukraine', continent: 'Europe', flag: '🇺🇦', capital: 'Kyiv', coordinates: [31.1656, 48.3794] },
  { code: 'MD', code3: 'MDA', numericId: '498', name: 'Moldova', continent: 'Europe', flag: '🇲🇩', capital: 'Chișinău', coordinates: [28.3699, 47.4116] },
  { code: 'TR', code3: 'TUR', numericId: '792', name: 'Turkey', continent: 'Europe', flag: '🇹🇷', capital: 'Ankara', coordinates: [35.2433, 38.9637] },
  { code: 'CY', code3: 'CYP', numericId: '196', name: 'Cyprus', continent: 'Europe', flag: '🇨🇾', capital: 'Nicosia', coordinates: [33.4299, 35.1264] },
  { code: 'MT', code3: 'MLT', numericId: '470', name: 'Malta', continent: 'Europe', flag: '🇲🇹', capital: 'Valletta', coordinates: [14.3754, 35.9375] },
  { code: 'GE', code3: 'GEO', numericId: '268', name: 'Georgia', continent: 'Europe', flag: '🇬🇪', capital: 'Tbilisi', coordinates: [43.3569, 42.3154] },
  { code: 'AM', code3: 'ARM', numericId: '051', name: 'Armenia', continent: 'Europe', flag: '🇦🇲', capital: 'Yerevan', coordinates: [45.0382, 40.0691] },
  { code: 'AZ', code3: 'AZE', numericId: '031', name: 'Azerbaijan', continent: 'Europe', flag: '🇦🇿', capital: 'Baku', coordinates: [47.5769, 40.1431] },

  // East & Southeast Asia
  { code: 'JP', code3: 'JPN', numericId: '392', name: 'Japan', continent: 'Asia', flag: '🇯🇵', capital: 'Tokyo', coordinates: [138.2529, 36.2048] },
  { code: 'KR', code3: 'KOR', numericId: '410', name: 'South Korea', continent: 'Asia', flag: '🇰🇷', capital: 'Seoul', coordinates: [127.7669, 35.9078] },
  { code: 'CN', code3: 'CHN', numericId: '156', name: 'China', continent: 'Asia', flag: '🇨🇳', capital: 'Beijing', coordinates: [104.1954, 35.8617] },
  { code: 'TW', code3: 'TWN', numericId: '158', name: 'Taiwan', continent: 'Asia', flag: '🇹🇼', capital: 'Taipei', coordinates: [120.9605, 23.6978] },
  { code: 'MN', code3: 'MNG', numericId: '496', name: 'Mongolia', continent: 'Asia', flag: '🇲🇳', capital: 'Ulaanbaatar', coordinates: [103.8467, 46.8625] },
  { code: 'TH', code3: 'THA', numericId: '764', name: 'Thailand', continent: 'Asia', flag: '🇹🇭', capital: 'Bangkok', coordinates: [100.9925, 15.87] },
  { code: 'VN', code3: 'VNM', numericId: '704', name: 'Vietnam', continent: 'Asia', flag: '🇻🇳', capital: 'Hanoi', coordinates: [108.2772, 14.0583] },
  { code: 'ID', code3: 'IDN', numericId: '360', name: 'Indonesia', continent: 'Asia', flag: '🇮🇩', capital: 'Jakarta', coordinates: [113.9213, -0.7893] },
  { code: 'MY', code3: 'MYS', numericId: '458', name: 'Malaysia', continent: 'Asia', flag: '🇲🇾', capital: 'Kuala Lumpur', coordinates: [101.9758, 4.2105] },
  { code: 'SG', code3: 'SGP', numericId: '702', name: 'Singapore', continent: 'Asia', flag: '🇸🇬', capital: 'Singapore', coordinates: [103.8198, 1.3521] },
  { code: 'PH', code3: 'PHL', numericId: '608', name: 'Philippines', continent: 'Asia', flag: '🇵🇭', capital: 'Manila', coordinates: [121.774, 12.8797] },
  { code: 'KH', code3: 'KHM', numericId: '116', name: 'Cambodia', continent: 'Asia', flag: '🇰🇭', capital: 'Phnom Penh', coordinates: [104.991, 12.5657] },
  { code: 'LA', code3: 'LAO', numericId: '418', name: 'Laos', continent: 'Asia', flag: '🇱🇦', capital: 'Vientiane', coordinates: [102.4955, 19.8563] },
  { code: 'MM', code3: 'MMR', numericId: '104', name: 'Myanmar', continent: 'Asia', flag: '🇲🇲', capital: 'Naypyidaw', coordinates: [95.956, 21.9162] },

  // South & Central Asia & Middle East
  { code: 'IN', code3: 'IND', numericId: '356', name: 'India', continent: 'Asia', flag: '🇮🇳', capital: 'New Delhi', coordinates: [78.9629, 20.5937] },
  { code: 'NP', code3: 'NPL', numericId: '524', name: 'Nepal', continent: 'Asia', flag: '🇳🇵', capital: 'Kathmandu', coordinates: [84.124, 28.3949] },
  { code: 'LK', code3: 'LKA', numericId: '144', name: 'Sri Lanka', continent: 'Asia', flag: '🇱🇰', capital: 'Colombo', coordinates: [80.7718, 7.8731] },
  { code: 'BD', code3: 'BGD', numericId: '050', name: 'Bangladesh', continent: 'Asia', flag: '🇧🇩', capital: 'Dhaka', coordinates: [90.3563, 23.685] },
  { code: 'PK', code3: 'PAK', numericId: '586', name: 'Pakistan', continent: 'Asia', flag: '🇵🇰', capital: 'Islamabad', coordinates: [69.3451, 30.3753] },
  { code: 'KW', code3: 'KWT', numericId: '414', name: 'Kuwait', continent: 'Asia', flag: '🇰🇼', capital: 'Kuwait City', coordinates: [47.4818, 29.3117] },
  { code: 'BH', code3: 'BHR', numericId: '048', name: 'Bahrain', continent: 'Asia', flag: '🇧🇭', capital: 'Manama', coordinates: [50.5577, 26.0667] },
  { code: 'AE', code3: 'ARE', numericId: '784', name: 'United Arab Emirates', continent: 'Asia', flag: '🇦🇪', capital: 'Abu Dhabi', coordinates: [53.8478, 23.4241] },
  { code: 'QA', code3: 'QAT', numericId: '634', name: 'Qatar', continent: 'Asia', flag: '🇶🇦', capital: 'Doha', coordinates: [51.1839, 25.3548] },
  { code: 'SA', code3: 'SAU', numericId: '682', name: 'Saudi Arabia', continent: 'Asia', flag: '🇸🇦', capital: 'Riyadh', coordinates: [45.0792, 23.8859] },
  { code: 'OM', code3: 'OMN', numericId: '512', name: 'Oman', continent: 'Asia', flag: '🇴🇲', capital: 'Muscat', coordinates: [55.9233, 21.5126] },
  { code: 'YE', code3: 'YEM', numericId: '887', name: 'Yemen', continent: 'Asia', flag: '🇾🇪', capital: "Sana'a", coordinates: [48.5164, 15.5527] },
  { code: 'IQ', code3: 'IRQ', numericId: '368', name: 'Iraq', continent: 'Asia', flag: '🇮🇶', capital: 'Baghdad', coordinates: [43.6793, 33.2232] },
  { code: 'IR', code3: 'IRN', numericId: '364', name: 'Iran', continent: 'Asia', flag: '🇮🇷', capital: 'Tehran', coordinates: [53.688, 32.4279] },
  { code: 'JO', code3: 'JOR', numericId: '400', name: 'Jordan', continent: 'Asia', flag: '🇯🇴', capital: 'Amman', coordinates: [36.2384, 30.5852] },
  { code: 'IL', code3: 'ISR', numericId: '376', name: 'Israel', continent: 'Asia', flag: '🇮🇱', capital: 'Jerusalem', coordinates: [34.8516, 31.0461] },
  { code: 'PS', code3: 'PSE', numericId: '275', name: 'Palestine', continent: 'Asia', flag: '🇵🇸', capital: 'Jerusalem', coordinates: [35.2332, 31.9522] },
  { code: 'LB', code3: 'LBN', numericId: '422', name: 'Lebanon', continent: 'Asia', flag: '🇱🇧', capital: 'Beirut', coordinates: [35.8623, 33.8547] },
  { code: 'SY', code3: 'SYR', numericId: '760', name: 'Syria', continent: 'Asia', flag: '🇸🇾', capital: 'Damascus', coordinates: [38.9968, 34.8021] },
  { code: 'UZ', code3: 'UZB', numericId: '860', name: 'Uzbekistan', continent: 'Asia', flag: '🇺🇿', capital: 'Tashkent', coordinates: [64.5853, 41.3775] },
  { code: 'KZ', code3: 'KAZ', numericId: '398', name: 'Kazakhstan', continent: 'Asia', flag: '🇰🇿', capital: 'Astana', coordinates: [66.9237, 48.0196] },
  { code: 'KG', code3: 'KGZ', numericId: '417', name: 'Kyrgyzstan', continent: 'Asia', flag: '🇰🇬', capital: 'Bishkek', coordinates: [74.7661, 41.2044] },
  { code: 'TJ', code3: 'TJK', numericId: '762', name: 'Tajikistan', continent: 'Asia', flag: '🇹🇯', capital: 'Dushanbe', coordinates: [71.2761, 38.861] },
  { code: 'TM', code3: 'TKM', numericId: '795', name: 'Turkmenistan', continent: 'Asia', flag: '🇹🇲', capital: 'Ashgabat', coordinates: [59.5563, 38.9697] },
  { code: 'AF', code3: 'AFG', numericId: '004', name: 'Afghanistan', continent: 'Asia', flag: '🇦🇫', capital: 'Kabul', coordinates: [67.71, 33.9391] },
  { code: 'BT', code3: 'BTN', numericId: '064', name: 'Bhutan', continent: 'Asia', flag: '🇧🇹', capital: 'Thimphu', coordinates: [90.4336, 27.5142] },
  { code: 'MV', code3: 'MDV', numericId: '462', name: 'Maldives', continent: 'Asia', flag: '🇲🇻', capital: 'Malé', coordinates: [73.2207, 3.2028] },

  // North & Central America & Caribbean
  { code: 'US', code3: 'USA', numericId: '840', name: 'United States', continent: 'North America', flag: '🇺🇸', capital: 'Washington, D.C.', coordinates: [-95.7129, 37.0902] },
  { code: 'CA', code3: 'CAN', numericId: '124', name: 'Canada', continent: 'North America', flag: '🇨🇦', capital: 'Ottawa', coordinates: [-106.3468, 56.1304] },
  { code: 'MX', code3: 'MEX', numericId: '484', name: 'Mexico', continent: 'North America', flag: '🇲🇽', capital: 'Mexico City', coordinates: [-102.5528, 23.6345] },
  { code: 'CR', code3: 'CRI', numericId: '188', name: 'Costa Rica', continent: 'North America', flag: '🇨🇷', capital: 'San José', coordinates: [-83.7534, 9.7489] },
  { code: 'PA', code3: 'PAN', numericId: '591', name: 'Panama', continent: 'North America', flag: '🇵🇦', capital: 'Panama City', coordinates: [-80.7821, 8.538] },
  { code: 'GT', code3: 'GTM', numericId: '320', name: 'Guatemala', continent: 'North America', flag: '🇬🇹', capital: 'Guatemala City', coordinates: [-90.2308, 15.7835] },
  { code: 'BZ', code3: 'BLZ', numericId: '084', name: 'Belize', continent: 'North America', flag: '🇧🇿', capital: 'Belmopan', coordinates: [-88.4976, 17.1899] },
  { code: 'CU', code3: 'CUB', numericId: '192', name: 'Cuba', continent: 'North America', flag: '🇨🇺', capital: 'Havana', coordinates: [-77.7812, 21.5218] },
  { code: 'DO', code3: 'DOM', numericId: '214', name: 'Dominican Republic', continent: 'North America', flag: '🇩🇴', capital: 'Santo Domingo', coordinates: [-70.1627, 18.7357] },
  { code: 'JM', code3: 'JAM', numericId: '388', name: 'Jamaica', continent: 'North America', flag: '🇯🇲', capital: 'Kingston', coordinates: [-77.2975, 18.1096] },
  { code: 'BS', code3: 'BHS', numericId: '044', name: 'Bahamas', continent: 'North America', flag: '🇧🇸', capital: 'Nassau', coordinates: [-77.3963, 25.0343] },

  // South America
  { code: 'PE', code3: 'PER', numericId: '604', name: 'Peru', continent: 'South America', flag: '🇵🇪', capital: 'Lima', coordinates: [-75.0152, -9.19] },
  { code: 'BR', code3: 'BRA', numericId: '076', name: 'Brazil', continent: 'South America', flag: '🇧🇷', capital: 'Brasília', coordinates: [-51.9253, -14.235] },
  { code: 'AR', code3: 'ARG', numericId: '032', name: 'Argentina', continent: 'South America', flag: '🇦🇷', capital: 'Buenos Aires', coordinates: [-63.6167, -38.4161] },
  { code: 'CL', code3: 'CHL', numericId: '152', name: 'Chile', continent: 'South America', flag: '🇨🇱', capital: 'Santiago', coordinates: [-71.543, -35.6751] },
  { code: 'CO', code3: 'COL', numericId: '170', name: 'Colombia', continent: 'South America', flag: '🇨🇴', capital: 'Bogotá', coordinates: [-74.2973, 4.5709] },
  { code: 'EC', code3: 'ECU', numericId: '218', name: 'Ecuador', continent: 'South America', flag: '🇪🇨', capital: 'Quito', coordinates: [-78.1834, -1.8312] },
  { code: 'BO', code3: 'BOL', numericId: '068', name: 'Bolivia', continent: 'South America', flag: '🇧🇴', capital: 'Sucre', coordinates: [-63.5887, -16.2902] },
  { code: 'UY', code3: 'URY', numericId: '858', name: 'Uruguay', continent: 'South America', flag: '🇺🇾', capital: 'Montevideo', coordinates: [-55.7658, -32.5228] },
  { code: 'PY', code3: 'PRY', numericId: '600', name: 'Paraguay', continent: 'South America', flag: '🇵🇾', capital: 'Asunción', coordinates: [-58.4438, -23.4425] },

  // Africa
  { code: 'ZA', code3: 'ZAF', numericId: '710', name: 'South Africa', continent: 'Africa', flag: '🇿🇦', capital: 'Pretoria', coordinates: [22.9375, -30.5595] },
  { code: 'MA', code3: 'MAR', numericId: '504', name: 'Morocco', continent: 'Africa', flag: '🇲🇦', capital: 'Rabat', coordinates: [-7.0926, 31.7917] },
  { code: 'EG', code3: 'EGY', numericId: '818', name: 'Egypt', continent: 'Africa', flag: '🇪🇬', capital: 'Cairo', coordinates: [30.8025, 26.8206] },
  { code: 'KE', code3: 'KEN', numericId: '404', name: 'Kenya', continent: 'Africa', flag: '🇰🇪', capital: 'Nairobi', coordinates: [37.9062, -0.0236] },
  { code: 'TZ', code3: 'TZA', numericId: '834', name: 'Tanzania', continent: 'Africa', flag: '🇹🇿', capital: 'Dodoma', coordinates: [34.8888, -6.369] },
  { code: 'NA', code3: 'NAM', numericId: '516', name: 'Namibia', continent: 'Africa', flag: '🇳🇦', capital: 'Windhoek', coordinates: [18.4904, -22.9576] },
  { code: 'BW', code3: 'BWA', numericId: '072', name: 'Botswana', continent: 'Africa', flag: '🇧🇼', capital: 'Gaborone', coordinates: [24.6849, -22.3285] },
  { code: 'GH', code3: 'GHA', numericId: '288', name: 'Ghana', continent: 'Africa', flag: '🇬🇭', capital: 'Accra', coordinates: [-1.0232, 7.9465] },
  { code: 'NG', code3: 'NGA', numericId: '566', name: 'Nigeria', continent: 'Africa', flag: '🇳🇬', capital: 'Abuja', coordinates: [8.6753, 9.082] },
  { code: 'SN', code3: 'SEN', numericId: '686', name: 'Senegal', continent: 'Africa', flag: '🇸🇳', capital: 'Dakar', coordinates: [-14.4524, 14.4974] },
  { code: 'ET', code3: 'ETH', numericId: '231', name: 'Ethiopia', continent: 'Africa', flag: '🇪🇹', capital: 'Addis Ababa', coordinates: [40.4897, 9.145] },
  { code: 'UG', code3: 'UGA', numericId: '800', name: 'Uganda', continent: 'Africa', flag: '🇺🇬', capital: 'Kampala', coordinates: [32.2903, 1.3733] },
  { code: 'RW', code3: 'RWA', numericId: '646', name: 'Rwanda', continent: 'Africa', flag: '🇷🇼', capital: 'Kigali', coordinates: [29.8739, -1.9403] },
  { code: 'MG', code3: 'MDG', numericId: '450', name: 'Madagascar', continent: 'Africa', flag: '🇲🇬', capital: 'Antananarivo', coordinates: [46.8691, -18.7669] },
  { code: 'MU', code3: 'MUS', numericId: '480', name: 'Mauritius', continent: 'Africa', flag: '🇲🇺', capital: 'Port Louis', coordinates: [57.5522, -20.3484] },
  { code: 'SC', code3: 'SYC', numericId: '690', name: 'Seychelles', continent: 'Africa', flag: '🇸🇨', capital: 'Victoria', coordinates: [55.492, -4.6796] },
  { code: 'TN', code3: 'TUN', numericId: '788', name: 'Tunisia', continent: 'Africa', flag: '🇹🇳', capital: 'Tunis', coordinates: [9.5375, 33.8869] },

  // Oceania
  { code: 'AU', code3: 'AUS', numericId: '036', name: 'Australia', continent: 'Oceania', flag: '🇦🇺', capital: 'Canberra', coordinates: [133.7751, -25.2744] },
  { code: 'NZ', code3: 'NZL', numericId: '554', name: 'New Zealand', continent: 'Oceania', flag: '🇳🇿', capital: 'Wellington', coordinates: [174.886, -40.9006] },
  { code: 'FJ', code3: 'FJI', numericId: '242', name: 'Fiji', continent: 'Oceania', flag: '🇫🇯', capital: 'Suva', coordinates: [178.065, -17.7134] },
  { code: 'PF', code3: 'PYF', numericId: '258', name: 'French Polynesia', continent: 'Oceania', flag: '🇵🇫', capital: 'Papeete', coordinates: [-149.4068, -17.6797] },
  { code: 'VU', code3: 'VUT', numericId: '548', name: 'Vanuatu', continent: 'Oceania', flag: '🇻🇺', capital: 'Port Vila', coordinates: [166.9592, -15.3767] },
  { code: 'WS', code3: 'WSM', numericId: '882', name: 'Samoa', continent: 'Oceania', flag: '🇼🇸', capital: 'Apia', coordinates: [-172.1046, -13.759] },

  // Other major territories & North Eurasia
  { code: 'RU', code3: 'RUS', numericId: '643', name: 'Russia', continent: 'Europe', flag: '🇷🇺', capital: 'Moscow', coordinates: [105.3188, 61.524] },
  { code: 'GL', code3: 'GRL', numericId: '304', name: 'Greenland', continent: 'North America', flag: '🇬🇱', capital: 'Nuuk', coordinates: [-42.6043, 71.7069] },

  // 48 UN member states that were simply absent from this list — found while
  // chasing an unrelated globe rendering bug, by diffing every country the
  // world-atlas topology knows against this file. Each is a real, widely
  // recognized country, not a judgment call the way Kosovo or Taiwan are;
  // without an entry here a country can't be searched, selected, or marked
  // visited at all — clicking it silently does nothing, on both the 2D map
  // and the 3D globe. Deliberately excluded: disputed or non-UN territories
  // (Western Sahara, Somaliland, Northern Cyprus), dependencies (Puerto Rico,
  // New Caledonia, French Southern and Antarctic Lands, the Falkland
  // Islands), and Antarctica, which isn't a country to visit in this app's
  // sense. Those are real gaps in a different, more judgment-laden way and
  // are left for a deliberate decision rather than folded in here.
  { code: 'DZ', code3: 'DZA', numericId: '012', name: 'Algeria', continent: 'Africa', flag: '🇩🇿', capital: 'Algiers', coordinates: [1.6596, 28.0339] },
  { code: 'LY', code3: 'LBY', numericId: '434', name: 'Libya', continent: 'Africa', flag: '🇱🇾', capital: 'Tripoli', coordinates: [17.2283, 26.3351] },
  { code: 'SD', code3: 'SDN', numericId: '729', name: 'Sudan', continent: 'Africa', flag: '🇸🇩', capital: 'Khartoum', coordinates: [30.2176, 12.8628] },
  { code: 'SS', code3: 'SSD', numericId: '728', name: 'South Sudan', continent: 'Africa', flag: '🇸🇸', capital: 'Juba', coordinates: [31.307, 6.877] },
  { code: 'TD', code3: 'TCD', numericId: '148', name: 'Chad', continent: 'Africa', flag: '🇹🇩', capital: "N'Djamena", coordinates: [18.7322, 15.4542] },
  { code: 'ER', code3: 'ERI', numericId: '232', name: 'Eritrea', continent: 'Africa', flag: '🇪🇷', capital: 'Asmara', coordinates: [39.7823, 15.1794] },
  { code: 'DJ', code3: 'DJI', numericId: '262', name: 'Djibouti', continent: 'Africa', flag: '🇩🇯', capital: 'Djibouti', coordinates: [42.5903, 11.8251] },
  { code: 'SO', code3: 'SOM', numericId: '706', name: 'Somalia', continent: 'Africa', flag: '🇸🇴', capital: 'Mogadishu', coordinates: [46.1996, 5.1521] },
  { code: 'ML', code3: 'MLI', numericId: '466', name: 'Mali', continent: 'Africa', flag: '🇲🇱', capital: 'Bamako', coordinates: [-3.9962, 17.5707] },
  { code: 'MR', code3: 'MRT', numericId: '478', name: 'Mauritania', continent: 'Africa', flag: '🇲🇷', capital: 'Nouakchott', coordinates: [-10.9408, 21.0079] },
  { code: 'NE', code3: 'NER', numericId: '562', name: 'Niger', continent: 'Africa', flag: '🇳🇪', capital: 'Niamey', coordinates: [8.0817, 17.6078] },
  { code: 'BJ', code3: 'BEN', numericId: '204', name: 'Benin', continent: 'Africa', flag: '🇧🇯', capital: 'Porto-Novo', coordinates: [2.3158, 9.3077] },
  { code: 'TG', code3: 'TGO', numericId: '768', name: 'Togo', continent: 'Africa', flag: '🇹🇬', capital: 'Lomé', coordinates: [0.8248, 8.6195] },
  { code: 'CI', code3: 'CIV', numericId: '384', name: "Côte d'Ivoire", continent: 'Africa', flag: '🇨🇮', capital: 'Yamoussoukro', coordinates: [-5.5471, 7.54] },
  { code: 'GN', code3: 'GIN', numericId: '324', name: 'Guinea', continent: 'Africa', flag: '🇬🇳', capital: 'Conakry', coordinates: [-9.6966, 9.9456] },
  { code: 'GW', code3: 'GNB', numericId: '624', name: 'Guinea-Bissau', continent: 'Africa', flag: '🇬🇼', capital: 'Bissau', coordinates: [-15.1804, 11.8037] },
  { code: 'LR', code3: 'LBR', numericId: '430', name: 'Liberia', continent: 'Africa', flag: '🇱🇷', capital: 'Monrovia', coordinates: [-9.4295, 6.4281] },
  { code: 'SL', code3: 'SLE', numericId: '694', name: 'Sierra Leone', continent: 'Africa', flag: '🇸🇱', capital: 'Freetown', coordinates: [-11.7799, 8.4606] },
  { code: 'BF', code3: 'BFA', numericId: '854', name: 'Burkina Faso', continent: 'Africa', flag: '🇧🇫', capital: 'Ouagadougou', coordinates: [-1.5616, 12.2383] },
  { code: 'GM', code3: 'GMB', numericId: '270', name: 'Gambia', continent: 'Africa', flag: '🇬🇲', capital: 'Banjul', coordinates: [-15.3101, 13.4432] },
  { code: 'CM', code3: 'CMR', numericId: '120', name: 'Cameroon', continent: 'Africa', flag: '🇨🇲', capital: 'Yaoundé', coordinates: [12.3547, 7.3697] },
  { code: 'CF', code3: 'CAF', numericId: '140', name: 'Central African Republic', continent: 'Africa', flag: '🇨🇫', capital: 'Bangui', coordinates: [20.9394, 6.6111] },
  { code: 'CG', code3: 'COG', numericId: '178', name: 'Congo', continent: 'Africa', flag: '🇨🇬', capital: 'Brazzaville', coordinates: [15.8277, -0.228] },
  { code: 'CD', code3: 'COD', numericId: '180', name: 'DR Congo', continent: 'Africa', flag: '🇨🇩', capital: 'Kinshasa', coordinates: [21.7587, -4.0383] },
  { code: 'GA', code3: 'GAB', numericId: '266', name: 'Gabon', continent: 'Africa', flag: '🇬🇦', capital: 'Libreville', coordinates: [11.6094, -0.8037] },
  { code: 'GQ', code3: 'GNQ', numericId: '226', name: 'Equatorial Guinea', continent: 'Africa', flag: '🇬🇶', capital: 'Malabo', coordinates: [10.2679, 1.6508] },
  { code: 'AO', code3: 'AGO', numericId: '024', name: 'Angola', continent: 'Africa', flag: '🇦🇴', capital: 'Luanda', coordinates: [17.8739, -11.2027] },
  { code: 'ZM', code3: 'ZMB', numericId: '894', name: 'Zambia', continent: 'Africa', flag: '🇿🇲', capital: 'Lusaka', coordinates: [27.8493, -13.1339] },
  { code: 'MW', code3: 'MWI', numericId: '454', name: 'Malawi', continent: 'Africa', flag: '🇲🇼', capital: 'Lilongwe', coordinates: [34.3015, -13.2543] },
  { code: 'MZ', code3: 'MOZ', numericId: '508', name: 'Mozambique', continent: 'Africa', flag: '🇲🇿', capital: 'Maputo', coordinates: [35.5296, -18.6657] },
  { code: 'ZW', code3: 'ZWE', numericId: '716', name: 'Zimbabwe', continent: 'Africa', flag: '🇿🇼', capital: 'Harare', coordinates: [29.1549, -19.0154] },
  { code: 'BI', code3: 'BDI', numericId: '108', name: 'Burundi', continent: 'Africa', flag: '🇧🇮', capital: 'Gitega', coordinates: [29.9189, -3.3822] },
  { code: 'SZ', code3: 'SWZ', numericId: '748', name: 'Eswatini', continent: 'Africa', flag: '🇸🇿', capital: 'Mbabane', coordinates: [31.4659, -26.5225] },
  { code: 'LS', code3: 'LSO', numericId: '426', name: 'Lesotho', continent: 'Africa', flag: '🇱🇸', capital: 'Maseru', coordinates: [28.2336, -29.61] },
  { code: 'BY', code3: 'BLR', numericId: '112', name: 'Belarus', continent: 'Europe', flag: '🇧🇾', capital: 'Minsk', coordinates: [27.9534, 53.7098] },
  { code: 'KP', code3: 'PRK', numericId: '408', name: 'North Korea', continent: 'Asia', flag: '🇰🇵', capital: 'Pyongyang', coordinates: [127.5101, 40.3399] },
  { code: 'BN', code3: 'BRN', numericId: '096', name: 'Brunei', continent: 'Asia', flag: '🇧🇳', capital: 'Bandar Seri Begawan', coordinates: [114.7277, 4.5353] },
  { code: 'TL', code3: 'TLS', numericId: '626', name: 'Timor-Leste', continent: 'Asia', flag: '🇹🇱', capital: 'Dili', coordinates: [125.7275, -8.8742] },
  { code: 'PG', code3: 'PNG', numericId: '598', name: 'Papua New Guinea', continent: 'Oceania', flag: '🇵🇬', capital: 'Port Moresby', coordinates: [147.1803, -6.315] },
  { code: 'SB', code3: 'SLB', numericId: '090', name: 'Solomon Islands', continent: 'Oceania', flag: '🇸🇧', capital: 'Honiara', coordinates: [160.1562, -9.6457] },
  { code: 'HT', code3: 'HTI', numericId: '332', name: 'Haiti', continent: 'North America', flag: '🇭🇹', capital: 'Port-au-Prince', coordinates: [-72.2852, 18.9712] },
  { code: 'NI', code3: 'NIC', numericId: '558', name: 'Nicaragua', continent: 'North America', flag: '🇳🇮', capital: 'Managua', coordinates: [-85.2072, 12.8654] },
  { code: 'HN', code3: 'HND', numericId: '340', name: 'Honduras', continent: 'North America', flag: '🇭🇳', capital: 'Tegucigalpa', coordinates: [-86.2419, 15.1999] },
  { code: 'SV', code3: 'SLV', numericId: '222', name: 'El Salvador', continent: 'North America', flag: '🇸🇻', capital: 'San Salvador', coordinates: [-88.8965, 13.7942] },
  { code: 'TT', code3: 'TTO', numericId: '780', name: 'Trinidad and Tobago', continent: 'North America', flag: '🇹🇹', capital: 'Port of Spain', coordinates: [-61.2225, 10.6918] },
  { code: 'VE', code3: 'VEN', numericId: '862', name: 'Venezuela', continent: 'South America', flag: '🇻🇪', capital: 'Caracas', coordinates: [-66.5897, 6.4238] },
  { code: 'GY', code3: 'GUY', numericId: '328', name: 'Guyana', continent: 'South America', flag: '🇬🇾', capital: 'Georgetown', coordinates: [-58.9302, 4.8604] },
  { code: 'SR', code3: 'SUR', numericId: '740', name: 'Suriname', continent: 'South America', flag: '🇸🇷', capital: 'Paramaribo', coordinates: [-56.0278, 3.9193] },
];

export const CONTINENTS: Continent[] = [
  'Europe',
  'Asia',
  'North America',
  'South America',
  'Africa',
  'Oceania'
];

export const TOTAL_WORLD_SOVEREIGN_COUNTRIES = 195;

export const COUNTRY_BY_CODE = new Map<string, CountryInfo>();
export const COUNTRY_BY_NUMERIC = new Map<string, CountryInfo>();
export const COUNTRY_BY_NAME = new Map<string, CountryInfo>();

COUNTRIES_DATA.forEach(c => {
  COUNTRY_BY_CODE.set(c.code.toUpperCase(), c);
  COUNTRY_BY_CODE.set(c.code3.toUpperCase(), c);
  
  // Also register numeric ID padded and unpadded
  const numInt = parseInt(c.numericId, 10);
  COUNTRY_BY_NUMERIC.set(c.numericId, c);
  COUNTRY_BY_NUMERIC.set(String(numInt), c);
  COUNTRY_BY_NUMERIC.set(String(numInt).padStart(3, '0'), c);

  COUNTRY_BY_NAME.set(c.name.toLowerCase(), c);
});

export function findCountry(query: string | number | undefined): CountryInfo | undefined {
  if (!query) return undefined;
  const str = String(query).trim();
  if (COUNTRY_BY_CODE.has(str.toUpperCase())) {
    return COUNTRY_BY_CODE.get(str.toUpperCase());
  }
  if (COUNTRY_BY_NUMERIC.has(str)) {
    return COUNTRY_BY_NUMERIC.get(str);
  }
  const padded = str.padStart(3, '0');
  if (COUNTRY_BY_NUMERIC.has(padded)) {
    return COUNTRY_BY_NUMERIC.get(padded);
  }
  if (COUNTRY_BY_NAME.has(str.toLowerCase())) {
    return COUNTRY_BY_NAME.get(str.toLowerCase());
  }
  return undefined;
}
