import React, { useState, useEffect } from 'react';

export default function Header({ activeTab, setActiveTab }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        localStorage.getItem('phishguard-theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('phishguard-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('phishguard-theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const navItems = [
    { id: 'scanner', label: 'Scanner' },
    { id: 'results-and-analysis', label: 'Results & Analysis' },
    { id: 'model-insights', label: 'Model Insights' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg shrink-0">
          <button
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-space-sm cursor-pointer focus:outline-none text-left"
          >
            <img
              alt="PhishGuard Shield Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/ALJJyrCi0q5DYJQa2nlbnvtWfbF_bIRmFBJ5SfYYAAOZ9suBawzH_ZxAft1IOX-_B6bd2rSFJleWGmcw1fhDUjJUwwn7maxxdUyQpfb6j54wczA7qrtdN8JDzXQmGG0wB_4hRMvS-s7O2yvPUbWjBzNrCUn3yGSUSncveITx_Yv4wx6kdK5VGH9Ljh5pUExkzA4uAa-Jecu3kOSGbRiHM_qQH_qMkVA1qoah_akZJ-IEbew"
            />
            <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-primary">
              PhishGuard
            </span>
            <span className="hidden sm:inline-flex items-center px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              AI ML Project v1.2
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-space-xs p-1 rounded-xl bg-surface-container-low">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-medium'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                  data-path={item.id}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-space-sm shrink-0">
          <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
            <span className="font-code-mono text-code-mono text-on-surface-variant">
              ML Engine: Online - XGBoost v2
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Academic Sandbox</span>
          </div>

          <button
            aria-label="Toggle color mode"
            onClick={toggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-surface-container px-2 py-1.5 bg-surface-container-lowest">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 rounded-lg text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
