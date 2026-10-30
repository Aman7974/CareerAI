export interface MetricScore {
  name: string;
  score: number;
  label: string;
  icon: string;
  colorClass: string;
  barColorClass: string;
}

export interface BulletPoint {
  id: string;
  text: string;
  isFlagged?: boolean;
  flagReason?: string;
  rewriteText?: string;
  hasStrongVerb?: boolean;
  hasQuantification?: boolean;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  bullets: BulletPoint[];
}

export interface ResumeSection {
  title: string;
  content: string[];
}

export interface ResumeData {
  id: string;
  fileName: string;
  tier: string;
  lastScanned: string;
  parserEngine: string;
  targetMarket: string;
  candidateName: string;
  contactInfo: string;
  headline: string;
  executiveProfile: string;
  workExperience: WorkExperience[];
  education?: string[];
  projects?: { title: string; description: string; tech?: string }[];
  certifications?: string[];
  additionalSections?: ResumeSection[];
  rawText?: string;
  skills: string[];
  suggestedSkills: { name: string; frequency: string; reason: string }[];
  missingKeywords: string[];
  strongVerbsCount: number;
  passiveVoiceCount: number;
  overallScore: number;
  metrics: {
    impact: number;
    keywordDensity: number;
    readability: number;
    executiveTone: number;
  };
  parseHash: string;
}

export type JobPortalSource =
  | 'Unstop'
  | 'LinkedIn'
  | 'Naukri'
  | 'Rozgaar Govt'
  | 'DRDO Careers'
  | 'Career Page'
  | 'Adzuna'
  | 'Web Live Feed'
  | 'Direct Employer';

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  logoColor: string;
  location: string;
  matchScore: number;
  salary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  tier: string;
  postedDate: string;
  roleCategory?: string;
  applyUrl?: string;
  source?: 'Adzuna' | 'Web Live Feed' | 'Direct Employer';
  portalSource?: JobPortalSource;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
  description?: string;
  country?: string;
  countryCode?: string;
}

export interface CoPilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  experienceLevel: string;
  yearsOfExperience: string;
  domain?: string;
  locationPreference?: string;
  location?: string;
  country?: string;
  countryCode?: string;
  emailVerified?: boolean;
  isGoogleAccount?: boolean;
  registeredPassword?: string;
}

