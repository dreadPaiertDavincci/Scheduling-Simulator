import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import './CalculationDetails.css';

export default function CalculationDetails() {
  const { result, processes, selectedAlgo } = useSimulation();

  const stats = result?.processStats || [];

  return (
    <div className="card calculation-card" style={{ marginBottom: '40px' }}>
      <div className="vis-title" style={{ marginBottom: '40px' }}>
        <span className="ar-text">تفاصيل الحل والخطوات</span>
        <span className="en-text">(Calculation & Solution Details)</span>
      </div>

      <div className="calc-top-grid">
         {/* Mathematical Models */}
         <div className="math-models">
           <div className="vis-col-title">MATHEMATICAL MODELS</div>
           
           <div className="model-item">
             <div className="model-border border-tat"></div>
             <div>
               <div className="model-title">1. Turnaround Time (TAT)</div>
               <div className="model-formula">TAT = Completion Time (CT) - Arrival Time (AT)</div>
             </div>
           </div>

           <div className="model-item">
             <div className="model-border border-wt"></div>
             <div>
               <div className="model-title">2. Waiting Time (WT)</div>
               <div className="model-formula">WT = Turnaround Time (TAT) - Burst Time (BT)</div>
             </div>
           </div>

           <div className="model-item">
             <div className="model-border border-rt"></div>
             <div>
               <div className="model-title">3. Response Time (RT)</div>
               <div className="model-formula">RT = First Response - Arrival Time (AT)</div>
             </div>
           </div>
         </div>

         {/* Simulation Trace */}
         <div className="sim-trace">
           <div className="vis-col-title">SIMULATION TRACE (LOG)</div>
           <div className="trace-box hide-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
             <div><span className="time-blue">[T=00]</span> Scheduler initialized with {selectedAlgo || 'None'} logic.</div>
             {result?.steps.map((step, i) => {
               const timeStr = `[T=${step.time.toString().padStart(2, '0')}]`;
               if (step.type === 'running') {
                 const prevStep = i > 0 ? result.steps[i-1] : null;
                 if (!prevStep || prevStep.processId !== step.processId) {
                   return <div key={i}><span className="time-blue">{timeStr}</span> CPU assigned to P{step.processId}. Remaining: {step.remainingBurst}ms.</div>;
                 }
               } else if (step.type === 'idle') {
                 const prevStep = i > 0 ? result.steps[i-1] : null;
                 if (!prevStep || prevStep.type !== 'idle') {
                   return <div key={i}><span className="time-blue">{timeStr}</span> CPU entered IDLE state.</div>;
                 }
               }
               return null;
             })}
             {result && <div style={{ marginTop: '8px' }}><span className="time-green">[T={(result.steps.length).toString().padStart(2, '0')}]</span> All processes finished. Calculating results...</div>}
             {!result && <div><span className="time-blue">[T=--]</span> Awaiting simulation start...</div>}
           </div>
         </div>
      </div>

      {/* Detailed Table */}
      <div className="detailed-table-sec">
         <div className="vis-col-title">DETAILED CALCULATION TABLE</div>
         <div className="calc-table">
            <div className="ct-header">
              <div>Process</div>
              <div>Calc (TAT)</div>
              <div>Result (TAT)</div>
              <div>Calc (WT)</div>
              <div>Result (WT)</div>
            </div>
            
            {stats.map(s => {
              const p = processes.find(pp => pp.id === s.id);
              if (!p) return null;
              return (
                <div className="ct-row" key={s.id}>
                  <div className={`pid-${(processes.findIndex(pp => pp.id === s.id) % 4) + 1}`}>P{s.id}</div> 
                  <div>{s.finishTime} - {p.arrival}</div> 
                  <div>{s.turnaroundTime} ms</div> 
                  <div>{s.turnaroundTime} - {p.burst}</div> 
                  <div>{s.waitingTime} ms</div>
                </div>
              );
            })}
            {stats.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>No calculation data.</div>}
         </div>
      </div>
    </div>
  );
}
