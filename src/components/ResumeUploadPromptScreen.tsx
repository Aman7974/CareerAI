import React, { useState } from 'react';
import { ResumeData, UserProfile } from '../types';
import { analyzeResumeText } from '../utils/resumeParser';
import { extractTextFromFile } from '../utils/pdfExtractor';

interface ResumeUploadPromptScreenProps {
  userProfile: UserProfile;
  onResumeUploaded: (resume: ResumeData) => void;
  onSkipWithSample?: () => void;
}

export const ResumeUploadPromptScreen: React.FC<ResumeUploadPromptScreenProps> = ({
  userProfile,
  onResumeUploaded,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Parsing resume...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('Uploaded_Resume.pdf');

  const handleProcessText = (rawText: string, fileName: string) => {
    if (!rawText || !rawText.trim()) {
      setErrorMessage('Resume content cannot be empty. Please upload a file or paste text.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus('Extracting your exact statements, skills & experience...');

    setTimeout(() => {
      setProcessingStatus(`Auditing statements and matching keywords for ${userProfile.targetRole}...`);
      setTimeout(() => {
        try {
          const parsed = analyzeResumeText(rawText, fileName, userProfile);
          setIsProcessing(false);
          onResumeUploaded(parsed);
        } catch (err: any) {
          setIsProcessing(false);
          setErrorMessage(err?.message || 'Failed to parse resume text. Please check the text or file.');
        }
      }, 400);
    }, 400);
  };

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus(`Reading "${file.name}"...`);

    try {
      const extracted = await extractTextFromFile(file);
      if (!extracted || extracted.trim().length < 20) {
        throw new Error('Could not extract readable text from this file. Please paste your resume text below.');
      }
      setUploadedFileName(file.name);
      setPreviewText(extracted);
      setIsProcessing(false);
      // Automatically proceed or let user verify
      handleProcessText(extracted, file.name);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Error extracting text from file. Please use the "Paste Resume Text" tab.');
      setActiveTab('paste');
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setErrorMessage('Please paste your resume text first.');
      return;
    }
    handleProcessText(pastedText, `${userProfile.name.replace(/\s+/g, '_')}_Resume.txt`);
  };

  // Sample quick resume tailored to their target role
  const handleLoadSampleResume = () => {
    const sample = `${userProfile.name.toUpperCase()}
${userProfile.email} • San Francisco, CA • linkedin.com/in/${userProfile.name.toLowerCase().replace(/\s+/g, '')}
${userProfile.targetRole.toUpperCase()}

PROFESSIONAL SUMMARY
Results-driven ${userProfile.targetRole} with ${userProfile.yearsOfExperience || '5'}+ years building high-quality software solutions and scaling production architectures. Skilled at cross-functional execution, code quality, and driving measurable technical outcomes.

WORK EXPERIENCE
Senior Specialist — Cloud & Software Systems (2021 — PRESENT)
• Spearheaded frontend and backend architecture, improving application load performance by 42% for 1.2M active users.
• Engineered automated CI/CD deployment pipelines, cutting release cycle times in half and maintaining 99.98% uptime.
• Responsible for reviewing code and mentoring 6 junior engineers on technical best practices.
• Worked on microservice database migrations and API endpoints.

Software Engineer — Enterprise Platforms (2018 — 2021)
• Architected RESTful microservices and optimized PostgreSQL database queries, reducing average API response latency by 35%.
• Assisted team with bug fixes, UI components, and sprint delivery.
• Implemented automated integration tests, elevating regression test coverage from 60% to 92%.

EDUCATION
Bachelor of Science in Computer Science — University of Technology (2014 — 2018)

SKILLS
TypeScript, JavaScript, React, Node.js, Python, PostgreSQL, Docker, AWS, Git, REST APIs, CI/CD, Agile`;

    setPastedText(sample);
    setActiveTab('paste');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-200 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px]">✓</span>
            <span className="text-slate-400">Step 1: Sign Up Completed</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            <span>Step 2 of 2: Upload Resume</span>
          </div>
        </div>

        {/* Welcome Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/30 mb-3">
            <span className="material-symbols-outlined text-[26px]">upload_file</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Upload Your Resume, {userProfile.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Target Profile: <strong className="text-white">{userProfile.targetRole}</strong>. We will analyze your actual statements, show exact areas to improve, check required keywords, and find matching jobs.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-rose-400 shrink-0">error</span>
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {isProcessing ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-sky-600/30 border-t-sky-500 animate-spin"></div>
              <span className="material-symbols-outlined text-sky-400 text-[28px]">search_insights</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Analyzing Your Resume</h3>
              <p className="text-xs text-sky-400 font-mono mt-1">{processingStatus}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'upload' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload File (.pdf, .docx, .txt)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'paste' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste Resume Text
              </button>
            </div>

            {/* Upload Area */}
            {activeTab === 'upload' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.docx,.txt,.md';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      handleFile(target.files[0]);
                    }
                  };
                  input.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-sky-500 bg-sky-500/10 scale-[1.01]'
                    : 'border-slate-700 hover:border-sky-500/70 hover:bg-slate-800/50'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-sky-400">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <div className="text-sm font-bold text-white">Click or drag & drop your resume file</div>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT, Markdown (Max 15MB)</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  <span>Browse Device Files</span>
                </div>
              </div>
            )}

            {/* Paste Text Area */}
            {activeTab === 'paste' && (
              <form onSubmit={handlePasteSubmit} className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Paste your complete resume text:</span>
                  <button
                    type="button"
                    onClick={handleLoadSampleResume}
                    className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline text-[11px]"
                  >
                    Load resume template
                  </button>
                </div>
                <textarea
                  rows={9}
                  required
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your resume here (Summary, Work Experience, Skills, Education)..."
                  className="w-full px-3.5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-sky-500 transition-colors leading-relaxed"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                  <span>Analyze Uploaded Resume</span>
                </button>
              </form>
            )}

            {/* Helper Footer */}
            <div className="text-center pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={handleLoadSampleResume}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Don't have a file ready? Click here to fill a sample resume for <strong className="text-sky-400">{userProfile.targetRole}</strong>.
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
