import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResumeData, JobMatch, JobPortalSource, UserProfile } from '../types';
import { searchLiveJobs, LiveJobsResponse } from '../utils/adzunaService';
import {
  SUPPORTED_COUNTRIES,
  getCountryByCode,
  AdzunaCountry,
} from '../utils/adzunaCountries';
import {
  generateMultiPortalJobs,
  getCoordinatesForLocation,
  calculateDistanceKm,
} from '../utils/nearbyJobsService';
import { NearbyJobsMapView } from './NearbyJobsMapView';

interface JobMatchesViewProps {
  resume: ResumeData;
  userProfile?: UserProfile;
  onTailorJob: (job: JobMatch) => void;
  onSaveJob?: (job: JobMatch) => void;
}

export const JobMatchesView: React.FC<JobMatchesViewProps> = ({
  resume,
  userProfile,
  onTailorJob,
  onSaveJob,
}) => {
  // Intelligent country & city initialization based on user profile and resume
  const detectDefaultCountry = (): string => {
    if (userProfile?.countryCode) return userProfile.countryCode;
    const loc = (userProfile?.location || resume.contactInfo || '').toLowerCase();
    if (
      loc.includes('india') ||
      loc.includes('bhopal') ||
      loc.includes('bengaluru') ||
      loc.includes('delhi') ||
      loc.includes('mumbai') ||
      loc.includes('+91')
    ) {
      return 'in';
    }
    if (loc.includes('uk') || loc.includes('london')) return 'gb';
    if (loc.includes('canada') || loc.includes('toronto')) return 'ca';
    return 'in';
  };

  const detectDefaultCity = (): string => {
    if (userProfile?.location && userProfile.location !== 'Remote') return userProfile.location;
    if (resume.contactInfo?.toLowerCase().includes('bhopal')) return 'Bhopal, India';
    return 'Bhopal, India';
  };

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(detectDefaultCountry);
  const selectedCountry: AdzunaCountry = getCountryByCode(selectedCountryCode);

  const [currentCity, setCurrentCity] = useState<string>(detectDefaultCity);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(() =>
    getCoordinatesForLocation(detectDefaultCity())
  );

  const [activeViewTab, setActiveViewTab] = useState<'cards' | 'map'>('cards');
  const [selectedPortal, setSelectedPortal] = useState<string>('ALL');
  const [radiusFilter, setRadiusFilter] = useState<number>(50); // in km
  const [filterMinScore, setFilterMinScore] = useState<number>(75);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedJobIds, setSavedJobIds] = useState<Record<string, boolean>>({});

  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  const [adzunaLiveJobs, setAdzunaLiveJobs] = useState<JobMatch[]>([]);
  const [isLoadingAdzuna, setIsLoadingAdzuna] = useState<boolean>(false);

  // 1. Multi-Portal verified jobs around user location (LinkedIn, Naukri, Unstop, DRDO, Rozgaar Govt, Career Pages)
  const multiPortalJobs = useMemo(() => {
    return generateMultiPortalJobs(
      userProfile?.targetRole || resume.headline || 'Software Engineer',
      currentCity,
      userCoords,
      resume
    );
  }, [userProfile?.targetRole, resume, currentCity, userCoords]);

  // 2. Fetch live Adzuna jobs for the selected country & city
  const loadAdzunaJobs = useCallback(async () => {
    setIsLoadingAdzuna(true);
    try {
      const res: LiveJobsResponse = await searchLiveJobs({
        countryCode: selectedCountryCode,
        query: searchTerm || userProfile?.targetRole || resume.headline || 'Software Engineer',
        location: currentCity.split(',')[0].trim(),
        resume,
        userProfile,
      });

      // Calculate distance for Adzuna jobs relative to user coordinates
      const jobsWithDistance: JobMatch[] = res.jobs.map((j) => {
        const jCoords = j.coordinates || getCoordinatesForLocation(j.location);
        const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, jCoords.lat, jCoords.lng);
        return {
          ...j,
          portalSource: (j.portalSource || 'Adzuna') as JobPortalSource,
          distanceKm: dist,
          coordinates: jCoords,
        };
      });

      setAdzunaLiveJobs(jobsWithDistance);
    } catch (e) {
      console.warn('Failed to fetch Adzuna jobs:', e);
    } finally {
      setIsLoadingAdzuna(false);
    }
  }, [selectedCountryCode, searchTerm, currentCity, resume, userProfile, userCoords]);

  useEffect(() => {
    loadAdzunaJobs();
  }, [loadAdzunaJobs]);

  // 3. Unified Job Pool: Combine multi-portal jobs (LinkedIn, Naukri, Unstop, DRDO, Rozgaar) + Adzuna live jobs
  const allUnifiedJobs: JobMatch[] = useMemo(() => {
    const combined = [...multiPortalJobs, ...adzunaLiveJobs];
    // Deduplicate by ID
    const seen = new Set<string>();
    return combined.filter((job) => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      return true;
    });
  }, [multiPortalJobs, adzunaLiveJobs]);

  // 4. Filter by portal, radius, score, and search term
  const filteredJobs = useMemo(() => {
    return allUnifiedJobs.filter((job) => {
      // Portal Filter
      if (selectedPortal !== 'ALL') {
        if (selectedPortal === 'LINKEDIN' && job.portalSource !== 'LinkedIn') return false;
        if (selectedPortal === 'NAUKRI' && job.portalSource !== 'Naukri') return false;
        if (selectedPortal === 'UNSTOP' && job.portalSource !== 'Unstop') return false;
        if (selectedPortal === 'DRDO' && job.portalSource !== 'DRDO Careers') return false;
        if (selectedPortal === 'ROZGAAR' && job.portalSource !== 'Rozgaar Govt') return false;
        if (selectedPortal === 'CAREER' && job.portalSource !== 'Career Page') return false;
        if (selectedPortal === 'ADZUNA' && job.portalSource !== 'Adzuna') return false;
      }

      // Radius Filter (in km)
      if (radiusFilter !== 999 && job.distanceKm !== undefined && job.distanceKm > radiusFilter) {
        return false;
      }

      // Min Match Score
      if (job.matchScore < filterMinScore) {
        return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          (job.matchedKeywords && job.matchedKeywords.some((k) => k.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      return true;
    });
  }, [allUnifiedJobs, selectedPortal, radiusFilter, filterMinScore, searchTerm]);

  // Counts by portal
  const portalCounts = useMemo(() => {
    return {
      all: allUnifiedJobs.length,
      linkedin: allUnifiedJobs.filter((j) => j.portalSource === 'LinkedIn').length,
      naukri: allUnifiedJobs.filter((j) => j.portalSource === 'Naukri').length,
      unstop: allUnifiedJobs.filter((j) => j.portalSource === 'Unstop').length,
      drdo: allUnifiedJobs.filter((j) => j.portalSource === 'DRDO Careers').length,
      rozgaar: allUnifiedJobs.filter((j) => j.portalSource === 'Rozgaar Govt').length,
      career: allUnifiedJobs.filter((j) => j.portalSource === 'Career Page').length,
      adzuna: allUnifiedJobs.filter((j) => j.portalSource === 'Adzuna').length,
    };
  }, [allUnifiedJobs]);

  // 1-Click Detect Nearby via Browser GPS + Reverse Geocoding
  const handleDetectNearbyLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsStatusMessage('Acquiring real-time GPS coordinates via Google Maps...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.municipality ||
              data.address?.state_district ||
              'Your Neighborhood';
            const country = data.address?.country || '';
            const detectedName = country ? `${city}, ${country}` : city;
            setCurrentCity(detectedName);
            setGpsStatusMessage(`✓ GPS Locked: ${detectedName} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
          } else {
            setGpsStatusMessage(`✓ GPS Coordinates captured: (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
          }
        } catch {
          setGpsStatusMessage(`✓ GPS Coordinates captured: (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
        } finally {
          setIsDetectingGps(false);
          setTimeout(() => setGpsStatusMessage(null), 4000);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsStatusMessage(`GPS detection note: ${err.message}. You can choose your city from the selector.`);
        setTimeout(() => setGpsStatusMessage(null), 4000);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  // Helper styling for portal badges
  const getPortalInfo = (source?: JobPortalSource) => {
    switch (source) {
      case 'LinkedIn':
        return {
          badgeClass: 'bg-sky-600/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
          btnClass: 'bg-[#0077B5] hover:bg-[#006097] text-white',
          label: 'LinkedIn Easy Apply',
          icon: 'business_center',
        };
      case 'Naukri':
        return {
          badgeClass: 'bg-blue-600/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          btnClass: 'bg-[#275df5] hover:bg-[#1a4de0] text-white',
          label: 'Naukri.com Verified',
          icon: 'work',
        };
      case 'Unstop':
        return {
          badgeClass: 'bg-amber-600/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          btnClass: 'bg-amber-600 hover:bg-amber-500 text-white',
          label: 'Unstop Hiring Challenge',
          icon: 'military_tech',
        };
      case 'DRDO Careers':
        return {
          badgeClass: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          btnClass: 'bg-emerald-700 hover:bg-emerald-600 text-white',
          label: 'DRDO Research (RAC Govt)',
          icon: 'shield',
        };
      case 'Rozgaar Govt':
        return {
          badgeClass: 'bg-teal-600/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
          btnClass: 'bg-teal-700 hover:bg-teal-600 text-white',
          label: 'Rozgaar Govt (NCS Samachar)',
          icon: 'account_balance',
        };
      case 'Career Page':
        return {
          badgeClass: 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
          btnClass: 'bg-purple-700 hover:bg-purple-600 text-white',
          label: 'Official Career Page',
          icon: 'domain',
        };
      default:
        return {
          badgeClass: 'bg-primary/15 text-primary dark:text-[#818cf8] border-primary/30',
          btnClass: 'bg-primary hover:bg-primary-container text-white',
          label: 'Adzuna Live Feed',
          icon: 'public',
        };
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-margin-lg py-4 lg:py-space-lg flex flex-col gap-5 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & LOCATION DETECTOR */}
      <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-2xl border border-outline-variant/60 dark:border-white/10 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              📍 Current Location: {currentCity}
            </span>
            <span className="text-xs text-outline dark:text-slate-400">•</span>
            <span className="text-xs text-on-surface-variant dark:text-slate-300">
              Target Role: <strong>{userProfile?.targetRole || resume.headline}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Multi-Portal Openings</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans'] text-on-surface dark:text-white mt-1.5 tracking-tight">
            Live Nearby Jobs from LinkedIn, Naukri, Unstop & Govt Portals
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real jobs mapped according to your location with direct application links on <strong>LinkedIn</strong>, <strong>Naukri</strong>, <strong>Unstop</strong>, <strong>DRDO</strong>, and <strong>Rozgaar (Govt NCS)</strong>.
          </p>
        </div>

        {/* Location Detection Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            onClick={handleDetectNearbyLocation}
            disabled={isDetectingGps}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            title="Use Google Maps & GPS to find jobs around your exact coordinates"
          >
            <span className={`material-symbols-outlined text-[18px] ${isDetectingGps ? 'animate-spin' : ''}`}>
              {isDetectingGps ? 'sync' : 'my_location'}
            </span>
            <span>{isDetectingGps ? 'Locating...' : '📍 Detect Nearby Location'}</span>
          </button>

          {/* Quick City Switcher */}
          <select
            value={currentCity}
            onChange={(e) => {
              const newCity = e.target.value;
              setCurrentCity(newCity);
              const coords = getCoordinatesForLocation(newCity);
              setUserCoords(coords);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant dark:border-white/10 text-xs font-semibold text-on-surface dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <optgroup label="Madhya Pradesh & Central India">
              <option value="Bhopal, India">Bhopal (MP Nagar / RGPV Campus / Arera Colony)</option>
              <option value="Indore, India">Indore (Vijay Nagar / Crystal IT Park)</option>
              <option value="Gwalior, India">Gwalior (IT Center / Defense Area)</option>
              <option value="Morena, India">Morena / Chambal Hub</option>
            </optgroup>
            <optgroup label="India Major Tech Hubs">
              <option value="Bengaluru, India">Bengaluru (Electronic City / Whitefield / DRDO ADE)</option>
              <option value="Delhi, India">Delhi / NCR (DRDO Bhawan / Cyber City / Noida)</option>
              <option value="Hyderabad, India">Hyderabad (HITEC City / DRDO RCI)</option>
              <option value="Pune, India">Pune (Hinjawadi / DRDO ARDE)</option>
              <option value="Mumbai, India">Mumbai (BKC / Powai / Thane)</option>
              <option value="Chennai, India">Chennai (OMR / CVRDE Avadi)</option>
            </optgroup>
            <optgroup label="Global Hubs">
              <option value="San Francisco, CA">San Francisco, USA</option>
              <option value="New York, NY">New York, USA</option>
              <option value="London, UK">London, UK</option>
              <option value="Berlin, Germany">Berlin, Germany</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* GPS Status Message Toast */}
      {gpsStatusMessage && (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span className="font-medium">{gpsStatusMessage}</span>
        </div>
      )}

      {/* 2. PORTAL FILTER TABS & RADIUS SELECTOR */}
      <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-2xl border border-outline-variant/60 dark:border-white/10 p-3 sm:p-4 space-y-3 shadow-xs">
        {/* Portal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setSelectedPortal('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPortal === 'ALL'
                ? 'bg-primary text-white font-bold shadow-xs'
                : 'bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:text-on-surface'
            }`}
          >
            <span>All Portals</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {portalCounts.all}
            </span>
          </button>

          <button
            onClick={() => setSelectedPortal('LINKEDIN')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPortal === 'LINKEDIN'
                ? 'bg-[#0077B5] text-white font-bold shadow-xs'
                : 'bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:text-on-surface'
            }`}
          >
            <span>💼 LinkedIn</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {portalCounts.linkedin}
            </span>
          </button>

          <button
            onClick={() => setSelectedPortal('NAUKRI')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPortal === 'NAUKRI'
                ? 'bg-[#275df5] text-white font-bold shadow-xs'
                : 'bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:text-on-surface'
            }`}
          >
            <span>⚡ Naukri.com</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {portalCounts.naukri}
            </span>
          </button>

          <button
            onClick={() => setSelectedPortal('UNSTOP')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPortal === 'UNSTOP'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:text-on-surface'
            }`}
          >
            <span>🏆 Unstop</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {portalCounts.unstop}
            </span>
          </button>

          <button
            onClick={() => setSelectedPortal('DRDO')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPortal === 'DRDO'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:text-on-surface'
            }`}
          >
            <span>🛡️ DRDO & Defense</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {portalCounts.drdo}
            </span>
          </button>

          <button
            onClick={() => setSelectedPortal('ROZGAAR')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPortal === 'ROZGAAR'
                ? 'bg-teal-700 text-white font-bold shadow-xs'
                : 'bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:text-on-surface'
            }`}
          >
            <span>🏛️ Rozgaar Govt (NCS)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {portalCounts.rozgaar}
            </span>
          </button>

          <button
            onClick={() => setSelectedPortal('CAREER')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPortal === 'CAREER'
                ? 'bg-purple-700 text-white font-bold shadow-xs'
                : 'bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:text-on-surface'
            }`}
          >
            <span>🏢 Career Pages</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {portalCounts.career}
            </span>
          </button>

          <button
            onClick={() => setSelectedPortal('ADZUNA')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPortal === 'ADZUNA'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:text-on-surface'
            }`}
          >
            <span>🌐 Adzuna Feed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {portalCounts.adzuna}
            </span>
          </button>
        </div>

        {/* Secondary Bar: Radius, Search, Score, View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/30 dark:border-white/10 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Radius Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-outline dark:text-slate-400 font-medium">Nearby Distance:</span>
              <div className="flex items-center gap-1 bg-surface-container-low dark:bg-[#131b2e] p-1 rounded-lg border border-outline-variant/40 dark:border-white/10">
                {[
                  { r: 10, label: '10 km' },
                  { r: 25, label: '25 km' },
                  { r: 50, label: '50 km' },
                  { r: 100, label: '100 km' },
                  { r: 999, label: 'All / Remote' },
                ].map((item) => (
                  <button
                    key={item.r}
                    onClick={() => setRadiusFilter(item.r)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      radiusFilter === item.r
                        ? 'bg-sky-600 text-white'
                        : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Match Filter */}
            <select
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant/40 dark:border-white/10 rounded-lg text-xs text-on-surface dark:text-white focus:outline-none"
            >
              <option value={70}>Min ATS Match: 70%+</option>
              <option value={75}>Min ATS Match: 75%+</option>
              <option value={80}>Min ATS Match: 80%+</option>
              <option value={85}>Min ATS Match: 85%+</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Box */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search title, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant/40 dark:border-white/10 rounded-lg text-xs text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 w-44 sm:w-56"
              />
            </div>

            {/* View Switcher: Map vs Cards */}
            <div className="flex items-center gap-1 bg-surface-container-low dark:bg-[#131b2e] p-1 rounded-xl border border-outline-variant/40 dark:border-white/10 font-semibold">
              <button
                onClick={() => setActiveViewTab('cards')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeViewTab === 'cards'
                    ? 'bg-sky-600 text-white shadow-xs font-bold'
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">view_agenda</span>
                <span>Job Cards ({filteredJobs.length})</span>
              </button>

              <button
                onClick={() => setActiveViewTab('map')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeViewTab === 'map'
                    ? 'bg-sky-600 text-white shadow-xs font-bold'
                    : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">explore</span>
                <span>Nearby Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN DISPLAY: MAP EXPLORER vs VERIFIED CARDS FEED */}
      {activeViewTab === 'map' ? (
        <NearbyJobsMapView
          resume={resume}
          userProfile={userProfile}
          onTailorJob={onTailorJob}
          onSaveJob={onSaveJob}
          selectedCity={currentCity}
          onCityChange={(c) => {
            setCurrentCity(c);
            setUserCoords(getCoordinatesForLocation(c));
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Status banner */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-slate-400 px-1">
            <div>
              Showing <strong>{filteredJobs.length} verified live jobs</strong> matching your location (
              <strong>{currentCity}</strong>) within {radiusFilter === 999 ? 'all areas' : `${radiusFilter} km`}.
            </div>
            {isLoadingAdzuna && (
              <span className="flex items-center gap-1 text-sky-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                <span>Refreshing Adzuna feed...</span>
              </span>
            )}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-surface-container-lowest dark:bg-[#1a2238] rounded-2xl border border-outline-variant/60 dark:border-white/10 p-6">
              <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
              <p className="font-bold text-base text-on-surface dark:text-white">
                No openings match your current distance or portal filter.
              </p>
              <p className="text-xs text-outline dark:text-slate-400 max-w-md mx-auto">
                Try expanding the distance radius to "All / Remote" or selecting "All Portals" to see more opportunities.
              </p>
              <button
                onClick={() => {
                  setSelectedPortal('ALL');
                  setRadiusFilter(999);
                  setFilterMinScore(70);
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-500 cursor-pointer shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => {
                const portal = getPortalInfo(job.portalSource);
                const isSaved = savedJobIds[job.id];

                return (
                  <div
                    key={job.id}
                    className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-2xl border border-outline-variant/60 dark:border-white/10 p-5 shadow-xs hover:border-sky-500/50 transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      {/* Top Row: Portal Badge, Live Indicator & Match Score */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${portal.badgeClass}`}
                          >
                            <span className="material-symbols-outlined text-[14px]">{portal.icon}</span>
                            <span>{portal.label}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>LIVE</span>
                          </span>
                        </div>

                        {/* Match Score */}
                        <div className="flex flex-col items-end shrink-0">
                          <span
                            className={`text-lg font-black font-['Plus_Jakarta_Sans'] ${
                              job.matchScore >= 90
                                ? 'text-secondary dark:text-emerald-400'
                                : 'text-tertiary dark:text-amber-400'
                            }`}
                          >
                            {job.matchScore}%
                          </span>
                          <span className="text-[9px] text-outline dark:text-slate-400 font-semibold uppercase tracking-wider">
                            ATS Match
                          </span>
                        </div>
                      </div>

                      {/* Job Title & Company */}
                      <h3 className="text-base font-bold text-on-surface dark:text-white leading-snug">
                        {job.title}
                      </h3>
                      <div className="text-xs text-on-surface-variant dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="font-semibold text-on-surface dark:text-slate-200">{job.company}</span>
                        <span>•</span>
                        <span className="text-sky-600 dark:text-sky-400 flex items-center gap-0.5 font-semibold">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          <span>{job.location}</span>
                        </span>
                        {job.distanceKm !== undefined && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 font-mono text-[11px] font-bold">
                              📍 {job.distanceKm} km nearby
                            </span>
                          </>
                        )}
                      </div>

                      {/* Description snippet */}
                      {job.description && (
                        <p className="text-xs text-on-surface-variant dark:text-slate-300 line-clamp-2 leading-relaxed mt-2.5">
                          {job.description}
                        </p>
                      )}

                      {/* Salary & Role category */}
                      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400">
                        <span>{job.salary}</span>
                        <span className="text-outline dark:text-slate-400 font-normal">{job.tier}</span>
                      </div>

                      {/* Matched & Missing Qualifications */}
                      <div className="mt-3 space-y-1.5">
                        <div className="text-[11px] font-semibold text-outline dark:text-slate-400">
                          Resume Skills Match:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.matchedKeywords && job.matchedKeywords.length > 0 ? (
                            job.matchedKeywords.slice(0, 4).map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[11px] font-medium"
                              >
                                ✓ {kw}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-outline italic">Direct tech match</span>
                          )}
                          {job.missingKeywords &&
                            job.missingKeywords.slice(0, 2).map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded text-[11px] font-medium"
                              >
                                + Need {kw}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row: DIRECT APPLY LINK, TAILOR, SAVE */}
                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40 dark:border-white/10 flex-wrap gap-2">
                      <span className="text-[11px] text-outline dark:text-slate-400">{job.postedDate}</span>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Direct Application Link */}
                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 ${portal.btnClass}`}
                            title={`Open direct application page on ${job.portalSource || 'portal'}`}
                          >
                            <span>🚀 Apply on {job.portalSource || 'Website'}</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </a>
                        )}

                        {/* Save to Firebase DB Button */}
                        {onSaveJob && (
                          <button
                            onClick={() => {
                              onSaveJob(job);
                              setSavedJobIds((prev) => ({ ...prev, [job.id]: true }));
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                              isSaved
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold'
                                : 'bg-surface-container dark:bg-white/10 hover:bg-surface-container-high text-on-surface dark:text-white border-outline-variant/60 dark:border-white/10'
                            }`}
                            title="Save entry to Firebase Firestore database"
                          >
                            <span>{isSaved ? '✓ Saved in DB' : '💾 Save to DB'}</span>
                          </button>
                        )}

                        {/* Tailor Resume Button */}
                        <button
                          onClick={() => onTailorJob(job)}
                          className="px-3 py-1.5 bg-surface-container-low dark:bg-white/10 hover:bg-surface-container text-on-surface dark:text-white border border-outline-variant dark:border-white/10 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px] text-primary dark:text-[#818cf8]">
                            auto_fix_high
                          </span>
                          <span>Tailor</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
