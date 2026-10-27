import React, { useState } from 'react';
import './TerminalPreview.css';
import { Copy, Check, Terminal as TerminalIcon, Sparkles, FileSearch } from 'lucide-react';

export const TerminalPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'interactive' | 'evidence'>('scan');
  const [copied, setCopied] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([
    '# Type a command or click a quick action above.',
    '# Try: phantom scan, phantom todos, phantom resurrect, or help'
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

  const handleRunCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setHistory([]);
      return;
    }

    let responseLines: string[] = [];
    if (trimmed.includes('scan')) {
      responseLines = [
        `$ ${trimmed}`,
        '[OK] Discovered repository: git://local/nexus-auth-v2',
        '[OK] Head commit: 9f2a71d "wip: handle token rotation edge case"',
        '[OK] Parsed 14 TypeScript AST modules in 420ms',
        '[WARN] Found 3 dangling stashes with unmerged auth changes',
        '[INFO] Vectorizing git diffs for local retrieval...',
        '> Project graph reconstructed. Run "phantom resurrect" to view blueprint.'
      ];
    } else if (trimmed.includes('todos')) {
      responseLines = [
        `$ ${trimmed}`,
        '[TODO:HIGH] src/auth/provider.ts:142 // FIXME: burned refreshToken desync bug',
        '[TODO:HIGH] src/storage/vault.ts:68 // TODO: encrypt session with AES-GCM (currently raw localStorage)',
        '[TODO:MED] src/tokens/jwt.rs:88 // TODO: verify RS256 signature before trusting claims',
        '[TODO:LOW] src/passkeys/webauthn.ts:215 // Reconstruct note: navigator.credentials requires HTTPS'
      ];
    } else if (trimmed.includes('resurrect')) {
      responseLines = [
        `$ ${trimmed}`,
        '[INFO] Synthesizing project recovery blueprint with Llama 3.2 3B...',
        '[OK] Root abandonment cause: OAuth refresh token race at 4:45 AM on 2024-03-18',
        '[OK] Generated 4-step remediation plan in ./phantom-recovery.md',
        '  Step 1: git stash branch resurrect/storage-vault stash@{0}',
        '  Step 2: npx phantom patch --fix-jwt-v5',
        '  Step 3: phantom apply-recipe atomic-refresh-mutex',
        '  Step 4: npm test'
      ];
    } else if (trimmed.includes('diff')) {
      responseLines = [
        `$ ${trimmed}`,
        'diff --git a/src/storage/vault.ts b/src/storage/vault.ts',
        '--- a/src/storage/vault.ts',
        '+++ b/src/storage/vault.ts',
        '+ export async function saveEncryptedSession(token: VaultToken) {',
        '+   // Temporary plain storage fallback',
        '+   localStorage.setItem("__temp_session", JSON.stringify(token));',
        '+ }'
      ];
    } else if (trimmed === 'help') {
      responseLines = [
        `$ ${trimmed}`,
        'Available PHANTOM CLI commands:',
        '  phantom scan <path>       - Index repository, parse AST, and identify stashes',
        '  phantom todos             - Surface unresolved TODOs, FIXMEs, and dead code',
        '  phantom resurrect         - Generate structured revival plan & patch scripts',
        '  phantom diff --stash=<n>  - Inspect uncommitted stashed evidence',
        '  clear                     - Reset terminal window'
      ];
    } else {
      responseLines = [
        `$ ${trimmed}`,
        `phantom: command not recognized: "${trimmed}". Type "help" for available options.`
      ];
    }

    setHistory((prev) => [...prev, ...responseLines]);
    setInputVal('');
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
                phantom://<span className="domain">repository-analysis</span>
              </span>
            </div>

            <div className="terminal-meta-actions">
              <span className="terminal-badge-demo" title="This panel showcases the local developer CLI experience">
                DEMONSTRATION RUNTIME · LOCAL MOCK
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
              <span>Interactive CLI</span>
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
                handleRunCommand('phantom scan ./nexus-auth-v2');
              }}
            >
              $ phantom scan
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('phantom todos --unresolved');
              }}
            >
              $ phantom todos
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('phantom resurrect --dry-run');
              }}
            >
              $ phantom resurrect
            </button>
            <button
              type="button"
              className="quick-pill"
              onClick={() => {
                setActiveTab('interactive');
                handleRunCommand('phantom diff --stash=0');
              }}
            >
              $ phantom diff
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
              {history.map((line, idx) => {
                const isCmd = line.startsWith('$');
                const isComment = line.startsWith('#');
                const isOk = line.includes('[OK]');
                const isWarn = line.includes('[WARN]');
                const isInfo = line.includes('[INFO]');
                const isTodo = line.includes('[TODO');

                return (
                  <div key={idx} className="terminal-line">
                    {isCmd && (
                      <>
                        <span className="terminal-prompt">$</span>
                        <span className="terminal-command">{line.slice(2)}</span>
                      </>
                    )}
                    {isComment && <span className="terminal-comment">{line}</span>}
                    {isOk && (
                      <>
                        <span className="terminal-log-ok">[OK]</span>
                        <span>{line.replace('[OK]', '')}</span>
                      </>
                    )}
                    {isWarn && (
                      <>
                        <span className="terminal-log-warn">[WARN]</span>
                        <span>{line.replace('[WARN]', '')}</span>
                      </>
                    )}
                    {isInfo && (
                      <>
                        <span className="terminal-log-info">[INFO]</span>
                        <span>{line.replace('[INFO]', '')}</span>
                      </>
                    )}
                    {isTodo && (
                      <>
                        <span className="terminal-log-warn">{line.split(' ')[0]}</span>
                        <span className="terminal-highlight"> {line.split(' ').slice(1).join(' ')}</span>
                      </>
                    )}
                    {!isCmd && !isComment && !isOk && !isWarn && !isInfo && !isTodo && (
                      <span>{line}</span>
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
                  placeholder="type 'phantom scan', 'todos', 'resurrect', or 'help'..."
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
