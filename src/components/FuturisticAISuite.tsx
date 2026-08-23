import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Zap,
  Cpu,
  Brain,
  Shield,
  Activity,
  CheckCircle2,
  RefreshCw,
  Play,
  Terminal,
  Eye,
  Layers,
  Search,
  Code2,
  ArrowRight,
  TrendingUp,
  Sliders,
  Radio,
  Flame,
  Binary,
  Compass,
  AlertCircle,
  Copy,
  Check,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SwarmAgent, SwarmMissionResult, PredictiveIntent, SpatialVisionScanResult, SpeculativeBranch } from '../types';

interface FuturisticAISuiteProps {
  onAskInChat: (query: string) => void;
}

export const FuturisticAISuite: React.FC<FuturisticAISuiteProps> = ({ onAskInChat }) => {
  const [activeModule, setActiveModule] = useState<'swarm' | 'neurograph' | 'vision_hud' | 'predictive' | 'speculative'>('swarm');

  // Swarm State
  const [agents, setAgents] = useState<SwarmAgent[]>([]);
  const [swarmGoal, setSwarmGoal] = useState<string>('Design a high-throughput, fault-tolerant distributed event stream processor with zero-loss guarantees.');
  const [isDispatchingSwarm, setIsDispatchingSwarm] = useState(false);
  const [missionResult, setMissionResult] = useState<SwarmMissionResult | null>(null);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([
    'agent-architect',
    'agent-synthesizer',
    'agent-sentry',
    'agent-scout',
    'agent-quantum'
  ]);

  // Predictive Intent State
  const [predictiveIntents, setPredictiveIntents] = useState<PredictiveIntent[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);

  // Vision HUD State
  const [visionScan, setVisionScan] = useState<SpatialVisionScanResult | null>(null);
  const [isScanningVision, setIsScanningVision] = useState(false);
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);

  // Speculative Synthesizer State
  const [speculativePrompt, setSpeculativePrompt] = useState('Implement an ultra-high performance lock-free Ring Buffer with zero allocations');
  const [speculativeBranches, setSpeculativeBranches] = useState<SpeculativeBranch[]>([]);
  const [isSynthesizingSpeculative, setIsSynthesizingSpeculative] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch-latency');
  const [copiedBranchCode, setCopiedBranchCode] = useState(false);

  // NeuroGraph Simulation State
  const [neuralPulse, setNeuralPulse] = useState(78);
  const [reasoningDepth, setReasoningDepth] = useState(4);
  const [synapticActivity, setSynapticActivity] = useState([
    { node: 'Semantic Vector Ingestion', status: 'optimal', latency: '4ms', load: 88 },
    { node: 'Grounding Retrieval Mesh', status: 'grounded', latency: '32ms', load: 94 },
    { node: 'Speculative Branch Evaluator', status: 'parallel', latency: '12ms', load: 76 },
    { node: 'Formal Invariant Verifier', status: 'verified', latency: '18ms', load: 99 },
    { node: 'Consensus Decision Bus', status: 'converged', latency: '6ms', load: 91 },
  ]);

  // Fetch initial data
  useEffect(() => {
    fetchAgents();
    fetchPredictiveIntents();
    runVisionScan();
    runSpeculativeSynthesize();

    const interval = setInterval(() => {
      setNeuralPulse(Math.floor(75 + Math.random() * 20));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/futuristic/swarm/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      console.warn('Failed to load swarm agents', e);
    }
  };

  const fetchPredictiveIntents = async () => {
    setIsLoadingPredictions(true);
    try {
      const res = await fetch('/api/futuristic/predictive-intents');
      if (res.ok) {
        const data = await res.json();
        setPredictiveIntents(data);
      }
    } catch (e) {
      console.warn('Failed to load predictions', e);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  const handleDispatchSwarm = async () => {
    if (!swarmGoal.trim() || isDispatchingSwarm) return;
    setIsDispatchingSwarm(true);
    try {
      const res = await fetch('/api/futuristic/swarm/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: swarmGoal, agentIds: selectedAgentIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setMissionResult(data);
      }
    } catch (e) {
      console.error('Swarm mission dispatch error', e);
    } finally {
      setIsDispatchingSwarm(false);
    }
  };

  const runVisionScan = async () => {
    setIsScanningVision(true);
    try {
      const res = await fetch('/api/futuristic/vision/spatial-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleType: 'system_architecture' }),
      });
      if (res.ok) {
        const data = await res.json();
        setVisionScan(data);
        if (data.detectedEntities?.length) {
          setActiveEntityId(data.detectedEntities[0].id);
        }
      }
    } catch (e) {
      console.warn('Vision scan error', e);
    } finally {
      setIsScanningVision(false);
    }
  };

  const runSpeculativeSynthesize = async (customPrompt?: string) => {
    const p = customPrompt || speculativePrompt;
    setIsSynthesizingSpeculative(true);
    try {
      const res = await fetch('/api/futuristic/speculative/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p }),
      });
      if (res.ok) {
        const data = await res.json();
        setSpeculativeBranches(data.branches || []);
        if (data.branches?.length) {
          setSelectedBranchId(data.branches[0].id);
        }
      }
    } catch (e) {
      console.warn('Speculative synthesis error', e);
    } finally {
      setIsSynthesizingSpeculative(false);
    }
  };

  const activeBranch = speculativeBranches.find((b) => b.id === selectedBranchId) || speculativeBranches[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBranchCode(true);
    setTimeout(() => setCopiedBranchCode(false), 2000);
  };

  const presetSwarmMissions = [
    'Design a Zero-Downtime Distributed Stream Engine with 3-Node Raft Consensus',
    'Generate Quantum-Resistant Hybrid Key Exchange with Zero-Knowledge Proofs',
    'Architect an Autonomous Self-Healing Microservice Mesh with Epoll Event Loops',
    'Synthesize a Vectorized SIMD Cosine Similarity Kernel for 1536-dim Embeddings',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] text-slate-200 overflow-y-auto p-4 sm:p-6" id="futuristic-ai-suite">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Futuristic Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 p-6 shadow-2xl shadow-indigo-950/40">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 -bottom-20 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>AURA NEXT-GEN AI LABS • 2030 MATRIX</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                Futuristic Autonomous Intelligence Suite
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Harness collaborative multi-agent swarm consensus, neural thought visualizers, predictive intent forecasting, and speculative compilation branches.
              </p>
            </div>

            {/* Neural Synapse Meter */}
            <div className="flex items-center gap-4 bg-slate-950/70 border border-indigo-500/30 px-4 py-3 rounded-xl backdrop-blur-md">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Synaptic Sync</span>
                <span className="text-xl font-mono font-bold text-emerald-400">{neuralPulse}%</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Agent Swarm</span>
                <span className="text-xl font-mono font-bold text-indigo-400">5 Active</span>
              </div>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80">
            {[
              { id: 'swarm', label: 'Autonomous SwarmNet', icon: Bot, badge: '5 Agents' },
              { id: 'neurograph', label: 'NeuroGraph Thought Stream', icon: Brain, badge: 'Live' },
              { id: 'vision_hud', label: 'Spatial Vision & HUD', icon: Eye, badge: 'Multimodal' },
              { id: 'predictive', label: 'Predictive Intent Engine', icon: TrendingUp, badge: 'Anticipatory' },
              { id: 'speculative', label: 'Speculative 3-Branch Synthesis', icon: Code2, badge: 'Parallel' },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = activeModule === m.id;
              return (
                <button
                  key={m.id}
                  id={`futuristic-tab-${m.id}`}
                  onClick={() => setActiveModule(m.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{m.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODULE 1: AUTONOMOUS SWARMNET ORCHESTRATOR */}
        {activeModule === 'swarm' && (
          <div className="space-y-6" id="swarm-module-container">
            {/* Mission Dispatcher Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      SwarmNet Multi-Agent Mission Command
                    </h3>
                    <p className="text-xs text-slate-400">
                      Co-orchestrate 5 specialized frontier sub-agents to formulate consensus blueprints.
                    </p>
                  </div>
                </div>

                <button
                  id="dispatch-swarm-btn"
                  onClick={handleDispatchSwarm}
                  disabled={isDispatchingSwarm}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                    isDispatchingSwarm
                      ? 'bg-amber-600/40 text-amber-200 border border-amber-500/40 cursor-wait'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 border border-indigo-400/40'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isDispatchingSwarm ? 'animate-spin' : ''}`} />
                  <span>{isDispatchingSwarm ? 'Orchestrating Swarm...' : 'Dispatch Swarm Mission'}</span>
                </button>
              </div>

              {/* Goal Input Field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Mission Objective & Engineering Specification:</span>
                  <span className="text-[11px] text-indigo-400 font-mono">Consensus Quorum: 5/5 Agents</span>
                </label>
                <textarea
                  value={swarmGoal}
                  onChange={(e) => setSwarmGoal(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
                  placeholder="Specify complex technical task or architecture design..."
                />
              </div>

              {/* Preset Mission Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 self-center">Preset Missions:</span>
                {presetSwarmMissions.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSwarmGoal(preset);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-950/60 hover:text-indigo-200 hover:border-indigo-500/40 text-slate-300 border border-slate-700/60 transition-all text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {agents.map((agent) => {
                const isSelected = selectedAgentIds.includes(agent.id);
                return (
                  <div
                    key={agent.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/30'
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{agent.avatar}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
                          {agent.confidence}% Conf.
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white truncate">{agent.name}</h4>
                        <p className="text-[10px] text-indigo-400 font-medium truncate">{agent.role}</p>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px] text-slate-300 space-y-1">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">
                          Synaptic Thought
                        </span>
                        <p className="italic text-slate-400 leading-tight">
                          "{agent.currentThought}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{agent.metrics.tokensPerSec} t/s</span>
                      <span>{agent.metrics.latencyMs}ms latency</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Synthesized Mission Blueprint Output */}
            {missionResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-[#090d1f] border border-indigo-500/50 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-indigo-900/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        SwarmNet Consensus Blueprint Synthesized
                      </h4>
                      <p className="text-xs text-slate-400">
                        Consensus Score: <strong className="text-emerald-400">{missionResult.consensusScore}%</strong> • Compute: {missionResult.telemetry.computeTimeMs}ms
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onAskInChat(`Explain the SwarmNet Blueprint for: "${missionResult.goal}"`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                  >
                    <span>Discuss in Agent Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {missionResult.synthesizedBlueprint}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* MODULE 2: NEUROGRAPH THOUGHT STREAM */}
        {activeModule === 'neurograph' && (
          <div className="space-y-6" id="neurograph-module-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Cognitive Topology Canvas */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">
                      NeuroGraph Synaptic Pathway Architecture
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Reasoning Depth:</span>
                    <span className="font-mono font-bold text-indigo-400">{reasoningDepth} Cycles</span>
                  </div>
                </div>

                {/* Synaptic Pathway Flow Nodes */}
                <div className="space-y-3 pt-2">
                  {synapticActivity.map((node, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center font-mono text-xs font-bold text-indigo-300">
                          0{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white">{node.node}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Latency: {node.latency}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-32 hidden sm:block">
                          <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                            <span>Throughput</span>
                            <span className="font-mono">{node.load}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                              style={{ width: `${node.load}%` }}
                            />
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">
                          {node.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between text-xs text-indigo-200">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Continuous Test-Time Compute Reasoning Active (KV-Cache 99.4% Hit Rate)
                  </span>
                  <button
                    onClick={() => onAskInChat('Show full chain-of-thought verification trace for current system state.')}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-[11px] cursor-pointer"
                  >
                    View Trace in Chat
                  </button>
                </div>
              </div>

              {/* Cognitive Telemetry Sidebar */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Entropy & Uncertainty Metrics
                </h4>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                      <span>Reasoning Entropy</span>
                      <span className="text-emerald-400 font-mono">0.08 (Optimal)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[15%]" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Low entropy indicates deterministic, highly factual reasoning.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                      <span>Grounding Confidence</span>
                      <span className="text-indigo-400 font-mono">99.2%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[99%]" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Cross-referenced against live Google Search & RAG vectors.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                      <span>Speculative Branch Pruning</span>
                      <span className="text-purple-400 font-mono">4 Branches Evaluated</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Rejects sub-optimal algorithmic paths prior to final emission.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: MULTIMODAL SPATIAL VISION HUD */}
        {activeModule === 'vision_hud' && (
          <div className="space-y-6" id="vision-hud-module-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Holographic Vision Scanner Area */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">
                      Multimodal Spatial Vision & HUD Analyzer
                    </h3>
                  </div>

                  <button
                    onClick={runVisionScan}
                    disabled={isScanningVision}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanningVision ? 'animate-spin' : ''}`} />
                    <span>Rescan Spatial Field</span>
                  </button>
                </div>

                {/* Spatial Mock Canvas */}
                <div className="relative w-full h-72 rounded-xl bg-[#040817] border border-indigo-900/60 overflow-hidden flex items-center justify-center p-4">
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b15_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b15_1px,transparent_1px)] bg-[size:24px_24px]" />
                  
                  {/* Detected Entity Bounding Boxes */}
                  {visionScan?.detectedEntities.map((entity) => {
                    const isSelected = activeEntityId === entity.id;
                    return (
                      <div
                        key={entity.id}
                        onClick={() => setActiveEntityId(entity.id)}
                        className={`absolute rounded-lg border-2 cursor-pointer transition-all p-2 flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/20 z-20'
                            : entity.type === 'security_risk'
                            ? 'border-rose-500/70 bg-rose-500/10 hover:border-rose-400'
                            : 'border-indigo-500/60 bg-indigo-500/10 hover:border-indigo-400'
                        }`}
                        style={{
                          left: `${entity.boundingBox.x}%`,
                          top: `${entity.boundingBox.y}%`,
                          width: `${entity.boundingBox.width}%`,
                          height: `${entity.boundingBox.height}%`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            entity.type === 'security_risk' ? 'bg-rose-900 text-rose-200' : 'bg-slate-900 text-white'
                          }`}>
                            {entity.label}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">
                            {entity.confidence}%
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 truncate">
                          [{entity.type.toUpperCase()}]
                        </span>
                      </div>
                    );
                  })}

                  <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
                    Depth Score: <strong className="text-indigo-300">{visionScan?.semanticDepthScore || 96.5}%</strong> • Entities: {visionScan?.detectedEntities.length || 4}
                  </div>
                </div>

                {/* OCR Token Stream */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    OCR Extracted High-Entropy Tokens:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {visionScan?.ocrExtractedTokens.map((token, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-mono"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Entity Inspector Sidebar */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Spatial Entity Detail
                </h4>

                {(() => {
                  const entity = visionScan?.detectedEntities.find((e) => e.id === activeEntityId);
                  if (!entity) return <p className="text-xs text-slate-400">Click a bounding box to inspect.</p>;
                  return (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white">{entity.label}</h5>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {entity.confidence}% Conf.
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {entity.extractedDetails}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                          Recommended Hardening Vectors:
                        </span>
                        {visionScan?.suggestedOptimizations.map((opt, i) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800/70 text-[11px] text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => onAskInChat(`Apply spatial optimization patch for '${entity.label}': ${entity.extractedDetails}`)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all mt-2 cursor-pointer shadow-md"
                      >
                        Auto-Apply Patch in Chat
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* MODULE 4: PREDICTIVE INTENT ENGINE */}
        {activeModule === 'predictive' && (
          <div className="space-y-6" id="predictive-module-container">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Anticipatory Workflow Intent Predictions
                    </h3>
                    <p className="text-xs text-slate-400">
                      AURA calculates your next development operations and drafts instant execution prompts.
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchPredictiveIntents}
                  disabled={isLoadingPredictions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPredictions ? 'animate-spin' : ''}`} />
                  <span>Refresh Predictions</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {predictiveIntents.map((pred) => (
                  <div
                    key={pred.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                          {pred.confidenceScore}% Confidence
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          pred.impactLevel === 'critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-slate-900 text-slate-400'
                        }`}>
                          {pred.impactLevel.toUpperCase()} IMPACT
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">
                        {pred.predictedAction}
                      </h4>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {pred.rationale}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                        {pred.suggestedPrompt}
                      </span>
                      <button
                        onClick={() => onAskInChat(pred.suggestedPrompt)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <span>Execute</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE 5: SPECULATIVE 3-BRANCH CODE SYNTHESIS */}
        {activeModule === 'speculative' && (
          <div className="space-y-6" id="speculative-module-container">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Speculative 3-Branch Code Synthesizer
                    </h3>
                    <p className="text-xs text-slate-400">
                      Compile 3 parallel architectural variants with microsecond latency analysis.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => runSpeculativeSynthesize()}
                    disabled={isSynthesizingSpeculative}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizingSpeculative ? 'animate-spin' : ''}`} />
                    <span>Re-Synthesize Branches</span>
                  </button>
                </div>
              </div>

              {/* Branch Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {speculativeBranches.map((branch) => {
                  const isSelected = selectedBranchId === branch.id;
                  return (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold">{branch.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {branch.benchmarks.estimatedExecTimeUs}µs
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Time: {branch.complexity.time}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Active Branch Code Viewer */}
              {activeBranch && (
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-semibold text-indigo-300">
                        {activeBranch.strategy}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Mem: {activeBranch.benchmarks.memoryAllocKb} KB • Safety: {activeBranch.benchmarks.safetyScore}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(activeBranch.code)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedBranchCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBranchCode ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => onAskInChat(`Analyze and execute the ${activeBranch.name} implementation in Sandbox.`)}
                        className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Run in Sandbox
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-96 leading-relaxed">
                    <code>{activeBranch.code}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
