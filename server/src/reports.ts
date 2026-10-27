// =============================================================================
// PHANTOM Server — Recovery Report & Forensic Artifact Generator
// =============================================================================

import type { AnalyzedRepository, ResurrectionReport } from './types.js';

/**
 * Constructs a structured ResurrectionReport from repository analysis data.
 */
export function generateResurrectionReport(repo: AnalyzedRepository): ResurrectionReport {
  const latestCommit = repo.commits[0];

  // 1. Overview
  const overview = `Repository "${repo.name}" contains ${repo.totalCommits} commits across ${repo.totalBranches} branches. ` +
    `Primary language is ${repo.primaryLanguage}. ` +
    (latestCommit
      ? `Last recorded activity was on ${new Date(latestCommit.date).toLocaleDateString()} (${repo.daysInactive} days inactive) by ${latestCommit.author}.`
      : `No commit history recorded yet.`);

  // 2. Abandonment Diagnosis
  let abandonmentDiagnosis = `Repository has been dormant for ${repo.daysInactive} days. `;
  if (repo.stashes.length > 0) {
    abandonmentDiagnosis += `Found ${repo.stashes.length} uncommitted git stash(es), indicating abrupt work stoppage. `;
  }
  if (repo.uncommittedChanges.length > 0) {
    abandonmentDiagnosis += `Detected ${repo.uncommittedChanges.length} modified/untracked files left in the working tree. `;
  }
  const highPriorityTodos = repo.todos.filter((t) => t.priority === 'high');
  if (highPriorityTodos.length > 0) {
    abandonmentDiagnosis += `There are ${highPriorityTodos.length} high-priority FIXME/BUG flags that may represent unresolved blockers.`;
  }

  // 3. Historical Milestones
  const milestones: ResurrectionReport['historicalMilestones'] = [];
  // Sample up to 4 significant commits
  const candidateCommits = repo.commits.slice(0, 10).filter((c) =>
    /feat|fix|release|initial|v\d|refactor|merge/i.test(c.message) || c === latestCommit
  );

  for (const c of candidateCommits.slice(0, 4)) {
    milestones.push({
      title: c.message.split('\n')[0].slice(0, 80),
      description: `Committed by ${c.author} on ${new Date(c.date).toLocaleDateString()} (${c.filesChanged} files changed, +${c.insertions}/-${c.deletions}).`,
      evidence: `Commit ${c.shortHash}`,
    });
  }

  // 4. Unfinished Features
  const unfinishedFeatures: ResurrectionReport['unfinishedFeatures'] = [];

  // Stashes as unfinished work
  for (const stash of repo.stashes.slice(0, 2)) {
    unfinishedFeatures.push({
      feature: `Unfinished Work: ${stash.message.replace(/^WIP on\s*/, '') || 'Stashed changes'}`,
      completionPct: 40,
      blocker: `Work stashed on branch '${stash.branch}' and never merged.`,
      files: stash.diff ? stash.diff.split('\n').filter((l) => l.includes('|')).map((l) => l.split('|')[0].trim()).slice(0, 3) : ['Unknown files'],
    });
  }

  // High-priority TODOs as unfinished features
  for (const todo of highPriorityTodos.slice(0, 2)) {
    unfinishedFeatures.push({
      feature: `Pending Fix: ${todo.text.slice(0, 70)}`,
      completionPct: 20,
      blocker: `${todo.type} flagged in ${todo.file}:${todo.line}`,
      files: [todo.file],
    });
  }

  // 5. Potential Issues
  const potentialIssues: ResurrectionReport['potentialIssues'] = [];

  if (repo.daysInactive > 180) {
    potentialIssues.push({
      severity: 'high',
      issue: `Project is severely outdated (${repo.daysInactive} days inactive). Dependencies likely have security vulnerabilities or deprecations.`,
      fixCommand: repo.packageJson ? 'npm audit' : undefined,
    });
  }

  if (repo.uncommittedChanges.length > 0) {
    potentialIssues.push({
      severity: 'medium',
      issue: `Working tree has ${repo.uncommittedChanges.length} uncommitted changes that risk conflict during checkout.`,
      fixCommand: 'git status',
    });
  }

  if (repo.stashes.length > 0) {
    potentialIssues.push({
      severity: 'medium',
      issue: `There are ${repo.stashes.length} dangling stash entries. Inspecting or dropping stale stashes will prevent accidental overwrites.`,
      fixCommand: 'git stash list',
    });
  }

  // 6. Recommended Next Steps
  const recommendedNextSteps: ResurrectionReport['recommendedNextSteps'] = [
    {
      stepNumber: 1,
      title: 'Inspect Repository & Working Tree Status',
      actionCommand: 'git status',
      explanation: 'Verify current branch, uncommitted modifications, and clean working tree state.',
    },
    {
      stepNumber: 2,
      title: 'Verify Dependency Integrity',
      actionCommand: repo.packageJson ? 'npm install' : 'ls -la',
      explanation: 'Ensure all required runtime dependencies and lockfiles are resolved cleanly.',
    },
    {
      stepNumber: 3,
      title: 'Address Critical Forensics Flags',
      actionCommand: highPriorityTodos[0] ? `cat "${highPriorityTodos[0].file}"` : 'git log -n 5 --stat',
      explanation: highPriorityTodos[0]
        ? `Investigate highest priority ${highPriorityTodos[0].type} at ${highPriorityTodos[0].file}:${highPriorityTodos[0].line}.`
        : 'Review the latest 5 commits to establish development context.',
    },
    {
      stepNumber: 4,
      title: 'Review Stashed Forensics',
      actionCommand: repo.stashes.length > 0 ? 'git stash show -p stash@{0}' : 'git branch -v',
      explanation: repo.stashes.length > 0
        ? 'Inspect the topmost stashed diff to recover interrupted in-progress work.'
        : 'Verify all branch states and identify the target development branch.',
    },
  ];

  return {
    repoName: repo.name,
    repoPath: repo.path,
    generatedAt: new Date().toISOString(),
    overview,
    abandonmentDiagnosis,
    historicalMilestones: milestones,
    unfinishedFeatures,
    potentialIssues,
    recommendedNextSteps,
    isAIEnhanced: false,
  };
}

/**
 * Converts a ResurrectionReport into a rich, formatted GitHub-flavored Markdown document.
 */
export function formatReportToMarkdown(report: ResurrectionReport): string {
  const lines: string[] = [];

  lines.push(`# 🪦 PHANTOM Software Resurrection Report`);
  lines.push(``);
  lines.push(`> Generated automatically by **PHANTOM Local Software Archaeology** on ${new Date(report.generatedAt).toUTCString()}`);
  lines.push(``);
  lines.push(`| Property | Value |`);
  lines.push(`| :--- | :--- |`);
  lines.push(`| **Target Repository** | \`${report.repoName}\` |`);
  lines.push(`| **Filesystem Location** | \`${report.repoPath}\` |`);
  lines.push(`| **Archaeology Engine** | PHANTOM v1.0.0 (Local-First Git Forensics) |`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  lines.push(`## 1. Project Overview & Archeological Context`);
  lines.push(``);
  lines.push(report.overview);
  lines.push(``);

  lines.push(`## 2. Abandonment & Dormancy Diagnosis`);
  lines.push(``);
  lines.push(report.abandonmentDiagnosis);
  lines.push(``);

  lines.push(`## 3. Historical Milestones & Recent Commits`);
  lines.push(``);
  if (report.historicalMilestones.length === 0) {
    lines.push(`*No significant milestone commits identified in scanned history.*`);
  } else {
    for (const m of report.historicalMilestones) {
      lines.push(`- **${m.title}**`);
      lines.push(`  - *Evidence:* \`${m.evidence}\``);
      lines.push(`  - ${m.description}`);
    }
  }
  lines.push(``);

  lines.push(`## 4. Unfinished Work & Pending Features`);
  lines.push(``);
  if (report.unfinishedFeatures.length === 0) {
    lines.push(`*No obvious uncompleted feature branches or stashes detected.*`);
  } else {
    for (const uf of report.unfinishedFeatures) {
      lines.push(`### ⚠️ ${uf.feature}`);
      lines.push(`- **Estimated Completion:** ${uf.completionPct}%`);
      lines.push(`- **Identified Blocker:** ${uf.blocker}`);
      lines.push(`- **Relevant Files:** ${uf.files.map((f) => `\`${f}\``).join(', ')}`);
      lines.push(``);
    }
  }

  lines.push(`## 5. Potential Risk Factors & Blockers`);
  lines.push(``);
  if (report.potentialIssues.length === 0) {
    lines.push(`*No critical risks detected.*`);
  } else {
    for (const issue of report.potentialIssues) {
      const badge = issue.severity === 'high' ? '🔴 HIGH' : issue.severity === 'medium' ? '🟡 MEDIUM' : '🟢 LOW';
      lines.push(`- **[${badge}]** ${issue.issue}`);
      if (issue.fixCommand) {
        lines.push(`  \`\`\`bash\n  ${issue.fixCommand}\n  \`\`\``);
      }
    }
  }
  lines.push(``);

  lines.push(`## 6. Recommended Resurrection Protocol`);
  lines.push(``);
  lines.push(`> [!IMPORTANT]`);
  lines.push(`> Review all commands before running. Never execute recovery actions blindly.`);
  lines.push(``);
  for (const step of report.recommendedNextSteps) {
    lines.push(`### Step ${step.stepNumber}: ${step.title}`);
    lines.push(`${step.explanation}`);
    lines.push(``);
    lines.push(`\`\`\`bash`);
    lines.push(`${step.actionCommand}`);
    lines.push(`\`\`\``);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`*Report compiled by PHANTOM. Local Git Forensics without external data egress.*`);

  return lines.join('\n');
}
