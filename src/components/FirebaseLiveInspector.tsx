import React, { useState, useEffect } from 'react';
import {
  LiveDatabaseEntry,
  subscribeToLiveEntries,
  subscribeToUsers,
  subscribeToResumes,
  subscribeToSavedJobs,
  recordDatabaseEntry,
  testConnection
} from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirebaseLiveInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseLiveInspector: React.FC<FirebaseLiveInspectorProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'users' | 'resumes' | 'jobs'>('stream');
  const [entries, setEntries] = useState<LiveDatabaseEntry[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [isWritingTest, setIsWritingTest] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  useEffect(() => {
    testConnection().then((connected) => setIsConnected(connected));

    // Listen to real-time entries
    const unsubEntries = subscribeToLiveEntries((items) => {
      setEntries(items);
    });

    // Listen to users
    const unsubUsers = subscribeToUsers((items) => {
      setUsers(items);
    });

    // Listen to resumes
    const unsubResumes = subscribeToResumes((items) => {
      setResumes(items);
    });

    // Listen to saved jobs
    const unsubJobs = subscribeToSavedJobs((items) => {
      setSavedJobs(items);
    });

    return () => {
      unsubEntries();
      unsubUsers();
      unsubResumes();
      unsubJobs();
    };
  }, []);

  const handleCreateTestEntry = async () => {
    setIsWritingTest(true);
    try {
      const now = new Date();
      await recordDatabaseEntry({
        id: `test-entry-${Date.now()}`,
        collectionName: 'databaseEntries',
        action: 'CREATE',
        entityId: `ping-${Math.random().toString(36).substring(2, 6)}`,
        summary: `Real-time heartbeat ping at ${now.toLocaleTimeString()}`,
        details: JSON.stringify({
          source: 'Client Real-time Test',
          browserTime: now.toISOString(),
          status: 'verified_active',
          databaseId: firebaseConfig.firestoreDatabaseId
        }, null, 2)
      });
    } finally {
      setIsWritingTest(false);
    }
  };

  if (!isOpen) return null;

  const filteredEntries = entries.filter((e) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      e.summary.toLowerCase().includes(q) ||
      e.collectionName.toLowerCase().includes(q) ||
      e.entityId.toLowerCase().includes(q)
    );
  });

  const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-surface-container-lowest dark:bg-[#111827] rounded-3xl border border-outline-variant/60 dark:border-white/10 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/40 dark:border-white/10 bg-surface-container dark:bg-[#1a2234] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-on-surface dark:text-white">
                  Firebase Real-Time Database Inspector
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {isConnected ? 'LIVE SYNC ACTIVE' : 'CONNECTING...'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                Connected to <span className="font-mono text-primary font-semibold">{firebaseConfig.projectId}</span> / <span className="font-mono">{firebaseConfig.firestoreDatabaseId.slice(0, 24)}...</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateTestEntry}
              disabled={isWritingTest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
            >
              <span>{isWritingTest ? 'Writing...' : '⚡ Push Real-Time Entry'}</span>
            </button>

            <a
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high dark:bg-white/10 hover:bg-primary hover:text-white dark:hover:bg-white/20 text-on-surface dark:text-white text-xs font-medium transition"
            >
              <span>Open Firebase Console</span>
              <span>↗</span>
            </a>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-container-highest dark:hover:bg-white/10 text-on-surface-variant dark:text-slate-400 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats Row & Navigation Tabs */}
        <div className="px-5 py-3 border-b border-outline-variant/30 dark:border-white/10 bg-surface-container-low dark:bg-[#161f30] flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'stream'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high'
              }`}
            >
              <span>⚡ Live Stream</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold">
                {entries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high'
              }`}
            >
              <span>👤 users</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('resumes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'resumes'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high'
              }`}
            >
              <span>📄 resumes</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold">
                {resumes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'jobs'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container dark:bg-white/5 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high'
              }`}
            >
              <span>💼 savedJobs</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold">
                {savedJobs.length}
              </span>
            </button>
          </div>

          {/* Quick filter input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search live documents..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-3 py-1.5 pl-8 rounded-xl bg-surface-container dark:bg-[#1a2336] border border-outline-variant/40 dark:border-white/10 text-xs text-on-surface dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-64"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* STREAM TAB */}
          {activeTab === 'stream' && (
            <div>
              {filteredEntries.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 flex items-center justify-center text-3xl">
                    📡
                  </div>
                  <h3 className="font-bold text-on-surface dark:text-white text-base">
                    Listening to Firestore Real-Time Changes...
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 max-w-md mx-auto">
                    Any new user registration, login, resume save, or job bookmark will instantly pop in here via Firestore&apos;s real-time <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">onSnapshot</code> listener.
                  </p>
                  <button
                    onClick={handleCreateTestEntry}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-medium text-xs shadow-md hover:bg-primary/90"
                  >
                    <span>⚡ Push First Live Entry</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Showing {filteredEntries.length} live database events (auto-updating)</span>
                    <span className="flex items-center gap-1 text-emerald-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Firestore WebSocket Active
                    </span>
                  </div>

                  {filteredEntries.map((entry) => {
                    const isExpanded = expandedEntryId === entry.id;
                    const actionColors = {
                      CREATE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
                      UPDATE: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
                      SYNC: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
                      DELETE: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
                    }[entry.action] || 'bg-slate-500/15 text-slate-600 border-slate-500/30';

                    return (
                      <div
                        key={entry.id}
                        className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-[#1a2336] border border-outline-variant/40 dark:border-white/10 hover:border-primary/40 transition group"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${actionColors}`}>
                              {entry.action}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-surface-container dark:bg-white/10 text-on-surface-variant dark:text-slate-300">
                              /{entry.collectionName}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              doc: {entry.entityId}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-mono">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                            {entry.details && (
                              <button
                                onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                                className="text-[11px] font-semibold text-primary hover:underline px-2 py-0.5 rounded bg-primary/10"
                              >
                                {isExpanded ? 'Hide Payload ▲' : 'View Payload ▼'}
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs font-medium text-on-surface dark:text-slate-200 mt-2">
                          {entry.summary}
                        </p>

                        {isExpanded && entry.details && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-emerald-500/20">
                            <div className="text-[10px] text-slate-400 mb-1 border-b border-white/10 pb-1 flex justify-between">
                              <span>FIRESTORE DOCUMENT PAYLOAD:</span>
                              <span>JSON FORMAT</span>
                            </div>
                            <pre className="whitespace-pre-wrap">{entry.details}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 px-1 flex justify-between">
                <span>Stored User Accounts ({users.length})</span>
                <span className="font-mono text-[11px]">Collection: /users</span>
              </div>
              {users.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No user documents in Firestore yet. Sign up or log in to create the first record!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {users.map((u, i) => (
                    <div
                      key={u.id || i}
                      className="p-4 rounded-2xl bg-surface-container-low dark:bg-[#1a2336] border border-outline-variant/40 dark:border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-on-surface dark:text-white flex items-center gap-1.5">
                          <span>👤</span> {u.fullName}
                        </span>
                        {u.countryCode && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-bold">
                            {u.countryCode.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 space-y-1 font-mono">
                        <div>Email: <span className="text-primary">{u.email}</span></div>
                        <div>Target Role: <span className="text-on-surface dark:text-slate-200">{u.targetRole || 'Not set'}</span></div>
                        <div>Location: <span className="text-on-surface dark:text-slate-200">{u.preferredLocation || u.country || 'N/A'}</span></div>
                        <div className="text-[10px] text-slate-500 pt-1">
                          Updated: {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESUMES TAB */}
          {activeTab === 'resumes' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 px-1 flex justify-between">
                <span>Stored Resumes ({resumes.length})</span>
                <span className="font-mono text-[11px]">Collection: /resumes</span>
              </div>
              {resumes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No resumes stored in Firestore yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resumes.map((r, i) => (
                    <div
                      key={r.id || i}
                      className="p-4 rounded-2xl bg-surface-container-low dark:bg-[#1a2336] border border-outline-variant/40 dark:border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-on-surface dark:text-white flex items-center gap-1.5">
                          <span>📄</span> {r.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          ATS Score: {r.atsScore}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1 font-mono">
                        <div>Title: <span className="text-on-surface dark:text-slate-200">{r.title}</span></div>
                        <div>Skills Recorded: <span className="text-on-surface dark:text-slate-200">{r.skillsCount}</span></div>
                        <div className="text-[10px] text-slate-500 pt-1">
                          Synced: {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SAVED JOBS TAB */}
          {activeTab === 'jobs' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 px-1 flex justify-between">
                <span>Stored Jobs & Saved Positions ({savedJobs.length})</span>
                <span className="font-mono text-[11px]">Collection: /savedJobs</span>
              </div>
              {savedJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No saved jobs in Firestore yet. Use &quot;Save Job&quot; in the Jobs tab to store one in Firestore!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedJobs.map((j, i) => (
                    <div
                      key={j.id || i}
                      className="p-4 rounded-2xl bg-surface-container-low dark:bg-[#1a2336] border border-outline-variant/40 dark:border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-on-surface dark:text-white flex items-center gap-1.5">
                          <span>💼</span> {j.jobTitle}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                          {j.status || 'saved'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1 font-mono">
                        <div>Company: <span className="text-on-surface dark:text-slate-200">{j.company}</span></div>
                        <div>Location: <span className="text-on-surface dark:text-slate-200">{j.location}</span></div>
                        <div>Salary: <span className="text-emerald-500">{j.salary || 'Competitive'}</span></div>
                        {j.applyUrl && (
                          <div className="pt-1">
                            <a
                              href={j.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-[11px]"
                            >
                              External Link ↗
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-5 py-3 border-t border-outline-variant/30 dark:border-white/10 bg-surface-container dark:bg-[#151c2c] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Real-time bidirectional synchronization with Cloud Firestore</span>
          </div>
          <div className="font-mono text-[11px]">
            Total Entries: <span className="text-primary font-bold">{entries.length + users.length + resumes.length + savedJobs.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
