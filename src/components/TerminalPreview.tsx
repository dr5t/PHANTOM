import React, { useState } from 'react';
import './TerminalPreview.css';
import { Copy, Check, Terminal as TerminalIcon, Sparkles, FileSearch } from 'lucide-react';
import { executeTerminalCommand } from '../services/api';

interface TerminalLine {
  text: string;
  type: 'ok' | 'info' | 'warn' | 'error' | 'evidence' | 'command' | 'plain' | 'comment' | 'success' | 'todo' | 'diff-add' | 'diff-remove';
}

export const TerminalPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'interactive' | 'evidence'>('scan');
  const [copied, setCopied] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: '# PHANTOM Controlled Forensic Terminal — Connected to Local Engine', type: 'comment' },
    { text: '# Type a command or click a quick action below.', type: 'comment' },
    { text: '# Safe commands: status, history, todos, stashes, diff, ask, report, help', type: 'info' },
  ]);

  const copyTerminalOutput = () => {
    const rawText = `$ phantom scan ./nexus-auth-v2
[OK] Repository discovered: git://local/nexus-auth-v2
[OK] 83 commits indexed across 4 branches
[OK] AST parser identified 14 source files (TypeScript)
[INFO] 12 unresolved tasks detected in git comments & stashes
[INFO] Reconstructing project history...
[EVIDENCE] Last active: 214 days ago by @shauryatiwari
[EVIDENCE] Staged diff contains uncommitted OAuth2 refresh token fix
> Memory reconstruction ready.`;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed || isExecuting) return;

    // Echo command
    setLines((prev) => [...prev, { text: `$ ${trimmed}`, type: 'command' }]);
    setInputVal('');

    if (trimmed === 'clear') {
      setLines([]);
      return;
    }

    setIsExecuting(true);
    try {
      // Execute via controlled backend command parser
      const res = await executeTerminalCommand(trimmed);
      if (res.clear) {
        setLines([]);
      } else if (res.lines && res.lines.length > 0) {
        setLines((prev) => [...prev, ...res.lines]);
      }
    } catch {
      // Local fallback parsing if backend isn't reached yet
      setLines((prev) => [
        ...prev,
        { text: `[INFO] Executing in offline fallback mode...`, type: 'info' },
        { text: `To enable live git forensics, ensure phantom server is running on :3001.`, type: 'warn' },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section id="terminal-preview" className="terminal-section" aria-label="Terminal Preview Demonstration">
      <div className="container terminal-container">
        <div className="terminal-glow-wrapper tech-card tech-card-accent">
          {/* Corner Tech Marks */}
          <div className="tech-corner-tl" />
          <div className="tech-corner-tr" />
          <div className="tech-corner-bl" />
          <div className="tech-corner-br" />

          {/* Title Bar */}
          <div className="terminal-titlebar">
            <div className="terminal-window-controls">
              <span className="terminal-dot terminal-dot-close" />
              <span className="terminal-dot terminal-dot-min" />
              <span className="terminal-dot terminal-dot-max" />
              <span className="terminal-title" style={{ marginLeft: 8 }}>
                phantom://<span className="domain">repository-forensics-terminal</span>
              </span>
            </div>

            <div className="terminal-meta-actions">
              <span className="terminal-badge-demo" title="Controlled terminal command parser executing only safe forensic routines">
                SAFE CONTROLLED RUNTIME · NO SHELL INJECTION
              </span>
              <button
                type="button"
                className="terminal-copy-btn"
                onClick={copyTerminalOutput}
                aria-label="Copy terminal output"
              >
                {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="terminal-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'scan'}
              className={`terminal-tab ${activeTab === 'scan' ? 'active' : ''}`}
              onClick={() => setActiveTab('scan')}
            >
              <TerminalIcon size={13} />
              <span>Demonstration Output</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'interactive'}
              className={`terminal-tab ${activeTab === 'interactive' ? 'active' : ''}`}
              onClick={() => setActiveTab('interactive')}
            >
              <Sparkles size={13} />
              <span>Live Controlled CLI</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'evidence'}
              className={`terminal-tab ${activeTab === 'evidence' ? 'active' : ''}`}
              onClick={() => setActiveTab('evidence')}
            >
              <FileSearch size={13} />
              <span>AST Evidence</span>
            </button>
          </div>

          {/* Quick Action Command Pills */}
          <div className="terminal-quick-actions" aria-label="Terminal Quick Commands">
            <span className="quick-action-label">EXECUTE PRESET:</span>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('status');
              }}
            >
              $ status
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('history 5');
              }}
            >
              $ history
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('todos');
              }}
            >
              $ todos
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('stashes');
              }}
            >
              $ stashes
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('report');
              }}
            >
              $ report
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('help');
              }}
            >
              $ help
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('clear');
              }}
            >
              clear
            </button>
          </div>

          {/* Tab Content 1: Main Demonstration */}
          {activeTab === 'scan' && (
            <div className="terminal-body" tabIndex={0} aria-label="Demonstration scan output log">
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command">phantom scan ./my-project</span>
              </div>
              <div className="terminal-line" style={{ marginTop: 8 }}>
                <span className="terminal-log-ok">[OK]</span> Repository discovered
              </div>
              <div className="terminal-line">
                <span className="terminal-log-ok">[OK]</span> 83 commits indexed
              </div>
              <div className="terminal-line">
                <span className="terminal-log-info">[INFO]</span> 12 unresolved tasks detected
              </div>
              <div className="terminal-line">
                <span className="terminal-log-info">[INFO]</span> Reconstructing project history...
              </div>

              <div className="terminal-line" style={{ marginTop: 8 }}>
                <span className="terminal-log-evidence">[EVIDENCE]</span>{' '}
                <span className="terminal-highlight">git://local/nexus-auth-v2</span> · 4 diverged branches
              </div>
              <div className="terminal-line">
                <span className="terminal-log-evidence">[EVIDENCE]</span> Commit{' '}
                <span className="terminal-highlight">9f2a71d</span>: &quot;wip: handle token rotation edge case&quot;
              </div>
              <div className="terminal-line">
                <span className="terminal-log-warn">[WARN]</span> Uncommitted stash@{'{0}'} has 14 staged AST modifications
              </div>
              <div className="terminal-line terminal-comment">
                # Local open-weight LLM (Llama 3.2 3B) analyzed git diffs with 0 bytes sent over network
              </div>

              <div className="terminal-success-banner">
                <span className="terminal-log-ok">&gt;</span>
                <span>
                  <strong>Memory reconstruction ready.</strong> Project blueprint generated in 1.42s.
                </span>
                <span className="terminal-cursor" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Tab Content 2: Interactive CLI */}
          {activeTab === 'interactive' && (
            <div className="terminal-body" tabIndex={0} aria-label="Interactive CLI console">
              {lines.map((l, idx) => {
                const isCmd = l.type === 'command';
                const isComment = l.type === 'comment';
                const isOk = l.type === 'ok' || l.type === 'success';
                const isWarn = l.type === 'warn';
                const isInfo = l.type === 'info';
                const isError = l.type === 'error';
                const isTodo = l.type === 'todo';
                const isDiffAdd = l.type === 'diff-add';
                const isDiffRemove = l.type === 'diff-remove';
                const isEvidence = l.type === 'evidence';

                return (
                  <div key={idx} className="terminal-line">
                    {isCmd && (
                      <>
                        <span className="terminal-prompt">$</span>
                        <span className="terminal-command">{l.text.replace(/^\$\s*/, '')}</span>
                      </>
                    )}
                    {isComment && <span className="terminal-comment">{l.text}</span>}
                    {isOk && (
                      <>
                        <span className="terminal-log-ok">[OK]</span>
                        <span> {l.text.replace(/^\[?OK\]?\s*/i, '')}</span>
                      </>
                    )}
                    {isWarn && (
                      <>
                        <span className="terminal-log-warn">[WARN]</span>
                        <span> {l.text.replace(/^\[?WARN\]?\s*/i, '')}</span>
                      </>
                    )}
                    {isInfo && (
                      <>
                        <span className="terminal-log-info">[INFO]</span>
                        <span> {l.text.replace(/^\[?INFO\]?\s*/i, '')}</span>
                      </>
                    )}
                    {isError && (
                      <>
                        <span style={{ color: 'var(--danger, #ff4444)' }}>[ERROR]</span>
                        <span> {l.text.replace(/^\[?ERROR\]?\s*/i, '')}</span>
                      </>
                    )}
                    {isTodo && (
                      <>
                        <span className="terminal-log-warn">[TODO]</span>
                        <span className="terminal-highlight"> {l.text.replace(/^\[?TODO\]?\s*/i, '')}</span>
                      </>
                    )}
                    {isEvidence && (
                      <>
                        <span className="terminal-log-evidence">[EVIDENCE]</span>
                        <span> {l.text.replace(/^\[?EVIDENCE\]?\s*/i, '')}</span>
                      </>
                    )}
                    {isDiffAdd && <span style={{ color: 'var(--accent)' }}>{l.text}</span>}
                    {isDiffRemove && <span style={{ color: 'var(--danger, #ff4444)' }}>{l.text}</span>}
                    {!isCmd && !isComment && !isOk && !isWarn && !isInfo && !isError && !isTodo && !isEvidence && !isDiffAdd && !isDiffRemove && (
                      <span>{l.text}</span>
                    )}
                  </div>
                );
              })}

              <form
                className="terminal-interactive-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunCommand(inputVal);
                }}
              >
                <span className="terminal-prompt">$</span>
                <input
                  type="text"
                  className="terminal-input"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={isExecuting}
                  placeholder="type 'status', 'history', 'todos', 'ask <q>', or 'help'..."
                  aria-label="Terminal command prompt"
                />
                <span className="terminal-cursor" aria-hidden="true" />
              </form>
            </div>
          )}

          {/* Tab Content 3: AST Evidence */}
          {activeTab === 'evidence' && (
            <div className="terminal-body" tabIndex={0} aria-label="AST Evidence Inspector">
              <div className="terminal-line">
                <span className="terminal-comment">// AST Evidence Tree Extracted from git rev-list</span>
              </div>
              <div className="terminal-line">
                <span className="terminal-log-info">[TREE]</span> nexus-auth-v2 (HEAD -&gt; feature/pkce-v2)
              </div>
              <div className="terminal-line" style={{ paddingLeft: 16 }}>
                ├── src/auth/provider.ts <span className="terminal-diff-remove">[AST Syntax Gap: line 142]</span>
              </div>
              <div className="terminal-line" style={{ paddingLeft: 16 }}>
                │   └── function refreshToken(): Promise&lt;AuthSession&gt;
              </div>
              <div className="terminal-line" style={{ paddingLeft: 16 }}>
                ├── src/storage/vault.ts <span className="terminal-diff-add">[Stashed Blobs: stash@{'{0}'}]</span>
              </div>
              <div className="terminal-line" style={{ paddingLeft: 16 }}>
                │   └── function saveEncryptedSession(token: VaultToken)
              </div>
              <div className="terminal-line" style={{ paddingLeft: 16 }}>
                └── package.json <span className="terminal-log-warn">[Dependency Mismatch: @auth0/angular-jwt v5]</span>
              </div>
              <div className="terminal-line" style={{ marginTop: 12 }}>
                <span className="terminal-log-ok">[VERIFIED GROUND TRUTH]</span> 3 concrete evidence artifacts isolated.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
