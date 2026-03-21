import React, { useState } from 'react';

export default function TimelineArea() {
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: React.ReactNode }>({
    show: false,
    x: 0,
    y: 0,
    content: ''
  });

  const handleMouseMove = (e: React.MouseEvent, process: string, details: string) => {
    setTooltip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      content: (
        <div>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>{process}</div>
          <div style={{ color: '#94A3B8' }}>{details}</div>
        </div>
      )
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="timeline-area">
      {tooltip.show && (
        <div
          className="custom-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Process Flow Map */}
      <div className="card">
        <div className="timeline-header">
          <div className="timeline-title">
            <div className="timeline-title-sub">EXECUTION TIMELINE</div>
            <h2>Process Flow Map</h2>
          </div>
        </div>

        <div className="flow-map-container" style={{ marginBottom: 0 }}>
          <div className="flow-bar">
            <div
              className="flow-segment bg-p1"
              style={{ width: '40%' }}
              onMouseMove={(e) => handleMouseMove(e, "Process P1", "Time: 0ms - 8ms | Execution")}
              onMouseLeave={handleMouseLeave}
            >P1</div>
            <div
              className="flow-segment bg-p2"
              style={{ width: '20%' }}
              onMouseMove={(e) => handleMouseMove(e, "Process P2", "Time: 8ms - 12ms | Execution")}
              onMouseLeave={handleMouseLeave}
            >P2</div>
            <div
              className="flow-segment bg-p3"
              style={{ width: '40%' }}
              onMouseMove={(e) => handleMouseMove(e, "Process P3", "Time: 12ms - 21ms | Execution")}
              onMouseLeave={handleMouseLeave}
            >P3</div>
          </div>
          <div className="time-axis">
            <span>00</span>
            <span>12</span>
            <span>21</span>
          </div>
        </div>
      </div>

      {/* Discrete Time Grid */}
      <div className="card">
        <div className="timeline-header">
          <div className="timeline-title">
            <div className="timeline-title-sub">EXECUTION TIMELINE</div>
            <h2>Discrete Time Grid</h2>
          </div>

          <div className="status-legend">
            <div className="legend-item">
              <div className="legend-dot running"></div> RUNNING
            </div>
            <div className="legend-item">
              <div className="legend-square"></div> IDLE
            </div>
            <div className="legend-item">
              <div className="legend-line"></div> CONTEXT SWITCH
            </div>
          </div>
        </div>

        <div className="grid-container" style={{ paddingBottom: '24px', paddingTop: '24px', paddingLeft: '40px', paddingRight: '12px', marginTop: '40px' }}>
          <div className="grid-bg-lines">
            {['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'].map(t => (
              <div key={t} className="grid-line"><span>{t}</span></div>
            ))}
          </div>

          {/* P1 */}
          <div className="grid-row">
            <div className="grid-label l-p1">P1</div>
            <div className="grid-cells">
              <div className="time-block bg-p1" onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 0-1ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p1" onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 1-2ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ borderColor: 'var(--p1-color)' }} onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 2-3ms | IDLE')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ borderColor: 'var(--p1-color)' }} onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 3-4ms | IDLE')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p1" onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 4-5ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p1" onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 5-6ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ borderColor: 'var(--p1-color)' }} onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 6-7ms | IDLE')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ borderColor: 'var(--p1-color)' }} onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 7-8ms | IDLE')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p1" onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 8-9ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p1" onMouseMove={(e) => handleMouseMove(e, 'Process P1', 'Time: 9-10ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
            </div>
          </div>

          {/* P2 */}
          <div className="grid-row">
            <div className="grid-label l-p2">P2</div>
            <div className="grid-cells" style={{ paddingLeft: '16.6%' }}>
              <div className="empty-block" style={{ borderColor: 'var(--p2-color)' }} onMouseMove={(e) => handleMouseMove(e, 'Process P2', 'Time: 2-3ms | IDLE')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ borderColor: 'var(--p2-color)' }} onMouseMove={(e) => handleMouseMove(e, 'Process P2', 'Time: 3-4ms | IDLE')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p2" onMouseMove={(e) => handleMouseMove(e, 'Process P2', 'Time: 4-5ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p2" onMouseMove={(e) => handleMouseMove(e, 'Process P2', 'Time: 5-6ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ borderColor: 'var(--p2-color)' }} onMouseMove={(e) => handleMouseMove(e, 'Process P2', 'Time: 6-7ms | IDLE')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ borderColor: 'var(--p2-color)' }} onMouseMove={(e) => handleMouseMove(e, 'Process P2', 'Time: 7-8ms | IDLE')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p2" onMouseMove={(e) => handleMouseMove(e, 'Process P2', 'Time: 8-9ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p2" onMouseMove={(e) => handleMouseMove(e, 'Process P2', 'Time: 9-10ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
            </div>
          </div>

          {/* P3 */}
          <div className="grid-row">
            <div className="grid-label l-p3">P3</div>
            <div className="grid-cells" style={{ paddingLeft: '50%' }}>
              <div className="time-block bg-p3" onMouseMove={(e) => handleMouseMove(e, 'Process P3', 'Time: 12-13ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p3" onMouseMove={(e) => handleMouseMove(e, 'Process P3', 'Time: 13-14ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p3" onMouseMove={(e) => handleMouseMove(e, 'Process P3', 'Time: 14-15ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
            </div>
          </div>

          {/* P4 */}
          <div className="grid-row">
            <div className="grid-label l-p4">P4</div>
            <div className="grid-cells">
              <div className="time-block bg-p4" onMouseMove={(e) => handleMouseMove(e, 'Process P4', 'Time: 0-1ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ visibility: 'hidden', width: '7.68%' }}></div>
              <div className="time-block bg-p4" onMouseMove={(e) => handleMouseMove(e, 'Process P4', 'Time: 3-4ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ visibility: 'hidden', width: '7.68%' }}></div>
              <div className="time-block bg-p4" onMouseMove={(e) => handleMouseMove(e, 'Process P4', 'Time: 6-7ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="time-block bg-p4" onMouseMove={(e) => handleMouseMove(e, 'Process P4', 'Time: 7-8ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
              <div className="empty-block" style={{ visibility: 'hidden', width: '3.84%' }}></div>
              <div className="time-block bg-p4" onMouseMove={(e) => handleMouseMove(e, 'Process P4', 'Time: 9-10ms | RUNNING')} onMouseLeave={handleMouseLeave}></div>
            </div>
          </div>

        </div>
      </div>

      <div className="bottom-panels" style={{ display: 'flex', gap: '48px', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '32px 40px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        {/* Ready Queue */}
        <div style={{ flex: 1 }}>
          <div className="timeline-title-sub" style={{ color: '#94A3B8', marginBottom: '16px', letterSpacing: '1px' }}>READY QUEUE</div>
          <div className="ready-queue-items" style={{ display: 'flex', gap: '16px' }}>
            <div
              className="queue-item next"
              style={{ width: '56px', height: '56px', borderRadius: '12px', border: '2px solid var(--p2-color)', color: 'var(--p2-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, position: 'relative' }}
              onMouseMove={(e) => handleMouseMove(e, 'Next Process', 'Process P2 is next in queue')}
              onMouseLeave={handleMouseLeave}
            >
              P2
              <div style={{ position: 'absolute', top: '-10px', backgroundColor: 'var(--p2-color)', color: '#fff', fontSize: '8px', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>NEXT</div>
            </div>

            <div
              className="queue-item"
              style={{ width: '56px', height: '56px', borderRadius: '12px', border: '1px solid #E2E8F0', color: 'var(--p3-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}
              onMouseMove={(e) => handleMouseMove(e, 'Process P3', 'Waiting in Ready Queue')}
              onMouseLeave={handleMouseLeave}
            >
              P3
            </div>

            <div
              className="queue-item"
              style={{ width: '56px', height: '56px', borderRadius: '12px', border: '1px solid #E2E8F0', color: 'var(--p4-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}
              onMouseMove={(e) => handleMouseMove(e, 'Process P4', 'Waiting in Ready Queue')}
              onMouseLeave={handleMouseLeave}
            >
              P4
            </div>

            <div className="queue-item empty" style={{ width: '56px', height: '56px', borderRadius: '12px', border: '1px dashed #E2E8F0', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 300, cursor: 'pointer' }}>
              +
            </div>
          </div>
        </div>

        {/* Currently Running */}
        <div className="running-box" style={{ flex: 1.5, backgroundColor: '#F8FAFC', padding: '24px 32px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="timeline-title-sub" style={{ color: '#94A3B8', marginBottom: '8px', letterSpacing: '1px' }}>CURRENTLY RUNNING</div>
            <div className="running-proc" style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--p2-color)' }}>Process P2</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="timeline-title-sub" style={{ color: '#94A3B8', marginBottom: '8px', letterSpacing: '1px' }}>REMAINING</div>
            <div className="running-rem" style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#1E293B' }}>3ms</div>
          </div>
        </div>
      </div>

      {/* Live Event Log */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="timeline-title-sub" style={{ margin: 0 }}>LIVE EVENT LOG</div>
        </div>
        <div className="event-log" style={{ margin: '16px 24px 24px' }}>
          <div className="log-line">
            <span className="time">[t=0]</span><span className="p1">P1</span><span className="action"> arrived in Ready Queue.</span>
          </div>
          <div className="log-line">
            <span className="time">[t=0]</span><span className="action">Scheduler assigned </span><span className="p1">P1</span><span className="action"> to CPU.</span>
          </div>
          <div className="log-line">
            <span className="time">[t=1]</span><span className="p2">P2</span><span className="action"> arrived in Ready Queue.</span>
          </div>
          <div className="log-line">
            <span className="time">[t=2]</span><span className="p3">P3</span><span className="action"> arrived in Ready Queue.</span>
          </div>
          <div className="log-line">
            <span className="time">[t=3]</span><span className="p4">P4</span><span className="action"> arrived in Ready Queue.</span>
          </div>
          <div className="log-line">
            <span className="time">[t=8]</span><span className="p1">P1</span><span className="action"> completed execution.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
