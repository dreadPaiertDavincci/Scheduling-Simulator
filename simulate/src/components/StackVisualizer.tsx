import React, { useState, useEffect, useRef } from 'react';
import './StackVisualizer.css';
import {
  STACK_COMPLEXITY,
  generatePushSteps, generatePopSteps, generatePeekSteps,
  type StackNode, type StackStep
} from './StackEngine';

interface Props {
  onBack?: () => void;
}

const StackVisualizer: React.FC<Props> = ({ onBack }) => {
  // SVG Icons
  const Icons = {
    Push: () => (
      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
    ),
    Pop: () => (
      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    ),
    Peek: () => (
      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    Random: () => (
      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 8h.01M8 8h.01M8 16h.01M16 16h.01M12 12h.01" /></svg>
    ),
    Clear: () => (
      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" /></svg>
    )
  };

  // Persistence Keys
  const STORAGE_DATA_KEY = 'stack_simulator_data';

  // State
  const [data, setData] = useState<number[]>(() => {
    const saved = sessionStorage.getItem(STORAGE_DATA_KEY);
    return saved ? JSON.parse(saved) : [40, 30, 20, 10]; // Top is 10
  });

  const [inputValue, setInputValue] = useState('');
  const [activeOp, setActiveOp] = useState('');
  const [steps, setSteps] = useState<StackStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const newValRef = useRef<number | null>(null);

  // Persistence
  useEffect(() => {
    sessionStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data));
  }, [data]);

  function stopPlayback() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
  }

  function playSteps(newSteps: StackStep[]) {
    stopPlayback();
    setSteps(newSteps);
    if (newSteps.length === 0) return;

    setIsPlaying(true);
    setCurrentStep(0);
    let idx = 0;

    const id = setInterval(() => {
      idx++;
      if (idx >= newSteps.length) {
        clearInterval(id);
        setIsPlaying(false);
        setCurrentStep(newSteps.length - 1);
      } else {
        setCurrentStep(idx);
      }
    }, speed);
    intervalRef.current = id;
  }

  // Operations
  const handlePush = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    
    // Mutate state immediately
    const oldData = [...data];
    setData([val, ...oldData]);
    
    setActiveOp('Push');
    playSteps(generatePushSteps(oldData, val));
    setInputValue('');
  };

  const handlePop = () => {
    if (data.length === 0) return;
    
    // Mutate state immediately
    const oldData = [...data];
    setData(oldData.slice(1));
    
    setActiveOp('Pop');
    playSteps(generatePopSteps(oldData));
  };

  const handlePeek = () => {
    if (data.length === 0) return;
    setActiveOp('Peek');
    playSteps(generatePeekSteps(data));
  };

  const handleClear = () => {
    stopPlayback();
    setData([]);
    setSteps([]);
    setCurrentStep(-1);
    setActiveOp('');
  };

  const handleRandom = () => {
    stopPlayback();
    const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 nodes
    const randomVals = Array.from({ length: count }, () => Math.floor(Math.random() * 90) + 10);
    setData(randomVals);
    setSteps([]);
    setCurrentStep(-1);
    setActiveOp('');
  };

  const currentDisplay = currentStep >= 0 && steps[currentStep] ? steps[currentStep].stack :
    data.map((v, i) => ({ id: `s_${i}_${v}`, value: v, state: 'default' as const }));

  const compInfo = activeOp ? STACK_COMPLEXITY[activeOp] : null;

  return (
    <div className="stack-container">
      {/* SIDEBAR */}
      <div className="stack-sidebar">
        <div className="stack-header">
          {onBack && (
            <button className="stack-back-btn" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back
            </button>
          )}
          <h2>Stack Simulator</h2>
          <p>LIFO: Last-In, First-Out behavior.</p>
        </div>

        <div className="stack-section-title">Insertion & Removal</div>
        <div className="stack-input-group">
          <input
            type="number"
            className="stack-input-main"
            placeholder="Value..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handlePush()}
          />
        </div>

        <div className="stack-actions-grid">
          <button className="stack-btn-action primary" onClick={handlePush} disabled={isPlaying}>
            <Icons.Push /> PUSH
          </button>
          <button className="stack-btn-action" onClick={handlePop} disabled={isPlaying || data.length === 0}>
            <Icons.Pop /> POP
          </button>
          <button className="stack-btn-action" onClick={handlePeek} disabled={isPlaying || data.length === 0}>
            <Icons.Peek /> PEEK
          </button>
          <button className="stack-btn-action" onClick={handleRandom} disabled={isPlaying}>
            <Icons.Random /> RANDOM
          </button>
          <button className="stack-btn-action danger-outline" onClick={handleClear} disabled={isPlaying}>
            <Icons.Clear /> CLEAR
          </button>
        </div>

        {compInfo && (
          <div className="stack-complexity-panel">
            <div className="stack-complexity-grid">
              <div className="stack-complexity-item">
                <span className="label">Complexity</span>
                <span className="value">{compInfo.avg}</span>
              </div>
              <div className="stack-complexity-item">
                <span className="label">Space</span>
                <span className="value">{compInfo.space}</span>
              </div>
            </div>
            <p className="stack-complexity-desc">{compInfo.desc}</p>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div className="stack-main">
        <div className="stack-canvas">
          <div className="stack-bucket">
            {currentDisplay.map((node, i) => (
              <div
                key={node.id}
                className={`stack-node ${node.state}`}
              >
                <span className="node-val">{node.value}</span>
                {i === 0 && (
                  <div className="stack-top-pointer">
                    <span className="top-arrow">←</span>
                    <span className="top-label">TOP</span>
                  </div>
                )}
                <div className="node-idx">{data.length - 1 - i}</div>
              </div>
            ))}
            {currentDisplay.length === 0 && (
              <div className="stack-empty-state">
                <svg className="empty-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8V21H3V8M1 3H23V8H1V3ZM10 12H14" />
                </svg>
                <div className="empty-text">Stack is Empty</div>
              </div>
            )}
          </div>
        </div>

        <div className="stack-log-area">
          <div className="stack-console-header">
            <span className="stack-console-icon">📦</span>
            <h3>Stack Debug Console</h3>
            <div className="stack-console-status">System Operational</div>
          </div>
          <div className="stack-log-list">
            {steps.length === 0 ? (
              <div className="stack-log-empty" style={{ opacity: 0.5 }}>⚡ System Ready. Push an element to start.</div>
            ) : (
              steps.slice(0, currentStep + 1).map((step, i) => (
                <div key={i} className="stack-log-item" style={{ opacity: i === currentStep ? 1 : 0.6 }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#6366F1' }}>STEP {i + 1}</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 500 }}>{step.description}</p>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackVisualizer;
