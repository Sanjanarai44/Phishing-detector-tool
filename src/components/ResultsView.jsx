import React, { useState, useEffect } from 'react';
import { verdictStates } from '../data/verdictData';

export default function ResultsView({ currentStateKey, onStateChange, onScanAnother, customScannedUrl }) {
  const [selectedState, setSelectedState] = useState(currentStateKey || 'phishing');
  const [copied, setCopied] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');

  useEffect(() => {
    if (currentStateKey) {
      setSelectedState(currentStateKey);
    }
  }, [currentStateKey]);

  const currentData = verdictStates[selectedState] || verdictStates.phishing;

  const handleCopyTarget = () => {
    const textToCopy = customScannedUrl || currentData.targetUrl;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const exportData = {
      reportId: "PG-2025-" + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      targetUrl: customScannedUrl || currentData.targetUrl,
      classification: currentData.title,
      confidence: currentData.confidence,
      threatCertainty: currentData.gaugeCertainty,
      model: "XGBoost 2.4.1 + LightGBM Ensemble",
      datasetBenchmark: "UCI PhiUSIIL 2024",
      rocAuc: 0.9942,
      latency: "42.8ms",
      shapFeatures: currentData.shapData,
      extractedFeatures: currentData.features
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phishguard-forensics-${selectedState}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSwitchState = (stateKey) => {
    setSelectedState(stateKey);
    if (onStateChange) onStateChange(stateKey);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        {/* State Navigation Selector Bar */}
        <div className="w-full bg-surface-container-low p-1.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-space-sm shadow-sm">
          <div className="flex items-center gap-space-xs w-full sm:w-auto">
            <span className="hidden md:inline-flex items-center gap-1.5 px-space-sm py-1 text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase">
              <span className="material-symbols-outlined text-[16px] text-primary">model_training</span>
              <span>Simulation Mode:</span>
            </span>
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full bg-surface-container rounded-xl p-1" id="stateSelectorTabs">
              <button
                className={`verdict-tab px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedState === 'phishing'
                    ? 'bg-error text-on-error shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                id="tab-phishing"
                onClick={() => handleSwitchState('phishing')}
                type="button"
              >
                {selectedState === 'phishing' && (
                  <span className="w-2 h-2 rounded-full bg-surface-container-lowest animate-ping"></span>
                )}
                <span>Phishing (97.4%)</span>
              </button>
              <button
                className={`verdict-tab px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedState === 'suspicious'
                    ? 'bg-secondary-container text-on-secondary-container shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                id="tab-suspicious"
                onClick={() => handleSwitchState('suspicious')}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                <span>Suspicious (68.2%)</span>
              </button>
              <button
                className={`verdict-tab px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedState === 'safe'
                    ? 'bg-tertiary-container text-on-tertiary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                id="tab-safe"
                onClick={() => handleSwitchState('safe')}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
                <span>Safe (99.1%)</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-space-md px-space-sm w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1 text-on-surface-variant font-code-mono text-code-mono">
              <span className="material-symbols-outlined text-[15px] text-secondary">memory</span>
              <span>Latency: 42ms</span>
            </div>
            <div className="h-4 w-px bg-outline-variant/40 hidden sm:block"></div>
            <span className="font-code-mono text-code-mono text-on-surface-variant hidden lg:inline">XGBoost 2.4.1</span>
          </div>
        </div>

        {/* MAIN DYNAMIC VERDICT CARD */}
        <div
          className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-md sm:p-space-lg lg:p-space-xl flex flex-col gap-space-lg relative overflow-hidden transition-all duration-300"
          id="verdictHeroCard"
        >
          {/* Ambient Glow */}
          <div
            className={`absolute -right-24 -top-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${currentData.auraColor}`}
            id="verdictAura"
          ></div>

          {/* Card Top: Status & Gauge & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center relative z-10">
            {/* Left: Threat Status Label & Narrative (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center gap-space-sm">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold ${currentData.statusChipBg}`}
                  id="verdictStatusChip"
                >
                  <span className="material-symbols-outlined text-[18px]" id="verdictStatusIcon">
                    {currentData.statusIcon}
                  </span>
                  <span id="verdictStatusTitle">{currentData.title}</span>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium"
                  id="verdictRiskBadge"
                >
                  {currentData.riskBadge}
                </span>
                <span className="font-code-mono text-code-mono text-on-surface-variant/80 hidden sm:inline">
                  SHA-256: 4e9c7a...110d
                </span>
              </div>
              <h1
                className="font-headline-lg text-headline-lg font-semibold text-on-surface tracking-tight mt-1"
                id="verdictMainHeadline"
              >
                {currentData.headline}
              </h1>
              <p
                className="font-body-md text-body-md text-on-surface-variant max-w-2xl"
                id="verdictDescription"
              >
                {currentData.desc}
              </p>
            </div>

            {/* Right: Gauge + Meta Telemetry (5 cols) */}
            <div className="lg:col-span-5 flex items-center justify-start lg:justify-end gap-space-lg">
              <div className="flex items-center gap-space-md p-space-md rounded-2xl bg-surface-container-low shadow-sm">
                {/* Confidence Ring Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      className="text-surface-container-highest"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                    ></circle>
                    <circle
                      className={`transition-all duration-700 ease-out ${currentData.gaugeColorClass}`}
                      cx="50"
                      cy="50"
                      fill="none"
                      id="gaugeArc"
                      r="40"
                      stroke="currentColor"
                      strokeDasharray="251.2"
                      strokeDashoffset={currentData.gaugeOffset}
                      strokeLinecap="round"
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span
                      className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight"
                      id="gaugePercentage"
                    >
                      {currentData.confidence}
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase -mt-1 font-semibold">
                      Confidence
                    </span>
                  </div>
                </div>
                {/* Gauge Meta */}
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Classification Posture
                  </span>
                  <span
                    className={`font-headline-sm text-headline-sm font-semibold ${currentData.certaintyColorClass}`}
                    id="gaugeCertainty"
                  >
                    {currentData.gaugeCertainty}
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Class weighted by 58 lexical &amp; network vectors from UCI PhiUSIIL.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scanned Target Monospace Callout Bar */}
          <div className="relative z-10 w-full bg-inverse-surface rounded-xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-inner text-inverse-on-surface">
            <div className="flex items-center gap-space-sm min-w-0 w-full md:w-auto">
              <div className="p-2 rounded-lg bg-surface-container-highest/10 text-inverse-on-surface shrink-0">
                <span className="material-symbols-outlined text-[20px]">travel_explore</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline-variant">
                    Scanned URL
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-code-mono text-[11px] font-semibold ${currentData.protocolClass}`}
                    id="protocolBadge"
                  >
                    <span className="material-symbols-outlined text-[13px]">{currentData.protocolIcon}</span>
                    <span>{currentData.urlProtocol}</span>
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full bg-surface-container-highest/20 text-inverse-on-surface font-code-mono text-[11px]"
                    id="tldAlert"
                  >
                    {currentData.tldTag}
                  </span>
                </div>
                <p
                  className="font-code-mono text-code-mono text-inverse-primary truncate select-all mt-0.5 tracking-tight font-medium"
                  id="targetUrlString"
                  dangerouslySetInnerHTML={{
                    __html: customScannedUrl ? customScannedUrl : currentData.urlStringHtml
                  }}
                ></p>
              </div>
            </div>
            {/* Controls: Copy & Secondary inspection */}
            <div className="flex items-center gap-space-xs shrink-0 self-end md:self-auto">
              <button
                className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-highest/15 hover:bg-surface-container-highest/25 text-inverse-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                onClick={handleCopyTarget}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied!' : 'Copy Target'}</span>
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-highest/15 hover:bg-surface-container-highest/25 text-inverse-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                onClick={() => alert(`Sandbox analysis initialized for: ${customScannedUrl || currentData.targetUrl}\nIsolated container ready.`)}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Open Sandbox</span>
              </button>
            </div>
          </div>

          {/* Header Bottom Actions Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
                onClick={onScanAnother}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Scan Another Target</span>
              </button>
              <button
                className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                onClick={() => setShowReportModal(true)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-error">flag</span>
                <span>Report False Positive</span>
              </button>
              <button
                className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                onClick={handleExportJson}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
                <span className="hidden sm:inline">Export Forensic JSON</span>
              </button>
            </div>
            <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
              <span>Verified against 2,400,000 baseline signatures</span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION: Explainable AI & Feature Weights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* LEFT (7 cols): Explainable AI (XAI) Feature Contribution */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-md">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Explainable AI (XAI) Attribution
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Top 5 contributing SHAP features determining the classification outcome.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-code-mono text-code-mono">
                SHAP TreeExplainer
              </span>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-space-lg py-1 text-on-surface-variant font-label-sm text-label-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-error"></span>
                <span>Forces Towards Phishing (+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-on-tertiary-container"></span>
                <span>Forces Towards Legitimate (-)</span>
              </div>
            </div>
            {/* SHAP Horizontal Bars Stack */}
            <div className="flex flex-col gap-space-md mt-1" id="shapBarsContainer">
              {currentData.shapData.map((item, index) => (
                <div key={index} className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-low/70">
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="font-label-md text-label-md font-semibold">{item.name}</span>
                    <span className={`font-code-mono text-code-mono font-semibold ${item.textColor}`}>
                      {item.impact} Attribution
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: item.width }}
                    ></div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT (5 cols): Diagnostic Radar & Model Metadata Bento */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            {/* Model Execution Snapshot */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Telemetry &amp; Engine</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold uppercase">
                  Active Inference
                </span>
              </div>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Ensemble Model</span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">XGBoost + LightGBM</span>
                  <span className="font-code-mono text-[11px] text-secondary">Tree Depth: 8</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Training Corpus</span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">UCI PhiUSIIL 2024</span>
                  <span className="font-code-mono text-[11px] text-on-surface-variant">235,795 URLs</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">ROC-AUC Score</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">0.9942</span>
                  <span className="font-code-mono text-[11px] text-tertiary-container font-medium">99.42% Discrimination</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Inference Execution</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">42.8 ms</span>
                  <span className="font-code-mono text-[11px] text-on-surface-variant">Local CPU Tensor</span>
                </div>
              </div>
              {/* Feature Categories Radar Representation */}
              <div className="mt-space-xs p-space-sm rounded-xl bg-surface-container flex flex-col gap-space-xs">
                <div className="flex items-center justify-between text-on-surface font-label-sm text-label-sm">
                  <span className="font-semibold uppercase tracking-wider">Vector Category Weight Breakdown</span>
                  <span className="font-code-mono text-code-mono">58 Total Vectors</span>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface-variant">
                      <span>URL Lexical Structure (22)</span>
                      <span className="font-code-mono text-code-mono text-on-surface font-medium">45%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface-variant">
                      <span>Domain &amp; DNS Reputation (18)</span>
                      <span className="font-code-mono text-code-mono text-on-surface font-medium">35%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary-container rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface-variant">
                      <span>Security &amp; Protocol Integrity (18)</span>
                      <span className="font-code-mono text-code-mono text-on-surface font-medium">20%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary-container rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Academic Sandbox Note */}
            <div className="p-space-md rounded-2xl bg-secondary-fixed/30 flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">school</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-md text-label-md font-semibold text-primary">Capstone Research Note</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  The PhiUSIIL model evaluates zero-day URLs by decomposing them into invariant syntactic patterns, minimizing false negatives from newly spun fast-flux domains.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED EXTRACTED FEATURES INSPECTION TABLE */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">format_list_bulleted</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Extracted Feature Analysis Matrix
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Detailed parameter inspection of extracted lexical, network, and syntactic vectors for this specific target.
              </p>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Showing Top 9 / 58 Features</span>
              </div>
            </div>
          </div>

          {/* Feature Table (No Borders, Using Contrast Shifts) */}
          <div className="w-full overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[680px]">
              <thead>
                <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Feature Name</th>
                  <th className="py-3 px-4">Vector Domain</th>
                  <th className="py-3 px-4">Extracted Value</th>
                  <th className="py-3 px-4">Threshold Benchmark</th>
                  <th className="py-3 px-4 rounded-r-lg">Threat Posture</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm" id="featuresTableBody">
                {currentData.features.map((f, i) => {
                  const bg = i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40';
                  const valColor = f.risky ? 'text-error font-medium' : 'text-on-surface';

                  return (
                    <tr key={i} className={`${bg} hover:bg-surface-container-low transition-colors`}>
                      <td className="py-3.5 px-4 font-semibold text-on-surface">{f.name}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">{f.domain}</td>
                      <td className={`py-3.5 px-4 font-code-mono text-code-mono ${valColor}`}>{f.val}</td>
                      <td className="py-3.5 px-4 font-code-mono text-code-mono text-on-surface-variant">{f.bench}</td>
                      <td className="py-3.5 px-4">
                        {f.risky ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            <span>Risky</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Normal</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECONDARY VARIANT DISPLAY STRIP (Preview Snapshots) */}
        <div className="flex flex-col gap-space-sm mt-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">style</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Benchmark Variant Comparison
              </h3>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Simultaneous UI Style Inspector</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Snapshot 1: Verified Safe (stanford.edu) */}
            <div
              className="cursor-pointer group p-space-md rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low shadow-sm flex flex-col gap-space-sm transition-all"
              onClick={() => handleSwitchState('safe')}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold uppercase">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>VERIFIED SAFE</span>
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-tertiary-container">99.1%</span>
              </div>
              <div className="flex flex-col">
                <span className="font-code-mono text-code-mono font-medium text-on-surface truncate">
                  https://cs.stanford.edu/research/ai
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  High-reputation .edu apex domain, valid Let's Encrypt TLS v1.3, clean Tranco top 500 ranking.
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 font-label-sm text-label-sm text-primary group-hover:underline">
                <span>Load Safe state preview</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>

            {/* Snapshot 2: Suspicious Warning (bit.ly link) */}
            <div
              className="cursor-pointer group p-space-md rounded-2xl bg-surface-container-lowest hover:bg-surface-container-low shadow-sm flex flex-col gap-space-sm transition-all"
              onClick={() => handleSwitchState('suspicious')}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold uppercase">
                  <span className="material-symbols-outlined text-[15px]">warning_amber</span>
                  <span>SUSPICIOUS WARNING</span>
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-secondary-container">68.2%</span>
              </div>
              <div className="flex flex-col">
                <span className="font-code-mono text-code-mono font-medium text-on-surface truncate">
                  https://bit.ly/3xZ9wQk?redirect=secure
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Shortened link masking final hop. SSL present but domain redirect chains trigger caution flags.
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 font-label-sm text-label-sm text-secondary group-hover:underline">
                <span>Load Suspicious state preview</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report False Positive Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-6 max-w-lg w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-headline-sm font-semibold">
                <span className="material-symbols-outlined text-error">flag</span>
                <span>Report Classification Discrepancy</span>
              </div>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportFeedback('');
                }}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Submit feedback to help refine the model's weights and reduce false positives for:
            </p>
            <div className="p-2.5 rounded-lg bg-surface-container font-code-mono text-[12px] truncate">
              {customScannedUrl || currentData.targetUrl}
            </div>
            <textarea
              className="w-full h-24 p-3 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Describe why this classification appears inaccurate (e.g., trusted internal intranet, new authorized brand partner domain)..."
              value={reportFeedback}
              onChange={(e) => setReportFeedback(e.target.value)}
            ></textarea>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md cursor-pointer"
                onClick={() => {
                  setShowReportModal(false);
                  setReportFeedback('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                onClick={() => {
                  alert('Thank you! Telemetry report submitted for re-training verification.');
                  setShowReportModal(false);
                  setReportFeedback('');
                }}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
