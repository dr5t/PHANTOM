import React, { useState, useEffect } from 'react';
import './ResurrectionMode.css';
import { RESURRECTION_REPORTS as DEMO_REPORTS } from '../data/mockData';
import { Download, Copy, Check, GitBranch, AlertTriangle, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { fetchResurrectionReport, fetchReportMarkdown } from '../services/api';
import type { ResurrectionReport } from '../types';

interface ResurrectionModeProps {
  selectedRepoId: string;
  onLaunchFullWorkflow: () => void;
}

export const ResurrectionMode: React.FC<ResurrectionModeProps> = ({
  selectedRepoId,
  onLaunchFullWorkflow,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [report, setReport] = useState<ResurrectionReport>(
    DEMO_REPORTS[selectedRepoId] || DEMO_REPORTS['nexus-auth-v2']
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRealReport, setIsRealReport] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadReport = async () => {
      setIsLoading(true);
      try {
        const real = await fetchResurrectionReport(selectedRepoId);
        if (isMounted && real) {
          setReport(real);
          setIsRealReport(true);
        }
      } catch {
        // Fallback to demonstration fixtures
        if (isMounted) {
          const fallback = DEMO_REPORTS[selectedRepoId] || DEMO_REPORTS['nexus-auth-v2'];
          setReport(fallback);
          setIsRealReport(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [selectedRepoId]);

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

  const exportReportMarkdown = async () => {
    try {
      if (isRealReport) {
        const mdText = await fetchReportMarkdown(selectedRepoId);
        const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${report.repoName}-resurrection.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    } catch {}

    // Fallback client markdown generation
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
                <h3 className="report-repo-title">
                  {report.repoName}
                  {!isRealReport && (
                    <span className="mono text-xs" style={{ marginLeft: 8, opacity: 0.6 }}>[DEMO BLUEPRINT]</span>
                  )}
                  {isRealReport && (
                    <span className="mono text-xs text-accent" style={{ marginLeft: 8 }}>[LIVE FORENSICS]</span>
                  )}
                </h3>
                <span className="mono text-muted text-xs">
                  ANALYSIS ENGINE: PHANTOM-RECOVERY-V2 · VERIFIED LOCAL EVIDENCE
                </span>
              </div>
            </div>

            <div className="report-actions-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copyAllCommands}
                title="Copy all bash revival commands to clipboard"
              >
                {copiedAll ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                <span>{copiedAll ? 'Commands Copied' : 'Copy All Commands'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={exportReportMarkdown}
                title="Export complete resurrection blueprint as a Markdown artifact"
              >
                <Download size={14} />
                <span>Export Report (.md)</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Generating real archaeological recovery blueprint...
            </div>
          ) : (
            <>
              {/* Section 1: Overview & Abandonment Diagnosis */}
              <div className="report-section-grid">
                <div className="report-card tech-card">
                  <div className="report-card-label">01 // PROJECT OVERVIEW</div>
                  <p className="report-card-text">{report.overview}</p>
                </div>

                <div className="report-card tech-card">
                  <div className="report-card-label" style={{ color: 'var(--warning)' }}>
                    02 // ABANDONMENT DIAGNOSIS
                  </div>
                  <p className="report-card-text">{report.abandonmentDiagnosis}</p>
                </div>
              </div>

              {/* Section 2: Important Changes & Unfinished Features */}
              <div className="report-two-col">
                {/* Historical Milestones */}
                <div className="report-milestones tech-card">
                  <h4 className="report-subheading">
                    <FileText size={16} className="text-accent" />
                    <span>Recent Critical Milestones</span>
                  </h4>

                  <div className="milestones-list">
                    {report.historicalMilestones.map((m, idx) => (
                      <div key={idx} className="milestone-item">
                        <div className="milestone-title-row">
                          <span className="milestone-title">{m.title}</span>
                          <span className="evidence-pill mono text-xs">{m.evidence}</span>
                        </div>
                        <p className="milestone-desc">{m.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unfinished Features */}
                <div className="report-features tech-card">
                  <h4 className="report-subheading">
                    <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
                    <span>Interrupted &amp; Unfinished Features</span>
                  </h4>

                  <div className="features-list">
                    {report.unfinishedFeatures.map((f, idx) => (
                      <div key={idx} className="feature-item">
                        <div className="feature-header">
                          <span className="feature-name">{f.feature}</span>
                          <span className="feature-pct mono text-xs text-accent">
                            {f.completionPct}% BUILT
                          </span>
                        </div>

                        <div className="feature-progress-track">
                          <div
                            className="feature-progress-fill"
                            style={{ width: `${f.completionPct}%` }}
                          />
                        </div>

                        <div className="feature-blocker">
                          <strong>Blocker:</strong> {f.blocker}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Potential Issues */}
              <div className="report-issues tech-card">
                <h4 className="report-subheading">
                  <AlertTriangle size={16} style={{ color: 'var(--danger, #ff4444)' }} />
                  <span>Identified Risks &amp; Security Traps</span>
                </h4>

                <div className="issues-grid">
                  {report.potentialIssues.map((issue, idx) => (
                    <div key={idx} className="issue-item">
                      <div className="issue-severity-row">
                        <span className={`severity-tag ${issue.severity}`}>
                          {issue.severity.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="issue-text">{issue.issue}</p>
                      {issue.fixCommand && (
                        <div className="issue-fix-row">
                          <code className="issue-code">{issue.fixCommand}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Recommended Next Steps */}
              <div className="report-steps-panel tech-card">
                <div className="steps-header">
                  <div>
                    <h4 className="report-subheading" style={{ marginBottom: 4 }}>
                      <CheckCircle2 size={16} className="text-accent" />
                      <span>Recommended Resurrection Steps</span>
                    </h4>
                    <span className="mono text-xs text-muted">
                      NEVER AUTOMATICALLY EXECUTED · HUMAN VERIFIED COMMANDS ONLY
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onLaunchFullWorkflow}
                  >
                    <span>Launch Scanner</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="steps-timeline">
                  {report.recommendedNextSteps.map((step, idx) => (
                    <div key={step.stepNumber} className="step-row">
                      <div className="step-number-badge mono">{step.stepNumber}</div>

                      <div className="step-content">
                        <div className="step-title-row">
                          <h5 className="step-title">{step.title}</h5>
                        </div>

                        <p className="step-explanation">{step.explanation}</p>

                        <div className="step-command-box">
                          <span className="mono text-xs text-muted">$</span>
                          <code className="step-cmd-text mono">{step.actionCommand}</code>
                          <button
                            type="button"
                            className="step-copy-btn"
                            onClick={() => copyStepCommand(step.actionCommand, idx)}
                            title="Copy command"
                            aria-label={`Copy step ${step.stepNumber} command`}
                          >
                            {copiedIndex === idx ? (
                              <Check size={13} className="text-accent" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
