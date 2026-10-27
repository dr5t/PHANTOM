// =============================================================================
// PHANTOM Server — Express API Routes & Controller
// =============================================================================

import { Router } from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateAndResolveRepoPath } from './security.js';
import { getCommitHistory, getBranches, getStashes, getTags, getUncommittedChanges, getCommitDiff } from './git.js';
import { scanCodebase } from './todos.js';
import { getOllamaStatus } from './ollama.js';
import { answerQuestionWithEvidence } from './evidenceAi.js';
import { generateResurrectionReport, formatReportToMarkdown } from './reports.js';
import { executeTerminalCommand } from './terminal.js';
import { store } from './store.js';
import type { AnalyzedRepository, TimelineEvent, ScanEvent } from './types.js';

export const apiRouter = Router();

// --- Health Check ---
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// --- Ollama Runtime Status & Model Discovery ---
apiRouter.get('/ollama/status', async (_req, res) => {
  try {
    const status = await getOllamaStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      available: false,
      models: [],
      error: error.message || 'Failed to check Ollama status',
    });
  }
});

// --- Repository Path Validation ---
apiRouter.post('/repos/validate', async (req, res) => {
  const { path: repoPath } = req.body;
  if (!repoPath) {
    res.status(400).json({ valid: false, error: 'Path is required.' });
    return;
  }

  const result = await validateAndResolveRepoPath(repoPath);
  if (!result.valid || !result.resolvedPath) {
    res.status(400).json({ valid: false, error: result.error });
    return;
  }

  const repoName = path.basename(result.resolvedPath);
  res.json({
    valid: true,
    resolvedPath: result.resolvedPath,
    name: repoName,
  });
});

// --- Real-time Repository Scanning via Server-Sent Events (SSE) ---
apiRouter.get('/repos/scan-stream', async (req, res) => {
  const rawPath = req.query.path as string;
  if (!rawPath) {
    res.status(400).json({ error: 'Repository path parameter is required.' });
    return;
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event: ScanEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    // Phase 1: Validating
    sendEvent({ phase: 'validating', progress: 10, message: 'Validating Git repository path...' });
    const validation = await validateAndResolveRepoPath(rawPath);
    if (!validation.valid || !validation.resolvedPath) {
      sendEvent({
        phase: 'error',
        progress: 100,
        message: validation.error || 'Invalid repository path.',
      });
      res.end();
      return;
    }

    const resolvedPath = validation.resolvedPath;
    const repoName = path.basename(resolvedPath);

    // Phase 2: Git History Extraction
    sendEvent({ phase: 'history', progress: 25, message: 'Extracting Git commit graph and changes...' });
    const commits = await getCommitHistory(resolvedPath, 200);

    // Phase 3: Branches & Tags
    sendEvent({ phase: 'branches', progress: 40, message: 'Inspecting branches, tags, and remotes...' });
    const branches = await getBranches(resolvedPath);
    const tags = await getTags(resolvedPath);

    // Phase 4: Stashes & Working Tree
    sendEvent({ phase: 'stashes', progress: 55, message: 'Scanning for uncommitted stashes and modifications...' });
    const stashes = await getStashes(resolvedPath);
    const uncommittedChanges = await getUncommittedChanges(resolvedPath);

    // Phase 5: Codebase & TODO Forensics
    sendEvent({ phase: 'todos', progress: 70, message: 'Scanning source files for TODO, FIXME, and HACK items...' });
    const codebase = await scanCodebase(resolvedPath, (count) => {
      sendEvent({
        phase: 'todos',
        progress: Math.min(88, 70 + Math.floor(count / 50)),
        message: `Scanned ${count} source files...`,
      });
    });

    // Phase 6: Synthesis & Inactivity Calculation
    sendEvent({ phase: 'files', progress: 92, message: 'Computing dormancy metrics and historical risks...' });

    let daysInactive = 0;
    let lastCommitDate = new Date().toISOString();
    let lastCommitAuthor = 'Unknown';

    if (commits.length > 0) {
      const latest = commits[0];
      lastCommitDate = latest.date;
      lastCommitAuthor = latest.author;
      const lastMs = new Date(latest.date).getTime();
      const diffMs = Math.max(0, Date.now() - lastMs);
      daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    // Determine primary risk
    let primaryRisk = 'Dormant repository with unverified dependency integrity.';
    const highTodos = codebase.todos.filter((t) => t.priority === 'high');
    if (highTodos.length > 0) {
      primaryRisk = `Unresolved ${highTodos[0].type} at ${highTodos[0].file}:${highTodos[0].line} - "${highTodos[0].text.slice(0, 50)}"`;
    } else if (stashes.length > 0) {
      primaryRisk = `${stashes.length} uncommitted stash(es) left on active branches.`;
    } else if (uncommittedChanges.length > 0) {
      primaryRisk = `${uncommittedChanges.length} modified files left in working tree.`;
    }

    const repoId = crypto.createHash('md5').update(resolvedPath).digest('hex').slice(0, 12);
    const analyzedRepo: AnalyzedRepository = {
      id: repoId,
      name: repoName,
      path: resolvedPath,
      analyzedAt: new Date().toISOString(),
      totalCommits: commits.length,
      totalBranches: branches.length,
      totalStashes: stashes.length,
      totalTags: tags.length,
      primaryLanguage: codebase.primaryLanguage,
      languages: codebase.languages,
      lastCommitDate,
      lastCommitAuthor,
      daysInactive,
      commits,
      branches,
      stashes,
      tags,
      todos: codebase.todos,
      uncommittedChanges,
      readmeContent: codebase.readmeContent,
      packageJson: codebase.packageJson,
      description: codebase.readmeContent ? codebase.readmeContent.split('\n')[0].replace(/^[#\s]+/, '').slice(0, 100) : `${codebase.primaryLanguage} project`,
      primaryRisk,
    };

    // Save in store
    store.addRepo(analyzedRepo);

    sendEvent({
      phase: 'complete',
      progress: 100,
      message: `Forensic analysis complete. Indexed ${commits.length} commits, ${codebase.todos.length} TODOs.`,
      detail: JSON.stringify({ id: repoId, name: repoName }),
    });

    res.end();
  } catch (error: any) {
    sendEvent({
      phase: 'error',
      progress: 100,
      message: `Archaeology scan failed: ${error.message || 'Unknown error'}`,
    });
    res.end();
  }
});

// --- Synchronous Scan Endpoint ---
apiRouter.post('/repos/scan', async (req, res) => {
  const { path: repoPath } = req.body;
  const validation = await validateAndResolveRepoPath(repoPath);

  if (!validation.valid || !validation.resolvedPath) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const resolvedPath = validation.resolvedPath;
  const repoName = path.basename(resolvedPath);

  try {
    const commits = await getCommitHistory(resolvedPath, 100);
    const branches = await getBranches(resolvedPath);
    const tags = await getTags(resolvedPath);
    const stashes = await getStashes(resolvedPath);
    const uncommittedChanges = await getUncommittedChanges(resolvedPath);
    const codebase = await scanCodebase(resolvedPath);

    let daysInactive = 0;
    let lastCommitDate = new Date().toISOString();
    let lastCommitAuthor = 'Unknown';

    if (commits.length > 0) {
      const latest = commits[0];
      lastCommitDate = latest.date;
      lastCommitAuthor = latest.author;
      daysInactive = Math.floor(Math.max(0, Date.now() - new Date(latest.date).getTime()) / (1000 * 60 * 60 * 24));
    }

    const repoId = crypto.createHash('md5').update(resolvedPath).digest('hex').slice(0, 12);
    const analyzedRepo: AnalyzedRepository = {
      id: repoId,
      name: repoName,
      path: resolvedPath,
      analyzedAt: new Date().toISOString(),
      totalCommits: commits.length,
      totalBranches: branches.length,
      totalStashes: stashes.length,
      totalTags: tags.length,
      primaryLanguage: codebase.primaryLanguage,
      languages: codebase.languages,
      lastCommitDate,
      lastCommitAuthor,
      daysInactive,
      commits,
      branches,
      stashes,
      tags,
      todos: codebase.todos,
      uncommittedChanges,
      readmeContent: codebase.readmeContent,
      packageJson: codebase.packageJson,
      description: `${codebase.primaryLanguage} repository`,
      primaryRisk: codebase.todos[0] ? `${codebase.todos[0].type} in ${codebase.todos[0].file}` : 'Dormant repository',
    };

    store.addRepo(analyzedRepo);
    res.json(analyzedRepo);
  } catch (err: any) {
    res.status(500).json({ error: `Scan failed: ${err.message}` });
  }
});

// --- List Repositories ---
apiRouter.get('/repos', (_req, res) => {
  res.json(store.getAllRepos());
});

// --- Get Single Repository ---
apiRouter.get('/repos/:id', (req, res) => {
  const repo = store.getRepo(req.params.id);
  if (!repo) {
    res.status(404).json({ error: 'Repository not found.' });
    return;
  }
  res.json(repo);
});

// --- GhostMemory Timeline Events ---
apiRouter.get('/repos/:id/timeline', (req, res) => {
  const repo = store.getRepo(req.params.id);
  if (!repo) {
    res.status(404).json({ error: 'Repository not found.' });
    return;
  }

  const events: TimelineEvent[] = [];

  // Transform recent commits into timeline events
  for (const c of repo.commits.slice(0, 15)) {
    const isWip = /wip|stash|temp|abandon|break|todo/i.test(c.message);
    events.push({
      id: `commit-${c.hash.slice(0, 8)}`,
      type: 'commit',
      timestamp: c.date,
      relativeTime: new Date(c.date).toLocaleDateString(),
      commitHash: c.shortHash,
      author: c.author,
      message: c.message,
      tags: isWip ? ['wip', 'interrupted'] : ['commit', 'history'],
      isFact: true,
      confidenceScore: 0.99,
    });
  }

  // Transform stashes into timeline events
  for (const s of repo.stashes) {
    events.push({
      id: `stash-${s.index}`,
      type: 'stash',
      timestamp: new Date().toISOString(),
      relativeTime: s.date,
      author: 'Local Developer',
      message: `Uncommitted stash on branch '${s.branch}': ${s.message}`,
      tags: ['stash', 'uncommitted', 'interrupted'],
      isFact: true,
      aiInterpretation: 'Work was abruptly halted here and shelved using git stash without a clean commit.',
      confidenceScore: 0.95,
    });
  }

  // Transform high-priority TODOs into timeline events
  const highTodos = repo.todos.filter((t) => t.priority === 'high').slice(0, 5);
  for (const t of highTodos) {
    events.push({
      id: `todo-${t.file}-${t.line}`,
      type: 'todo',
      timestamp: repo.lastCommitDate,
      relativeTime: `${repo.daysInactive}d ago`,
      author: 'Codebase Author',
      message: `${t.type} flagged in source file`,
      fileReference: t.file,
      lineNumber: t.line,
      todoText: t.text,
      codeSnippet: t.context,
      tags: [t.type.toLowerCase(), 'blocker', 'unresolved'],
      isFact: true,
      aiInterpretation: `Potential blocker preventing project completion: "${t.text}"`,
      confidenceScore: 0.9,
    });
  }

  // Sort events chronologically descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json(events);
});

// --- Commit Diff ---
apiRouter.get('/repos/:id/diff/:hash', async (req, res) => {
  const repo = store.getRepo(req.params.id);
  if (!repo) {
    res.status(404).json({ error: 'Repository not found.' });
    return;
  }

  try {
    const diff = await getCommitDiff(repo.path, req.params.hash);
    res.json({ diff, hash: req.params.hash });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Evidence-Grounded Q&A ---
apiRouter.post('/repos/:id/ask', async (req, res) => {
  const repo = store.getRepo(req.params.id);
  if (!repo) {
    res.status(404).json({ error: 'Repository not found.' });
    return;
  }

  const { question, model } = req.body;
  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Question is required.' });
    return;
  }

  try {
    const answer = await answerQuestionWithEvidence(repo, question, model);
    res.json(answer);
  } catch (err: any) {
    res.status(500).json({ error: `Archaeological inquiry failed: ${err.message}` });
  }
});

// --- Recovery Report ---
apiRouter.get('/repos/:id/report', (req, res) => {
  const repo = store.getRepo(req.params.id);
  if (!repo) {
    res.status(404).json({ error: 'Repository not found.' });
    return;
  }

  const report = generateResurrectionReport(repo);
  res.json(report);
});

// --- Markdown Export of Report ---
apiRouter.get('/repos/:id/report/markdown', (req, res) => {
  const repo = store.getRepo(req.params.id);
  if (!repo) {
    res.status(404).json({ error: 'Repository not found.' });
    return;
  }

  const report = generateResurrectionReport(repo);
  const md = formatReportToMarkdown(report);

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${repo.name}-resurrection-report.md"`);
  res.send(md);
});

// --- Controlled Terminal Command Execution ---
apiRouter.post('/terminal/exec', async (req, res) => {
  const { command, repoId } = req.body;
  if (typeof command !== 'string') {
    res.status(400).json({ error: 'Command string is required.' });
    return;
  }

  try {
    const result = await executeTerminalCommand(command, repoId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      lines: [{ text: `Terminal execution failure: ${err.message}`, type: 'error' }],
    });
  }
});
