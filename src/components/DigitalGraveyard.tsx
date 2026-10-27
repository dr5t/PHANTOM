import React, { useState, useEffect } from 'react';
import './DigitalGraveyard.css';
import { REPOSITORIES as DEMO_REPOSITORIES } from '../data/mockData';
import { Search, FolderGit2, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { fetchRepositories } from '../services/api';
import type { RepositoryItem } from '../types';

interface DigitalGraveyardProps {
  onSelectRepo: (repoId: string) => void;
}

export const DigitalGraveyard: React.FC<DigitalGraveyardProps> = ({ onSelectRepo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLang, setSelectedLang] = useState<string>('All');
  const [repos, setRepos] = useState<RepositoryItem[]>(DEMO_REPOSITORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  const loadRepos = async () => {
    setIsLoading(true);
    try {
      const realRepos = await fetchRepositories();
      if (realRepos && realRepos.length > 0) {
        // Tag demo repos with a badge or label and combine with real repos
        const labeledDemo = DEMO_REPOSITORIES.map((r) => ({
          ...r,
          description: `[DEMO FIXTURE] ${r.description}`,
        }));
        setRepos([...realRepos, ...labeledDemo]);
        setBackendConnected(true);
      } else {
        setRepos(DEMO_REPOSITORIES);
      }
    } catch {
      // Fallback to demo repositories if backend is still spinning up
      setRepos(DEMO_REPOSITORIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
  }, []);

  const languages = ['All', 'TypeScript', 'Rust', 'Python', 'Go', 'C++'];

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.primaryRisk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = selectedLang === 'All' || repo.language === selectedLang;
    return matchesSearch && matchesLang;
  });

  const getLangDotClass = (lang: string) => {
    switch (lang) {
      case 'TypeScript': return 'ts';
      case 'Rust': return 'rust';
      case 'Python': return 'py';
      case 'Go': return 'go';
      case 'C++': return 'cpp';
      default: return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Needs Resurrection':
        return <span className="status-badge status-resurrect">Needs Resurrection</span>;
      case 'Memory Ready':
        return <span className="status-badge status-ready">Memory Ready</span>;
      default:
        return <span className="status-badge status-indexed">{status}</span>;
    }
  };

  return (
    <section id="archive" className="graveyard-section" aria-labelledby="graveyard-heading">
      <div className="container">
        <header className="graveyard-header">
          <div className="section-badge">
            <span className="indicator">//</span>
            <span>repository archive</span>
          </div>
          <h2 id="graveyard-heading" className="section-title">
            Your unfinished work, brought back into view.
          </h2>
          <p className="section-subtitle">
            Local inspection of discovered repositories. Inactivity indicates project dormancy, not permanent abandonment.
          </p>
        </header>

        {/* Toolbar */}
        <div className="graveyard-toolbar">
          <div className="search-wrapper">
            <Search size={15} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="search-input"
              placeholder="Search repositories, paths, or risks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Filter repositories"
            />
          </div>

          <div className="lang-filter-group" role="group" aria-label="Filter by programming language">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                className={`filter-btn ${selectedLang === lang ? 'active' : ''}`}
                onClick={() => setSelectedLang(lang)}
              >
                {lang}
              </button>
            ))}

            <button
              type="button"
              className="filter-btn"
              onClick={loadRepos}
              title="Refresh repository list from local engine"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={12} className={isLoading ? 'spin-icon' : ''} />
              <span>{isLoading ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="projects-table-wrapper tech-card">
          <table className="projects-table" aria-label="Discovered Git Repositories">
            <thead>
              <tr>
                <th scope="col">Repository Name & Path</th>
                <th scope="col">Language</th>
                <th scope="col">Last Recorded Activity</th>
                <th scope="col">Detected Tasks</th>
                <th scope="col">Scan Status</th>
                <th scope="col" style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No repositories match your filter query.
                  </td>
                </tr>
              ) : (
                filteredRepos.map((repo) => (
                  <tr key={repo.id} className="project-row">
                    <td>
                      <div className="repo-name-cell">
                        <FolderGit2 size={16} className="repo-icon" aria-hidden="true" />
                        <div>
                          <div className="repo-title">
                            {repo.name}
                            {repo.description.includes('[DEMO FIXTURE]') && (
                              <span className="mono text-xs" style={{ marginLeft: 6, opacity: 0.6 }}>[DEMO]</span>
                            )}
                          </div>
                          <div className="repo-path">{repo.path}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="lang-badge">
                        <span className={`lang-dot ${getLangDotClass(repo.language)}`} aria-hidden="true" />
                        <span>{repo.language}</span>
                      </span>
                    </td>

                    <td>
                      <div className="activity-cell">
                        <Clock size={13} className="text-muted" aria-hidden="true" />
                        <span>{repo.lastActivity}</span>
                        <span className="activity-days">({repo.daysInactive}d inactive)</span>
                      </div>
                    </td>

                    <td>
                      <span className="tasks-count">
                        <strong>{repo.unfinishedTasksCount}</strong> tasks identified
                      </span>
                    </td>

                    <td>
                      {getStatusBadge(repo.status)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-select-repo"
                        onClick={() => onSelectRepo(repo.id)}
                        aria-label={`Inspect resurrection report for ${repo.name}`}
                      >
                        <span>Inspect</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Meta */}
        <div className="graveyard-footer-meta">
          <span>
            {filteredRepos.length} repositories listed · {backendConnected ? 'Live Local Git Engine Connected' : 'Local Archive'}
          </span>
          <span className="mono text-muted text-xs">
            LOCAL CACHE: READY · LOCAL ENGINE
          </span>
        </div>
      </div>
    </section>
  );
};
