import React, { useState } from 'react';
import { ResumeData, JobMatch } from '../types';
import { calculateJobMatchesForResume } from '../utils/jobMatching';

interface LiveMatchScoringViewProps {
  resume: ResumeData;
  onOpenTailorer: (job: JobMatch) => void;
}

export const LiveMatchScoringView: React.FC<LiveMatchScoringViewProps> = ({
  resume,
  onOpenTailorer,
}) => {
  // Dynamically compute job matches for the active uploaded resume
  const dynamicJobs = calculateJobMatchesForResume(resume);

  const [selectedJobId, setSelectedJobId] = useState<string>(dynamicJobs[0]?.id || 'job-1');
  const selectedJob = dynamicJobs.find((j) => j.id === selectedJobId) || dynamicJobs[0];

  const meanScore = Math.round(
    dynamicJobs.reduce((acc, curr) => acc + curr.matchScore, 0) / dynamicJobs.length
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-margin-lg py-4 lg:py-space-lg flex flex-col gap-space-lg animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary dark:text-[#818cf8]">
              compare_arrows
            </span>
            <h1 className="text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-on-surface dark:text-white">
              Live ATS Match Scoring Engine
            </h1>
            <span className="bg-secondary-fixed/50 text-on-secondary-container dark:bg-emerald-950 dark:text-emerald-300 border border-secondary/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              Parsed from: {resume.fileName}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time keyword extraction and semantic parsing calibrated for <strong>{resume.candidateName}</strong>.
            Evaluates domain authority, leadership scale, and technology stack alignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-on-surface-variant dark:text-slate-400">Benchmarked Roles</div>
            <div className="text-base font-bold text-on-surface dark:text-white font-mono">
              {dynamicJobs.length} Target Roles
            </div>
          </div>
          <div className="h-10 w-[1px] bg-outline-variant/60 dark:bg-white/10"></div>
          <div className="text-right">
            <div className="text-xs text-on-surface-variant dark:text-slate-400">Mean Match Index</div>
            <div className="text-base font-bold text-secondary dark:text-emerald-400 font-mono">
              {meanScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Job Selector + In-Depth Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Job Cards List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-outline dark:text-slate-400 px-1">
            Target Executive Postings
          </div>

          {dynamicJobs.map((job) => {
            const isSelected = job.id === selectedJobId;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-primary-fixed/20 dark:bg-primary/20 border-primary dark:border-[#6366f1] ring-1 ring-primary/30'
                    : 'bg-surface-container-lowest dark:bg-[#1a2238] border-outline-variant/60 dark:border-white/10 hover:border-primary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0"
                      style={{ backgroundColor: job.logoColor }}
                    >
                      {job.company.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface dark:text-white leading-tight">
                        {job.title}
                      </h3>
                      <div className="text-xs text-on-surface-variant dark:text-slate-400">
                        {job.company} • {job.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-base font-extrabold font-['Plus_Jakarta_Sans'] ${
                        job.matchScore >= 90
                          ? 'text-secondary dark:text-emerald-400'
                          : 'text-tertiary dark:text-amber-400'
                      }`}
                    >
                      {job.matchScore}%
                    </span>
                    <span className="text-[10px] text-outline dark:text-slate-400 font-semibold uppercase">
                      ATS Match
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-on-surface-variant dark:text-slate-400 border-t border-outline-variant/40 dark:border-white/10 pt-2 mt-2">
                  <span className="font-medium text-primary dark:text-[#818cf8]">{job.salary}</span>
                  <span>{job.postedDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Match Diagnostic Radar & Tailor Trigger (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-lg shadow-sm flex flex-col gap-6">
          {/* Header of selected job */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-on-surface dark:text-white">
                  {selectedJob.company} — {selectedJob.title}
                </h2>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                {selectedJob.tier} • {selectedJob.location} • {selectedJob.salary}
              </p>
            </div>

            <button
              onClick={() => onOpenTailorer(selectedJob)}
              className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
              <span>Tailor Resume for this Role</span>
            </button>
          </div>

          {/* Compatibility Gauge & Percentile Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant/40 dark:border-white/10 text-center">
              <div className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">ATS Match Score</div>
              <div className="text-3xl font-extrabold text-secondary dark:text-emerald-400 my-1 font-['Plus_Jakarta_Sans']">
                {selectedJob.matchScore}%
              </div>
              <span className="text-[10px] bg-secondary-fixed dark:bg-emerald-900 text-on-secondary-fixed dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                {selectedJob.matchScore >= 90 ? 'Tier-1 Qualified' : 'Strong Contender'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant/40 dark:border-white/10 text-center">
              <div className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">Keyword Overlap</div>
              <div className="text-3xl font-extrabold text-on-surface dark:text-white my-1 font-['Plus_Jakarta_Sans']">
                {selectedJob.matchedKeywords.length}/
                {selectedJob.matchedKeywords.length + selectedJob.missingKeywords.length}
              </div>
              <span className="text-[10px] text-outline dark:text-slate-400 font-medium">
                {Math.round(
                  (selectedJob.matchedKeywords.length /
                    (selectedJob.matchedKeywords.length + selectedJob.missingKeywords.length)) *
                    100
                )}
                % Requirements Met
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant/40 dark:border-white/10 text-center">
              <div className="text-[11px] text-on-surface-variant dark:text-slate-400 font-medium">
                Executive Tone
              </div>
              <div className="text-3xl font-extrabold text-primary dark:text-[#818cf8] my-1 font-['Plus_Jakarta_Sans']">
                {resume.metrics.executiveTone}%
              </div>
              <span className="text-[10px] text-outline dark:text-slate-400 font-medium">
                {resume.headline.split(' ')[0]} Caliber
              </span>
            </div>
          </div>

          {/* Matched Keywords vs Missing Keywords Chips */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface dark:text-white mb-2">
                <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-[18px]">
                  check_circle
                </span>
                <span>Verified Match Keywords in {resume.candidateName.split(' ')[0]}'s Resume ({selectedJob.matchedKeywords.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.matchedKeywords.length > 0 ? (
                  selectedJob.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-secondary-fixed/40 dark:bg-emerald-950 text-on-secondary-container dark:text-emerald-300 border border-secondary/30 rounded-lg text-xs font-medium"
                    >
                      ✓ {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-outline italic">No overlapping primary keywords detected yet.</span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface dark:text-white mb-2">
                <span className="material-symbols-outlined text-tertiary dark:text-amber-400 text-[18px]">
                  warning
                </span>
                <span>Missing ATS Filter Keywords for this Target ({selectedJob.missingKeywords.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-tertiary-fixed dark:bg-amber-950 text-on-tertiary-fixed dark:text-amber-300 border border-tertiary-container/40 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">add</span>
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-2">
                Tip: Adding these missing terms into your Work Experience bullets will increase your match score from{' '}
                <strong>{selectedJob.matchScore}%</strong> to <strong>98%</strong>.
              </p>
            </div>
          </div>

          {/* Recruiter Placement Radar Advice */}
          <div className="p-4 rounded-xl bg-primary-fixed/20 dark:bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-[#818cf8] mb-1">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Executive Recruiter Insights for {selectedJob.company}</span>
            </div>
            <p className="text-xs text-on-surface dark:text-slate-300 leading-relaxed">
              Recruiters screening for this role at {selectedJob.company} look for candidates like {resume.candidateName} with verified
              history in {resume.skills.slice(0, 3).join(', ')} and executive accountability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
