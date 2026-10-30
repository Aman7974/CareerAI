import React, { useState } from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentSubView: 'diagnostic' | 'live-match';
  setCurrentSubView: (view: 'diagnostic' | 'live-match') => void;
  onQuickScan: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  credits: number;
  onOpenMobileMenu: () => void;
  candidateName: string;
  userProfile?: UserProfile;
  onSignOut?: () => void;
  onOpenLiveDatabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSubView,
  setCurrentSubView,
  onQuickScan,
  searchQuery,
  setSearchQuery,
  credits,
  onOpenMobileMenu,
  candidateName,
  userProfile,
  onSignOut,
  onOpenLiveDatabase,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const displayName = userProfile?.name || candidateName;
  const initial = displayName.trim().charAt(0) || 'U';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-60 h-16 z-30 bg-surface border-b border-outline-variant/60 shadow-xs flex justify-between items-center px-4 sm:px-6 lg:px-margin-lg transition-all duration-200">
      {/* Left Area: Mobile Hamburger + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-sm sm:max-w-md">
        {/* Hamburger on mobile */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Search input with responsive behavior */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-10 sm:pr-12 py-1.5 bg-surface-container-lowest border border-outline-variant/70 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline/70 transition-all"
            placeholder="Search keywords, job descriptions..."
          />
          <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-outline bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/50 select-none">
            ⌘K
          </span>
        </div>
      </div>

      {/* Center Navigation Links: Diagnostic View vs Live Match Scoring */}
      <div className="hidden md:flex items-center gap-4 lg:gap-space-lg mx-2">
        <button
          onClick={() => setCurrentSubView('diagnostic')}
          className={`cursor-pointer pb-1 text-xs lg:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap ${
            currentSubView === 'diagnostic'
              ? 'text-primary font-bold border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          <span>Diagnostic View</span>
        </button>

        <button
          onClick={() => setCurrentSubView('live-match')}
          className={`cursor-pointer pb-1 text-xs lg:text-sm flex items-center gap-1.5 transition-all whitespace-nowrap ${
            currentSubView === 'live-match'
              ? 'text-primary font-bold border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
          <span>Live Match Scoring</span>
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
        </button>
      </div>

      {/* Trailing Actions & User Meta */}
      <div className="flex items-center gap-1.5 sm:gap-space-md ml-2 shrink-0">
        {/* AI Credits Badge */}
        <div className="flex items-center gap-1 bg-primary-fixed/40 border border-primary/30 text-on-primary-fixed-variant px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
          <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-primary">bolt</span>
          <span className="hidden sm:inline tracking-wide">AI Credits: {credits}/250</span>
          <span className="sm:hidden font-mono text-[11px]">{credits}</span>
        </div>

        {/* Firebase Live Real-Time DB Inspector Button */}
        {onOpenLiveDatabase && (
          <button
            onClick={onOpenLiveDatabase}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Inspect Live Firestore Real-Time Entries"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">🔥 Firebase DB</span>
            <span className="sm:hidden font-mono text-[11px]">🔥 DB</span>
          </button>
        )}

        {/* Quick Scan Action */}
        <button
          onClick={onQuickScan}
          className="hidden sm:flex bg-surface-container-lowest hover:bg-surface-container border border-outline-variant text-on-surface px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">flash_on</span>
          <span>Quick Scan</span>
        </button>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="hidden md:flex bg-primary/10 hover:bg-primary/20 text-primary dark:text-[#818cf8] border border-primary/20 px-2.5 py-1.5 rounded-lg text-xs font-semibold items-center gap-1 transition-colors cursor-pointer"
            title="Start from Sign Up page with new profile"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>New Sign Up</span>
          </button>
        )}

        {/* Notification & Help Icons */}
        <div className="relative flex items-center gap-0.5 sm:gap-1 border-l border-outline-variant/60 pl-1.5 sm:pl-3">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHelp(false);
            }}
            className="p-1 sm:p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer relative"
            title="Notifications"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          </button>

          <button
            onClick={() => {
              setShowHelp(!showHelp);
              setShowNotifications(false);
            }}
            className="hidden xs:flex p-1 sm:p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            title="Help Center"
            aria-label="View help information"
          >
            <span className="material-symbols-outlined text-[20px]">help_center</span>
          </button>

          {/* Notifications dropdown popover */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-72 sm:w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                <span className="text-xs font-bold text-on-surface">System Alerts</span>
                <span className="text-[10px] text-primary cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="text-xs p-2 bg-primary-fixed/20 rounded-lg border border-primary/20">
                  <div className="font-semibold text-primary">Real ATS Diagnostic Ready</div>
                  <div className="text-[11px] text-on-surface-variant">Profile indexed for {candidateName} with real keyword metrics.</div>
                </div>
              </div>
            </div>
          )}

          {/* Help popover */}
          {showHelp && (
            <div className="absolute right-0 top-12 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-3.5 z-50">
              <div className="text-xs font-bold text-on-surface mb-1">CareerAI Diagnostics Guide</div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed mb-2">
                Our parser reverse-engineers Workday, Taleo, Greenhouse, and Lever executive screening filters.
              </p>
            </div>
          )}
        </div>

        {/* Profile Avatar / Initial */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2">
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="text-xs font-bold text-on-surface dark:text-white truncate max-w-[120px]">
              {displayName}
            </span>
            <span className="text-[10px] text-outline dark:text-slate-400 truncate max-w-[120px]">
              {userProfile?.targetRole || 'Executive'}
            </span>
          </div>

          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs shadow-xs border border-primary/40 shrink-0">
            {initial}
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
