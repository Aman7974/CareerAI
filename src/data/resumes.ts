import { ResumeData, JobMatch, UserProfile } from '../types';

export function createDefaultResumeForUser(profile: UserProfile): ResumeData {
  return {
    id: `resume-${Date.now()}`,
    fileName: `${profile.name.replace(/\s+/g, '_')}_Resume.pdf`,
    tier: 'Professional Tier',
    lastScanned: 'Just now',
    parserEngine: 'CareerAI Smart ATS Engine v5.0',
    targetMarket: profile.targetRole,
    candidateName: profile.name.toUpperCase(),
    contactInfo: `${profile.email} • ${profile.locationPreference || 'Remote / Hybrid'}`,
    headline: profile.targetRole.toUpperCase(),
    executiveProfile: `${profile.targetRole} with ${profile.yearsOfExperience}+ years of proven experience in ${profile.domain || 'software engineering'}. Demonstrated track record delivering scalable technical solutions and accelerating development velocity.`,
    workExperience: [
      {
        id: 'exp-1',
        title: profile.targetRole,
        company: 'Technology Systems',
        period: '2021 — PRESENT',
        bullets: [
          {
            id: 'b1-1',
            text: `Spearheaded key application initiatives and modernized core software architecture, accelerating feature delivery velocity by 34%.`,
            hasStrongVerb: true,
            hasQuantification: true,
          },
          {
            id: 'b1-2',
            text: `Responsible for writing unit tests and assisting team with bug resolution.`,
            isFlagged: true,
            flagReason: 'Flagged: Weak passive phrasing ("responsible for") and missing impact metrics',
            rewriteText: `Engineered comprehensive automated unit and integration test suites, reducing production bugs by 42% and elevating test coverage to 92%.`,
            hasStrongVerb: false,
            hasQuantification: false,
          },
          {
            id: 'b1-3',
            text: `Implemented automated CI/CD deployment pipelines, cutting release cycle times by 40% while maintaining 99.9% uptime.`,
            hasStrongVerb: true,
            hasQuantification: true,
          },
        ],
      },
      {
        id: 'exp-2',
        title: 'Software Developer',
        company: 'Digital Solutions Lab',
        period: '2019 — 2021',
        bullets: [
          {
            id: 'b2-1',
            text: `Worked on backend database queries and REST APIs for client dashboard.`,
            isFlagged: true,
            flagReason: 'Flagged: Weak passive verb ("worked on") and lacks measurable outcome',
            rewriteText: `Architected high-throughput REST APIs and indexed SQL database queries, decreasing average response latency by 38% for 500k+ active users.`,
            hasStrongVerb: false,
            hasQuantification: false,
          },
          {
            id: 'b2-2',
            text: `Collaborated with product designers to ship responsive UI components, improving end-user task completion rate by 25%.`,
            hasStrongVerb: true,
            hasQuantification: true,
          },
        ],
      },
    ],
    education: ['Bachelor of Science in Computer Science / Engineering'],
    skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST APIs', 'Docker', 'CI/CD'],
    suggestedSkills: [
      { name: 'TypeScript & Modern Frontend', frequency: 'Found in 95% of postings', reason: 'Industry standard for typed full-stack software' },
      { name: 'System Observability & Monitoring', frequency: 'Required for production systems', reason: 'Ensures reliability and uptime' },
      { name: 'Automated Testing (Jest/Cypress)', frequency: 'Found in 88% of postings', reason: 'Core requirement for production quality' },
    ],
    missingKeywords: ['System Observability & Monitoring', 'Automated Testing (Jest/Cypress)'],
    strongVerbsCount: 8,
    passiveVoiceCount: 2,
    overallScore: 78,
    metrics: {
      impact: 74,
      keywordDensity: 78,
      readability: 94,
      executiveTone: 76,
    },
    parseHash: '#ATS-4100',
  };
}

export const initialResume: ResumeData = {
  id: 'resume-active-candidate',
  fileName: 'Candidate_Resume.pdf',
  tier: 'Professional Tier',
  lastScanned: 'Just now',
  parserEngine: 'CareerAI Smart ATS Engine v5.0',
  targetMarket: 'Software Engineering',
  candidateName: 'CANDIDATE',
  contactInfo: 'candidate@careerai.dev • Remote / Hybrid',
  headline: 'SOFTWARE ENGINEER / FULL STACK DEVELOPER',
  executiveProfile: 'Software Engineer with demonstrated experience developing scalable full-stack applications, designing robust REST APIs, and collaborating with cross-functional engineering teams to ship reliable features.',
  workExperience: [
    {
      id: 'exp-1',
      title: 'Software Engineer',
      company: 'Enterprise Software Systems',
      period: '2021 — PRESENT',
      bullets: [
        {
          id: 'b1-1',
          text: 'Architected and deployed responsive full-stack features and API endpoints, accelerating application performance by 36% for 850k active users.',
          hasStrongVerb: true,
          hasQuantification: true,
        },
        {
          id: 'b1-2',
          text: 'Responsible for bug fixes and maintaining team code repositories.',
          isFlagged: true,
          flagReason: 'Flagged: Weak passive phrasing ("responsible for") & missing quantifiable business impact',
          rewriteText: 'Engineered automated regression test suites and resolved 45+ critical production defects, reducing release rollback frequency by 40%.',
          hasStrongVerb: false,
          hasQuantification: false,
        },
        {
          id: 'b1-3',
          text: 'Streamlined continuous integration workflows, reducing pull request build turnaround time by 45%.',
          hasStrongVerb: true,
          hasQuantification: true,
        },
      ],
    },
    {
      id: 'exp-2',
      title: 'Junior Software Developer',
      company: 'Tech Innovations Lab',
      period: '2019 — 2021',
      bullets: [
        {
          id: 'b2-1',
          text: 'Assisted senior engineers with frontend components and styling.',
          isFlagged: true,
          flagReason: 'Flagged: Passive phrasing ("assisted with") & missing metric or result',
          rewriteText: 'Developed reusable UI component library in React/TypeScript, cutting design-to-development handoff times by 30%.',
          hasStrongVerb: false,
          hasQuantification: false,
        },
        {
          id: 'b2-2',
          text: 'Optimized SQL database queries and reduced page load times by 28%.',
          hasStrongVerb: true,
          hasQuantification: true,
        },
      ],
    },
  ],
  education: ['B.S. in Computer Science — University Graduate'],
  skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs', 'Docker', 'CI/CD'],
  suggestedSkills: [
    { name: 'TypeScript & JavaScript', frequency: 'Found in 95% of job postings', reason: 'Universal programming language requirement' },
    { name: 'Automated Testing (Jest/Cypress)', frequency: 'Found in 89% of postings', reason: 'Core requirement for scalable codebases' },
    { name: 'Cloud & Containerization (Docker/AWS)', frequency: 'Found in 91% of postings', reason: 'Modern deployment and environment isolation' },
  ],
  missingKeywords: ['Automated Testing (Jest/Cypress)', 'Cloud & Containerization (Docker/AWS)'],
  strongVerbsCount: 7,
  passiveVoiceCount: 2,
  overallScore: 76,
  metrics: {
    impact: 72,
    keywordDensity: 76,
    readability: 95,
    executiveTone: 74,
  },
  parseHash: '#ATS-8820',
};

export const sampleResumesList: ResumeData[] = [
  initialResume,
];

export const sampleCoPilotQA: { question: string; answer: string; suggestedAction?: { label: string; actionType: string } }[] = [
  {
    question: 'How do I pass modern ATS resume screening filters?',
    answer: 'ATS screeners score resumes on three factors: (1) Quantified results ($ amounts, % gains, metrics), (2) Strong active verbs (Engineered, Architected, Spearheaded), and (3) Exact keyword matches for your target role. Turn on AI Mode to fix all three in 1 click.',
    suggestedAction: { label: 'Enable AI Mode', actionType: 'ai-mode' },
  },
  {
    question: 'What keywords are missing from my resume?',
    answer: 'Recruiters search for role-specific keywords. For software engineering, high-value keywords include automated testing (Jest/Cypress), containerization (Docker), and cloud services. Click "Add Keyword" to incorporate them directly.',
    suggestedAction: { label: 'View Required Keywords', actionType: 'view-keywords' },
  },
];
