import React from 'react';
import './StatisticsPanel.css';

export default function StatisticsPanel() {
  return (
    <div className="statistics-panel" style={{ marginTop: '32px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top: Process Table */}
        <div className="card table-card" style={{ padding: '24px' }}>
          <div className="stats-table">
            <div className="st-header">
              <div>PID</div><div>COMP.</div><div>WAIT.</div><div>T/A</div><div style={{textAlign:'right'}}>RESP.</div>
            </div>
            <div className="st-row">
              <div className="pid-1">P1</div><div>8</div><div>0</div><div>8</div><div className="pid-1" style={{textAlign:'right'}}>0</div>
            </div>
            <div className="st-row">
              <div className="pid-2">P2</div><div>12</div><div>7</div><div>11</div><div className="pid-2" style={{textAlign:'right'}}>7</div>
            </div>
            <div className="st-row">
              <div className="pid-3">P3</div><div>21</div><div>10</div><div>19</div><div className="pid-3" style={{textAlign:'right'}}>10</div>
            </div>
            <div className="st-row">
              <div className="pid-4">P4</div><div>26</div><div>18</div><div>23</div><div className="pid-4" style={{textAlign:'right'}}>18</div>
            </div>
          </div>
        </div>

        {/* Bottom: Summary Stats and Precision Insight */}
        <div style={{ display: 'flex', gap: '24px' }}>
           {/* Summary Stats */}
           <div className="card stat-card" style={{ flex: 3, padding: '24px' }}>
              <div className="stat-header">SUMMARY STATISTICS</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div className="stat-item" style={{ marginBottom: 0 }}>
                  <div className="stat-val">7.25 <span>MS</span></div>
                  <div className="stat-lbl">Avg Waiting Time</div>
                </div>
                
                <div className="stat-item" style={{ marginBottom: 0 }}>
                  <div className="stat-val">13.75 <span>MS</span></div>
                  <div className="stat-lbl">Avg Turnaround</div>
                </div>
                
                <div className="stat-item" style={{ marginBottom: 0 }}>
                  <div className="stat-val" style={{ color: '#10B981' }}>94.2 <span>%</span></div>
                  <div className="stat-lbl">CPU Utilization</div>
                </div>
                
                <div className="stat-item" style={{ marginBottom: 0 }}>
                  <div className="stat-val">6.25 <span>MS</span></div>
                  <div className="stat-lbl">Avg Response Time</div>
                </div>
              </div>
           </div>

           {/* Precision Insight */}
           <div className="card insight-card" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <div className="insight-header">
               <div className="insight-icon">◆</div> PRECISION INSIGHT
             </div>
             <div className="insight-text">
               Under current load, <strong style={{color: '#1E293B'}}>SJF</strong> would reduce waiting time by <span style={{color: '#3B82F6', fontWeight: 700}}>12%</span> compared to this model.
             </div>
           </div>
        </div>
      </div>

      {/* Rusooum Bayaniya */}
      <div className="card visualization-card" style={{ marginTop: '24px' }}>
        <div className="vis-title">
           <span className="ar-text">الرسوم البيانية للأداء</span>
           <span className="en-text">(Performance Visualization)</span>
        </div>

        <div className="vis-grid">
           {/* Waiting Time */}
           <div className="vis-col">
              <div className="vis-col-title">WAITING TIME PER PROCESS</div>
              <BarRow label="P1" val="0ms" percent={0} color="#CBD5E1" />
              <BarRow label="P2" val="7ms" percent={38} color="#CBD5E1" />
              <BarRow label="P3" val="10ms" percent={55} color="#CBD5E1" />
              <BarRow label="P4" val="18ms" percent={100} color="#CBD5E1" />
           </div>

           {/* Turnaround Time */}
           <div className="vis-col">
              <div className="vis-col-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                AVERAGE TURNAROUND TIME
                <span style={{ color: '#1E3A8A' }}>● T/A</span>
              </div>
              <BarRow label="P1" val="8ms" percent={34} color="#1E3A8A" />
              <BarRow label="P2" val="11ms" percent={47} color="#1E3A8A" />
              <BarRow label="P3" val="19ms" percent={82} color="#1E3A8A" />
              <BarRow label="P4" val="23ms" percent={100} color="#1E3A8A" />
           </div>

           {/* Response Time */}
           <div className="vis-col">
              <div className="vis-col-title">RESPONSE TIME PER PROCESS</div>
              <BarRow label="P1" val="0ms" percent={0} color="#3B82F6" />
              <BarRow label="P2" val="7ms" percent={70} color="#3B82F6" />
              <BarRow label="P3" val="8ms" percent={80} color="#3B82F6" />
              <BarRow label="P4" val="10ms" percent={100} color="#3B82F6" />
           </div>

           {/* CPU Load */}
           <div className="vis-col" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div className="vis-col-title">CPU LOAD DISTRIBUTION</div>
              <div className="donut-wrap">
                 <svg width="120" height="120" viewBox="0 0 36 36">
                   <path
                     className="circle-bg"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                     fill="none" stroke="#E2E8F0" strokeWidth="4"
                   />
                   <path
                     className="circle"
                     strokeDasharray="94.2, 100"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                     fill="none" stroke="#1E3A8A" strokeWidth="4"
                   />
                 </svg>
                 <div className="donut-text">
                   <div className="dt-val">94.2%</div>
                   <div className="dt-lbl">UTILIZED</div>
                 </div>
              </div>
              <div className="donut-legend">
                <span style={{ color: '#1E3A8A', marginRight: '16px' }}>■ <span style={{ color: '#64748B'}}>CPU BUSY</span></span>
                <span style={{ color: '#E2E8F0' }}>■ <span style={{ color: '#64748B'}}>IDLE TIME</span></span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function BarRow({ label, val, percent, color }: { label: string, val: string, percent: number, color: string }) {
  return (
    <div className="bar-row">
      <div className="bar-labels">
        <span className="bl-pid">{label}</span>
        <span className="bl-val">{val}</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${percent}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
}
