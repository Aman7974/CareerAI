import React, { useState } from 'react';
import { sampleResumesList } from '../data/resumes';
import { ResumeData } from '../types';
import { analyzeResumeText } from '../utils/resumeParser';
import { extractTextFromFile } from '../utils/pdfExtractor';

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResume: (resume: ResumeData) => void;
}

export const UploadResumeModal: React.FC<UploadResumeModalProps> = ({
  isOpen,
  onClose,
  onSelectResume,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('Initializing ATS Parser Engine...');
  const [pastedText, setPastedText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessResumeText = (text: string, fileName: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStatus('Extracting your exact statements, skills & experiences...');

    setTimeout(() => {
      setProcessingStatus('Auditing action verbs, passive phrasing & metrics ($/%)...');
      setTimeout(() => {
        try {
          const parsedResult = analyzeResumeText(text, fileName);
          setIsProcessing(false);
          onSelectResume(parsedResult);
          onClose();
        } catch (err: any) {
          setIsProcessing(false);
          setErrorMessage(err?.message || 'Unable to parse resume text. Please check the content.');
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
        throw new Error('Could not extract readable text from this file. Please paste your resume text directly.');
      }
      handleProcessResumeText(extracted, file.name);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Error extracting file. Please try pasting the text in the "Paste Resume Text" tab.');
      setActiveTab('paste');
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Please paste your resume text first.');
      return;
    }
    handleProcessResumeText(pastedText, 'Pasted_Resume.txt');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest dark:bg-[#1a2238] border border-outline-variant dark:border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/40 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary-container flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
                Upload & Analyze Resume
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-slate-400">
                Preserves your actual content and identifies exact areas to improve
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-outline-variant hover:text-on-surface dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center border-b border-outline-variant/40 dark:border-white/10 px-5 pt-3 bg-surface-container-low dark:bg-[#131b2e]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-primary text-primary dark:text-[#818cf8] font-bold'
                : 'border-transparent text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
            }`}
          >
            Upload File (.pdf, .txt, .docx)
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-primary text-primary dark:text-[#818cf8] font-bold'
                : 'border-transparent text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
            }`}
          >
            Paste Resume Text
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
              activeTab === 'samples'
                ? 'border-primary text-primary dark:text-[#818cf8] font-bold'
                : 'border-transparent text-on-surface-variant dark:text-slate-400 hover:text-on-surface'
            }`}
          >
            Sample Profiles
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {isProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <span className="material-symbols-outlined text-primary text-[24px]">troubleshoot</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface dark:text-white">
                  Parsing Your Uploaded Resume
                </h3>
                <p className="text-xs text-primary dark:text-[#818cf8] font-mono mt-1">
                  {processingStatus}
                </p>
              </div>
            </div>
          ) : (
            <>
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
                      ? 'border-primary bg-primary/10'
                      : 'border-outline-variant hover:border-primary/60 hover:bg-surface-container-low dark:hover:bg-white/5'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high dark:bg-white/10 flex items-center justify-center mx-auto mb-3 text-primary dark:text-[#818cf8]">
                    <span className="material-symbols-outlined text-[28px]">upload_file</span>
                  </div>
                  <div className="text-xs font-bold text-on-surface dark:text-white">
                    Select or Drop Your Resume File
                  </div>
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-1">
                    Accepts PDF, DOCX, TXT, MD
                  </p>
                </div>
              )}

              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the text of your resume here (Summary, Experience, Skills, Education)..."
                    className="w-full px-3 py-2.5 bg-surface-container-low dark:bg-black/30 border border-outline-variant dark:border-white/10 rounded-xl text-on-surface dark:text-white placeholder-outline text-xs font-mono focus:outline-none focus:border-primary leading-relaxed"
                  />
                  <button
                    onClick={handlePasteSubmit}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Analyze Pasted Resume Text
                  </button>
                </div>
              )}

              {activeTab === 'samples' && (
                <div className="space-y-2">
                  <div className="text-xs text-outline dark:text-slate-400 mb-2">
                    Or test with a pre-configured baseline profile:
                  </div>
                  {sampleResumesList.map((sample) => (
                    <div
                      key={sample.id}
                      onClick={() => {
                        onSelectResume(sample);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-outline-variant/60 dark:border-white/10 hover:border-primary/50 hover:bg-surface-container-low dark:hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-on-surface dark:text-white">
                          {sample.candidateName}
                        </div>
                        <div className="text-[11px] text-primary dark:text-[#818cf8]">
                          {sample.headline}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-secondary dark:text-emerald-400">
                        {sample.overallScore}/100
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
