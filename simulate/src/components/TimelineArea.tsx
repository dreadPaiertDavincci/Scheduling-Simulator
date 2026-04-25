import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { useLanguage } from '../hooks/useLanguage';

export function TimelineArea() {
  const { t } = useLanguage();
  const {
    processes, result, currentTime,
    currentStep, readyQueue, eventLog
  } = useSimulation();

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

  const getProcessColor = (pid?: number) => {
    if (!pid) return 'transparent';
    const idx = processes.findIndex(p => p.id === pid);
    const colors = [
      'var(--p1-color)', 'var(--p2-color)', 'var(--p3-color)', 'var(--p4-color)',
      'var(--p5-color)', 'var(--p6-color)', 'var(--p7-color)', 'var(--p8-color)',
      'var(--p9-color)', 'var(--p10-color)'
    ];
    return colors[idx % 10] || 'var(--p1-color)';
  };

  const getProcessClass = (pid?: number) => {
    if (!pid) return '';
    const idx = processes.findIndex(p => p.id === pid);
    return `bg-p${(idx % 10) + 1}`;
  };

  const maxTime = Math.max(20, result?.steps.length || 0);

  // Group consecutive steps by process for cleaner Gantt chart
  const groupedSteps = React.useMemo(() => {
    if (!result) return [];
    const steps = result.steps.slice(0, currentTime);
    if (steps.length === 0) return [];

    const groups: { processId?: number; duration: number; startTime: number; type: string }[] = [];
    let currentGroup = {
      processId: steps[0].processId,
      duration: 1,
      startTime: steps[0].time,
      type: steps[0].type
    };

    for (let i = 1; i < steps.length; i++) {
      if (steps[i].processId === currentGroup.processId && steps[i].type === currentGroup.type) {
        currentGroup.duration++;
      } else {
        groups.push(currentGroup);
        currentGroup = {
          processId: steps[i].processId,
          duration: 1,
          startTime: steps[i].time,
          type: steps[i].type
        };
      }
    }
    groups.push(currentGroup);
    return groups;
  }, [result, currentTime]);

  const timeMarks = Array.from({ length: Math.ceil(maxTime / 2) + 1 }).map((_, i) => i * 2);


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
            {groupedSteps.map((group, i) => {
              if (group.type !== 'running') {
                return <div key={i} style={{ width: `${(group.duration / maxTime) * 100}%`, backgroundColor: '#F8FAFC', borderRight: '1px dashed #E2E8F0' }}></div>;
              }
              const widthPerc = (group.duration / maxTime) * 100;
              return (
                <div
                  key={i}
                  className={`flow-segment ${getProcessClass(group.processId)}`}
                  style={{ width: `${widthPerc}%`, minWidth: '1px' }}
                  onMouseMove={(e) => handleMouseMove(e, `Process P${group.processId}`, `Time: ${group.startTime}-${group.startTime + group.duration}ms`)}
                  onMouseLeave={handleMouseLeave}
                >
                  {widthPerc >= 1.2 && `P${group.processId}`}
                </div>
              );
            })}
          </div>
          <div className="time-axis">
            {timeMarks.map(t => <span key={t}>{t.toString().padStart(2, '0')}</span>)}
          </div>
        </div>
      </div>

      {/* Discrete Time Grid */}
      <div className="card">
        <div className="timeline-header">
          <div className="timeline-title">
            <span className="dot"></span> {t('timeline.execution')}
          </div>
          <div className="timeline-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'var(--p1-color)' }}></div> {t('timeline.running')}
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}></div> {t('timeline.idle')}
            </div>
            <div className="legend-item">
              <div className="legend-line"></div> {t('timeline.context_switch')}
            </div>
          </div>
        </div>

        <div className="grid-container" style={{ paddingBottom: '24px', paddingTop: '24px', paddingLeft: '40px', paddingRight: '12px', marginTop: '40px' }}>
          <div className="grid-bg-lines">
            {timeMarks.map(t => (
              <div key={t} className="grid-line"><span>{t.toString().padStart(2, '0')}</span></div>
            ))}
          </div>

          {processes.map((p, idx) => (
            <div key={p.id} className="grid-row">
              <div className={`grid-label l-p${(idx % 10) + 1}`}>P{p.id}</div>
              <div className="grid-cells">
                {Array.from({ length: maxTime }).map((_, t) => {
                  const step = result?.steps[t];
                  const isRunning = step?.processId === p.id && step?.type === 'running';
                  const stats = result?.processStats.find(s => s.id === p.id);
                  const isDone = stats ? stats.finishTime <= t : false;
                  const hasArrived = p.arrival <= t;

                  if (t >= currentTime) return <div key={t} className="empty-block" style={{ opacity: 0.2 }}></div>;

                  if (isRunning) {
                    return (
                      <div
                        key={t}
                        className={`time-block ${getProcessClass(p.id)}`}
                        onMouseMove={(e) => handleMouseMove(e, `Process P${p.id}`, `Time: ${t}-${t + 1}ms | RUNNING`)}
                        onMouseLeave={handleMouseLeave}
                      ></div>
                    );
                  }

                  if (hasArrived && !isDone) {
                    return (
                      <div
                        key={t}
                        className="empty-block"
                        style={{ borderColor: getProcessColor(p.id) }}
                        onMouseMove={(e) => handleMouseMove(e, `Process P${p.id}`, `Time: ${t}-${t + 1}ms | READY`)}
                        onMouseLeave={handleMouseLeave}
                      ></div>
                    );
                  }

                  return <div key={t} className="empty-block" style={{ border: 'none' }}></div>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-panels" style={{ display: 'flex', gap: '48px', alignItems: 'center', backgroundColor: 'var(--card-bg)', padding: '32px 40px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        {/* Ready Queue */}
        <div style={{ flex: 1 }}>
          <div className="timeline-title-sub" style={{ color: 'var(--text-tertiary)', marginBottom: '16px', letterSpacing: '1px' }}>{t('timeline.ready_queue')}</div>
          <div className="ready-queue-items" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {readyQueue.map((p, i) => (
              <div
                key={p.id}
                className={`queue-item ${i === 0 ? 'next' : ''}`}
                style={{
                  minWidth: '56px', height: '56px', borderRadius: '12px',
                  border: i === 0 ? `2px solid ${getProcessColor(p.id)}` : '1px solid var(--border-color)',
                  color: getProcessColor(p.id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, position: 'relative',
                  flexShrink: 0
                }}
                onMouseMove={(e) => handleMouseMove(e, i === 0 ? 'Next Process' : `Process P${p.id}`, i === 0 ? `Process P${p.id} is next in queue` : 'Waiting in Ready Queue')}
                onMouseLeave={handleMouseLeave}
              >
                P{p.id}
                {i === 0 && <div style={{ position: 'absolute', top: '-10px', backgroundColor: getProcessColor(p.id), color: '#fff', fontSize: '8px', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>NEXT</div>}
              </div>
            ))}
            {readyQueue.length === 0 && (
              <div className="queue-item empty" style={{ width: '56px', height: '56px', borderRadius: '12px', border: '1px dashed #E2E8F0', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 400 }}>
                Empty
              </div>
            )}
          </div>
        </div>

        {/* Currently Running */}
        <div className="running-box" style={{ flex: 1.5, backgroundColor: 'var(--bg-color)', padding: '24px 32px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentStep?.type === 'running' ? (
            <>
              <div>
                <div className="timeline-title-sub" style={{ color: 'var(--text-tertiary)', marginBottom: '8px', letterSpacing: '1px' }}>{t('timeline.currently_running')}</div>
                <div className="running-proc" style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: getProcessColor(currentStep.processId) }}>Process P{currentStep.processId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="timeline-title-sub" style={{ color: 'var(--text-tertiary)', marginBottom: '8px', letterSpacing: '1px' }}>{t('timeline.remaining')}</div>
                <div className="running-rem" style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#1E293B' }}>{currentStep.remainingBurst}ms</div>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', color: '#94A3B8', fontWeight: 500 }}>
              {currentStep?.type === 'idle' ? t('timeline.cpu_idle') : t('timeline.no_simulation')}
            </div>
          )}
        </div>
      </div>


      {/* Live Event Log */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="timeline-title-sub" style={{ margin: 0 }}>LIVE EVENT LOG</div>
        </div>
        <div className="event-log hide-scrollbar" style={{ margin: '16px 24px 24px', maxHeight: '180px', overflowY: 'auto' }}>
          {eventLog.length > 0 ? eventLog.map((log, i) => {
            const time = log.match(/\[t=(\d+)\]/)?.[1];
            const pid = log.match(/P(\d+)/)?.[1];
            const content = log.replace(/\[t=\d+\]/, '').replace(/P\d+/, '');

            return (
              <div className="log-line" key={i}>
                <span className="time">[{time}ms]</span>
                {pid && <span className={`p${(processes.findIndex(p => p.id === parseInt(pid)) % 10) + 1}`}>P{pid}</span>}
                <span className="action">{content}</span>
              </div>
            );
          }) : (
            <div style={{ color: '#94A3B8', fontSize: '13px' }}>No events logged yet. Start the simulation to see events.</div>
          )}
        </div>
      </div>
    </div>
  );
}
