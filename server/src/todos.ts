// =============================================================================
// PHANTOM Server — TODO & Source Code Forensics Scanner
// =============================================================================

import fs from 'node:fs/promises';
import path from 'node:path';
import { isSensitiveFile, isExcludedDir } from './security.js';
import type { TodoItem } from './types.js';

// Recognized code extensions and their languages
const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.py': 'Python',
  '.rs': 'Rust',
  '.go': 'Go',
  '.java': 'Java',
  '.c': 'C',
  '.cpp': 'C++',
  '.h': 'C/C++ Header',
  '.hpp': 'C/C++ Header',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.scala': 'Scala',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.zsh': 'Shell',
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.md': 'Markdown',
};

// Regex to capture TODO, FIXME, HACK, XXX, BUG, NOTE
const TODO_REGEX = /(?:\/\/|#|\/\*|<!--|;)\s*(TODO|FIXME|HACK|XXX|BUG|NOTE)(?:\s*\(.*?\))?:\s*(.+)$/i;

/**
 * Recursively scans repository directory for code files, TODOs, and language stats.
 * Maximum scanned files capped to prevent OOM on huge repositories.
 */
export async function scanCodebase(
  repoPath: string,
  onProgress?: (scannedFiles: number) => void
): Promise<{
  todos: TodoItem[];
  languages: Record<string, number>;
  primaryLanguage: string;
  readmeContent?: string;
  packageJson?: Record<string, unknown>;
}> {
  const todos: TodoItem[] = [];
  const languageBytes: Record<string, number> = {};
  let scannedFiles = 0;
  const maxFiles = 2500;

  let readmeContent: string | undefined;
  let packageJson: Record<string, unknown> | undefined;

  async function walkDir(currentDir: string, depth: number = 0) {
    if (depth > 12 || scannedFiles >= maxFiles) return;

    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (scannedFiles >= maxFiles) break;

      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(repoPath, fullPath);

      if (entry.isDirectory()) {
        if (!isExcludedDir(entry.name)) {
          await walkDir(fullPath, depth + 1);
        }
      } else if (entry.isFile()) {
        if (isSensitiveFile(entry.name)) {
          continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        const baseLower = entry.name.toLowerCase();

        // Check for README
        if (!readmeContent && (baseLower === 'readme.md' || baseLower === 'readme.txt' || baseLower === 'readme')) {
          try {
            const raw = await fs.readFile(fullPath, 'utf-8');
            readmeContent = raw.slice(0, 15000); // 15KB max
          } catch {}
        }

        // Check for package.json in root
        if (!packageJson && depth === 0 && entry.name === 'package.json') {
          try {
            const raw = await fs.readFile(fullPath, 'utf-8');
            packageJson = JSON.parse(raw);
          } catch {}
        }

        // Track language stats
        const lang = EXTENSION_LANGUAGE_MAP[ext];
        if (lang) {
          try {
            const stat = await fs.stat(fullPath);
            languageBytes[lang] = (languageBytes[lang] || 0) + stat.size;
          } catch {}
        }

        // Only search code/text files for TODOs
        if (lang || ext === '.txt' || ext === '.md' || ext === '') {
          try {
            const stat = await fs.stat(fullPath);
            // Skip files > 500KB to avoid heavy regex parsing on huge files
            if (stat.size <= 500 * 1024) {
              const fileContent = await fs.readFile(fullPath, 'utf-8');
              extractTodosFromFile(fileContent, relativePath, todos);
            }
          } catch {}
        }

        scannedFiles++;
        if (scannedFiles % 50 === 0 && onProgress) {
          onProgress(scannedFiles);
        }
      }
    }
  }

  await walkDir(repoPath);

  // Compute primary language
  let primaryLanguage = 'Unknown';
  let maxBytes = 0;
  for (const [lang, bytes] of Object.entries(languageBytes)) {
    if (bytes > maxBytes) {
      maxBytes = bytes;
      primaryLanguage = lang;
    }
  }

  // Sort TODOs by priority: high first, then medium, then low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    todos: todos.slice(0, 300), // Cap at 300 TODOs
    languages: languageBytes,
    primaryLanguage,
    readmeContent,
    packageJson,
  };
}

/**
 * Extracts TODOs from a single file's text content.
 */
function extractTodosFromFile(content: string, relativePath: string, outTodos: TodoItem[]) {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(TODO_REGEX);

    if (match) {
      const rawType = match[1].toUpperCase() as TodoItem['type'];
      const text = match[2].trim().replace(/\*\/$/, '').trim();

      if (!text) continue;

      let priority: TodoItem['priority'] = 'medium';
      if (rawType === 'FIXME' || rawType === 'BUG' || /critical|urgent|security|broken|fatal/i.test(text)) {
        priority = 'high';
      } else if (rawType === 'NOTE') {
        priority = 'low';
      }

      // Grab surrounding context (1 line before, 1 line after)
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
      const context = [prevLine, line.trim(), nextLine].filter(Boolean).join('\n');

      outTodos.push({
        type: rawType,
        text,
        file: relativePath,
        line: i + 1,
        context,
        priority,
      });
    }
  }
}
