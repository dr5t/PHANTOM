import React, { useState } from 'react';
import './ResurrectionMode.css';
import { RESURRECTION_REPORTS } from '../data/mockData';
import { Download, Copy, Check, GitBranch, AlertTriangle, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

interface ResurrectionModeProps {
  selectedRepoId: string;
  onLaunchFullWorkflow: () => void;
}

export const ResurrectionMode: React.FC<ResurrectionModeProps> = ({
  selectedRepoId,
  onLaunchFullWorkflow
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Fallback to nexus-auth-v2 if selectedRepoId doesn't have a report yet
  const report = RESURRECTION_REPORTS[selectedRepoId] || RESURRECTION_REPORTS['nexus-auth-v2'];

  const copyStepCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const copyAllCommands = () => {
    const allCmds = report.recommendedNextSteps.map((s) => s.actionCommand).join('\n');
    navigator.clipboard.writeText(allCmds);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const exportReportMarkdown = () => {
    const mdContent = `# PHANTOM Resurrection Blueprint: ${report.repoName}
Generated on: ${new Date().toISOString()}
Analysis: Local Git Forensics & Open-Weight LLM Synthesis

## Overview
${report.overview}

## Abandonment Diagnosis
${report.abandonmentDiagnosis}

## Important Historical Changes
${report.historicalMilestones.map((m) => `- **${m.title}**: ${m.description} (${m.evidence})`).join('\n')}

## Unfinished Features
${report.unfinishedFeatures.map((f) => `- **${f.feature}** (${f.completionPct}% complete): ${f.blocker}`).join('\n')}

## Critical Potential Issues
${report.potentialIssues.map((i) => `- [${i.severity.toUpperCase()}] ${i.issue} -> Fix: \`${i.fixCommand || 'Manual review'}\``).join('\n')}

## Recommended Next Steps
${report.recommendedNextSteps.map((s) => `${s.stepNumber}. **${s.title}**\n   \`\`\`bash\n   ${s.actionCommand}\n   \`\`\`\n   *${s.explanation}*`).join('\n')}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.repoName}-resurrection.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="resurrection" className="resurrection-section" aria-labelledby="resurrection-heading">
      <div className="container">
        <header className="resurrection-header">
          <div className="section-badge">
            <span className="indicator">//</span>
            <span>recovery workflow</span>
          </div>
          <h2 id="resurrection-heading" className="section-title">
            Turn old code into your next starting point.
          </h2>
          <p className="section-subtitle">
            A comprehensive project recovery report synthesizing ground truth commits, unmerged stashes, and an actionable remediation recipe.
          </p>
        </header>

        {/* Report Preview Panel */}
        <div className="report-preview-panel tech-card tech-card-accent">
          {/* Corner markings */}
          <div className="tech-corner-tl" />
          <div className="tech-corner-tr" />
          <div className="tech-corner-bl" />
          <div className="tech-corner-br" />

          {/* Top Meta & Action Bar */}
          <div className="report-top-meta">
            <div className="report-target-repo">
              <GitBranch size={20} className="text-accent" />
              <div>
                <h3 className="report-repo-title">{report.repoName}</h3>
                <span className="mono text-muted text-xs">
                  ANALYSIS ENGINE: PHANTOM-RECOVERY-V2 · VERIFIED EVIDENCE
                </span>
              </div>
            </div>

            <div className="report-actions-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copyAllCommands}
                title="Copy all shell commands"
              >
                {copiedAll ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                <span>{copiedAll ? 'Commands Copied' : 'Copy Commands'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={exportReportMarkdown}
                title="Download report as markdown"
              >
                <Download size={14} />
                <span>Export (.md)</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onLaunchFullWorkflow}
              >
                <span>Run Interactive Revival</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Diagnosis Banner */}
          <div className="diagnosis-banner">
            <div className="diagnosis-label">
              <AlertTriangle size={13} />
              <span>Core Abandonment Diagnosis</span>
            </div>
            <p className="diagnosis-text">{report.abandonmentDiagnosis}</p>
          </div>

          {/* 2-Column Grid: Milestones & Features */}
          <div className="report-grid">
            {/* Historical Milestones */}
            <div className="report-block">
              <h4 className="block-title">
                <FileText size={15} className="icon" />
                <span>Historical Milestones</span>
              </h4>
              <div className="milestones-list">
                {report.historicalMilestones.map((m, idx) => (
                  <div key={idx} className="milestone-item">
                    <div className="milestone-title">{m.title}</div>
                    <div className="milestone-desc">{m.description}</div>
                    <div className="milestone-evidence">Evidence: {m.evidence}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unfinished Features */}
            <div className="report-block">
              <h4 className="block-title">
                <GitBranch size={15} className="icon" />
                <span>Unfinished Features & Blockers</span>
              </h4>
              <div className="features-list">
                {report.unfinishedFeatures.map((f, idx) => (
                  <div key={idx} className="feature-item">
                    <div className="feature-header">
                      <span className="feature-name">{f.feature}</span>
                      <span className="feature-pct">{f.completionPct}%</span>
                    </div>
                    <div className="feature-bar-bg">
                      <div
                        className="feature-bar-fill"
                        style={{ width: `${f.completionPct}%` }}
                      />
                    </div>
                    <div className="feature-blocker">Blocker: {f.blocker}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Potential Issues */}
          <div className="report-block">
            <h4 className="block-title">
              <AlertTriangle size={15} className="icon" />
              <span>Potential Issues & Vulnerabilities</span>
            </h4>
            <div className="issues-list">
              {report.potentialIssues.map((issue, idx) => (
                <div key={idx} className="issue-item">
                  <span className={`severity-pill severity-${issue.severity}`}>
                    {issue.severity}
                  </span>
                  <div className="issue-content">
                    <div className="issue-text">{issue.issue}</div>
                    {issue.fixCommand && (
                      <div className="issue-cmd">{issue.fixCommand}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Steps Checklist */}
          <div className="report-block">
            <h4 className="block-title">
              <CheckCircle2 size={15} className="icon" />
              <span>Recommended Next Steps</span>
            </h4>
            <div className="steps-checklist">
              {report.recommendedNextSteps.map((step) => (
                <div key={step.stepNumber} className="checklist-step">
                  <div className="checklist-num">{step.stepNumber}</div>
                  <div className="checklist-body">
                    <div className="checklist-title">{step.title}</div>
                    <div className="checklist-cmd-box">
                      <code className="checklist-code">{step.actionCommand}</code>
                      <button
                        type="button"
                        className="checklist-copy-btn"
                        onClick={() => copyStepCommand(step.actionCommand, step.stepNumber)}
                        aria-label={`Copy command for step ${step.stepNumber}`}
                      >
                        {copiedIndex === step.stepNumber ? (
                          <Check size={14} className="text-accent" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                    <div className="checklist-explanation">{step.explanation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
