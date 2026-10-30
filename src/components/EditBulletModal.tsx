import React, { useState } from 'react';

interface EditBulletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onSave: (newText: string) => void;
}

export const EditBulletModal: React.FC<EditBulletModalProps> = ({
  isOpen,
  onClose,
  initialText,
  onSave,
}) => {
  const [text, setText] = useState(initialText);

  if (!isOpen) return null;

  const hasMetrics = /\$|\%|\d+x|\d+M|\d+k/i.test(text);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest dark:bg-[#1a2238] border border-outline-variant dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/40 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
            <h3 className="text-sm font-bold text-on-surface dark:text-white font-['Plus_Jakarta_Sans']">
              Edit Resume Bullet Point
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-outline-variant hover:text-on-surface dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-on-surface dark:text-slate-300 block mb-1.5">
              Bullet Statement Content:
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 bg-surface-container-low dark:bg-[#131b2e] border border-outline-variant dark:border-white/10 rounded-xl text-xs text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* Real-time Quality Indicators */}
          <div className="p-3 bg-surface-bright dark:bg-white/5 rounded-xl border border-outline-variant/40 dark:border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant dark:text-slate-400">Word Count:</span>
              <span className="font-semibold text-on-surface dark:text-white">{wordCount} words (Target: 15–28 words)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant dark:text-slate-400">Quantified Business Result:</span>
              <span className={`font-semibold flex items-center gap-1 ${hasMetrics ? 'text-secondary dark:text-emerald-400' : 'text-tertiary dark:text-amber-400'}`}>
                <span className="material-symbols-outlined text-[14px]">{hasMetrics ? 'check_circle' : 'warning'}</span>
                {hasMetrics ? 'Quantified ($ / % / metrics detected)' : 'Missing financial metric'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/40 dark:border-white/10 flex items-center justify-end gap-2 bg-surface-container-low dark:bg-[#131b2e]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
