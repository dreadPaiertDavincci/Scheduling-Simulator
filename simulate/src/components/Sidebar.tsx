import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../hooks/useSimulation';

const ALGORITHMS = [
  "First Come First Served (FCFS)",
  "Shortest Job First (SJF)",
  "Shortest Remaining Time First (SRTF)",
  "Round Robin (RR)",
  "Priority Scheduling",
  "Preemptive Priority Scheduling",
  "Non-Preemptive Priority Scheduling",
  "Highest Response Ratio Next (HRRN)",
  "Multilevel Queue Scheduling",
  "Multilevel Feedback Queue (MLFQ)",
  "Completely Fair Scheduler (CFS)",
  "Fair Share Scheduling",
  "Lottery Scheduling",
  "Stride Scheduling",
  "Proportional Share Scheduling",
  "Earliest Deadline First (EDF)",
  "Least Laxity First (LLF)",
  "Maximum Urgency First (MUF)",
  "Rate Monotonic Scheduling (RMS)",
  "Deadline Monotonic Scheduling (DMS)",
  "Earliest Deadline Late (EDL)",
  "Total Bandwidth Server (TBS)",
  "Constant Bandwidth Server (CBS)",
  "Deferrable Server (DS)",
  "Sporadic Server (SS)",
  "Longest Job First (LJF)",
  "Longest Remaining Time First (LRTF)",
  "Shortest Processing Time (SPT)",
  "Longest Processing Time (LPT)",
  "Earliest Due Date (EDD)",
  "Minimum Slack Time (MST)",
  "Critical Ratio Scheduling (CR)",
  "Moore’s Algorithm",
  "Johnson’s Rule",
  "Branch and Bound Scheduling",
  "Dynamic Programming Scheduling",
  "Greedy Scheduling",
  "Genetic Algorithm Scheduling",
  "Simulated Annealing Scheduling",
  "Ant Colony Optimization Scheduling",
  "Particle Swarm Optimization Scheduling",
  "Tabu Search Scheduling",
  "Hill Climbing Scheduling",
  "Min-Min Scheduling",
  "Max-Min Scheduling",
  "Opportunistic Load Balancing (OLB)",
  "Minimum Execution Time (MET)",
  "Minimum Completion Time (MCT)",
  "Heterogeneous Earliest Finish Time (HEFT)",
  "Dynamic Level Scheduling (DLS)",
  "Round Robin Load Balancing",
  "Weighted Round Robin (WRR)",
  "Work Stealing Scheduling",
  "Work Sharing Scheduling",
  "Gang Scheduling",
  "Space Sharing Scheduling",
  "Time Sharing Scheduling",
  "Processor Sharing Scheduling",
  "Weighted Fair Queuing (WFQ)",
  "Deficit Round Robin (DRR)",
  "Priority Queuing (PQ)",
  "Class-Based Queuing (CBQ)",
  "Hierarchical Fair Service Curve (HFSC)",
  "Token Bucket Scheduling",
  "Leaky Bucket Scheduling",
  "Start-Time Fair Queuing (SFQ)",
  "Self-Clocked Fair Queuing (SCFQ)",
  "Elastic Round Robin (ERR)",
  "Credit-Based Scheduling",
  "Virtual Clock Scheduling",
  "Frame-Based Scheduling",
  "Cyclic Executive Scheduling",
  "Static Table Scheduling",
  "Slack Stealing Scheduling",
  "Imprecise Computation Scheduling",
  "Feedback Scheduling",
  "Aging Scheduling",
  "Two-Level Scheduling",
  "Cooperative Scheduling",
  "Preemptive Scheduling",
  "Non-Preemptive Scheduling",
  "Batch Scheduling",
  "Interactive Scheduling",
  "Real-Time Scheduling",
  "Hard Real-Time Scheduling",
  "Soft Real-Time Scheduling",
  "Best-Effort Scheduling",
  "Adaptive Scheduling",
  "Heuristic Scheduling",
  "Metaheuristic Scheduling",
  "Online Scheduling",
  "Offline Scheduling",
  "Deterministic Scheduling",
  "Stochastic Scheduling",
  "Centralized Scheduling",
  "Distributed Scheduling",
  "Decentralized Scheduling",
  "Hierarchical Scheduling",
  "Hybrid Scheduling"
];

export default function Sidebar() {
  const { 
    processes, setProcesses, currentProcesses,
    selectedAlgo, setSelectedAlgo,
    quantum, setQuantum,
    status, runSimulation, play, pause, reset, stepForward, stepBackward 
  } = useSimulation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAdd = () => {
    if (processes.length >= 20) return;
    const newId = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1;
    setProcesses([...processes, { id: newId, arrival: 0, burst: 1, priority: 1, wait: 0, status: 'NEW' }]);
  };

  const handleRandom = () => {
    const count = Math.floor(Math.random() * (10 - 3 + 1)) + 3; // 3 to 10 for better visualization
    const randomProcesses = Array.from({ length: count }).map((_, i) => ({
      id: i + 1,
      arrival: Math.floor(Math.random() * 10),
      burst: Math.floor(Math.random() * 10) + 1,
      priority: Math.floor(Math.random() * 10) + 1,
      wait: 0,
      status: 'NEW'
    }));
    setProcesses(randomProcesses);
  };

  const handleUpdate = (id: number, field: string, value: number) => {
    setProcesses(processes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDelete = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  return (
    <aside className="sidebar">
      <div className="card">
        <h2 className="card-title">Selection Architecture</h2>
        <div className="select-wrapper" ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
          <div 
            className="custom-select-trigger" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ 
              padding: '12px 16px', 
              border: '1px solid #E2E8F0', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: isDropdownOpen ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
              borderColor: isDropdownOpen ? '#3B82F6' : '#E2E8F0',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ color: selectedAlgo ? '#1E293B' : '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedAlgo || "Choose your Algorithm"}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '12px', color: '#94A3B8' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          {isDropdownOpen && (
            <div 
              className="custom-select-dropdown hide-scrollbar" 
              style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                marginTop: '8px', 
                backgroundColor: '#fff', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                zIndex: 50, 
                maxHeight: '280px', 
                overflowY: 'auto' 
              }}
            >
              {ALGORITHMS.map(algo => (
                <div 
                  key={algo} 
                  onClick={() => { setSelectedAlgo(algo); setIsDropdownOpen(false); }}
                  style={{ 
                    padding: '12px 16px', 
                    cursor: 'pointer', 
                    backgroundColor: selectedAlgo === algo ? '#EFF6FF' : 'transparent', 
                    color: selectedAlgo === algo ? '#2563EB' : '#1E293B', 
                    fontSize: '14px', 
                    fontWeight: selectedAlgo === algo ? 600 : 400,
                    transition: 'background-color 0.15s ease' 
                  }}
                  onMouseEnter={(e) => { if (selectedAlgo !== algo) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  onMouseLeave={(e) => { if (selectedAlgo !== algo) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {algo}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="logic-desc" style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
          {selectedAlgo === "First Come First Served (FCFS)" && "Jobs are processed in the strict order they enter the ready queue. Simple, non-preemptive."}
          {selectedAlgo === "Shortest Job First (SJF)" && "Non-preemptive algorithm that selects the waiting process with the smallest execution time."}
          {selectedAlgo === "Shortest Remaining Time First (SRTF)" && "Preemptive version of SJF. The process with the smallest remaining time is executed next."}
          {selectedAlgo === "Round Robin (RR)" && `Each process is assigned a fixed time unit (Quantum: ${quantum}ms) in a cyclic order.`}
          {selectedAlgo.includes("Priority") && "Processes are scheduled based on priority (lower value = higher priority)."}
          {selectedAlgo === "Highest Response Ratio Next (HRRN)" && "Non-preemptive. Prioritizes processes with higher (Wait + Burst) / Burst ratio to prevent starvation."}
          {selectedAlgo === "Longest Job First (LJF)" && "Non-preemptive. Selects the process with the longest burst time first."}
          {selectedAlgo === "Longest Remaining Time First (LRTF)" && "Preemptive. Always executes the process with the longest remaining time."}
          {!selectedAlgo && "Select an algorithm to see its scheduling logic."}
        </p>

        {selectedAlgo === "Round Robin (RR)" && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Time Quantum:</label>
            <input 
              type="number" 
              min="1" 
              value={quantum} 
              onChange={(e) => setQuantum(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '60px', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}
            />
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Process Workload</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add</button>
            <button className="btn btn-soft btn-sm" onClick={handleRandom}>Random</button>
          </div>
        </div>

        <div className="process-table">
          <div className="header-row" style={{ gridTemplateColumns: selectedAlgo.includes('Priority') ? '0.6fr 1.2fr 1.2fr 0.8fr 0.8fr 1.2fr 0.5fr' : '0.8fr 1.5fr 1.5fr 1fr 1.5fr 0.5fr', paddingRight: '8px' }}>
            <div>PID</div>
            <div>Arrival</div>
            <div>Burst</div>
            {selectedAlgo.includes('Priority') && <div>Pri</div>}
            <div>Wait</div>
            <div>Status</div>
            <div></div>
          </div>
          <div className="process-list hide-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {currentProcesses.map((p: any, idx: number) => {
              const statusClass = `status-${(p.status || 'new').toLowerCase()}`;
              const colors = [
                'var(--p1-color)', 'var(--p2-color)', 'var(--p3-color)', 'var(--p4-color)',
                'var(--p5-color)', 'var(--p6-color)', 'var(--p7-color)', 'var(--p8-color)',
                'var(--p9-color)', 'var(--p10-color)'
              ];
              const color = colors[idx % 10];
              
              return (
                <div className="process-row" key={p.id} style={{ gridTemplateColumns: selectedAlgo.includes('Priority') ? '0.6fr 1.2fr 1.2fr 0.8fr 0.8fr 1.2fr 0.5fr' : '0.8fr 1.5fr 1.5fr 1fr 1.5fr 0.5fr' }}>
                  <div style={{ color, fontWeight: 700 }}>P{p.id}</div>
                  <div>
                    <input 
                      type="number" 
                      min="0"
                      value={p.arrival} 
                      onChange={(e) => handleUpdate(p.id, 'arrival', Math.max(0, parseInt(e.target.value) || 0))}
                      style={{ width: '42px', border: '1px solid transparent', backgroundColor: '#F1F5F9', borderRadius: '6px', padding: '4px 6px', fontSize: '13px', outline: 'none', transition: 'border 0.2s', cursor: 'text' }}
                      onFocus={(e) => e.target.style.border = '1px solid #CBD5E1'}
                      onBlur={(e) => e.target.style.border = '1px solid transparent'}
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      min="1"
                      value={p.burst} 
                      onChange={(e) => handleUpdate(p.id, 'burst', Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '42px', border: '1px solid transparent', backgroundColor: '#F1F5F9', borderRadius: '6px', padding: '4px 6px', fontSize: '13px', outline: 'none', transition: 'border 0.2s', cursor: 'text' }}
                      onFocus={(e) => e.target.style.border = '1px solid #CBD5E1'}
                      onBlur={(e) => e.target.style.border = '1px solid transparent'}
                    />
                  </div>
                  {selectedAlgo.includes('Priority') && (
                    <div>
                      <input 
                        type="number" 
                        min="1"
                        value={p.priority || 1} 
                        onChange={(e) => handleUpdate(p.id, 'priority', Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ width: '38px', border: '1px solid transparent', backgroundColor: '#F1F5F9', borderRadius: '6px', padding: '4px 6px', fontSize: '13px', outline: 'none', transition: 'border 0.2s', cursor: 'text', fontWeight: 700, color: '#334155' }}
                        onFocus={(e) => e.target.style.border = '1px solid #CBD5E1'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                      />
                    </div>
                  )}
                  <div style={{ color: '#64748B', fontSize: '12px' }}>{(p.wait || 0)}ms</div>
                  <div>
                    <div className={`status-badge ${statusClass}`} style={{ padding: '2px 6px' }}>{p.status || 'NEW'}</div>
                  </div>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                    title="Delete Process"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2 2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="playback-controls">
          <button className="play-btn" onClick={stepBackward}>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
          </button>
          <button className="play-btn" style={{border: '1px solid #CBD5E1', color: '#1E293B'}} onClick={status === 'running' ? pause : play}>
            {status === 'running' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          <button className="play-btn" style={{border: '1px solid #CBD5E1', color: '#1E293B'}} onClick={reset}>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
          <button className="play-btn" onClick={stepForward}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" style={{flex: 1}} onClick={runSimulation}>Run Simulation</button>
          <button className="btn btn-outline" style={{flex: 1}} onClick={reset}>Reset</button>
        </div>
      </div>
    </aside>
  );
}
