import React, { useEffect, useState } from 'react';
import { getModelInfo } from '../api';

const LABELS = {
  IsHTTPS: 'Uses HTTPS', DomainLength: 'Domain length', LetterRatioInURL: 'Letter ratio',
  URLLength: 'URL length', NoOfOtherSpecialCharsInURL: 'Special characters',
  NoOfDegitsInURL: 'Digits in URL', DegitRatioInURL: 'Digit ratio', NoOfLettersInURL: 'Letters in URL',
  TLD: 'Top-level domain', NoOfSubDomain: 'Number of subdomains',
};

const pct = (x, d = 2) => `${(x * 100).toFixed(d)}%`;

export default function ModelInsightsView({ setActiveTab }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getModelInfo().then(setInfo).catch((e) => setError(e.message));
  }, []);

  const ev = info?.evaluation;
  const cm = ev?.confusion_matrix; // rows: actual Phishing / Legitimate

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-2">
          <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface">Model Insights</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            An XGBoost classifier trained on 19 features computed from the URL text of the PhiUSIIL dataset (~235K URLs).
            All figures below are measured on this dataset's held-out test split, not on real-world traffic.
          </p>
          <button type="button" onClick={() => setActiveTab('scanner')} className="w-fit px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md cursor-pointer">
            Back to scanner
          </button>
        </div>

        {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container font-body-sm" role="alert">{error}</div>}
        {!info && !error && <p className="font-body-sm text-on-surface-variant">Loading model details…</p>}

        {info && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
              {[
                ['Test accuracy', pct(ev.accuracy)],
                ['Phishing F1', pct(ev.phishing_f1)],
                ['ROC-AUC', ev.roc_auc.toFixed(5)],
                ['Test URLs', info.data.test.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">{label}</span>
                  <span className="font-headline-md text-headline-md font-bold text-primary">{value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Which features matter most</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{info.global_importance_note}</p>
                </div>
                {info.global_importance.map((f, i) => (
                  <div key={f.feature} className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-low/70">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md font-semibold">{i + 1}. {LABELS[f.feature] || f.feature}</span>
                      <span className="font-code-mono text-code-mono text-secondary">{(f.share * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(f.share / info.global_importance[0].share) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-sm">
                  <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Test-set confusion matrix</h4>
                  <div className="grid grid-cols-2 gap-2 text-center pt-2">
                    <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#10b981]/30">
                      <span className="font-headline-sm font-bold text-[#065f46] block">{cm[0][0].toLocaleString()}</span>
                      <span className="text-[11px] text-[#065f46] uppercase">Phishing caught</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#fef2f2] border border-error/30">
                      <span className="font-headline-sm font-bold text-error block">{cm[0][1].toLocaleString()}</span>
                      <span className="text-[11px] text-error uppercase">Phishing missed</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#fef2f2] border border-error/30">
                      <span className="font-headline-sm font-bold text-error block">{cm[1][0].toLocaleString()}</span>
                      <span className="text-[11px] text-error uppercase">Legitimate flagged</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#10b981]/30">
                      <span className="font-headline-sm font-bold text-[#065f46] block">{cm[1][1].toLocaleString()}</span>
                      <span className="text-[11px] text-[#065f46] uppercase">Legitimate passed</span>
                    </div>
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant text-center">
                    Phishing precision {pct(ev.phishing_precision)} · recall {pct(ev.phishing_recall)}
                  </span>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-2">
                  <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Model comparison (validation accuracy)</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    XGBoost {pct(ev.validation_accuracy, 3)} vs Random Forest {pct(ev.random_forest_validation_accuracy, 3)}. XGBoost was chosen.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#fffbeb] text-[#92400e] rounded-2xl p-space-md sm:p-space-lg flex flex-col gap-2">
              <h3 className="font-headline-sm text-headline-sm font-semibold">Known limitations</h3>
              <ul className="list-disc pl-5 font-body-sm text-body-sm">
                {info.limitations.map((l) => <li key={l}>{l}</li>)}
                <li>In the training data every legitimate URL is a bare https://www.domain homepage, and every http:// URL is phishing, so real sites with paths, queries or no "www." are often flagged.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
