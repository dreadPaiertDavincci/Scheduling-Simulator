import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { TimelineArea } from './components/TimelineArea';
import StatisticsPanel from './components/StatisticsPanel';
import Navbar from './components/Navbar';
import DataStructures from './components/DataStructures';
import ArrayVisualizer from './components/ArrayVisualizer';
import { SimulationProvider } from './hooks/useSimulation';

export type ViewType = 'scheduler' | 'data-structures' | 'array-visualizer';

function App() {
  const [activeTab, setActiveTab] = useState<ViewType>(() => {
    const saved = sessionStorage.getItem('activeTab');
    return (saved as ViewType) || 'scheduler';
  });

  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  return (
    <SimulationProvider>
      <Navbar activeTab={activeTab === 'array-visualizer' ? 'data-structures' : activeTab} onTabChange={setActiveTab as any} />
      <div className="page-wrapper">
        <div className="left-accent"></div>
        <div className="main-content">
          {activeTab === 'scheduler' ? (
            <>
              <header className="header">
                <h1>
                  The Clinical Editor <span className="version">v2.4</span>
                </h1>
                <p>
                  A high-precision environment for CPU scheduling analysis. Define process workloads,
                  select architectural algorithms, and visualize execution flow with micro-second accuracy.
                </p>
              </header>

              <div className="dashboard-grid">
                <Sidebar />
                <TimelineArea />
              </div>

              <StatisticsPanel />
            </>
          ) : activeTab === 'array-visualizer' ? (
            <ArrayVisualizer />
          ) : (
            <DataStructures onOpenVisualizer={() => setActiveTab('array-visualizer')} />
          )}
        </div>
      </div>
    </SimulationProvider>
  );
}

export default App;
