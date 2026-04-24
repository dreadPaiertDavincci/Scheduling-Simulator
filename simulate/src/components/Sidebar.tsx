import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../hooks/useSimulation';

const ALGORITHMS = [
  // ── Core algorithms ──────────────────────────────────────────
  "First Come First Served (FCFS)",
  "Shortest Job First (SJF)",
  "Shortest Processing Time (SPT)",
  "Longest Job First (LJF)",
  "Longest Processing Time (LPT)",
  "Shortest Remaining Time First (SRTF)",
  "Longest Remaining Time First (LRTF)",
  // ── Round Robin variants ──────────────────────────────────────
  "Round Robin (RR)",
  "Priority Round Robin (Priority RR)",
  "Deficit Round Robin (DRR)",
  // ── Priority-based ──────────────────────────────────────────
  "Priority Scheduling",
  "Preemptive Priority Scheduling",
  "Non-Preemptive Priority Scheduling",
  // ── Response ratio ──────────────────────────────────────────
  "Highest Response Ratio Next (HRRN)",
  // ── Real-time algorithms ────────────────────────────────────
  "Earliest Due Date (EDD)",
  "Maximum Urgency First (MUF)",
  "Rate Monotonic Scheduling (RMS)",
  "Deadline Monotonic Scheduling (DMS)",
  "Earliest Deadline Late (EDL)",
  "Total Bandwidth Server (TBS)",
  // ── Other / Advanced ────────────────────────────────────────
  "Multilevel Queue Scheduling",
  "Multilevel Feedback Queue (MLFQ)",
  "Completely Fair Scheduler (CFS)",
  "Fair Share Scheduling",
  "Lottery Scheduling",
  "Stride Scheduling",
  "Proportional Share Scheduling",
  "Earliest Deadline First (EDF)",
  "Least Laxity First (LLF)",
  "Weighted Fair Queuing (WFQ)",
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
  "Min-Min Scheduling",
  "Max-Min Scheduling",
  "Heterogeneous Earliest Finish Time (HEFT)",
  "Dynamic Level Scheduling (DLS)",
  "Round Robin Load Balancing",
  "Weighted Round Robin (WRR)",
  "Work Stealing Scheduling",
  "Gang Scheduling",
  "Minimum Slack Time (MST)",
  "Critical Ratio Scheduling (CR)",
  "Moore's Algorithm",
  "Johnson's Rule",
  "Branch and Bound Scheduling",
  "Genetic Algorithm Scheduling",
  "Simulated Annealing Scheduling",
  "Ant Colony Optimization Scheduling",
  "Particle Swarm Optimization Scheduling",
  "Tabu Search Scheduling",
  "Hill Climbing Scheduling",
  "Opportunistic Load Balancing (OLB)",
  "Minimum Execution Time (MET)",
  "Minimum Completion Time (MCT)",
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
    const count = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
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
          {selectedAlgo === "First Come First Served (FCFS)" && "Jobs are processed in the order they enter the ready queue. Simple, non-preemptive."}
          {selectedAlgo === "Shortest Job First (SJF)" && "Selects the waiting process with the smallest execution time."}
          {selectedAlgo === "Shortest Processing Time (SPT)" && "Prioritizes processes with the shortest total processing requirement."}
          {selectedAlgo === "Shortest Remaining Time First (SRTF)" && "Preemptive: executes the process with the smallest remaining time next."}
          {selectedAlgo === "Longest Job First (LJF)" && "Selects the process with the longest burst time first."}
          {selectedAlgo === "Longest Processing Time (LPT)" && "Prioritizes the most time-intensive jobs."}
          {selectedAlgo === "Longest Remaining Time First (LRTF)" && "Always executes the process with the longest remaining time."}
          {selectedAlgo === "Round Robin (RR)" && `Fixed time slice (Quantum: ${quantum}ms) per process in cyclic order.`}
          {selectedAlgo === "Priority Round Robin (Priority RR)" && `RR within priority groups. Higher priority runs first.`}
          {selectedAlgo === "Deficit Round Robin (DRR)" && `Uses a deficit counter to ensure fair bandwidth sharing.`}
          {selectedAlgo === "Priority Scheduling" && "Lower priority value indicates higher scheduling priority."}
          {selectedAlgo === "Preemptive Priority Scheduling" && "A higher-priority process immediately preempts the current one."}
          {selectedAlgo === "Non-Preemptive Priority Scheduling" && "Priority is checked only when a process finishes or blocks."}
          {selectedAlgo === "Highest Response Ratio Next (HRRN)" && "Balances wait time and burst time to prevent starvation."}
          {!selectedAlgo && "Select an algorithm to view logic."}
        </p>

        {(selectedAlgo?.includes("Round Robin") || selectedAlgo === "Deficit Round Robin (DRR)") && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Time Quantum:</label>
            <input
              type="number"
              min="1"
              value={quantum}
              onChange={(e) => setQuantum(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '64px', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}
            />
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Process Workload</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ padding: '6px 14px' }}>Add</button>
            <button className="btn btn-soft btn-sm" onClick={handleRandom} style={{ padding: '6px 14px' }}>Random</button>
          </div>
        </div>

        <div className="process-table">
          <div className="header-row" style={{ 
            display: 'grid',
            gridTemplateColumns: selectedAlgo?.includes('Priority') ? '40px 1fr 1fr 45px 1fr 1.2fr 30px' : '45px 1.2fr 1.2fr 1fr 1.5fr 30px',
            gap: '8px',
            paddingRight: '8px',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '8px'
          }}>
            <div style={{ textAlign: 'left' }}>PID</div>
            <div style={{ textAlign: 'center' }}>Arrival</div>
            <div style={{ textAlign: 'center' }}>Burst</div>
            {selectedAlgo?.includes('Priority') && <div style={{ textAlign: 'center' }}>Pri</div>}
            <div style={{ textAlign: 'center' }}>Wait</div>
            <div style={{ textAlign: 'right', paddingRight: '4px' }}>Status</div>
            <div></div>
          </div>
          
          <div className="process-list hide-scrollbar" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', marginTop: '8px' }}>
            {currentProcesses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '13px' }}>
                No processes added. Click Add or Random.
              </div>
            ) : currentProcesses.map((p: any, idx: number) => {
              const statusClass = `status-${(p.status || 'new').toLowerCase()}`;
              const colors = [
                '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
                '#EC4899', '#06B6D4', '#F97316', '#14B8A6',
                '#6366F1', '#D946EF'
              ];
              const color = colors[idx % 10];

              return (
                <div className="process-row" key={p.id} style={{ 
                  display: 'grid',
                  gridTemplateColumns: selectedAlgo?.includes('Priority') ? '40px 1fr 1fr 45px 1fr 1.2fr 30px' : '45px 1.2fr 1.2fr 1fr 1.5fr 30px',
                  gap: '8px',
                  padding: '8px 0',
                  alignItems: 'center'
                }}>
                  <div style={{ color, fontWeight: 700 }}>P{p.id}</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      value={p.arrival}
                      onChange={(e) => handleUpdate(p.id, 'arrival', Math.max(0, parseInt(e.target.value) || 0))}
                      style={{ width: '100%', maxWidth: '45px', border: '1px solid transparent', backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '4px', fontSize: '13px', textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={p.burst}
                      onChange={(e) => handleUpdate(p.id, 'burst', Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '100%', maxWidth: '45px', border: '1px solid transparent', backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '4px', fontSize: '13px', textAlign: 'center' }}
                    />
                  </div>
                  {selectedAlgo?.includes('Priority') && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        value={p.priority || 1}
                        onChange={(e) => handleUpdate(p.id, 'priority', Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ width: '100%', maxWidth: '38px', border: '1px solid transparent', backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '4px', fontSize: '13px', textAlign: 'center', fontWeight: 700 }}
                      />
                    </div>
                  )}
                  <div style={{ color: '#64748B', fontSize: '12px', textAlign: 'center' }}>{(p.wait || 0)}ms</div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div className={`status-badge ${statusClass}`} style={{ padding: '2px 8px', fontSize: '9px', borderRadius: '4px' }}>{p.status || 'NEW'}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2 2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="playback-controls" style={{ margin: '24px 0 16px', background: '#F8FAFC', padding: '10px', borderRadius: '12px' }}>
          <button className="play-btn" onClick={stepBackward}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
          </button>
          <button className="play-btn" style={{ background: '#fff', border: '1px solid #E2E8F0', width: '36px', height: '36px' }} onClick={status === 'running' ? pause : play}>
            {status === 'running' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          <button className="play-btn" style={{ background: '#fff', border: '1px solid #E2E8F0', width: '36px', height: '36px' }} onClick={reset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
          <button className="play-btn" onClick={stepForward}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
        </div>

        <div className="action-buttons" style={{ gap: '10px' }}>
          <button className="btn btn-primary" style={{ flex: 1.5, height: '42px' }} onClick={runSimulation}>Run Simulation</button>
          <button className="btn btn-outline" style={{ flex: 1, height: '42px' }} onClick={reset}>Reset</button>
        </div>
      </div>
    </aside>
  );
}

