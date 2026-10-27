import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <svg className="phantom-logo-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="6" fill="#0D1115" stroke="rgba(255,255,255,0.12)" />
                <path d="M16 6L25 12V22L16 26L7 22V12L16 6Z" stroke="#F2F4F5" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M16 10L21 14V19L16 22L11 19V14L16 10Z" fill="#A3FF3F" fillOpacity="0.18" stroke="#A3FF3F" strokeWidth="1.2" />
                <circle cx="13.5" cy="15.5" r="1.2" fill="#A3FF3F" />
                <circle cx="18.5" cy="15.5" r="1.2" fill="#A3FF3F" />
              </svg>
              <span className="phantom-wordmark">PHANTOM</span>
            </div>
            <p className="footer-tagline">
              Your Machine Remembers What You Have Forgotten.
            </p>
            <div className="footer-runtime-status">
              <span className="status-dot" style={{ width: 6, height: 6 }} />
              <span>LOCAL ENGINE: STANDBY · LOCAL EXECUTION</span>
            </div>
          </div>

          <div className="footer-nav-cols">
            <div className="footer-col">
              <span className="footer-col-title">Navigation</span>
              <ul className="footer-links">
                <li><a href="#archive" className="footer-link">Digital Graveyard</a></li>
                <li><a href="#ghost-memory" className="footer-link">Ghost Memory</a></li>
                <li><a href="#resurrection" className="footer-link">Resurrection Workflow</a></li>
                <li><a href="#how-it-works" className="footer-link">Archaeology Pipeline</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <span className="footer-col-title">Recommended Models</span>
              <ul className="footer-links">
                <li><span className="footer-link">Llama 3.2 (Recommended)</span></li>
                <li><span className="footer-link">Qwen 2.5 Coder</span></li>
                <li><span className="footer-link">DeepSeek-Coder</span></li>
                <li><span className="footer-link">Auto-discovered via Ollama</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <span className="footer-col-title">Developer & Privacy</span>
              <ul className="footer-links">
                <li><span className="footer-link">Local Repository Analysis</span></li>
                <li><span className="footer-link">Git & Source Forensics</span></li>
                <li><span className="footer-link">Commit History & Stashes</span></li>
                <li><a href="https://github.com/dr5t/PHANTOM" target="_blank" rel="noopener noreferrer" className="footer-link">Source: github.com/dr5t/PHANTOM</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 PHANTOM by Shaurya Tiwari (<a href="https://github.com/dr5t" target="_blank" rel="noopener noreferrer" className="footer-link">@dr5t</a>). Local-first architecture.</span>
          <span><a href="https://github.com/dr5t/PHANTOM" target="_blank" rel="noopener noreferrer" className="footer-link">https://github.com/dr5t/PHANTOM</a></span>
        </div>
      </div>
    </footer>
  );
};
