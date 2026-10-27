// =============================================================================
// PHANTOM Server — Controlled Terminal Command Parser & Dispatcher
// =============================================================================

import { store } from './store.js';
import { getOllamaStatus } from './ollama.js';
import { answerQuestionWithEvidence } from './evidenceAi.js';
import { generateResurrectionReport, formatReportToMarkdown } from './reports.js';
import { getCommitDiff } from './git.js';
import type { TerminalResponse } from './types.js';

/**
 * Executes a controlled terminal command safely without an unrestricted shell.
 */
export async function executeTerminalCommand(
  rawInput: string,
  currentRepoId?: string
): Promise<TerminalResponse> {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { lines: [] };
  }

  // Tokenize arguments safely
  const tokens = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  const cleanTokens = tokens.map((t) => t.replace(/^"|"$/g, ''));
  const cmd = (cleanTokens[0] || '').toLowerCase();
  const args = cleanTokens.slice(1);

  if (cmd === 'clear') {
    return { lines: [], clear: true };
  }

  if (cmd === 'help' || cmd === '?') {
    return {
      lines: [
        { text: '┌── PHANTOM CONTROLLED FORENSIC TERMINAL ───────────────────────┐', type: 'info' },
        { text: '│ Available safe commands (arbitrary shell execution disabled):  │', type: 'comment' },
        { text: '│  status             Display current repository forensic status  │', type: 'plain' },
        { text: '│  history [limit]    List recent commits with evidence hashes    │', type: 'plain' },
        { text: '│  todos [filter]     Display pending TODOs, FIXMEs, and HACKs    │', type: 'plain' },
        { text: '│  stashes            Inspect uncommitted git stashes             │', type: 'plain' },
        { text: '│  branches           List branches and head status               │', type: 'plain' },
        { text: '│  diff <hash>        Inspect safe commit diff                    │', type: 'plain' },
        { text: '│  models             Check local Ollama runtime and models       │', type: 'plain' },
        { text: '│  ask <question>     Ask evidence-grounded AI about this repo    │', type: 'plain' },
        { text: '│  report             Generate archaeological resurrection report │', type: 'plain' },
        { text: '│  clear              Clear terminal buffer                       │', type: 'plain' },
        { text: '│  help               Show this manual                            │', type: 'plain' },
        { text: '└───────────────────────────────────────────────────────────────┘', type: 'info' },
      ],
    };
  }

  if (cmd === 'models') {
    const status = await getOllamaStatus();
    if (!status.available) {
      return {
        lines: [
          { text: '✖ Ollama is not running locally (127.0.0.1:11434).', type: 'warn' },
          { text: `Detail: ${status.error || 'Connection refused'}`, type: 'comment' },
          { text: 'Run `ollama serve` and `ollama pull llama3.2` to enable local AI.', type: 'info' },
        ],
      };
    }

    if (status.models.length === 0) {
      return {
        lines: [
          { text: '✔ Ollama is running, but no models are installed.', type: 'warn' },
          { text: 'Run `ollama pull llama3.2` to download a model.', type: 'info' },
        ],
      };
    }

    const lines: TerminalResponse['lines'] = [
      { text: `✔ Ollama active. Found ${status.models.length} local model(s):`, type: 'ok' },
    ];
    for (const m of status.models) {
      lines.push({
        text: `  • ${m.name} (${m.sizeFormatted})${m.parameterSize ? ` [${m.parameterSize}]` : ''}`,
        type: 'evidence',
      });
    }
    return { lines };
  }

  // Commands below require an active repository
  const repo = currentRepoId ? store.getRepo(currentRepoId) : store.getAllRepos()[0];
  if (!repo) {
    return {
      lines: [
        { text: '✖ No repository currently selected or scanned.', type: 'error' },
        { text: 'Please scan a repository first via the UI or select one.', type: 'comment' },
      ],
    };
  }

  if (cmd === 'status') {
    return {
      lines: [
        { text: `[REPO ARCHAEOLOGY] ${repo.name}`, type: 'ok' },
        { text: `Path: ${repo.path}`, type: 'comment' },
        { text: `Total Commits: ${repo.totalCommits} | Branches: ${repo.totalBranches} | Stashes: ${repo.totalStashes}`, type: 'plain' },
        { text: `Primary Language: ${repo.primaryLanguage}`, type: 'plain' },
        { text: `Dormancy: ${repo.daysInactive} days inactive (Last commit: ${repo.lastCommitDate.slice(0, 10)} by ${repo.lastCommitAuthor})`, type: 'warn' },
        { text: `Pending TODOs: ${repo.todos.length} detected`, type: repo.todos.length > 0 ? 'todo' : 'plain' },
        { text: `Uncommitted Changes: ${repo.uncommittedChanges.length} files modified`, type: repo.uncommittedChanges.length > 0 ? 'diff-add' : 'plain' },
      ],
    };
  }

  if (cmd === 'history') {
    const limit = parseInt(args[0] || '10', 10) || 10;
    const commits = repo.commits.slice(0, limit);
    if (commits.length === 0) {
      return { lines: [{ text: 'No commits found in repository history.', type: 'comment' }] };
    }

    const lines: TerminalResponse['lines'] = [
      { text: `Displaying latest ${commits.length} commits:`, type: 'info' },
    ];
    for (const c of commits) {
      lines.push({
        text: `${c.shortHash} [${new Date(c.date).toISOString().slice(0, 10)}] ${c.author.slice(0, 15)}: ${c.message}`,
        type: 'plain',
      });
    }
    return { lines };
  }

  if (cmd === 'todos') {
    const filter = (args[0] || '').toLowerCase();
    const filtered = filter
      ? repo.todos.filter((t) => t.text.toLowerCase().includes(filter) || t.file.toLowerCase().includes(filter) || t.type.toLowerCase() === filter)
      : repo.todos;

    if (filtered.length === 0) {
      return { lines: [{ text: `No TODOs found matching "${filter}".`, type: 'comment' }] };
    }

    const lines: TerminalResponse['lines'] = [
      { text: `Found ${filtered.length} pending TODO items:`, type: 'info' },
    ];
    for (const t of filtered.slice(0, 20)) {
      lines.push({
        text: `[${t.type}] ${t.file}:${t.line} - ${t.text}`,
        type: t.priority === 'high' ? 'warn' : 'todo',
      });
    }
    if (filtered.length > 20) {
      lines.push({ text: `... and ${filtered.length - 20} more. Use filter to narrow results.`, type: 'comment' });
    }
    return { lines };
  }

  if (cmd === 'stashes') {
    if (repo.stashes.length === 0) {
      return { lines: [{ text: '✔ No uncommitted git stashes found.', type: 'ok' }] };
    }

    const lines: TerminalResponse['lines'] = [
      { text: `Found ${repo.stashes.length} stash entries:`, type: 'warn' },
    ];
    for (const s of repo.stashes) {
      lines.push({
        text: `stash@{${s.index}} [${s.branch}]: ${s.message}`,
        type: 'evidence',
      });
    }
    return { lines };
  }

  if (cmd === 'branches') {
    const lines: TerminalResponse['lines'] = [
      { text: `Branches (${repo.branches.length} total):`, type: 'info' },
    ];
    for (const b of repo.branches) {
      lines.push({
        text: `${b.isCurrent ? '* ' : '  '}${b.name} (${b.lastCommitHash.slice(0, 7)})`,
        type: b.isCurrent ? 'ok' : 'plain',
      });
    }
    return { lines };
  }

  if (cmd === 'diff') {
    const hash = args[0];
    if (!hash) {
      return { lines: [{ text: 'Usage: diff <commit-hash>', type: 'error' }] };
    }

    try {
      const diffContent = await getCommitDiff(repo.path, hash);
      const diffLines = diffContent.split('\n').slice(0, 30);
      const lines: TerminalResponse['lines'] = [
        { text: `Diff preview for ${hash}:`, type: 'info' },
      ];
      for (const dl of diffLines) {
        if (dl.startsWith('+')) lines.push({ text: dl, type: 'diff-add' });
        else if (dl.startsWith('-')) lines.push({ text: dl, type: 'diff-remove' });
        else lines.push({ text: dl, type: 'plain' });
      }
      return { lines };
    } catch (err: any) {
      return { lines: [{ text: `Error fetching diff: ${err.message}`, type: 'error' }] };
    }
  }

  if (cmd === 'ask') {
    const question = args.join(' ');
    if (!question) {
      return { lines: [{ text: 'Usage: ask <forensic question about codebase>', type: 'error' }] };
    }

    const result = await answerQuestionWithEvidence(repo, question);
    const lines: TerminalResponse['lines'] = [
      { text: `Forensic analysis (${result.isAIGenerated ? `Model: ${result.model}` : 'Evidence Engine'}):`, type: 'info' },
      { text: result.answer, type: 'plain' },
    ];

    if (result.evidence.length > 0) {
      lines.push({ text: 'Evidence sources cited:', type: 'comment' });
      for (const ev of result.evidence.slice(0, 3)) {
        lines.push({ text: `  ↳ [${ev.type.toUpperCase()}] ${ev.reference}`, type: 'evidence' });
      }
    }

    return { lines };
  }

  if (cmd === 'report') {
    const report = generateResurrectionReport(repo);
    const md = formatReportToMarkdown(report);
    return {
      lines: [
        { text: `✔ Resurrection report generated for ${repo.name}:`, type: 'ok' },
        { text: report.overview, type: 'plain' },
        { text: `Diagnosis: ${report.abandonmentDiagnosis}`, type: 'warn' },
        { text: 'Recommended next command:', type: 'comment' },
        { text: `  $ ${report.recommendedNextSteps[0]?.actionCommand || 'git status'}`, type: 'command' },
        { text: `Full markdown report (${md.length} bytes) ready for export in UI.`, type: 'info' },
      ],
    };
  }

  return {
    lines: [
      { text: `Unknown command: "${cmd}". Type "help" for a list of valid commands.`, type: 'error' },
      { text: 'Arbitrary shell commands are blocked for security.', type: 'comment' },
    ],
  };
}
