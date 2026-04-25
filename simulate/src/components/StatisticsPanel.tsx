import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { useLanguage } from '../hooks/useLanguage';
import './StatisticsPanel.css';

export default function StatisticsPanel() {
  const { t } = useLanguage();
  const { result, processes } = useSimulation();

  const stats = result?.processStats || [];
  const avgWait = stats.length > 0 ? (stats.reduce((acc, s) => acc + s.waitingTime, 0) / stats.length).toFixed(2) : "0.00";
  const avgTAT = stats.length > 0 ? (stats.reduce((acc, s) => acc + s.turnaroundTime, 0) / stats.length).toFixed(2) : "0.00";
  const avgResp = stats.length > 0 ? (stats.reduce((acc, s) => acc + s.responseTime, 0) / stats.length).toFixed(2) : "0.00";
  
  const totalTime = result?.steps.length || 0;
  const idleTime = result?.steps.filter(s => s.type === 'idle').length || 0;
  const cpuUtil = totalTime > 0 ? (((totalTime - idleTime) / totalTime) * 100).toFixed(1) : "0.0";

  return (
    <div className="statistics-panel" style={{ marginTop: '32px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top: Process Table */}
        <div className="card table-card" style={{ padding: '24px' }}>
          <div className="stats-table">
            <div className="st-header">
              <div>PID</div><div>COMP.</div><div>WAIT.</div><div>T/A</div><div style={{textAlign:'right'}}>RESP.</div>
            </div>
            {stats.map((s) => {
               const pIdx = processes.findIndex(p => p.id === s.id);
               const pidClass = `pid-${(pIdx % 4) + 1}`;
               return (
                <div className="st-row" key={s.id}>
                  <div className={pidClass}>P{s.id}</div>
                  <div>{s.finishTime}</div>
                  <div>{s.waitingTime}</div>
                  <div>{s.turnaroundTime}</div>
                  <div className={pidClass} style={{textAlign:'right'}}>{s.responseTime}</div>
                </div>
               );
            })}
            {stats.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No data available. Run simulation first.</div>}
          </div>
        </div>

        {/* Bottom: Summary Stats and Precision Insight */}
        <div style={{ display: 'flex', gap: '24px' }}>
           {/* Summary Stats */}
           <div className="card stat-card" style={{ flex: 3, padding: '24px' }}>
              <div className="stat-header">{t('stats.header')}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div className="stat-card">
                  <div className="stat-label">{t('stats.avg_wait')}</div>
                  <div className="stat-value">{avgWait}<span>ms</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('stats.avg_turnaround')}</div>
                  <div className="stat-value">{avgTAT}<span>ms</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('stats.avg_response')}</div>
                  <div className="stat-value">{avgResp}<span>ms</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('stats.cpu_utilization')}</div>
                  <div className="stat-value">{cpuUtil}<span>%</span></div>
                </div>
              </div>
           </div>

           {/* Precision Insight */}
           <div className="card insight-card" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <div className="insight-header">
               <div className="insight-icon">◆</div> PRECISION INSIGHT
             </div>
             <div className="insight-text">
               {stats.length > 0 ? (
                 <>Simulation complete using <strong style={{color: 'var(--text-primary)'}}>{result?.steps[0].type === 'running' ? 'Scheduling' : 'Algorithm'}</strong>. Efficiency target achieved.</>
               ) : (
                 <>Add processes and select an algorithm to generate insights.</>
               )}
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
              {stats.map(s => (
                <BarRow key={s.id} label={`P${s.id}`} val={`${s.waitingTime}ms`} percent={Math.min(100, (s.waitingTime / (parseFloat(avgWait) * 2 || 1)) * 50)} color="#CBD5E1" />
              ))}
           </div>

           {/* Turnaround Time */}
           <div className="vis-col">
              <div className="vis-col-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                TURNAROUND TIME
                <span style={{ color: 'var(--primary-blue)' }}>● T/A</span>
              </div>
              {stats.map(s => (
                <BarRow key={s.id} label={`P${s.id}`} val={`${s.turnaroundTime}ms`} percent={Math.min(100, (s.turnaroundTime / (parseFloat(avgTAT) * 2 || 1)) * 50)} color="#1E3A8A" />
              ))}
           </div>

           {/* Response Time */}
           <div className="vis-col">
              <div className="vis-col-title">RESPONSE TIME PER PROCESS</div>
              {stats.map(s => (
                <BarRow key={s.id} label={`P${s.id}`} val={`${s.responseTime}ms`} percent={Math.min(100, (s.responseTime / (parseFloat(avgResp) * 2 || 1)) * 50)} color="#3B82F6" />
              ))}
           </div>

           {/* CPU Load */}
           <div className="vis-col" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div className="vis-col-title">CPU LOAD DISTRIBUTION</div>
              <div className="donut-wrap">
                 <svg width="120" height="120" viewBox="0 0 36 36">
                   <path
                     className="circle-bg"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                     fill="none" stroke="var(--border-color)" strokeWidth="4"
                   />
                   <path
                     className="circle"
                     strokeDasharray={`${cpuUtil}, 100`}
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                     fill="none" stroke="var(--primary-blue)" strokeWidth="4"
                   />
                 </svg>
                 <div className="donut-text">
                   <div className="dt-val">{cpuUtil}%</div>
                   <div className="dt-lbl">UTILIZED</div>
                 </div>
              </div>
              <div className="donut-legend">
                <span style={{ color: 'var(--primary-blue)', marginRight: '16px' }}>■ <span style={{ color: 'var(--text-secondary)'}}>CPU BUSY</span></span>
                <span style={{ color: 'var(--border-color)' }}>■ <span style={{ color: 'var(--text-secondary)'}}>IDLE TIME</span></span>
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
