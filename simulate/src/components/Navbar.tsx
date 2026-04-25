import React from 'react';
import logo from '../assets/logo.png';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import './Navbar.css';

interface NavbarProps {
  activeTab: 'scheduler' | 'data-structures';
  onTabChange: (tab: 'scheduler' | 'data-structures') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src={logo} className="navbar-logo" alt="SimuLab Logo" />
          SimuLab
        </div>

        <div className="navbar-links">
          <button
            className={`navbar-link ${activeTab === 'scheduler' ? 'active' : ''}`}
            onClick={() => onTabChange('scheduler')}
          >
            {t('nav.scheduler')}
          </button>
          <button
            className={`navbar-link ${activeTab === 'data-structures' ? 'active' : ''}`}
            onClick={() => onTabChange('data-structures')}
          >
            {t('nav.data_structures')}
          </button>
        </div>

        <div className="navbar-actions">
          <button 
            className="btn-translate" 
            onClick={toggleTheme}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            {theme === 'light' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
