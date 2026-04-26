export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  heuristic?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
}

export interface AlgoStep {
  visitedNodes: string[];
  currentNode: string | null;
  frontierNodes: string[];
  exploredNodes: string[];
  pathSoFar: string[];
  foundPath: string[] | null;
  message: string;
  depth?: number;
  cost?: number;
  fScore?: number;
  gScore?: number;
  hScore?: number;
  openSet?: string[];
  closedSet?: string[];
  beamSet?: string[];
}

export type AlgorithmId =
  | 'bfs' | 'dfs' | 'dls' | 'ids' | 'ucs'
  | 'greedy' | 'astar' | 'wastar' | 'idastar' | 'beam';

export interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  complete: boolean;
  optimal: boolean;
  color: string;
  description: string;
  paramLabel?: string;
  paramDefault?: number;
}

export const ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'bfs',
    name: 'BFS',
    category: 'Uninformed',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    complete: true,
    optimal: true,
    color: '#3B82F6',
    description: 'Breadth-First Search explores all neighbors level by level using a FIFO queue.',
  },
  {
    id: 'dfs',
    name: 'DFS',
    category: 'Uninformed',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    complete: false,
    optimal: false,
    color: '#10B981',
    description: 'Depth-First Search explores as deep as possible before backtracking, using a LIFO stack.',
  },
  {
    id: 'dls',
    name: 'DLS',
    category: 'Uninformed',
    timeComplexity: 'O(b^l)',
    spaceComplexity: 'O(b·l)',
    complete: false,
    optimal: false,
    color: '#F59E0B',
    description: 'Depth-Limited Search is DFS with a depth cutoff limit to avoid infinite paths.',
    paramLabel: 'Depth Limit',
    paramDefault: 3,
  },
  {
    id: 'ids',
    name: 'IDS',
    category: 'Uninformed',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b·d)',
    complete: true,
    optimal: true,
    color: '#8B5CF6',
    description: 'Iterative Deepening Search repeatedly runs DLS with increasing depth limits.',
  },
  {
    id: 'ucs',
    name: 'UCS',
    category: 'Uninformed',
    timeComplexity: 'O(b^(1+⌊C*/ε⌋))',
    spaceComplexity: 'O(b^(1+⌊C*/ε⌋))',
    complete: true,
    optimal: true,
    color: '#06B6D4',
    description: 'Uniform Cost Search expands the node with the lowest cumulative path cost first.',
  },
  {
    id: 'greedy',
    name: 'Greedy Best-First',
    category: 'Informed',
    timeComplexity: 'O(b^m)',
    spaceComplexity: 'O(b^m)',
    complete: false,
    optimal: false,
    color: '#EC4899',
    description: 'Greedy Best-First Search expands the node that appears closest to the goal using heuristic h(n).',
  },
  {
    id: 'astar',
    name: 'A*',
    category: 'Informed',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    complete: true,
    optimal: true,
    color: '#F97316',
    description: 'A* combines UCS and Greedy using f(n) = g(n) + h(n) to find the optimal path.',
  },
  {
    id: 'wastar',
    name: 'Weighted A*',
    category: 'Informed',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    complete: true,
    optimal: false,
    color: '#EF4444',
    description: 'Weighted A* uses f(n) = g(n) + w·h(n), trading optimality for speed (w > 1).',
    paramLabel: 'Weight (w)',
    paramDefault: 2,
  },
  {
    id: 'idastar',
    name: 'IDA*',
    category: 'Informed',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b·d)',
    complete: true,
    optimal: true,
    color: '#6366F1',
    description: 'Iterative Deepening A* performs depth-first search within an f-cost threshold, doubling memory efficiency.',
  },
  {
    id: 'beam',
    name: 'Beam Search',
    category: 'Informed',
    timeComplexity: 'O(b·β·d)',
    spaceComplexity: 'O(β·d)',
    complete: false,
    optimal: false,
    color: '#14B8A6',
    description: 'Beam Search keeps only the top β nodes (beam width) at each level using heuristic ranking.',
    paramLabel: 'Beam Width (β)',
    paramDefault: 2,
  },
];

function getNeighbors(graph: Graph, nodeId: string): { id: string; weight: number }[] {
  const neighbors: { id: string; weight: number }[] = [];
  for (const edge of graph.edges) {
    if (edge.from === nodeId) {
      neighbors.push({ id: edge.to, weight: edge.weight });
    }
    if (!graph.directed && edge.to === nodeId) {
      neighbors.push({ id: edge.from, weight: edge.weight });
    }
  }
  return neighbors;
}

function heuristic(graph: Graph, nodeId: string): number {
  const node = graph.nodes.find(n => n.id === nodeId);
  return node?.heuristic ?? 0;
}

function reconstructPath(cameFrom: Map<string, string | null>, current: string): string[] {
  const path: string[] = [current];
  let cur: string | null = current;
  while (cameFrom.has(cur!) && cameFrom.get(cur!) !== null) {
    cur = cameFrom.get(cur!)!;
    path.unshift(cur);
  }
  return path;
}

export function runBFS(graph: Graph, start: string, goal: string): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const queue: string[] = [start];
  const visited = new Set<string>([start]);
  const cameFrom = new Map<string, string | null>([[start, null]]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const path = reconstructPath(cameFrom, current);

    if (current === goal) {
      steps.push({
        visitedNodes: [...visited],
        currentNode: current,
        frontierNodes: [...queue],
        exploredNodes: [...visited],
        pathSoFar: path,
        foundPath: path,
        message: `🎯 Goal "${goal}" found! Path length: ${path.length - 1}`,
      });
      return steps;
    }

    steps.push({
      visitedNodes: [...visited],
      currentNode: current,
      frontierNodes: [...queue],
      exploredNodes: [...visited],
      pathSoFar: path,
      foundPath: null,
      message: `Expanding node "${current}" — Queue: [${queue.join(', ')}]`,
    });

    for (const { id: neighbor } of getNeighbors(graph, current)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        cameFrom.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  steps.push({
    visitedNodes: [...visited],
    currentNode: null,
    frontierNodes: [],
    exploredNodes: [...visited],
    pathSoFar: [],
    foundPath: null,
    message: `❌ No path found from "${start}" to "${goal}".`,
  });
  return steps;
}

export function runDFS(graph: Graph, start: string, goal: string): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const stack: string[] = [start];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string | null>([[start, null]]);

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const path = reconstructPath(cameFrom, current);

    if (current === goal) {
      steps.push({
        visitedNodes: [...visited],
        currentNode: current,
        frontierNodes: [...stack],
        exploredNodes: [...visited],
        pathSoFar: path,
        foundPath: path,
        message: `🎯 Goal "${goal}" found! Path length: ${path.length - 1}`,
      });
      return steps;
    }

    steps.push({
      visitedNodes: [...visited],
      currentNode: current,
      frontierNodes: [...stack],
      exploredNodes: [...visited],
      pathSoFar: path,
      foundPath: null,
      message: `Exploring node "${current}" — Stack: [${stack.slice(-5).join(', ')}]`,
    });

    const neighbors = getNeighbors(graph, current);
    for (const { id: neighbor } of [...neighbors].reverse()) {
      if (!visited.has(neighbor)) {
        if (!cameFrom.has(neighbor)) cameFrom.set(neighbor, current);
        stack.push(neighbor);
      }
    }
  }

  steps.push({
    visitedNodes: [...visited],
    currentNode: null,
    frontierNodes: [],
    exploredNodes: [...visited],
    pathSoFar: [],
    foundPath: null,
    message: `❌ No path found from "${start}" to "${goal}".`,
  });
  return steps;
}

function dlsHelper(
  graph: Graph, node: string, goal: string,
  depth: number, limit: number,
  visited: Set<string>, cameFrom: Map<string, string | null>,
  steps: AlgoStep[]
): boolean {
  visited.add(node);
  const path = reconstructPath(cameFrom, node);

  steps.push({
    visitedNodes: [...visited],
    currentNode: node,
    frontierNodes: [],
    exploredNodes: [...visited],
    pathSoFar: path,
    foundPath: node === goal ? path : null,
    depth,
    message: `[Depth ${depth}/${limit}] Visiting "${node}"`,
  });

  if (node === goal) return true;
  if (depth >= limit) return false;

  for (const { id: neighbor } of getNeighbors(graph, node)) {
    if (!visited.has(neighbor)) {
      cameFrom.set(neighbor, node);
      if (dlsHelper(graph, neighbor, goal, depth + 1, limit, visited, cameFrom, steps)) return true;
    }
  }
  visited.delete(node);
  return false;
}

export function runDLS(graph: Graph, start: string, goal: string, limit: number): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string | null>([[start, null]]);
  const found = dlsHelper(graph, start, goal, 0, limit, visited, cameFrom, steps);
  if (!found) {
    steps.push({
      visitedNodes: [...visited],
      currentNode: null, frontierNodes: [], exploredNodes: [...visited],
      pathSoFar: [], foundPath: null,
      message: `❌ No path found within depth limit ${limit}.`,
    });
  }
  return steps;
}

export function runIDS(graph: Graph, start: string, goal: string): AlgoStep[] {
  const steps: AlgoStep[] = [];
  for (let depth = 0; depth <= 20; depth++) {
    steps.push({
      visitedNodes: [],
      currentNode: null, frontierNodes: [], exploredNodes: [],
      pathSoFar: [], foundPath: null,
      depth,
      message: `🔄 IDS: Starting depth-limited search with limit = ${depth}`,
    });
    const visited = new Set<string>();
    const cameFrom = new Map<string, string | null>([[start, null]]);
    const found = dlsHelper(graph, start, goal, 0, depth, visited, cameFrom, steps);
    if (found) return steps;
  }
  return steps;
}

export function runUCS(graph: Graph, start: string, goal: string): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const pq: { id: string; cost: number }[] = [{ id: start, cost: 0 }];
  const costSoFar = new Map<string, number>([[start, 0]]);
  const cameFrom = new Map<string, string | null>([[start, null]]);
  const explored = new Set<string>();

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { id: current, cost } = pq.shift()!;
    if (explored.has(current)) continue;
    explored.add(current);

    const path = reconstructPath(cameFrom, current);
    if (current === goal) {
      steps.push({
        visitedNodes: [...explored],
        currentNode: current,
        frontierNodes: pq.map(p => p.id),
        exploredNodes: [...explored],
        pathSoFar: path,
        foundPath: path,
        cost,
        message: `🎯 Goal "${goal}" found! Total cost: ${cost}`,
      });
      return steps;
    }

    steps.push({
      visitedNodes: [...explored],
      currentNode: current,
      frontierNodes: pq.map(p => p.id),
      exploredNodes: [...explored],
      pathSoFar: path,
      foundPath: null,
      cost,
      message: `Expanding "${current}" with cost ${cost}`,
    });

    for (const { id: neighbor, weight } of getNeighbors(graph, current)) {
      const newCost = cost + weight;
      if (!costSoFar.has(neighbor) || newCost < costSoFar.get(neighbor)!) {
        costSoFar.set(neighbor, newCost);
        cameFrom.set(neighbor, current);
        pq.push({ id: neighbor, cost: newCost });
      }
    }
  }

  steps.push({
    visitedNodes: [...explored],
    currentNode: null, frontierNodes: [], exploredNodes: [...explored],
    pathSoFar: [], foundPath: null,
    message: `❌ No path found.`,
  });
  return steps;
}

export function runGreedy(graph: Graph, start: string, goal: string): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const open: { id: string; h: number }[] = [{ id: start, h: heuristic(graph, start) }];
  const visited = new Set<string>();
  const cameFrom = new Map<string, string | null>([[start, null]]);

  while (open.length > 0) {
    open.sort((a, b) => a.h - b.h);
    const { id: current, h } = open.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const path = reconstructPath(cameFrom, current);
    if (current === goal) {
      steps.push({
        visitedNodes: [...visited], currentNode: current,
        frontierNodes: open.map(o => o.id), exploredNodes: [...visited],
        pathSoFar: path, foundPath: path, hScore: h,
        message: `🎯 Goal "${goal}" found! h(n)=${h}`,
      });
      return steps;
    }

    steps.push({
      visitedNodes: [...visited], currentNode: current,
      frontierNodes: open.map(o => o.id), exploredNodes: [...visited],
      pathSoFar: path, foundPath: null, hScore: h,
      message: `Expanding "${current}" — h(n)=${h}`,
    });

    for (const { id: neighbor } of getNeighbors(graph, current)) {
      if (!visited.has(neighbor)) {
        cameFrom.set(neighbor, current);
        open.push({ id: neighbor, h: heuristic(graph, neighbor) });
      }
    }
  }

  steps.push({
    visitedNodes: [...visited], currentNode: null, frontierNodes: [],
    exploredNodes: [...visited], pathSoFar: [], foundPath: null,
    message: `❌ No path found.`,
  });
  return steps;
}

export function runAStar(graph: Graph, start: string, goal: string, weight = 1): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const gScore = new Map<string, number>([[start, 0]]);
  const fScore = new Map<string, number>([[start, weight * heuristic(graph, start)]]);
  const open: string[] = [start];
  const closed = new Set<string>();
  const cameFrom = new Map<string, string | null>([[start, null]]);

  while (open.length > 0) {
    open.sort((a, b) => (fScore.get(a) ?? Infinity) - (fScore.get(b) ?? Infinity));
    const current = open.shift()!;
    closed.add(current);

    const g = gScore.get(current) ?? 0;
    const h = heuristic(graph, current);
    const f = g + weight * h;
    const path = reconstructPath(cameFrom, current);

    if (current === goal) {
      steps.push({
        visitedNodes: [...closed], currentNode: current,
        frontierNodes: [...open], exploredNodes: [...closed],
        pathSoFar: path, foundPath: path,
        gScore: g, hScore: h, fScore: f,
        openSet: [...open], closedSet: [...closed],
        message: `🎯 Goal "${goal}" found! g=${g} h=${h} f=${f.toFixed(2)}`,
      });
      return steps;
    }

    steps.push({
      visitedNodes: [...closed], currentNode: current,
      frontierNodes: [...open], exploredNodes: [...closed],
      pathSoFar: path, foundPath: null,
      gScore: g, hScore: h, fScore: f,
      openSet: [...open], closedSet: [...closed],
      message: `Expanding "${current}" — g=${g} h=${h} f=${f.toFixed(2)}`,
    });

    for (const { id: neighbor, weight: w } of getNeighbors(graph, current)) {
      if (closed.has(neighbor)) continue;
      const tentativeG = g + w;
      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + weight * heuristic(graph, neighbor));
        if (!open.includes(neighbor)) open.push(neighbor);
      }
    }
  }

  steps.push({
    visitedNodes: [...closed], currentNode: null, frontierNodes: [],
    exploredNodes: [...closed], pathSoFar: [], foundPath: null,
    openSet: [], closedSet: [...closed],
    message: `❌ No path found.`,
  });
  return steps;
}

let idaStarSteps: AlgoStep[] = [];

function idaStarSearch(
  graph: Graph, node: string, goal: string,
  g: number, threshold: number,
  cameFrom: Map<string, string | null>, visited: Set<string>
): number {
  const h = heuristic(graph, node);
  const f = g + h;
  if (f > threshold) return f;

  const path = reconstructPath(cameFrom, node);
  if (node === goal) {
    idaStarSteps.push({
      visitedNodes: [...visited], currentNode: node, frontierNodes: [],
      exploredNodes: [...visited], pathSoFar: path, foundPath: path,
      gScore: g, hScore: h, fScore: f,
      message: `🎯 Goal found! g=${g} h=${h} f=${f} threshold=${threshold}`,
    });
    return -1;
  }

  idaStarSteps.push({
    visitedNodes: [...visited], currentNode: node, frontierNodes: [],
    exploredNodes: [...visited], pathSoFar: path, foundPath: null,
    gScore: g, hScore: h, fScore: f,
    message: `[IDA*] "${node}" f=${f} ≤ threshold=${threshold}`,
  });

  let min = Infinity;
  visited.add(node);
  for (const { id: neighbor, weight } of getNeighbors(graph, node)) {
    if (!visited.has(neighbor)) {
      cameFrom.set(neighbor, node);
      const t = idaStarSearch(graph, neighbor, goal, g + weight, threshold, cameFrom, visited);
      if (t === -1) return -1;
      if (t < min) min = t;
    }
  }
  visited.delete(node);
  return min;
}

export function runIDAStar(graph: Graph, start: string, goal: string): AlgoStep[] {
  idaStarSteps = [];
  let threshold = heuristic(graph, start);
  const cameFrom = new Map<string, string | null>([[start, null]]);

  for (let i = 0; i < 30; i++) {
    idaStarSteps.push({
      visitedNodes: [], currentNode: null, frontierNodes: [], exploredNodes: [],
      pathSoFar: [], foundPath: null,
      message: `🔄 IDA*: New iteration — threshold = ${threshold}`,
    });
    const visited = new Set<string>();
    const t = idaStarSearch(graph, start, goal, 0, threshold, cameFrom, visited);
    if (t === -1) return idaStarSteps;
    if (t === Infinity) break;
    threshold = t;
  }

  idaStarSteps.push({
    visitedNodes: [], currentNode: null, frontierNodes: [], exploredNodes: [],
    pathSoFar: [], foundPath: null,
    message: `❌ No path found.`,
  });
  return idaStarSteps;
}

export function runBeamSearch(graph: Graph, start: string, goal: string, beamWidth: number): AlgoStep[] {
  const steps: AlgoStep[] = [];
  let beam: { id: string; path: string[] }[] = [{ id: start, path: [start] }];
  const visited = new Set<string>([start]);

  while (beam.length > 0) {
    const candidates: { id: string; h: number; path: string[] }[] = [];

    for (const { id: node, path } of beam) {
      if (node === goal) {
        steps.push({
          visitedNodes: [...visited], currentNode: node,
          frontierNodes: beam.map(b => b.id), exploredNodes: [...visited],
          pathSoFar: path, foundPath: path,
          beamSet: beam.map(b => b.id),
          message: `🎯 Goal "${goal}" found!`,
        });
        return steps;
      }

      steps.push({
        visitedNodes: [...visited], currentNode: node,
        frontierNodes: beam.map(b => b.id), exploredNodes: [...visited],
        pathSoFar: path, foundPath: null,
        hScore: heuristic(graph, node), beamSet: beam.map(b => b.id),
        message: `Beam expanding "${node}" — beam: [${beam.map(b => b.id).join(', ')}]`,
      });

      for (const { id: neighbor } of getNeighbors(graph, node)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          candidates.push({ id: neighbor, h: heuristic(graph, neighbor), path: [...path, neighbor] });
        }
      }
    }

    candidates.sort((a, b) => a.h - b.h);
    beam = candidates.slice(0, beamWidth).map(c => ({ id: c.id, path: c.path }));
  }

  steps.push({
    visitedNodes: [...visited], currentNode: null, frontierNodes: [],
    exploredNodes: [...visited], pathSoFar: [], foundPath: null, beamSet: [],
    message: `❌ No path found with beam width ${beamWidth}.`,
  });
  return steps;
}

export function runAlgorithm(
  algoId: AlgorithmId, graph: Graph,
  start: string, goal: string, param?: number
): AlgoStep[] {
  switch (algoId) {
    case 'bfs': return runBFS(graph, start, goal);
    case 'dfs': return runDFS(graph, start, goal);
    case 'dls': return runDLS(graph, start, goal, param ?? 3);
    case 'ids': return runIDS(graph, start, goal);
    case 'ucs': return runUCS(graph, start, goal);
    case 'greedy': return runGreedy(graph, start, goal);
    case 'astar': return runAStar(graph, start, goal, 1);
    case 'wastar': return runAStar(graph, start, goal, param ?? 2);
    case 'idastar': return runIDAStar(graph, start, goal);
    case 'beam': return runBeamSearch(graph, start, goal, param ?? 2);
    default: return [];
  }
}

export const DEFAULT_GRAPH: Graph = {
  directed: false,
  nodes: [
    { id: 'A', label: 'A', x: 300, y: 80,  heuristic: 6 },
    { id: 'B', label: 'B', x: 150, y: 200, heuristic: 4 },
    { id: 'C', label: 'C', x: 450, y: 200, heuristic: 5 },
    { id: 'D', label: 'D', x: 80,  y: 340, heuristic: 3 },
    { id: 'E', label: 'E', x: 230, y: 340, heuristic: 2 },
    { id: 'F', label: 'F', x: 370, y: 340, heuristic: 3 },
    { id: 'G', label: 'G', x: 520, y: 340, heuristic: 0 },
    { id: 'H', label: 'H', x: 150, y: 470, heuristic: 1 },
    { id: 'I', label: 'I', x: 300, y: 470, heuristic: 2 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 2 },
    { from: 'A', to: 'C', weight: 3 },
    { from: 'B', to: 'D', weight: 4 },
    { from: 'B', to: 'E', weight: 1 },
    { from: 'C', to: 'F', weight: 2 },
    { from: 'C', to: 'G', weight: 5 },
    { from: 'D', to: 'H', weight: 2 },
    { from: 'E', to: 'I', weight: 3 },
    { from: 'F', to: 'G', weight: 2 },
    { from: 'H', to: 'I', weight: 2 },
    { from: 'I', to: 'G', weight: 4 },
  ],
};

export function generateRandomGraph(
  nodeCount: number,
  edgeDensity: number, // 0..1
  directed: boolean,
  canvasW = 580,
  canvasH = 500
): Graph {
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nodes: GraphNode[] = [];
  const padding = 60;
  const w = canvasW - padding * 2;
  const h = canvasH - padding * 2;

  // Place nodes in a circle + some jitter so they don't overlap
  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    const rx = (w / 2) * 0.75;
    const ry = (h / 2) * 0.75;
    const cx = canvasW / 2 + rx * Math.cos(angle) + (Math.random() - 0.5) * 40;
    const cy = canvasH / 2 + ry * Math.sin(angle) + (Math.random() - 0.5) * 40;
    const label = i < 26 ? labels[i] : `N${i}`;
    nodes.push({
      id: label,
      label,
      x: Math.max(padding, Math.min(canvasW - padding, cx)),
      y: Math.max(padding, Math.min(canvasH - padding, cy)),
      heuristic: 0,
    });
  }

  // Set heuristic = distance to last node (goal by default)
  const goal = nodes[nodes.length - 1];
  for (const n of nodes) {
    const dx = n.x - goal.x;
    const dy = n.y - goal.y;
    n.heuristic = Math.round(Math.sqrt(dx * dx + dy * dy) / 40);
  }
  goal.heuristic = 0;

  // Generate edges: ensure graph is connected (spanning tree) + extra edges by density
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  const addEdge = (a: string, b: string, w: number) => {
    const key = directed ? `${a}->${b}` : [a, b].sort().join('-');
    if (!edgeSet.has(key) && a !== b) {
      edgeSet.add(key);
      edges.push({ from: a, to: b, weight: w });
    }
  };

  // Spanning tree (shuffle nodes, connect sequentially)
  const shuffled = [...nodes].sort(() => Math.random() - 0.5);
  for (let i = 1; i < shuffled.length; i++) {
    const w = Math.floor(Math.random() * 9) + 1;
    addEdge(shuffled[i - 1].id, shuffled[i].id, w);
  }

  // Extra edges based on density
  const maxExtra = Math.floor(nodeCount * (nodeCount - 1) / 2 * edgeDensity);
  let attempts = 0;
  while (edges.length < nodeCount - 1 + maxExtra && attempts < 500) {
    attempts++;
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    const w = Math.floor(Math.random() * 9) + 1;
    addEdge(a.id, b.id, w);
  }

  return { nodes, edges, directed };
}

