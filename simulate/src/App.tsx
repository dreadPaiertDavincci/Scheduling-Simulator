import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { TimelineArea } from './components/TimelineArea';
import StatisticsPanel from './components/StatisticsPanel';
import Navbar from './components/Navbar';
import DataStructures from './components/DataStructures';
import ArrayVisualizer from './components/ArrayVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import StackVisualizer from './components/StackVisualizer';
import QueueVisualizer from './components/QueueVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import TreeVisualizer from './components/TreeVisualizer';
import { SimulationProvider } from './hooks/useSimulation';

export type ViewType = 'scheduler' | 'data-structures' | 'array-visualizer' | 'linked-list-visualizer' | 'stack-visualizer' | 'queue-visualizer' | 'graph-visualizer' | 'tree-visualizer';

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
        activeTab={(activeTab === 'array-visualizer' || activeTab === 'linked-list-visualizer' || activeTab === 'stack-visualizer' || activeTab === 'queue-visualizer' || activeTab === 'graph-visualizer' || activeTab === 'tree-visualizer') ? 'data-structures' : activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
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
            <ArrayVisualizer onBack={() => setActiveTab('data-structures')} />
          ) : activeTab === 'linked-list-visualizer' ? (
            <LinkedListVisualizer onBack={() => setActiveTab('data-structures')} />
          ) : activeTab === 'stack-visualizer' ? (
            <StackVisualizer onBack={() => setActiveTab('data-structures')} />
          ) : activeTab === 'queue-visualizer' ? (
            <QueueVisualizer onBack={() => setActiveTab('data-structures')} />
          ) : activeTab === 'graph-visualizer' ? (
            <GraphVisualizer onBack={() => setActiveTab('data-structures')} />
          ) : activeTab === 'tree-visualizer' ? (
            <TreeVisualizer onBack={() => setActiveTab('data-structures')} />
          ) : (
            <DataStructures 
              onOpenVisualizer={() => setActiveTab('array-visualizer')} 
              onOpenLinkedList={() => setActiveTab('linked-list-visualizer')}
              onOpenStack={() => setActiveTab('stack-visualizer')}
              onOpenQueue={() => setActiveTab('queue-visualizer')}
              onOpenGraph={() => setActiveTab('graph-visualizer')}
              onOpenTree={() => setActiveTab('tree-visualizer')}
            />
          )}
        </div>
      </div>
    </SimulationProvider>
  );
}

export default App;
