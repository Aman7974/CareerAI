import React from 'react';
import { ResumeData } from '../types';
import { calculateJobMatchesForResume } from '../utils/jobMatching';

interface DashboardViewProps {
  resume: ResumeData;
  onNavigateToAnalyzer: () => void;
  onOpenUpload: () => void;
  onOpenTailorer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  resume,
  onNavigateToAnalyzer,
  onOpenUpload,
  onOpenTailorer,
}) => {
  const dynamicJobs = calculateJobMatchesForResume(resume);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-margin-lg py-4 lg:py-space-lg flex flex-col gap-space-lg animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-on-surface dark:text-white">
            Welcome back, {resume.candidateName.split(' ')[0]}
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Your executive profile (<strong>{resume.headline}</strong>) is parsed from <code>{resume.fileName}</code>.
            Ranked in the <strong>Top {resume.overallScore >= 95 ? '2%' : '5%'}</strong> across Fortune 500 ATS systems.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-2 rounded-lg bg-surface-container-lowest dark:bg-white/5 hover:bg-surface-container border border-outline-variant dark:border-white/10 text-on-surface dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload New Version</span>
          </button>
          <button
            onClick={onNavigateToAnalyzer}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>View Full Diagnostic</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest dark:bg-[#1a2238] p-4 rounded-xl border border-outline-variant/60 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">ATS Match Score</div>
            <div className="text-2xl font-extrabold text-on-surface dark:text-white font-['Plus_Jakarta_Sans'] mt-0.5">
              {resume.overallScore}/100
            </div>
            <div className="text-[11px] text-secondary dark:text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>{resume.tier}</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-secondary-fixed/40 dark:bg-emerald-950 flex items-center justify-center text-secondary dark:text-emerald-400">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-[#1a2238] p-4 rounded-xl border border-outline-variant/60 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Quantified Results</div>
            <div className="text-2xl font-extrabold text-on-surface dark:text-white font-['Plus_Jakarta_Sans'] mt-0.5">
              {resume.metrics.impact}%
            </div>
            <div className="text-[11px] text-secondary dark:text-emerald-400 font-semibold mt-1">
              Top Tier Metrics
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary-fixed/40 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-[#818cf8]">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-[#1a2238] p-4 rounded-xl border border-outline-variant/60 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Keyword Coverage</div>
            <div className="text-2xl font-extrabold text-on-surface dark:text-white font-['Plus_Jakarta_Sans'] mt-0.5">
              {resume.metrics.keywordDensity}%
            </div>
            <div className="text-[11px] text-primary dark:text-[#818cf8] font-semibold mt-1">
              {resume.skills.length} Technical Skills
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-surface-container dark:bg-white/5 flex items-center justify-center text-on-surface dark:text-white">
            <span className="material-symbols-outlined text-[24px]">key</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-[#1a2238] p-4 rounded-xl border border-outline-variant/60 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant dark:text-slate-400 font-medium">Executive Tone Index</div>
            <div className="text-2xl font-extrabold text-on-surface dark:text-white font-['Plus_Jakarta_Sans'] mt-0.5">
              {resume.metrics.executiveTone}%
            </div>
            <div className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium mt-1">
              {resume.strongVerbsCount} Strong Verbs
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-tertiary-fixed/40 dark:bg-amber-950 flex items-center justify-center text-tertiary dark:text-amber-400">
            <span className="material-symbols-outlined text-[24px]">psychology</span>
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Target Alignment vs Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Target Alignment Benchmarks (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-lg shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/40 dark:border-white/10">
            <div>
              <h2 className="text-base font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                Tier-1 Tech & SaaS Alignment for {resume.candidateName.split(' ')[0]}
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-slate-400">
                Live compatibility calculated from your active resume skills & experience
              </p>
            </div>
            <button
              onClick={onOpenTailorer}
              className="text-xs text-primary dark:text-[#818cf8] font-bold hover:underline cursor-pointer"
            >
              Open Tailor Studio →
            </button>
          </div>

          <div className="space-y-3.5">
            {dynamicJobs.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-surface-container-low dark:bg-[#131b2e] rounded-xl border border-outline-variant/40 dark:border-white/10"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div>
                    <span className="font-bold text-on-surface dark:text-white">{item.company}</span>
                    <span className="text-outline dark:text-slate-400 mx-1.5">•</span>
                    <span className="text-on-surface-variant dark:text-slate-300">{item.title}</span>
                  </div>
                  <span className="font-bold text-on-surface dark:text-white font-mono">{item.matchScore}% Match</span>
                </div>
                <div className="w-full bg-surface-container dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${
                      item.matchScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                    } h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.matchScore}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Diagnostics History & Executive Feed (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-lg shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans'] mb-1">
              Active Audit Log: {resume.fileName}
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mb-4">
              Parsed under Hash: <span className="font-mono text-primary font-bold">{resume.parseHash}</span>
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-secondary dark:bg-emerald-400 mt-1.5 shrink-0"></span>
                <div>
                  <div className="font-semibold text-on-surface dark:text-white">Active Document Ingested</div>
                  <div className="text-[11px] text-on-surface-variant dark:text-slate-400">
                    Extracted {resume.workExperience.length} work blocks, {resume.skills.length} technical skills.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-primary dark:text-[#818cf8] mt-1.5 shrink-0"></span>
                <div>
                  <div className="font-semibold text-on-surface dark:text-white">Quantification Ratio: {resume.metrics.impact}%</div>
                  <div className="text-[11px] text-on-surface-variant dark:text-slate-400">
                    High impact metrics and leadership verbs indexed.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="w-2 h-2 rounded-full bg-tertiary dark:bg-amber-400 mt-1.5 shrink-0"></span>
                <div>
                  <div className="font-semibold text-on-surface dark:text-white">
                    {resume.suggestedSkills.length} Keywords Recommended
                  </div>
                  <div className="text-[11px] text-on-surface-variant dark:text-slate-400">
                    {resume.suggestedSkills.map((s) => s.name).join(', ')} suggested to maximize ATS pass rate.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/40 dark:border-white/10">
            <button
              onClick={onNavigateToAnalyzer}
              className="w-full py-2 bg-surface-container dark:bg-white/10 hover:bg-surface-container-high text-on-surface dark:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Launch Live Diagnostic Workspace</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
