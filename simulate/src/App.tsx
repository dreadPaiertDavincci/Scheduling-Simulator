import { useState } from 'react';
import Sidebar from './components/Sidebar';
import { TimelineArea } from './components/TimelineArea';
import StatisticsPanel from './components/StatisticsPanel';
import Navbar from './components/Navbar';
import DataStructures from './components/DataStructures';
import { SimulationProvider } from './hooks/useSimulation';

function App() {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'data-structures'>('scheduler');

  return (
    <SimulationProvider>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
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
          ) : (
            <DataStructures />
          )}
        </div>
      </div>
    </SimulationProvider>
  );
}

export default App;
