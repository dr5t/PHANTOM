import React, { useState } from 'react';
import './OpenSourceAI.css';
import { LOCAL_MODELS } from '../data/mockData';
import { Cpu, ShieldCheck, Terminal, EyeOff, Radio, Lock } from 'lucide-react';

export const OpenSourceAI: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.2-3b');

  return (
    <section id="open-source-ai" className="open-source-ai-section" aria-labelledby="ai-heading">
      <div className="container">
        <header className="ai-header">
          <div className="section-badge">
            <span className="indicator">//</span>
            <span>intelligence without lock-in</span>
          </div>
          <h2 id="ai-heading" className="section-title">
            Your machine. Your models. Your history.
          </h2>
          <p className="section-subtitle">
            Configure open-weight inference using your local hardware. No proprietary cloud API lock-in, no per-token charges, and zero risk of your intellectual property leaking to third parties.
          </p>
        </header>

        {/* Models Grid */}
        <div className="models-grid" role="radiogroup" aria-label="Select Local Model">
          {LOCAL_MODELS.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <div
                key={model.id}
                className={`model-card tech-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedModel(model.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedModel(model.id);
                  }
                }}
              >
                <div className="model-card-top">
                  <div className="model-card-header">
                    <span className="model-provider-badge">{model.provider}</span>
                    <span className="mono text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Radio size={12} className={isSelected ? 'text-accent' : 'text-muted'} />
                      {isSelected ? 'ACTIVE' : 'SELECT'}
                    </span>
                  </div>

                  <h3 className="model-title">{model.name}</h3>

                  <div className="model-specs-grid">
                    <div className="spec-cell">
                      <span className="spec-label">Parameters</span>
                      <span className="spec-val">{model.parameterSize}</span>
                    </div>
                    <div className="spec-cell">
                      <span className="spec-label">Context</span>
                      <span className="spec-val">{model.contextWindow}</span>
                    </div>
                    <div className="spec-cell">
                      <span className="spec-label">RAM Required</span>
                      <span className="spec-val">{model.ramRequired}</span>
                    </div>
                    <div className="spec-cell">
                      <span className="spec-label">Throughput</span>
                      <span className="spec-val">{model.speed.split(' ')[0]} t/s</span>
                    </div>
                  </div>
                </div>

                <div className="model-recommendation">
                  {model.recommendedFor}
                </div>
              </div>
            );
          })}
        </div>

        {/* Privacy & Architecture Bento */}
        <div className="privacy-bento">
          <div className="bento-card tech-card">
            <ShieldCheck size={20} className="bento-icon" />
            <h4 className="bento-title">Zero Telemetry</h4>
            <p className="bento-desc">
              No analytics tracking, phone-home telemetry, or crash pings. Operates seamlessly behind strict air-gapped corporate proxies.
            </p>
          </div>

          <div className="bento-card tech-card">
            <Lock size={20} className="bento-icon" />
            <h4 className="bento-title">Air-Gapped Processing</h4>
            <p className="bento-desc">
              Git commit parsing, tree-sitter AST extraction, and vector diff similarity calculations occur strictly inside local RAM.
            </p>
          </div>

          <div className="bento-card tech-card">
            <Cpu size={20} className="bento-icon" />
            <h4 className="bento-title">Hardware Acceleration</h4>
            <p className="bento-desc">
              Leverages Apple Metal unified memory, NVIDIA CUDA, or modern AVX-512 CPU SIMD cores for sub-second responses.
            </p>
          </div>

          <div className="bento-card tech-card">
            <EyeOff size={20} className="bento-icon" />
            <h4 className="bento-title">Auditable Prompts</h4>
            <p className="bento-desc">
              Inspect raw system prompts and AST evidence chunks sent to your local LLM runtime via the debug flag (`--trace-prompts`).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
