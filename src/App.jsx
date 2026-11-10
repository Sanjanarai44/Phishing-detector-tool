import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScannerView from './components/ScannerView';
import ResultsView from './components/ResultsView';
import ModelInsightsView from './components/ModelInsightsView';
import AboutView from './components/AboutView';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [scanResult, setScanResult] = useState(null);
  const [history, setHistory] = useState([]); // this browser session only

  const handleScanComplete = (url, result) => {
    setScanResult(result);
    setHistory((h) => [{ url, verdict: result.verdict, risk: result.phishing_probability, result }, ...h].slice(0, 8));
    setActiveTab('results-and-analysis');
  };

  const handleOpenHistory = (item) => {
    setScanResult(item.result);
    setActiveTab('results-and-analysis');
  };

  const handleScanAnother = () => {
    setActiveTab('scanner');
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="w-full pt-16 bg-background min-h-screen flex-1">
        {activeTab === 'scanner' && (
          <ScannerView
            onScanComplete={handleScanComplete}
            history={history}
            onOpenHistory={handleOpenHistory}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'results-and-analysis' && (
          <ResultsView
            result={scanResult}
            onScanAnother={handleScanAnother}
          />
        )}

        {activeTab === 'model-insights' && (
          <ModelInsightsView setActiveTab={setActiveTab} />
        )}

        {activeTab === 'about' && (
          <AboutView setActiveTab={setActiveTab} />
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
