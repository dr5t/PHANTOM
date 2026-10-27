export type ScanStatus = 'Indexed' | 'Analyzing' | 'Memory Ready' | 'Needs Resurrection' | 'Pending';

export interface RepositoryItem {
  id: string;
  name: string;
  path: string;
  language: 'TypeScript' | 'Rust' | 'Python' | 'Go' | 'C++';
  lastActivity: string;
  lastActivityTimestamp: string;
  daysInactive: number;
  unfinishedTasksCount: number;
  status: ScanStatus;
  commitCount: number;
  branchesCount: number;
  stashesCount: number;
  description: string;
  primaryRisk: string;
  abandonReason: string;
}

export type MemoryEventType = 'commit' | 'stash' | 'todo' | 'branch_diverge' | 'dependency_break';

export interface MemoryEvent {
  id: string;
  type: MemoryEventType;
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
  isFact: boolean; // True if ground truth from git log or source code, false if AI synthesis
  aiInterpretation?: string;
  confidenceScore: number;
}

export interface ResurrectionReport {
  repoName: string;
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
}

export interface ModelOption {
  id: string;
  name: string;
  parameterSize: string;
  contextWindow: string;
  ramRequired: string;
  speed: string;
  provider: 'Ollama' | 'Local GGML' | 'WebGPU' | 'Llama.cpp';
  recommendedFor: string;
}
