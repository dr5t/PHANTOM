import React from 'react';
import './Hero.css';
import { ArrowRight, HelpCircle, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

interface HeroProps {
  onExploreArchive: () => void;
  onHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreArchive, onHowItWorks }) => {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="container">
        <div className="hero-content animate-entrance">
          {/* Eyebrow */}
          <div className="hero-eyebrow">
            <span className="status-dot" aria-hidden="true" />
            <span>LOCAL-FIRST AI · DIGITAL ARCHAEOLOGY · OPEN WEIGHTS</span>
          </div>

          {/* Headline */}
          <h1 id="hero-heading" className="hero-headline">
            <span className="hero-headline-line1">Your machine</span>
            <span className="hero-headline-line2">remembers.</span>
            <span className="hero-headline-line3">You just forgot.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="hero-description">
            Recover forgotten code, reconstruct project history, and uncover unfinished work with AI that runs on your machine.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onExploreArchive}
              id="hero-explore-btn"
            >
              <span>Explore the Archive</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={onHowItWorks}
              id="hero-how-it-works-btn"
            >
              <HelpCircle size={18} />
              <span>How it works</span>
            </button>
          </div>

          {/* Technical Confidence Badges */}
          <div className="hero-stats-strip" aria-label="System Guarantees">
            <div className="stat-item">
              <span className="stat-value">
                <ShieldCheck size={16} className="dot-green" />
                <span>100% Local-First</span>
              </span>
              <span className="stat-label">Zero Telemetry · Air-Gapped</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                <HardDrive size={16} className="dot-green" />
                <span>Git Stash & AST Audit</span>
              </span>
              <span className="stat-label">Dangling Blobs & WIPs</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">
                <Cpu size={16} className="dot-green" />
                <span>Open-Weight LLMs</span>
              </span>
              <span className="stat-label">Llama 3.2 · Qwen · DeepSeek</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
