import React from 'react';
import { ResumeData, UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  resume: ResumeData;
  userProfile?: UserProfile;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  isMobileOpen,
  setIsMobileOpen,
  resume,
  userProfile,
  onSignOut,
}) => {
  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const displayName = userProfile?.name || resume.candidateName;
  const candidateDisplayName = displayName
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Persistent Desktop Sidebar & Sliding Mobile Drawer */}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 z-50 bg-inverse-surface border-r border-outline/30 flex flex-col justify-between p-space-md select-none transition-transform duration-200 ease-in-out shadow-xl lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-space-lg">
          {/* Brand & Header */}
          <div className="flex items-center justify-between px-space-xs">
            <div
              className="flex items-center gap-space-sm cursor-pointer"
              onClick={() => handleNavClick('analyzer')}
            >
              <div className="h-9 w-9 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-sm ring-2 ring-primary/20 shrink-0">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-base font-bold tracking-tight leading-none font-['Plus_Jakarta_Sans']">
                  CareerAI Engine
                </span>
                <span className="text-[11px] text-[#c7c4d8] font-medium mt-0.5 tracking-wide">
                  Executive Suite
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 text-outline-variant hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Navigation"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Quick CTA Button */}
          <button
            onClick={() => {
              onOpenUpload();
              setIsMobileOpen(false);
            }}
            className="w-full bg-white/10 hover:bg-white/15 text-white border border-outline/40 rounded-xl py-2 px-space-md flex items-center justify-center gap-space-xs text-xs font-semibold tracking-wide transition-all duration-150 shadow-sm hover:border-primary/50 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-inverse-primary group-hover:scale-110 transition-transform">
              upload_file
            </span>
            <span>Upload Resume</span>
          </button>

          {/* Main Navigation Items */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {/* Item 1: Dashboard */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-semibold pl-4 transition-all duration-150 text-left cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-l-4 border-[#4f46e5] text-white bg-white/10 font-bold'
                  : 'text-[#c7c4d8] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">space_dashboard</span>
              <span>Dashboard</span>
            </button>

            {/* Item 2: Resume Analyzer (Default / Core) */}
            <button
              onClick={() => handleNavClick('analyzer')}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                activeTab === 'analyzer'
                  ? 'border-l-4 border-[#4f46e5] text-white bg-white/10 pl-3 font-bold'
                  : 'text-[#c7c4d8] hover:text-white hover:bg-white/5 pl-4'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  activeTab === 'analyzer' ? 'text-inverse-primary fill-1' : ''
                }`}
              >
                document_scanner
              </span>
              <span className="flex-1">Resume Analyzer</span>
              <span className="text-[10px] bg-secondary/80 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                {resume.overallScore}%
              </span>
            </button>

            {/* Item 3: Job Matches */}
            <button
              onClick={() => handleNavClick('jobs')}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-semibold pl-4 transition-all duration-150 text-left cursor-pointer ${
                activeTab === 'jobs'
                  ? 'border-l-4 border-[#4f46e5] text-white bg-white/10 font-bold'
                  : 'text-[#c7c4d8] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">work</span>
              <span className="flex-1">Job Matches</span>
              <span className="text-[10px] bg-primary/80 text-white px-1.5 py-0.5 rounded font-mono">
                4
              </span>
            </button>

            {/* Item 4: Resume Tailorer */}
            <button
              onClick={() => handleNavClick('tailorer')}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-semibold pl-4 transition-all duration-150 text-left cursor-pointer ${
                activeTab === 'tailorer'
                  ? 'border-l-4 border-[#4f46e5] text-white bg-white/10 font-bold'
                  : 'text-[#c7c4d8] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
              <span>Resume Tailorer</span>
            </button>

            {/* Item 5: Settings */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-semibold pl-4 transition-all duration-150 text-left cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-l-4 border-[#4f46e5] text-white bg-white/10 font-bold'
                  : 'text-[#c7c4d8] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-outline/30 flex flex-col gap-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-2.5 text-left text-xs cursor-pointer min-w-0 flex-1 hover:opacity-90"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                  {candidateDisplayName.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-inverse-surface"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs font-bold truncate">{candidateDisplayName}</span>
                <span className="text-[10px] text-[#c7c4d8] truncate">
                  {userProfile?.targetRole || resume.tier}
                </span>
              </div>
            </button>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign Out / Switch Profile"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
