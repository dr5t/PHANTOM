// =============================================================================
// PHANTOM Server — Comprehensive Forensics & Security Test Suite
// =============================================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execGit, validateAndResolveRepoPath, isSensitiveFile } from '../src/security.js';
import { getCommitHistory, getBranches, getStashes, getUncommittedChanges, getCommitDiff } from '../src/git.js';
import { scanCodebase } from '../src/todos.js';
import { executeTerminalCommand } from '../src/terminal.js';
import { generateResurrectionReport, formatReportToMarkdown } from '../src/reports.js';
import { answerQuestionWithEvidence } from '../src/evidenceAi.js';
import { store } from '../src/store.js';
import type { AnalyzedRepository } from '../src/types.js';

describe('PHANTOM Forensics & Architecture Suite', () => {
  let tempDir: string;

  beforeAll(async () => {
    // Create temporary Git repository for genuine forensics testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'phantom-test-repo-'));

    // Initialize git repository
    await execGit(['init'], tempDir);
    await execGit(['config', 'user.name', 'Forensics Tester'], tempDir);
    await execGit(['config', 'user.email', 'tester@phantom.local'], tempDir);

    // Create a README
    await fs.writeFile(
      path.join(tempDir, 'README.md'),
      '# Test Archaeological Target\nA legacy project abandoned midway through authentication rewrite.\n'
    );

    // Create code files with TODOs and FIXMEs
    const sampleCode = `
// TODO: Connect oauth2 flow properly with provider
function login() {
  console.log("Mock login");
}

// FIXME: Critical race condition in token refresh loop
function refreshToken() {
  // BUG: Null pointer when session expires prematurely
  return null;
}

// HACK: Temporary workaround for database connection leak
const leakFix = true;
`;
    await fs.writeFile(path.join(tempDir, 'auth.ts'), sampleCode);

    // Commit 1: Initial commit
    await execGit(['add', '.'], tempDir);
    await execGit(['commit', '-m', 'feat: initial auth module implementation'], tempDir);

    // Create Commit 2
    await fs.writeFile(
      path.join(tempDir, 'utils.ts'),
      '// NOTE: Consider migrating to native crypto\nexport const hash = "mock-hash";\n'
    );
    await execGit(['add', 'utils.ts'], tempDir);
    await execGit(['commit', '-m', 'refactor: add cryptographic utilities'], tempDir);

    // Create a stash
    await fs.writeFile(path.join(tempDir, 'wip.txt'), 'Unfinished work in progress');
    await execGit(['add', 'wip.txt'], tempDir);
    await execGit(['stash', 'push', '-m', 'WIP on auth: unfinished oauth stash'], tempDir);

    // Create an uncommitted change in working tree
    await fs.writeFile(path.join(tempDir, 'uncommitted.js'), 'console.log("uncommitted modification");');
  });

  afterAll(async () => {
    // Clean up temporary repo
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  });

  describe('1. Repository Validation & Security Boundaries', () => {
    it('validates a genuine git repository correctly', async () => {
      const result = await validateAndResolveRepoPath(tempDir);
      expect(result.valid).toBe(true);
      expect(result.resolvedPath).toBe(tempDir);
    });

    it('rejects non-existent directory paths', async () => {
      const fakePath = path.join(os.tmpdir(), 'phantom-does-not-exist-xyz123');
      const result = await validateAndResolveRepoPath(fakePath);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    it('rejects paths containing null bytes', async () => {
      const result = await validateAndResolveRepoPath('/var/repo\0evil');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('null bytes');
    });

    it('rejects empty paths', async () => {
      const result = await validateAndResolveRepoPath('   ');
      expect(result.valid).toBe(false);
    });

    it('correctly detects sensitive credentials and key files', () => {
      expect(isSensitiveFile('.env')).toBe(true);
      expect(isSensitiveFile('.env.production')).toBe(true);
      expect(isSensitiveFile('id_rsa')).toBe(true);
      expect(isSensitiveFile('server.key')).toBe(true);
      expect(isSensitiveFile('credentials.json')).toBe(true);
      expect(isSensitiveFile('app.ts')).toBe(false);
    });
  });

  describe('2. Git History & Artifact Extraction', () => {
    it('extracts commit history with metadata', async () => {
      const commits = await getCommitHistory(tempDir);
      expect(commits.length).toBe(2);
      expect(commits[0].author).toBe('Forensics Tester');
      expect(commits[0].message).toContain('refactor');
      expect(commits[1].message).toContain('feat');
      expect(commits[0].shortHash.length).toBeGreaterThanOrEqual(4);
    });

    it('extracts branches correctly', async () => {
      const branches = await getBranches(tempDir);
      expect(branches.length).toBeGreaterThan(0);
      const current = branches.find((b) => b.isCurrent);
      expect(current).toBeDefined();
    });

    it('extracts stashes accurately', async () => {
      const stashes = await getStashes(tempDir);
      expect(stashes.length).toBe(1);
      expect(stashes[0].message).toContain('unfinished oauth stash');
    });

    it('detects uncommitted files in working tree', async () => {
      const uncommitted = await getUncommittedChanges(tempDir);
      expect(uncommitted.length).toBeGreaterThan(0);
      expect(uncommitted.some((f) => f.path.includes('uncommitted.js'))).toBe(true);
    });

    it('fetches commit diff content without crashing', async () => {
      const commits = await getCommitHistory(tempDir);
      const diff = await getCommitDiff(tempDir, commits[0].hash);
      expect(diff).toContain('diff --git');
      expect(diff).toContain('utils.ts');
    });

    it('rejects malformed or injected diff hashes', async () => {
      await expect(getCommitDiff(tempDir, '; rm -rf /')).rejects.toThrow('Invalid commit hash');
    });
  });

  describe('3. TODO & Codebase Forensics', () => {
    it('discovers TODO, FIXME, BUG, and HACK items with line numbers and priorities', async () => {
      const result = await scanCodebase(tempDir);
      expect(result.todos.length).toBeGreaterThanOrEqual(4);

      const fixme = result.todos.find((t) => t.type === 'FIXME');
      expect(fixme).toBeDefined();
      expect(fixme?.priority).toBe('high');
      expect(fixme?.file).toBe('auth.ts');
      expect(fixme?.line).toBeGreaterThan(0);

      const todo = result.todos.find((t) => t.type === 'TODO');
      expect(todo).toBeDefined();
      expect(todo?.text).toContain('oauth2');

      const hack = result.todos.find((t) => t.type === 'HACK');
      expect(hack).toBeDefined();
    });

    it('detects primary programming language correctly', async () => {
      const result = await scanCodebase(tempDir);
      expect(result.primaryLanguage).toBe('TypeScript');
    });

    it('reads README content for context', async () => {
      const result = await scanCodebase(tempDir);
      expect(result.readmeContent).toContain('Test Archaeological Target');
    });
  });

  describe('4. Resurrection Report Generation', () => {
    let mockRepo: AnalyzedRepository;

    beforeAll(async () => {
      const commits = await getCommitHistory(tempDir);
      const branches = await getBranches(tempDir);
      const stashes = await getStashes(tempDir);
      const uncommitted = await getUncommittedChanges(tempDir);
      const scanned = await scanCodebase(tempDir);

      mockRepo = {
        id: 'test-repo-123',
        name: 'test-archaeological-target',
        path: tempDir,
        analyzedAt: new Date().toISOString(),
        totalCommits: commits.length,
        totalBranches: branches.length,
        totalStashes: stashes.length,
        totalTags: 0,
        primaryLanguage: scanned.primaryLanguage,
        languages: scanned.languages,
        lastCommitDate: commits[0].date,
        lastCommitAuthor: commits[0].author,
        daysInactive: 120,
        commits,
        branches,
        stashes,
        tags: [],
        todos: scanned.todos,
        uncommittedChanges: uncommitted,
        readmeContent: scanned.readmeContent,
        description: 'Test target for archaeology',
        primaryRisk: 'Dangling stashes and critical fixmes',
      };
      store.addRepo(mockRepo);
    });

    it('generates a structured ResurrectionReport', () => {
      const report = generateResurrectionReport(mockRepo);
      expect(report.repoName).toBe('test-archaeological-target');
      expect(report.overview).toContain('test-archaeological-target');
      expect(report.abandonmentDiagnosis).toContain('uncommitted git stash');
      expect(report.recommendedNextSteps.length).toBeGreaterThan(0);
      expect(report.unfinishedFeatures.length).toBeGreaterThan(0);
    });

    it('formats report into valid GitHub markdown with sections and code blocks', () => {
      const report = generateResurrectionReport(mockRepo);
      const md = formatReportToMarkdown(report);
      expect(md).toContain('# 🪦 PHANTOM Software Resurrection Report');
      expect(md).toContain('## 1. Project Overview');
      expect(md).toContain('## 6. Recommended Resurrection Protocol');
      expect(md).toContain('```bash');
    });
  });

  describe('5. Evidence-Grounded Q&A Engine', () => {
    it('retrieves relevant evidence references for a query', async () => {
      const repo = store.getRepo('test-repo-123')!;
      const result = await answerQuestionWithEvidence(repo, 'why was auth stopped and what token issues exist?');

      expect(result.evidence.length).toBeGreaterThan(0);
      const todoEv = result.evidence.find((e) => e.type === 'todo');
      expect(todoEv).toBeDefined();
      expect(todoEv?.snippet).toContain('token');
      expect(result.answer).toBeDefined();
    });

    it('acknowledges lack of evidence when query is completely unrelated', async () => {
      const repo = store.getRepo('test-repo-123')!;
      const result = await answerQuestionWithEvidence(repo, 'what is the quantum teleportation frequency of Andromeda galaxy?');
      expect(result.answer).toContain('cannot establish');
      expect(result.evidence.length).toBe(0);
    });
  });

  describe('6. Controlled Terminal Command Parser', () => {
    it('executes safe commands like status, history, todos, stashes, help', async () => {
      const statusRes = await executeTerminalCommand('status', 'test-repo-123');
      expect(statusRes.lines.some((l) => l.text.includes('[REPO ARCHAEOLOGY]'))).toBe(true);

      const historyRes = await executeTerminalCommand('history 5', 'test-repo-123');
      expect(historyRes.lines.length).toBeGreaterThan(1);

      const todosRes = await executeTerminalCommand('todos', 'test-repo-123');
      expect(todosRes.lines.some((l) => l.text.includes('FIXME'))).toBe(true);

      const helpRes = await executeTerminalCommand('help');
      expect(helpRes.lines.some((l) => l.text.includes('PHANTOM CONTROLLED FORENSIC TERMINAL'))).toBe(true);
    });

    it('blocks arbitrary shell commands and outputs warning', async () => {
      const injected = await executeTerminalCommand('rm -rf / && echo hacked');
      expect(injected.lines[0].type).toBe('error');
      expect(injected.lines[0].text).toContain('Unknown command');
      expect(injected.lines[1].text).toContain('blocked for security');
    });

    it('handles clear command', async () => {
      const clearRes = await executeTerminalCommand('clear');
      expect(clearRes.clear).toBe(true);
    });
  });
});
