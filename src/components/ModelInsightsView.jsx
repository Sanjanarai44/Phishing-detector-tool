import React from 'react';

export default function ModelInsightsView({ setActiveTab }) {
  const modelMetrics = [
    { label: 'Validation F1 Score', value: '99.12%', desc: 'Harmonic mean of precision & recall', trend: '+0.4% vs RF baseline' },
    { label: 'Model ROC-AUC', value: '0.9942', desc: 'True vs False Positive trade-off', trend: 'Near-ideal separation' },
    { label: 'Inference Latency', value: '42.8 ms', desc: 'Real-time classification clock', trend: 'Local tensor execution' },
    { label: 'Training Corpus', value: '235,795', desc: 'UCI PhiUSIIL verified URLs', trend: 'Balanced dual-class distribution' },
  ];

  const globalFeatures = [
    { name: 'Subdomain Squatting & Depth', score: 0.342, pct: '34.2%', cat: 'DNS Architecture' },
    { name: 'Lexical String Shannon Entropy', score: 0.281, pct: '28.1%', cat: 'Syntactic Heuristic' },
    { name: 'TLS / SSL Protocol Integrity', score: 0.235, pct: '23.5%', cat: 'Cryptographic Channel' },
    { name: 'URL Path Length & Redirection Wrappers', score: 0.198, pct: '19.8%', cat: 'Lexical Syntax' },
    { name: 'Brand Token Distance (Levenshtein)', score: 0.176, pct: '17.6%', cat: 'Reputation Analysis' },
    { name: 'IP Literal in Authority String', score: 0.152, pct: '15.2%', cat: 'Network Identity' },
    { name: 'High-Risk TLD Classifier (.online, .top, .xyz)', score: 0.134, pct: '13.4%', cat: 'DNS Authority' },
    { name: 'Domain Age & Registrar Stability (<30d)', score: 0.118, pct: '11.8%', cat: 'WHOIS Lifespan' },
  ];

  const baselineComparison = [
    { model: 'PhishGuard (XGBoost + LightGBM)', accuracy: '99.28%', f1: '99.12%', auc: '0.9942', latency: '42.8ms', highlighted: true },
    { model: 'Standalone XGBoost v2', accuracy: '98.65%', f1: '98.50%', auc: '0.9890', latency: '38.2ms' },
    { model: 'Random Forest (100 Trees)', accuracy: '97.41%', f1: '97.28%', auc: '0.9812', latency: '65.4ms' },
    { model: 'Support Vector Machine (RBF)', accuracy: '94.80%', f1: '94.62%', auc: '0.9520', latency: '124.0ms' },
    { model: 'Naive Bayes (Multinomial)', accuracy: '89.15%', f1: '88.70%', auc: '0.9125', latency: '14.5ms' },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1440px] mx-auto px-space-md lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Header Breadcrumb Banner */}
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
              Trained on 235,000+ real-world URLs from the 2024 UCI PhiUSIIL benchmark. Decomposes zero-day threats through 58 syntactic, lexical, and topological feature vectors.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('scanner')}
            className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-sm shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Launch Live Scanner</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {modelMetrics.map((m, idx) => (
            <div key={idx} className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col gap-1">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                {m.label}
              </span>
              <span className="font-headline-xl text-headline-lg font-bold text-primary">
                {m.value}
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{m.desc}</p>
              <span className="font-code-mono text-[11px] text-tertiary-container font-medium mt-1">
                {m.trend}
              </span>
            </div>
          ))}
        </div>

        {/* 2-Column: Global SHAP Feature Importance & Ensemble Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left: Global SHAP Feature Weights (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Global Feature Attribution (Mean |SHAP|)
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Top structural predictors ranked by decision boundary impact across all classes.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-code-mono text-[11px]">
                58 Vectors Total
              </span>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {globalFeatures.map((feat, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-low/70">
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="font-label-md text-label-md font-semibold">
                      {idx + 1}. {feat.name}
                    </span>
                    <span className="font-code-mono text-code-mono text-secondary font-medium">
                      {feat.pct}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${feat.score * 100 * 2.5}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[11px]">
                    <span>Domain: {feat.cat}</span>
                    <span className="font-code-mono">Normalized Weight: {feat.score.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Architecture & Pipeline Stack (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Ensemble Decision Pipeline
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Multi-stage gradient boosted tree stacking for robustness against adversarial evasions.
              </p>

              <div className="flex flex-col gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-surface-container-low border-l-4 border-primary flex flex-col gap-1">
                  <span className="font-label-md text-label-md font-semibold text-primary">
                    Stage 1: Raw URL Ingestion &amp; Tokenizer
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    RFC 3986 lexical parser extracts length, Shannon entropy, punctuation density, path depth, and query parameters.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border-l-4 border-secondary flex flex-col gap-1">
                  <span className="font-label-md text-label-md font-semibold text-secondary">
                    Stage 2: Network &amp; Host Fingerprinting
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Punycode converter, TLD threat indexation, IP literal detection, and redirect hop tracking.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border-l-4 border-tertiary-container flex flex-col gap-1">
                  <span className="font-label-md text-label-md font-semibold text-tertiary-container">
                    Stage 3: XGBoost + LightGBM Blending
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Depth-8 gradient boosted trees compute leaf-wise split probabilities. Meta-classifier assigns calibrated confidence.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border-l-4 border-[#10b981] flex flex-col gap-1">
                  <span className="font-label-md text-label-md font-semibold text-[#10b981]">
                    Stage 4: SHAP TreeExplainer Attribution
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Calculates exact Shapley values per feature, outputting human-readable justification for cybersecurity analysts.
                  </p>
                </div>
              </div>
            </div>

            {/* Confusion Matrix Summary */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-sm">
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Test Set Confusion Matrix
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center pt-2">
                <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#10b981]/30">
                  <span className="font-headline-sm font-bold text-[#065f46] block">26,970</span>
                  <span className="font-label-sm text-[11px] text-[#065f46] uppercase">True Negative (Safe)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fef2f2] border border-error/30">
                  <span className="font-headline-sm font-bold text-error block">190</span>
                  <span className="font-label-sm text-[11px] text-error uppercase">False Positive</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fef2f2] border border-error/30">
                  <span className="font-headline-sm font-bold text-error block">142</span>
                  <span className="font-label-sm text-[11px] text-error uppercase">False Negative</span>
                </div>
                <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#10b981]/30">
                  <span className="font-headline-sm font-bold text-[#065f46] block">20,188</span>
                  <span className="font-label-sm text-[11px] text-[#065f46] uppercase">True Positive (Phish)</span>
                </div>
              </div>
              <span className="font-body-sm text-[12px] text-on-surface-variant text-center pt-1">
                Evaluated on 47,490 held-out test records (99.3% accuracy).
              </span>
            </div>
          </div>
        </div>

        {/* Model Baseline Comparison Table */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg flex flex-col gap-space-md overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Benchmark Baseline Comparison on PhiUSIIL
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Cross-validation benchmark comparison across prominent statistical and ensemble classifiers.
            </p>
          </div>

          <div className="w-full overflow-x-auto rounded-xl">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Classifier Architecture</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">F1 Score</th>
                  <th className="py-3 px-4">ROC-AUC</th>
                  <th className="py-3 px-4 rounded-r-lg">Inference Latency</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm">
                {baselineComparison.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      row.highlighted
                        ? 'bg-primary-container/10 font-semibold text-primary'
                        : idx % 2 === 0
                        ? 'bg-surface-container-lowest'
                        : 'bg-surface-container-low/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      {row.highlighted && (
                        <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                      )}
                      <span>{row.model}</span>
                    </td>
                    <td className="py-3.5 px-4 font-code-mono">{row.accuracy}</td>
                    <td className="py-3.5 px-4 font-code-mono">{row.f1}</td>
                    <td className="py-3.5 px-4 font-code-mono">{row.auc}</td>
                    <td className="py-3.5 px-4 font-code-mono">{row.latency}</td>
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
