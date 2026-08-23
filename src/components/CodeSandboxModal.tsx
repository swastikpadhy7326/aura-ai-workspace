import React, { useState } from 'react';
import { X, Play, Terminal, Check, AlertCircle, Copy } from 'lucide-react';

interface CodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  initialLanguage: string;
}

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  initialLanguage,
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage || 'javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    const start = Date.now();
    try {
      const res = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setExecTime(Date.now() - start);
      if (data.error) {
        setOutput(`[Execution Error]: ${data.error}`);
      } else {
        setOutput(data.stdout || `Code evaluated successfully. Returned: ${JSON.stringify(data.returnValue)}`);
      }
    } catch (err: any) {
      setOutput(`[Sandbox Error]: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#020617] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Isolated Code Execution Sandbox</h2>
              <p className="text-[11px] text-slate-400">Sandboxed worker runtime with memory ceilings and execution timeouts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript / TypeScript</option>
              <option value="python">Python 3.11</option>
            </select>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 cursor-pointer"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden min-h-[380px]">
          {/* Code Input */}
          <div className="flex flex-col h-full bg-slate-950/40">
            <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Source Script</span>
              <span className="text-[10px] text-indigo-400 font-mono">Restricted Sandbox Active</span>
            </div>
            <textarea
              id="sandbox-code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full flex-1 p-4 bg-transparent text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
              spellCheck={false}
              placeholder="// Write code here to execute inside the sandbox..."
            />
          </div>

          {/* Execution Output */}
          <div className="flex flex-col h-full bg-[#020617]">
            <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Standard Output (stdout)</span>
              {execTime !== null && (
                <span className="text-[10px] text-emerald-400 font-mono">Latency: {execTime}ms</span>
              )}
            </div>
            <div className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {isRunning ? (
                <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                  <Terminal className="w-4 h-4" />
                  <span>Evaluating code in isolated sandbox...</span>
                </div>
              ) : output !== null ? (
                <div className={output.includes('Error') ? 'text-rose-400' : 'text-emerald-300'}>
                  {output}
                </div>
              ) : (
                <span className="text-slate-600 italic">Click "Run in Sandbox" to execute and inspect console output.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Process isolation prevents filesystem and unauthenticated network access.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors border border-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              id="run-sandbox-btn"
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Running...' : 'Run in Sandbox'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
