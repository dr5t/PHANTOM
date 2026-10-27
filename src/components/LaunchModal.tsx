import React, { useState, useEffect } from 'react';
import './LaunchModal.css';
import { REPOSITORIES } from '../data/mockData';
import { X, Terminal, Play, CheckCircle2, Send, Sparkles, AlertCircle } from 'lucide-react';
import {
  fetchOllamaStatus,
  streamRepositoryScan,
  askForensicsAI,
  type OllamaModelInfo,
} from '../services/api';

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResurrectComplete: (repoId: string) => void;
}

export const LaunchModal: React.FC<LaunchModalProps> = ({
  isOpen,
  onClose,
  onResurrectComplete,
}) => {
  const [selectedRepo, setSelectedRepo] = useState<string>('nexus-auth-v2');
  const [customPath, setCustomPath] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2');
  const [availableModels, setAvailableModels] = useState<OllamaModelInfo[]>([]);
  const [ollamaRunning, setOllamaRunning] = useState<boolean>(false);
  const [ollamaNotice, setOllamaNotice] = useState<string>('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [scannedRepoId, setScannedRepoId] = useState<string | null>(null);

  // Q&A state
  const [qaInput, setQaInput] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [qaHistory, setQaHistory] = useState<{ role: 'user' | 'ai'; text: string; evidence?: string[] }[]>([
    {
      role: 'ai',
      text: 'Local AI archaeologist initialized. Ask any question regarding git commits, unmerged stashes, or why this codebase was abandoned.',
    },
  ]);

  // Discover local Ollama models on modal open
  useEffect(() => {
    if (!isOpen) return;

    fetchOllamaStatus().then((status) => {
      setOllamaRunning(status.available);
      if (status.available && status.models.length > 0) {
        setAvailableModels(status.models);
        setSelectedModel(status.models[0].name);
        setOllamaNotice('');
      } else {
        setAvailableModels([]);
        setOllamaNotice(status.error || 'Ollama is offline. Start with `ollama serve`.');
      }
    });
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartScan = () => {
    const targetPath = customPath.trim() || '.';
    setIsScanning(true);
    setScanProgress(5);
    setIsFinished(false);
    setScanLogs([`[INIT] Validating repository path: "${targetPath}"...`]);

    const stopStream = streamRepositoryScan(
      targetPath,
      (event) => {
        setScanProgress(event.progress);
        const logPrefix =
          event.phase === 'error'
            ? '[WARN]'
            : event.phase === 'complete'
            ? '[SUCCESS]'
            : event.phase === 'validating'
            ? '[INFO]'
            : '[OK]';

        setScanLogs((prev) => [...prev, `${logPrefix} ${event.message}`]);

        if (event.phase === 'complete' && event.detail) {
          try {
            const parsed = JSON.parse(event.detail);
            setScannedRepoId(parsed.id);
          } catch {}
        }
      },
      (errorMsg) => {
        setIsScanning(false);
        setScanLogs((prev) => [...prev, `[WARN] Scan error: ${errorMsg}`]);
      },
      () => {
        setIsScanning(false);
        setIsFinished(true);
        setScanLogs((prev) => [
          ...prev,
          '> Ground truth blueprint synthesized via local Git forensics.',
        ]);
      }
    );

    return () => stopStream();
  };

  const handleSendQa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim() || isAnswering) return;

    const question = qaInput.trim();
    const newHistory = [...qaHistory, { role: 'user' as const, text: question }];
    setQaHistory(newHistory);
    setQaInput('');
    setIsAnswering(true);

    const repoId = scannedRepoId || 'nexus-auth-v2';

    try {
      const response = await askForensicsAI(repoId, question, selectedModel);
      const evidenceSnippets = response.evidence.map((ev) => `↳ [${ev.type.toUpperCase()}] ${ev.reference}`);

      setQaHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: response.answer,
          evidence: evidenceSnippets,
        },
      ]);
    } catch (err: any) {
      setQaHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Forensic inquiry notice: ${err.message || 'Could not resolve query'}. Ground truth repository evidence is active.`,
        },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <Terminal size={16} className="text-accent" />
            <span id="modal-title">PHANTOM // LOCAL SCANNER RUNTIME</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Target Repo Picker */}
          <div className="config-row">
            <label className="config-label">1. Select Target Git Repository</label>
            <div className="repo-options-grid">
              <button
                type="button"
                className={`repo-option-btn ${customPath === '.' || (!customPath && selectedRepo === 'current') ? 'selected' : ''}`}
                onClick={() => {
                  setCustomPath('.');
                  setSelectedRepo('current');
                }}
              >
                <span className="repo-opt-name">This Workspace (Active)</span>
                <span className="repo-opt-meta">Local Git · Working Tree</span>
              </button>

              {REPOSITORIES.slice(0, 2).map((repo) => (
                <button
                  key={repo.id}
                  type="button"
                  className={`repo-option-btn ${selectedRepo === repo.id && !customPath ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedRepo(repo.id);
                    setCustomPath('');
                  }}
                >
                  <span className="repo-opt-name">{repo.name}</span>
                  <span className="repo-opt-meta">{repo.language} · {repo.lastActivity}</span>
                </button>
              ))}
            </div>

            <input
              type="text"
              className="custom-path-input"
              placeholder="Or enter custom local path (e.g., /path/to/my-repo or .)..."
              value={customPath}
              onChange={(e) => {
                setCustomPath(e.target.value);
                setSelectedRepo('custom');
              }}
              aria-label="Custom repository path"
            />
          </div>

          {/* Local Model Picker */}
          <div className="config-row">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label className="config-label" style={{ margin: 0 }}>2. Select On-Device Open-Weight LLM</label>
              <span className="mono text-xs" style={{ color: ollamaRunning ? 'var(--accent)' : 'var(--warning)' }}>
                {ollamaRunning ? `● OLLAMA CONNECTED (${availableModels.length} models)` : '○ OLLAMA OFFLINE (FALLBACK EVIDENCE MODE)'}
              </span>
            </div>

            {ollamaRunning && availableModels.length > 0 ? (
              <div className="model-select-chips">
                {availableModels.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    className={`model-chip ${selectedModel === m.name ? 'selected' : ''}`}
                    onClick={() => setSelectedModel(m.name)}
                  >
                    {m.name} ({m.sizeFormatted})
                  </button>
                ))}
              </div>
            ) : (
              <div className="model-select-chips">
                <button
                  type="button"
                  className={`model-chip ${selectedModel === 'llama-3.2-3b' ? 'selected' : ''}`}
                  onClick={() => setSelectedModel('llama-3.2-3b')}
                >
                  Llama 3.2 3B (Fast · 2.4 GB)
                </button>
                <button
                  type="button"
                  className={`model-chip ${selectedModel === 'qwen-2.5-coder-7b' ? 'selected' : ''}`}
                  onClick={() => setSelectedModel('qwen-2.5-coder-7b')}
                >
                  Qwen 2.5 Coder 7B (Deep · 5.2 GB)
                </button>
                <button
                  type="button"
                  className={`model-chip ${selectedModel === 'deepseek-coder-6.7b' ? 'selected' : ''}`}
                  onClick={() => setSelectedModel('deepseek-coder-6.7b')}
                >
                  DeepSeek-Coder 6.7B (AST · 4.8 GB)
                </button>
              </div>
            )}

            {!ollamaRunning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <AlertCircle size={12} color="var(--warning)" />
                <span>{ollamaNotice || 'Ollama not detected on port 11434. Factual git forensics and TODO scanning remain 100% active. Run `ollama serve` for neural inference.'}</span>
              </div>
            )}
          </div>

          {/* Action to trigger scan */}
          {!isFinished && (
            <div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleStartScan}
                disabled={isScanning}
              >
                <Play size={16} />
                <span>{isScanning ? 'Running Archaeological Forensics...' : 'Start Local Archaeological Scan'}</span>
              </button>
            </div>
          )}

          {/* Live Progress Bar & Terminal Logs */}
          {(isScanning || isFinished) && (
            <div className="config-row">
              <label className="config-label">3. Live Local Execution Stream</label>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${scanProgress}%` }} />
              </div>

              <div className="live-stream-panel" tabIndex={0} aria-label="Live scan terminal logs">
                {scanLogs.map((log, idx) => (
                  <div key={idx}>
                    {log.startsWith('[OK]') && <span className="text-accent">{log}</span>}
                    {log.startsWith('[WARN]') && <span style={{ color: 'var(--warning)' }}>{log}</span>}
                    {log.startsWith('[INFO]') && <span style={{ color: 'var(--info)' }}>{log}</span>}
                    {log.startsWith('[SUCCESS]') && (
                      <span className="text-accent" style={{ fontWeight: 'bold' }}>
                        {log}
                      </span>
                    )}
                    {!log.startsWith('[') && <span>{log}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Evidence Q&A Box */}
          {isFinished && (
            <div className="qa-chat-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="config-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} className="text-accent" />
                  <span>Evidence-Backed Repository Q&A ({ollamaRunning ? selectedModel : 'Forensic Fact Engine'})</span>
                </label>
                <span className="mono text-xs text-accent">AIR-GAPPED</span>
              </div>

              <div className="qa-conversation" tabIndex={0} aria-label="Conversation with local model">
                {qaHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={item.role === 'user' ? 'qa-message-user' : 'qa-message-ai'}
                  >
                    <strong>{item.role === 'user' ? 'YOU: ' : 'PHANTOM: '}</strong>
                    <div style={{ whiteSpace: 'pre-wrap', marginTop: 2 }}>{item.text}</div>
                    {item.evidence && item.evidence.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--accent)', opacity: 0.85 }}>
                        {item.evidence.map((ev, eIdx) => (
                          <div key={eIdx}>{ev}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isAnswering && (
                  <div className="qa-message-ai">
                    <em>Analyzing git commit diffs and source TODOs...</em>
                  </div>
                )}
              </div>

              <form className="qa-input-bar" onSubmit={handleSendQa}>
                <input
                  type="text"
                  className="qa-input"
                  placeholder="Ask e.g.: 'Why was this project abandoned?' or 'Check stashes for bugs'..."
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  disabled={isAnswering}
                  aria-label="Ask questions to local AI"
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={isAnswering || !qaInput.trim()} aria-label="Submit question">
                  <Send size={13} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="mono text-xs text-muted">
            0 OUTBOUND NETWORK CALLS · LOCAL MEMORY ONLY
          </span>

          {isFinished ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                onResurrectComplete(scannedRepoId || selectedRepo);
                onClose();
              }}
            >
              <CheckCircle2 size={14} />
              <span>Inspect Resurrection Blueprint</span>
            </button>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
