// =============================================================================
// PHANTOM Server — Filesystem Access, Path Validation & Subprocess Security
// =============================================================================

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

const execFileAsync = promisify(execFile);

// Disallowed path patterns and sensitive files that must never be exposed or indexed
const SENSITIVE_FILE_PATTERNS = [
  /^\.env(\..+)?$/i,
  /id_rsa/i,
  /id_ed25519/i,
  /\.pem$/i,
  /\.key$/i,
  /\.pfx$/i,
  /\.pkcs12$/i,
  /credentials(\.json)?$/i,
  /secret/i,
  /\.htpasswd$/i,
  /master\.key$/i,
  /\.git-credentials$/i,
];

const EXCLUDED_SCAN_DIRS = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  '.turbo',
  'venv',
  '.venv',
  '__pycache__',
]);

/**
 * Validates and resolves a repository path safely.
 * Ensures the path exists, is a directory, and contains a valid Git repository.
 */
export async function validateAndResolveRepoPath(inputPath: string): Promise<{
  valid: boolean;
  resolvedPath?: string;
  error?: string;
}> {
  if (!inputPath || typeof inputPath !== 'string') {
    return { valid: false, error: 'Repository path must be a non-empty string.' };
  }

  const trimmed = inputPath.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Path cannot be empty.' };
  }

  // Prevent null-byte injection
  if (trimmed.includes('\0')) {
    return { valid: false, error: 'Invalid path containing null bytes.' };
  }

  // Resolve absolute path
  const resolved = path.resolve(trimmed);

  try {
    const stats = await fs.stat(resolved);
    if (!stats.isDirectory()) {
      return { valid: false, error: `Path is not a directory: ${resolved}` };
    }
  } catch (err) {
    return { valid: false, error: `Directory does not exist: ${resolved}` };
  }

  // Check if it is a git work tree or has a .git directory
  const dotGitPath = path.join(resolved, '.git');
  const hasDotGit = existsSync(dotGitPath);

  if (!hasDotGit) {
    // Run git rev-parse to check if it's inside a working tree
    try {
      const { stdout } = await execGit(['rev-parse', '--is-inside-work-tree'], resolved);
      if (stdout.trim() !== 'true') {
        return { valid: false, error: `Not a Git repository (no .git found): ${resolved}` };
      }
    } catch {
      return { valid: false, error: `Not a valid Git repository: ${resolved}` };
    }
  }

  return { valid: true, resolvedPath: resolved };
}

/**
 * Safely executes git commands using an array of arguments to prevent shell injection.
 * Sets PAGER=cat, GIT_TERMINAL_PROMPT=0, and bounds execution time.
 */
export async function execGit(
  args: string[],
  cwd: string,
  timeoutMs: number = 20000
): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync('git', args, {
    cwd,
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024, // 10MB
    env: {
      ...process.env,
      PAGER: 'cat',
      GIT_TERMINAL_PROMPT: '0',
      LC_ALL: 'C',
    },
  });
}

/**
 * Checks whether a given filename or relative path is considered sensitive.
 */
export function isSensitiveFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  return SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(basename));
}

/**
 * Checks whether a directory should be skipped during file scanning.
 */
export function isExcludedDir(dirName: string): boolean {
  return EXCLUDED_SCAN_DIRS.has(dirName);
}

/**
 * Sanitizes untrusted text to prevent prompt injection or markdown corruption.
 */
export function sanitizeEvidenceText(text: string, maxLength: number = 4000): string {
  if (!text) return '';
  // Strip control chars (except standard newlines/tabs)
  let clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength) + '\n... [truncated]';
  }
  return clean;
}
