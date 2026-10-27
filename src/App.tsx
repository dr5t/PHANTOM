import React, { useState, useEffect } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TerminalPreview } from './components/TerminalPreview';
import { HowItWorks } from './components/HowItWorks';
import { GhostMemory } from './components/GhostMemory';
import { DigitalGraveyard } from './components/DigitalGraveyard';
import { ResurrectionMode } from './components/ResurrectionMode';
import { OpenSourceAI } from './components/OpenSourceAI';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { LaunchModal } from './components/LaunchModal';

export const App: React.FC = () => {
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState('nexus-auth-v2');
  const [activeSection, setActiveSection] = useState('');

  // IntersectionObserver to highlight active navigation link
  useEffect(() => {
    const sectionIds = ['archive', 'ghost-memory', 'resurrection', 'how-it-works'];
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            return;
          }
        }
      }
      if (window.scrollY < 300) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToArchive = () => {
    const el = document.getElementById('archive');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectRepo = (repoId: string) => {
    setSelectedRepoId(repoId);
    const el = document.getElementById('resurrection');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResurrectComplete = (repoId: string) => {
    setSelectedRepoId(repoId);
    const el = document.getElementById('resurrection');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      {/* Navigation */}
      <Navbar
        onLaunchModal={() => setIsLaunchModalOpen(true)}
        activeSection={activeSection}
      />

      {/* Main Content */}
      <main id="main-content">
        <Hero
          onExploreArchive={scrollToArchive}
          onHowItWorks={scrollToHowItWorks}
        />

        <TerminalPreview />

        <HowItWorks />

        <GhostMemory />

        <DigitalGraveyard onSelectRepo={handleSelectRepo} />

        <ResurrectionMode
          selectedRepoId={selectedRepoId}
          onLaunchFullWorkflow={() => setIsLaunchModalOpen(true)}
        />

        <OpenSourceAI />

        <FinalCTA onLaunchModal={() => setIsLaunchModalOpen(true)} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Archaeological Scanner Modal */}
      <LaunchModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        onResurrectComplete={handleResurrectComplete}
      />
    </div>
  );
};

export default App;
