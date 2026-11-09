import React from 'react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="w-full bg-surface-container-lowest mt-space-xl">
      <div className="w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex flex-col items-center md:items-start gap-space-xs text-center md:text-left">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            College ML Capstone Project • Educational &amp; Research Purposes Only • Powered by UCI PhiUSIIL Phishing Dataset
          </p>
          <p className="font-code-mono text-code-mono text-on-surface-variant opacity-75">
            © 2025 PhishGuard Research Team. Open academic inference platform.
          </p>
        </div>
        <div className="flex items-center gap-space-lg">
          <a
            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="https://github.com"
            rel="noreferrer"
            target="_blank"
          >
            <span className="material-symbols-outlined text-[18px]">code</span>
            <span>GitHub Repo</span>
          </a>
          <a
            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            href="https://archive.ics.uci.edu"
            rel="noreferrer"
            target="_blank"
          >
            <span className="material-symbols-outlined text-[18px]">database</span>
            <span>UCI Dataset</span>
          </a>
          <button
            onClick={() => setActiveTab && setActiveTab('about')}
            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            data-path="about"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Model Docs</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
