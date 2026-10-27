import React, { useState, useEffect } from 'react';
import './OpenSourceAI.css';
import { LOCAL_MODELS as DEFAULT_MODELS } from '../data/mockData';
import { Cpu, ShieldCheck, EyeOff, Radio, Lock, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchOllamaStatus, type OllamaModelInfo } from '../services/api';

export const OpenSourceAI: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.2-3b');
  const [ollamaRunning, setOllamaRunning] = useState<boolean>(false);
  const [installedModels, setInstalledModels] = useState<OllamaModelInfo[]>([]);
  const [ollamaError, setOllamaError] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await fetchOllamaStatus();
      setOllamaRunning(status.available);
      if (status.available) {
        setInstalledModels(status.models);
        setOllamaError('');
        if (status.models.length > 0 && selectedModel === 'llama-3.2-3b') {
          setSelectedModel(status.models[0].name);
        }
      } else {
        setInstalledModels([]);
        setOllamaError(status.error || 'Ollama runtime unreachable on 127.0.0.1:11434.');
      }
    } catch {
      setOllamaRunning(false);
      setOllamaError('Backend API unreachable.');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

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

          {/* Genuine Runtime Status Banner */}
          <div
            className="tech-card"
            style={{
              marginTop: 20,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              borderColor: ollamaRunning ? 'var(--accent)' : 'var(--warning)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {ollamaRunning ? (
                <CheckCircle2 size={18} className="text-accent" />
              ) : (
                <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
              )}
              <div>
                <div className="mono text-xs" style={{ fontWeight: 600 }}>
                  {ollamaRunning
                    ? `RUNTIME STATUS: ACTIVE (Ollama 127.0.0.1:11434 · ${installedModels.length} model(s) discovered)`
                    : 'RUNTIME STATUS: OFFLINE / DISCONNECTED (Ollama 127.0.0.1:11434)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {ollamaRunning
                    ? 'Genuine local neural inference is enabled. Zero network egress.'
                    : (ollamaError || 'Factual Git forensics and AST TODO scans work 100% offline. To enable local AI analysis, start Ollama: `ollama serve`.')}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={checkStatus}
              disabled={isChecking}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={13} className={isChecking ? 'spin-icon' : ''} />
              <span>{isChecking ? 'Checking...' : 'Refresh Status'}</span>
            </button>
          </div>
        </header>

        {/* Models Grid */}
        <div className="models-grid" role="radiogroup" aria-label="Select Local Model">
          {ollamaRunning && installedModels.length > 0
            ? installedModels.map((m) => {
                const isSelected = selectedModel === m.name;
                return (
                  <div
                    key={m.name}
                    className={`model-card tech-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedModel(m.name)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedModel(m.name);
                      }
                    }}
                  >
                    <div className="model-card-top">
                      <div className="model-card-header">
                        <span className="model-provider-badge">Ollama (Installed)</span>
                        <span className="mono text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Radio size={12} className={isSelected ? 'text-accent' : 'text-muted'} />
                          {isSelected ? 'ACTIVE' : 'SELECT'}
                        </span>
                      </div>

                      <h3 className="model-title">{m.name}</h3>

                      <div className="model-specs-grid">
                        <div className="spec-cell">
                          <span className="spec-label">Size</span>
                          <span className="spec-val">{m.sizeFormatted}</span>
                        </div>
                        <div className="spec-cell">
                          <span className="spec-label">Digest</span>
                          <span className="spec-val mono text-xs">{m.digest || 'sha256'}</span>
                        </div>
                        <div className="spec-cell">
                          <span className="spec-label">Parameters</span>
                          <span className="spec-val">{m.parameterSize || 'Standard'}</span>
                        </div>
                        <div className="spec-cell">
                          <span className="spec-label">Quant</span>
                          <span className="spec-val">{m.quantizationLevel || 'Q4_K_M'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="model-recommendation">
                      Verified locally installed model ready for air-gapped forensic Q&amp;A.
                    </div>
                  </div>
                );
              })
            : DEFAULT_MODELS.map((model) => {
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
