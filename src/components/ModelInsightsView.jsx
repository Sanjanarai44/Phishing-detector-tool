import React, { useEffect, useState } from 'react';
import { getModelInfo } from '../api';

const LABELS = {
  IsHTTPS: 'Uses HTTPS',
  DomainLength: 'Domain Length',
  LetterRatioInURL: 'Letter Ratio in URL',
  URLLength: 'URL Length',
  NoOfOtherSpecialCharsInURL: 'Special Characters Count',
  NoOfDegitsInURL: 'Digits in URL',
  DegitRatioInURL: 'Digit Ratio in URL',
  NoOfLettersInURL: 'Letters in URL',
  TLD: 'Top-Level Domain',
  NoOfSubDomain: 'Number of Subdomains',
};

const FALLBACK_MODEL_INFO = {
  name: "XGBoost (sklearn Pipeline)",
  version: "1.0",
  n_features: 19,
  feature_type: "URL text only (page is never fetched)",
  classes: { "0": "Phishing", "1": "Legitimate" },
  evaluation: {
    scope: "held-out test split of the PhiUSIIL-derived dataset (33,953 rows)",
    accuracy: 0.99741,
    phishing_precision: 0.99945,
    phishing_recall: 0.99451,
    phishing_f1: 0.99697,
    roc_auc: 0.99895,
    confusion_matrix: [[14492, 80], [8, 19373]],
    validation_accuracy: 0.99773,
    random_forest_validation_accuracy: 0.99725
  },
  data: {
    source: "PhiUSIIL phishing URL dataset (~235K URLs)",
    train: 168422,
    validation: 33420,
    test: 33953,
    legitimate_share: 0.57
  },
  global_importance: [
    { feature: "IsHTTPS", mean_abs_contribution: 3.51, share: 0.218 },
    { feature: "DomainLength", mean_abs_contribution: 3.323, share: 0.207 },
    { feature: "LetterRatioInURL", mean_abs_contribution: 2.287, share: 0.142 },
    { feature: "URLLength", mean_abs_contribution: 2.105, share: 0.131 },
    { feature: "NoOfOtherSpecialCharsInURL", mean_abs_contribution: 1.513, share: 0.094 },
    { feature: "NoOfDegitsInURL", mean_abs_contribution: 0.653, share: 0.041 },
    { feature: "DegitRatioInURL", mean_abs_contribution: 0.608, share: 0.038 },
    { feature: "NoOfLettersInURL", mean_abs_contribution: 0.547, share: 0.034 }
  ],
  global_importance_note: "Mean |contribution| over a 10,000-row sample; TLD columns summed.",
  limitations: [
    "Not a guarantee of real-world accuracy.",
    "Dataset bias: http:// URLs, long paths and many dots look phishing-like.",
    "Cannot see page content, domain age or certificates."
  ]
};

const pct = (x, d = 2) => `${(x * 100).toFixed(d)}%`;

export default function ModelInsightsView({ setActiveTab }) {
  const [info, setInfo] = useState(FALLBACK_MODEL_INFO);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    getModelInfo()
      .then((data) => {
        setInfo(data);
        setIsLive(true);
      })
      .catch(() => {
        // Retain fallback benchmark values
        setIsLive(false);
      });
  }, []);

  const ev = info?.evaluation;
  const cm = ev?.confusion_matrix;

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Banner */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider font-semibold w-fit">
              <span className="material-symbols-outlined text-[16px]">insights</span>
              <span>Model Telemetry &amp; XAI</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-semibold text-on-surface tracking-tight mt-1">
              Machine Learning Architecture &amp; Insights
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              An XGBoost classifier trained on 19 features computed from the URL text of the PhiUSIIL dataset (~235K URLs).
              All performance metrics below are evaluated on the benchmark's held-out test split of 33,953 records.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-[12px] ${
              isLive ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-on-surface-variant'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-on-tertiary-container animate-pulse' : 'bg-outline'}`}></span>
              <span>{isLive ? 'Backend API: Live' : 'Backend API: Standby'}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md cursor-pointer hover:bg-primary transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Open Scanner</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
          {[
            ['Test Set Accuracy', pct(ev.accuracy), 'Held-out PhiUSIIL split', '33,953 test URLs'],
            ['Phishing F1 Score', pct(ev.phishing_f1), 'Harmonic mean of precision & recall', 'Precision: ' + pct(ev.phishing_precision)],
            ['ROC-AUC Score', ev.roc_auc.toFixed(5), 'True vs False Positive rate', 'Near-ideal discrimination'],
            ['Validation Accuracy', pct(ev.validation_accuracy), 'XGBoost cross-validation', 'vs Random Forest: ' + pct(ev.random_forest_validation_accuracy)],
          ].map(([label, value, sub, note]) => (
            <div key={label} className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">{label}</span>
              <span className="font-headline-lg text-headline-lg font-bold text-primary">{value}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">{sub}</span>
              <span className="font-code-mono text-[11px] text-[#065f46] font-medium">{note}</span>
            </div>
          ))}
        </div>

        {/* 2-Column: Feature Importance & Confusion Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left: Global SHAP Feature Importance */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">bar_chart</span>
                <span>Global Feature Attribution (Mean |SHAP|)</span>
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {info.global_importance_note}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-1">
              {info.global_importance.map((f, i) => (
                <div key={f.feature} className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-low/70">
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="font-label-md text-label-md font-semibold">
                      {i + 1}. {LABELS[f.feature] || f.feature}
                    </span>
                    <span className="font-code-mono text-code-mono text-secondary font-semibold">
                      {(f.share * 100).toFixed(1)}% Weight
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(f.share / info.global_importance[0].share) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between font-label-sm text-[11px] text-on-surface-variant">
                    <span>Mean log-odds magnitude: {f.mean_abs_contribution.toFixed(3)}</span>
                    <span className="font-code-mono">Feature ID: {f.feature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Confusion Matrix & Model Comparison */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            {/* Confusion Matrix Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-sm">
              <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Test Set Confusion Matrix
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center pt-2">
                <div className="p-3.5 rounded-xl bg-[#ecfdf5] border border-[#10b981]/30 flex flex-col">
                  <span className="font-headline-md font-bold text-[#065f46] block">{cm[0][0].toLocaleString()}</span>
                  <span className="text-[11px] text-[#065f46] font-semibold uppercase mt-0.5">Phishing Caught (TP)</span>
                  <span className="text-[10px] text-on-surface-variant">Predicted Phish · Actual Phish</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#fef2f2] border border-error/30 flex flex-col">
                  <span className="font-headline-md font-bold text-error block">{cm[0][1].toLocaleString()}</span>
                  <span className="text-[11px] text-error font-semibold uppercase mt-0.5">Phishing Missed (FN)</span>
                  <span className="text-[10px] text-on-surface-variant">Predicted Legit · Actual Phish</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#fef2f2] border border-error/30 flex flex-col">
                  <span className="font-headline-md font-bold text-error block">{cm[1][0].toLocaleString()}</span>
                  <span className="text-[11px] text-error font-semibold uppercase mt-0.5">Legit Flagged (FP)</span>
                  <span className="text-[10px] text-on-surface-variant">Predicted Phish · Actual Legit</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#ecfdf5] border border-[#10b981]/30 flex flex-col">
                  <span className="font-headline-md font-bold text-[#065f46] block">{cm[1][1].toLocaleString()}</span>
                  <span className="text-[11px] text-[#065f46] font-semibold uppercase mt-0.5">Legit Passed (TN)</span>
                  <span className="text-[10px] text-on-surface-variant">Predicted Legit · Actual Legit</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-[12px] pt-1">
                <span>Precision: <strong className="text-on-surface">{pct(ev.phishing_precision)}</strong></span>
                <span>Recall: <strong className="text-on-surface">{pct(ev.phishing_recall)}</strong></span>
              </div>
            </div>

            {/* Model Comparison */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-2">
              <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Classifier Selection Benchmark
              </h4>
              <div className="space-y-2 pt-1">
                <div className="p-3 rounded-xl bg-primary-container/10 border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    <span className="font-label-md font-semibold text-primary">XGBoost (Chosen)</span>
                  </div>
                  <span className="font-code-mono font-bold text-primary">{pct(ev.validation_accuracy, 3)}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                  <span className="font-label-md text-on-surface-variant">Random Forest (Baseline)</span>
                  <span className="font-code-mono text-on-surface">{pct(ev.random_forest_validation_accuracy, 3)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Known Limitations Warning Box */}
        <div className="bg-[#fffbeb] text-[#92400e] rounded-2xl p-space-md sm:p-space-lg flex flex-col gap-2 border border-[#f59e0b]/20 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">info</span>
            <h3 className="font-headline-sm text-headline-sm font-semibold">Important Methodology &amp; Dataset Limitations</h3>
          </div>
          <ul className="list-disc pl-5 font-body-sm text-body-sm space-y-1">
            {info.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
            <li>
              In the training data, every legitimate URL is a bare <code className="font-code-mono bg-[#fef3c7] px-1 rounded">https://www.domain</code> homepage, and every <code className="font-code-mono bg-[#fef3c7] px-1 rounded">http://</code> URL is phishing. Consequently, legitimate websites with query parameters, deep paths, or no "www." prefix may trigger elevated risk scores.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
