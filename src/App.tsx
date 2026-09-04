import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { SystemMonitor } from './components/SystemMonitor';
import { RagStudio } from './components/RagStudio';
import { MemoryVault } from './components/MemoryVault';
import { TaskPlanner } from './components/TaskPlanner';
import { SecurityAuditView } from './components/SecurityAuditView';
import { ProjectDefensePanel } from './components/ProjectDefensePanel';
import { FuturisticAISuite } from './components/FuturisticAISuite';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import { AuthModal } from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { ConfirmationPayload, Message, SystemStatus } from './types';
import { speechHandler } from './utils/speech';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [assistantStatus, setAssistantStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'executing_tool' | 'error'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [unreadTasksCount, setUnreadTasksCount] = useState(0);

  // Sandbox Modal State
  const [sandboxModal, setSandboxModal] = useState<{
    isOpen: boolean;
    code: string;
    language: string;
  }>({
    isOpen: false,
    code: '',
    language: 'javascript',
  });

  // Chat Messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### 👋 Greetings! I am **AURA** (Autonomous Multimodal Personal Assistant).

I am your intelligent assistant equipped with:
- 🛠️ **Modular Tool Calling**: Math calculation, system telemetry, desktop application launching, and email drafting.
- 🧠 **Persistent Long-Term Memory**: Automatically indexing personal preferences, deadlines, and project notes.
- 📚 **RAG File Intelligence**: Parsing PDFs, docs, and CSVs with semantic vector chunking & citations.
- 💻 **Isolated Code Sandbox**: Executing JavaScript & Python safely in an isolated VM worker.
- 🛡️ **Zero-Trust Security**: Multi-tier permission gates, confirmation modals for mutative actions, and real-time prompt injection defense.
- 🎙️ **Multimodal Voice & Vision**: Real-time STT/TTS and image inspection.

*Try asking me to open an app, check system stats, remember a note, schedule a task, or run the **Major Project Defense** automated test suite!*`,
      timestamp: new Date().toISOString(),
      telemetry: {
        requestId: 'req-init',
        modelUsed: 'gemini-2.5-flash (AURA Engine)',
        latencyMs: 18,
        intentDetected: 'assistant_greeting',
        memoryRetrievedCount: 3,
        docsRetrievedCount: 0,
        toolsExecutedCount: 0,
        promptInjectionSafe: true,
      },
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Poll system status periodically
  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      setSystemStatus(data);
    } catch (err) {}
  };

  const fetchTasksCount = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const pending = data.filter((t: any) => t.status !== 'completed').length;
      setUnreadTasksCount(pending);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSystemStatus();
    fetchTasksCount();
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle Chat Submissions
  const handleSendMessage = async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    const userMessageId = `usr-${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      role: 'user',
      content: text,
      imageUrl: image,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setAssistantStatus('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          imageUrl: image,
          offlineOnly: isOffline,
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: data.id || `ast-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        toolInvocations: data.toolInvocations,
        confirmation: data.confirmation,
        citations: data.citations,
        telemetry: data.telemetry,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      fetchTasksCount();
      fetchSystemStatus();

      // Voice synthesis if not muted
      if (!isMuted && data.content) {
        setAssistantStatus('speaking');
        // Clean markdown symbols for cleaner speech
        const speechText = data.content
          .replace(/```[\s\S]*?```/g, 'Code block generated.')
          .replace(/[#*`_\[\]()]/g, '')
          .slice(0, 300);

        speechHandler.speak(speechText, {
          onEnd: () => setAssistantStatus('idle'),
        });
      } else {
        setAssistantStatus('idle');
      }
    } catch (err: any) {
      setAssistantStatus('error');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Service Error**: Could not complete request (${err.message}). Check connection or server logs.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Human-In-The-Loop Confirmation
  const handleConfirmAction = async (confirmation: ConfirmationPayload, approved: boolean) => {
    if (!approved) {
      setMessages((prev) => [
        ...prev,
        {
          id: `conf-cancel-${Date.now()}`,
          role: 'assistant',
          content: `❌ **Action Cancelled**: Operation **${confirmation.toolName}** was dismissed by the user.`,
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    setIsLoading(true);
    setAssistantStatus('executing_tool');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Execute confirmed action: ${confirmation.toolName}`,
          confirmedAction: {
            toolName: confirmation.toolName,
            parameters: confirmation.pendingParams,
          },
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: data.id || `ast-${Date.now()}`,
          role: 'assistant',
          content: `✅ **Action Confirmed & Executed Successfully**\n\n${data.content}`,
          toolInvocations: data.toolInvocations,
          telemetry: data.telemetry,
          timestamp: new Date().toISOString(),
        },
      ]);
      setAssistantStatus('idle');
    } catch (e: any) {
      setAssistantStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Recognition Controls
  const toggleVoiceListening = useCallback(() => {
    if (isListening) {
      speechHandler.stopListening();
      setIsListening(false);
      setAssistantStatus('idle');
      if (voiceTranscript.trim()) {
        handleSendMessage(voiceTranscript);
        setVoiceTranscript('');
      }
    } else {
      setVoiceTranscript('');
      setIsListening(true);
      setAssistantStatus('listening');
      speechHandler.startListening(
        (transcript, isFinal) => {
          setVoiceTranscript(transcript);
          if (isFinal && transcript.trim()) {
            speechHandler.stopListening();
            setIsListening(false);
            handleSendMessage(transcript);
            setVoiceTranscript('');
          }
        },
        () => {
          // Wake word triggered
          setAssistantStatus('listening');
        },
        (err) => {
          setIsListening(false);
          setAssistantStatus('idle');
        }
      );
    }
  }, [isListening, voiceTranscript]);

  const handleOpenSandbox = (code: string, language: string) => {
    setSandboxModal({
      isOpen: true,
      code,
      language: language || 'javascript',
    });
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `🔄 **Workspace Session Reset.** Memory vault and document knowledge remain securely indexed. How can I assist you now?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleRunScenario = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        assistantStatus={assistantStatus}
        isListening={isListening}
        onToggleListening={toggleVoiceListening}
        isMuted={isMuted}
        onToggleMute={() => {
          if (!isMuted) speechHandler.stopSpeaking();
          setIsMuted(!isMuted);
        }}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        unreadTasksCount={unreadTasksCount}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col bg-[#020617] overflow-hidden">
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            onConfirmAction={handleConfirmAction}
            isLoading={isLoading}
            onOpenSandbox={handleOpenSandbox}
            onClearChat={handleClearChat}
            isListening={isListening}
            onToggleListening={toggleVoiceListening}
            voiceTranscript={voiceTranscript}
            isMuted={isMuted}
            systemStatus={systemStatus}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'futuristic' && (
          <FuturisticAISuite
            onAskInChat={(query) => {
              setActiveTab('chat');
              handleSendMessage(query);
            }}
          />
        )}

        {activeTab === 'system' && (
          <SystemMonitor

            systemStatus={systemStatus}
            onRefresh={fetchSystemStatus}
            onRunDiagnostic={() => {
              setActiveTab('chat');
              handleSendMessage('Run a full hardware and system diagnostic assessment.');
            }}
          />
        )}

        {activeTab === 'rag' && (
          <RagStudio
            onAskInChat={(query) => {
              setActiveTab('chat');
              handleSendMessage(query);
            }}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryVault
            onAskInChat={(query) => {
              setActiveTab('chat');
              handleSendMessage(query);
            }}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskPlanner
            onAskInChat={(query) => {
              setActiveTab('chat');
              handleSendMessage(query);
            }}
          />
        )}

        {activeTab === 'security' && (
          <SecurityAuditView
            onAskInChat={(query) => {
              setActiveTab('chat');
              handleSendMessage(query);
            }}
          />
        )}

        {activeTab === 'defense' && (
          <ProjectDefensePanel
            onRunScenario={handleRunScenario}
          />
        )}
      </main>

      {/* Code Sandbox Modal */}
      <CodeSandboxModal
        isOpen={sandboxModal.isOpen}
        onClose={() => setSandboxModal({ ...sandboxModal, isOpen: false })}
        initialCode={sandboxModal.code}
        initialLanguage={sandboxModal.language}
      />

      {/* Authentication & Account Security Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

