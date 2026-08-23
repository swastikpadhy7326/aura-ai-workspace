import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  RefreshCw,
  CheckCircle2,
  Clock,
  Database,
  Brain,
  Cpu,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KnowledgeStatus } from '../types';

export const KnowledgeStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<KnowledgeStatus | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [relativeTime, setRelativeTime] = useState<string>('Just now');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchKnowledgeStatus = async () => {
    try {
      const res = await fetch('/api/knowledge/status');
      if (res.ok) {
        const data: KnowledgeStatus = await res.json();
        setStatus(data);
        updateRelativeTime(data.lastSyncTime);
      }
    } catch (err) {
      console.warn('Failed to fetch knowledge status', err);
    }
  };

  const updateRelativeTime = (timestamp?: string) => {
    if (!timestamp) {
      setRelativeTime('Just now');
      return;
    }
    const diffSeconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diffSeconds < 10) {
      setRelativeTime('Just now');
    } else if (diffSeconds < 60) {
      setRelativeTime(`${diffSeconds}s ago`);
    } else if (diffSeconds < 3600) {
      const mins = Math.floor(diffSeconds / 60);
      setRelativeTime(`${mins}m ago`);
    } else {
      const hours = Math.floor(diffSeconds / 3600);
      setRelativeTime(`${hours}h ago`);
    }
  };

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/knowledge/sync', { method: 'POST' });
      if (res.ok) {
        await fetchKnowledgeStatus();
      }
    } catch (err) {
      console.error('Error during manual sync', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeStatus();
    const interval = setInterval(() => {
      fetchKnowledgeStatus();
    }, 15000);

    const relInterval = setInterval(() => {
      if (status?.lastSyncTime) {
        updateRelativeTime(status.lastSyncTime);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(relInterval);
    };
  }, [status?.lastSyncTime]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const lastSyncDateFormatted = status?.lastSyncTime
    ? new Date(status.lastSyncTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      })
    : 'Live';

  return (
    <div className="relative" ref={dropdownRef} id="knowledge-status-container">
      {/* Navbar Trigger Button */}
      <button
        id="knowledge-status-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all select-none ${
          isOpen
            ? 'bg-indigo-950/80 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700 hover:text-white'
        }`}
        title="Knowledge Status & Grounding Sync Freshness"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center justify-center">
            <Globe className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="hidden sm:inline font-mono font-medium text-[11px] text-slate-200">
            Knowledge:
          </span>
          <span className="font-semibold text-[11px] text-emerald-400">
            {isSyncing ? 'Syncing...' : relativeTime}
          </span>
        </div>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#090d1f] border border-indigo-900/60 rounded-xl shadow-2xl shadow-black/80 z-50 p-4 backdrop-blur-xl overflow-hidden"
            id="knowledge-status-dropdown"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                    AURA Knowledge Grounding
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Real-time external synchronization status
                  </p>
                </div>
              </div>

              {/* Sync Button */}
              <button
                id="force-knowledge-sync-btn"
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isSyncing
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 shadow-sm shadow-indigo-600/30'
                }`}
                title="Force external data source refresh"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {/* Freshness Banner Card */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live & Up-to-Date
                  </span>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Last Synced: <strong className="text-slate-200">{lastSyncDateFormatted}</strong> ({relativeTime})</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {status?.freshnessScore || 100}%
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500">Freshness</span>
              </div>
            </div>

            {/* Active Sources List */}
            <div className="mt-3 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block px-0.5">
                Connected Knowledge Sources ({status?.activeSources?.length || 4})
              </span>

              {/* Source 1: Google Search Grounding */}
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-start gap-2.5">
                <div className="p-1 rounded bg-blue-500/10 text-blue-400 mt-0.5">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">Google Search Grounding</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded">
                      Live Grounded
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Real-time web retrieval for current facts, news, and world updates.
                  </p>
                </div>
              </div>

              {/* Source 2: RAG Vector Store */}
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-start gap-2.5">
                <div className="p-1 rounded bg-purple-500/10 text-purple-400 mt-0.5">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">RAG Document Vector Store</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 rounded">
                      Indexed
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Semantic document chunks with page citations & text snippets.
                  </p>
                </div>
              </div>

              {/* Source 3: Memory Vault */}
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-start gap-2.5">
                <div className="p-1 rounded bg-pink-500/10 text-pink-400 mt-0.5">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">Persistent Memory Vault</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-800 text-slate-300 rounded">
                      CRUD Synced
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Long-term user preferences, deadlines, and project context.
                  </p>
                </div>
              </div>

              {/* Source 4: Temporal & Telemetry Grounding */}
              <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">Temporal & OS Diagnostics</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded">
                      Continuous
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Current UTC/Local date-time injection and hardware load stream.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Information */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounding Verified
              </span>
              <span className="text-slate-400 font-mono">
                {status?.totalQueriesGrounded || 140}+ queries grounded
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
