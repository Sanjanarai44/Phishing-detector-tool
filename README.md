# PhishGuard - AI Phishing Detection Suite 🛡️

PhishGuard is an explainable machine learning platform engineered to detect zero-day phishing attacks, credential harvesting endpoints, and brand impersonation in real-time. Built on the **UCI PhiUSIIL Phishing Dataset (235,795 URLs)** with an ensemble of **XGBoost 2.4.1 + LightGBM** and **SHAP TreeExplainer** attribution.

---

## 🚀 Key Features

- **Live Zero-Day Scanner**:
  - RFC 3986 URL lexical tokenization and normalization
  - Real-time 3-stage scanning progression pipeline
  - Instant classification with inference latency under 50ms
- **Explainable AI (XAI)**:
  - Top 5 SHAP feature contribution breakdown with directional force attribution (+ push towards phishing, - push towards legitimate)
  - Extracted feature analysis matrix with benchmark thresholds
- **Multi-State Interactive Simulation**:
  - Pre-calibrated inspection modes for **Phishing (97.4%)**, **Suspicious (68.2%)**, and **Verified Safe (99.1%)**
  - Interactive SVG confidence ring gauge with dynamic animated offsets
- **Forensic Export & Reporting**:
  - One-click export of structured forensic JSON telemetry
  - False positive reporting dialog
- **Dark Mode & Responsive UI**:
  - Full light/dark mode support with persistent state
  - Seamless responsive layout across mobile and desktop

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3.4
- **Typography**: Inter, JetBrains Mono, Material Symbols Outlined
- **ML Architecture**: Stacking Ensemble (XGBoost v2 + LightGBM) + Logistic Regression Meta-Learner + SHAP TreeExplainer
- **Dataset**: UCI Machine Learning Repository (PhiUSIIL Phishing URL Dataset, 2024)

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 📂 Project Structure

```
Phishing-detector-tool/
├── index.html                  # HTML entry point with Google Fonts & Material Symbols
├── package.json                # Project dependencies & scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Design system tokens, color palette & typography
├── vite.config.js              # Vite React configuration
├── .gitignore                  # Git ignore rules
├── src/
│   ├── App.jsx                 # Main application controller & tab navigation
│   ├── index.css               # Base Tailwind layers & global styling
│   ├── main.jsx                # React root mount
│   ├── components/
│   │   ├── Header.jsx          # Top navigation bar, engine status & theme toggle
│   │   ├── Footer.jsx          # Academic citations & repository links
│   │   ├── ScannerView.jsx     # URL scanner cockpit, quick try & live progression
│   │   ├── ResultsView.jsx     # Dynamic verdict card, SHAP XAI & feature matrix
│   │   ├── ModelInsightsView.jsx # ML architecture, confusion matrix & baseline benchmarks
│   │   └── AboutView.jsx       # Capstone overview, attack vectors & citations
│   └── data/
│       └── verdictData.js      # Simulation datasets, SHAP weights & telemetry rows
```

---
