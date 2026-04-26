import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { AlgorithmId, AlgoStep, Graph, GraphNode, GraphEdge } from './GraphEngine';
import { ALGORITHMS, DEFAULT_GRAPH, runAlgorithm, generateRandomGraph } from './GraphEngine';
import './GraphVisualizer.css';

interface Props { onBack: () => void; }

type NodeState = 'unvisited' | 'frontier' | 'explored' | 'current' | 'path' | 'goal' | 'start';

function getNodeState(
  nodeId: string, step: AlgoStep | null,
  startId: string, goalId: string
): NodeState {
  if (!step) return nodeId === startId ? 'start' : 'unvisited';
  if (step.foundPath?.includes(nodeId)) {
    if (nodeId === goalId) return 'goal';
    return 'path';
  }
  if (step.currentNode === nodeId) return 'current';
  if (step.frontierNodes.includes(nodeId)) return 'frontier';
  if (step.exploredNodes.includes(nodeId)) return 'explored';
  if (nodeId === startId) return 'start';
  return 'unvisited';
}

const STATE_CLASS: Record<NodeState, string> = {
  unvisited: 'gv-node-unvisited',
  frontier:  'gv-node-frontier',
  explored:  'gv-node-explored',
  current:   'gv-node-current',
  path:      'gv-node-path',
  goal:      'gv-node-goal-found',
  start:     'gv-node-start',
};

const STATE_LABEL: Record<NodeState, string> = {
  unvisited: 'Unvisited',
  frontier:  'Frontier / Open',
  explored:  'Explored',
  current:   'Current',
  path:      'Found Path',
  goal:      'Goal (Found)',
  start:     'Start Node',
};

const LEGEND_STATES: NodeState[] = ['start','current','frontier','explored','path','goal'];

function useSessionState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default function GraphVisualizer({ onBack }: Props) {
  const [graph, setGraph] = useState<Graph>(() => {
    const saved = sessionStorage.getItem('graphSimulatorData');
    try { return saved ? JSON.parse(saved) : DEFAULT_GRAPH; } catch { return DEFAULT_GRAPH; }
  });

  // Settings that should be preserved across reloads
  const [algoId, setAlgoId] = useSessionState<AlgorithmId>('gv_algoId', 'bfs');
  const [startNode, setStartNode] = useSessionState<string>('gv_startNode', 'A');
  const [goalNode, setGoalNode]   = useSessionState<string>('gv_goalNode', 'G');
  const [param, setParam] = useSessionState<number>('gv_param', 2);
  const [speed, setSpeed] = useSessionState<number>('gv_speed', 700);
  const [mode, setMode] = useSessionState<'run'|'edit'>('gv_mode', 'run');
  const [builderTab, setBuilderTab] = useSessionState<'random'|'nodes'|'edges'>('gv_builderTab', 'random');
  const [randNodes, setRandNodes] = useSessionState<number>('gv_randNodes', 7);
  const [randDensity, setRandDensity] = useSessionState<number>('gv_randDensity', 0.4);

  // Temporary builder state
  const [addNodeId, setAddNodeId] = useState('');
  const [addNodeH, setAddNodeH] = useState(0);
  const [edgeFrom, setEdgeFrom] = useState('');
  const [edgeTo, setEdgeTo] = useState('');
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string|null>(null);

  // Playback state
  const [steps, setSteps] = useState<AlgoStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [tooltip, setTooltip] = useState<{x:number;y:number;text:string}|null>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      sessionStorage.setItem('graphSimulatorData', JSON.stringify(graph));
    }, 500); // debounce to avoid stuttering on drag
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [graph]);

  const playRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const logRef  = useRef<HTMLDivElement>(null);
  const svgRef  = useRef<SVGSVGElement>(null);

  // drag state for node editing
  const dragging = useRef<{id:string; offsetX:number; offsetY:number}|null>(null);

  const algo = ALGORITHMS.find(a => a.id === algoId)!;
  const step = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  /* ── Auto-play ── */
  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i >= steps.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, speed);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [playing, speed, steps.length]);

  /* ── Auto-scroll log ── */
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [stepIdx]);

  /* ── Run ── */
  const handleRun = useCallback(() => {
    setPlaying(false);
    const s = runAlgorithm(algoId, graph, startNode, goalNode, param);
    setSteps(s);
    setStepIdx(0);
  }, [algoId, graph, startNode, goalNode, param]);

  const handleReset = () => { setPlaying(false); setSteps([]); setStepIdx(-1); };

  /* ── Graph Builder ── */
  const handleGenerateRandom = () => {
    const g = generateRandomGraph(randNodes, randDensity, graph.directed);
    setGraph(g);
    setStartNode(g.nodes[0].id);
    setGoalNode(g.nodes[g.nodes.length - 1].id);
    handleReset();
  };

  const handleAddNode = () => {
    const id = addNodeId.trim().toUpperCase();
    if (!id || graph.nodes.find(n => n.id === id)) return;
    const cx = 200 + Math.random() * 200;
    const cy = 150 + Math.random() * 200;
    const newNode: GraphNode = { id, label: id, x: cx, y: cy, heuristic: addNodeH };
    setGraph(g => ({ ...g, nodes: [...g.nodes, newNode] }));
    setAddNodeId('');
    setAddNodeH(0);
  };

  const handleRemoveNode = (id: string) => {
    setGraph(g => ({
      ...g,
      nodes: g.nodes.filter(n => n.id !== id),
      edges: g.edges.filter(e => e.from !== id && e.to !== id),
    }));
    if (startNode === id) setStartNode(graph.nodes[0]?.id ?? '');
    if (goalNode === id) setGoalNode(graph.nodes[graph.nodes.length - 1]?.id ?? '');
    if (selectedNode === id) setSelectedNode(null);
    handleReset();
  };

  const handleAddEdge = () => {
    if (!edgeFrom || !edgeTo || edgeFrom === edgeTo) return;
    const key = graph.directed ? `${edgeFrom}->${edgeTo}` : [edgeFrom, edgeTo].sort().join('-');
    const exists = graph.edges.some(e => {
      const k = graph.directed ? `${e.from}->${e.to}` : [e.from, e.to].sort().join('-');
      return k === key;
    });
    if (exists) return;
    const newEdge: GraphEdge = { from: edgeFrom, to: edgeTo, weight: edgeWeight };
    setGraph(g => ({ ...g, edges: [...g.edges, newEdge] }));
    handleReset();
  };

  const handleRemoveEdge = (from: string, to: string) => {
    setGraph(g => ({ ...g, edges: g.edges.filter(e => !(e.from === from && e.to === to)) }));
    handleReset();
  };

  const handleUpdateHeuristic = (id: string, h: number) => {
    setGraph(g => ({ ...g, nodes: g.nodes.map(n => n.id === id ? { ...n, heuristic: h } : n) }));
  };

  /* ── SVG drag ── */
  const onSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging.current || mode !== 'edit') return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const sx = svgEl.viewBox.baseVal.width  / rect.width;
    const sy = svgEl.viewBox.baseVal.height / rect.height;
    
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top)  * sy;
    
    const dragId = dragging.current.id;
    const nx = mx + dragging.current.offsetX;
    const ny = my + dragging.current.offsetY;

    setGraph(g => ({
      ...g,
      nodes: g.nodes.map(n => n.id === dragId ? { ...n, x: nx, y: ny } : n),
    }));
  };

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const sx = svgEl.viewBox.baseVal.width  / rect.width;
    const sy = svgEl.viewBox.baseVal.height / rect.height;
    
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top)  * sy;
    
    const node = graph.nodes.find(n => n.id === id);
    if (!node) return;

    dragging.current = { 
      id, 
      offsetX: node.x - mx, 
      offsetY: node.y - my 
    };
  };

  const onSvgMouseUp = () => { dragging.current = null; };

  /* ── edge path state ── */
  const isOnPath = (from: string, to: string) => {
    if (!step?.foundPath) return false;
    const p = step.foundPath;
    for (let i = 0; i < p.length - 1; i++) {
      if ((p[i]===from && p[i+1]===to)||(p[i]===to && p[i+1]===from)) return true;
    }
    return false;
  };

  const isFrontierEdge = (from: string, to: string) => {
    if (!step) return false;
    return (step.currentNode===from && step.frontierNodes.includes(to)) ||
           (step.currentNode===to   && step.frontierNodes.includes(from));
  };

  /* ── Tooltip ── */
  const showTip = (e: React.MouseEvent, text: string) => {
    setTooltip({ x: e.clientX + 12, y: e.clientY - 20, text });
  };

  /* ── Log entry class ── */
  const logClass = (msg: string, i: number) => {
    let cls = 'gv-log-entry';
    if (i === stepIdx) cls += ' active';
    if (msg.startsWith('🎯')) cls += ' found';
    else if (msg.startsWith('❌')) cls += ' fail';
    else if (msg.startsWith('🔄')) cls += ' reset';
    else cls += ' normal';
    return cls;
  };

  const nodeList = graph.nodes.map(n => n.id);
  const algoColor = algo.color;

  return (
    <div className="gv-root">
      {/* Header */}
      <div className="gv-header">
        <div className="gv-header-left">
          <button className="gv-back-btn" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <div className="gv-title-block">
            <h1>Graph Search Simulator</h1>
            <p>Visualize 10 search algorithms on interactive graphs</p>
          </div>
        </div>
        <span className={`gv-badge ${algo.category === 'Informed' ? 'informed' : 'uninformed'}`}>
          {algo.category} — {algo.name}
        </span>
      </div>

      {/* Body */}
      <div className="gv-body">
        {/* Left Panel */}
        <div className="gv-left">
          {/* Algorithm Selection */}
          <div className="gv-section">
            <div className="gv-section-title">Algorithm</div>
            <div className="gv-algo-grid">
              {ALGORITHMS.map(a => (
                <button
                  key={a.id}
                  className={`gv-algo-btn${algoId === a.id ? ' active' : ''}`}
                  style={algoId === a.id ? { background: a.color } : {}}
                  onClick={() => { setAlgoId(a.id); handleReset(); setParam(a.paramDefault ?? 2); }}
                  onMouseMove={e => showTip(e, a.description)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <span className="gv-algo-name" style={algoId === a.id ? { color: '#fff' } : {}}>
                    {a.name}
                  </span>
                  <span className="gv-algo-cat" style={algoId === a.id ? { color: 'rgba(255,255,255,0.7)' } : {}}>
                    {a.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nodes + Param */}
          <div className="gv-section">
            <div className="gv-section-title">Configuration</div>
            <div className="gv-node-row">
              <span className="gv-node-label">Start</span>
              <select className="gv-node-select" value={startNode}
                onChange={e => { setStartNode(e.target.value); handleReset(); }}>
                {nodeList.map(id => <option key={id}>{id}</option>)}
              </select>
            </div>
            <div className="gv-node-row">
              <span className="gv-node-label">Goal</span>
              <select className="gv-node-select" value={goalNode}
                onChange={e => { setGoalNode(e.target.value); handleReset(); }}>
                {nodeList.map(id => <option key={id}>{id}</option>)}
              </select>
            </div>
            {algo.paramLabel && (
              <div className="gv-param-row">
                <label>{algo.paramLabel}</label>
                <input type="number" className="gv-param-input" value={param} min={1} max={10}
                  onChange={e => setParam(Number(e.target.value))} />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="gv-section">
            <div className="gv-section-title">Playback</div>
            <div className="gv-controls">
              <button className="gv-ctrl-btn" title="To Start"
                disabled={stepIdx <= 0} onClick={() => { setPlaying(false); setStepIdx(0); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
              </button>
              <button className="gv-ctrl-btn" title="Step Back"
                disabled={stepIdx <= 0} onClick={() => { setPlaying(false); setStepIdx(i => Math.max(0, i-1)); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon></svg>
              </button>
              <button className="gv-ctrl-btn" title={playing ? 'Pause' : 'Play'}
                disabled={steps.length === 0} onClick={() => setPlaying(p => !p)}
                style={{ color: playing ? '#EF4444' : '#10B981' }}>
                {playing ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                )}
              </button>
              <button className="gv-ctrl-btn" title="Step Forward"
                disabled={stepIdx >= steps.length - 1 || steps.length === 0}
                onClick={() => { setPlaying(false); setStepIdx(i => Math.min(steps.length-1, i+1)); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon></svg>
              </button>
              <button className="gv-ctrl-btn" title="To End"
                disabled={stepIdx >= steps.length - 1 || steps.length === 0}
                onClick={() => { setPlaying(false); setStepIdx(steps.length - 1); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
              </button>
            </div>
            <div className="gv-speed-row">
              <label>Speed</label>
              <input type="range" className="gv-speed-slider" min={100} max={1500} step={100}
                value={1600 - speed} onChange={e => setSpeed(1600 - Number(e.target.value))} />
            </div>
            <button className="gv-run-btn" style={{ background: algoColor }} onClick={handleRun}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              RUN {algo.name.toUpperCase()}
            </button>
            {steps.length > 0 && (
              <div className="gv-step-info">
                Step {stepIdx + 1} / {steps.length}
              </div>
            )}
          </div>

          {/* Mode */}
          <div className="gv-section">
            <div className="gv-section-title">Graph Mode</div>
            <div className="gv-mode-tabs">
              <button className={`gv-mode-tab${mode==='run' ? ' active' : ''}`} onClick={() => setMode('run')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{marginRight: '4px', verticalAlign: 'middle'}}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Run
              </button>
              <button className={`gv-mode-tab${mode==='edit' ? ' active' : ''}`} onClick={() => { setMode('edit'); }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Edit
              </button>
            </div>
            {mode === 'edit' && (
              <p className="gv-edit-hint" style={{ marginTop: 8 }}>
                Drag nodes to reposition on canvas.
              </p>
            )}
          </div>

          {/* Graph Builder */}
          <div className="gv-section">
            <div className="gv-section-title">Graph Builder</div>
            <div className="gv-builder-tabs">
              <button className={`gv-builder-tab${builderTab==='random'?' active':''}`} onClick={() => setBuilderTab('random')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
                Random
              </button>
              <button className={`gv-builder-tab${builderTab==='nodes'?' active':''}`} onClick={() => setBuilderTab('nodes')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg>
                Nodes
              </button>
              <button className={`gv-builder-tab${builderTab==='edges'?' active':''}`} onClick={() => setBuilderTab('edges')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}><path d="M5 12h14"/><path d="M15 16l4-4-4-4"/></svg>
                Edges
              </button>
            </div>

            {builderTab === 'random' && (
              <div className="gv-builder-panel">
                <div className="gv-builder-row">
                  <label>Nodes</label>
                  <input type="number" className="gv-param-input" value={randNodes} min={3} max={20}
                    onChange={e => setRandNodes(Number(e.target.value))} />
                </div>
                <div className="gv-builder-row">
                  <label>Density</label>
                  <input type="range" className="gv-speed-slider" min={0} max={1} step={0.1}
                    value={randDensity} onChange={e => setRandDensity(Number(e.target.value))} />
                  <span className="gv-builder-val">{Math.round(randDensity * 100)}%</span>
                </div>
                <div className="gv-builder-row">
                  <label>Directed</label>
                  <button className={`gv-toggle-btn${graph.directed?' on':''}`}
                    onClick={() => setGraph(g => ({ ...g, directed: !g.directed }))}>
                    {graph.directed ? '✓ On' : '✗ Off'}
                  </button>
                </div>
                <button className="gv-gen-btn" onClick={handleGenerateRandom}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>
                  Generate Random Graph
                </button>
                <button className="gv-gen-btn gv-gen-btn--outline" onClick={() => { setGraph(DEFAULT_GRAPH); setStartNode('A'); setGoalNode('G'); handleReset(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Reset to Default
                </button>
              </div>
            )}

            {builderTab === 'nodes' && (
              <div className="gv-builder-panel">
                <div className="gv-builder-row">
                  <label>ID</label>
                  <input className="gv-mini-input" placeholder="e.g. X" maxLength={3}
                    value={addNodeId} onChange={e => setAddNodeId(e.target.value.toUpperCase())} />
                </div>
                <div className="gv-builder-row">
                  <label>h(n)</label>
                  <input type="number" className="gv-param-input" value={addNodeH} min={0} max={99}
                    onChange={e => setAddNodeH(Number(e.target.value))} />
                </div>
                <button className="gv-gen-btn" onClick={handleAddNode}>+ Add Node</button>
                <div className="gv-node-list">
                  {graph.nodes.map(n => (
                    <div key={n.id} className={`gv-node-item${selectedNode===n.id?' selected':''}`}
                      onClick={() => setSelectedNode(selectedNode===n.id ? null : n.id)}>
                      <span className="gv-node-item-id">{n.id}</span>
                      <span className="gv-node-item-h">h={n.heuristic}</span>
                      {selectedNode === n.id && (
                        <>
                          <input type="number" className="gv-inline-h"
                            value={n.heuristic} min={0} max={99}
                            onClick={e => e.stopPropagation()}
                            onChange={e => handleUpdateHeuristic(n.id, Number(e.target.value))} />
                          <button className="gv-del-btn" onClick={e => { e.stopPropagation(); handleRemoveNode(n.id); }} title="Delete Node">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {builderTab === 'edges' && (
              <div className="gv-builder-panel">
                <div className="gv-builder-row">
                  <label>From</label>
                  <select className="gv-mini-select" value={edgeFrom} onChange={e => setEdgeFrom(e.target.value)}>
                    <option value="">--</option>
                    {graph.nodes.map(n => <option key={n.id}>{n.id}</option>)}
                  </select>
                </div>
                <div className="gv-builder-row">
                  <label>To</label>
                  <select className="gv-mini-select" value={edgeTo} onChange={e => setEdgeTo(e.target.value)}>
                    <option value="">--</option>
                    {graph.nodes.map(n => <option key={n.id}>{n.id}</option>)}
                  </select>
                </div>
                <div className="gv-builder-row">
                  <label>Weight</label>
                  <input type="number" className="gv-param-input" value={edgeWeight} min={1} max={99}
                    onChange={e => setEdgeWeight(Number(e.target.value))} />
                </div>
                <button className="gv-gen-btn" onClick={handleAddEdge}>+ Add Edge</button>
                <div className="gv-edge-list">
                  {graph.edges.map((e, i) => (
                    <div key={i} className="gv-edge-item">
                      <span>{e.from} → {e.to}</span>
                      <span className="gv-edge-w">w={e.weight}</span>
                      <button className="gv-del-btn" onClick={() => handleRemoveEdge(e.from, e.to)} title="Delete Edge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="gv-section">
            <div className="gv-section-title">Legend</div>
            <div className="gv-legend">
              {LEGEND_STATES.map(s => (
                <div key={s} className="gv-legend-item">
                  <div className="gv-legend-dot" style={{
                    background: s==='start'?'#E0E7FF':s==='current'?'#BBF7D0':s==='frontier'?'#FEF3C7':
                                s==='explored'?'#DBEAFE':s==='path'?'#FDE68A':'#6EE7B7',
                    border: `2px solid ${s==='start'?'#6366F1':s==='current'?'#10B981':s==='frontier'?'#F59E0B':
                             s==='explored'?'#3B82F6':s==='path'?'#F59E0B':'#059669'}`
                  }}/>
                  {STATE_LABEL[s]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="gv-canvas-area">
          <svg
            ref={svgRef}
            viewBox="0 0 620 560"
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseLeave={onSvgMouseUp}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" />
              </marker>
              <marker id="arrow-path" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#F59E0B" />
              </marker>
              <marker id="arrow-frontier" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#3B82F6" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {graph.edges.map((edge, i) => {
              const from = graph.nodes.find(n => n.id === edge.from)!;
              const to   = graph.nodes.find(n => n.id === edge.to)!;
              if (!from || !to) return null;
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              const onPath = isOnPath(edge.from, edge.to);
              const onFrontier = isFrontierEdge(edge.from, edge.to);
              const strokeColor = onPath ? '#F59E0B' : onFrontier ? '#3B82F6' : '#94A3B8';
              const strokeW = onPath ? 3 : onFrontier ? 2 : 1.5;
              const dashArr = onPath ? '8 4' : 'none';

              return (
                <g key={i}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeDasharray={dashArr}
                    className={`graph-edge-line${onPath ? ' gv-edge-path' : ''}`}
                    markerEnd={graph.directed ? `url(#${onPath?'arrow-path':onFrontier?'arrow-frontier':'arrow'})` : undefined}
                    opacity={step && !onPath && !onFrontier && !step.exploredNodes.includes(edge.from) && !step.exploredNodes.includes(edge.to) ? 0.35 : 1}
                  />
                  <text x={mx} y={my - 6} textAnchor="middle"
                    fontSize="10" fontFamily="monospace" fontWeight="700"
                    fill={onPath ? '#F59E0B' : '#64748B'}>
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {graph.nodes.map(node => {
              const state = getNodeState(node.id, step, startNode, goalNode);
              const isCurrent = state === 'current';
              return (
                <g key={node.id}
                  onMouseDown={e => onNodeMouseDown(e, node.id)}
                  onMouseMove={e => showTip(e, `Node: ${node.id}  h(n)=${node.heuristic ?? 0}`)}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: mode === 'edit' ? 'grab' : 'default' }}>
                  {/* Glow ring for current */}
                  {isCurrent && (
                    <circle cx={node.x} cy={node.y} r={28}
                      fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.4"
                      className="gv-node-pulse" />
                  )}
                  <circle
                    cx={node.x} cy={node.y} r={22}
                    className={`graph-node-circle ${STATE_CLASS[state]}`}
                    filter={state==='goal'||state==='current' ? 'url(#glow)' : undefined}
                  />
                  <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif"
                    fill={state==='unvisited'?'var(--text-secondary)':'var(--text-primary)'}>
                    {node.label}
                  </text>
                  {/* heuristic */}
                  {node.heuristic !== undefined && (
                    <text x={node.x} y={node.y + 34} textAnchor="middle"
                      fontSize="9" fontFamily="monospace" fontWeight="600"
                      fill="#94A3B8">
                      h={node.heuristic}
                    </text>
                  )}
                  {/* start/goal labels */}
                  {node.id === startNode && (
                    <text x={node.x} y={node.y - 32} textAnchor="middle"
                      fontSize="9" fontWeight="700" fill="#6366F1" fontFamily="Inter,sans-serif">
                      START
                    </text>
                  )}
                  {node.id === goalNode && (
                    <text x={node.x} y={node.y - 32} textAnchor="middle"
                      fontSize="9" fontWeight="700" fill="#059669" fontFamily="Inter,sans-serif">
                      GOAL
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Canvas overlay buttons */}
          <div className="gv-canvas-toolbar">
            <button className="gv-canvas-tool-btn" title="Reset Layout"
              onClick={() => setGraph(DEFAULT_GRAPH)}>↺</button>
            <button className={`gv-canvas-tool-btn${graph.directed?' active':''}`}
              title="Toggle Directed" onClick={() => setGraph(g => ({ ...g, directed: !g.directed }))}>→</button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="gv-right">
          {/* Complexity */}
          <div className="gv-section">
            <div className="gv-section-title">Complexity</div>
            <div className="gv-complexity-grid">
              <div className="gv-complexity-card">
                <div className="label">Time</div>
                <div className="value">{algo.timeComplexity}</div>
              </div>
              <div className="gv-complexity-card">
                <div className="label">Space</div>
                <div className="value">{algo.spaceComplexity}</div>
              </div>
            </div>
          </div>

          {/* Properties */}
          <div className="gv-section">
            <div className="gv-section-title">Properties</div>
            <div className="gv-props">
              <div className="gv-prop-row">
                <span className="gv-prop-key">Complete</span>
                <span className={`gv-prop-val ${algo.complete?'gv-prop-yes':'gv-prop-no'}`}>
                  {algo.complete ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="gv-prop-row">
                <span className="gv-prop-key">Optimal</span>
                <span className={`gv-prop-val ${algo.optimal?'gv-prop-yes':'gv-prop-no'}`}>
                  {algo.optimal ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="gv-prop-row">
                <span className="gv-prop-key">Category</span>
                <span className="gv-prop-val" style={{
                  background: algo.category==='Informed'?'rgba(249,115,22,0.15)':'rgba(59,130,246,0.15)',
                  color: algo.category==='Informed'?'#F97316':'#3B82F6'
                }}>{algo.category}</span>
              </div>
            </div>
          </div>

          {/* Current Step */}
          <div className="gv-section">
            <div className="gv-section-title">Current Step</div>
            <div className="gv-step-card">
              <div className="gv-step-msg">
                {step ? step.message : 'Press RUN to start the simulation.'}
              </div>
              {step && (step.gScore !== undefined || step.hScore !== undefined) && (
                <div className="gv-score-row">
                  {step.gScore !== undefined && <span className="gv-score-badge gv-score-g">g={step.gScore}</span>}
                  {step.hScore !== undefined && <span className="gv-score-badge gv-score-h">h={step.hScore}</span>}
                  {step.fScore !== undefined && <span className="gv-score-badge gv-score-f">f={step.fScore.toFixed(2)}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Found Path */}
          {step?.foundPath && (
            <div className="gv-section gv-animate-in">
              <div className="gv-section-title">✅ Found Path</div>
              <div className="gv-path-display">
                {step.foundPath.map((n, i) => (
                  <React.Fragment key={i}>
                    <span className="gv-path-node">{n}</span>
                    {i < step.foundPath!.length - 1 && <span className="gv-path-arrow">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Heuristic Table */}
          <div className="gv-section">
            <div className="gv-section-title">Heuristic Values</div>
            <table className="gv-heuristic-table">
              <thead>
                <tr><th>Node</th><th>h(n)</th><th>Status</th></tr>
              </thead>
              <tbody>
                {graph.nodes.map(node => {
                  const state = getNodeState(node.id, step, startNode, goalNode);
                  return (
                    <tr key={node.id} className={step?.currentNode===node.id?'current-row':''}>
                      <td style={{ fontWeight: 700 }}>{node.id}</td>
                      <td>{node.heuristic ?? 0}</td>
                      <td style={{ fontSize: 10, color: 
                        state==='current'?'#10B981':state==='explored'?'#3B82F6':
                        state==='frontier'?'#F59E0B':state==='path'||state==='goal'?'#F59E0B':'#94A3B8' }}>
                        {state}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Log */}
          <div className="gv-section" style={{ flex: 1 }}>
            <div className="gv-section-title">Step Log</div>
            <div className="gv-log" ref={logRef}>
              {steps.map((s, i) => (
                <div key={i} className={logClass(s.message, i)}
                  onClick={() => { setPlaying(false); setStepIdx(i); }}>
                  <span style={{ opacity: 0.5, marginRight: 6 }}>{i+1}.</span>
                  {s.message}
                </div>
              ))}
              {steps.length === 0 && (
                <div style={{ color: 'var(--text-tertiary)', fontSize: 11, padding: 8 }}>
                  No steps yet. Press RUN.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="gv-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
