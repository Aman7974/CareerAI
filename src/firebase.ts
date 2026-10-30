import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, ResumeData, JobMatch } from './types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: The app will break without this line passing firestoreDatabaseId */
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection on Boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Expected if 'test/connection' doc does not exist, but network reachable
    return true;
  }
}

// Real-Time Database Entry Model
export interface LiveDatabaseEntry {
  id: string;
  collectionName: 'users' | 'resumes' | 'savedJobs' | 'databaseEntries';
  action: 'CREATE' | 'UPDATE' | 'SYNC' | 'DELETE';
  entityId: string;
  summary: string;
  details?: string;
  timestamp: string;
}

/**
 * Log an entry to the real-time database activity stream
 */
export async function recordDatabaseEntry(entry: Omit<LiveDatabaseEntry, 'timestamp'>): Promise<void> {
  const path = 'databaseEntries';
  const entryId = entry.id || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  try {
    const payload: LiveDatabaseEntry = {
      id: entryId,
      collectionName: entry.collectionName,
      action: entry.action,
      entityId: entry.entityId,
      summary: entry.summary.slice(0, 300),
      details: entry.details ? entry.details.slice(0, 2000) : undefined,
      timestamp
    };
    await setDoc(doc(db, path, entryId), payload);
  } catch (err) {
    console.warn('Could not record database audit entry:', err);
  }
}

/**
 * Save / Sync user profile in Firestore
 */
export async function saveUserToFirestore(profile: UserProfile): Promise<void> {
  const sanitizedId = (profile.email || 'user').replace(/[^a-zA-Z0-9_\-\.:@]/g, '_');
  const path = 'users';

  try {
    const docData = {
      id: sanitizedId,
      fullName: profile.name || 'User',
      email: profile.email,
      country: profile.country || 'United States',
      countryCode: profile.countryCode || 'us',
      preferredLocation: profile.location || profile.locationPreference || '',
      targetRole: profile.targetRole || '',
      emailVerified: !!profile.emailVerified,
      isGoogleAccount: !!profile.isGoogleAccount,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, path, sanitizedId), docData, { merge: true });

    // Record audit entry in live stream
    await recordDatabaseEntry({
      id: `evt-user-${Date.now()}`,
      collectionName: 'users',
      action: 'UPDATE',
      entityId: sanitizedId,
      summary: `User Profile Stored: ${profile.name} (${profile.email}) in ${profile.country || 'US'}`,
      details: JSON.stringify(docData, null, 2)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${sanitizedId}`);
  }
}

/**
 * Save / Sync Resume in Firestore
 */
export async function saveResumeToFirestore(resume: ResumeData, userId?: string): Promise<void> {
  const sanitizedId = (resume.id || `res-${Date.now()}`).replace(/[^a-zA-Z0-9_\-\.:@]/g, '_');
  const path = 'resumes';

  try {
    const docData = {
      id: sanitizedId,
      userId: userId || 'anonymous',
      fullName: resume.candidateName || 'Candidate',
      title: resume.headline || 'Professional',
      email: resume.contactInfo || '',
      atsScore: resume.overallScore || 75,
      skillsCount: resume.skills?.length || 0,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, path, sanitizedId), docData, { merge: true });

    // Record audit entry in live stream
    await recordDatabaseEntry({
      id: `evt-resume-${Date.now()}`,
      collectionName: 'resumes',
      action: 'SYNC',
      entityId: sanitizedId,
      summary: `Resume Stored: "${docData.title}" for ${docData.fullName} (Score: ${docData.atsScore}%)`,
      details: JSON.stringify({
        ...docData,
        skillsPreview: resume.skills?.slice(0, 8) || [],
        experienceCount: resume.workExperience?.length || 0
      }, null, 2)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${sanitizedId}`);
  }
}

/**
 * Save / Sync Job in Firestore
 */
export async function saveJobToFirestore(job: JobMatch, userId?: string): Promise<void> {
  const sanitizedId = (job.id || `job-${Date.now()}`).replace(/[^a-zA-Z0-9_\-\.:@]/g, '_');
  const path = 'savedJobs';

  try {
    const docData = {
      id: sanitizedId,
      userId: userId || 'anonymous',
      jobTitle: job.title || 'Role',
      company: job.company || 'Company',
      location: job.location || '',
      salary: job.salary || '',
      status: 'saved',
      countryCode: job.countryCode || 'us',
      applyUrl: job.applyUrl || '',
      savedAt: new Date().toISOString()
    };

    await setDoc(doc(db, path, sanitizedId), docData, { merge: true });

    // Record audit entry in live stream
    await recordDatabaseEntry({
      id: `evt-job-${Date.now()}`,
      collectionName: 'savedJobs',
      action: 'CREATE',
      entityId: sanitizedId,
      summary: `Job Saved to Database: "${job.title}" at ${job.company} (${job.location})`,
      details: JSON.stringify(docData, null, 2)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${sanitizedId}`);
  }
}

/**
 * Subscribe to Real-Time Database Activity Entries with onSnapshot
 */
export function subscribeToLiveEntries(
  callback: (entries: LiveDatabaseEntry[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'databaseEntries';
  const q = query(collection(db, path), limit(40));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: LiveDatabaseEntry[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as LiveDatabaseEntry);
      });
      // Sort newest first
      items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      callback(items);
    },
    (error) => {
      console.error('Error listening to live database entries:', error);
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to Real-Time Users list with onSnapshot
 */
export function subscribeToUsers(
  callback: (users: any[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'users';
  const q = query(collection(db, path), limit(25));

  return onSnapshot(
    q,
    (snapshot) => {
      const users: any[] = [];
      snapshot.forEach((d) => users.push(d.data()));
      callback(users);
    },
    (error) => {
      console.error('Error listening to users collection:', error);
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to Real-Time Resumes list with onSnapshot
 */
export function subscribeToResumes(
  callback: (resumes: any[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'resumes';
  const q = query(collection(db, path), limit(25));

  return onSnapshot(
    q,
    (snapshot) => {
      const resumes: any[] = [];
      snapshot.forEach((d) => resumes.push(d.data()));
      callback(resumes);
    },
    (error) => {
      console.error('Error listening to resumes collection:', error);
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to Real-Time Saved Jobs list with onSnapshot
 */
export function subscribeToSavedJobs(
  callback: (jobs: any[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'savedJobs';
  const q = query(collection(db, path), limit(25));

  return onSnapshot(
    q,
    (snapshot) => {
      const jobs: any[] = [];
      snapshot.forEach((d) => jobs.push(d.data()));
      callback(jobs);
    },
    (error) => {
      console.error('Error listening to savedJobs collection:', error);
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
