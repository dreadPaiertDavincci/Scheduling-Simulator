// ══════════════════════════════════════════════
//  TreeEngine.ts — Full Tree Algorithm Engine
// ══════════════════════════════════════════════

export type TreeNodeState = 'default' | 'active' | 'visited' | 'found' | 'comparing' | 'path' | 'frontier';

export interface TreeNode {
  id: string;
  value: number | string;
  left: string | null;
  right: string | null;
  x: number;
  y: number;
  state?: TreeNodeState;
  depth?: number;
  // Trie specific
  isEnd?: boolean;
  children?: Record<string, string>; // char -> nodeId
}

export interface Tree {
  nodes: Record<string, TreeNode>;
  root: string | null;
  type: 'bst' | 'trie' | 'expression';
}

export interface TreeStep {
  nodeStates: Record<string, TreeNodeState>;
  visitedOrder: string[];
  currentNode: string | null;
  message: string;
  expressionResult?: string;
  path?: string[];
  trieHighlight?: string[]; // highlighted char indices for Trie
}

// ── Layout helpers ──────────────────────────────
export function layoutTree(
  nodes: Record<string, TreeNode>,
  root: string | null,
  canvasW = 600,
  canvasH = 500,
  startY = 60
): Record<string, TreeNode> {
  if (!root) return nodes;
  const result: Record<string, TreeNode> = JSON.parse(JSON.stringify(nodes));

  function getSubtreeWidth(id: string | null, depth: number): number {
    if (!id) return 0;
    const n = result[id];
    const l = getSubtreeWidth(n.left, depth + 1);
    const r = getSubtreeWidth(n.right, depth + 1);
    return Math.max(l + r, 60);
  }

  function assign(id: string | null, x: number, y: number, spread: number) {
    if (!id) return;
    const n = result[id];
    n.x = x;
    n.y = y;
    const half = spread / 2;
    assign(n.left, x - half, y + 80, half);
    assign(n.right, x + half, y + 80, half);
  }

  const totalWidth = getSubtreeWidth(root, 0);
  const spreadX = Math.max(totalWidth, canvasW * 0.75);
  assign(root, canvasW / 2, startY, spreadX / 2);
  return result;
}

// ── BST Operations ──────────────────────────────
function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function bstInsert(tree: Tree, value: number | string): Tree {
  const t: Tree = JSON.parse(JSON.stringify(tree));
  const id = newId();
  const node: TreeNode = { id, value, left: null, right: null, x: 0, y: 0 };

  if (!t.root) {
    t.nodes[id] = node;
    t.root = id;
    t.nodes = layoutTree(t.nodes, t.root);
    return t;
  }

  let curr = t.root;
  while (true) {
    const n = t.nodes[curr];
    if (value < n.value) {
      if (!n.left) { node.id = id; t.nodes[id] = node; n.left = id; break; }
      curr = n.left;
    } else {
      if (!n.right) { node.id = id; t.nodes[id] = node; n.right = id; break; }
      curr = n.right;
    }
  }
  t.nodes = layoutTree(t.nodes, t.root);
  return t;
}

export function bstDelete(tree: Tree, value: number | string): Tree {
  const t: Tree = JSON.parse(JSON.stringify(tree));

  function findMin(id: string): string {
    let curr = id;
    while (t.nodes[curr].left) curr = t.nodes[curr].left!;
    return curr;
  }

  function remove(nodeId: string | null, val: number | string): string | null {
    if (!nodeId) return null;
    const n = t.nodes[nodeId];
    if (val < n.value) {
      n.left = remove(n.left, val);
    } else if (val > n.value) {
      n.right = remove(n.right, val);
    } else {
      if (!n.left) { delete t.nodes[nodeId]; return n.right; }
      if (!n.right) { delete t.nodes[nodeId]; return n.left; }
      const minId = findMin(n.right);
      n.value = t.nodes[minId].value;
      n.right = remove(n.right, n.value);
    }
    return nodeId;
  }

  t.root = remove(t.root, value);
  if (t.root) t.nodes = layoutTree(t.nodes, t.root);
  return t;
}

// ── AVL / Balanced BST Logic ───────────────────
function getHeight(nodes: Record<string, TreeNode>, id: string | null): number {
  if (!id) return 0;
  return nodes[id].depth || 1;
}

function getBalance(nodes: Record<string, TreeNode>, id: string | null): number {
  if (!id) return 0;
  const n = nodes[id];
  return getHeight(nodes, n.left) - getHeight(nodes, n.right);
}

function updateHeight(nodes: Record<string, TreeNode>, id: string) {
  const n = nodes[id];
  n.depth = Math.max(getHeight(nodes, n.left), getHeight(nodes, n.right)) + 1;
}

function rotateRight(nodes: Record<string, TreeNode>, yId: string): string {
  const y = nodes[yId];
  const xId = y.left!;
  const x = nodes[xId];
  const T2 = x.right;

  x.right = yId;
  y.left = T2;

  updateHeight(nodes, yId);
  updateHeight(nodes, xId);

  return xId;
}

function rotateLeft(nodes: Record<string, TreeNode>, xId: string): string {
  const x = nodes[xId];
  const yId = x.right!;
  const y = nodes[yId];
  const T2 = y.left;

  y.left = xId;
  x.right = T2;

  updateHeight(nodes, xId);
  updateHeight(nodes, yId);

  return yId;
}

export function balanceBSTNode(nodes: Record<string, TreeNode>, id: string): string {
  updateHeight(nodes, id);
  const balance = getBalance(nodes, id);

  // Left Left
  if (balance > 1 && getBalance(nodes, nodes[id].left) >= 0) {
    return rotateRight(nodes, id);
  }
  // Left Right
  if (balance > 1 && getBalance(nodes, nodes[id].left) < 0) {
    nodes[id].left = rotateLeft(nodes, nodes[id].left!);
    return rotateRight(nodes, id);
  }
  // Right Right
  if (balance < -1 && getBalance(nodes, nodes[id].right) <= 0) {
    return rotateLeft(nodes, id);
  }
  // Right Left
  if (balance < -1 && getBalance(nodes, nodes[id].right) > 0) {
    nodes[id].right = rotateRight(nodes, nodes[id].right!);
    return rotateLeft(nodes, id);
  }

  return id;
}

export function avlInsert(tree: Tree, value: number | string): Tree {
  const t: Tree = JSON.parse(JSON.stringify(tree));
  function insert(nodeId: string | null): string {
    if (!nodeId) {
      const id = newId();
      t.nodes[id] = { id, value, left: null, right: null, x: 0, y: 0 };
      return id;
    }
    const n = t.nodes[nodeId];
    if (value < n.value) n.left = insert(n.left);
    else n.right = insert(n.right);
    return balanceBSTNode(t.nodes, nodeId);
  }

  t.root = insert(t.root);
  t.nodes = layoutTree(t.nodes, t.root);
  return t;
}

// ── Heap Logic ──────────────────────────────────
export function buildHeapTree(values: (number | string)[]): Tree {
  const t: Tree = { nodes: {}, root: null, type: 'bst' };
  if (values.length === 0) return t;

  const nodes: Record<string, TreeNode> = {};
  const ids = values.map((v, i) => `h-${i}`);

  values.forEach((v, i) => {
    const id = ids[i];
    const leftIdx = 2 * i + 1;
    const rightIdx = 2 * i + 2;
    nodes[id] = {
      id,
      value: v,
      left: leftIdx < values.length ? ids[leftIdx] : null,
      right: rightIdx < values.length ? ids[rightIdx] : null,
      x: 0, y: 0
    };
  });

  t.nodes = layoutTree(nodes, ids[0]);
  t.root = ids[0];
  return t;
}

export function heapInsert(values: (number | string)[], val: number | string, type: 'min' | 'max'): (number | string)[] {
  const arr = [...values, val];
  let curr = arr.length - 1;
  while (curr > 0) {
    const parent = Math.floor((curr - 1) / 2);
    const cond = type === 'min' ? arr[curr] < arr[parent] : arr[curr] > arr[parent];
    if (cond) {
      [arr[curr], arr[parent]] = [arr[parent], arr[curr]];
      curr = parent;
    } else break;
  }
  return arr;
}

export function heapExtract(values: number[], type: 'min' | 'max'): number[] {
  if (values.length <= 1) return [];
  const arr = [...values];
  arr[0] = arr.pop()!;

  let i = 0;
  while (true) {
    let best = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < arr.length) {
      const cond = type === 'min' ? arr[left] < arr[best] : arr[left] > arr[best];
      if (cond) best = left;
    }
    if (right < arr.length) {
      const cond = type === 'min' ? arr[right] < arr[best] : arr[right] > arr[best];
      if (cond) best = right;
    }

    if (best !== i) {
      [arr[i], arr[best]] = [arr[best], arr[i]];
      i = best;
    } else break;
  }
  return arr;
}


// ── Traversal Steps ──────────────────────────────
export function runPreorder(tree: Tree): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: string[] = [];

  function traverse(id: string | null) {
    if (!id) return;
    const n = tree.nodes[id];
    visited.push(id);
    steps.push({
      nodeStates: buildStates(tree, visited, id),
      visitedOrder: [...visited],
      currentNode: id,
      message: `Visit "${n.value}" (Root → Left → Right)`,
    });
    traverse(n.left);
    traverse(n.right);
  }

  traverse(tree.root);
  steps.push({
    nodeStates: buildStates(tree, visited, null),
    visitedOrder: [...visited],
    currentNode: null,
    message: `✅ Preorder complete: ${visited.map(id => tree.nodes[id].value).join(' → ')}`,
  });
  return steps;
}

export function runInorder(tree: Tree): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: string[] = [];

  function traverse(id: string | null) {
    if (!id) return;
    const n = tree.nodes[id];
    traverse(n.left);
    visited.push(id);
    steps.push({
      nodeStates: buildStates(tree, visited, id),
      visitedOrder: [...visited],
      currentNode: id,
      message: `Visit "${n.value}" (Left → Root → Right)`,
    });
    traverse(n.right);
  }

  traverse(tree.root);
  steps.push({
    nodeStates: buildStates(tree, visited, null),
    visitedOrder: [...visited],
    currentNode: null,
    message: `✅ Inorder complete: ${visited.map(id => tree.nodes[id].value).join(' → ')} (sorted!)`,
  });
  return steps;
}

export function runPostorder(tree: Tree): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: string[] = [];

  function traverse(id: string | null) {
    if (!id) return;
    const n = tree.nodes[id];
    traverse(n.left);
    traverse(n.right);
    visited.push(id);
    steps.push({
      nodeStates: buildStates(tree, visited, id),
      visitedOrder: [...visited],
      currentNode: id,
      message: `Visit "${n.value}" (Left → Right → Root)`,
    });
  }

  traverse(tree.root);
  steps.push({
    nodeStates: buildStates(tree, visited, null),
    visitedOrder: [...visited],
    currentNode: null,
    message: `✅ Postorder complete: ${visited.map(id => tree.nodes[id].value).join(' → ')}`,
  });
  return steps;
}

export function runLevelOrder(tree: Tree): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: string[] = [];
  if (!tree.root) return steps;

  const queue: string[] = [tree.root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelNodes: string[] = [];
    for (let i = 0; i < levelSize; i++) {
      const id = queue.shift()!;
      levelNodes.push(id);
      visited.push(id);
      const n = tree.nodes[id];
      if (n.left) queue.push(n.left);
      if (n.right) queue.push(n.right);
      steps.push({
        nodeStates: buildStates(tree, visited, id, queue),
        visitedOrder: [...visited],
        currentNode: id,
        message: `Level-order: visiting "${n.value}" — Queue: [${queue.map(q => tree.nodes[q].value).join(', ')}]`,
      });
    }
  }
  steps.push({
    nodeStates: buildStates(tree, visited, null),
    visitedOrder: [...visited],
    currentNode: null,
    message: `✅ Level-order complete: ${visited.map(id => tree.nodes[id].value).join(' → ')}`,
  });
  return steps;
}

// ── BST Search Steps ─────────────────────────────
export function runBSTSearchRecursive(tree: Tree, target: number): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: string[] = [];
  const path: string[] = [];

  function search(id: string | null): boolean {
    if (!id) {
      steps.push({
        nodeStates: buildStates(tree, visited, null),
        visitedOrder: [...visited], currentNode: null, path: [...path],
        message: `❌ "${target}" not found in tree.`,
      });
      return false;
    }
    const n = tree.nodes[id];
    visited.push(id);
    path.push(id);

    if ((n.value as number) === target) {
      steps.push({
        nodeStates: { ...buildStates(tree, visited, id), [id]: 'found' },
        visitedOrder: [...visited], currentNode: id, path: [...path],
        message: `🎯 Found "${target}" at node "${n.value}"!`,
      });
      return true;
    }

    const dir = target < (n.value as number) ? 'left' : 'right';
    steps.push({
      nodeStates: buildStates(tree, visited, id),
      visitedOrder: [...visited], currentNode: id, path: [...path],
      message: `Comparing ${target} < ${n.value}? ${target < (n.value as number)} → go ${dir}`,
    });
    return search(n[dir]);
  }

  search(tree.root);
  return steps;
}

export function runBSTSearchIterative(tree: Tree, target: number): TreeStep[] {
  const steps: TreeStep[] = [];
  const visited: string[] = [];
  const path: string[] = [];
  let curr = tree.root;

  while (curr) {
    const n = tree.nodes[curr];
    visited.push(curr);
    path.push(curr);

    if ((n.value as number) === target) {
      steps.push({
        nodeStates: { ...buildStates(tree, visited, curr), [curr]: 'found' },
        visitedOrder: [...visited], currentNode: curr, path: [...path],
        message: `🎯 Found "${target}" (iterative search)!`,
      });
      return steps;
    }

    const dir = target < (n.value as number) ? 'left' : 'right';
    steps.push({
      nodeStates: buildStates(tree, visited, curr),
      visitedOrder: [...visited], currentNode: curr, path: [...path],
      message: `${target} vs ${n.value} → go ${dir}`,
    });
    curr = n[dir] as string | null;
  }

  steps.push({
    nodeStates: buildStates(tree, visited, null),
    visitedOrder: [...visited], currentNode: null,
    message: `❌ "${target}" not found.`,
  });
  return steps;
}

// ── Trie ──────────────────────────────────────────
export interface TrieNode {
  id: string;
  char: string;
  isEnd: boolean;
  children: Record<string, string>; // char -> nodeId
  x: number;
  y: number;
}

export interface Trie {
  nodes: Record<string, TrieNode>;
  root: string;
}

export function createTrie(): Trie {
  const rootId = 'root';
  return {
    root: rootId,
    nodes: {
      [rootId]: { id: rootId, char: '', isEnd: false, children: {}, x: 300, y: 40 },
    },
  };
}

export function trieInsert(trie: Trie, word: string): Trie {
  let t: Trie = JSON.parse(JSON.stringify(trie));
  let curr = t.root;
  for (const ch of word.toLowerCase()) {
    if (!t.nodes[curr].children[ch]) {
      const newId = `${curr}_${ch}_${Math.random().toString(36).slice(2, 5)}`;
      t.nodes[newId] = { id: newId, char: ch, isEnd: false, children: {}, x: 0, y: 0 };
      t.nodes[curr].children[ch] = newId;
    }
    curr = t.nodes[curr].children[ch];
  }
  t.nodes[curr].isEnd = true;
  t = layoutTrie(t);
  return t;
}

export function layoutTrie(trie: Trie): Trie {
  const t: Trie = JSON.parse(JSON.stringify(trie));
  const canvasW = 640;
  const yGap = 80;

  function assign(id: string, x: number, y: number, spread: number) {
    t.nodes[id].x = x;
    t.nodes[id].y = y;
    const children = Object.values(t.nodes[id].children);
    if (children.length === 0) return;
    const step = spread / (children.length + 1);
    let cx = x - spread / 2 + step;
    for (const childId of children) {
      assign(childId, cx, y + yGap, spread / Math.max(children.length, 2));
      cx += step;
    }
  }

  assign(t.root, canvasW / 2, 40, canvasW * 0.85);
  return t;
}

export interface TrieStep {
  nodeStates: Record<string, TreeNodeState>;
  currentPath: string[];
  message: string;
  suggestions?: string[];
}

export function runTrieSearch(trie: Trie, prefix: string): TrieStep[] {
  const steps: TrieStep[] = [];
  const path: string[] = [trie.root];

  steps.push({
    nodeStates: { [trie.root]: 'active' },
    currentPath: [trie.root],
    message: `Starting trie search for prefix "${prefix}"`,
  });

  let curr = trie.root;
  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i].toLowerCase();
    if (!trie.nodes[curr].children[ch]) {
      steps.push({
        nodeStates: buildTrieStates(path, curr),
        currentPath: [...path],
        message: `❌ Prefix "${prefix.slice(0, i + 1)}" not found — character '${ch}' missing`,
        suggestions: [],
      });
      return steps;
    }
    curr = trie.nodes[curr].children[ch];
    path.push(curr);
    steps.push({
      nodeStates: buildTrieStates(path, curr),
      currentPath: [...path],
      message: `Matched '${ch}' → at node "${trie.nodes[curr].char}"`,
    });
  }

  // Collect all words with this prefix
  const suggestions: string[] = [];
  function dfs(id: string, built: string) {
    const n = trie.nodes[id];
    if (n.isEnd) suggestions.push(built);
    for (const [c, childId] of Object.entries(n.children)) dfs(childId, built + c);
  }
  dfs(curr, prefix);

  steps.push({
    nodeStates: buildTrieStates(path, curr, true),
    currentPath: [...path],
    message: `✅ Prefix "${prefix}" found! ${suggestions.length} word(s): ${suggestions.join(', ')}`,
    suggestions,
  });
  return steps;
}

function buildTrieStates(path: string[], current: string, isEnd = false): Record<string, TreeNodeState> {
  const states: Record<string, TreeNodeState> = {};
  for (const id of path) states[id] = 'path';
  if (current) states[current] = isEnd ? 'found' : 'active';
  return states;
}

function shuntingYard(tokens: string[]): string[] {
  const ops: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
  const output: string[] = [];
  const stack: string[] = [];

  tokens.forEach(tok => {
    if (!isNaN(parseFloat(tok)) || /^[a-zA-Z]$/.test(tok)) {
      output.push(tok);
    } else if (tok === '(') {
      stack.push(tok);
    } else if (tok === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!);
      }
      stack.pop();
    } else if (ops[tok]) {
      while (stack.length && stack[stack.length - 1] !== '(' && ops[stack[stack.length - 1]] >= ops[tok]) {
        output.push(stack.pop()!);
      }
      stack.push(tok);
    }
  });
  while (stack.length) {
    const op = stack.pop();
    if (op !== '(') output.push(op!);
  }
  return output;
}

// ── Expression Tree ───────────────────────────────
export function buildExpressionTree(expression: string, notation: 'prefix' | 'postfix'): { tree: Tree; steps: TreeStep[] } {
  let tokens = expression.replace(/([\(\)\+\-\*\/\^])/g, ' $1 ').trim().split(/\s+/);
  
  // Detection: If infix (contains parentheses or no operators at ends), use shunting-yard
  const hasParens = expression.includes('(') || expression.includes(')');
  const operators = new Set(['+', '-', '*', '/', '^']);
  const firstIsOp = operators.has(tokens[0]);
  const lastIsOp = operators.has(tokens[tokens.length - 1]);

  if (hasParens || (!firstIsOp && !lastIsOp)) {
    tokens = shuntingYard(tokens);
    notation = 'postfix';
  }

  const steps: TreeStep[] = [];
  const tree: Tree = { nodes: {}, root: null, type: 'expression' };

  function makeNode(val: string): TreeNode {
    const id = newId();
    const node: TreeNode = { id, value: val, left: null, right: null, x: 0, y: 0 };
    tree.nodes[id] = node;
    return node;
  }

  const nodeStack: TreeNode[] = [];
  
  if (notation === 'prefix') {
    for (let i = tokens.length - 1; i >= 0; i--) {
      const tok = tokens[i];
      const node = makeNode(tok);
      if (operators.has(tok)) {
        node.left  = nodeStack.pop()?.id ?? null;
        node.right = nodeStack.pop()?.id ?? null;
      }
      nodeStack.push(node);
      steps.push({
        nodeStates: { [node.id]: 'active' },
        visitedOrder: nodeStack.map(n => n.id),
        currentNode: node.id,
        message: `Process operator "${tok}"`,
      });
    }
    tree.root = nodeStack[0]?.id ?? null;
  } else {
    for (const tok of tokens) {
      const node = makeNode(tok);
      if (operators.has(tok)) {
        node.right = nodeStack.pop()?.id ?? null;
        node.left  = nodeStack.pop()?.id ?? null;
      }
      nodeStack.push(node);
      steps.push({
        nodeStates: { [node.id]: 'active' },
        visitedOrder: nodeStack.map(n => n.id),
        currentNode: node.id,
        message: `Process operator "${tok}"`,
      });
    }
    tree.root = nodeStack[nodeStack.length - 1]?.id ?? null;
  }

  if (tree.root) {
    tree.nodes = layoutTree(tree.nodes, tree.root, 600, 400, 50);
    steps.push({
      nodeStates: Object.fromEntries(Object.keys(tree.nodes).map(id => [id, 'visited'])),
      visitedOrder: Object.keys(tree.nodes),
      currentNode: tree.root,
      message: `✅ Expression processed.`,
    });
  }

  return { tree, steps };
}

export function generateRandomExpr(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): string {
  const ops = ['+', '-', '*', '/'];
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  
  if (difficulty === 'easy') {
    // a op b
    return `${pick(nums)} ${pick(ops)} ${pick(nums)}`;
  }
  
  if (difficulty === 'medium') {
    // (a op b) op c
    const a = pick(nums), b = pick(nums), c = pick(nums);
    const op1 = pick(ops), op2 = pick(ops);
    return pick([`(${a} ${op1} ${b}) ${op2} ${c}`, `${a} ${op1} (${b} ${op2} ${c})`]);
  }

  // hard: ((a op b) op c) op d or similar
  const a = pick(nums), b = pick(nums), c = pick(nums), d = pick(nums);
  const op1 = pick(ops), op2 = pick(ops), op3 = pick(ops);
  return pick([
    `(${a} ${op1} ${b}) ${op2} (${c} ${op3} ${d})`,
    `(((${a} ${op1} ${b}) ${op2} ${c}) ${op3} ${d})`,
    `${a} ${op1} (${b} ${op2} (${c} ${op3} ${d}))`
  ]);
}

function evalExprTree(tree: Tree, id: string | null): number {
  if (!id) return 0;
  const n = tree.nodes[id];
  if (!n.left && !n.right) return parseFloat(String(n.value)) || 0;
  const l = evalExprTree(tree, n.left);
  const r = evalExprTree(tree, n.right);
  switch (n.value) {
    case '+': return l + r;
    case '-': return l - r;
    case '*': return l * r;
    case '/': return r !== 0 ? l / r : Infinity;
    case '^': return Math.pow(l, r);
    default: return parseFloat(String(n.value)) || 0;
  }
}

// ── Helpers ───────────────────────────────────────
function buildStates(
  tree: Tree,
  visited: string[],
  current: string | null,
  frontier: string[] = []
): Record<string, TreeNodeState> {
  const s: Record<string, TreeNodeState> = {};
  for (const id of Object.keys(tree.nodes)) s[id] = 'default';
  for (const id of visited) s[id] = 'visited';
  for (const id of frontier) s[id] = 'frontier';
  if (current) s[current] = 'active';
  return s;
}

// ── Default Trees ──────────────────────────────────
export function createDefaultBST(): Tree {
  let t: Tree = { nodes: {}, root: null, type: 'bst' };
  for (const v of [50, 30, 70, 20, 40, 60, 80]) {
    t = bstInsert(t, v);
  }
  return t;
}

export function generateRandomBST(count: number = 10): Tree {
  let t: Tree = { nodes: {}, root: null, type: 'bst' };
  const vals = new Set<number>();
  while (vals.size < count) {
    vals.add(Math.floor(Math.random() * 100) + 1);
  }
  Array.from(vals).forEach(v => {
    t = bstInsert(t, v);
  });
  return t;
}

export function clearTree(): Tree {
  return { nodes: {}, root: null, type: 'bst' };
}


export const TREE_ALGORITHMS = [
  { id: 'preorder',    label: 'Preorder',           category: 'Traversal',   desc: 'Root → Left → Right' },
  { id: 'inorder',     label: 'Inorder',             category: 'Traversal',   desc: 'Left → Root → Right (sorted)' },
  { id: 'postorder',   label: 'Postorder',           category: 'Traversal',   desc: 'Left → Right → Root' },
  { id: 'levelorder',  label: 'Level-Order',         category: 'Traversal',   desc: 'Breadth-First (BFS)' },
  { id: 'bst-rec',     label: 'BST Recursive',       category: 'BST Search',  desc: 'Recursive divide & conquer' },
  { id: 'prefix-expr', label: 'Prefix Notation',    category: 'Expression',  desc: 'Polish prefix expression tree' },
  { id: 'postfix-expr',label: 'Postfix Notation',   category: 'Expression',  desc: 'Reverse Polish expression tree' },
] as const;

export type TreeAlgoId = typeof TREE_ALGORITHMS[number]['id'];
