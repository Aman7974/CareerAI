import React, { useState, useEffect } from 'react';
import { ResumeData, JobMatch } from '../types';
import { sampleCoPilotQA } from '../data/resumes';
import { SkillsRadarChart } from './SkillsRadarChart';
import { UploadedDocumentAnalysis } from './UploadedDocumentAnalysis';
import { calculateJobMatchesForResume } from '../utils/jobMatching';

interface DiagnosticViewProps {
  resume: ResumeData;
  onUpdateResume: (updated: Partial<ResumeData>) => void;
  onOpenExport: () => void;
  onOpenPrintPdf: () => void;
  onOpenEditBullet: (currentText: string, onSave: (newText: string) => void) => void;
  onDeductCredit: () => boolean;
  onNavigateToJobs?: () => void;
  onOpenTailorer?: (job: JobMatch) => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  resume,
  onUpdateResume,
  onOpenExport,
  onOpenPrintPdf,
  onOpenEditBullet,
  onDeductCredit,
  onNavigateToJobs,
  onOpenTailorer,
}) => {
  const matchedJobs = calculateJobMatchesForResume(resume);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [leftPaneMode, setLeftPaneMode] = useState<'preview' | 'analysis'>('analysis');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeRewriteAccepted, setActiveRewriteAccepted] = useState(false);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [missingKeywordAdded, setMissingKeywordAdded] = useState(false);
  const [documentPaperMode, setDocumentPaperMode] = useState<'paper' | 'dark'>('paper');

  // Automatically switch to analysis mode whenever a new document is loaded
  useEffect(() => {
    setLeftPaneMode('analysis');
    setActiveRewriteAccepted(false);
    setAddedSkills([]);
  }, [resume.id]);

  // Co-Pilot State
  const [coPilotInput, setCoPilotInput] = useState('');
  const [coPilotMessages, setCoPilotMessages] = useState<
    { id: string; role: 'user' | 'assistant'; content: string; time: string }[]
  >([]);
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  // Simulated re-analyze function
  const handleReanalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onUpdateResume({
        lastScanned: 'Just now',
        parseHash: '#A92-CX-' + Math.floor(100 + Math.random() * 900),
      });
    }, 1200);
  };

  // 1-Click Accept AI Rewrite
  const handleAcceptRewrite = () => {
    if (!activeRewriteAccepted) {
      setActiveRewriteAccepted(true);
      const newScore = Math.min(99, resume.overallScore + 4);
      onUpdateResume({
        overallScore: newScore,
        passiveVoiceCount: Math.max(0, resume.passiveVoiceCount - 1),
        strongVerbsCount: resume.strongVerbsCount + 1,
        metrics: {
          ...resume.metrics,
          impact: 99,
          executiveTone: 94,
        },
      });
    }
  };

  // Add individual missing skill
  const handleAddSkill = (skillName: string) => {
    if (!addedSkills.includes(skillName)) {
      const nextSkills = [...resume.skills, skillName];
      const newAdded = [...addedSkills, skillName];
      setAddedSkills(newAdded);

      const newKeywordScore = Math.min(100, resume.metrics.keywordDensity + 3);
      const newOverall = Math.min(99, resume.overallScore + 2);

      onUpdateResume({
        skills: nextSkills,
        overallScore: newOverall,
        metrics: {
          ...resume.metrics,
          keywordDensity: newKeywordScore,
        },
      });
    }
  };

  // Add all 3 skills at once
  const handleAddAllSkills = () => {
    const skillsToAdd = ['Kubernetes', 'FedRAMP compliance', 'Multi-region AWS architecture'].filter(
      (s) => !resume.skills.includes(s) && !addedSkills.includes(s)
    );
    if (skillsToAdd.length > 0) {
      const updatedSkills = [...resume.skills, ...skillsToAdd];
      setAddedSkills([...addedSkills, ...skillsToAdd]);
      onUpdateResume({
        skills: updatedSkills,
        overallScore: 98,
        metrics: {
          ...resume.metrics,
          keywordDensity: 98,
        },
      });
    }
  };

  // Co-Pilot Ask Handler
  const handleSendCopilot = (textToSend?: string) => {
    const query = textToSend || coPilotInput.trim();
    if (!query) return;

    if (!onDeductCredit()) {
      alert('You have reached the credit limit for this session.');
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCoPilotMessages((prev) => [...prev, userMsg]);
    setCoPilotInput('');
    setIsCopilotTyping(true);

    setTimeout(() => {
      const matchedQA = sampleCoPilotQA.find(
        (q) => q.question.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(q.question.toLowerCase())
      );
      let replyContent = matchedQA?.answer;
      if (!replyContent) {
        replyContent = `### CareerAI Advisor Analysis on: "${query}"\n\n• **Strategic Alignment**: Ensure role positioning anchors on high-leverage outcomes and technical excellence.\n• **ATS Parsing Recommendation**: Keep keywords aligned to standard recruiter taxonomy. Replace descriptive statements with quantified achievements.\n• **Metrics Punch**: Add metrics such as percentage gains, performance latency reduction, or scale.`;
      }

      setCoPilotMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: replyContent,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsCopilotTyping(false);
    }, 700);
  };

  // Download ATS-ready PDF / print
  const handleDownloadATS = () => {
    window.print();
  };

  // Find active flagged bullet dynamically from resume
  const allBullets = resume.workExperience.flatMap((e) => e.bullets);
  const rawFlaggedBullet =
    allBullets.find((b) => b.isFlagged) ||
    allBullets.find((b) => b.rewriteText) || {
      id: 'default-flagged',
      text: 'Optimized CI/CD pipeline and automated build scripts for backend microservices across internal teams.',
      rewriteText: 'Engineered zero-downtime CI/CD reducing deployment time by 42% and saving $180k/yr.',
      flagReason: 'Flagged: Weak passive phrasing & missing financial quantification',
    };

  // Helper to sanitize bullet so it never displays raw resume dumps
  const cleanBulletText = (txt: string) => {
    if (!txt) return '';
    if (txt.includes('PROJECTS EDUCATION') || txt.includes('ADDITIONAL INFORMATION') || (txt.length > 200 && txt.includes('@'))) {
      const match = txt.match(/\b((?:Developed|Architected|Built|Designed|Engineered|Utilized|Optimized)\s+[^\n.]+\.)/i);
      if (match) return match[1].trim();
      return 'Developed full-stack web applications and backend services with RESTful APIs.';
    }
    return txt;
  };

  const flaggedBullet = {
    ...rawFlaggedBullet,
    text: cleanBulletText(rawFlaggedBullet.text),
  };

  const remainingImprovementsCount =
    (activeRewriteAccepted ? 0 : 1) +
    (addedSkills.length >= 3 ? 0 : 1) +
    0;

  // Helper to render bullet text with highlighted action verbs and quantified metrics
  const renderBulletWithHighlights = (bulletText: string) => {
    // Regex for strong action verbs and metrics
    const pattern = /\b(orchestrated|spearheaded|architected|engineered|accelerated|scaled|pioneered|transformed|delivered|championed|surpassed|generated|optimized|streamlined|restructured|directed|modernized|maximized|overhauled|99\.999% availability|\$\d+(?:\.\d+)?(?:M|k|B)?(?:\s*annually)?|\d+%\b)/gi;

    const parts = bulletText.split(pattern);
    return parts.map((part, idx) => {
      if (pattern.test(part)) {
        return (
          <span
            key={idx}
            className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-b-2 border-emerald-500 font-medium px-1 rounded-xs"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-margin-lg py-4 lg:py-space-lg flex flex-col gap-space-lg animate-in fade-in duration-300">
      {/* SECTION 1: CANDIDATE CONTEXT & ACTION HEADER */}
      <section className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-4 sm:p-space-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-all">
        <div className="flex items-start gap-3 sm:gap-space-md">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant dark:border-white/10 flex items-center justify-center text-primary dark:text-[#818cf8] shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px] sm:text-[28px]">picture_as_pdf</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-on-surface dark:text-white tracking-tight">
                {resume.fileName}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-fixed/50 dark:bg-emerald-950 text-on-secondary-container dark:text-emerald-300 border border-secondary/20 dark:border-emerald-800 shadow-2xs">
                {resume.tier}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-space-md mt-1 text-xs text-on-surface-variant dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Last scanned {resume.lastScanned}
              </span>
              <span>•</span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                {resume.parserEngine}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-primary dark:text-[#818cf8] font-medium">Target: {resume.targetMarket}</span>
            </div>
          </div>
        </div>

        {/* Action cluster */}
        <div className="flex items-center gap-2 sm:gap-space-sm flex-wrap">
          <button
            onClick={handleReanalyze}
            disabled={isAnalyzing}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-surface-container-lowest dark:bg-white/5 hover:bg-surface-container dark:hover:bg-white/10 border border-outline-variant dark:border-white/10 text-on-surface dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isAnalyzing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-analyze'}</span>
          </button>

          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-surface-container-lowest dark:bg-white/5 hover:bg-surface-container dark:hover:bg-white/10 border border-outline-variant dark:border-white/10 text-on-surface dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            <span>Export Report</span>
          </button>

          <button
            onClick={onOpenPrintPdf}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download ATS-Ready PDF</span>
          </button>

          {onNavigateToJobs && (
            <button
              onClick={onNavigateToJobs}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">work</span>
              <span>View Required Jobs ({matchedJobs.length})</span>
            </button>
          )}
        </div>
      </section>

      {/* QUICK DOCUMENT ANALYSIS TELEMETRY STRIP */}
      <section className="px-4 py-3 bg-surface-container-low dark:bg-[#131b2e] rounded-xl border border-outline-variant/50 dark:border-white/10 flex flex-wrap items-center justify-between text-xs gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-on-surface dark:text-white">
            <span className="material-symbols-outlined text-[18px] text-primary dark:text-[#818cf8]">description</span>
            <span>Document Analysis for:</span>
            <code className="text-[11px] px-1.5 py-0.5 bg-surface-container-lowest dark:bg-white/5 rounded text-primary dark:text-[#818cf8]">
              {resume.fileName}
            </code>
          </span>
          <span className="text-outline dark:text-slate-500">•</span>
          <span className="text-on-surface-variant dark:text-slate-400">
            {resume.workExperience.length} Experience Blocks • {resume.skills.length} Extracted Skills • {resume.strongVerbsCount} Action Verbs • {resume.metrics.impact}% Quantified Metrics
          </span>
        </div>

        <button
          onClick={() => setLeftPaneMode(leftPaneMode === 'analysis' ? 'preview' : 'analysis')}
          className="text-xs font-bold text-primary dark:text-[#818cf8] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            {leftPaneMode === 'analysis' ? 'description' : 'analytics'}
          </span>
          <span>{leftPaneMode === 'analysis' ? 'Switch to Annotated Resume Preview →' : '← Show Uploaded Document Analysis'}</span>
        </button>
      </section>

      {/* SECTION 2: TOP ATS COMPATIBILITY SCORE BANNER */}
      <section className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-4 sm:p-space-lg shadow-xs">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-space-lg items-center">
          {/* Overall Radial / Big Score Card (Span 4) */}
          <div className="xl:col-span-4 flex items-center gap-4 sm:gap-space-lg border-b xl:border-b-0 xl:border-r border-outline-variant/50 dark:border-white/10 pb-4 xl:pb-0 xl:pr-space-lg">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container dark:text-slate-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-secondary dark:text-emerald-400 transition-all duration-700 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${resume.overallScore}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl sm:text-2xl font-extrabold text-on-surface dark:text-white leading-none font-['Plus_Jakarta_Sans']">
                  {resume.overallScore}
                </span>
                <span className="text-[10px] text-outline dark:text-slate-400 tracking-wider uppercase mt-0.5 font-semibold">
                  / 100
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                  Overall ATS Compatibility
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-secondary-fixed dark:bg-emerald-950 text-on-secondary-fixed dark:text-emerald-300 font-bold">
                  {resume.overallScore >= 95 ? 'Elite Tier' : 'Strong Pass'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 leading-relaxed">
                Candidate ranks in the <strong>top {resume.overallScore >= 96 ? '1.5%' : '3%'}</strong> of VP-level
                engineering profiles parsed across Fortune 500 ATS criteria.
              </p>
            </div>
          </div>

          {/* Score Breakdown Pills (Span 8) */}
          <div className="xl:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-space-md">
            {/* Metric 1 */}
            <div className="bg-surface-container-low dark:bg-[#131b2e] rounded-xl p-3 border border-outline-variant/40 dark:border-white/10 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-on-surface-variant dark:text-slate-400">Impact & Results</span>
                <span className="material-symbols-outlined text-[16px] text-secondary dark:text-emerald-400">trending_up</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                  {resume.metrics.impact}%
                </span>
                <span className="text-[11px] text-on-secondary-container dark:text-emerald-300 font-semibold">
                  Exceptional
                </span>
              </div>
              <div className="w-full bg-surface-container dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-secondary dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${resume.metrics.impact}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-surface-container-low dark:bg-[#131b2e] rounded-xl p-3 border border-outline-variant/40 dark:border-white/10 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-on-surface-variant dark:text-slate-400">Keyword Density</span>
                <span className="material-symbols-outlined text-[16px] text-tertiary dark:text-amber-400">key</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                  {resume.metrics.keywordDensity}%
                </span>
                <span className="text-[11px] text-tertiary dark:text-amber-300 font-semibold">
                  {addedSkills.length >= 3 ? 'Optimal' : `${3 - addedSkills.length} Missing`}
                </span>
              </div>
              <div className="w-full bg-surface-container dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-tertiary-container dark:bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${resume.metrics.keywordDensity}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-surface-container-low dark:bg-[#131b2e] rounded-xl p-3 border border-outline-variant/40 dark:border-white/10 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-on-surface-variant dark:text-slate-400">Readability & Format</span>
                <span className="material-symbols-outlined text-[16px] text-secondary dark:text-emerald-400">task_alt</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                  {resume.metrics.readability}%
                </span>
                <span className="text-[11px] text-on-secondary-container dark:text-emerald-300 font-semibold">
                  Clean Parser
                </span>
              </div>
              <div className="w-full bg-surface-container dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-secondary dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${resume.metrics.readability}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-surface-container-low dark:bg-[#131b2e] rounded-xl p-3 border border-outline-variant/40 dark:border-white/10 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-on-surface-variant dark:text-slate-400">Executive Tone</span>
                <span className="material-symbols-outlined text-[16px] text-primary dark:text-[#818cf8]">psychology</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                  {resume.metrics.executiveTone}%
                </span>
                <span className="text-[11px] text-primary dark:text-[#818cf8] font-semibold">
                  {resume.metrics.executiveTone >= 90 ? 'C-Suite Caliber' : 'High Gravity'}
                </span>
              </div>
              <div className="w-full bg-surface-container dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary dark:bg-[#818cf8] h-full rounded-full transition-all duration-500"
                  style={{ width: `${resume.metrics.executiveTone}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2.5: EXECUTIVE COMPETENCY RADAR VS INDUSTRY BENCHMARK */}
      <SkillsRadarChart
        resume={resume}
        activeRewriteAccepted={activeRewriteAccepted}
        addedSkills={addedSkills}
      />

      {/* SECTION 2.7: REQUIRED TARGET JOBS MATCHED TO UPLOADED RESUME */}
      <section className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-4 sm:p-space-lg shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 dark:border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-[#818cf8] shrink-0">
              <span className="material-symbols-outlined text-[24px]">work</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                  Required & Matching Jobs for {resume.candidateName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary-fixed dark:bg-emerald-950 text-on-secondary-fixed dark:text-emerald-300">
                  {matchedJobs.filter((j) => j.matchScore >= 90).length} High Match Positions
                </span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                Evaluated against live Fortune 500 employer criteria based on your uploaded resume (<code>{resume.fileName}</code>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToJobs && (
              <button
                onClick={onNavigateToJobs}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container-low dark:bg-white/5 hover:bg-surface-container border border-outline-variant dark:border-white/10 text-xs font-semibold text-primary dark:text-[#818cf8] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View All Openings ({matchedJobs.length})</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Job Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {matchedJobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-xl bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant/40 dark:border-white/10 flex flex-col justify-between gap-3 shadow-2xs hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs"
                      style={{ backgroundColor: job.logoColor }}
                    >
                      {job.company.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-on-surface dark:text-white line-clamp-1">
                        {job.title}
                      </h4>
                      <div className="text-[11px] text-outline dark:text-slate-400">
                        {job.company} • {job.location}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-extrabold font-['Plus_Jakarta_Sans'] ${
                        job.matchScore >= 90
                          ? 'text-secondary dark:text-emerald-400'
                          : 'text-tertiary dark:text-amber-400'
                      }`}
                    >
                      {job.matchScore}%
                    </span>
                    <span className="block text-[9px] text-outline uppercase font-semibold">Match</span>
                  </div>
                </div>

                <div className="mt-2.5 text-[11px] font-semibold text-primary dark:text-[#818cf8]">
                  {job.salary}
                </div>

                {/* Overlapping skills & missing requirements */}
                <div className="mt-2 space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {job.matchedKeywords.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                    {job.missingKeywords.slice(0, 1).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      >
                        + Need {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/30 dark:border-white/5 flex items-center justify-between gap-2">
                <span className="text-[10px] text-outline dark:text-slate-400">{job.postedDate}</span>
                {onOpenTailorer && (
                  <button
                    onClick={() => onOpenTailorer(job)}
                    className="px-2.5 py-1 bg-primary hover:bg-primary-container text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
                    <span>Tailor Resume</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: DUAL-PANE WORKSPACE (60% / 40%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Interactive Resume Document Preview */}
        <div className="lg:col-span-7 bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
          {/* Document Preview Toolbar */}
          <div className="px-3 sm:px-space-md py-2.5 bg-surface-container-low dark:bg-[#131b2e] border-b border-outline-variant/50 dark:border-white/10 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-surface-container-highest/60 dark:bg-white/10 p-0.5 rounded-lg">
                <button
                  onClick={() => setLeftPaneMode('analysis')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    leftPaneMode === 'analysis'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">analytics</span>
                  <span>Uploaded Document Analysis</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
                <button
                  onClick={() => setLeftPaneMode('preview')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    leftPaneMode === 'preview'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">description</span>
                  <span>Annotated Preview</span>
                </button>
              </div>

              {leftPaneMode === 'preview' && (
                <button
                  onClick={() => setCurrentPage(currentPage === 1 ? 2 : 1)}
                  className="text-[11px] px-2 py-0.5 bg-surface-container-highest dark:bg-white/10 text-on-surface-variant dark:text-slate-300 rounded hover:bg-surface-variant font-medium cursor-pointer"
                >
                  Page {currentPage} of 2
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-surface-container-lowest dark:bg-white/5 border border-outline-variant/50 dark:border-white/10 rounded px-2 py-0.5 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary dark:bg-emerald-400"></span>
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant dark:text-slate-300 font-medium">
                  Strong Verbs ({resume.strongVerbsCount})
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-lowest dark:bg-white/5 border border-outline-variant/50 dark:border-white/10 rounded px-2 py-0.5 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container dark:bg-amber-400"></span>
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant dark:text-slate-300 font-medium">
                  Missing Keywords ({Math.max(0, 3 - addedSkills.length)})
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-lowest dark:bg-white/5 border border-outline-variant/50 dark:border-white/10 rounded px-2 py-0.5 shadow-2xs">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeRewriteAccepted ? 'bg-secondary dark:bg-emerald-400' : 'bg-error'
                  }`}
                ></span>
                <span className="text-[10px] sm:text-[11px] text-on-surface-variant dark:text-slate-300 font-medium">
                  Passive Voice ({activeRewriteAccepted ? 0 : 1})
                </span>
              </div>
            </div>
          </div>

          {/* Body: Either Full Document Analysis or Visual Canvas */}
          {leftPaneMode === 'analysis' ? (
            <UploadedDocumentAnalysis
              resume={resume}
              activeRewriteAccepted={activeRewriteAccepted}
              addedSkills={addedSkills}
              onAcceptRewrite={handleAcceptRewrite}
              onAddSkill={handleAddSkill}
              onAddAllSkills={handleAddAllSkills}
              onNavigateToJobs={onNavigateToJobs}
              onOpenTailorer={onOpenTailorer}
            />
          ) : (
            /* Document Canvas Body */
            <div
              className={`p-4 sm:p-8 space-y-6 select-text text-[13px] leading-relaxed transition-all ${
                documentPaperMode === 'paper'
                  ? 'bg-white text-slate-900 shadow-inner'
                  : 'bg-[#121829] text-slate-100'
              }`}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {currentPage === 1 ? (
                <>
                  {/* Resume Header */}
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4 text-center">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
                      {resume.candidateName}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                      {resume.contactInfo}
                    </p>
                    <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-semibold tracking-wide uppercase">
                      {resume.headline}
                    </p>
                  </div>

                  {/* Professional Summary */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
                      Executive Profile
                      <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></span>
                    </h3>
                    <p className="text-xs leading-relaxed">
                      {renderBulletWithHighlights(resume.executiveProfile)}
                    </p>
                  </div>

                  {/* Work Experience Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                      Professional Experience
                      <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></span>
                    </h3>

                    {resume.workExperience.map((exp) => (
                      <div key={exp.id} className="space-y-2 mb-5">
                        <div className="flex justify-between items-baseline flex-wrap">
                          <span className="font-bold text-sm">
                            {exp.title} — {exp.company}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{exp.period}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 text-xs">
                          {exp.bullets.map((bullet) => {
                            if (bullet.isFlagged) {
                              if (!activeRewriteAccepted) {
                                return (
                                  <li
                                    key={bullet.id}
                                    className="bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-300 dark:border-red-900 -ml-2 pl-3 transition-all"
                                  >
                                    <div className="flex items-center justify-between text-[11px] text-red-700 dark:text-red-300 font-semibold mb-1">
                                      <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">error_outline</span>
                                        {bullet.flagReason || 'Flagged: Weak passive phrasing & missing financial quantification'}
                                      </span>
                                      <span
                                        onClick={handleAcceptRewrite}
                                        className="text-sky-600 dark:text-sky-400 cursor-pointer hover:underline font-bold"
                                      >
                                        View AI Rewrite
                                      </span>
                                    </div>
                                    <span className="line-through text-slate-400">{bullet.text}</span>
                                  </li>
                                );
                              } else {
                                return (
                                  <li
                                    key={bullet.id}
                                    className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 -ml-2 pl-3 animate-in fade-in duration-300"
                                  >
                                    <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        Applied AI Executive Rewrite (Quantified):
                                      </span>
                                      <span
                                        onClick={() => setActiveRewriteAccepted(false)}
                                        className="text-slate-400 hover:text-slate-600 cursor-pointer text-[10px] underline"
                                      >
                                        Undo
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold px-1 rounded-xs">
                                        {bullet.rewriteText || 'Engineered zero-downtime automated release infrastructure, reducing latency by 42% and saving $180k/yr.'}
                                      </span>
                                    </span>
                                  </li>
                                );
                              }
                            }

                            return (
                              <li key={bullet.id}>
                                {renderBulletWithHighlights(bullet.text)}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Core Competencies / Technical Skills */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
                      Skills & Technical Competencies
                      <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {resume.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-700 font-medium"
                        >
                          {skill}
                        </span>
                      ))}

                      {/* Interactive Suggested Chips */}
                      {['Kubernetes', 'FedRAMP compliance'].map((sug) =>
                        !resume.skills.includes(sug) && !addedSkills.includes(sug) ? (
                          <button
                            key={sug}
                            onClick={() => handleAddSkill(sug)}
                            className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 text-amber-900 dark:text-amber-200 border border-amber-400 dark:border-amber-700 rounded flex items-center gap-1 transition-colors cursor-pointer group"
                          >
                            <span className="material-symbols-outlined text-[13px] group-hover:scale-125 transition-transform">
                              add_circle
                            </span>
                            <span>Suggested: {sug}</span>
                          </button>
                        ) : null
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Page 2 */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Page 2: Education, Patents & Governance
                    </h3>
                    <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">ATS Parsed: Verified Complete</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Education</h4>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-sm">
                        M.S. in Computer Science — Stanford University
                      </span>
                      <span className="text-xs text-slate-400">Distributed Systems Specialization</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-2">
                      <span className="font-bold text-sm">
                        B.S. in Electrical Engineering & Computer Sciences — UC Berkeley
                      </span>
                      <span className="text-xs text-slate-400">Magna Cum Laude</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Patents Issued</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs">
                      <li>
                        <strong>US Patent #10,892,114:</strong> Decentralized consensus synchronization in geo-replicated
                        stateful streaming topologies.
                      </li>
                      <li>
                        <strong>US Patent #11,204,910:</strong> Dynamic automated telemetry sharding across multi-tenant
                        cloud clusters.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Document Footer Pagination Meta */}
          <div className="bg-surface-container-low dark:bg-[#131b2e] px-space-md py-2 border-t border-outline-variant/40 dark:border-white/10 flex items-center justify-between text-xs text-outline dark:text-slate-400">
            <span className="font-mono text-[11px]">Hash: {resume.parseHash}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDocumentPaperMode(documentPaperMode === 'paper' ? 'dark' : 'paper')}
                className="px-2 py-0.5 bg-surface-container-lowest dark:bg-white/5 rounded border border-outline-variant dark:border-white/10 text-[11px] hover:text-on-surface dark:hover:text-white cursor-pointer"
              >
                {documentPaperMode === 'paper' ? 'Dark Paper' : 'White Paper'}
              </button>
              <button
                onClick={() => setZoomLevel(zoomLevel === 100 ? 110 : 100)}
                className="px-2 py-0.5 bg-surface-container-lowest dark:bg-white/5 rounded border border-outline-variant dark:border-white/10 text-[11px] hover:text-on-surface dark:hover:text-white cursor-pointer"
              >
                Zoom {zoomLevel}%
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Diagnostics & Action Panel */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Card 1: High Priority Improvements */}
          <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-md shadow-xs">
            <div className="flex items-center justify-between mb-space-md border-b border-outline-variant/40 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 rounded-full items-center justify-center font-bold text-xs transition-colors ${
                    remainingImprovementsCount === 0
                      ? 'bg-secondary text-white'
                      : 'bg-error-container text-error'
                  }`}
                >
                  {remainingImprovementsCount}
                </span>
                <h3 className="text-base font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                  High Priority Improvements
                </h3>
              </div>
              <span className="text-[11px] text-on-surface-variant dark:text-slate-300 bg-surface-container dark:bg-white/10 px-2 py-0.5 rounded font-medium">
                Actionable
              </span>
            </div>

            <div className="space-y-4">
              {/* Item 1: Replace Passive Bullet */}
              <div className="bg-surface-bright dark:bg-[#131b2e] rounded-xl border border-primary/20 dark:border-white/10 p-space-md relative overflow-hidden group shadow-2xs">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-container"></div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary dark:text-[#818cf8] text-[18px]">
                      auto_fix_high
                    </span>
                    <span className="text-xs font-bold text-on-surface dark:text-white">
                      1. Upgrade Statement with Quantified Impact
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${
                      activeRewriteAccepted
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {activeRewriteAccepted ? 'Resolved' : 'High Impact'}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="p-2.5 bg-surface-container-low dark:bg-black/20 rounded-lg border border-outline-variant/40 dark:border-white/10 text-xs text-outline dark:text-slate-400 line-through leading-relaxed">
                    "{flaggedBullet.text}"
                  </div>
                  <div className="p-3 bg-primary-fixed/20 dark:bg-primary/20 rounded-lg border border-primary/30 text-xs text-on-surface dark:text-white font-medium relative leading-relaxed">
                    <div className="text-[11px] text-primary dark:text-[#818cf8] font-bold mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      <span>Alternative Better Suggestion (Quantified):</span>
                    </div>
                    "{flaggedBullet.rewriteText || 'Engineered scalable web services reducing query latency by 42% and supporting 10k+ daily transactions.'}"
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {!activeRewriteAccepted ? (
                    <button
                      onClick={handleAcceptRewrite}
                      className="bg-primary hover:bg-primary-container text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Accept AI Rewrite</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-secondary dark:text-emerald-400 text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Applied to Resume</span>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      onOpenEditBullet(
                        flaggedBullet.rewriteText || flaggedBullet.text,
                        (newText) => {
                          setActiveRewriteAccepted(true);
                          onUpdateResume({ overallScore: Math.min(99, resume.overallScore + 4) });
                        }
                      )
                    }
                    className="text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white text-xs font-medium px-2 py-1 transition-colors cursor-pointer"
                  >
                    Edit Manually
                  </button>
                </div>
              </div>

              {/* Item 2: Missing Core Skills chips */}
              <div className="bg-surface-bright dark:bg-[#131b2e] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-md shadow-2xs">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary dark:text-amber-400 text-[18px]">
                      inventory_2
                    </span>
                    <span className="text-xs font-bold text-on-surface dark:text-white">
                      2. Missing Core Skills for VP Target Roles
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${
                      addedSkills.length >= resume.suggestedSkills.length
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-tertiary-fixed text-on-tertiary-fixed'
                    }`}
                  >
                    {addedSkills.length >= resume.suggestedSkills.length ? 'Skills Synced' : 'ATS Gap'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 mb-3 leading-relaxed">
                  These keywords were discovered in benchmarked executive role descriptions but are omitted from your file:
                </p>

                <div className="space-y-2">
                  {resume.suggestedSkills.map((skillItem, i) => {
                    const icon = i === 0 ? 'token' : i === 1 ? 'security' : 'hub';
                    const isAdded = resume.skills.includes(skillItem.name) || addedSkills.includes(skillItem.name);
                    return (
                      <div
                        key={skillItem.name}
                        className="flex items-center justify-between p-2 bg-surface-container-low dark:bg-black/20 rounded-lg border border-outline-variant/40 dark:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-tertiary dark:text-amber-400">
                            {icon}
                          </span>
                          <span className="text-xs font-semibold text-on-surface dark:text-white">
                            {skillItem.name}
                          </span>
                          <span className="text-[10px] text-outline dark:text-slate-400 font-medium">
                            {skillItem.frequency}
                          </span>
                        </div>
                        {isAdded ? (
                          <span className="text-secondary dark:text-emerald-400 text-[11px] font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">check</span> Added
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddSkill(skillItem.name)}
                            className="text-primary dark:text-[#818cf8] hover:underline text-xs font-bold flex items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span> Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleAddAllSkills}
                  disabled={addedSkills.length >= resume.suggestedSkills.length}
                  className="w-full mt-3 py-1.5 bg-surface-container dark:bg-white/10 hover:bg-surface-container-high text-on-surface dark:text-white text-xs font-semibold rounded-lg border border-outline-variant/60 dark:border-white/10 flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">post_add</span>
                  <span>{addedSkills.length >= resume.suggestedSkills.length ? 'All Suggested Skills Present in Resume' : `Add all to Skills Section`}</span>
                </button>
              </div>

              {/* Item 3: Formatting Check */}
              <div className="bg-surface-bright dark:bg-[#131b2e] rounded-xl border border-secondary/30 dark:border-emerald-800/40 p-space-md flex items-center justify-between shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-[20px] mt-0.5">
                    verified
                  </span>
                  <div>
                    <span className="text-xs font-bold text-on-surface dark:text-white block">
                      3. Formatting & Parsing Check
                    </span>
                    <span className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                      Section headers follow standard ATS XML schema. Zero unreadable tables or dual-column conflicts
                      detected.
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary dark:text-emerald-400 text-[20px] fill-1 shrink-0">
                  check_circle
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Actionable Interactive AI Co-Pilot */}
          <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-space-md shadow-xs relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-md bg-primary-container flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[14px]">psychology_alt</span>
              </div>
              <h4 className="text-sm font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                Ask CareerAI Co-Pilot
              </h4>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mb-3 leading-relaxed">
              Context-aware career advisory trained on executive search placement data:
            </p>

            {/* Message feed if conversation has started */}
            {coPilotMessages.length > 0 && (
              <div className="mb-3 max-h-48 overflow-y-auto space-y-2 pr-1">
                {coPilotMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-container/10 dark:bg-primary/20 border border-primary/20 text-on-surface dark:text-white ml-4'
                        : 'bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant/50 dark:border-white/10 text-on-surface dark:text-slate-200 mr-2'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-outline dark:text-slate-400 mb-1">
                      {msg.role === 'user' ? 'You' : 'CareerAI Co-Pilot'} • {msg.time}
                    </div>
                    <div className="whitespace-pre-line">{msg.content}</div>
                  </div>
                ))}
                {isCopilotTyping && (
                  <div className="text-xs text-primary dark:text-[#818cf8] font-medium flex items-center gap-1.5 p-2 bg-surface-container-low dark:bg-[#131b2e] rounded-lg">
                    <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                    Analyzing executive placement models...
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <textarea
                value={coPilotInput}
                onChange={(e) => setCoPilotInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendCopilot();
                  }
                }}
                className="w-full p-3 pr-10 bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant/70 dark:border-white/10 rounded-xl text-xs text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-outline resize-none transition-all"
                placeholder="Ask CareerAI: How do I frame my transition to Chief Architect?"
                rows={3}
              ></textarea>
              <button
                onClick={() => handleSendCopilot()}
                disabled={!coPilotInput.trim() || isCopilotTyping}
                className="absolute right-2.5 bottom-3.5 bg-primary hover:bg-primary-container text-white p-1.5 rounded-lg flex items-center justify-center transition-colors shadow-xs cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </div>

            {/* Suggested Quick Prompt Chips */}
            <div className="mt-3 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-outline dark:text-slate-400 mr-1 font-medium">Quick prompts:</span>
              {[
                'Rewrite for BigTech CTO search',
                'Identify overused buzzwords',
                'Frame Series C scaling',
              ].map((promptText) => (
                <button
                  key={promptText}
                  onClick={() => handleSendCopilot(promptText)}
                  className="text-[11px] px-2.5 py-1 bg-surface-container dark:bg-white/10 hover:bg-surface-container-high dark:hover:bg-white/15 text-on-surface dark:text-slate-200 rounded-full border border-outline-variant/60 dark:border-white/10 transition-colors cursor-pointer active:scale-95"
                >
                  "{promptText}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
