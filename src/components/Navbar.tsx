import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Menu, X, ArrowUpRight, Terminal } from 'lucide-react';

interface NavbarProps {
  onLaunchModal: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchModal, activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 860) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { label: 'Archive', href: '#archive' },
    { label: 'Ghost Memory', href: '#ghost-memory' },
    { label: 'Resurrection', href: '#resurrection' },
    { label: 'How It Works', href: '#how-it-works' },
  ];

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">
        {/* Brand */}
        <a href="#" className="navbar-brand" aria-label="PHANTOM Homepage">
          <svg className="phantom-logo-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#0D1115" stroke="rgba(255,255,255,0.12)" />
            <path d="M16 6L25 12V22L16 26L7 22V12L16 6Z" stroke="#F2F4F5" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M16 10L21 14V19L16 22L11 19V14L16 10Z" fill="#A3FF3F" fillOpacity="0.18" stroke="#A3FF3F" strokeWidth="1.2" />
            <circle cx="13.5" cy="15.5" r="1.2" fill="#A3FF3F" />
            <circle cx="18.5" cy="15.5" r="1.2" fill="#A3FF3F" />
          </svg>
          <span className="phantom-wordmark">PHANTOM</span>
          <span className="phantom-version-badge">
            <span className="status-dot" style={{ width: 5, height: 5 }} />
            LOCAL / AI
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation">
          <ul className="navbar-nav">
            {navItems.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const terminalSection = document.getElementById('terminal-preview');
              terminalSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Terminal size={14} className="text-accent" />
            <span>CLI Demo</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onLaunchModal}
            id="nav-launch-btn"
          >
            <span>Launch PHANTOM</span>
            <ArrowUpRight size={14} />
          </button>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => {
          const sectionId = item.href.replace('#', '');
          const isActive = activeSection === sectionId;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>{item.label}</span>
              <span className="mono text-muted text-xs">// 0{navItems.indexOf(item) + 1}</span>
            </a>
          );
        })}
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '12px' }}
          onClick={() => {
            setMobileMenuOpen(false);
            onLaunchModal();
          }}
        >
          <span>Launch PHANTOM</span>
          <ArrowUpRight size={16} />
        </button>
      </div>
    </header>
  );
};
