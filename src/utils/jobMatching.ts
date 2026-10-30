import { ResumeData, JobMatch } from '../types';

export interface BaseJobOpening {
  id: string;
  title: string;
  company: string;
  logoColor: string;
  location: string;
  city: string;
  salary: string;
  tier: string;
  postedDate: string;
  requiredKeywords: string[];
  roleCategory: 'fullstack' | 'frontend' | 'backend' | 'data' | 'devops' | 'leadership' | 'general';
}

export const ALL_JOB_OPENINGS: BaseJobOpening[] = [
  // San Francisco / Bay Area
  {
    id: 'job-sf-1',
    title: 'Senior Full Stack Software Engineer',
    company: 'Stripe',
    logoColor: '#635BFF',
    location: 'San Francisco, CA (Hybrid / Remote)',
    city: 'San Francisco',
    salary: '$185,000 – $240,000 + Equity',
    tier: 'Tier-1 Fintech Leader',
    postedDate: '2 days ago',
    roleCategory: 'fullstack',
    requiredKeywords: [
      'TypeScript & JavaScript',
      'React & Modern Frontend',
      'Node.js & Backend Services',
      'SQL & Database Design (PostgreSQL)',
      'RESTful API Integration',
      'CI/CD Pipelines & Git Workflows',
    ],
  },
  {
    id: 'job-sf-2',
    title: 'Software Engineer III — Core Applications',
    company: 'Google',
    logoColor: '#4285F4',
    location: 'Mountain View / San Francisco, CA',
    city: 'San Francisco',
    salary: '$190,000 – $260,000 + Stock',
    tier: 'Top Tech Pioneer',
    postedDate: 'Just now',
    roleCategory: 'fullstack',
    requiredKeywords: [
      'Problem Solving & Algorithms',
      'TypeScript & JavaScript',
      'React & Modern Frontend',
      'Docker & Container Workflows',
      'Code Quality & Peer Reviews',
      'RESTful API Integration',
    ],
  },
  {
    id: 'job-sf-3',
    title: 'Senior Frontend Engineer — Design Systems',
    company: 'Airbnb',
    logoColor: '#FF5A5F',
    location: 'San Francisco, CA / Hybrid',
    city: 'San Francisco',
    salary: '$180,000 – $235,000 + Equity',
    tier: 'Global Consumer Tech',
    postedDate: '1 day ago',
    roleCategory: 'frontend',
    requiredKeywords: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Web Performance Optimization',
      'State Management (Redux/Zustand)',
      'CI/CD & Automated Testing (Jest/Cypress)',
    ],
  },

  // New York, NY
  {
    id: 'job-ny-1',
    title: 'Full Stack Engineer — Creator Products',
    company: 'Spotify',
    logoColor: '#1DB954',
    location: 'New York, NY (Hybrid / Remote)',
    city: 'New York',
    salary: '$175,000 – $230,000',
    tier: 'Global Streaming Platform',
    postedDate: '4 days ago',
    roleCategory: 'fullstack',
    requiredKeywords: [
      'React',
      'TypeScript',
      'Node.js / Python',
      'RESTful API & GraphQL Design',
      'CI/CD Automation',
      'Git & Version Control',
    ],
  },
  {
    id: 'job-ny-2',
    title: 'Senior Backend Engineer — Distributed Infrastructure',
    company: 'Datadog',
    logoColor: '#7742DA',
    location: 'New York, NY',
    city: 'New York',
    salary: '$185,000 – $245,000 + Equity',
    tier: 'Cloud Observability Leader',
    postedDate: '3 days ago',
    roleCategory: 'backend',
    requiredKeywords: [
      'Node.js / Python',
      'PostgreSQL & SQL Optimization',
      'Microservices Architecture',
      'Redis Caching & In-Memory Stores',
      'Docker & Containerization',
      'RESTful API & GraphQL Design',
    ],
  },

  // Seattle, WA
  {
    id: 'job-sea-1',
    title: 'Senior Cloud & DevOps Infrastructure Engineer',
    company: 'Amazon Web Services',
    logoColor: '#FF9900',
    location: 'Seattle, WA (Hybrid / Remote)',
    city: 'Seattle',
    salary: '$195,000 – $265,000 + RSUs',
    tier: 'Cloud Infrastructure Pioneer',
    postedDate: '2 days ago',
    roleCategory: 'devops',
    requiredKeywords: [
      'Kubernetes & Container Orchestration',
      'AWS / GCP Cloud Architecture',
      'Terraform (Infrastructure as Code)',
      'CI/CD Automation (GitHub Actions/GitLab)',
      'System Observability (Prometheus, Grafana, Datadog)',
      'Zero-Trust & Cloud Security',
    ],
  },
  {
    id: 'job-sea-2',
    title: 'Software Engineer II — Azure Platform',
    company: 'Microsoft',
    logoColor: '#00A4EF',
    location: 'Redmond / Seattle, WA',
    city: 'Seattle',
    salary: '$175,000 – $240,000 + Stock',
    tier: 'Enterprise Cloud Leader',
    postedDate: '3 days ago',
    roleCategory: 'fullstack',
    requiredKeywords: [
      'TypeScript & JavaScript',
      'React & Modern Frontend',
      'Node.js & Backend Services',
      'SQL & Database Design (PostgreSQL)',
      'Docker & Container Workflows',
    ],
  },

  // Austin, TX
  {
    id: 'job-atx-1',
    title: 'Full Stack Software Engineer',
    company: 'Dell Technologies',
    logoColor: '#007DB8',
    location: 'Austin, TX (Hybrid)',
    city: 'Austin',
    salary: '$165,000 – $215,000',
    tier: 'Enterprise Hardware & SaaS',
    postedDate: '3 days ago',
    roleCategory: 'fullstack',
    requiredKeywords: [
      'TypeScript & JavaScript',
      'React & Modern Frontend',
      'RESTful API Integration',
      'SQL & Database Design (PostgreSQL)',
      'Git & Version Control',
    ],
  },
  {
    id: 'job-atx-2',
    title: 'Senior Backend Developer — Search Core',
    company: 'Indeed',
    logoColor: '#2164f3',
    location: 'Austin, TX / Remote',
    city: 'Austin',
    salary: '$180,000 – $230,000',
    tier: 'Global Talent Marketplace',
    postedDate: '1 week ago',
    roleCategory: 'backend',
    requiredKeywords: [
      'Node.js / Python',
      'PostgreSQL & SQL Optimization',
      'Microservices Architecture',
      'Redis Caching & In-Memory Stores',
      'Problem Solving & Algorithms',
    ],
  },

  // London, UK
  {
    id: 'job-lon-1',
    title: 'Lead Full Stack Engineer — Global Core',
    company: 'Revolut',
    logoColor: '#0075eb',
    location: 'London, UK (Hybrid / Remote)',
    city: 'London',
    salary: '£110,000 – £150,000 + Equity',
    tier: 'Global Fintech Unicorn',
    postedDate: '2 days ago',
    roleCategory: 'fullstack',
    requiredKeywords: [
      'TypeScript & JavaScript',
      'React & Modern Frontend',
      'Node.js & Backend Services',
      'PostgreSQL & SQL Optimization',
      'Microservices Architecture',
    ],
  },

  // Bangalore, India
  {
    id: 'job-blr-1',
    title: 'Senior Software Development Engineer (SDE-2)',
    company: 'Flipkart',
    logoColor: '#2874F0',
    location: 'Bangalore, India (Hybrid)',
    city: 'Bangalore',
    salary: '₹35,00,000 – ₹52,00,000',
    tier: 'E-Commerce Marketplace Giant',
    postedDate: '1 day ago',
    roleCategory: 'fullstack',
    requiredKeywords: [
      'Problem Solving & Algorithms',
      'TypeScript & JavaScript',
      'React & Modern Frontend',
      'Node.js & Backend Services',
      'SQL & Database Design (PostgreSQL)',
    ],
  },
  {
    id: 'job-blr-2',
    title: 'Backend Systems Engineer — High Throughput',
    company: 'Swiggy',
    logoColor: '#FC8019',
    location: 'Bangalore, India',
    city: 'Bangalore',
    salary: '₹32,00,000 – ₹48,00,000',
    tier: 'On-Demand Logistics Pioneer',
    postedDate: '4 days ago',
    roleCategory: 'backend',
    requiredKeywords: [
      'Node.js / Python',
      'PostgreSQL & SQL Optimization',
      'Microservices Architecture',
      'Redis Caching & In-Memory Stores',
      'Docker & Containerization',
    ],
  },

  // Worldwide Remote / Distributed
  {
    id: 'job-rem-1',
    title: 'Machine Learning & Data Systems Engineer',
    company: 'OpenAI',
    logoColor: '#10A37F',
    location: 'San Francisco, CA / Remote (Worldwide)',
    city: 'Remote',
    salary: '$240,000 – $350,000 + Equity',
    tier: 'Frontier AI Research',
    postedDate: '1 day ago',
    roleCategory: 'data',
    requiredKeywords: [
      'Python (NumPy, Pandas)',
      'Machine Learning Frameworks (PyTorch/Scikit-Learn)',
      'SQL & Data Warehousing (BigQuery/Snowflake)',
      'ETL & Data Pipeline Topologies',
      'Model Evaluation & Metrics',
      'Docker & Containerization',
    ],
  },
  {
    id: 'job-rem-2',
    title: 'Staff UI / Frontend Platform Engineer',
    company: 'Netflix',
    logoColor: '#E50914',
    location: 'Los Gatos, CA / Remote',
    city: 'Remote',
    salary: '$220,000 – $310,000',
    tier: 'Entertainment & Streaming Leader',
    postedDate: '3 days ago',
    roleCategory: 'frontend',
    requiredKeywords: [
      'React',
      'TypeScript',
      'Web Performance Optimization',
      'State Management (Redux/Zustand)',
      'REST APIs & GraphQL',
      'Code Quality & Peer Reviews',
    ],
  },
  {
    id: 'job-rem-3',
    title: 'Senior Full Stack Engineer — Developer Tools',
    company: 'GitHub',
    logoColor: '#24292e',
    location: 'Remote (Worldwide)',
    city: 'Remote',
    salary: '$180,000 – $240,000',
    tier: 'Developer Ecosystem Standard',
    postedDate: '2 days ago',
    roleCategory: 'fullstack',
    requiredKeywords: [
      'TypeScript & JavaScript',
      'React & Modern Frontend',
      'Node.js & Backend Services',
      'Git & Version Control',
      'CI/CD Pipelines & Git Workflows',
    ],
  },
];

/**
 * Categorize target headline or profile to select relevant jobs
 */
function getCategoryFromRole(roleTitle: string): 'fullstack' | 'frontend' | 'backend' | 'data' | 'devops' | 'leadership' | 'general' {
  const r = roleTitle.toLowerCase();
  if (r.includes('lead') || r.includes('manager') || r.includes('director') || r.includes('vp') || r.includes('head')) return 'leadership';
  if (r.includes('front') || r.includes('ui') || r.includes('react')) return 'frontend';
  if (r.includes('back') || r.includes('api') || r.includes('database')) return 'backend';
  if (r.includes('data') || r.includes('ml') || r.includes('ai') || r.includes('machine')) return 'data';
  if (r.includes('devops') || r.includes('cloud') || r.includes('sre') || r.includes('infra')) return 'devops';
  if (r.includes('full') || r.includes('software') || r.includes('developer') || r.includes('engineer')) return 'fullstack';
  return 'general';
}

/**
 * Calculates dynamic job matches tailored to the uploaded resume, target profile, and location.
 */
export function calculateJobMatchesForResume(resume: ResumeData, preferredLocation?: string): JobMatch[] {
  const targetCategory = getCategoryFromRole(resume.headline || resume.targetMarket);
  const candidateSkillsLower = resume.skills.map((s) => s.toLowerCase());
  const resumeTextLower = (
    (resume.rawText || '') +
    ' ' +
    resume.executiveProfile +
    ' ' +
    resume.workExperience.flatMap((e) => e.bullets.map((b) => b.text)).join(' ')
  ).toLowerCase();

  const userLocClean = (preferredLocation || resume.contactInfo || '').toLowerCase();

  // Score jobs by role relevance and location proximity
  const sortedJobs = [...ALL_JOB_OPENINGS].sort((a, b) => {
    let aScore = 0;
    let bScore = 0;

    // Role category match
    if (a.roleCategory === targetCategory) aScore += 10;
    if (b.roleCategory === targetCategory) bScore += 10;

    // Location match
    if (userLocClean) {
      const aLoc = a.location.toLowerCase();
      const bLoc = b.location.toLowerCase();
      const aCity = a.city.toLowerCase();
      const bCity = b.city.toLowerCase();

      // Check if user location mentions city or state
      if (userLocClean.includes(aCity) || aLoc.includes(userLocClean)) aScore += 25;
      if (userLocClean.includes(bCity) || bLoc.includes(userLocClean)) bScore += 25;

      // Remote jobs are universally accessible
      if (aLoc.includes('remote')) aScore += 8;
      if (bLoc.includes('remote')) bScore += 8;
    }

    return bScore - aScore;
  });

  return sortedJobs.slice(0, 8).map((job) => {
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    job.requiredKeywords.forEach((kw) => {
      const kwLower = kw.toLowerCase();
      const parts = kwLower.split(/[/,&()]+/).map((p) => p.trim()).filter(Boolean);

      const isMatched =
        candidateSkillsLower.some((s) => kwLower.includes(s) || s.includes(kwLower)) ||
        parts.some((p) => candidateSkillsLower.some((s) => s.includes(p) || p.includes(s))) ||
        parts.some((p) => resumeTextLower.includes(p));

      if (isMatched) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const keywordRatio = matchedKeywords.length / job.requiredKeywords.length;
    const rawScore = Math.round(keywordRatio * 65 + (resume.metrics.impact / 100) * 25 + 8);
    const matchScore = Math.min(99, Math.max(72, rawScore));

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      logoColor: job.logoColor,
      location: job.location,
      matchScore,
      salary: job.salary,
      matchedKeywords,
      missingKeywords,
      tier: job.tier,
      postedDate: job.postedDate,
      roleCategory: job.roleCategory,
    };
  });
}
