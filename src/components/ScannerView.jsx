import React, { useState, useRef, useEffect } from 'react';
import { scanUrl } from '../api';

export default function ScannerView({ onScanComplete, history = [], onOpenHistory, setActiveTab }) {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState('0.00s');
  const [currentScanningUrl, setCurrentScanningUrl] = useState('');
  const [activeStage, setActiveStage] = useState(0); // 1, 2, 3
  const [errorMsg, setErrorMsg] = useState('');

  const liveScanRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const triggerScan = async (urlToScan) => {
    const target = (urlToScan || urlInput).trim();
    if (!target || isScanning) return;

    setErrorMsg('');
    setCurrentScanningUrl(target);
    setIsScanning(true);
    setScanProgress(15);
    setActiveStage(1);
    setElapsedTime('0.00s');

    setTimeout(() => {
      liveScanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);

    const startTime = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(((Date.now() - startTime) / 1000).toFixed(2) + 's');
    }, 50);

    setTimeout(() => { setScanProgress(45); setActiveStage(2); }, 250);
    setTimeout(() => { setScanProgress(80); setActiveStage(3); }, 500);

    try {
      // Real request to the backend; wait at least 700 ms so the progress steps are readable.
      const [result] = await Promise.all([
        scanUrl(target),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);
      setScanProgress(100);
      setActiveStage(4);
      onScanComplete(target, result);
    } catch (err) {
      setErrorMsg(err.message || 'Scan failed.');
    } finally {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIsScanning(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerScan(urlInput);
  };

  const handleQuickTry = (sampleUrl) => {
    setUrlInput(sampleUrl);
    triggerScan(sampleUrl);
  };

  const handleClear = () => {
    setUrlInput('');
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Interactive Background Glow Element (Contained) */}
      <div className="relative w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop pt-8 pb-20">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-secondary-fixed/30 via-primary-fixed/20 to-transparent blur-3xl pointer-events-none rounded-full -z-10"></div>

        {/* Scanner Cockpit Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-wider mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span>Zero-day URL &amp; Domain Heuristics</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight mb-3">
            Is this link safe?
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Paste any website URL and our AI will check it in seconds.
          </p>
        </div>

        {/* Central URL Input Cockpit Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-xl transition-all hover:shadow-2xl">
            <form className="flex flex-col md:flex-row items-center gap-2" onSubmit={handleSubmit}>
              {/* Leading Input Area */}
              <div className="flex items-center w-full px-4 py-3 bg-surface-container-low rounded-xl focus-within:bg-surface-container-lowest transition-colors">
                <span className="material-symbols-outlined text-secondary text-[26px] mr-3 shrink-0">shield</span>
                <input
                  autocomplete="off"
                  className="w-full bg-transparent font-code-mono text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0"
                  id="url-input"
                  placeholder="e.g. https://service-portal-verification.net/signin"
                  spellcheck="false"
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isScanning}
                />
                {urlInput.trim().length > 0 && (
                  <button
                    aria-label="Clear input"
                    className="text-outline-variant hover:text-on-surface transition-colors p-1 cursor-pointer"
                    id="clear-btn"
                    onClick={handleClear}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                )}
              </div>
              {/* Action Button */}
              <button
                className={`w-full md:w-auto px-8 py-4 shrink-0 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs shadow-md hover:bg-primary transition-all duration-200 cursor-pointer ${
                  isScanning ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isScanning}
                id="scan-btn"
                type="submit"
              >
                <span className="material-symbols-outlined text-[20px]">manage_search</span>
                <span>{isScanning ? 'Scanning...' : 'Check URL'}</span>
              </button>
            </form>

            {errorMsg && (
              <div className="mt-3 mx-2 p-3 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm" role="alert">
                {errorMsg}
              </div>
            )}

            {/* Quick-Try Example Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-3 px-2 mt-1">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Quick Try:</span>
              {/* Safe Example */}
              <button
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-code-mono text-label-sm transition-all text-left truncate max-w-[280px] sm:max-w-none cursor-pointer"
                onClick={() => handleQuickTry('https://www.wikipedia.org')}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim ring-2 ring-tertiary-fixed/30 shrink-0"></span>
                <span className="truncate">https://www.wikipedia.org</span>
                <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary transition-colors shrink-0">
                  arrow_forward
                </span>
              </button>
              {/* Phishing Example */}
              <button
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-code-mono text-label-sm transition-all text-left truncate max-w-[320px] sm:max-w-none cursor-pointer"
                onClick={() => handleQuickTry('http://paypal-support.com.desenvolvedortheosbank.com.br/login.php')}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-error ring-2 ring-error/30 shrink-0"></span>
                <span className="truncate">http://paypal-support.com.desenvolvedortheosbank.com.br/login.php</span>
                <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-error transition-colors shrink-0">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Scanning / Live State Inspection Card */}
        {isScanning && (
          <div ref={liveScanRef} className="max-w-4xl mx-auto mb-16" id="live-scan-card">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl relative overflow-hidden">
              {/* Progress bar line */}
              <div className="absolute top-0 left-0 h-1 bg-surface-container w-full">
                <div
                  className="h-full bg-secondary transition-all duration-300"
                  id="scan-progress-bar"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined animate-spin text-[24px]">sync</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">Analyzing Target</h3>
                      <span className="font-code-mono text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                        XGBoost v2 Pipeline
                      </span>
                    </div>
                    <p className="font-code-mono text-label-sm text-on-surface-variant truncate max-w-md pt-0.5" id="live-url-display">
                      {currentScanningUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline block">
                      Inference Clock
                    </span>
                    <span className="font-code-mono text-label-md text-primary font-semibold" id="scan-timer">
                      {elapsedTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Step Inspection Progression */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {/* Step 1 */}
                <div
                  className={`p-3.5 rounded-xl transition-all ${
                    activeStage > 1
                      ? 'bg-surface-container-highest'
                      : activeStage === 1
                      ? 'bg-surface-container'
                      : 'bg-surface-container-low'
                  }`}
                  id="stage-1"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-label-sm text-label-sm text-on-surface font-medium">1. Lexical Tokenization</span>
                    {activeStage > 1 ? (
                      <span className="material-symbols-outlined text-[18px] text-[#10b981]">check_circle</span>
                    ) : activeStage === 1 ? (
                      <span className="material-symbols-outlined text-[18px] text-secondary animate-spin">autorenew</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px] text-outline">hourglass_empty</span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    URL path depth, Shannon entropy, prefix-suffix ratios.
                  </p>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-3.5 rounded-xl transition-all ${
                    activeStage > 2
                      ? 'bg-surface-container-highest'
                      : activeStage === 2
                      ? 'bg-surface-container'
                      : 'bg-surface-container-low'
                  }`}
                  id="stage-2"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-label-sm text-label-sm text-on-surface font-medium">2. WHOIS &amp; DNS Heuristics</span>
                    {activeStage > 2 ? (
                      <span className="material-symbols-outlined text-[18px] text-[#10b981]">check_circle</span>
                    ) : activeStage === 2 ? (
                      <span className="material-symbols-outlined text-[18px] text-secondary animate-spin">autorenew</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px] text-outline">hourglass_empty</span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Autonomous System (ASN), registrar age, IP literal mapping.
                  </p>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-3.5 rounded-xl transition-all ${
                    activeStage > 3
                      ? 'bg-surface-container-highest'
                      : activeStage === 3
                      ? 'bg-surface-container'
                      : 'bg-surface-container-low'
                  }`}
                  id="stage-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-label-sm text-label-sm text-on-surface font-medium">3. XGBoost Ensemble</span>
                    {activeStage > 3 ? (
                      <span className="material-symbols-outlined text-[18px] text-[#10b981]">check_circle</span>
                    ) : activeStage === 3 ? (
                      <span className="material-symbols-outlined text-[18px] text-secondary animate-spin">autorenew</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px] text-outline">hourglass_empty</span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Weighted inference, gradient-boosted decision tree verdict.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual 3-Step Horizontal Strip: "How It Works" */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold block mb-1">
              Architecture
            </span>
            <h2 className="font-headline-md text-headline-md text-primary font-semibold">
              How the Detector Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-16 right-16 h-0.5 bg-surface-container -translate-y-8 -z-10"></div>

            {/* Step 1 Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[24px]">input</span>
                </div>
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">Step 01</div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-primary mb-2">Paste URL</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Clean input ingestion and normalization. Deconstructs protocol, subdomains, TLDs, and percent-encoded characters.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center gap-2">
                <span className="font-code-mono text-label-sm px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant">
                  RFC 3986 Standard
                </span>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary mb-4">
                  <span className="material-symbols-outlined text-[24px]">neurology</span>
                </div>
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">Step 02</div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-primary mb-2">Model Analyzes 19 URL Features</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Synthesizing lexical heuristics, registration lifespan, IP host detection, multi-hop redirect chains, and character entropy.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center gap-2">
                <span className="font-code-mono text-label-sm px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant">
                  19 URL Features
                </span>
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary mb-4">
                  <span className="material-symbols-outlined text-[24px]">rule</span>
                </div>
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">Step 03</div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-primary mb-2">Get Verdict with Reasons</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Actionable confidence score, feature contribution breakdown, and clear explanations for analysts and end-users.
                </p>
              </div>
              <div className="mt-4 pt-3 flex items-center gap-2">
                <span className="font-code-mono text-label-sm px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant">
                  Per-URL Explanations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Split Cockpit Bottom Section: Live Feed / History + Security Pro Tip */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Scan History Feed (8 Cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[22px]">history</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">Your Scans This Session</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Stored only in this browser tab; cleared on refresh</p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider bg-surface-container-low px-2.5 py-1 rounded-full">
                Session
              </span>
            </div>

            {/* History Table Rows */}
            <div className="divide-y divide-surface-container overflow-x-auto">
              {history.length === 0 && (
                <p className="py-6 text-center font-body-sm text-body-sm text-on-surface-variant">
                  No scans yet. Paste a URL above to start.
                </p>
              )}
              {history.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4 hover:bg-surface-container-low/50 px-2 rounded-lg transition-colors">
                  <span className="font-code-mono text-body-sm text-on-surface font-medium truncate block min-w-0">{item.url}</span>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">
                      {item.verdict} · risk {(item.risk * 100).toFixed(1)}%
                    </span>
                    <button
                      onClick={() => onOpenHistory && onOpenHistory(item)}
                      className="font-label-md text-label-md text-secondary hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer"
                      type="button"
                    >
                      <span>Report</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pro Tip & Accuracy Metrics (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Pro Tip Card */}
            <div className="bg-surface-container-high rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-[22px]">lightbulb</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Pro Tip</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed mb-4">
                PhishGuard only reads the <strong>text of the URL</strong>. It never opens the page, so treat the result as a hint, not proof.
              </p>
              <div className="p-3 bg-surface-container-lowest/80 rounded-xl">
                <div className="font-code-mono text-label-sm text-primary font-medium mb-1">Example:</div>
                <div className="font-code-mono text-[11px] text-on-surface-variant truncate">
                  Never enter passwords on a page you reached from an unexpected link
                </div>
              </div>
            </div>

            {/* Academic Sandbox Stats */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Held-out Test Split</span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-code-mono text-label-sm font-semibold">
                  PhiUSIIL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-surface-container-low text-center">
                  <span className="font-headline-md text-headline-md font-bold text-primary block">99.7%</span>
                  <span className="font-label-sm text-label-sm text-outline-variant">Accuracy (this dataset)</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low text-center">
                  <span className="font-headline-md text-headline-md font-bold text-primary block">33,953</span>
                  <span className="font-label-sm text-label-sm text-outline-variant">Test URLs</span>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                  <span>~235K training URLs</span>
                </span>
                <button
                  onClick={() => setActiveTab && setActiveTab('model-insights')}
                  className="text-secondary font-label-md text-label-md hover:underline cursor-pointer"
                  type="button"
                >
                  Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
