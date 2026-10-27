import React, { useState } from 'react';
import './GhostMemory.css';
import { GHOST_MEMORY_EVENTS } from '../data/mockData';
import { GitCommit, GitPullRequest, Bookmark, Sparkles, FileCode, CheckCircle2 } from 'lucide-react';

export const GhostMemory: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const tags = ['All', 'Unfinished Feature', 'Stashed Work', 'Security Leak', 'TODO', 'Breaking Changes'];

  const filteredEvents = selectedTag === 'All'
    ? GHOST_MEMORY_EVENTS
    : GHOST_MEMORY_EVENTS.filter((e) => e.tags.includes(selectedTag));

  return (
    <section id="ghost-memory" className="ghost-memory-section" aria-labelledby="ghost-memory-heading">
      <div className="container">
        <header className="memory-header">
          <div className="section-badge">
            <span className="indicator">//</span>
            <span>memory reconstruction</span>
          </div>
          <h2 id="ghost-memory-heading" className="section-title">
            Every change leaves a trace.
          </h2>
          <p className="section-subtitle">
            A chronological reconstruction of the exact moments, files, and unresolved bugs that led to codebase abandonment. Ground truth facts are clearly demarcated from AI syntheses.
          </p>
        </header>

        {/* Tag Filters */}
        <div className="memory-filter-bar" role="group" aria-label="Filter events by category">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`filter-btn ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="timeline-container">
          <div className="timeline-spine" aria-hidden="true" />

          {filteredEvents.map((event) => (
            <div key={event.id} className="timeline-event-item">
              <div className="timeline-marker" aria-hidden="true">
                <div className="timeline-marker-inner" />
              </div>

              <article className="event-card tech-card">
                <div className="event-meta-row">
                  <div className="event-badges-group">
                    {/* Event Type Icon & Ground Truth Badge */}
                    <span className="fact-badge fact">
                      {event.type === 'commit' && <GitCommit size={13} />}
                      {event.type === 'stash' && <Bookmark size={13} />}
                      {event.type === 'branch_diverge' && <GitPullRequest size={13} />}
                      {event.type === 'todo' && <FileCode size={13} />}
                      <span>
                        {event.isFact ? 'GROUND TRUTH · ' : 'INFERRED · '}
                        {event.commitHash ? `REV ${event.commitHash}` : event.type.toUpperCase()}
                      </span>
                    </span>

                    {event.tags.map((t, idx) => (
                      <span key={idx} className="tech-tag">
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className="event-timestamp">
                    {event.timestamp} ({event.relativeTime})
                  </span>
                </div>

                {/* Message */}
                <h3 className="event-message">
                  {event.message}
                </h3>

                {/* File Reference */}
                {event.fileReference && (
                  <div className="event-reference-row">
                    <FileCode size={14} />
                    <span>
                      {event.fileReference}
                      {event.lineNumber ? ` : L${event.lineNumber}` : ''}
                    </span>
                  </div>
                )}

                {/* Code Snippet / TODO text */}
                {event.codeSnippet && (
                  <pre className="event-code-snippet" tabIndex={0}>
                    <code>{event.codeSnippet}</code>
                  </pre>
                )}

                {event.todoText && (
                  <div className="event-code-snippet" style={{ color: '#FFB347' }}>
                    <code>{event.todoText}</code>
                  </div>
                )}

                {/* AI Interpretation */}
                {event.aiInterpretation && (
                  <div className="ai-interpretation-box">
                    <div className="ai-box-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={12} color="#B388FF" />
                        AI RECONSTRUCTION SYNTHESIS
                      </span>
                      <span className="confidence">
                        CONFIDENCE: {Math.round(event.confidenceScore * 100)}%
                      </span>
                    </div>
                    <p className="ai-box-text">
                      {event.aiInterpretation}
                    </p>
                  </div>
                )}
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
