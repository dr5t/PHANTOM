import React, { useState, useEffect } from 'react';
import './GhostMemory.css';
import { GHOST_MEMORY_EVENTS } from '../data/mockData';
import { GitCommit, Bookmark, Sparkles, FileCode } from 'lucide-react';
import { fetchRepositories, fetchTimelineEvents } from '../services/api';
import type { MemoryEvent } from '../types';

export const GhostMemory: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [events, setEvents] = useState<MemoryEvent[]>(GHOST_MEMORY_EVENTS);
  const [activeRepoName, setActiveRepoName] = useState<string>('nexus-auth-v2 (Demo)');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Attempt to load timeline from the most recently analyzed local repository
    const loadRealTimeline = async () => {
      try {
        const repos = await fetchRepositories();
        if (repos && repos.length > 0) {
          const firstRepo = repos[0];
          setIsLoading(true);
          const realEvents = await fetchTimelineEvents(firstRepo.id);
          if (realEvents && realEvents.length > 0) {
            setEvents(realEvents);
            setActiveRepoName(firstRepo.name);
          }
        }
      } catch {
        // Retain demonstration memory events
      } finally {
        setIsLoading(false);
      }
    };

    loadRealTimeline();
  }, []);

  const tags = ['All', 'commit', 'stash', 'todo', 'wip', 'interrupted', 'blocker', 'unresolved'];

  const filteredEvents = selectedTag === 'All'
    ? events
    : events.filter((e) => e.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()) || e.type === selectedTag.toLowerCase());

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
          <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Active Forensic Target: <span className="text-accent mono">{activeRepoName}</span>
          </div>
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

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Reconstructing forensic timeline from Git commit graph...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No timeline events found matching the selected tag.
            </div>
          ) : (
            filteredEvents.map((event) => (
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
                      {event.relativeTime || event.timestamp}
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

                  {/* AI Interpretation (Clearly demarcated) */}
                  {event.aiInterpretation && (
                    <div className="event-ai-block">
                      <div className="ai-label-row">
                        <Sparkles size={13} className="text-accent" />
                        <span className="mono text-xs">ARCHAEOLOGICAL SYNTHESIS:</span>
                      </div>
                      <p className="ai-text">
                        {event.aiInterpretation}
                      </p>
                    </div>
                  )}
                </article>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
