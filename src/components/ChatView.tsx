import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Trash2,
  Terminal,
  Volume2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  Cpu,
  FileText,
  Clock,
  Layers,
  Shield,
  X,
  Square,
  Activity,
  Brain,
  CheckSquare,
  Award,
  Plus,
  Zap,
  ExternalLink,
  Globe,
  Search,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConfirmationPayload, Message, SystemStatus } from '../types';
import { speechHandler } from '../utils/speech';

// Dedicated Interactive Web Activity & Voice Redirection Bento Card
interface WebActivityCardProps {
  tool: any;
}

const WebActivityCard: React.FC<WebActivityCardProps> = ({ tool }) => {
  const result = tool.result || {};
  const websiteName = result.websiteName || result.appName || 'Website';
  const url = result.url || result.urlOrUri || '';
  const domain = result.domain || (url ? (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; } })() : '');
  const isSearch = Boolean(result.isSearch);
  const autoRedirect = Boolean(result.autoRedirect);

  const [countdown, setCountdown] = useState<number>(autoRedirect ? 3 : 0);
  const [redirectStatus, setRedirectStatus] = useState<'pending' | 'opened' | 'cancelled'>('pending');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!autoRedirect || !url || redirectStatus !== 'pending') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          try {
            window.open(url, '_blank', 'noopener,noreferrer');
            setRedirectStatus('opened');
          } catch (e) {
            setRedirectStatus('cancelled');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, url, redirectStatus]);

  const handleOpenNow = () => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    setRedirectStatus('opened');
    setCountdown(0);
  };

  const handleCancelAuto = () => {
    setRedirectStatus('cancelled');
    setCountdown(0);
  };

  const handleCopyUrl = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 shadow-lg shadow-indigo-500/5 space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            {isSearch ? <Search className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          </div>
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
            Web Activity & Redirection
          </span>
        </div>
        {domain && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
            {domain}
          </span>
        )}
      </div>

      {/* Target Info */}
      <div className="flex items-start justify-between gap-3 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
            <span>{websiteName}</span>
            {isSearch && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                Web Search
              </span>
            )}
          </p>
          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5" title={url}>
            {url}
          </p>
        </div>
        <button
          onClick={handleCopyUrl}
          className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
          title="Copy direct URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Action and Auto-Redirect bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <button
          onClick={handleOpenNow}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{redirectStatus === 'opened' ? `Reopen ${websiteName}` : `Open ${websiteName} Now`}</span>
        </button>

        {countdown > 0 && redirectStatus === 'pending' ? (
          <div className="flex items-center gap-2 text-[11px] text-indigo-300 font-mono">
            <span className="animate-pulse">Auto-redirecting in {countdown}s...</span>
            <button
              onClick={handleCancelAuto}
              className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : redirectStatus === 'opened' ? (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <Check className="w-3 h-3" />
            <span>Redirect dispatched to browser</span>
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 italic">
            Voice-assisted navigation ready
          </span>
        )}
      </div>

      <p className="text-[10px] text-slate-500 leading-tight">
        💡 Note: If browser popup settings prevented auto-opening, click <strong>Open {websiteName} Now</strong> to launch in a new tab.
      </p>
    </div>
  );
};

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string, image?: string) => Promise<void>;
  onConfirmAction: (confirmation: ConfirmationPayload, approved: boolean) => Promise<void>;
  isLoading: boolean;
  onOpenSandbox: (code: string, language: string) => void;
  onClearChat: () => void;
  isListening: boolean;
  onToggleListening: () => void;
  voiceTranscript: string;
  isMuted: boolean;
  systemStatus?: SystemStatus | null;
  onNavigateTab?: (tab: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onConfirmAction,
  isLoading,
  onOpenSandbox,
  onClearChat,
  isListening,
  onToggleListening,
  voiceTranscript,
  isMuted,
  systemStatus,
  onNavigateTab,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [expandedToolIds, setExpandedToolIds] = useState<Record<string, boolean>>({});
  const [expandedTelemetryIds, setExpandedTelemetryIds] = useState<Record<string, boolean>>({});
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<string | null>(null);
  const [isSpeakingMessageId, setIsSpeakingMessageId] = useState<string | null>(null);
  const [activeSessionTopic, setActiveSessionTopic] = useState('Project Presentation Prep');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (voiceTranscript) {
      setInputText(voiceTranscript);
    }
  }, [voiceTranscript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isLoading) return;
    const textToSend = inputText.trim();
    const imgToSend = attachedImage || undefined;
    setInputText('');
    setAttachedImage(null);
    await onSendMessage(textToSend, imgToSend);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSpeak = (text: string, msgId: string) => {
    if (isSpeakingMessageId === msgId) {
      speechHandler.stopSpeaking();
      setIsSpeakingMessageId(null);
      return;
    }
    setIsSpeakingMessageId(msgId);
    speechHandler.speak(text, {
      onEnd: () => setIsSpeakingMessageId(null),
    });
  };

  const toggleToolExpand = (id: string) => {
    setExpandedToolIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTelemetryExpand = (id: string) => {
    setExpandedTelemetryIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(id);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const quickPrompts = [
    { label: '🌐 Open YouTube', prompt: 'Open YouTube in web launcher.' },
    { label: '🌐 Open GitHub', prompt: 'Open GitHub repository hub.' },
    { label: '🌐 Open Wikipedia', prompt: 'Open Wikipedia and search Artificial Intelligence.' },
    { label: '🚀 2030 SwarmNet', prompt: 'Dispatch autonomous multi-agent swarm to architect a distributed zero-loss stream broker.' },
    { label: '⚛️ Speculative Synth', prompt: 'Speculatively synthesize 3 parallel algorithmic branches for a lock-free ring buffer.' },
    { label: '🌐 Open LeetCode', prompt: 'Open LeetCode coding platform.' },
    { label: '🌐 Open ChatGPT', prompt: 'Open ChatGPT.' },
    { label: '🌐 Search Google', prompt: 'Search Google for latest multimodal AI agents.' },
    { label: '⚡ Check CPU & RAM', prompt: 'What is my current CPU and RAM load?' },
    { label: '🧠 Remember Deadline', prompt: 'Remember that my project presentation deadline is this Friday at 10:00 AM.' },
    { label: '✉️ Email Professor', prompt: 'Draft an email to professor saying project report is complete.' },
    { label: '📄 RAG Summarize', prompt: 'Search and summarize research papers in the RAG knowledge base.' },
    { label: '🐍 Python Script', prompt: 'Write a Python program with unit tests and run it.' },
  ];

  const recentSessions = [
    { title: 'Autonomous Swarm Consensus', active: false, tag: 'SwarmNet' },
    { title: 'Project Presentation Prep', active: true, tag: 'Active' },
    { title: 'System Performance Audit', active: false, tag: 'Telemetry' },
    { title: 'Python Script Debugging', active: false, tag: 'Sandbox' },
    { title: 'RAG Knowledge Ingestion', active: false, tag: 'Vector DB' },
  ];


  const cpuVal = systemStatus?.cpuUsage ?? 14;
  const ramVal = systemStatus?.ramUsage ?? 38;

  return (
    <div className="flex-1 flex overflow-hidden w-full h-[calc(100vh-64px)] bg-[#020617] text-slate-200">
      {/* 1. Left Sidebar Navigation Rail */}
      <aside className="w-60 border-r border-slate-800 hidden lg:flex flex-col bg-[#020617] shrink-0">
        <div className="p-3">
          <button
            onClick={onClearChat}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Conversation</span>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-2 tracking-wider">
            Recent Activities
          </div>
          {recentSessions.map((session, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveSessionTopic(session.title);
                onSendMessage(`Continue workspace session for ${session.title}`);
              }}
              className={`w-full text-left flex items-center justify-between p-2 rounded-md transition-colors text-xs ${
                activeSessionTopic === session.title
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className="truncate pr-1">{session.title}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 shrink-0 font-mono">
                {session.tag}
              </span>
            </button>
          ))}

          {/* Quick Hub Links */}
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 pt-4 pb-2 tracking-wider">
            Workspace Modules
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('futuristic')}
            className="w-full flex items-center gap-2 p-2 rounded-md text-xs text-indigo-300 hover:bg-indigo-950/40 hover:text-white transition-colors font-medium border border-indigo-500/20 bg-indigo-950/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>2030 AI Labs (SwarmNet)</span>
          </button>
          <button
            onClick={() => onNavigateTab && onNavigateTab('system')}
            className="w-full flex items-center gap-2 p-2 rounded-md text-xs text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hardware Telemetry</span>
          </button>
          <button
            onClick={() => onNavigateTab && onNavigateTab('rag')}
            className="w-full flex items-center gap-2 p-2 rounded-md text-xs text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Document Intelligence</span>
          </button>
          <button
            onClick={() => onNavigateTab && onNavigateTab('memory')}
            className="w-full flex items-center gap-2 p-2 rounded-md text-xs text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Memory Vault</span>
          </button>
          <button
            onClick={() => onNavigateTab && onNavigateTab('defense')}
            className="w-full flex items-center gap-2 p-2 rounded-md text-xs text-amber-400 hover:bg-amber-950/30 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Project Defense Panel</span>
          </button>

        </nav>

        {/* User Card Pill */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              AU
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">Developer Workspace</p>
              <p className="text-[10px] text-slate-500 font-mono">AURA Autonomous v3.2</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Center Chat & Interactive Reasoning Stream */}
      <section className="flex-1 flex flex-col bg-[#020617] relative min-w-0 overflow-hidden">
        {/* Messages Stream Container */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-5 overflow-y-auto scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 ${isUser ? 'max-w-[90%] sm:max-w-[85%] self-end items-end' : 'max-w-[95%] sm:max-w-[88%] self-start items-start'}`}
              >
                {/* Chat Bubble with Bento Styling */}
                <div
                  className={`p-4 rounded-2xl leading-relaxed text-xs sm:text-sm ${
                    isUser
                      ? 'bg-indigo-600 rounded-tr-none text-white shadow-lg shadow-indigo-500/10 border border-indigo-500/30'
                      : 'bg-slate-900 rounded-tl-none border border-slate-800 text-slate-200'
                  }`}
                >
                  {/* Attached Image if any */}
                  {msg.imageUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-slate-700 max-w-sm">
                      <img
                        src={msg.imageUrl}
                        alt="User Attachment"
                        className="w-full h-auto object-cover max-h-56"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Tool Execution Pills in User/Assistant context */}
                  {msg.toolInvocations && msg.toolInvocations.length > 0 && isUser && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
                        Executing Tools
                      </span>
                    </div>
                  )}

                  {/* Markdown Content */}
                  <div className="markdown-content prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          const codeId = `code-${Math.random().toString(36).substring(2, 7)}`;
                          return !inline && match ? (
                            <div className="my-3 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                                <span className="font-semibold text-indigo-400">{match[1]}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onOpenSandbox(codeString, match[1])}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 transition-colors font-medium cursor-pointer"
                                  >
                                    <Terminal className="w-3 h-3" />
                                    <span>Run in Sandbox</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopyCode(codeString, codeId)}
                                    className="p-1 text-slate-400 hover:text-white"
                                    title="Copy code"
                                  >
                                    {copiedCodeIdx === codeId ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <pre className="p-3 overflow-x-auto text-slate-300">
                                <code>{children}</code>
                              </pre>
                            </div>
                          ) : (
                            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Grounded RAG Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Grounded Citations ({msg.citations.length})</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {msg.citations.map((cit, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1"
                          >
                            <div className="font-semibold text-indigo-400 flex items-center justify-between">
                              <span className="truncate">{cit.source}</span>
                              {cit.pageNumber && <span>p.{cit.pageNumber}</span>}
                            </div>
                            <p className="text-slate-400 line-clamp-2 italic">"{cit.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Level 2 Security Human-in-the-Loop Confirmation */}
                  {msg.confirmation && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Permission Confirmation Required (Level 2)</span>
                      </div>
                      <p className="text-xs text-amber-200">{msg.confirmation.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          id="confirm-action-btn"
                          onClick={() => onConfirmAction(msg.confirmation!, true)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                        >
                          Confirm & Execute
                        </button>
                        <button
                          id="cancel-action-btn"
                          onClick={() => onConfirmAction(msg.confirmation!, false)}
                          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tool Invocations Execution Log & Web Activity Cards */}
                  {msg.toolInvocations && msg.toolInvocations.length > 0 && !isUser && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      {/* 1. Dedicated Web Activity Cards if present */}
                      {msg.toolInvocations
                        .filter(
                          (t) =>
                            t.toolName === 'web_navigation' ||
                            t.toolName === 'app_launcher' ||
                            t.result?.action === 'web_redirect' ||
                            t.result?.url ||
                            t.result?.urlOrUri
                        )
                        .map((tool) => (
                          <WebActivityCard key={`web-${tool.id}`} tool={tool} />
                        ))}

                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Executed Autonomous Tools
                      </div>
                      {msg.toolInvocations.map((tool) => {
                        const isExpanded = Boolean(expandedToolIds[tool.id]);
                        return (
                          <div
                            key={tool.id}
                            className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs"
                          >
                            <div
                              onClick={() => toggleToolExpand(tool.id)}
                              className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-800 font-semibold">
                                  {tool.toolName}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Level {tool.permissionLevel} • {tool.executionTimeMs || 12}ms
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                                <span>{isExpanded ? 'Hide Payload' : 'Inspect'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-3 bg-slate-950 border-t border-slate-800 font-mono text-[10px] space-y-2 text-slate-300">
                                <div>
                                  <span className="text-slate-500">Parameters:</span>
                                  <pre className="mt-1 p-2 bg-slate-900 rounded overflow-x-auto text-indigo-300">
                                    {JSON.stringify(tool.parameters, null, 2)}
                                  </pre>
                                </div>
                                {tool.result && (
                                  <div>
                                    <span className="text-slate-500">Output Result:</span>
                                    <pre className="mt-1 p-2 bg-slate-900 rounded overflow-x-auto text-emerald-300">
                                      {JSON.stringify(tool.result, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Speech & Telemetry Footer */}
                  {!isUser && (
                    <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSpeak(msg.content, msg.id)}
                          className="p-1 text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                          title={isSpeakingMessageId === msg.id ? 'Stop speech' : 'Listen with TTS'}
                        >
                          {isSpeakingMessageId === msg.id ? (
                            <>
                              <Square className="w-3 h-3 text-rose-400 fill-current animate-pulse" />
                              <span className="text-rose-400">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {msg.telemetry && (
                          <button
                            onClick={() => toggleTelemetryExpand(msg.id)}
                            className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Shield className="w-3 h-3 text-indigo-400" />
                            <span>Telemetry ({msg.telemetry.latencyMs}ms)</span>
                          </button>
                        )}
                      </div>

                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Telemetry Details */}
                  {msg.telemetry && expandedTelemetryIds[msg.id] && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                      <div>Request ID: <span className="text-slate-300">{msg.telemetry.requestId}</span></div>
                      <div>Model: <span className="text-indigo-300">{msg.telemetry.modelUsed}</span></div>
                      <div>Latency: <span className="text-emerald-300">{msg.telemetry.latencyMs}ms</span></div>
                      <div>Memory Injected: <span className="text-slate-300">{msg.telemetry.memoryRetrievedCount} entities</span></div>
                      <div>Prompt Firewall: <span className="text-emerald-400 font-semibold">{msg.telemetry.promptInjectionSafe ? 'Passed (Clean)' : 'Flagged'}</span></div>
                    </div>
                  )}
                </div>

                {/* Timestamp underneath bubble */}
                <span className={`text-[10px] text-slate-500 ${isUser ? 'mr-1' : 'ml-1'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-lg flex items-center gap-3 text-xs text-indigo-400 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                <span>AURA is reasoning, verifying permissions, and orchestrating tools...</span>
              </div>
            </div>
          )}


          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="py-2 px-4 sm:px-6 overflow-x-auto flex items-center gap-1.5 scrollbar-none border-t border-slate-800/60 bg-[#020617]">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(item.prompt)}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Voice Listening Active Strip */}
        {isListening && (
          <div className="mx-4 sm:mx-6 mb-2 p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-between text-xs text-indigo-200 shadow-xl animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
              <div className="flex items-center gap-1">
                <span className="font-semibold text-indigo-300">Voice Input Active:</span>
                <span className="font-mono text-white italic">
                  {voiceTranscript || 'Say "Hey Aura" or speak your command...'}
                </span>
              </div>
            </div>
            <button
              onClick={onToggleListening}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
            >
              Done Listening
            </button>
          </div>
        )}

        {/* Bottom Bento Command Bar */}
        <div className="h-20 sm:h-24 px-4 sm:px-6 border-t border-slate-800 flex items-center gap-3 sm:gap-4 bg-[#020617] shrink-0">
          <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
            {attachedImage && (
              <div className="absolute -top-12 left-0 p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
                <img src={attachedImage} alt="Attachment" className="w-6 h-6 rounded object-cover" />
                <span className="text-slate-300 text-[11px]">Attachment included</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="text-slate-500 hover:text-rose-400 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />

            <input
              id="chat-user-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask AURA to perform a task, inspect files, or control system..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
            />

            <div className="absolute right-3 top-3 flex items-center gap-1.5 text-slate-500">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-white transition-colors p-1"
                title="Attach screenshot or file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              {inputText.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="hover:text-indigo-400 text-indigo-500 transition-colors p-1"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Large Round Voice Microphone Button */}
          <button
            type="button"
            id="chat-mic-round-btn"
            onClick={onToggleListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/30 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
            title={isListening ? 'Stop Voice Listening' : 'Speak to AURA ("Hey Aura")'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </section>

      {/* 3. Right Bento Grid Metrics & Knowledge Rail */}
      <aside className="w-80 border-l border-slate-800 bg-[#020617] p-4 hidden xl:flex flex-col gap-4 overflow-y-auto shrink-0">
        {/* Hardware Mini Gauges Grid */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div
            onClick={() => onNavigateTab && onNavigateTab('system')}
            className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition-colors cursor-pointer"
            title="Click to view full System Monitor"
          >
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">CPU Usage</p>
            <p className="text-xl font-bold text-white font-mono">{cpuVal}%</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, cpuVal))}%` }}
              />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab && onNavigateTab('system')}
            className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition-colors cursor-pointer"
            title="Click to view full System Monitor"
          >
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">RAM Load</p>
            <p className="text-xl font-bold text-white font-mono">
              6.2<span className="text-xs font-normal text-slate-500 ml-1">GB</span>
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, ramVal))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Long-Term Memory Bento Tile */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Long-Term Memory</p>
            <span className="text-[10px] text-indigo-400 font-bold font-mono">348 Entities</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            <div
              onClick={() => onSendMessage('What are my user preferences?')}
              className="p-2 bg-slate-800/40 hover:bg-slate-800/80 rounded-lg text-xs transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <span className="text-indigo-400 font-bold">Preference:</span> Uses Dark Mode & VS Code keybindings
            </div>
            <div
              onClick={() => onSendMessage('What do you remember about my major project deadline?')}
              className="p-2 bg-slate-800/40 hover:bg-slate-800/80 rounded-lg text-xs transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <span className="text-indigo-400 font-bold">Fact:</span> Major project presentation on Friday 10 AM
            </div>
            <div
              onClick={() => onSendMessage('What are my pending tasks in the planner?')}
              className="p-2 bg-slate-800/40 hover:bg-slate-800/80 rounded-lg text-xs transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <span className="text-indigo-400 font-bold">Task:</span> Review 'Neural Nets' chapter and architecture
            </div>
            <div
              onClick={() => onSendMessage('What is my primary email contact preference?')}
              className="p-2 bg-slate-800/40 hover:bg-slate-800/80 rounded-lg text-xs transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <span className="text-indigo-400 font-bold">Contact:</span> Professor Dr. R. Sharma (CSE Dept)
            </div>
          </div>
        </div>

        {/* Web Activity & Voice Navigation Hub Tile */}
        <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-xl shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Voice Web Launcher</span>
            </p>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
              Direct Link
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { name: 'YouTube', icon: '▶️', prompt: 'Open YouTube' },
              { name: 'GitHub', icon: '🐙', prompt: 'Open GitHub' },
              { name: 'Google', icon: '🔍', prompt: 'Open Google' },
              { name: 'Wikipedia', icon: '📚', prompt: 'Open Wikipedia' },
              { name: 'LeetCode', icon: '💡', prompt: 'Open LeetCode' },
              { name: 'ChatGPT', icon: '🤖', prompt: 'Open ChatGPT' },
            ].map((site) => (
              <button
                key={site.name}
                onClick={() => onSendMessage(site.prompt)}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 text-[11px] text-slate-300 transition-colors text-left cursor-pointer"
                title={`Voice Command: "${site.prompt}"`}
              >
                <span>{site.icon}</span>
                <span className="truncate">{site.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Files Analyzed Bento Tile */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Recent Files Analyzed</p>
            <span
              onClick={() => onNavigateTab && onNavigateTab('rag')}
              className="text-[10px] text-slate-400 hover:text-white cursor-pointer font-medium"
            >
              View RAG Hub
            </span>
          </div>

          <div className="space-y-2">
            <div
              onClick={() => onSendMessage('Summarize research_paper_v2.pdf')}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700 shrink-0">
                PDF
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate font-medium">research_paper_v2.pdf</p>
                <p className="text-[10px] text-slate-500">Analyzed 5m ago • 4 chunks</p>
              </div>
            </div>

            <div
              onClick={() => onSendMessage('Explain data_loader.py script')}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700 shrink-0">
                PY
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate font-medium">data_loader.py</p>
                <p className="text-[10px] text-slate-500">Debugged 1h ago in Sandbox</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
