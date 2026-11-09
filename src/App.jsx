import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScannerView from './components/ScannerView';
import ResultsView from './components/ResultsView';
import ModelInsightsView from './components/ModelInsightsView';
import AboutView from './components/AboutView';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [currentVerdictState, setCurrentVerdictState] = useState('phishing');
  const [customScannedUrl, setCustomScannedUrl] = useState('');

  const handleScanComplete = (url, verdict) => {
    setCustomScannedUrl(url);
    setCurrentVerdictState(verdict);
    setActiveTab('results-and-analysis');
  };

  const handleSelectSample = (stateKey, url) => {
    setCurrentVerdictState(stateKey);
    setCustomScannedUrl(url);
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
            onSelectSample={handleSelectSample}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'results-and-analysis' && (
          <ResultsView
            currentStateKey={currentVerdictState}
            onStateChange={(stateKey) => setCurrentVerdictState(stateKey)}
            onScanAnother={handleScanAnother}
            customScannedUrl={customScannedUrl}
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
