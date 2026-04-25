// =============================================
//  LINKED LIST ENGINE
// =============================================

export type LLType = 'sll' | 'dll' | 'cll';
export type NodeState = 'default' | 'highlight' | 'active' | 'found' | 'deleted' | 'inserted' | 'head' | 'tail';

export interface LLNode {
  id: string;
  value: number;
  state: NodeState;
  x: number;
  y: number;
}

export interface LLStep {
  nodes: LLNode[];
  description: string;
  highlightColor?: string;
  operation: string;
}

// ---- Complexity Info ----
export interface ComplexityInfo {
  operation: string;
  best: string;
  avg: string;
  worst: string;
  space: string;
  desc: string;
}

export const LL_COMPLEXITY: Record<string, ComplexityInfo> = {
  'Insert Head': { operation: 'Insert at Head', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', desc: 'Simply update the head pointer. Always constant time.' },
  'Insert Tail': { operation: 'Insert at Tail', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', desc: 'SLL requires traversal to tail. DLL with tail pointer is O(1).' },
  'Insert At': { operation: 'Insert at Index', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', desc: 'Must traverse to position i before inserting.' },
  'Delete Head': { operation: 'Delete Head', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', desc: 'Move head pointer forward. Always O(1).' },
  'Delete Tail': { operation: 'Delete Tail', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', desc: 'SLL needs traversal to second-last. DLL with tail pointer is O(1).' },
  'Delete Val': { operation: 'Delete by Value', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', desc: 'Must search linearly to find the node to delete.' },
  'Search': { operation: 'Search', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', desc: 'Linear scan from head. No random access in linked lists.' },
  'Traverse': { operation: 'Traverse', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', desc: 'Visit every node once from head to tail.' },
  'Reverse': { operation: 'Reverse', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', desc: 'Re-link all next pointers in a single pass.' },
};

// ---- Step Generators ----
function makeNodes(values: number[], llType: LLType): LLNode[] {
  return values.map((v, i) => ({
    id: `n${i}_${v}`,
    value: v,
    state: i === 0 ? 'head' : i === values.length - 1 ? 'tail' : 'default',
    x: 0, y: 0,
  }));
}

export function generateTraverseSteps(values: number[], llType: LLType): LLStep[] {
  if (values.length === 0) return [];
  const steps: LLStep[] = [];

  steps.push({
    nodes: makeNodes(values, llType),
    description: `Start at HEAD node [${values[0]}]. Begin traversal.`,
    operation: 'Traverse',
  });

  for (let i = 0; i < values.length; i++) {
    const nodes = values.map((v, j) => ({
      id: `n${j}_${v}`, value: v,
      state: (j < i ? 'highlight' : j === i ? 'active' : 'default') as NodeState,
      x: 0, y: 0,
    }));
    nodes[0].state = nodes[0].state === 'default' ? 'head' : nodes[0].state;
    steps.push({
      nodes,
      description: `Visiting node [${values[i]}] at index ${i}. Follow next pointer →`,
      operation: 'Traverse',
    });
  }

  const done = values.map((v, j) => ({
    id: `n${j}_${v}`, value: v,
    state: (j === 0 ? 'head' : j === values.length - 1 ? 'tail' : 'highlight') as NodeState,
    x: 0, y: 0,
  }));
  steps.push({ nodes: done, description: `Traversal complete. Reached NULL (${values.length} nodes visited).`, operation: 'Traverse' });
  return steps;
}

export function generateSearchSteps(values: number[], target: number, llType: LLType): LLStep[] {
  if (values.length === 0) return [];
  const steps: LLStep[] = [];

  steps.push({
    nodes: makeNodes(values, llType),
    description: `Searching for value [${target}]. Starting at HEAD.`,
    operation: 'Search',
  });

  for (let i = 0; i < values.length; i++) {
    const nodes = values.map((v, j) => ({
      id: `n${j}_${v}`, value: v,
      state: (j < i ? 'highlight' : j === i ? 'active' : 'default') as NodeState,
      x: 0, y: 0,
    }));
    const found = values[i] === target;
    nodes[i].state = found ? 'found' : 'active';
    steps.push({
      nodes,
      description: found
        ? `✅ Found [${target}] at index ${i}!`
        : `Node [${values[i]}] ≠ ${target}. Move to next →`,
      operation: 'Search',
    });
    if (found) break;
    if (i === values.length - 1) {
      steps.push({
        nodes: values.map((v, j) => ({ id: `n${j}_${v}`, value: v, state: 'highlight' as NodeState, x: 0, y: 0 })),
        description: `❌ Value [${target}] not found. Reached NULL.`,
        operation: 'Search',
      });
    }
  }
  return steps;
}

export function generateInsertHeadSteps(values: number[], newVal: number, llType: LLType): LLStep[] {
  const steps: LLStep[] = [];
  steps.push({
    nodes: makeNodes(values, llType),
    description: `Inserting [${newVal}] at HEAD. Create new node.`,
    operation: 'Insert Head',
  });
  const withNew = [newVal, ...values];
  const nodes = withNew.map((v, i) => ({
    id: `n${i}_${v}`, value: v,
    state: (i === 0 ? 'inserted' : i === withNew.length - 1 ? 'tail' : 'default') as NodeState,
    x: 0, y: 0,
  }));
  steps.push({ nodes, description: `New node [${newVal}] points to old HEAD. Update head pointer. ✅`, operation: 'Insert Head' });
  return steps;
}

export function generateInsertTailSteps(values: number[], newVal: number, llType: LLType): LLStep[] {
  const steps: LLStep[] = [];
  steps.push({ nodes: makeNodes(values, llType), description: `Inserting [${newVal}] at TAIL. Start traversal to end.`, operation: 'Insert Tail' });

  for (let i = 0; i < values.length; i++) {
    const nodes = values.map((v, j) => ({
      id: `n${j}_${v}`, value: v,
      state: (j <= i ? 'highlight' : 'default') as NodeState,
      x: 0, y: 0,
    }));
    steps.push({ nodes, description: `Traversing... at node [${values[i]}] (index ${i})`, operation: 'Insert Tail' });
  }

  const withNew = [...values, newVal];
  const nodes = withNew.map((v, i) => ({
    id: `n${i}_${v}`, value: v,
    state: (i === 0 ? 'head' : i === withNew.length - 1 ? 'inserted' : 'highlight') as NodeState,
    x: 0, y: 0,
  }));
  steps.push({ nodes, description: `Reached tail. Appended [${newVal}]. Update last->next. ✅`, operation: 'Insert Tail' });
  return steps;
}

export function generateDeleteHeadSteps(values: number[], llType: LLType): LLStep[] {
  if (values.length === 0) return [];
  const steps: LLStep[] = [];
  steps.push({ nodes: makeNodes(values, llType), description: `Deleting HEAD node [${values[0]}]. Save reference.`, operation: 'Delete Head' });

  const markedDelete = makeNodes(values, llType);
  markedDelete[0].state = 'deleted';
  steps.push({ nodes: markedDelete, description: `Mark [${values[0]}] for deletion. Move head → [${values[1] ?? 'NULL'}].`, operation: 'Delete Head' });

  const after = values.slice(1);
  steps.push({ nodes: makeNodes(after, llType), description: `Node [${values[0]}] removed. New HEAD is [${values[1] ?? 'NULL'}]. ✅`, operation: 'Delete Head' });
  return steps;
}

export function generateDeleteTailSteps(values: number[], llType: LLType): LLStep[] {
  if (values.length === 0) return [];
  const steps: LLStep[] = [];
  steps.push({ nodes: makeNodes(values, llType), description: `Deleting TAIL node [${values[values.length - 1]}]. Start traversal.`, operation: 'Delete Tail' });

  for (let i = 0; i < values.length - 1; i++) {
    const nodes = values.map((v, j) => ({
      id: `n${j}_${v}`, value: v,
      state: (j <= i ? 'highlight' : 'default') as NodeState,
      x: 0, y: 0,
    }));
    steps.push({ nodes, description: `Traversing to second-last... at [${values[i]}]`, operation: 'Delete Tail' });
  }

  const markedDelete = makeNodes(values, llType);
  markedDelete[values.length - 1].state = 'deleted';
  steps.push({ nodes: markedDelete, description: `Mark TAIL [${values[values.length - 1]}] for deletion.`, operation: 'Delete Tail' });

  const after = values.slice(0, -1);
  steps.push({ nodes: makeNodes(after, llType), description: `TAIL [${values[values.length - 1]}] removed. New TAIL is [${values[values.length - 2] ?? 'NULL'}]. ✅`, operation: 'Delete Tail' });
  return steps;
}

export function generateReverseSteps(values: number[], llType: LLType): LLStep[] {
  if (values.length === 0) return [];
  const steps: LLStep[] = [];
  steps.push({ nodes: makeNodes(values, llType), description: `Reversing list. Set prev=NULL, cur=HEAD.`, operation: 'Reverse' });

  const arr = [...values];
  for (let i = 0; i < arr.length; i++) {
    const partial = arr.slice(0, i + 1).reverse();
    const nodes = partial.map((v, j) => ({
      id: `nr${j}_${v}`, value: v,
      state: (j === 0 ? 'active' : 'highlight') as NodeState,
      x: 0, y: 0,
    }));
    steps.push({ nodes, description: `Reversed pointer for [${arr[i]}]. prev=[${arr[i]}], cur=[${arr[i + 1] ?? 'NULL'}]`, operation: 'Reverse' });
  }

  const reversed = [...values].reverse();
  steps.push({ nodes: makeNodes(reversed, llType), description: `List fully reversed. New HEAD=[${reversed[0]}]. ✅`, operation: 'Reverse' });
  return steps;
}
