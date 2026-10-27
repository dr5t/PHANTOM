import React from 'react';
import './HowItWorks.css';
import { Search, BrainCircuit, PlayCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01 — SCAN',
      title: 'Inspect a user-selected Git repository and extract relevant artifacts.',
      description:
        'PHANTOM crawls commit logs, dangling stashes, unmerged branches, and source files. It isolates uncommitted diffs and surfaces forgotten TODO and FIXME annotations.',
      icon: <Search size={22} />,
      tags: ['git log', 'stash inspector', 'source scanner', 'local-first']
    },
    {
      number: '02 — INVESTIGATE',
      title: 'Use local retrieval and an open-weight model to analyze the available evidence.',
      description:
        'Diff fragments and commit messages are analyzed with evidence grounding. An on-device open-weight model pieces together why the project stalled and reconstructs the author’s intent.',
      icon: <BrainCircuit size={22} />,
      tags: ['local evidence', 'Ollama integration', 'intent mapping', 'local inference']
    },
    {
      number: '03 — RESURRECT',
      title: 'Generate a structured project recovery report with actionable next steps.',
      description:
        'Receive a prioritized action plan: isolated stash branches, automated dependency migration patches, and executable next-step commands to bring dead code back to life.',
      icon: <PlayCircle size={22} />,
      tags: ['executable patches', 'markdown blueprint', 'safe cherry-pick', 'CLI recipes']
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section" aria-labelledby="how-heading">
      <div className="container">
        <header className="how-header">
          <div className="section-badge">
            <span className="indicator">//</span>
            <span>how it works</span>
          </div>
          <h2 id="how-heading" className="section-title">
            From forgotten files to recovered context.
          </h2>
          <p className="section-subtitle">
            A three-stage digital archaeology pipeline that extracts ground truth from your local Git tree without uploading a single byte to external clouds.
          </p>
        </header>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <article key={index} className="step-card tech-card">
              <div className="step-card-top">
                <div className="step-index-row">
                  <span className="step-number">{step.number}</span>
                  <div className="step-icon-wrapper" aria-hidden="true">
                    {step.icon}
                  </div>
                </div>

                <h3 className="step-heading">{step.title}</h3>
                <p className="step-body">{step.description}</p>
              </div>

              <div className="step-card-bottom">
                <div className="step-tech-tags" aria-label="Step technology tags">
                  {step.tags.map((tag, tIndex) => (
                    <span key={tIndex} className="tech-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
