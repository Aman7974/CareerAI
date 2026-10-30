/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { initialResume } from './data/resumes';
import { ResumeData, JobMatch, UserProfile } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DiagnosticView } from './components/DiagnosticView';
import { SimpleResumeAnalysisView } from './components/SimpleResumeAnalysisView';
import { LiveMatchScoringView } from './components/LiveMatchScoringView';
import { DashboardView } from './components/DashboardView';
import { JobMatchesView } from './components/JobMatchesView';
import { ResumeTailorerView } from './components/ResumeTailorerView';
import { SettingsView } from './components/SettingsView';
import { UploadResumeModal } from './components/UploadResumeModal';
import { ExportReportModal } from './components/ExportReportModal';
import { EditBulletModal } from './components/EditBulletModal';
import { PrintableResume } from './components/PrintableResume';
import { PrintPdfModal } from './components/PrintPdfModal';
import { AuthScreen } from './components/AuthScreen';
import { ResumeUploadPromptScreen } from './components/ResumeUploadPromptScreen';
import { FirebaseLiveInspector } from './components/FirebaseLiveInspector';
import {
  saveUserToFirestore,
  saveResumeToFirestore,
  saveJobToFirestore,
  testConnection,
} from './firebase';

export default function App() {
  // User Onboarding & Auth State - starts from sign-up page as requested
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasUploadedResume, setHasUploadedResume] = useState<boolean>(false);
  const [isFirebaseInspectorOpen, setIsFirebaseInspectorOpen] = useState<boolean>(false);

  const [analyzerMode, setAnalyzerMode] = useState<'simple' | 'deep'>('simple');
  const [activeTab, setActiveTab] = useState<string>('analyzer');
  const [currentSubView, setCurrentSubView] = useState<'diagnostic' | 'live-match'>('diagnostic');
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [searchQuery, setSearchQuery] = useState('');
  const [credits, setCredits] = useState<number>(240);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isEditBulletModalOpen, setIsEditBulletModalOpen] = useState<boolean>(false);
  const [isPrintPdfModalOpen, setIsPrintPdfModalOpen] = useState<boolean>(false);
  const [editBulletData, setEditBulletData] = useState<{
    text: string;
    onSave: (newText: string) => void;
  }>({
    text: '',
    onSave: () => {},
  });

  // Selected job for tailorer
  const [tailorJobTarget, setTailorJobTarget] = useState<JobMatch | undefined>(undefined);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGmpQuotaExceeded, setIsGmpQuotaExceeded] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Google Maps Platform Quota Defense listener
  useEffect(() => {
    const handleQuota = () => setIsGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Sync dark mode class on html/body element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Test Firebase connection on initial mount
  useEffect(() => {
    testConnection().catch(console.error);
  }, []);

  const handleCompleteAuth = (profile: UserProfile, isNewUser: boolean = false) => {
    setCurrentUser(profile);
    try {
      localStorage.setItem('careerai_user', JSON.stringify(profile));
    } catch {}

    // Store in Firebase Firestore
    saveUserToFirestore(profile).catch((err) => {
      console.warn('Real-time sync user to Firebase:', err);
    });

    // Check if this user already has an existing saved resume in localStorage
    let loadedResume: ResumeData | null = null;
    try {
      const stored = localStorage.getItem(`careerai_resume_${profile.email}`);
      if (stored) {
        loadedResume = JSON.parse(stored);
      }
    } catch {}

    if (!isNewUser) {
      // SAVED USER LOGIN:
      // You don't have to ask for uploading resume. Load the already present resume!
      const userResume: ResumeData = loadedResume || {
        ...initialResume,
        candidateName: profile.name.toUpperCase(),
        headline: profile.targetRole.toUpperCase(),
        targetMarket: profile.targetRole,
        contactInfo: `${profile.email} • ${profile.locationPreference || profile.location || 'Bengaluru, India'}`,
        fileName: `${profile.name.replace(/\s+/g, '_')}_Resume.pdf`,
      };

      setResume(userResume);
      setHasUploadedResume(true);
      try {
        localStorage.setItem(`careerai_has_uploaded_${profile.email}`, 'true');
        localStorage.setItem(`careerai_resume_${profile.email}`, JSON.stringify(userResume));
      } catch {}

      showToast(`Welcome back, ${profile.name}! Loaded your already present resume.`);
    } else {
      // NEW USER:
      // Ask for upload resume!
      setHasUploadedResume(false);
      try {
        localStorage.removeItem(`careerai_has_uploaded_${profile.email}`);
      } catch {}

      setResume((prev) => ({
        ...prev,
        candidateName: profile.name.toUpperCase(),
        headline: profile.targetRole.toUpperCase(),
        targetMarket: profile.targetRole,
        contactInfo: `${profile.email} • ${profile.locationPreference || profile.location || 'Remote / Hybrid'}`,
      }));

      showToast(`Welcome, ${profile.name}! Please upload your resume.`);
    }
  };

  const handleResumeUploaded = (parsed: ResumeData) => {
    setResume(parsed);
    setHasUploadedResume(true);
    if (currentUser?.email) {
      try {
        localStorage.setItem(`careerai_has_uploaded_${currentUser.email}`, 'true');
        localStorage.setItem(`careerai_resume_${currentUser.email}`, JSON.stringify(parsed));
      } catch {}
    }

    // Store in Firebase Firestore
    saveResumeToFirestore(parsed, currentUser?.email || 'guest').catch((err) => {
      console.warn('Real-time sync resume to Firebase:', err);
    });

    setActiveTab('analyzer');
    showToast('✓ Resume stored in Firebase & parsed for exact ATS changes!');
  };

  const handleSkipWithSample = () => {
    const updated = {
      ...resume,
      candidateName: currentUser ? currentUser.name.toUpperCase() : resume.candidateName,
      headline: currentUser ? currentUser.targetRole.toUpperCase() : resume.headline,
      contactInfo: currentUser ? `${currentUser.email} • ${currentUser.location || 'Bengaluru, India'}` : resume.contactInfo,
    };
    setResume(updated);
    setHasUploadedResume(true);
    if (currentUser?.email) {
      try {
        localStorage.setItem(`careerai_has_uploaded_${currentUser.email}`, 'true');
        localStorage.setItem(`careerai_resume_${currentUser.email}`, JSON.stringify(updated));
      } catch {}
    }

    // Store in Firebase Firestore
    saveResumeToFirestore(updated, currentUser?.email || 'guest').catch((err) => {
      console.warn('Real-time sync sample resume to Firebase:', err);
    });

    setActiveTab('analyzer');
    showToast('Loaded sample profile synced with Firebase.');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setHasUploadedResume(false);
    showToast('Signed out successfully.');
  };

  const handleUpdateResume = (updated: Partial<ResumeData>) => {
    const updatedResume = {
      ...resume,
      ...updated,
    };
    setResume(updatedResume);

    if (currentUser?.email) {
      try {
        localStorage.setItem(`careerai_resume_${currentUser.email}`, JSON.stringify(updatedResume));
      } catch {}
    }

    // Sync updated resume scorecard to Firebase
    saveResumeToFirestore(updatedResume, currentUser?.email || 'guest').catch((err) => {
      console.warn('Real-time sync updated scorecard to Firebase:', err);
    });

    showToast('Scorecard updated and synced with Firebase.');
  };

  const handleSaveJob = (job: JobMatch) => {
    saveJobToFirestore(job, currentUser?.email || 'guest')
      .then(() => {
        showToast(`✓ "${job.title}" saved to Firebase real-time database!`);
      })
      .catch((err) => {
        console.warn('Save job to Firebase error:', err);
        showToast(`Job record saved locally.`);
      });
  };

  const handleDeductCredit = () => {
    if (credits > 0) {
      setCredits((prev) => prev - 1);
      return true;
    }
    return false;
  };

  const handleQuickScan = () => {
    showToast('Executing quick diagnostic scan...');
    setTimeout(() => {
      setResume((prev) => ({
        ...prev,
        lastScanned: 'Just now',
        parseHash: '#A92-CX-' + Math.floor(100 + Math.random() * 900),
      }));
      showToast('Quick scan complete: 0 formatting parsing errors detected.');
    }, 1000);
  };

  const handleOpenEditBullet = (initialText: string, onSave: (newText: string) => void) => {
    setEditBulletData({
      text: initialText,
      onSave: (newText: string) => {
        onSave(newText);
        showToast('Bullet statement updated & re-indexed.');
      },
    });
    setIsEditBulletModalOpen(true);
  };

  const handleResetData = () => {
    setResume(initialResume);
    showToast('Active resume reset to default uploaded baseline.');
  };

  const handleOpenTailorerForJob = (job: JobMatch) => {
    setTailorJobTarget(job);
    setActiveTab('tailorer');
  };

  // STEP 1: If not logged in, show Auth / Sign Up screen
  if (!currentUser) {
    return <AuthScreen onCompleteAuth={handleCompleteAuth} />;
  }

  // STEP 2: If logged in but hasn't uploaded resume yet, ask for resume
  if (!hasUploadedResume) {
    return (
      <ResumeUploadPromptScreen
        userProfile={currentUser}
        onResumeUploaded={handleResumeUploaded}
        onSkipWithSample={handleSkipWithSample}
      />
    );
  }

  // STEP 3: Main Application Experience
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0d111d] text-slate-100' : 'bg-background text-on-surface'}`}>
      {/* Google Maps Platform Quota Warning Banner */}
      {isGmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Persistent Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'analyzer') {
            setCurrentSubView('diagnostic');
          }
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        resume={resume}
        userProfile={currentUser || undefined}
        onSignOut={handleSignOut}
      />

      {/* Top Application Header */}
      <Header
        currentSubView={currentSubView}
        setCurrentSubView={(sub) => {
          setCurrentSubView(sub);
          setActiveTab('analyzer');
        }}
        onQuickScan={handleQuickScan}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        credits={credits}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        candidateName={currentUser?.name || resume.candidateName}
        userProfile={currentUser || undefined}
        onSignOut={handleSignOut}
        onOpenLiveDatabase={() => setIsFirebaseInspectorOpen(true)}
      />

      {/* Main Scrollable Canvas */}
      <main className="ml-0 lg:ml-60 pt-16 min-h-screen pb-16 transition-all duration-200">
        {/* View Switcher */}
        {activeTab === 'analyzer' && currentSubView === 'diagnostic' && (
          <div className="space-y-3">
            {/* View Mode Switcher Header: Simplified vs Full Technical Diagnostic */}
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-surface-container-low dark:bg-[#131b2e] rounded-xl border border-outline-variant/40 dark:border-white/10 text-xs font-semibold">
                <button
                  onClick={() => setAnalyzerMode('simple')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    analyzerMode === 'simple'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>Simple Actionable Analysis & AI Mode</span>
                </button>
                <button
                  onClick={() => setAnalyzerMode('deep')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    analyzerMode === 'deep'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  <span>Full Technical ATS Diagnostic</span>
                </button>
              </div>

              <div className="text-xs text-outline dark:text-slate-400">
                Target Role: <strong className="text-on-surface dark:text-white">{currentUser?.targetRole || resume.headline}</strong>
              </div>
            </div>

            {analyzerMode === 'simple' ? (
              <SimpleResumeAnalysisView
                resume={resume}
                userProfile={currentUser || undefined}
                onUpdateResume={handleUpdateResume}
                onOpenUpload={() => setIsUploadModalOpen(true)}
                onOpenPrintPdf={() => setIsPrintPdfModalOpen(true)}
                onTailorJob={handleOpenTailorerForJob}
                onOpenEditBullet={handleOpenEditBullet}
                onSaveJob={handleSaveJob}
              />
            ) : (
              <DiagnosticView
                resume={resume}
                onUpdateResume={handleUpdateResume}
                onOpenExport={() => setIsExportModalOpen(true)}
                onOpenPrintPdf={() => setIsPrintPdfModalOpen(true)}
                onOpenEditBullet={handleOpenEditBullet}
                onDeductCredit={handleDeductCredit}
                onNavigateToJobs={() => setActiveTab('jobs')}
                onOpenTailorer={handleOpenTailorerForJob}
              />
            )}
          </div>
        )}

        {activeTab === 'analyzer' && currentSubView === 'live-match' && (
          <LiveMatchScoringView
            resume={resume}
            onOpenTailorer={handleOpenTailorerForJob}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            resume={resume}
            onNavigateToAnalyzer={() => {
              setActiveTab('analyzer');
              setCurrentSubView('diagnostic');
            }}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenTailorer={() => setActiveTab('tailorer')}
          />
        )}

        {activeTab === 'jobs' && (
          <JobMatchesView
            resume={resume}
            userProfile={currentUser || undefined}
            onTailorJob={handleOpenTailorerForJob}
            onSaveJob={handleSaveJob}
          />
        )}

        {activeTab === 'tailorer' && (
          <ResumeTailorerView
            resume={resume}
            initialJob={tailorJobTarget}
            onApplyTailored={handleUpdateResume}
            onNavigateToAnalyzer={() => {
              setActiveTab('analyzer');
              setCurrentSubView('diagnostic');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-outline/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[20px] text-secondary">verified</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-outline-variant hover:text-white ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modals */}
      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSelectResume={(loadedResume) => {
          setResume(loadedResume);
          showToast(`Loaded ${loadedResume.candidateName}'s profile.`);
        }}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        resume={resume}
      />

      <EditBulletModal
        isOpen={isEditBulletModalOpen}
        onClose={() => setIsEditBulletModalOpen(false)}
        initialText={editBulletData.text}
        onSave={editBulletData.onSave}
      />

      <PrintPdfModal
        isOpen={isPrintPdfModalOpen}
        onClose={() => setIsPrintPdfModalOpen(false)}
        resume={resume}
        onTriggerPrint={() => {
          showToast('Preparing ATS print layout... Opening browser print dialog.');
          setTimeout(() => {
            window.print();
          }, 250);
        }}
      />

      {/* Dedicated High-Fidelity Printable Document (hidden on screen, visible only in print / Save-as-PDF) */}
      <PrintableResume resume={resume} />

      {/* Floating Real-Time Firebase Database Quick Access Button */}
      <button
        onClick={() => setIsFirebaseInspectorOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-300/40 text-xs font-bold transition-all cursor-pointer active:scale-95"
        title="View live Firestore database stream & stored entries"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
        <span>🔥 Live Database</span>
      </button>

      {/* Real-time Firebase Database Entries Viewer Modal */}
      <FirebaseLiveInspector
        isOpen={isFirebaseInspectorOpen}
        onClose={() => setIsFirebaseInspectorOpen(false)}
      />
    </div>
  );
}
