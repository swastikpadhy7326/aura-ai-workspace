export type Role = 'user' | 'assistant' | 'system' | 'tool';

export type PermissionLevel = 0 | 1 | 2 | 3; // 0: Read-only, 1: Safe Action, 2: Confirmation Required, 3: High Risk / Restricted

export interface Citation {
  source: string;
  title: string;
  uri?: string;
  snippet: string;
  pageNumber?: number;
  chunkId?: string;
}

export interface ToolInvocation {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'requires_confirmation' | 'approved' | 'rejected' | 'success' | 'failed';
  permissionLevel: PermissionLevel;
  executionTimeMs?: number;
  explanation?: string;
  error?: string;
}

export interface ConfirmationPayload {
  id: string;
  actionType: string;
  toolName: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  pendingParams: Record<string, any>;
  targetResource?: string;
}

export interface ExecutionTelemetry {
  requestId: string;
  modelUsed: string;
  latencyMs: number;
  tokensUsed?: number;
  intentDetected: string;
  memoryRetrievedCount: number;
  docsRetrievedCount: number;
  toolsExecutedCount: number;
  promptInjectionSafe: boolean;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  status?: 'sending' | 'thinking' | 'executed' | 'error';
  toolInvocations?: ToolInvocation[];
  citations?: Citation[];
  confirmation?: ConfirmationPayload;
  imageUrl?: string;
  audioBase64?: string;
  telemetry?: ExecutionTelemetry;
  error?: string;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'Preferences' | 'Work' | 'Education' | 'Personal' | 'System' | 'Fact';
  confidence: number;
  createdAt: string;
  lastAccessedAt: string;
  pinned?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  category?: string;
  reminderSent?: boolean;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docName: string;
  chunkIndex: number;
  text: string;
  tokenEstimate: number;
  similarityScore?: number;
  page?: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  chunkCount: number;
  summary?: string;
  chunks: DocumentChunk[];
}

export interface ProcessItem {
  pid: number;
  name: string;
  cpuPercent: number;
  memMb: number;
  status: 'running' | 'idle' | 'sleeping';
}

export interface SystemStatus {
  cpuUsage: number;
  ramUsage: number;
  ramTotalGb: number;
  ramUsedGb: number;
  diskUsage: number;
  diskTotalGb: number;
  batteryLevel: number;
  isCharging: boolean;
  networkLatencyMs: number;
  osInfo: string;
  uptimeSeconds: number;
  temperatureC: number;
  activeProcesses: ProcessItem[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  intent: string;
  toolName: string;
  durationMs: number;
  status: 'success' | 'failed' | 'blocked' | 'confirmed';
  modelUsed: string;
  details: string;
  permissionLevel: PermissionLevel;
}

export interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;
  voiceName: string;
  rate: number;
  pitch: number;
  wakeWordEnabled: boolean;
  wakeWord: string;
}

export interface SecurityConfig {
  permissionMode: 'strict' | 'balanced' | 'autonomous';
  promptInjectionDefense: boolean;
  offlineOnly: boolean;
  llmProvider: 'gemini' | 'ollama' | 'local_heuristic';
  localModelName: string;
  allowlistedApps: string[];
}

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'Agent Reasoning' | 'Tool Calling' | 'Memory CRUD' | 'RAG Retrieval' | 'Prompt Injection Defense' | 'Sandboxed Execution';
  prompt: string;
  expectedBehavior: string;
  actualResult?: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  executionTimeMs?: number;
}

export interface KnowledgeSourceStatus {
  id: string;
  name: string;
  type: 'web_search' | 'vector_rag' | 'memory_vault' | 'system_os' | 'temporal_engine';
  status: 'connected' | 'syncing' | 'error';
  lastSyncTime: string;
  itemCount?: number;
  latencyMs?: number;
  description: string;
}

export interface KnowledgeStatus {
  lastSyncTime: string;
  freshness: 'realtime' | 'fresh' | 'stale';
  freshnessScore: number;
  activeSources: KnowledgeSourceStatus[];
  totalQueriesGrounded: number;
  isSyncing: boolean;
}

export interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialization: string;
  status: 'idle' | 'analyzing' | 'synthesizing' | 'voting' | 'completed';
  confidence: number;
  currentThought?: string;
  activeSubtasks: string[];
  metrics: {
    tokensPerSec: number;
    entropy: number;
    latencyMs: number;
  };
}

export interface SwarmMissionResult {
  missionId: string;
  goal: string;
  consensusScore: number;
  status: 'executing' | 'consensus_reached' | 'completed';
  agentContributions: Array<{
    agentId: string;
    agentName: string;
    role: string;
    output: string;
    confidence: number;
    vote: 'approve' | 'refine' | 'diverge';
  }>;
  synthesizedBlueprint: string;
  telemetry: {
    totalTokens: number;
    computeTimeMs: number;
    parallelThreads: number;
  };
}

export interface PredictiveIntent {
  id: string;
  predictedAction: string;
  category: 'workflow_optimization' | 'code_patch' | 'security_hardening' | 'research_synthesis' | 'system_tuning';
  confidenceScore: number;
  rationale: string;
  suggestedPrompt: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  autoExecutable: boolean;
}

export interface SpatialVisionScanResult {
  scanId: string;
  timestamp: string;
  detectedEntities: Array<{
    id: string;
    label: string;
    type: 'ui_component' | 'code_block' | 'architecture_diagram' | 'data_table' | 'security_risk';
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    extractedDetails: string;
  }>;
  ocrExtractedTokens: string[];
  semanticDepthScore: number;
  suggestedOptimizations: string[];
}

export interface SpeculativeBranch {
  id: string;
  name: string;
  strategy: 'Ultra-Low Latency' | 'Memory-Constrained Zero-Copy' | 'Fault-Tolerant High-Resilience';
  code: string;
  language: string;
  complexity: {
    time: string;
    space: string;
  };
  benchmarks: {
    estimatedExecTimeUs: number;
    memoryAllocKb: number;
    safetyScore: number;
  };
}


