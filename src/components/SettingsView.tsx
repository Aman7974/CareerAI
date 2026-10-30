import React from 'react';

interface SettingsViewProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDarkMode,
  setIsDarkMode,
  onResetData,
}) => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-margin-lg py-4 lg:py-space-lg flex flex-col gap-space-lg animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-lg shadow-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-primary dark:text-[#818cf8]">settings</span>
          <h1 className="text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-on-surface dark:text-white">
            System & Engine Settings
          </h1>
        </div>
        <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 max-w-xl">
          Customize your ATS parser parameters, appearance theme, and executive calibration profiles.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Card 1: Appearance & Theme (Dark Mode Toggle) */}
        <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary dark:text-[#818cf8]">dark_mode</span>
              <h2 className="text-sm font-bold text-on-surface dark:text-white">Theme & Appearance</h2>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mb-4">
              Toggle between high-contrast light mode and executive dark slate mode.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  !isDarkMode
                    ? 'border-primary bg-primary-fixed/20 text-primary font-bold shadow-xs'
                    : 'border-outline-variant/50 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">light_mode</span>
                <span className="text-xs">Executive Light</span>
              </button>

              <button
                onClick={() => setIsDarkMode(true)}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isDarkMode
                    ? 'border-[#6366f1] bg-[#6366f1]/20 text-white font-bold shadow-xs ring-1 ring-[#6366f1]'
                    : 'border-outline-variant/50 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">dark_mode</span>
                <span className="text-xs">Deep Slate Dark</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/40 dark:border-white/10 text-[11px] text-on-surface-variant dark:text-slate-400">
            Active Theme: <strong className="text-on-surface dark:text-white">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</strong>
          </div>
        </div>

        {/* Card 2: ATS Engine Target Calibration */}
        <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary dark:text-emerald-400">tune</span>
              <h2 className="text-sm font-bold text-on-surface dark:text-white">ATS Algorithm Filters</h2>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mb-4">
              Simulate enterprise recruitment filters from major Fortune 500 ATS platforms.
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Workday Enterprise Cloud Parser', status: 'Active (v4.8)', defaultChecked: true },
                { name: 'Taleo Executive Filter Simulation', status: 'Active', defaultChecked: true },
                { name: 'Greenhouse & Lever Modern Strict Match', status: 'Active', defaultChecked: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-surface-container-low dark:bg-[#131b2e] rounded-lg border border-outline-variant/40 dark:border-white/10 text-xs">
                  <span className="font-medium text-on-surface dark:text-white">{item.name}</span>
                  <span className="text-secondary dark:text-emerald-400 font-bold text-[11px]">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/40 dark:border-white/10 text-[11px] text-on-surface-variant dark:text-slate-400">
            Engine Version: <strong>Enterprise Build 4.8.2-prod</strong>
          </div>
        </div>

        {/* Card 3: Profile & Security */}
        <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary dark:text-[#818cf8]">badge</span>
            <h2 className="text-sm font-bold text-on-surface dark:text-white">Executive Profile Status</h2>
          </div>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 mb-4">
            Security and privacy controls for your executive resume data.
          </p>
          <div className="space-y-2 text-xs text-on-surface dark:text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-outline-variant/30 dark:border-white/10">
              <span className="text-outline dark:text-slate-400">Tier:</span>
              <span className="font-semibold text-secondary dark:text-emerald-400">Executive Suite (Tier-1)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-outline-variant/30 dark:border-white/10">
              <span className="text-outline dark:text-slate-400">Data Redaction:</span>
              <span className="font-semibold text-on-surface dark:text-white">Enabled for ATS Export</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-outline dark:text-slate-400">Session Storage:</span>
              <span className="font-semibold text-on-surface dark:text-white">Encrypted Local Sandbox</span>
            </div>
          </div>
        </div>

        {/* Card 4: Reset & Cache Management */}
        <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-error">restart_alt</span>
              <h2 className="text-sm font-bold text-on-surface dark:text-white">Reset & Demo Data</h2>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mb-3">
              Reset active modifications back to the default uploaded baseline resume.
            </p>
          </div>

          <button
            onClick={onResetData}
            className="w-full py-2 bg-error-container/40 hover:bg-error-container text-error text-xs font-semibold rounded-lg border border-error/30 transition-colors cursor-pointer"
          >
            Reset Active Resume to Initial Baseline
          </button>
        </div>
      </div>
    </div>
  );
};
