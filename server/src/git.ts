// =============================================================================
// PHANTOM Server — Real Git Forensics Module
// =============================================================================

import { execGit } from './security.js';
import type { GitCommit, GitBranch, GitStash, GitTag, FileChange } from './types.js';

/**
 * Extracts commit history from the repository.
 * Formats each commit into a structured GitCommit object.
 */
export async function getCommitHistory(
  repoPath: string,
  limit: number = 100
): Promise<GitCommit[]> {
  try {
    // Delimiter for parsing commit metadata
    // Use %x1e (Record Separator) before each commit and %x1f (Unit Separator) between fields
    const format = '%x1e%H%x1f%h%x1f%an%x1f%ae%x1f%aI%x1f%at%x1f%s';
    const { stdout } = await execGit(
      ['log', `-${limit}`, `--format=${format}`, '--shortstat'],
      repoPath
    );

    if (!stdout.trim()) {
      return [];
    }

    const commits: GitCommit[] = [];
    // Split by record separator
    const rawBlocks = stdout.split('\x1e').map((b) => b.trim()).filter(Boolean);

    for (const block of rawBlocks) {
      const lines = block.split('\n');
      if (lines.length === 0 || !lines[0]) continue;

      const metaParts = lines[0].split('\x1f');
      if (metaParts.length < 7) continue;

      const [hash, shortHash, author, authorEmail, date, timestampStr, message] = metaParts;
      const timestamp = parseInt(timestampStr, 10) * 1000;

      let filesChanged = 0;
      let insertions = 0;
      let deletions = 0;

      // Check for shortstat line (subsequent lines)
      const statLine = lines.find((l) => l.includes('changed'));
      if (statLine) {
        const fileMatch = statLine.match(/(\d+)\s+file/);
        const insMatch = statLine.match(/(\d+)\s+insertion/);
        const delMatch = statLine.match(/(\d+)\s+deletion/);

        if (fileMatch) filesChanged = parseInt(fileMatch[1], 10);
        if (insMatch) insertions = parseInt(insMatch[1], 10);
        if (delMatch) deletions = parseInt(delMatch[1], 10);
      }

      commits.push({
        hash,
        shortHash,
        author,
        authorEmail,
        date,
        timestamp: isNaN(timestamp) ? Date.now() : timestamp,
        message,
        filesChanged,
        insertions,
        deletions,
      });
    }

    return commits;
  } catch (error: any) {
    // Handle empty repo (no commits yet)
    if (error?.message?.includes('does not have any commits') || error?.message?.includes('unknown revision')) {
      return [];
    }
    throw error;
  }
}

/**
 * Extracts branches (local and remote).
 */
export async function getBranches(repoPath: string): Promise<GitBranch[]> {
  try {
    const { stdout } = await execGit(
      ['branch', '-a', '--format=%(refname:short)|%(HEAD)|%(objectname:short)|%(committerdate:iso)'],
      repoPath
    );

    if (!stdout.trim()) return [];

    const branches: GitBranch[] = [];
    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length < 4) continue;

      const [name, headMarker, lastCommitHash, lastCommitDate] = parts;
      const isCurrent = headMarker.trim() === '*';
      const isRemote = name.startsWith('origin/') || name.includes('/');

      // Filter out HEAD symref like 'origin/HEAD'
      if (name.includes('HEAD')) continue;

      branches.push({
        name,
        isCurrent,
        isRemote,
        lastCommitHash,
        lastCommitDate,
      });
    }

    return branches;
  } catch {
    return [];
  }
}

/**
 * Extracts stashes from repository.
 */
export async function getStashes(repoPath: string): Promise<GitStash[]> {
  try {
    const { stdout } = await execGit(
      ['stash', 'list', '--format=%gd%x1f%gs%x1f%gd%x1f%cr'],
      repoPath
    );

    if (!stdout.trim()) return [];

    const stashes: GitStash[] = [];
    const lines = stdout.trim().split('\n');

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split('\x1f');
      if (parts.length < 2) continue;

      const stashRef = parts[0] || `stash@{${i}}`;
      const message = parts[1] || '';
      const date = parts[3] || 'Unknown date';

      // Parse branch name if present in message (WIP on branch: ...)
      let branch = 'unknown';
      const branchMatch = message.match(/WIP on ([^:]+):/);
      if (branchMatch) {
        branch = branchMatch[1];
      }

      // Fetch brief diff summary
      let diffSnippet: string | undefined;
      try {
        const { stdout: diffOut } = await execGit(
          ['stash', 'show', '-p', '--stat', stashRef],
          repoPath,
          5000
        );
        diffSnippet = diffOut.slice(0, 1500);
      } catch {
        // Diff optional
      }

      stashes.push({
        index: i,
        message,
        date,
        branch,
        diff: diffSnippet,
      });
    }

    return stashes;
  } catch {
    return [];
  }
}

/**
 * Extracts tags.
 */
export async function getTags(repoPath: string): Promise<GitTag[]> {
  try {
    const { stdout } = await execGit(
      ['tag', '-l', '--format=%(refname:short)%x1f%(objectname:short)%x1f%(creatordate:iso)'],
      repoPath
    );

    if (!stdout.trim()) return [];

    return stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [name, hash, date] = line.split('\x1f');
        return {
          name: name || '',
          hash: hash || '',
          date: date || undefined,
        };
      })
      .filter((t) => t.name.length > 0);
  } catch {
    return [];
  }
}

/**
 * Detects uncommitted changes (working tree & staged).
 */
export async function getUncommittedChanges(repoPath: string): Promise<FileChange[]> {
  try {
    const { stdout } = await execGit(['status', '--porcelain=v1'], repoPath);
    if (!stdout.trim()) return [];

    const changes: FileChange[] = [];
    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      if (line.length < 4) continue;
      const indexStatus = line[0];
      const workStatus = line[1];
      const filePath = line.slice(3).trim();

      let status: FileChange['status'] = 'modified';
      if (indexStatus === 'A' || workStatus === '?' || workStatus === 'A') {
        status = 'added';
      } else if (indexStatus === 'D' || workStatus === 'D') {
        status = 'deleted';
      } else if (indexStatus === 'R') {
        status = 'renamed';
      }

      changes.push({
        path: filePath,
        status,
        additions: 0,
        deletions: 0,
      });
    }

    return changes;
  } catch {
    return [];
  }
}

/**
 * Gets the diff for a specific commit.
 */
export async function getCommitDiff(repoPath: string, hash: string): Promise<string> {
  // Validate hash parameter to prevent flags or commands
  if (!/^[a-f0-9]{4,40}$/i.test(hash)) {
    throw new Error('Invalid commit hash format.');
  }

  try {
    const { stdout } = await execGit(['show', '--stat', '-p', hash], repoPath);
    return stdout.slice(0, 100000); // 100KB limit
  } catch (error: any) {
    throw new Error(`Failed to get commit diff: ${error.message}`);
  }
}
