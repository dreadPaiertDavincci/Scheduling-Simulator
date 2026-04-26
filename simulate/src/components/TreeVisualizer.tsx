import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TreeVisualizer.css';
import {
  TREE_ALGORITHMS,
  createDefaultBST,
  generateRandomBST,
  clearTree,
  layoutTree,
  bstInsert,
  bstDelete,
  runPreorder,
  runInorder,
  runPostorder,
  runLevelOrder,
  runBSTSearchRecursive,
  buildExpressionTree,
  generateRandomExpr,
} from './TreeEngine';
import type { Tree, TreeStep, TreeAlgoId } from './TreeEngine';

interface Props {
  onBack: () => void;
}

const TreeVisualizer: React.FC<Props> = ({ onBack }) => {
  // ── State ───────────────────────────────────────
  const [tree, setTree] = useState<Tree>(() => createDefaultBST());
  const [activeAlgo, setActiveAlgo] = useState<TreeAlgoId>('preorder');
  const [steps, setSteps] = useState<TreeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [inputValue, setInputValue] = useState('');
  const [exprValue, setExprValue] = useState('2 + 3 * 4');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [targetSide, setTargetSide] = useState<'left' | 'right'>('left');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // ── Logic ───────────────────────────────────────
  const resetSimulation = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleRun = () => {
    resetSimulation();
    let generatedSteps: TreeStep[] = [];

    switch (activeAlgo) {
      case 'preorder': generatedSteps = runPreorder(tree); break;
      case 'inorder': generatedSteps = runInorder(tree); break;
      case 'postorder': generatedSteps = runPostorder(tree); break;
      case 'levelorder': generatedSteps = runLevelOrder(tree); break;
      case 'bst-rec':
        const targetRec = parseInt(inputValue);
        if (!isNaN(targetRec)) generatedSteps = runBSTSearchRecursive(tree, targetRec);
        break;
      case 'prefix-expr':
        const pResult = buildExpressionTree(exprValue, 'prefix');
        setTree(pResult.tree);
        generatedSteps = pResult.steps;
        break;
      case 'postfix-expr':
        const poResult = buildExpressionTree(exprValue, 'postfix');
        setTree(poResult.tree);
        generatedSteps = poResult.steps;
        break;
      default:
        // For Manual or unspecified, just show current
        generatedSteps = [{
          nodeStates: Object.fromEntries(Object.keys(tree.nodes).map(id => [id, 'visited'])),
          visitedOrder: [], currentNode: null, message: "Manual Mode: Build your tree using the panel."
        }];
    }

    if (generatedSteps.length > 0) {
      setSteps(generatedSteps);
      setIsPlaying(true);
    } else {
      // If empty (e.g. search with no input), show a hint
      setSteps([{
        nodeStates: {}, visitedOrder: [], currentNode: null,
        message: "⚠️ Please enter a value in the input box first!"
      }]);
    }
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 - speed);
    } else {
      setIsPlaying(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentStep, steps, speed]);

  const handleAlgoChange = (id: TreeAlgoId, diff: 'easy' | 'medium' | 'hard' = difficulty) => {
    setActiveAlgo(id);
    resetSimulation();
    setSelectedNode(null);
    if (id.includes('expr')) {
      const randomExpr = generateRandomExpr(diff);
      setExprValue(randomExpr);
      const { tree: newTree } = buildExpressionTree(randomExpr, id === 'postfix-expr' ? 'postfix' : 'prefix');
      setTree(newTree);
    }
  };

  const handleInsertBST = () => {
    if (!inputValue) return;
    const val = isNaN(Number(inputValue)) ? inputValue : Number(inputValue);
    setTree(prev => bstInsert(prev, val));
    setInputValue('');
  };

  const handleDeleteBST = () => {
    if (!inputValue) return;
    const val = isNaN(Number(inputValue)) ? inputValue : Number(inputValue);
    setTree(prev => bstDelete(prev, val));
    setInputValue('');
  };

  const handleExprChange = () => {
    const { tree: newTree, steps: newSteps } = buildExpressionTree(exprValue, activeAlgo === 'postfix-expr' ? 'postfix' : 'prefix');
    setTree(newTree);
    setSteps(newSteps);
    setCurrentStep(0);
  };



  const handleRandom = () => {
    if (activeAlgo.includes('expr')) {
      handleAlgoChange(activeAlgo);
    } else {
      setTree(generateRandomBST());
    }
    resetSimulation();
  };

  const handleReset = () => {
    if (activeAlgo.includes('expr')) {
      handleAlgoChange(activeAlgo);
    } else {
      setTree(createDefaultBST());
      setActiveAlgo('preorder');
    }
    resetSimulation();
  };

  const handleClear = () => {
    setTree(clearTree());
    setSelectedNode(null);
    resetSimulation();
  };

  const handleAddManualNode = () => {
    const side = targetSide;
    if (!selectedNode || !inputValue) return;
    const val = isNaN(parseInt(inputValue)) ? inputValue : parseInt(inputValue);
    const newId = `m-${Math.random().toString(36).slice(2, 7)}`;

    setTree(prev => {
      const next = { ...prev };
      next.nodes[newId] = { id: newId, value: val, left: null, right: null, x: 0, y: 0 };
      if (side === 'left') next.nodes[selectedNode].left = newId;
      else next.nodes[selectedNode].right = newId;
      next.nodes = layoutTree(next.nodes, next.root);
      return next;
    });
    setInputValue('');
  };

  const handleAddRoot = () => {
    if (tree.root || !inputValue) return;
    const val = isNaN(parseInt(inputValue)) ? inputValue : parseInt(inputValue);
    const newId = `root-${Math.random().toString(36).slice(2, 7)}`;
    setTree({
      nodes: { [newId]: { id: newId, value: val, left: null, right: null, x: 0, y: 0 } },
      root: newId,
      type: 'bst'
    });
    setInputValue('');
  };

  // ── Drag and Drop Logic ────────────────────────
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !svgRef.current) return;

    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const x = (e.clientX - CTM.e) / CTM.a;
    const y = (e.clientY - CTM.f) / CTM.d;

    // Apply translation offset (50, 0) from the <g> tag
    const adjustedX = x - 50;
    const adjustedY = y;

    setTree(prev => {
      const next = { ...prev };
      if (next.nodes[draggingNode]) {
        next.nodes[draggingNode].x = adjustedX;
        next.nodes[draggingNode].y = adjustedY;
      }
      return next;
    });
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  // ── Render Helpers ──────────────────────────────
  const step = steps[currentStep] || null;
  const nodeStates = step?.nodeStates || {};

  const currentTree = (activeAlgo.startsWith('trie')) ? null : tree;
  const currentTrie = (activeAlgo.startsWith('trie')) ? trie : null;

  const renderEdges = () => {
    if (currentTree) {
      return Object.values(currentTree.nodes).map(node => (
        <React.Fragment key={`edge-group-${node.id}`}>
          {node.left && (
            <line
              x1={node.x} y1={node.y}
              x2={currentTree.nodes[node.left].x} y2={currentTree.nodes[node.left].y}
              className="tree-edge-line"
              stroke="var(--border-color)"
            />
          )}
          {node.right && (
            <line
              x1={node.x} y1={node.y}
              x2={currentTree.nodes[node.right].x} y2={currentTree.nodes[node.right].y}
              className="tree-edge-line"
              stroke="var(--border-color)"
            />
          )}
        </React.Fragment>
      ));
    }
    if (currentTrie) {
      return Object.values(currentTrie.nodes).map(node => (
        Object.entries(node.children).map(([char, childId]) => (
          <React.Fragment key={`trie-edge-${node.id}-${childId}`}>
            <line
              x1={node.x} y1={node.y}
              x2={currentTrie.nodes[childId].x} y2={currentTrie.nodes[childId].y}
              className="tree-edge-line"
              stroke="var(--border-color)"
            />
            <text
              x={(node.x + currentTrie.nodes[childId].x) / 2 + 5}
              y={(node.y + currentTrie.nodes[childId].y) / 2}
              className="tv-edge-text"
            >{char}</text>
          </React.Fragment>
        ))
      ));
    }
    return null;
  };

  const renderNodes = () => {
    const nodesToRender = Object.values(tree.nodes);

    return nodesToRender.map(node => {
      const state = nodeStates[node.id] || 'default';
      const isSelected = selectedNode === node.id;

      let relClass = '';
      if (selectedNode && !isSelected) {
        const sel = tree.nodes[selectedNode];
        // Parent check
        if (sel.left === node.id || sel.right === node.id) relClass = 'child';
        // Children check
        const parent = Object.values(tree.nodes).find(n => n.left === selectedNode || n.right === selectedNode);
        if (parent?.id === node.id) relClass = 'parent';
        // Sibling check
        if (parent && (parent.left === node.id || parent.right === node.id)) relClass = 'sibling';
      }

      return (
        <g
          key={`node-group-${node.id}`}
          transform={`translate(${node.x}, ${node.y})`}
          onMouseDown={(e) => handleMouseDown(node.id, e)}
          style={{ cursor: draggingNode === node.id ? 'grabbing' : 'grab' }}
        >
          <circle
            r={22}
            className={`tree-node-circle tv-node-${state} ${isSelected ? 'selected' : ''} ${relClass}`}
            fill={isSelected ? "rgba(245, 158, 11, 0.15)" : undefined}
          />
          <text
            dy=".35em"
            textAnchor="middle"
            className="tv-node-label"
            style={{ fontWeight: isSelected ? '800' : 'normal' }}
          >
            {node.value}
          </text>
          {(state === 'active' || isSelected || relClass || node.id === tree.root) && (
            <circle
              r={relClass ? 26 : (node.id === tree.root ? 28 : 30)}
              fill="none"
              stroke={isSelected ? "#F59E0B" : (node.id === tree.root ? "#3B82F6" : (relClass === 'parent' ? "#EF4444" : relClass === 'child' ? "#10B981" : relClass === 'sibling' ? "#8B5CF6" : "#10B981"))}
              strokeWidth={isSelected || node.id === tree.root ? "4" : "2"}
              className={state === 'active' ? "tv-node-active-pulse" : (isSelected ? "tv-node-selected-glow" : "")}
              opacity={isSelected || node.id === tree.root ? "1" : "0.5"}
            />
          )}
          {/* Relationship Labels */}
          {(isSelected || relClass || node.id === tree.root) && (
            <g transform="translate(0, -35)" className="tv-rel-badge-group">
              <rect
                x="-20" y="-10"
                width="40" height="18"
                rx="9"
                className={`tv-rel-badge-bg ${isSelected ? 'sel' : (node.id === tree.root ? 'root' : relClass)}`}
              />
              <text
                textAnchor="middle"
                dy=".35em"
                className="tv-rel-badge-text"
              >
                {isSelected ? "SEL" : (node.id === tree.root ? "ROOT" : (relClass === 'parent' ? "PRNT" : relClass === 'child' ? "CHLD" : "SBLG"))}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  return (
    <div className="tv-root">
      {/* ── Header ── */}
      <div className="tv-header">
        <div className="tv-header-left">
          <button className="tv-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Hub
          </button>
          <div className="tv-title-block">
            <h1>Tree Visualizer</h1>
            <p>Master hierarchical logic and traversals.</p>
          </div>
        </div>

        <div className="tv-header-right" style={{ display: 'flex', gap: '10px' }}>
          <button className="tv-back-btn" onClick={handleRandom}>🎲 Random</button>
          <button className="tv-back-btn" onClick={handleReset}>🔄 Reset</button>
          <div className={`tv-badge ${activeAlgo.includes('bst') ? 'bst' : activeAlgo.includes('trie') ? 'trie' : activeAlgo.includes('expr') ? 'expression' : 'traversal'}`}>
            {activeAlgo.replace('-', ' ').toUpperCase()}
          </div>
        </div>
      </div>

      <div className="tv-body">
        {/* ── Left Sidebar: Algorithms & Controls ── */}
        <div className="tv-left">
          <div className="tv-section">
            <h2 className="tv-section-title">Algorithms</h2>
            <div className="tv-algo-grid">
              {TREE_ALGORITHMS.map(algo => (
                <button
                  key={algo.id}
                  className={`tv-algo-btn ${activeAlgo === algo.id ? 'active' : ''}`}
                  onClick={() => handleAlgoChange(algo.id)}
                >
                  <span className="tv-algo-name">{algo.label}</span>
                  <span className="tv-algo-cat">{algo.category}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="tv-section">
            <h2 className="tv-section-title">Modify Tree</h2>
            <div className="tv-builder-panel">
              {/* BST / AVL Builder */}
              {(activeAlgo.includes('bst') || activeAlgo.includes('avl') || activeAlgo.includes('order')) && (
                <div className="tv-form-group">
                  <div className="tv-input-row">
                    <input
                      type="text"
                      className="tv-input"
                      placeholder="Value (Number or Letter)"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button className="tv-btn" onClick={handleInsertBST}>Insert</button>
                  </div>
                  <button className="tv-btn secondary" onClick={handleDeleteBST}>Delete Value</button>
                </div>
              )}



              {/* Expression Builder */}
              {activeAlgo.includes('expr') && (
                <div className="tv-form-group">
                  <div className="tv-difficulty-row">
                    <span className="tv-diff-label">Difficulty:</span>
                    {(['easy', 'medium', 'hard'] as const).map(d => (
                      <button
                        key={d}
                        className={`tv-diff-btn ${difficulty === d ? 'active' : ''}`}
                        onClick={() => {
                          setDifficulty(d);
                          handleAlgoChange(activeAlgo, d);
                        }}
                      >
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="tv-input-row">
                    <input
                      type="text"
                      className="tv-input"
                      placeholder="e.g. (2+3)*4"
                      value={exprValue}
                      onChange={(e) => setExprValue(e.target.value)}
                    />
                    <button className="tv-btn" onClick={handleExprChange}>Build Tree</button>
                  </div>
                  <button className="tv-btn secondary" onClick={() => handleAlgoChange(activeAlgo)}>🎲 New Random Expression</button>
                </div>
              )}

              {/* Heap Builder */}
              {activeAlgo.includes('heap') && (
                <div className="tv-form-group">
                  <div className="tv-input-row">
                    <input
                      type="number"
                      className="tv-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Val"
                    />
                    <button className="tv-btn" onClick={handleHeapInsert}>Push</button>
                  </div>
                  <button className="tv-btn secondary" onClick={handleHeapExtract}>Extract Root</button>
                </div>
              )}

              <div className="tv-manual-divider">MANUAL EDIT</div>
              <div className="tv-form-group">
                {!tree.root && !activeAlgo.includes('trie') ? (
                  <button className="tv-btn" onClick={handleAddRoot}>Create Root Node</button>
                ) : (
                  <>
                    <div className="tv-edit-hint">
                      {selectedNode ? `Node ${tree.nodes[selectedNode]?.value || ''} selected` : 'Select a node to add children'}
                    </div>
                    <div className="tv-input-row">
                      <button
                        className={`tv-btn secondary ${targetSide === 'left' ? 'active' : ''}`}
                        style={{ flex: 1 }}
                        onClick={() => setTargetSide('left')}
                      >
                        ← Left Side
                      </button>
                      <button
                        className={`tv-btn secondary ${targetSide === 'right' ? 'active' : ''}`}
                        style={{ flex: 1 }}
                        onClick={() => setTargetSide('right')}
                      >
                        Right Side →
                      </button>
                    </div>
                    <button
                      className="tv-btn"
                      onClick={handleAddManualNode}
                      disabled={!selectedNode || !inputValue}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      + Add Node to {targetSide.toUpperCase()}
                    </button>
                  </>
                )}
                <button className="tv-btn danger-text" onClick={handleClear}>Clear Canvas</button>
              </div>
            </div>
          </div>

          <div className="tv-section" style={{ marginTop: 'auto', borderBottom: 'none' }}>
            <button className="tv-btn" style={{ width: '100%', padding: '12px' }} onClick={handleRun}>
              RUN SIMULATION
            </button>
          </div>
        </div>

        {/* ── Main Canvas ── */}
        <div className="tv-canvas-area" onClick={() => setSelectedNode(null)}>
          <svg
            viewBox="0 0 800 600"
            ref={svgRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-color)" />
              </marker>
            </defs>
            <g transform="translate(50, 0)">
              {renderEdges()}
              {renderNodes()}
            </g>
          </svg>

          {/* Notation Helper Overlays */}
          {activeAlgo === 'prefix-expr' && (
            <div className="tv-notation-badge prefix">PREFIX (POLISH)</div>
          )}
          {activeAlgo === 'postfix-expr' && (
            <div className="tv-notation-badge postfix">POSTFIX (REVERSE POLISH)</div>
          )}

          {/* Stack Visualization Overlay for Expression Trees */}
          {(activeAlgo === 'prefix-expr' || activeAlgo === 'postfix-expr') && (
            <div className="tv-stack-overlay">
              <div className="tv-stack-title">EXPR STACK</div>
              <div className="tv-stack-container">
                {step?.visitedOrder.map((v, i) => (
                  <div key={i} className="tv-stack-item">{tree.nodes[v]?.value}</div>
                ))}
                {(!step || step.visitedOrder.length === 0) && <div className="tv-stack-empty">Empty</div>}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel: Log & Playback ── */}
        <div className="tv-right">
          <div className="tv-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 className="tv-section-title">Debug Log</h2>
            <div className="tv-log">
              {steps.slice(0, currentStep + 1).map((s, i) => (
                <div key={i} className={`tv-log-entry ${i === currentStep ? 'active' : ''}`}>
                  {s.message}
                </div>
              ))}
              {steps.length === 0 && <div className="tv-log-entry">Select an algorithm and click RUN to begin.</div>}
            </div>
          </div>

          <div className="tv-controls-bar">
            <div className="tv-playback">
              <button className="tv-ctrl-btn" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                className="tv-ctrl-btn play"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                )}
              </button>

              <button className="tv-ctrl-btn" onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="tv-speed-row">
              <label>Speed</label>
              <input
                type="range"
                min="100" max="900"
                className="tv-speed-slider"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;
