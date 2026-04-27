import React, { useState, useEffect, useRef } from 'react';
import './LinkedListVisualizer.css';
import type { LLType, LLStep } from './LinkedListEngine';
import {
  LL_COMPLEXITY,
  generateTraverseSteps, generateSearchSteps,
  generateInsertHeadSteps, generateInsertTailSteps, generateInsertAtSteps,
  generateDeleteHeadSteps, generateDeleteTailSteps, generateDeleteAtSteps,
  generateReverseSteps
} from './LinkedListEngine';

interface Props {
  onBack?: () => void;
}

const LinkedListVisualizer: React.FC<Props> = ({ onBack }) => {
  // Persistence Keys
  const STORAGE_DATA_KEY = 'll_simulator_data';
  const STORAGE_TYPE_KEY = 'll_simulator_type';

  // State Initialization from Session Storage
  const [data, setData] = useState<number[]>(() => {
    const saved = sessionStorage.getItem(STORAGE_DATA_KEY);
    return saved ? JSON.parse(saved) : [10, 20, 30, 40];
  });
  const [llType, setLlType] = useState<LLType>(() => {
    const saved = sessionStorage.getItem(STORAGE_TYPE_KEY);
    return (saved as LLType) || 'sll';
  });

  const [inputValue, setInputValue] = useState('');
  const [insertIndex, setInsertIndex] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [activeOp, setActiveOp] = useState('');

  const [steps, setSteps] = useState<LLStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);

  // Persistence Effect
  useEffect(() => {
    sessionStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data));
    sessionStorage.setItem(STORAGE_TYPE_KEY, llType);
  }, [data, llType]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const dragInfo = useRef<{ id: string, startX: number, startY: number, nodeStartX: number, nodeStartY: number } | null>(null);

  const getDefaultPos = (index: number) => {
    const nodesPerRow = 6;
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    return { x: col * 130, y: row * 100 };
  };

  // Memory Address Helper (Decimal)
  const getAddr = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    // Return a 3-digit decimal address
    const dec = (Math.abs(hash) % 900) + 100;
    return dec.toString();
  };

  const getPathD = (sx: number, sy: number, ex: number, ey: number, isCircular = false) => {
    if (isCircular) {
      return `M ${sx} ${sy} C ${sx + 80} ${sy + 120}, ${ex - 80} ${ey + 120}, ${ex - 2} ${ey}`;
    }
    const dx = ex - sx;
    if (dx > 40) {
      const offset = Math.max(40, dx * 0.4);
      return `M ${sx} ${sy} C ${sx + offset} ${sy}, ${ex - offset} ${ey}, ${ex - 2} ${ey}`;
    } else {
      const hOffset = 80;
      const vOffset = Math.max(60, Math.abs(ey - sy) * 0.4);
      return `M ${sx} ${sy} C ${sx + hOffset} ${sy + vOffset}, ${ex - hOffset} ${ey - vOffset}, ${ex - 2} ${ey}`;
    }
  };

  const getPrevPathD = (sx: number, sy: number, ex: number, ey: number) => {
    const dx = ex - sx;
    if (dx < -40) {
      const offset = Math.max(40, Math.abs(dx) * 0.4);
      return `M ${sx} ${sy} C ${sx - offset} ${sy}, ${ex + offset} ${ey}, ${ex + 2} ${ey}`;
    } else {
      const hOffset = 80;
      const vOffset = Math.max(60, Math.abs(ey - sy) * 0.4);
      return `M ${sx} ${sy} C ${sx - hOffset} ${sy + vOffset}, ${ex + hOffset} ${ey - vOffset}, ${ex + 2} ${ey}`;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>, id: string, index: number) => {
    const nodeElem = e.currentTarget;
    nodeElem.setPointerCapture(e.pointerId);
    const pos = nodePositions[id] || getDefaultPos(index);
    dragInfo.current = { id, startX: e.clientX, startY: e.clientY, nodeStartX: pos.x, nodeStartY: pos.y };
    setDraggingNode(id);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!draggingNode || !dragInfo.current) return;
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;

    let newX = dragInfo.current.nodeStartX + dx;
    let newY = dragInfo.current.nodeStartY + dy;

    const svg = (e.target as Element).closest('svg');
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const nodeWidth = llType === 'dll' ? 105 : 70;
      const minX = -40;
      const maxX = Math.max(minX, rect.width - nodeWidth - 60);
      const minY = -90;
      const maxY = Math.max(minY, rect.height - 180);

      if (newX < minX) newX = minX;
      if (newX > maxX) newX = maxX;
      if (newY < minY) newY = minY;
      if (newY > maxY) newY = maxY;
    }

    const node = draggingNode;
    setNodePositions(prev => ({ ...prev, [node]: { x: newX, y: newY } }));
  };

  const handlePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (draggingNode) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingNode(null);
      dragInfo.current = null;
    }
  };

  useEffect(() => { return () => stopPlayback(); }, []);

  function stopPlayback() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
  }

  function playSteps(newSteps: LLStep[]) {
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
        return;
      }
      setCurrentStep(idx);
    }, speed);
    intervalRef.current = id;
  }

  const handleInsertHead = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    const oldData = [...data];
    setData([val, ...oldData]);
    setActiveOp('Insert Head');
    setInputValue('');
    playSteps(generateInsertHeadSteps(oldData, val, llType));
  };

  const handleInsertTail = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;
    const oldData = [...data];
    setData([...oldData, val]);
    setActiveOp('Insert Tail');
    setInputValue('');
    playSteps(generateInsertTailSteps(oldData, val, llType));
  };

  const handleInsertAt = () => {
    const val = parseInt(inputValue, 10);
    const idx = parseInt(insertIndex, 10);
    if (isNaN(val) || isNaN(idx)) return;
    const oldData = [...data];

    // We update data immediately for the visual container, 
    // but the engine handles the STEP nodes.
    const before = oldData.slice(0, idx);
    const after = oldData.slice(idx);
    const newData = [...before, val, ...after];

    setActiveOp('Insert At');
    setInputValue('');
    setInsertIndex('');
    playSteps(generateInsertAtSteps(oldData, val, idx, llType));

    setTimeout(() => {
      setData(newData);
      setNodePositions({});
    }, generateInsertAtSteps(oldData, val, idx, llType).length * speed);
  };

  const handleDeleteAt = () => {
    const idx = parseInt(insertIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= data.length) return;
    const oldData = [...data];
    const newData = oldData.filter((_, i) => i !== idx);

    setActiveOp('Delete At');
    setInsertIndex('');
    playSteps(generateDeleteAtSteps(oldData, idx, llType));

    setTimeout(() => {
      setData(newData);
      setNodePositions({});
    }, generateDeleteAtSteps(oldData, idx, llType).length * speed);
  };

  const handleDeleteHead = () => {
    const oldData = [...data];
    setData(oldData.slice(1));
    setActiveOp('Delete Head');
    playSteps(generateDeleteHeadSteps(oldData, llType));
  };

  const handleDeleteTail = () => {
    const oldData = [...data];
    setData(oldData.slice(0, -1));
    setActiveOp('Delete Tail');
    playSteps(generateDeleteTailSteps(oldData, llType));
  };

  const handleSearch = () => {
    const val = parseInt(searchValue, 10);
    if (isNaN(val)) return;
    setActiveOp('Search');
    setSearchValue('');
    playSteps(generateSearchSteps(data, val, llType));
  };

  const handleTraverse = () => {
    setActiveOp('Traverse');
    playSteps(generateTraverseSteps(data, llType));
  };

  const handleReverse = () => {
    setActiveOp('Reverse');
    playSteps(generateReverseSteps(data, llType));
  };

  const handleReset = () => {
    stopPlayback();
    setSteps([]);
    setCurrentStep(-1);
    setActiveOp('');
  };

  const handleClear = () => {
    handleReset();
    setData([]);
    setNodePositions({});
  };

  const handleRandom = () => {
    handleReset();
    const len = Math.floor(Math.random() * 5) + 3;
    setData(Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10));
    setNodePositions({});
  };

  const currentDisplay = currentStep >= 0 && steps[currentStep] ? steps[currentStep].nodes :
    data.map((v, i) => ({ id: `d_${i}`, value: v, state: 'default' as any, x: 0, y: 0 }));
  const compInfo = activeOp ? LL_COMPLEXITY[activeOp] : null;
  const progress = steps.length > 0 ? Math.round(((currentStep + 1) / steps.length) * 100) : 0;

  // Render nodes with drag capability via SVG group transform
  return (
    <div className="ll-container">
      {/* SIDEBAR */}
      <div className="ll-sidebar">
        <div className="ll-header">
          {onBack && (
            <button className="ll-back-btn" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          )}
          <h2>Linked List</h2>
          <p>Node connections & dynamic memory</p>
        </div>

        <div className="ll-type-tabs">
          <button className={`ll-type-tab ${llType === 'sll' ? 'active' : ''}`} onClick={() => { setLlType('sll'); setNodePositions({}); handleReset(); }}>Singly</button>
          <button className={`ll-type-tab ${llType === 'dll' ? 'active' : ''}`} onClick={() => { setLlType('dll'); setNodePositions({}); handleReset(); }}>Doubly</button>
          <button className={`ll-type-tab ${llType === 'cll' ? 'active' : ''}`} onClick={() => { setLlType('cll'); setNodePositions({}); handleReset(); }}>Circular</button>
        </div>

        <div className="ll-section-title">Insertion & Deletion</div>
        <div className="ll-input-main-row">
          <input
            type="number"
            placeholder="Value..."
            className="ll-input-main"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className="ll-actions-grid">
          <button className="ll-btn-action primary" onClick={handleInsertHead}>+ Head</button>
          <button className="ll-btn-action primary" onClick={handleInsertTail}>+ Tail</button>
          <button className="ll-btn-action danger-outline" onClick={handleDeleteHead}>Del Head</button>
          <button className="ll-btn-action danger-outline" onClick={handleDeleteTail}>Del Tail</button>
        </div>

        <div className="ll-insert-at-row" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <input
            type="number"
            placeholder="Index (e.g. 2)"
            className="ll-input-main"
            style={{ flex: 1 }}
            value={insertIndex}
            onChange={(e) => setInsertIndex(e.target.value)}
          />
          <button
            className="ll-btn-action primary"
            style={{ flex: '0 0 100px' }}
            onClick={handleInsertAt}
          >
            Insert At
          </button>
          <button
            className="ll-btn-action danger"
            style={{ flex: '0 0 100px' }}
            onClick={handleDeleteAt}
          >
            Delete At
          </button>
        </div>

        <div className="ll-divider" />

        <div className="ll-section-title">Operations</div>
        <div className="ll-search-row">
          <input
            type="number"
            placeholder="Search value..."
            className="ll-input-main"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button className="ll-btn-action primary" style={{ flex: '0 0 70px' }} onClick={handleSearch}>Search</button>
        </div>

        <div className="ll-actions-grid">
          <button className="ll-btn-action" onClick={handleTraverse}>Traverse</button>
          <button className="ll-btn-action" onClick={handleReverse}>Reverse</button>
          <button className="ll-btn-action danger" onClick={handleClear}>Clear</button>
          <button className="ll-btn-action" onClick={handleRandom}>Random</button>
        </div>

        <hr className="ll-divider" />

        {compInfo && (
          <div className="ll-complexity-card">
            <h3 className="ll-section-title">Complexity: {compInfo.operation}</h3>
            <div className="ll-complexity-grid">
              <div className="ll-complexity-item best"><span>Best</span><strong>{compInfo.best}</strong></div>
              <div className="ll-complexity-item avg"><span>Average</span><strong>{compInfo.avg}</strong></div>
              <div className="ll-complexity-item worst"><span>Worst</span><strong>{compInfo.worst}</strong></div>
              <div className="ll-complexity-item space"><span>Space</span><strong>{compInfo.space}</strong></div>
            </div>
            <p className="ll-complexity-desc">{compInfo.desc}</p>
          </div>
        )}

      </div>

      {/* MAIN */}
      <div className="ll-main">
        <div className="ll-controls-bar">
          <div className="ll-playback">
            <button className="ll-ctrl-btn reset" onClick={handleReset} title="Reset">↺</button>
          </div>
          <div className="ll-speed-control">
            <span>Speed</span>
            <input type="range" min={100} max={1500} step={100} value={1600 - speed} onChange={e => setSpeed(1600 - parseInt(e.target.value))} />
            <span>{speed < 400 ? 'Fast' : speed < 900 ? 'Med' : 'Slow'}</span>
          </div>
          {steps.length > 0 && <div className="ll-step-counter">Step {Math.max(0, currentStep + 1)} / {steps.length}</div>}
        </div>

        {steps.length > 0 && (
          <div className="ll-progress-bar-wrap">
            <div className="ll-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="ll-status-bar">
          <span className={`ll-status-badge ${llType}`}>{llType.toUpperCase()} Mode</span>
          <span className="ll-status-text">
            {data.length > 0 ? `Head: ${getAddr(`n0_${data[0]}`)}` : "List is Empty"}
          </span>
          <span className="ll-status-text" style={{ marginLeft: 'auto', opacity: 0.8 }}>
            {llType === 'sll' ? 'Next pointers only.' :
              llType === 'dll' ? 'Next & Prev pointers.' :
                'Circular: Tail points to Head.'}
          </span>
        </div>

        <div className="ll-canvas">
          <div className="ll-svg-wrap">
            {currentDisplay.length === 0 ? (
              <div className="ll-empty-state">
                <div className="ll-empty-icon">⛓️</div>
                <div className="ll-empty-title">List is Empty</div>
                <div className="ll-empty-sub">Add nodes to begin visualizing.</div>
              </div>
            ) : (
              <svg className="ll-svg-canvas" width="100%" height="100%">
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#0D9488" />
                  </marker>
                  <marker id="arrowhead-prev" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#8B5CF6" />
                  </marker>
                  <marker id="arrowhead-circ" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
                  </marker>
                </defs>
                <g transform="translate(50, 100)">
                  {currentDisplay.map((node, i) => {
                    const pos = nodePositions[node.id] || getDefaultPos(i);
                    const isLast = i === currentDisplay.length - 1;
                    const nextNode = isLast ? null : currentDisplay[i + 1];
                    const nextPos = nextNode ? (nodePositions[nextNode.id] || getDefaultPos(i + 1)) : null;

                    const currentAddr = getAddr(node.id);
                    const nextAddr = nextNode ? getAddr(nextNode.id) : "NULL";
                    const isDll = llType === 'dll';
                    const nodeWidth = isDll ? 105 : 70;
                    const prevAddr = isDll && i > 0 ? getAddr(currentDisplay[i - 1].id) : "NULL";

                    return (
                      <g key={node.id}
                        className={`ll-node-group ll-node-${node.state}`}
                        onPointerDown={(e) => handlePointerDown(e, node.id, i)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                      >
                        {/* Connecting Arrow */}
                        {!isLast && nextPos && (
                          <path d={getPathD(pos.x + nodeWidth, pos.y + (isDll ? 12 : 17), nextPos.x, nextPos.y + (isDll ? 12 : 17))}
                            className="ll-arrow next" fill="none" />
                        )}

                        {/* Circular Arrow */}
                        {isLast && llType === 'cll' && currentDisplay.length > 0 && (
                          <path d={getPathD(pos.x + nodeWidth, pos.y + 17, (nodePositions[currentDisplay[0].id] || getDefaultPos(0)).x, (nodePositions[currentDisplay[0].id] || getDefaultPos(0)).y + 17, true)}
                            className="ll-arrow circular" fill="none" />
                        )}

                        {/* Doubly Prev Arrow */}
                        {isDll && i > 0 && (
                          <path d={getPrevPathD(pos.x, pos.y + 24, (nodePositions[currentDisplay[i - 1].id] || getDefaultPos(i - 1)).x + nodeWidth, (nodePositions[currentDisplay[i - 1].id] || getDefaultPos(i - 1)).y + 24)}
                            className="ll-arrow prev" fill="none" />
                        )}

                        {/* Node Box */}
                        <g transform={`translate(${pos.x}, ${pos.y})`}>
                          {isDll ? (
                            <>
                              <rect x="0" y="0" width="105" height="35" className="ll-node-rect" />
                              <line x1="35" y1="0" x2="35" y2="35" className="ll-node-divider" />
                              <line x1="70" y1="0" x2="70" y2="35" className="ll-node-divider" />

                              <text x="17.5" y="17.5" className="ll-addr-text" dominantBaseline="middle" textAnchor="middle" fontSize="10">{prevAddr}</text>
                              <text x="52.5" y="17.5" className="ll-data-text" dominantBaseline="middle" textAnchor="middle" fontSize="12">{node.value}</text>
                              <text x="87.5" y="17.5" className="ll-addr-text" dominantBaseline="middle" textAnchor="middle" fontSize="10">{nextAddr}</text>

                              <text x="52.5" y="48" className="ll-addr-label" textAnchor="middle" fontSize="8" fontWeight="bold">Addr: {currentAddr}</text>

                              {i === 0 && (
                                <g transform="translate(52.5, -18)">
                                  <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#14B8A6" stroke="#fff" strokeWidth="2" />
                                  <text dy=".35em" className="ll-marker-text" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">HEAD</text>
                                </g>
                              )}
                              {i === currentDisplay.length - 1 && i !== 0 && (
                                <g transform="translate(52.5, -15)">
                                  <rect x="-20" y="-8" width="40" height="16" rx="8" fill="#4B5563" />
                                  <text dy=".35em" className="ll-marker-text" textAnchor="middle" fontSize="9" fill="white" fontWeight="900">TAIL</text>
                                </g>
                              )}
                            </>
                          ) : (
                            <>
                              <rect x="0" y="0" width="70" height="35" className="ll-node-rect" />
                              <line x1="35" y1="0" x2="35" y2="35" className="ll-node-divider" />

                              <text x="17.5" y="17.5" className="ll-data-text" dominantBaseline="middle" textAnchor="middle" fontSize="12">{node.value}</text>
                              <text x="52.5" y="17.5" className="ll-addr-text" dominantBaseline="middle" textAnchor="middle" fontSize="10">{nextAddr}</text>

                              <text x="35" y="48" className="ll-addr-label" textAnchor="middle" fontSize="8" fontWeight="bold">Addr: {currentAddr}</text>

                              {i === 0 && (
                                <g transform="translate(35, -18)">
                                  <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#14B8A6" stroke="#fff" strokeWidth="2" />
                                  <text dy=".35em" className="ll-marker-text" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">HEAD</text>
                                </g>
                              )}
                              {i === currentDisplay.length - 1 && i !== 0 && (
                                <g transform="translate(35, -15)">
                                  <rect x="-20" y="-8" width="40" height="16" rx="8" fill="#4B5563" />
                                  <text dy=".35em" className="ll-marker-text" textAnchor="middle" fontSize="9" fill="white" fontWeight="900">TAIL</text>
                                </g>
                              )}
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          <div className="ll-log-area">
            <div className="ll-console-header">
              <span className="ll-console-icon">🖥️</span>
              <h3>Execution Debug Console</h3>
              <div className="ll-console-status">System Operational</div>
            </div>
            {steps.length === 0 ? (
              <div className="ll-log-empty">
                <span>⚡ System Ready. Select an operation to start.</span>
              </div>
            ) : (
              <div className="ll-log-list">
                {steps.slice(0, currentStep + 1).map((step, i) => (
                  <div key={i} className="ll-log-item" style={{ opacity: i === currentStep ? 1 : 0.6 }}>
                    <span className="ll-log-step">Step {i + 1} / {steps.length}</span>
                    <span className="ll-log-text">{step.description}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualizer;
