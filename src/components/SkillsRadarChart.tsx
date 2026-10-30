import React, { useState } from 'react';
import { ResumeData } from '../types';

interface RadarDimension {
  id: string;
  label: string;
  shortLabel: string;
  candidateScore: number;
  benchmarkScore: number;
  description: string;
  gapStatus: 'exceeds' | 'matched' | 'gap';
}

interface SkillsRadarChartProps {
  resume: ResumeData;
  activeRewriteAccepted: boolean;
  addedSkills: string[];
}

export const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({
  resume,
  activeRewriteAccepted,
  addedSkills,
}) => {
  const [selectedRole, setSelectedRole] = useState<'vp_eng' | 'cto' | 'head_infra'>('vp_eng');
  const [hoveredDimension, setHoveredDimension] = useState<RadarDimension | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Dynamic skill detections from uploaded resume
  const allSkills = [...resume.skills, ...addedSkills].map((s) => s.toLowerCase());
  const hasK8s = allSkills.some((s) => s.includes('kubernetes') || s.includes('container') || s.includes('k8s'));
  const hasFedRAMP = allSkills.some((s) => s.includes('fedramp') || s.includes('soc2') || s.includes('compliance') || s.includes('security'));
  const hasAWS = allSkills.some((s) => s.includes('aws') || s.includes('cloud') || s.includes('gcp') || s.includes('multi-region'));
  const hasDistributed = allSkills.some((s) => s.includes('distributed') || s.includes('microservices') || s.includes('architecture'));
  const hasLeadership = allSkills.some((s) => s.includes('stakeholder') || s.includes('hiring') || s.includes('p&l') || s.includes('budget') || s.includes('management'));

  // Calculate dynamic candidate dimension scores
  const cloudScore = Math.min(99, Math.max(68, Math.round(
    resume.metrics.keywordDensity * 0.6 + (hasDistributed ? 20 : 10) + (hasAWS ? 16 : 8)
  )));

  const resiliencyScore = Math.min(99, Math.max(65, Math.round(
    (hasK8s && hasAWS ? 95 : hasK8s || hasAWS ? 86 : 74) + (resume.metrics.impact > 85 ? 3 : -2)
  )));

  const stakeholderScore = Math.min(99, Math.max(70, Math.round(
    resume.metrics.impact * 0.4 + resume.metrics.executiveTone * 0.4 + (hasLeadership ? 18 : 8)
  )));

  const complianceScore = Math.min(99, Math.max(65, Math.round(
    hasFedRAMP ? 94 : 76 + (resume.metrics.readability > 90 ? 4 : 0)
  )));

  const orgDesignScore = Math.min(99, Math.max(68, Math.round(
    resume.metrics.executiveTone * 0.6 + Math.min(30, resume.strongVerbsCount * 1.8)
  )));

  const velocityScore = Math.min(99, Math.max(65, Math.round(
    (activeRewriteAccepted ? 96 : 80) + (resume.metrics.impact > 88 ? 3 : -3)
  )));

  // Benchmark profiles based on target role
  const roleConfigs = {
    vp_eng: {
      name: 'VP of Engineering (Tier-1 SaaS)',
      targetSalary: '$380k – $480k',
      dimensions: [
        {
          id: 'cloud_arch',
          label: 'Distributed Systems & Cloud Architecture',
          shortLabel: 'Cloud & Distributed',
          candidateScore: cloudScore,
          benchmarkScore: 90,
          description: 'High-scale multi-tenant streaming & telemetry architectures',
        },
        {
          id: 'resiliency',
          label: 'Multi-Region & Container Orchestration',
          shortLabel: 'Multi-Region / K8s',
          candidateScore: resiliencyScore,
          benchmarkScore: 88,
          description: 'Kubernetes mesh, multi-region AWS failover, 99.999% SLA',
        },
        {
          id: 'stakeholder',
          label: 'Executive Stakeholder & P&L ($15M+)',
          shortLabel: 'Executive P&L',
          candidateScore: stakeholderScore,
          benchmarkScore: 85,
          description: 'Budgeting, board reporting, Series D to Pre-IPO alignment',
        },
        {
          id: 'compliance',
          label: 'Enterprise Governance & Security Compliance',
          shortLabel: 'Security & FedRAMP',
          candidateScore: complianceScore,
          benchmarkScore: 89,
          description: 'SOC2 Type II, zero-trust protocols, enterprise security gatekeeper',
        },
        {
          id: 'org_design',
          label: 'Org Design & Team Scaling (90+ Engineers)',
          shortLabel: 'Org Scaling (90+)',
          candidateScore: orgDesignScore,
          benchmarkScore: 86,
          description: 'Division restructuring, squad autonomy, executive mentorship',
        },
        {
          id: 'velocity',
          label: 'Feature Velocity & CI/CD Optimization',
          shortLabel: 'Velocity & CI/CD',
          candidateScore: velocityScore,
          benchmarkScore: 84,
          description: 'Zero-downtime release pipelines, cycle-time compression',
        },
      ],
    },
    cto: {
      name: 'Chief Technology Officer (Scale-up)',
      targetSalary: '$420k – $550k',
      dimensions: [
        {
          id: 'cloud_arch',
          label: 'Distributed Systems & Cloud Architecture',
          shortLabel: 'Cloud & Distributed',
          candidateScore: cloudScore,
          benchmarkScore: 94,
          description: 'High-scale multi-tenant streaming & telemetry architectures',
        },
        {
          id: 'resiliency',
          label: 'Multi-Region & Container Orchestration',
          shortLabel: 'Multi-Region / K8s',
          candidateScore: resiliencyScore,
          benchmarkScore: 90,
          description: 'Kubernetes mesh, multi-region AWS failover, 99.999% SLA',
        },
        {
          id: 'stakeholder',
          label: 'Executive Stakeholder & P&L ($15M+)',
          shortLabel: 'Executive P&L',
          candidateScore: stakeholderScore,
          benchmarkScore: 94,
          description: 'Budgeting, board reporting, Series D to Pre-IPO alignment',
        },
        {
          id: 'compliance',
          label: 'Enterprise Governance & Security Compliance',
          shortLabel: 'Security & FedRAMP',
          candidateScore: complianceScore,
          benchmarkScore: 92,
          description: 'SOC2 Type II, zero-trust protocols, enterprise security gatekeeper',
        },
        {
          id: 'org_design',
          label: 'Org Design & Team Scaling (90+ Engineers)',
          shortLabel: 'Org Scaling (90+)',
          candidateScore: orgDesignScore,
          benchmarkScore: 92,
          description: 'Division restructuring, squad autonomy, executive mentorship',
        },
        {
          id: 'velocity',
          label: 'Feature Velocity & CI/CD Optimization',
          shortLabel: 'Velocity & CI/CD',
          candidateScore: velocityScore,
          benchmarkScore: 88,
          description: 'Zero-downtime release pipelines, cycle-time compression',
        },
      ],
    },
    head_infra: {
      name: 'Head of Infrastructure & Reliability',
      targetSalary: '$360k – $460k',
      dimensions: [
        {
          id: 'cloud_arch',
          label: 'Distributed Systems & Cloud Architecture',
          shortLabel: 'Cloud & Distributed',
          candidateScore: cloudScore,
          benchmarkScore: 95,
          description: 'High-scale multi-tenant streaming & telemetry architectures',
        },
        {
          id: 'resiliency',
          label: 'Multi-Region & Container Orchestration',
          shortLabel: 'Multi-Region / K8s',
          candidateScore: resiliencyScore,
          benchmarkScore: 95,
          description: 'Kubernetes mesh, multi-region AWS failover, 99.999% SLA',
        },
        {
          id: 'stakeholder',
          label: 'Executive Stakeholder & P&L ($15M+)',
          shortLabel: 'Executive P&L',
          candidateScore: stakeholderScore,
          benchmarkScore: 80,
          description: 'Budgeting, board reporting, Series D to Pre-IPO alignment',
        },
        {
          id: 'compliance',
          label: 'Enterprise Governance & Security Compliance',
          shortLabel: 'Security & FedRAMP',
          candidateScore: complianceScore,
          benchmarkScore: 92,
          description: 'SOC2 Type II, zero-trust protocols, enterprise security gatekeeper',
        },
        {
          id: 'org_design',
          label: 'Org Design & Team Scaling (90+ Engineers)',
          shortLabel: 'Org Scaling (90+)',
          candidateScore: orgDesignScore,
          benchmarkScore: 82,
          description: 'Division restructuring, squad autonomy, executive mentorship',
        },
        {
          id: 'velocity',
          label: 'Feature Velocity & CI/CD Optimization',
          shortLabel: 'Velocity & CI/CD',
          candidateScore: velocityScore,
          benchmarkScore: 90,
          description: 'Zero-downtime release pipelines, cycle-time compression',
        },
      ],
    },
  };

  const currentConfig = roleConfigs[selectedRole];
  const dimensions: RadarDimension[] = currentConfig.dimensions.map((d) => ({
    ...d,
    gapStatus:
      d.candidateScore > d.benchmarkScore + 3
        ? 'exceeds'
        : d.candidateScore < d.benchmarkScore - 3
        ? 'gap'
        : 'matched',
  }));

  // SVG Geometry calculations
  const size = 320;
  const center = size / 2;
  const radius = 108;
  const numAxes = dimensions.length;

  const getCoordinates = (value: number, index: number, maxRadius = radius) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate web rings (20%, 40%, 60%, 80%, 100%)
  const webLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const webPolygons = webLevels.map((lvl) => {
    return Array.from({ length: numAxes })
      .map((_, i) => {
        const { x, y } = getCoordinates(100, i, radius * lvl);
        return `${x},${y}`;
      })
      .join(' ');
  });

  // Candidate polygon points
  const candidatePoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.candidateScore, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Benchmark polygon points
  const benchmarkPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.benchmarkScore, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Summary statistics
  const gapsCount = dimensions.filter((d) => d.gapStatus === 'gap').length;
  const exceedsCount = dimensions.filter((d) => d.gapStatus === 'exceeds').length;
  const averageCandidate = Math.round(
    dimensions.reduce((acc, curr) => acc + curr.candidateScore, 0) / dimensions.length
  );
  const averageBenchmark = Math.round(
    dimensions.reduce((acc, curr) => acc + curr.benchmarkScore, 0) / dimensions.length
  );

  return (
    <div className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-xl border border-outline-variant/60 dark:border-white/10 p-4 sm:p-space-lg shadow-xs transition-all">
      {/* Header with Role Selector & Collapse Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary-fixed/40 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-[#818cf8]">
            <span className="material-symbols-outlined text-[20px]">radar</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] text-on-surface dark:text-white">
                Executive Competency Radar vs. Industry Benchmark
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed/50 dark:bg-emerald-950 text-on-secondary-container dark:text-emerald-300 border border-secondary/20">
                Interactive Multi-Axis
              </span>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
              Evaluates your quantified profile against 500+ verified Fortune 500 job placements
            </p>
          </div>
        </div>

        {/* Role Selector Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-surface-container-low dark:bg-[#131b2e] p-1 rounded-lg border border-outline-variant/50 dark:border-white/10 text-xs">
            <button
              onClick={() => setSelectedRole('vp_eng')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                selectedRole === 'vp_eng'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              VP of Eng
            </button>
            <button
              onClick={() => setSelectedRole('cto')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                selectedRole === 'cto'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              CTO
            </button>
            <button
              onClick={() => setSelectedRole('head_infra')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                selectedRole === 'head_infra'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
              }`}
            >
              Head of Infra
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-outline hover:text-on-surface dark:hover:text-white rounded-lg hover:bg-surface-container dark:hover:bg-white/5 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Radar' : 'Expand Radar'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Visual SVG Radar (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-[320px] h-[320px] flex items-center justify-center select-none">
              <svg width={size} height={size} className="overflow-visible">
                {/* Background Concentric Web Polygons */}
                {webPolygons.map((pts, idx) => (
                  <polygon
                    key={idx}
                    points={pts}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray={idx === webPolygons.length - 1 ? 'none' : '2,2'}
                  />
                ))}

                {/* Spoke Axes */}
                {Array.from({ length: numAxes }).map((_, i) => {
                  const { x, y } = getCoordinates(100, i);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-slate-300 dark:text-slate-700"
                    />
                  );
                })}

                {/* Benchmark Polygon (Dashed Amber) */}
                <polygon
                  points={benchmarkPoints}
                  fill="rgba(245, 158, 11, 0.08)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                  className="transition-all duration-500 ease-out"
                />

                {/* Candidate Profile Polygon (Filled Indigo/Jade) */}
                <polygon
                  points={candidatePoints}
                  fill="rgba(79, 70, 229, 0.22)"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  className="transition-all duration-500 ease-out"
                />

                {/* Benchmark Vertices */}
                {dimensions.map((d, i) => {
                  const { x, y } = getCoordinates(d.benchmarkScore, i);
                  return (
                    <circle
                      key={`bench-${i}`}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-500"
                    />
                  );
                })}

                {/* Candidate Vertices & Interactive Hit Targets */}
                {dimensions.map((d, i) => {
                  const { x, y } = getCoordinates(d.candidateScore, i);
                  const isHovered = hoveredDimension?.id === d.id;
                  return (
                    <g
                      key={`cand-${i}`}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredDimension(d)}
                      onMouseLeave={() => setHoveredDimension(null)}
                    >
                      {/* Pulse ring on vertex */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? '9' : '5'}
                        fill="#4f46e5"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}

                {/* Labels around the perimeter */}
                {dimensions.map((d, i) => {
                  const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
                  const labelRadius = radius + 22;
                  const lx = center + labelRadius * Math.cos(angle);
                  const ly = center + labelRadius * Math.sin(angle);

                  let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                  if (Math.cos(angle) > 0.3) textAnchor = 'start';
                  else if (Math.cos(angle) < -0.3) textAnchor = 'end';

                  return (
                    <text
                      key={`label-${i}`}
                      x={lx}
                      y={ly}
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      className={`text-[9.5px] font-semibold transition-colors cursor-pointer ${
                        hoveredDimension?.id === d.id
                          ? 'fill-primary dark:fill-[#818cf8] font-bold text-[10.5px]'
                          : 'fill-slate-600 dark:fill-slate-400'
                      }`}
                      onMouseEnter={() => setHoveredDimension(d)}
                      onMouseLeave={() => setHoveredDimension(null)}
                    >
                      {d.shortLabel}
                    </text>
                  );
                })}
              </svg>

              {/* Center percentage badge */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-mono font-bold text-primary dark:text-[#818cf8]">
                  {averageCandidate}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-outline dark:text-slate-500 font-semibold">
                  Match
                </span>
              </div>
            </div>

            {/* Visual Legend */}
            <div className="flex items-center gap-4 text-xs mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-primary/20 border-2 border-primary"></span>
                <span className="font-semibold text-on-surface dark:text-white">
                  {resume.candidateName} ({averageCandidate}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500"></span>
                <span className="text-on-surface-variant dark:text-slate-400">
                  {currentConfig.name.split(' ')[0]} Benchmark ({averageBenchmark}%)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Dimensions Gap Diagnostic Breakdown (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Quick Summary Pill Bar */}
            <div className="flex items-center justify-between p-3 bg-surface-container-low dark:bg-[#131b2e] rounded-xl border border-outline-variant/40 dark:border-white/10 text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface dark:text-white">Target Position:</span>
                <span className="text-primary dark:text-[#818cf8] font-semibold">{currentConfig.name}</span>
                <span className="text-outline dark:text-slate-500">•</span>
                <span className="text-on-surface-variant dark:text-slate-400 font-mono">{currentConfig.targetSalary}</span>
              </div>

              <div className="flex items-center gap-2">
                {gapsCount === 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary-fixed dark:bg-emerald-950 text-on-secondary-container dark:text-emerald-300 border border-secondary/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    All Dimensions Meet/Exceed Standard
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-fixed dark:bg-amber-950 text-on-tertiary-fixed dark:text-amber-300 border border-tertiary-container/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    {gapsCount} Skill {gapsCount === 1 ? 'Gap' : 'Gaps'} Identified
                  </span>
                )}
                <span className="text-[11px] text-secondary dark:text-emerald-400 font-semibold">
                  {exceedsCount} Dominant {exceedsCount === 1 ? 'Metric' : 'Metrics'}
                </span>
              </div>
            </div>

            {/* Dimension Breakdown Rows */}
            <div className="space-y-2">
              {dimensions.map((dim) => {
                const isHovered = hoveredDimension?.id === dim.id;
                const delta = dim.candidateScore - dim.benchmarkScore;

                return (
                  <div
                    key={dim.id}
                    onMouseEnter={() => setHoveredDimension(dim)}
                    onMouseLeave={() => setHoveredDimension(null)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isHovered
                        ? 'bg-primary-fixed/20 dark:bg-primary/20 border-primary dark:border-[#6366f1] ring-1 ring-primary/30'
                        : 'bg-surface-container-low dark:bg-[#131b2e] border-outline-variant/40 dark:border-white/10 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-on-surface dark:text-white">
                          {dim.label}
                        </span>
                        {dim.gapStatus === 'exceeds' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-secondary-fixed/60 dark:bg-emerald-950 text-on-secondary-container dark:text-emerald-300 font-bold">
                            +{delta}% Strong Advantage
                          </span>
                        )}
                        {dim.gapStatus === 'gap' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-tertiary-fixed dark:bg-amber-950 text-on-tertiary-fixed dark:text-amber-300 font-bold">
                            {delta}% ATS Gap
                          </span>
                        )}
                        {dim.gapStatus === 'matched' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-surface-container dark:bg-white/10 text-on-surface-variant dark:text-slate-300 font-medium">
                            Meets Standard
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="font-bold text-primary dark:text-[#818cf8]">
                          {dim.candidateScore}%
                        </span>
                        <span className="text-outline dark:text-slate-500">/</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {dim.benchmarkScore}% target
                        </span>
                      </div>
                    </div>

                    {/* Progress Comparison Bar */}
                    <div className="relative w-full bg-surface-container dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                      {/* Benchmark marker line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                        style={{ left: `${dim.benchmarkScore}%` }}
                        title={`Benchmark target: ${dim.benchmarkScore}%`}
                      ></div>
                      {/* Candidate bar */}
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          dim.candidateScore >= dim.benchmarkScore
                            ? 'bg-primary dark:bg-[#6366f1]'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${dim.candidateScore}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-on-surface-variant dark:text-slate-400 mt-1">
                      <span>{dim.description}</span>
                      {dim.gapStatus === 'gap' && (
                        <span className="text-primary dark:text-[#818cf8] font-bold">
                          Action: Add suggested keywords or accept quantified rewrite
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
