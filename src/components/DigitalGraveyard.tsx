import React, { useState } from 'react';
import './DigitalGraveyard.css';
import { REPOSITORIES } from '../data/mockData';
import { Search, FolderGit2, ArrowRight, Clock } from 'lucide-react';

interface DigitalGraveyardProps {
  onSelectRepo: (repoId: string) => void;
}

export const DigitalGraveyard: React.FC<DigitalGraveyardProps> = ({ onSelectRepo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLang, setSelectedLang] = useState<string>('All');

  const languages = ['All', 'TypeScript', 'Rust', 'Python', 'Go', 'C++'];

  const filteredRepos = REPOSITORIES.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase());
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
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No repositories matched your search query.
                  </td>
                </tr>
              ) : (
                filteredRepos.map((repo) => (
                  <tr key={repo.id}>
                    <td>
                      <div className="repo-identity">
                        <span className="repo-name-text">
                          <FolderGit2 size={16} className="text-accent" />
                          <span>{repo.name}</span>
                        </span>
                        <span className="repo-path-text">{repo.path}</span>
                      </div>
                    </td>

                    <td>
                      <span className="lang-pill">
                        <span className={`lang-dot ${getLangDotClass(repo.language)}`} />
                        <span>{repo.language}</span>
                      </span>
                    </td>

                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                        <Clock size={13} className="text-muted" />
                        <span>{repo.lastActivity}</span>
                      </span>
                    </td>

                    <td>
                      <div className="tasks-count-cell">
                        <span className="task-alert">{repo.unfinishedTasksCount} tasks</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {' '}· {repo.stashesCount} stashes
                        </span>
                      </div>
                    </td>

                    <td>{getStatusBadge(repo.status)}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectRepo(repo.id)}
                          aria-label={`Resurrect repository ${repo.name}`}
                        >
                          <span>Resurrect</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
