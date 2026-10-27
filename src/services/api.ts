// =============================================================================
// PHANTOM Frontend — Backend API Client
// =============================================================================

import type { RepositoryItem, MemoryEvent, ResurrectionReport } from '../types';

export interface OllamaModelInfo {
  name: string;
  size: number;
  sizeFormatted: string;
  modifiedAt: string;
  digest: string;
  parameterSize?: string;
  quantizationLevel?: string;
}

export interface OllamaStatusResponse {
  available: boolean;
  models: OllamaModelInfo[];
  error?: string;
}

export interface ScanStreamEvent {
  phase: 'validating' | 'history' | 'branches' | 'stashes' | 'todos' | 'files' | 'complete' | 'error';
  progress: number;
  message: string;
  detail?: string;
}

export interface QAResponsePayload {
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

export interface TerminalExecResponse {
  lines: {
    text: string;
    type: 'ok' | 'info' | 'warn' | 'error' | 'evidence' | 'command' | 'plain' | 'comment' | 'success' | 'todo' | 'diff-add' | 'diff-remove';
  }[];
  clear?: boolean;
}

const API_BASE = '/api';

/**
 * Check backend health
 */
export async function fetchHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

/**
 * Check genuine Ollama availability and discover installed models
 */
export async function fetchOllamaStatus(): Promise<OllamaStatusResponse> {
  try {
    const res = await fetch(`${API_BASE}/ollama/status`);
    if (!res.ok) {
      return { available: false, models: [], error: `HTTP ${res.status}: ${res.statusText}` };
    }
    return await res.json();
  } catch (err: any) {
    return {
      available: false,
      models: [],
      error: err.message || 'Cannot connect to PHANTOM backend',
    };
  }
}

/**
 * Validates a repository path on the host filesystem
 */
export async function validateRepositoryPath(path: string): Promise<{
  valid: boolean;
  resolvedPath?: string;
  name?: string;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/repos/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  return res.json();
}

/**
 * Starts a real-time SSE stream for repository archaeological analysis
 */
export function streamRepositoryScan(
  path: string,
  onEvent: (event: ScanStreamEvent) => void,
  onError: (error: string) => void,
  onComplete: () => void
): () => void {
  const encodedPath = encodeURIComponent(path);
  const eventSource = new EventSource(`${API_BASE}/repos/scan-stream?path=${encodedPath}`);

  eventSource.onmessage = (e) => {
    try {
      const data: ScanStreamEvent = JSON.parse(e.data);
      onEvent(data);
      if (data.phase === 'complete') {
        eventSource.close();
        onComplete();
      } else if (data.phase === 'error') {
        eventSource.close();
        onError(data.message);
      }
    } catch (err: any) {
      eventSource.close();
      onError(`Failed to parse scan stream: ${err.message}`);
    }
  };

  eventSource.onerror = () => {
    eventSource.close();
    onError('Disconnected from scan stream.');
  };

  return () => {
    eventSource.close();
  };
}

/**
 * Fetch all analyzed repositories
 */
export async function fetchRepositories(): Promise<RepositoryItem[]> {
  const res = await fetch(`${API_BASE}/repos`);
  if (!res.ok) throw new Error(`Failed to fetch repositories: ${res.statusText}`);
  const backendRepos = await res.json();

  return backendRepos.map((r: any): RepositoryItem => ({
    id: r.id,
    name: r.name,
    path: r.path,
    language: (['TypeScript', 'Rust', 'Python', 'Go', 'C++'].includes(r.primaryLanguage)
      ? r.primaryLanguage
      : 'TypeScript') as any,
    lastActivity: `${r.daysInactive} days ago`,
    lastActivityTimestamp: r.lastCommitDate,
    daysInactive: r.daysInactive,
    unfinishedTasksCount: r.todos?.length || 0,
    status: r.daysInactive > 180 ? 'Needs Resurrection' : 'Memory Ready',
    commitCount: r.totalCommits,
    branchesCount: r.totalBranches,
    stashesCount: r.totalStashes,
    description: r.description,
    primaryRisk: r.primaryRisk,
    abandonReason: r.primaryRisk,
  }));
}

/**
 * Fetch timeline events for GhostMemory
 */
export async function fetchTimelineEvents(repoId: string): Promise<MemoryEvent[]> {
  const res = await fetch(`${API_BASE}/repos/${repoId}/timeline`);
  if (!res.ok) throw new Error(`Failed to fetch timeline: ${res.statusText}`);
  return res.json();
}

/**
 * Ask evidence-grounded AI question
 */
export async function askForensicsAI(
  repoId: string,
  question: string,
  model?: string
): Promise<QAResponsePayload> {
  const res = await fetch(`${API_BASE}/repos/${repoId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, model }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Q&A inquiry failed');
  }
  return res.json();
}

/**
 * Fetch resurrection report
 */
export async function fetchResurrectionReport(repoId: string): Promise<ResurrectionReport> {
  const res = await fetch(`${API_BASE}/repos/${repoId}/report`);
  if (!res.ok) throw new Error(`Failed to fetch resurrection report: ${res.statusText}`);
  return res.json();
}

/**
 * Download or retrieve raw markdown report
 */
export async function fetchReportMarkdown(repoId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/repos/${repoId}/report/markdown`);
  if (!res.ok) throw new Error(`Failed to export markdown: ${res.statusText}`);
  return res.text();
}

/**
 * Execute controlled terminal command
 */
export async function executeTerminalCommand(
  command: string,
  repoId?: string
): Promise<TerminalExecResponse> {
  const res = await fetch(`${API_BASE}/terminal/exec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, repoId }),
  });
  if (!res.ok) throw new Error(`Terminal request failed: ${res.statusText}`);
  return res.json();
}
