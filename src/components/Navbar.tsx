import React from 'react';
import {
  Bot,
  Activity,
  FileText,
  Brain,
  CheckSquare,
  ShieldCheck,
  Award,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Cpu,
  Cloud,
  HardDrive,
  User,
  LogIn,
  LifeBuoy,
} from 'lucide-react';
import { SystemStatus } from '../types';
import { KnowledgeStatusIndicator } from './KnowledgeStatusIndicator';
import { useAuth } from '../context/AuthContext';



interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: SystemStatus | null;
  assistantStatus: 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing_tool' | 'error';
  isListening: boolean;
  onToggleListening: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  unreadTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  assistantStatus,
  isListening,
  onToggleListening,
  isMuted,
  onToggleMute,
  isOffline,
  onToggleOffline,
  unreadTasksCount,
}) => {
  const { currentUser, userProfile, openAuthModal } = useAuth();

  const tabs = [
    { id: 'chat', label: 'Agent Workspace', icon: Bot },
    { id: 'futuristic', label: '2030 AI Labs', icon: Sparkles, highlight: true },
    { id: 'system', label: 'System Monitor', icon: Activity },
    { id: 'rag', label: 'File Intelligence (RAG)', icon: FileText },
    { id: 'memory', label: 'Memory Vault', icon: Brain },
    { id: 'tasks', label: 'Tasks & Reminders', icon: CheckSquare, badge: unreadTasksCount },
    { id: 'security', label: 'Security & Audit', icon: ShieldCheck },
    { id: 'defense', label: 'Major Project Defense', icon: Award },
  ];


  const getStatusColor = () => {
    switch (assistantStatus) {
      case 'listening':
        return 'bg-purple-500 text-purple-200 border-purple-400 animate-pulse';
      case 'thinking':
        return 'bg-blue-500 text-blue-200 border-blue-400 animate-pulse';
      case 'executing_tool':
        return 'bg-amber-500 text-amber-200 border-amber-400 animate-pulse';
      case 'speaking':
        return 'bg-emerald-500 text-emerald-200 border-emerald-400 animate-pulse';
      case 'error':
        return 'bg-rose-500 text-rose-200 border-rose-400';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getStatusText = () => {
    switch (assistantStatus) {
      case 'listening':
        return 'Listening to voice...';
      case 'thinking':
        return 'Reasoning & Planning...';
      case 'executing_tool':
        return 'Executing Tool...';
      case 'speaking':
        return 'Speaking Response...';
      case 'error':
        return 'Service Error';
      default:
        return 'AURA Online • Ready';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-[#020617] shrink-0 sticky top-0 z-40">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30">
            <div className="w-4 h-4 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              AURA <span className="text-slate-500 font-normal text-xs">v3.2.0</span>
            </h1>
          </div>

          {/* Status Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <div className={`w-2 h-2 rounded-full ${assistantStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                    : tab.highlight
                    ? 'text-amber-400 hover:bg-amber-950/30 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-indigo-500 text-white text-[10px] font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Engine Mode & Hardware Mini Metrics */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Knowledge Status Indicator */}
          <KnowledgeStatusIndicator />

          {/* Engine Status pill */}
          <div className="hidden xl:flex items-center gap-2.5 text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
            <span className="text-[11px] text-indigo-300 font-mono font-medium">Gemini 3 Grounded</span>
            <div className="w-px h-3.5 bg-slate-800" />
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
              {isOffline ? 'Local Fallback' : 'Search Grounded'}
            </span>
          </div>

          {/* Quick Engine Switcher */}
          <button
            id="toggle-offline-btn"
            onClick={onToggleOffline}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              isOffline
                ? 'bg-amber-950/50 text-amber-300 border-amber-700/50'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title={isOffline ? 'Local Engine Active' : 'Gemini Cloud Active'}
          >
            {isOffline ? <HardDrive className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          {/* Voice Mute */}
          <button
            id="toggle-mute-btn"
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-slate-900 text-slate-500 border-slate-800'
                : 'bg-indigo-950/50 text-indigo-400 border-indigo-800/60 hover:bg-indigo-900/50'
            }`}
            title={isMuted ? 'Voice Responses Muted' : 'Voice Synthesis Active'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Voice Mic Trigger */}
          <button
            id="toggle-mic-btn"
            onClick={onToggleListening}
            className={`p-2 rounded-lg border transition-all ${
              isListening
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            title={isListening ? 'Stop Voice Listening' : 'Start Voice Input ("Hey Aura")'}
          >
            {isListening ? <Mic className="w-3.5 h-3.5 text-white" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          <div className="w-px h-5 bg-slate-800 mx-0.5" />

          {/* User Account / Sign In Trigger */}
          {currentUser ? (
            <button
              id="user-profile-btn"
              onClick={() => openAuthModal('profile')}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 rounded-full transition-all text-xs text-slate-200 group shadow-sm hover:border-indigo-500/50"
              title="View Account & Security Settings"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-[11px] ring-1 ring-white/20">
                {(userProfile?.displayName || currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex flex-col items-start leading-none hidden sm:flex">
                <span className="text-[11px] font-semibold text-slate-200 max-w-[85px] truncate">
                  {userProfile?.displayName || currentUser.displayName || 'User'}
                </span>
                <span className="text-[9px] text-indigo-400 font-mono">
                  {userProfile?.role || 'active'}
                </span>
              </div>
            </button>
          ) : (
            <button
              id="signin-btn"
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              title="Sign in or register account"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
