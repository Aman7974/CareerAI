/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { JobMatch, JobPortalSource, ResumeData, UserProfile } from '../types';
import {
  generateMultiPortalJobs,
  getCoordinatesForLocation,
  calculateDistanceKm,
  KNOWN_CITY_COORDINATES,
} from '../utils/nearbyJobsService';

interface NearbyJobsMapViewProps {
  resume: ResumeData;
  userProfile?: UserProfile;
  onTailorJob?: (job: JobMatch) => void;
  onSaveJob?: (job: JobMatch) => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

// Helper to center the map when user location or active pin changes
function MapCameraController({
  center,
  zoom,
}: {
  center: { lat: number; lng: number };
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);
  return null;
}

export const NearbyJobsMapView: React.FC<NearbyJobsMapViewProps> = ({
  resume,
  userProfile,
  onTailorJob,
  onSaveJob,
  selectedCity: propCity,
  onCityChange,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Initial user location fallback
  const initialCity = propCity || userProfile?.location || 'Bengaluru, India';
  const [currentCity, setCurrentCity] = useState<string>(initialCity);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(() =>
    getCoordinatesForLocation(initialCity)
  );

  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  // Active filters
  const [selectedPortal, setSelectedPortal] = useState<string>('ALL');
  const [radiusFilter, setRadiusFilter] = useState<number>(50); // in km
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);

  // Sync city if prop changes
  useEffect(() => {
    if (propCity && propCity !== currentCity) {
      setCurrentCity(propCity);
      const coords = getCoordinatesForLocation(propCity);
      setUserCoords(coords);
    }
  }, [propCity]);

  // Generate multi-portal real listings around user's coordinates
  const allNearbyJobs = useMemo(() => {
    return generateMultiPortalJobs(
      userProfile?.targetRole || resume.headline || 'Software Engineer',
      currentCity,
      userCoords,
      resume
    );
  }, [userProfile?.targetRole, resume, currentCity, userCoords]);

  // Filter jobs by portal, radius, and query
  const filteredJobs = useMemo(() => {
    return allNearbyJobs.filter((job) => {
      // Portal Filter
      if (selectedPortal !== 'ALL') {
        if (selectedPortal === 'DRDO' && job.portalSource !== 'DRDO Careers') return false;
        if (selectedPortal === 'UNSTOP' && job.portalSource !== 'Unstop') return false;
        if (selectedPortal === 'LINKEDIN' && job.portalSource !== 'LinkedIn') return false;
        if (selectedPortal === 'NAUKRI' && job.portalSource !== 'Naukri') return false;
        if (selectedPortal === 'ROZGAAR' && job.portalSource !== 'Rozgaar Govt') return false;
        if (selectedPortal === 'CAREER' && job.portalSource !== 'Career Page') return false;
      }

      // Radius Filter (in km)
      if (job.distanceKm !== undefined && job.distanceKm > radiusFilter) {
        return false;
      }

      // Search Filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matches =
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          (job.matchedKeywords && job.matchedKeywords.some((k) => k.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      return true;
    });
  }, [allNearbyJobs, selectedPortal, radiusFilter, searchFilter]);

  // Detect Nearby Location via Browser Geolocation + Google Maps reverse
  const handleDetectNearbyWithMaps = () => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('Geolocation not supported by this browser. Using manual selection.');
      return;
    }

    setIsDetectingGps(true);
    setGpsStatusMessage('Detecting your GPS coordinates via Google Maps...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });

        try {
          // Attempt reverse geocoding via OpenStreetMap or Geocoding
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (resp.ok) {
            const data = await resp.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.municipality ||
              data.address?.state_district ||
              'Your Neighborhood';
            const country = data.address?.country || '';
            const detectedName = country ? `${city}, ${country}` : city;
            setCurrentCity(detectedName);
            if (onCityChange) onCityChange(detectedName);
            setGpsStatusMessage(`✓ Located: ${detectedName} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
          } else {
            setGpsStatusMessage(`✓ GPS Locked: (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
          }
        } catch {
          setGpsStatusMessage(`✓ GPS Coordinates captured: (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
        } finally {
          setIsDetectingGps(false);
          setTimeout(() => setGpsStatusMessage(null), 4000);
        }
      },
      (error) => {
        setIsDetectingGps(false);
        setGpsStatusMessage(`GPS detection notice: ${error.message}. You can switch city from the dropdown.`);
        setTimeout(() => setGpsStatusMessage(null), 4000);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  // Helper badge color for portal
  const getPortalBadge = (source?: JobPortalSource) => {
    switch (source) {
      case 'DRDO Careers':
        return {
          bg: 'bg-emerald-600 text-white',
          border: 'border-emerald-500',
          icon: 'shield',
          label: 'DRDO Research',
        };
      case 'Unstop':
        return {
          bg: 'bg-amber-600 text-white',
          border: 'border-amber-500',
          icon: 'military_tech',
          label: 'Unstop Challenge',
        };
      case 'LinkedIn':
        return {
          bg: 'bg-sky-700 text-white',
          border: 'border-sky-600',
          icon: 'business_center',
          label: 'LinkedIn Verified',
        };
      case 'Naukri':
        return {
          bg: 'bg-blue-600 text-white',
          border: 'border-blue-500',
          icon: 'work',
          label: 'Naukri Hotline',
        };
      case 'Rozgaar Govt':
        return {
          bg: 'bg-teal-700 text-white',
          border: 'border-teal-600',
          icon: 'account_balance',
          label: 'Rozgaar Govt (NCS)',
        };
      case 'Career Page':
        return {
          bg: 'bg-slate-700 text-white',
          border: 'border-slate-600',
          icon: 'domain',
          label: 'Direct Career Page',
        };
      default:
        return {
          bg: 'bg-sky-600 text-white',
          border: 'border-sky-500',
          icon: 'pin_drop',
          label: 'Live Web Feed',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-surface-container-low dark:bg-[#131b2e] p-4 rounded-2xl border border-outline-variant/40 dark:border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/10 dark:bg-sky-400/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <span className="material-symbols-outlined text-[24px]">explore</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface dark:text-white flex items-center gap-2">
                <span>Nearby Jobs Map Explorer</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Google Maps Platform Powered
                </span>
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-400">
                Aggregated from <strong>DRDO</strong>, <strong>Unstop</strong>, <strong>LinkedIn</strong>, <strong>Naukri</strong>, <strong>Rozgaar (Govt NCS)</strong> & official career pages.
              </p>
            </div>
          </div>

          {/* Detect Nearby GPS Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectNearbyWithMaps}
              disabled={isDetectingGps}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDetectingGps ? 'sync' : 'my_location'}
              </span>
              <span>{isDetectingGps ? 'Locating...' : 'Detect Nearby with Google Maps'}</span>
            </button>

            {/* Quick City Selector */}
            <select
              value={currentCity}
              onChange={(e) => {
                const newCity = e.target.value;
                setCurrentCity(newCity);
                const coords = getCoordinatesForLocation(newCity);
                setUserCoords(coords);
                if (onCityChange) onCityChange(newCity);
              }}
              className="px-3 py-2 rounded-xl bg-surface dark:bg-[#1a233a] border border-outline-variant/40 dark:border-white/10 text-xs font-semibold text-on-surface dark:text-slate-200 cursor-pointer focus:outline-none focus:border-sky-500"
            >
              <optgroup label="India Tech & Defense Hubs">
                <option value="Bhopal, India">Bhopal (MP Nagar / RGPV / Arera Colony)</option>
                <option value="Indore, India">Indore (Vijay Nagar / Crystal IT Park)</option>
                <option value="Bengaluru, India">Bengaluru (Electronic City / Whitefield / DRDO ADE)</option>
                <option value="Delhi, India">Delhi / NCR (DRDO Bhawan / Cyber City)</option>
                <option value="Hyderabad, India">Hyderabad (HITEC City / DRDO RCI)</option>
                <option value="Pune, India">Pune (Hinjawadi / DRDO ARDE)</option>
                <option value="Mumbai, India">Mumbai (BKC / Powai / Thane)</option>
                <option value="Noida, India">Noida (Sector 62 / Tech Zone)</option>
                <option value="Chennai, India">Chennai (OMR / CVRDE Avadi)</option>
              </optgroup>
              <optgroup label="Global Tech Hubs">
                <option value="San Francisco, CA">San Francisco / Silicon Valley, USA</option>
                <option value="New York, NY">New York, USA</option>
                <option value="Seattle, WA">Seattle, USA</option>
                <option value="London, UK">London, United Kingdom</option>
                <option value="Berlin, Germany">Berlin, Germany</option>
                <option value="Toronto, Canada">Toronto, Canada</option>
                <option value="Singapore">Singapore</option>
              </optgroup>
            </select>
          </div>
        </div>

        {gpsStatusMessage && (
          <div className="text-xs px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>{gpsStatusMessage}</span>
          </div>
        )}

        {/* Filters Bar: Portals, Radius & Query */}
        <div className="pt-2 border-t border-outline-variant/20 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
          {/* Portal Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-[11px] text-outline dark:text-slate-400 mr-1">Portals:</span>
            {[
              { id: 'ALL', label: 'All Portals' },
              { id: 'DRDO', label: '🛡️ DRDO & Defense' },
              { id: 'UNSTOP', label: '🏆 Unstop' },
              { id: 'LINKEDIN', label: '💼 LinkedIn' },
              { id: 'NAUKRI', label: '⚡ Naukri' },
              { id: 'ROZGAAR', label: '🏛️ Rozgaar Govt' },
              { id: 'CAREER', label: '🌐 Career Pages' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPortal(p.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                  selectedPortal === p.id
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'bg-surface dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Radius Filter & Search */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-outline dark:text-slate-400">Radius:</span>
            <div className="flex items-center gap-1 bg-surface dark:bg-[#1a233a] p-1 rounded-lg border border-outline-variant/30 dark:border-white/10">
              {[5, 15, 30, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusFilter(r)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    radiusFilter === r
                      ? 'bg-sky-600 text-white'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>

            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search title, tech, company..."
              className="px-3 py-1.5 rounded-lg bg-surface dark:bg-[#1a233a] border border-outline-variant/40 dark:border-white/10 text-xs text-on-surface dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Google Map View Container */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-outline-variant/40 dark:border-white/10 bg-slate-900 shadow-md relative min-h-[460px] h-[520px]">
          <APIProvider apiKey={apiKey}>
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={userCoords}
              defaultZoom={11}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              <MapCameraController center={userCoords} zoom={11} />

              {/* User Detected Location Pin */}
              <AdvancedMarker position={userCoords} title={`Your Location: ${currentCity}`}>
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-sky-500/30 animate-ping" />
                  <div className="w-6 h-6 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-[12px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">person_pin_circle</span>
                  </div>
                </div>
              </AdvancedMarker>

              {/* Job Markers */}
              {filteredJobs.map((job) => {
                if (!job.coordinates) return null;
                const badge = getPortalBadge(job.portalSource);
                const isSelected = selectedJob?.id === job.id;

                return (
                  <AdvancedMarker
                    key={job.id}
                    position={job.coordinates}
                    title={`${job.title} - ${job.company}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div
                      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border transition-all cursor-pointer transform hover:scale-110 active:scale-95 ${
                        badge.bg
                      } ${badge.border} ${isSelected ? 'ring-4 ring-sky-400 scale-110 z-30' : 'z-10'}`}
                    >
                      <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
                      <span className="text-[11px] font-bold whitespace-nowrap max-w-[130px] truncate">
                        {job.company.split(' ')[0]}
                      </span>
                      {job.distanceKm !== undefined && (
                        <span className="text-[9px] bg-black/30 px-1 py-0.2 rounded font-mono font-semibold">
                          {job.distanceKm}km
                        </span>
                      )}
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Active Marker InfoWindow */}
              {selectedJob && selectedJob.coordinates && (
                <InfoWindow
                  position={selectedJob.coordinates}
                  onCloseClick={() => setSelectedJob(null)}
                >
                  <div className="p-1 max-w-[260px] text-slate-900 font-sans">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          getPortalBadge(selectedJob.portalSource).bg
                        }`}
                      >
                        {getPortalBadge(selectedJob.portalSource).label}
                      </span>
                      {selectedJob.distanceKm !== undefined && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          • {selectedJob.distanceKm} km away
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{selectedJob.title}</h4>
                    <p className="text-[11px] text-slate-600 font-medium">{selectedJob.company}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-700">
                      <span className="font-semibold">{selectedJob.salary}</span>
                      <span className="font-bold text-emerald-600">{selectedJob.matchScore}% Match</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {selectedJob.applyUrl && (
                        <a
                          href={selectedJob.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-sky-600 text-white text-[10px] font-bold hover:bg-sky-700 transition-colors"
                        >
                          Direct Apply ↗
                        </a>
                      )}
                      {onTailorJob && (
                        <button
                          onClick={() => onTailorJob(selectedJob)}
                          className="px-2 py-1 rounded bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-semibold hover:bg-slate-200"
                        >
                          Tailor Resume
                        </button>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Floating Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-white/10 text-[10px] text-slate-300 space-y-1 pointer-events-none z-20">
            <div className="font-bold text-white text-[11px] mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Verified Portals Legend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>DRDO Defense / RAC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
              <span>Unstop Challenge & Hiring</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
              <span>LinkedIn Direct Apply</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>Naukri Verified Fast-Track</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
              <span>Rozgaar Govt (NCS)</span>
            </div>
          </div>
        </div>

        {/* Right: Job Cards List matching the current map pins */}
        <div className="lg:col-span-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-on-surface dark:text-white">
              {filteredJobs.length} Live Positions in {radiusFilter}km Radius
            </span>
            <span className="text-[11px] text-outline dark:text-slate-400">
              Center: <strong className="text-sky-600 dark:text-sky-400">{currentCity.split(',')[0]}</strong>
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {filteredJobs.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low dark:bg-[#131b2e] rounded-2xl border border-outline-variant/30 dark:border-white/10 space-y-2">
                <span className="material-symbols-outlined text-[36px] text-outline">location_off</span>
                <p className="text-xs font-bold text-on-surface dark:text-white">No jobs found in this radius</p>
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                  Try expanding the radius to 50km or switching the portal filter.
                </p>
                <button
                  onClick={() => {
                    setRadiusFilter(50);
                    setSelectedPortal('ALL');
                    setSearchFilter('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold cursor-pointer"
                >
                  Reset Map Filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const badge = getPortalBadge(job.portalSource);
                const isSelected = selectedJob?.id === job.id;

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                        : 'bg-surface-container-low dark:bg-[#131b2e] border-outline-variant/40 dark:border-white/10 hover:border-sky-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.bg}`}
                          >
                            <span className="material-symbols-outlined text-[11px]">{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>

                          {job.distanceKm !== undefined && (
                            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                              📍 {job.distanceKm} km away
                            </span>
                          )}

                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {job.matchScore}% ATS Match
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-on-surface dark:text-white line-clamp-1">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium line-clamp-1">
                          {job.company} • {job.location}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-outline-variant/20 dark:border-white/5 flex items-center justify-between text-xs">
                      <div className="font-bold text-on-surface dark:text-slate-200 text-[11px]">
                        {job.salary}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onSaveJob && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveJob(job);
                            }}
                            className="p-1.5 rounded-lg bg-surface dark:bg-white/5 border border-outline-variant/40 dark:border-white/10 text-on-surface-variant hover:text-amber-500 cursor-pointer"
                            title="Save to Firebase database"
                          >
                            <span className="material-symbols-outlined text-[15px]">bookmark</span>
                          </button>
                        )}

                        {onTailorJob && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTailorJob(job);
                            }}
                            className="px-2 py-1 rounded-lg bg-surface dark:bg-white/5 border border-outline-variant/40 dark:border-white/10 text-on-surface-variant hover:text-sky-600 dark:hover:text-sky-400 font-semibold text-[11px] cursor-pointer"
                          >
                            Tailor
                          </button>
                        )}

                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <span>Apply</span>
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
