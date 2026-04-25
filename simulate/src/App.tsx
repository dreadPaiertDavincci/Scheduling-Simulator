import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { TimelineArea } from './components/TimelineArea';
import StatisticsPanel from './components/StatisticsPanel';
import Navbar from './components/Navbar';
import DataStructures from './components/DataStructures';
import ArrayVisualizer from './components/ArrayVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import StackVisualizer from './components/StackVisualizer';
import { SimulationProvider } from './hooks/useSimulation';

export type ViewType = 'scheduler' | 'data-structures' | 'array-visualizer' | 'linked-list-visualizer' | 'stack-visualizer';

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
      <Navbar 
        activeTab={(activeTab === 'array-visualizer' || activeTab === 'linked-list-visualizer' || activeTab === 'stack-visualizer') ? 'data-structures' : activeTab} 
        onTabChange={setActiveTab as any} 
      />
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
          ) : activeTab === 'linked-list-visualizer' ? (
            <LinkedListVisualizer />
          ) : activeTab === 'stack-visualizer' ? (
            <StackVisualizer />
          ) : (
            <DataStructures 
              onOpenVisualizer={() => setActiveTab('array-visualizer')} 
              onOpenLinkedList={() => setActiveTab('linked-list-visualizer')}
              onOpenStack={() => setActiveTab('stack-visualizer')}
            />
          )}
        </div>
      </div>
    </SimulationProvider>
  );
}

export default App;
