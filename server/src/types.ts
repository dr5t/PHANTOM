// =============================================================================
// PHANTOM Server — Shared Type Definitions
// =============================================================================

// --- Git Data Types ---

export interface GitCommit {
  hash: string;
  shortHash: string;
  author: string;
  authorEmail: string;
  date: string;
  timestamp: number;
  message: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  lastCommitHash: string;
  lastCommitDate: string;
}

export interface GitStash {
  index: number;
  message: string;
  date: string;
  branch: string;
  diff?: string;
}

export interface GitTag {
  name: string;
  hash: string;
  date?: string;
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

// --- TODO Detection ---

export interface TodoItem {
  type: 'TODO' | 'FIXME' | 'HACK' | 'XXX' | 'BUG' | 'NOTE';
  text: string;
  file: string;
  line: number;
  context: string;
  priority: 'high' | 'medium' | 'low';
}

// --- Repository Analysis ---

export interface AnalyzedRepository {
  id: string;
  name: string;
  path: string;
  analyzedAt: string;

  totalCommits: number;
  totalBranches: number;
  totalStashes: number;
  totalTags: number;

  primaryLanguage: string;
  languages: Record<string, number>;

  lastCommitDate: string;
  lastCommitAuthor: string;
  daysInactive: number;

  commits: GitCommit[];
  branches: GitBranch[];
  stashes: GitStash[];
  tags: GitTag[];
  todos: TodoItem[];
  uncommittedChanges: FileChange[];

  readmeContent?: string;
  packageJson?: Record<string, unknown>;

  description: string;
  primaryRisk: string;
}

// --- SSE Scan Events ---

export type ScanPhase =
  | 'validating'
  | 'history'
  | 'branches'
  | 'stashes'
  | 'todos'
  | 'files'
  | 'complete'
  | 'error';

export interface ScanEvent {
  phase: ScanPhase;
  progress: number;
  message: string;
  detail?: string;
}

// --- Ollama ---

export interface OllamaModel {
  name: string;
  size: number;
  sizeFormatted: string;
  modifiedAt: string;
  digest: string;
  parameterSize?: string;
  quantizationLevel?: string;
}

export interface OllamaStatus {
  available: boolean;
  models: OllamaModel[];
  error?: string;
}

// --- Q&A ---

export interface QARequest {
  question: string;
  model: string;
}

export interface QAResponse {
  answer: string;
  evidence: {
    type: 'commit' | 'file' | 'todo' | 'stash' | 'diff';
    reference: string;
    snippet?: string;
  }[];
  model: string;
  isAIGenerated: boolean;
  confidence: 'high' | 'medium' | 'low';
  processingTimeMs: number;
}

// --- Resurrection Report ---

export interface ResurrectionReport {
  repoName: string;
  repoPath: string;
  generatedAt: string;
  overview: string;
  abandonmentDiagnosis: string;
  historicalMilestones: {
    title: string;
    description: string;
    evidence: string;
  }[];
  unfinishedFeatures: {
    feature: string;
    completionPct: number;
    blocker: string;
    files: string[];
  }[];
  potentialIssues: {
    severity: 'high' | 'medium' | 'low';
    issue: string;
    fixCommand?: string;
  }[];
  recommendedNextSteps: {
    stepNumber: number;
    title: string;
    actionCommand: string;
    explanation: string;
  }[];
  isAIEnhanced: boolean;
}

// --- Terminal ---

export interface TerminalResponse {
  lines: {
    text: string;
    type: 'ok' | 'info' | 'warn' | 'error' | 'evidence' | 'command' | 'plain' | 'comment' | 'success' | 'todo' | 'diff-add' | 'diff-remove';
  }[];
  clear?: boolean;
}

// --- Timeline Event (for GhostMemory) ---

export interface TimelineEvent {
  id: string;
  type: 'commit' | 'stash' | 'todo' | 'branch_diverge' | 'dependency_break';
  timestamp: string;
  relativeTime: string;
  commitHash?: string;
  author: string;
  message: string;
  fileReference?: string;
  lineNumber?: number;
  codeSnippet?: string;
  todoText?: string;
  tags: string[];
  isFact: boolean;
  aiInterpretation?: string;
  confidenceScore: number;
}
