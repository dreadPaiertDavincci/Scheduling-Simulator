import React from 'react';
import './CalculationDetails.css';

export default function CalculationDetails() {
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
           <div className="trace-box">
             <div><span className="time-blue">[T=00]</span> Scheduler initialized with FCFS logic.</div>
             <div><span className="time-blue">[T=00]</span> P1 enters Ready Queue. CPU assigned to P1.</div>
             <div><span className="time-blue">[T=08]</span> P1 completes. Waiting Queue: P2, P3, P4.</div>
             <div><span className="time-blue">[T=08]</span> P2 starts execution. (Waiting Time: 8 - 1 = 7ms)</div>
             <div><span className="time-blue">[T=12]</span> P2 completes. CPU assigned to P3.</div>
             <div><span className="time-blue">[T=21]</span> P3 completes. CPU assigned to P4.</div>
             <div><span className="time-green">[T=26]</span> All processes finished. Calculating results...</div>
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
            
            <div className="ct-row">
              <div className="pid-1">P1</div> <div>8 - 0</div> <div>8 ms</div> <div>8 - 8</div> <div>0 ms</div>
            </div>
            <div className="ct-row">
              <div className="pid-2">P2</div> <div>12 - 1</div> <div>11 ms</div> <div>11 - 4</div> <div>7 ms</div>
            </div>
            <div className="ct-row">
              <div className="pid-3">P3</div> <div>21 - 2</div> <div>19 ms</div> <div>19 - 9</div> <div>10 ms</div>
            </div>
            <div className="ct-row">
              <div className="pid-4">P4</div> <div>26 - 3</div> <div>23 ms</div> <div>23 - 5</div> <div>18 ms</div>
            </div>
         </div>
      </div>
    </div>
  );
}
