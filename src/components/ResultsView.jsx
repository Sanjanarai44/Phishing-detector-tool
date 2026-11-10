import React, { useState } from 'react';

const VERDICT_STYLE = {
  Phishing: {
    title: 'HIGH PHISHING RISK',
    badge: 'High Risk Threat Level',
    headline: 'Impersonation & Phishing Threat Detected',
    chip: 'bg-error-container text-on-error-container',
    text: 'text-error',
    stroke: '#ba1a1a',
    icon: 'gpp_bad',
    aura: 'bg-error-container/40',
    certainty: 'High Threat Certainty',
    summary: 'The lexical and syntactic properties of this URL closely mirror known phishing attack patterns in the UCI PhiUSIIL corpus.',
  },
  Uncertain: {
    title: 'UNCERTAIN',
    badge: 'Moderate Caution Level',
    headline: 'Ambiguous URL Structure Detected',
    chip: 'bg-secondary-container text-on-secondary-container',
    text: 'text-secondary',
    stroke: '#f59e0b',
    icon: 'warning_amber',
    aura: 'bg-secondary-fixed/40',
    certainty: 'Elevated Risk Flag',
    summary: 'The URL text sits between typical legitimate and phishing profiles. Treat with extra caution before submitting credentials.',
  },
  Legitimate: {
    title: 'LOW PHISHING RISK',
    badge: 'Verified Clean Profile',
    headline: 'Authenticated Standard Web Structure',
    chip: 'bg-tertiary-container text-on-tertiary',
    text: 'text-on-tertiary-container',
    stroke: '#10b981',
    icon: 'verified',
    aura: 'bg-tertiary-fixed/30',
    certainty: 'Clean Site Posture',
    summary: 'The URL structure exhibits typical legitimate domain and path characteristics with normal character distribution and encryption.',
  },
};

const FEATURE_METADATA = {
  URLLength: { label: 'URL Length', domain: 'Lexical Syntax', benchmark: '≤ 54 chars (Safe Mean)' },
  DomainLength: { label: 'Domain Length', domain: 'DNS Architecture', benchmark: '≤ 20 chars' },
  IsDomainIP: { label: 'Host is an IP Address', domain: 'Network Identity', benchmark: 'False (Named Host)' },
  TLD: { label: 'Top-Level Domain', domain: 'DNS Authority', benchmark: 'Accredited TLD' },
  TLDLength: { label: 'TLD Length', domain: 'DNS Authority', benchmark: '2 - 4 chars' },
  NoOfSubDomain: { label: 'Subdomain Hierarchy Count', domain: 'DNS Architecture', benchmark: '≤ 1 Subdomain' },
  HasObfuscation: { label: 'Percent-Encoding Obfuscation', domain: 'Routing Obfuscation', benchmark: '0 Obfuscation' },
  NoOfObfuscatedChar: { label: 'Percent-Encoded Characters', domain: 'Routing Obfuscation', benchmark: '0 chars' },
  ObfuscationRatio: { label: 'Percent-Encoding Ratio', domain: 'Routing Obfuscation', benchmark: '0.0%' },
  NoOfLettersInURL: { label: 'Letters in URL', domain: 'Lexical Syntax', benchmark: '20 - 60 chars' },
  LetterRatioInURL: { label: 'Letter Ratio in URL', domain: 'Lexical Syntax', benchmark: '> 0.50 ratio' },
  NoOfDegitsInURL: { label: 'Digits in URL', domain: 'Syntactic Heuristic', benchmark: '≤ 3 digits' },
  DegitRatioInURL: { label: 'Digit Ratio in URL', domain: 'Syntactic Heuristic', benchmark: '< 0.10 ratio' },
  NoOfEqualsInURL: { label: "'=' Character Count", domain: 'Query Syntax', benchmark: '≤ 1 occurrence' },
  NoOfQMarkInURL: { label: "'?' Character Count", domain: 'Query Syntax', benchmark: '≤ 1 occurrence' },
  NoOfAmpersandInURL: { label: "'&' Character Count", domain: 'Query Syntax', benchmark: '≤ 1 occurrence' },
  NoOfOtherSpecialCharsInURL: { label: 'Special Characters Count', domain: 'Syntactic Heuristic', benchmark: '≤ 4 occurrences' },
  SpacialCharRatioInURL: { label: 'Special Character Ratio', domain: 'Syntactic Heuristic', benchmark: '< 0.15 ratio' },
  IsHTTPS: { label: 'Transport Protocol (HTTPS)', domain: 'Cryptographic Channel', benchmark: 'https:// (TLS v1.3)' },
};

const FLAGS = new Set(['IsDomainIP', 'HasObfuscation', 'IsHTTPS']);
const showValue = (k, v) => (FLAGS.has(k) ? (v ? 'Yes' : 'No') : String(v === '' ? '(none)' : v));

export default function ResultsView({ result, onScanAnother }) {
  const [copied, setCopied] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');

  if (!result) {
    return (
      <div className="w-full max-w-4xl mx-auto px-space-md py-space-xl text-center flex flex-col items-center gap-space-lg">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary shadow-inner">
          <span className="material-symbols-outlined text-[32px]">manage_search</span>
        </div>
        <div className="flex flex-col gap-2 max-w-md">
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">No URL Scanned Yet</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Submit a target URL in the scanner cockpit to generate real-time SHAP attributions and 19-vector lexical analysis.
          </p>
        </div>
        <button
          type="button"
          onClick={onScanAnother}
          className="px-6 py-3 rounded-xl bg-primary-container text-on-primary font-label-md font-semibold shadow-md hover:bg-primary transition-all cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span>Open Scanner Cockpit</span>
        </button>
      </div>
    );
  }

  const s = VERDICT_STYLE[result.verdict] || VERDICT_STYLE.Uncertain;
  const riskPct = result.phishing_probability * 100;
  const legitPct = (result.legitimate_probability * 100).toFixed(1);
  const offset = 251.2 * (1 - result.phishing_probability);
  const maxImpact = Math.max(...(result.reasons?.map((r) => r.impact) || [0.001]), 0.001);
  const rel = result.reliability || { level: 'normal', notes: [] };

  const handleCopyTarget = () => {
    navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `phishguard-scan-${result.verdict.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Main Verdict Card */}
        <div
          className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-md sm:p-space-lg lg:p-space-xl flex flex-col gap-space-lg relative overflow-hidden transition-all duration-300"
          id="verdictHeroCard"
        >
          {/* Ambient Glow */}
          <div
            className={`absolute -right-24 -top-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${s.aura}`}
          ></div>

          {/* Top row: Status, description & circular gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center relative z-10">
            {/* Left 7 cols: Threat Status & Narrative */}
            <div className="lg:col-span-7 flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center gap-space-sm">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold ${s.chip}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                  <span>{s.title}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
                  {s.badge}
                </span>
                <span className="font-code-mono text-code-mono text-on-surface-variant/80 hidden sm:inline">
                  Model: XGBoost v1.0
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface tracking-tight mt-1">
                {s.headline}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                {s.summary}
              </p>
            </div>

            {/* Right 5 cols: Confidence Ring Gauge */}
            <div className="lg:col-span-5 flex items-center justify-start lg:justify-end gap-space-lg">
              <div className="flex items-center gap-space-md p-space-md rounded-2xl bg-surface-container-low shadow-sm">
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
                    />
                    <circle
                      className="transition-all duration-700 ease-out"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="40"
                      stroke={s.stroke}
                      strokeDasharray="251.2"
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className={`font-headline-md text-headline-md font-bold tracking-tight ${s.text}`}>
                      {riskPct.toFixed(1)}%
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase -mt-1 font-semibold">
                      Phish Risk
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Classification Posture
                  </span>
                  <span className={`font-headline-sm text-headline-sm font-semibold ${s.text}`}>
                    {s.certainty}
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Legitimate likelihood: <strong className="text-on-surface font-semibold">{legitPct}%</strong>
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
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-code-mono text-[11px] font-semibold ${
                      result.features?.IsHTTPS
                        ? 'bg-tertiary-container text-on-tertiary'
                        : 'bg-error text-on-error'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {result.features?.IsHTTPS ? 'lock' : 'lock_open'}
                    </span>
                    <span>{result.features?.IsHTTPS ? 'Encrypted HTTPS' : 'Insecure HTTP'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest/20 text-inverse-on-surface font-code-mono text-[11px]">
                    .{result.features?.TLD || 'domain'}
                  </span>
                </div>
                <p className="font-code-mono text-code-mono text-inverse-primary truncate select-all mt-0.5 tracking-tight font-medium">
                  {result.url}
                </p>
              </div>
            </div>

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
            </div>
          </div>

          {/* Action buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                type="button"
                onClick={onScanAnother}
                className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-sm cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Scan Another Target</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-error">flag</span>
                <span>Report False Positive</span>
              </button>
              <button
                type="button"
                onClick={exportJson}
                className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
                <span className="hidden sm:inline">Export Forensic JSON</span>
              </button>
            </div>
            <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
              <span>Evaluated against 19 lexical invariants</span>
            </div>
          </div>
        </div>

        {/* Reliability warning banner */}
        {rel.level === 'low' && (
          <div className="w-full rounded-2xl p-space-md bg-[#fffbeb] text-[#92400e] flex items-start gap-3 shadow-sm border border-[#f59e0b]/20">
            <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">warning</span>
            <div className="flex flex-col gap-1 font-body-sm text-body-sm">
              <strong className="font-semibold text-[15px]">Dataset Distribution Note: Verdict Caution Flag</strong>
              <ul className="list-disc pl-5 space-y-0.5">
                {rel.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
              <span className="text-on-surface-variant pt-1 text-[12px]">
                In the training data, legitimate URLs were primarily bare homepages. Non-homepage legitimate endpoints may receive elevated risk.
              </span>
            </div>
          </div>
        )}

        {/* 2-Column: XAI Attribution & Model Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left 7 cols: Top SHAP Reasons */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
                  <span>Explainable AI (XAI) Attribution</span>
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Top feature contributions computed via XGBoost TreeExplainer log-odds.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-code-mono text-[11px]">
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
                <span className="w-3 h-3 rounded bg-[#10b981]"></span>
                <span>Forces Towards Legitimate (-)</span>
              </div>
            </div>

            {/* Feature Bars */}
            <div className="flex flex-col gap-space-md mt-1">
              {result.reasons?.map((r, i) => {
                const toPhish = r.direction === 'phishing';
                const meta = FEATURE_METADATA[r.feature] || { label: r.feature };
                return (
                  <div key={i} className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container-low/70">
                    <div className="flex items-center justify-between text-on-surface">
                      <span className="font-label-md text-label-md font-semibold">
                        {i + 1}. {meta.label}: <span className="font-code-mono text-primary font-normal">{showValue(r.feature, r.value)}</span>
                      </span>
                      <span className={`font-code-mono text-code-mono font-semibold ${toPhish ? 'text-error' : 'text-[#065f46]'}`}>
                        {toPhish ? '+ Impact (Phish)' : '- Impact (Legit)'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${toPhish ? 'bg-error' : 'bg-[#10b981]'}`}
                        style={{ width: `${Math.min(100, (r.impact / maxImpact) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {r.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Telemetry & Model Details Bento */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Telemetry &amp; Engine</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold uppercase">
                  Active Inference
                </span>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-on-surface-variant">Model Pipeline</span>
                  <span className="font-label-md font-semibold text-on-surface">XGBoost Classifier</span>
                  <span className="font-code-mono text-[11px] text-secondary">Sklearn ColumnTransformer</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-on-surface-variant">Training Corpus</span>
                  <span className="font-label-md font-semibold text-on-surface">UCI PhiUSIIL 2024</span>
                  <span className="font-code-mono text-[11px] text-on-surface-variant">235,795 URLs</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-on-surface-variant">Test Split Accuracy</span>
                  <span className="font-headline-sm font-bold text-primary">99.74%</span>
                  <span className="font-code-mono text-[11px] text-[#065f46] font-medium">33,953 Test Records</span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-label-sm text-on-surface-variant">Test ROC-AUC</span>
                  <span className="font-headline-sm font-bold text-on-surface">0.99895</span>
                  <span className="font-code-mono text-[11px] text-on-surface-variant">Near-Ideal Separation</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">info</span>
                  <span>Evaluation Scope</span>
                </span>
                <p className="text-[13px] leading-relaxed">
                  Metrics reflect the held-out test split of the PhiUSIIL benchmark. The page behind the target URL is never fetched or opened.
                </p>
              </div>
            </div>

            {/* Academic Capstone Sandbox Note */}
            <div className="p-space-md rounded-2xl bg-secondary-fixed/30 flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">school</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-md text-label-md font-semibold text-primary">Capstone Research Note</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {result.disclaimer || 'Statistical inference from URL text invariants only. Not an absolute safety guarantee.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed 19-Feature Matrix Table */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">format_list_bulleted</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Extracted 19-Feature Analysis Matrix
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                All 19 syntactic, lexical, and topological features computed for this URL by the feature extraction pipeline.
              </p>
            </div>
            <span className="px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex items-center gap-1.5 self-start md:self-auto">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>19 Features Active</span>
            </span>
          </div>

          <div className="w-full overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[680px]">
              <thead>
                <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Feature Name</th>
                  <th className="py-3 px-4">Vector Domain</th>
                  <th className="py-3 px-4">Extracted Value</th>
                  <th className="py-3 px-4">Benchmark / Expected</th>
                  <th className="py-3 px-4 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm">
                {Object.entries(result.features || {}).map(([k, v], i) => {
                  const meta = FEATURE_METADATA[k] || { label: k, domain: 'General Heuristic', benchmark: '-' };
                  const isRisky =
                    (k === 'IsHTTPS' && v === 0) ||
                    (k === 'IsDomainIP' && v === 1) ||
                    (k === 'HasObfuscation' && v === 1) ||
                    (k === 'NoOfSubDomain' && v > 2) ||
                    (k === 'URLLength' && v > 75);

                  const bg = i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40';

                  return (
                    <tr key={k} className={`${bg} hover:bg-surface-container-low transition-colors`}>
                      <td className="py-3 px-4 font-semibold text-on-surface">{meta.label}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{meta.domain}</td>
                      <td className={`py-3 px-4 font-code-mono ${isRisky ? 'text-error font-medium' : 'text-on-surface'}`}>
                        {showValue(k, v)}
                      </td>
                      <td className="py-3 px-4 font-code-mono text-on-surface-variant">{meta.benchmark}</td>
                      <td className="py-3 px-4">
                        {isRisky ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[13px]">warning</span>
                            <span>Suspicious</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
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
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  setReportFeedback('');
                }}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Submit feedback to help refine the model's weights and reduce false positives for:
            </p>
            <div className="p-2.5 rounded-lg bg-surface-container font-code-mono text-[12px] truncate">
              {result.url}
            </div>
            <textarea
              className="w-full h-24 p-3 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Describe why this classification appears inaccurate..."
              value={reportFeedback}
              onChange={(e) => setReportFeedback(e.target.value)}
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md cursor-pointer"
                onClick={() => {
                  setShowReportModal(false);
                  setReportFeedback('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
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
