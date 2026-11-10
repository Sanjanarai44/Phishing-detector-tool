import React from 'react';

const VERDICT_STYLE = {
  Phishing: {
    title: 'HIGH PHISHING RISK',
    chip: 'bg-error-container text-on-error-container',
    text: 'text-error',
    stroke: '#ba1a1a',
    icon: 'gpp_bad',
    summary: 'The URL text resembles the phishing examples this model was trained on.',
  },
  Uncertain: {
    title: 'UNCERTAIN',
    chip: 'bg-secondary-container text-on-secondary-container',
    text: 'text-secondary',
    stroke: '#f59e0b',
    icon: 'help',
    summary: 'The URL text sits between the phishing and legitimate examples. Check it carefully.',
  },
  Legitimate: {
    title: 'LOW PHISHING RISK',
    chip: 'bg-tertiary-container text-on-tertiary',
    text: 'text-tertiary',
    stroke: '#10b981',
    icon: 'verified_user',
    summary: 'The URL text resembles the legitimate examples this model was trained on.',
  },
};

const LABELS = {
  URLLength: 'URL length', DomainLength: 'Domain length', IsDomainIP: 'Host is an IP address',
  TLD: 'Top-level domain', TLDLength: 'TLD length', NoOfSubDomain: 'Number of subdomains',
  HasObfuscation: 'Has percent-encoding', NoOfObfuscatedChar: 'Percent-encoded characters',
  ObfuscationRatio: 'Percent-encoded ratio', NoOfLettersInURL: 'Letters in URL',
  LetterRatioInURL: 'Letter ratio', NoOfDegitsInURL: 'Digits in URL', DegitRatioInURL: 'Digit ratio',
  NoOfEqualsInURL: "'=' count", NoOfQMarkInURL: "'?' count", NoOfAmpersandInURL: "'&' count",
  NoOfOtherSpecialCharsInURL: 'Special characters', SpacialCharRatioInURL: 'Special-character ratio',
  IsHTTPS: 'Uses HTTPS',
};

const FLAGS = new Set(['IsDomainIP', 'HasObfuscation', 'IsHTTPS']);
const showValue = (k, v) => (FLAGS.has(k) ? (v ? 'Yes' : 'No') : String(v === '' ? '(none)' : v));

export default function ResultsView({ result, onScanAnother }) {
  if (!result) {
    return (
      <div className="w-full max-w-3xl mx-auto px-space-md py-space-xl text-center flex flex-col gap-space-md">
        <p className="font-body-md text-body-md text-on-surface-variant">No scan yet. Scan a URL to see its report.</p>
        <button type="button" onClick={onScanAnother} className="mx-auto px-6 py-3 rounded-xl bg-primary-container text-on-primary font-label-md cursor-pointer">
          Scan a URL
        </button>
      </div>
    );
  }

  const s = VERDICT_STYLE[result.verdict] || VERDICT_STYLE.Uncertain;
  const riskPct = result.phishing_probability * 100;
  const offset = 251.2 * (1 - result.phishing_probability);
  const maxImpact = Math.max(...result.reasons.map((r) => r.impact), 0.001);
  const rel = result.reliability || { level: 'normal', notes: [] };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'phishguard-scan.json';
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Verdict card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-md sm:p-space-lg lg:p-space-xl flex flex-col lg:flex-row gap-space-lg items-center justify-between">
          <div className="flex flex-col gap-space-sm min-w-0 flex-1">
            <span className={`inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold uppercase tracking-wider ${s.chip}`}>
              <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
              {s.title}
            </span>
            <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface">{result.verdict}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{s.summary}</p>
            <div className="font-code-mono text-code-mono text-on-surface bg-surface-container-low rounded-xl px-4 py-3 break-all" id="scannedUrl">
              {result.url}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={onScanAnother} className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold cursor-pointer">
                Scan another URL
              </button>
              <button type="button" onClick={exportJson} className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer">
                Export JSON
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="9" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={s.stroke} strokeWidth="9" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={offset} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-headline-lg text-headline-lg font-bold ${s.text}`}>{riskPct.toFixed(1)}%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">phishing probability</span>
              </div>
            </div>
            <span className="font-code-mono text-label-sm text-on-surface-variant">
              Legitimate probability: {(result.legitimate_probability * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Reliability warning */}
        {rel.level === 'low' && (
          <div className="w-full rounded-2xl p-space-md bg-[#fffbeb] text-[#92400e] flex gap-3" role="note">
            <span className="material-symbols-outlined shrink-0">warning</span>
            <div className="flex flex-col gap-1 font-body-sm text-body-sm">
              <strong>This verdict may be unreliable for this kind of URL.</strong>
              <ul className="list-disc pl-5">
                {rel.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
              <span>A real legitimate site can be flagged here. Treat the result as a hint, not proof.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Reasons */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Why this verdict</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Top features that moved this prediction (XGBoost per-feature contributions).</p>
            </div>
            {result.reasons.map((r, i) => {
              const toPhish = r.direction === 'phishing';
              return (
                <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-low/70">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      {i + 1}. {LABELS[r.feature] || r.feature}: <span className="font-code-mono">{showValue(r.feature, r.value)}</span>
                    </span>
                    <span className={`font-code-mono text-code-mono ${toPhish ? 'text-error' : 'text-tertiary'}`}>
                      {toPhish ? '→ phishing' : '→ legitimate'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-full rounded-full ${toPhish ? 'bg-error' : 'bg-tertiary'}`} style={{ width: `${(r.impact / maxImpact) * 100}%` }}></div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{r.explanation}</p>
                </div>
              );
            })}
          </div>

          {/* Model card */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">About this model</h3>
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="p-3 rounded-xl bg-surface-container-low"><span className="font-label-sm text-on-surface-variant block">Model</span><span className="font-label-md font-semibold">XGBoost</span></div>
              <div className="p-3 rounded-xl bg-surface-container-low"><span className="font-label-sm text-on-surface-variant block">Inputs</span><span className="font-label-md font-semibold">19 URL-text features</span></div>
              <div className="p-3 rounded-xl bg-surface-container-low"><span className="font-label-sm text-on-surface-variant block">Test accuracy</span><span className="font-label-md font-semibold">99.74% (this dataset)</span></div>
              <div className="p-3 rounded-xl bg-surface-container-low"><span className="font-label-sm text-on-surface-variant block">ROC-AUC</span><span className="font-label-md font-semibold">0.99895</span></div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Figures come from the dataset's own held-out test split (33,953 URLs), not from real-world traffic. The page behind the URL is never opened.
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{result.disclaimer}</p>
          </div>
        </div>

        {/* Features table */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md overflow-hidden">
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">The 19 features extracted from this URL</h3>
          <div className="w-full overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[420px]">
              <thead>
                <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Value</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm">
                {Object.entries(result.features).map(([k, v], i) => (
                  <tr key={k} className={i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'}>
                    <td className="py-2.5 px-4">{LABELS[k] || k}</td>
                    <td className="py-2.5 px-4 font-code-mono">{showValue(k, v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
