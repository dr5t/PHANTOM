import React, { useState, useEffect } from 'react';
import './LaunchModal.css';
import { REPOSITORIES } from '../data/mockData';
import { X, Terminal, Cpu, Play, CheckCircle2, Send, Sparkles, FolderGit2 } from 'lucide-react';

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResurrectComplete: (repoId: string) => void;
}

export const LaunchModal: React.FC<LaunchModalProps> = ({
  isOpen,
  onClose,
  onResurrectComplete
}) => {
  const [selectedRepo, setSelectedRepo] = useState<string>('nexus-auth-v2');
  const [customPath, setCustomPath] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.2-3b');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Q&A state
  const [qaInput, setQaInput] = useState('');
  const [qaHistory, setQaHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    {
      role: 'ai',
      text: 'Local AI archaeologist initialized. Ask any question regarding git commits, unmerged stashes, or why this codebase was abandoned.'
    }
  ]);

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
    setIsScanning(true);
    setScanProgress(10);
    setIsFinished(false);
    setScanLogs(['[INIT] Connecting to local git rev-list engine...']);

    setTimeout(() => {
      setScanProgress(35);
      setScanLogs((prev) => [
        ...prev,
        '[OK] Discovered 83 commits & 4 branches.',
        '[INFO] Parsing AST for 14 TypeScript files...'
      ]);
    }, 600);

    setTimeout(() => {
      setScanProgress(70);
      setScanLogs((prev) => [
        ...prev,
        '[WARN] Found uncommitted stash@{0} with WebCrypto placeholder.',
        '[INFO] Vectorizing commit diffs for local Llama 3.2 3B context...'
      ]);
    }, 1300);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setIsFinished(true);
      setScanLogs((prev) => [
        ...prev,
        '[SUCCESS] Project archaeological reconstruction complete!',
        '> Ground truth blueprint synthesized in 1.82s.'
      ]);
    }, 2100);
  };

  const handleSendQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim()) return;

    const question = qaInput.trim();
    const newHistory = [...qaHistory, { role: 'user' as const, text: question }];
    setQaHistory(newHistory);
    setQaInput('');

    // Local AI rule-based evidence responses
    setTimeout(() => {
      let answer = '';
      const qLower = question.toLowerCase();
      if (qLower.includes('why') || qLower.includes('abandon')) {
        answer =
          'Evidence indicates the project was halted on March 18, 2024 at 4:45 AM due to a token desynchronization bug during offline mode (see src/auth/provider.ts:142) and an unmerged JWT v5 bump.';
      } else if (qLower.includes('stash') || qLower.includes('secret')) {
        answer =
          'CRITICAL: Stash stash@{0} contains plaintext session tokens saved to localStorage under "__temp_session" as a temporary AES-GCM placeholder. Fix command: "phantom fix --security-sanitize-stash 0".';
      } else if (qLower.includes('next') || qLower.includes('resurrect')) {
        answer =
          'Recommended first step: Branch off the stashed vault work with "git stash branch resurrect/storage-vault stash@{0}", then apply the AST compatibility patch for JWT v5.';
      } else {
        answer = `Analysis of ${selectedRepo}: Discovered 14 unresolved tasks across 4 branches. High confidence match on commit 9f2a71d as the stalling point.`;
      }

      setQaHistory((prev) => [...prev, { role: 'ai', text: answer }]);
    }, 450);
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
              {REPOSITORIES.slice(0, 3).map((repo) => (
                <button
                  key={repo.id}
                  type="button"
                  className={`repo-option-btn ${selectedRepo === repo.id ? 'selected' : ''}`}
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
              placeholder="Or enter custom local path (e.g., ~/Developer/projects/my-repo)..."
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
            <label className="config-label">2. Select On-Device Open-Weight LLM</label>
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
                  <span>Evidence-Backed Repository Q&A (Local Model)</span>
                </label>
                <span className="mono text-xs text-accent">AIR-GAPPED</span>
              </div>

              <div className="qa-conversation" tabIndex={0} aria-label="Conversation with local model">
                {qaHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={item.role === 'user' ? 'qa-message-user' : 'qa-message-ai'}
                  >
                    <strong>{item.role === 'user' ? 'YOU: ' : 'PHANTOM AI: '}</strong>
                    {item.text}
                  </div>
                ))}
              </div>

              <form className="qa-input-bar" onSubmit={handleSendQa}>
                <input
                  type="text"
                  className="qa-input"
                  placeholder="Ask e.g.: 'Why was this project abandoned?' or 'Check stashes for bugs'..."
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  aria-label="Ask questions to local AI"
                />
                <button type="submit" className="btn btn-secondary btn-sm" aria-label="Submit question">
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
                onResurrectComplete(selectedRepo);
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
