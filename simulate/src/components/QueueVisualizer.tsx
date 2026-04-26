import React, { useState, useEffect, useRef } from 'react';
import './QueueVisualizer.css';
import {
  QUEUE_COMPLEXITY,
  generateEnqueueSteps,
  generateDequeueSteps,
  generatePeekSteps,
  generateFrontSteps,
  generateRearSteps,
  generateRandomSteps,
  type QueueNode,
  type QueueStep,
} from './QueueEngine';

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  Enqueue: () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Dequeue: () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Peek: () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Front: () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" /><line x1="5" y1="6" x2="5" y2="18" />
    </svg>
  ),
  Rear: () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" /><line x1="19" y1="6" x2="19" y2="18" />
    </svg>
  ),
  Random: () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  Clear: () => (
    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  )
};

const STORAGE_KEY = 'queue_simulator_data';
const SPEED_KEY = 'queue_simulator_speed';

interface Props {
  onBack?: () => void;
}

const QueueVisualizer: React.FC<Props> = ({ onBack }) => {
  // ── State ────────────────────────────────────────────────────────────────────
  const [data, setData] = useState<number[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(v => typeof v === 'number' && !isNaN(v));
          return valid.length > 0 ? valid : [10, 25, 37, 52];
        }
      }
    } catch (e) {
      // ignore
    }
    return [10, 25, 37, 52];
  });

  const [inputValue, setInputValue] = useState('');
  const [activeOp, setActiveOp] = useState('');
  const [steps, setSteps] = useState<QueueStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(() => {
    const saved = sessionStorage.getItem(SPEED_KEY);
    return saved ? parseInt(saved, 10) : 700;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logListRef = useRef<HTMLDivElement>(null);

  // Persist to session storage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    sessionStorage.setItem(SPEED_KEY, speed.toString());
  }, [speed]);

  // Auto-scroll logic for console
  useEffect(() => {
    if (logListRef.current) {
      const { scrollHeight, clientHeight } = logListRef.current;
      logListRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, [currentStep, steps]);

  // ── Playback Engine ──────────────────────────────────────────────────────────
  function stopPlayback() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
  }

  function playSteps(newSteps: QueueStep[], customSpeed?: number) {
    stopPlayback();
    setSteps(newSteps);
    if (newSteps.length === 0) return;

    setIsPlaying(true);
    setCurrentStep(0);
    let idx = 0;

    const playbackSpeed = customSpeed || speed;

    const id = setInterval(() => {
      idx++;
      if (idx >= newSteps.length) {
        clearInterval(id);
        setIsPlaying(false);
        setCurrentStep(newSteps.length - 1);
      } else {
        setCurrentStep(idx);
      }
    }, playbackSpeed);
    intervalRef.current = id;
  }

  // ── Operations ───────────────────────────────────────────────────────────────
  const handleEnqueue = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    if (data.length >= 7) return;

    const oldData = [...data];
    setData([...oldData, val]);

    setActiveOp('Enqueue');
    playSteps(generateEnqueueSteps(oldData, val));
    setInputValue('');
  };

  const handleDequeue = () => {
    if (data.length === 0) return;

    const oldData = [...data];
    setData(oldData.slice(1));

    setActiveOp('Dequeue');
    playSteps(generateDequeueSteps(oldData));
  };

  const handlePeek = () => {
    if (data.length === 0) return;
    setActiveOp('Peek');
    playSteps(generatePeekSteps(data));
  };

  const handleFront = () => {
    if (data.length === 0) return;
    setActiveOp('Front');
    playSteps(generateFrontSteps(data));
  };

  const handleRear = () => {
    if (data.length === 0) return;
    setActiveOp('Rear');
    playSteps(generateRearSteps(data));
  };

  const handleRandom = () => {
    stopPlayback();
    const count = Math.floor(Math.random() * 3) + 4;
    const newVals = Array.from({ length: count }, () => Math.floor(Math.random() * 90) + 10);

    // We update state at the END of the animation, but for the steps we need old data
    const oldData = [...data];
    setData(newVals);

    setActiveOp('Random');
    playSteps(generateRandomSteps(oldData, newVals), 300);
  };

  const handleClear = () => {
    stopPlayback();
    setData([]);
    setSteps([]);
    setCurrentStep(-1);
    setActiveOp('');
  };

  const handleClearConsole = () => {
    setSteps([]);
    setCurrentStep(-1);
  };

  // ── Derived Display ──────────────────────────────────────────────────────────
  const currentDisplay: QueueNode[] =
    currentStep >= 0 && steps[currentStep]
      ? steps[currentStep].queue
      : data.map((v, i) => ({ id: `q_${i}_${v}`, value: v, state: 'default' }));

  const compInfo = activeOp ? QUEUE_COMPLEXITY[activeOp] : null;

  const frontVal = data.length > 0 ? data[0] : '—';
  const rearVal = data.length > 0 ? data[data.length - 1] : '—';

  return (
    <div className="queue-container">
      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="queue-sidebar">
        <header className="queue-header">
          {onBack && (
            <button className="queue-back-btn" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          )}
          <div className="queue-badge">
            <span className="queue-badge-dot" />
            FIFO Pipeline
          </div>
          <h2>Queue Simulator</h2>
          <p>A professional environment for visualizing First-In, First-Out operations with precision.</p>
        </header>

        <section className="queue-section-title">Enqueue Value</section>
        <input
          type="number"
          className="queue-input-main"
          placeholder="Value to enqueue..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isPlaying && inputValue && handleEnqueue()}
          disabled={isPlaying}
        />

        <section className="queue-section-title">Operations</section>
        <div className="queue-actions-grid">
          <button className="queue-btn-action primary" onClick={handleEnqueue} disabled={isPlaying || !inputValue}>
            <Icons.Enqueue /> ENQUEUE
          </button>
          <button className="queue-btn-action" onClick={handleDequeue} disabled={isPlaying || data.length === 0}>
            <Icons.Dequeue /> DEQUEUE
          </button>
          <button className="queue-btn-action" onClick={handlePeek} disabled={isPlaying || data.length === 0}>
            <Icons.Peek /> PEEK
          </button>
          <button className="queue-btn-action" onClick={handleFront} disabled={isPlaying || data.length === 0}>
            <Icons.Front /> FRONT
          </button>
          <button className="queue-btn-action" onClick={handleRear} disabled={isPlaying || data.length === 0}>
            <Icons.Rear /> REAR
          </button>
          <button className="queue-btn-action" onClick={handleRandom} disabled={isPlaying}>
            <Icons.Random /> RANDOM
          </button>
          <button className="queue-btn-action danger-outline" style={{ gridColumn: 'span 2' }} onClick={handleClear} disabled={isPlaying}>
            <Icons.Clear /> CLEAR QUEUE
          </button>
        </div>

        <div className="queue-speed-row">
          <span className="queue-speed-label">Anim Speed</span>
          <input
            type="range" className="queue-speed-slider"
            min={200} max={1500} step={100}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span className="queue-speed-value">{speed}ms</span>
        </div>

        <section className="queue-section-title">Queue State</section>
        <div className="queue-state-info">
          <div className="queue-state-row">
            <span className="queue-state-label">Current Size</span>
            <span className="queue-state-value size">{data.length} / 7</span>
          </div>
          <div className="queue-state-row">
            <span className="queue-state-label">Front Node</span>
            <span className="queue-state-value front">{frontVal}</span>
          </div>
          <div className="queue-state-row">
            <span className="queue-state-label">Rear Node</span>
            <span className="queue-state-value rear">{rearVal}</span>
          </div>
        </div>

        {compInfo && (
          <div className="queue-complexity-panel">
            <div className="queue-complexity-title">Complexity Analysis</div>
            <div className="queue-complexity-grid">
              <div className="queue-complexity-item">
                <span className="label">Time</span>
                <span className="value">{compInfo.avg}</span>
              </div>
              <div className="queue-complexity-item">
                <span className="label">Space</span>
                <span className="value">{compInfo.space}</span>
              </div>
            </div>
            <p className="queue-complexity-desc">{compInfo.desc}</p>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="queue-main">
        <div className="queue-canvas">
          <div className="queue-pipe-wrapper">
            <div className="queue-pipe-track">
              {/* DEQUEUE GATE */}
              <div className="queue-gate">
                <span className="queue-gate-label front">FRONT</span>
                <div className="queue-gate-bar front" />
                <div className="queue-side-label dequeue-label">
                  <Icons.Dequeue /> DEQUEUE
                </div>
              </div>

              {/* NODES CONTAINER */}
              <div
                className="queue-nodes-track"
                style={{
                  '--queue-node-size': `${Math.max(65, 90 - data.length * 2.5)}px`,
                  '--queue-node-gap': `${Math.max(8, 16 - data.length * 0.8)}px`,
                  '--queue-font-size': `${Math.max(16, 26 - data.length * 0.5)}px`
                } as React.CSSProperties}
              >
                {currentDisplay.length === 0 ? (
                  <div className="queue-empty-state">
                    <svg className="queue-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
                      <line x1="8" y1="6" x2="8" y2="18" />
                      <line x1="16" y1="6" x2="16" y2="18" />
                    </svg>
                    <span className="queue-empty-text">Queue Empty</span>
                  </div>
                ) : (
                  currentDisplay.map((node, i) => {
                    const isFront = i === 0;
                    const isRear = i === currentDisplay.length - 1;
                    const nodeClass = `queue-node ${node.state} ${isFront ? 'front-node' : ''} ${isRear ? 'rear-node' : ''}`;

                    return (
                      <div key={node.id} className={nodeClass}>
                        {isFront && <span className="node-marker-f">FRONT</span>}
                        {isRear && <span className="node-marker-r">REAR</span>}
                        <span className="queue-node-val">{node.value}</span>
                        <span className="queue-node-idx">{i}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ENQUEUE GATE */}
              <div className="queue-gate">
                <span className="queue-gate-label rear">REAR</span>
                <div className="queue-gate-bar rear" />
                <div className="queue-side-label enqueue-label">
                  ENQUEUE <Icons.Enqueue />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── DEBUG CONSOLE ───────────────────────────────────────────────── */}
        <footer className="queue-log-area">
          <div className="queue-console-header">
            <span className="queue-console-icon">⚡</span>
            <h3>Queue Debug Console</h3>
            <button className="queue-back-btn" style={{ marginLeft: 'auto', marginBottom: 0, padding: '4px 10px' }} onClick={handleClearConsole}>
              <Icons.Trash /> Clear
            </button>
            <div className="queue-console-status">
              {isPlaying ? 'ANIMATING' : 'IDLE'}
            </div>
          </div>

          <div className="queue-log-list" ref={logListRef}>
            {steps.length === 0 ? (
              <div className="queue-log-empty">
                System initialized. Waiting for FIFO operations...
              </div>
            ) : (
              steps.slice(0, currentStep + 1).map((step, i) => (
                <div
                  key={i}
                  className="queue-log-item"
                  style={{
                    opacity: i === currentStep ? 1 : 0.6,
                    transform: i === currentStep ? 'scale(1)' : 'scale(0.98)',
                    borderLeftColor: i === currentStep ? 'var(--q-primary)' : 'var(--q-border)'
                  }}
                >
                  <div className="queue-log-step-label">Step {i + 1} • {step.operation}</div>
                  <p className="queue-log-step-text">{step.description}</p>
                </div>
              ))
            )}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default QueueVisualizer;
