import React, { useState } from 'react';
import './FinalCTA.css';
import { ArrowRight, Copy, Check, Terminal } from 'lucide-react';

interface FinalCTAProps {
  onLaunchModal: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onLaunchModal }) => {
  const [copied, setCopied] = useState(false);
  const command = 'curl -sSL https://phantom.dev/install.sh | bash';

  const copyCommand = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="final-cta-section" aria-labelledby="cta-heading">
      <div className="container">
        <div className="final-cta-card tech-card tech-card-accent">
          {/* Corner Marks */}
          <div className="tech-corner-tl" />
          <div className="tech-corner-tr" />
          <div className="tech-corner-bl" />
          <div className="tech-corner-br" />

          <div className="section-badge" style={{ justifyContent: 'center' }}>
            <span className="indicator">//</span>
            <span>deploy locally</span>
          </div>

          <h2 id="cta-heading" className="final-cta-headline">
            Ready to recover what you left behind?
          </h2>

          <p className="final-cta-desc">
            Reclaim lost context from abandoned branches, uncommitted stashes, and forgotten ideas. Local-first, private by design, and open source.
          </p>

          <div className="final-cta-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onLaunchModal}
              id="footer-launch-btn"
            >
              <span>Launch PHANTOM</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Quick Install Bar */}
          <div className="install-command-box" role="region" aria-label="Terminal Installation Command">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={14} className="text-muted" />
              <code className="install-cmd-text">{command}</code>
            </div>
            <button
              type="button"
              className="install-copy-btn"
              onClick={copyCommand}
              aria-label="Copy installation command"
            >
              {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
