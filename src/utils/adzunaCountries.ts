export interface AdzunaCountry {
  code: string;
  name: string;
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  popularCities: string[];
}

export const SUPPORTED_COUNTRIES: AdzunaCountry[] = [
  {
    code: 'us',
    name: 'United States',
    flag: '🇺🇸',
    currencySymbol: '$',
    currencyCode: 'USD',
    popularCities: [
      'San Francisco, CA',
      'New York, NY',
      'Seattle, WA',
      'Austin, TX',
      'Boston, MA',
      'Chicago, IL',
      'Los Angeles, CA',
      'Remote (US)',
    ],
  },
  {
    code: 'in',
    name: 'India',
    flag: '🇮🇳',
    currencySymbol: '₹',
    currencyCode: 'INR',
    popularCities: [
      'Bengaluru, Karnataka',
      'Hyderabad, Telangana',
      'Pune, Maharashtra',
      'Mumbai, Maharashtra',
      'Delhi NCR / Gurgaon / Noida',
      'Chennai, Tamil Nadu',
      'Remote (India)',
    ],
  },
  {
    code: 'gb',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currencySymbol: '£',
    currencyCode: 'GBP',
    popularCities: [
      'London',
      'Manchester',
      'Birmingham',
      'Edinburgh',
      'Bristol',
      'Cambridge',
      'Remote (UK)',
    ],
  },
  {
    code: 'ca',
    name: 'Canada',
    flag: '🇨🇦',
    currencySymbol: 'C$',
    currencyCode: 'CAD',
    popularCities: [
      'Toronto, ON',
      'Vancouver, BC',
      'Montreal, QC',
      'Ottawa, ON',
      'Waterloo, ON',
      'Calgary, AB',
      'Remote (Canada)',
    ],
  },
  {
    code: 'au',
    name: 'Australia',
    flag: '🇦🇺',
    currencySymbol: 'A$',
    currencyCode: 'AUD',
    popularCities: [
      'Sydney, NSW',
      'Melbourne, VIC',
      'Brisbane, QLD',
      'Perth, WA',
      'Adelaide, SA',
      'Remote (Australia)',
    ],
  },
  {
    code: 'de',
    name: 'Germany',
    flag: '🇩🇪',
    currencySymbol: '€',
    currencyCode: 'EUR',
    popularCities: [
      'Berlin',
      'Munich',
      'Frankfurt',
      'Hamburg',
      'Cologne',
      'Stuttgart',
      'Remote (Germany)',
    ],
  },
  {
    code: 'fr',
    name: 'France',
    flag: '🇫🇷',
    currencySymbol: '€',
    currencyCode: 'EUR',
    popularCities: [
      'Paris',
      'Lyon',
      'Toulouse',
      'Nantes',
      'Bordeaux',
      'Remote (France)',
    ],
  },
  {
    code: 'nl',
    name: 'Netherlands',
    flag: '🇳🇱',
    currencySymbol: '€',
    currencyCode: 'EUR',
    popularCities: [
      'Amsterdam',
      'Rotterdam',
      'Utrecht',
      'Eindhoven',
      'The Hague',
      'Remote (Netherlands)',
    ],
  },
  {
    code: 'br',
    name: 'Brazil',
    flag: '🇧🇷',
    currencySymbol: 'R$',
    currencyCode: 'BRL',
    popularCities: [
      'São Paulo',
      'Rio de Janeiro',
      'Curitiba',
      'Belo Horizonte',
      'Florianópolis',
      'Remote (Brazil)',
    ],
  },
  {
    code: 'it',
    name: 'Italy',
    flag: '🇮🇹',
    currencySymbol: '€',
    currencyCode: 'EUR',
    popularCities: [
      'Milan',
      'Rome',
      'Turin',
      'Bologna',
      'Remote (Italy)',
    ],
  },
  {
    code: 'es',
    name: 'Spain',
    flag: '🇪🇸',
    currencySymbol: '€',
    currencyCode: 'EUR',
    popularCities: [
      'Madrid',
      'Barcelona',
      'Valencia',
      'Malaga',
      'Remote (Spain)',
    ],
  },
  {
    code: 'pl',
    name: 'Poland',
    flag: '🇵🇱',
    currencySymbol: 'zł',
    currencyCode: 'PLN',
    popularCities: [
      'Warsaw',
      'Krakow',
      'Wroclaw',
      'Gdansk',
      'Remote (Poland)',
    ],
  },
  {
    code: 'za',
    name: 'South Africa',
    flag: '🇿🇦',
    currencySymbol: 'R',
    currencyCode: 'ZAR',
    popularCities: [
      'Cape Town',
      'Johannesburg',
      'Durban',
      'Pretoria',
      'Remote (South Africa)',
    ],
  },
  {
    code: 'sg',
    name: 'Singapore',
    flag: '🇸🇬',
    currencySymbol: 'S$',
    currencyCode: 'SGD',
    popularCities: [
      'Central Area, Singapore',
      'Jurong, Singapore',
      'Changi, Singapore',
      'Remote (Singapore)',
    ],
  },
  {
    code: 'nz',
    name: 'New Zealand',
    flag: '🇳🇿',
    currencySymbol: 'NZ$',
    currencyCode: 'NZD',
    popularCities: [
      'Auckland',
      'Wellington',
      'Christchurch',
      'Remote (New Zealand)',
    ],
  },
  {
    code: 'ch',
    name: 'Switzerland',
    flag: '🇨🇭',
    currencySymbol: 'CHF',
    currencyCode: 'CHF',
    popularCities: [
      'Zurich',
      'Geneva',
      'Basel',
      'Lausanne',
      'Bern',
      'Remote (Switzerland)',
    ],
  },
  {
    code: 'at',
    name: 'Austria',
    flag: '🇦🇹',
    currencySymbol: '€',
    currencyCode: 'EUR',
    popularCities: [
      'Vienna',
      'Salzburg',
      'Graz',
      'Linz',
      'Remote (Austria)',
    ],
  },
  {
    code: 'be',
    name: 'Belgium',
    flag: '🇧🇪',
    currencySymbol: '€',
    currencyCode: 'EUR',
    popularCities: [
      'Brussels',
      'Antwerp',
      'Ghent',
      'Leuven',
      'Remote (Belgium)',
    ],
  },
  {
    code: 'mx',
    name: 'Mexico',
    flag: '🇲🇽',
    currencySymbol: 'Mex$',
    currencyCode: 'MXN',
    popularCities: [
      'Mexico City',
      'Guadalajara',
      'Monterrey',
      'Remote (Mexico)',
    ],
  },
];

export function getCountryByCode(code?: string): AdzunaCountry {
  if (!code) return SUPPORTED_COUNTRIES[0];
  const normalized = code.toLowerCase().trim();
  const match = SUPPORTED_COUNTRIES.find((c) => c.code === normalized);
  return match || SUPPORTED_COUNTRIES[0];
}

export function getCountryByName(name?: string): AdzunaCountry {
  if (!name) return SUPPORTED_COUNTRIES[0];
  const normalized = name.toLowerCase().trim();
  const match = SUPPORTED_COUNTRIES.find(
    (c) => c.name.toLowerCase() === normalized || normalized.includes(c.name.toLowerCase())
  );
  return match || SUPPORTED_COUNTRIES[0];
}
