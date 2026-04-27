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
function makeNodes(values: number[], _llType: LLType): LLNode[] {
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

export function generateInsertAtSteps(values: number[], newVal: number, index: number, llType: LLType): LLStep[] {
  if (index <= 0) return generateInsertHeadSteps(values, newVal, llType);
  if (index >= values.length) return generateInsertTailSteps(values, newVal, llType);

  const steps: LLStep[] = [];
  steps.push({ 
    nodes: makeNodes(values, llType), 
    description: `Inserting [${newVal}] at index ${index}. Traverse to position ${index - 1}.`, 
    operation: 'Insert At' 
  });

  // Step 1: Traverse to index-1
  for (let i = 0; i < index; i++) {
    const nodes = values.map((v, j) => ({
      id: `n${j}_${v}`, value: v,
      state: (j < i ? 'highlight' : j === i ? 'active' : 'default') as NodeState,
      x: 0, y: 0,
    }));
    steps.push({ nodes, description: `Traversing... currently at node [${values[i]}] (index ${i})`, operation: 'Insert At' });
  }

  // Step 2: Show the insertion logic
  const before = values.slice(0, index);
  const after = values.slice(index);
  const result = [...before, newVal, ...after];

  // Highlight the surrounding nodes
  const prepNodes = result.map((v, i) => {
    let state: NodeState = 'default';
    if (i === index) state = 'inserted';
    else if (i === index - 1) state = 'active'; // The 'before' node
    else if (i === index + 1) state = 'highlight'; // The 'after' node
    else if (i === 0) state = 'head';
    else if (i === result.length - 1) state = 'tail';

    return { id: `n${i}_${v}`, value: v, state, x: 0, y: 0 };
  });

  steps.push({ 
    nodes: prepNodes, 
    description: `New node [${newVal}] created. Link [${newVal}]->next = [${after[0]}].`, 
    operation: 'Insert At' 
  });

  if (llType === 'dll') {
    steps.push({ 
      nodes: prepNodes, 
      description: `DLL: Link [${after[0]}]->prev = [${newVal}] and [${newVal}]->prev = [${before[before.length - 1]}].`, 
      operation: 'Insert At' 
    });
  }

  steps.push({ 
    nodes: prepNodes, 
    description: `Link [${before[before.length - 1]}]->next = [${newVal}]. Insertion complete! ✅`, 
    operation: 'Insert At' 
  });

  return steps;
}

export function generateDeleteAtSteps(values: number[], index: number, llType: LLType): LLStep[] {
  if (index <= 0) return generateDeleteHeadSteps(values, llType);
  if (index >= values.length - 1) return generateDeleteTailSteps(values, llType);

  const steps: LLStep[] = [];
  steps.push({ 
    nodes: makeNodes(values, llType), 
    description: `Deleting node at index ${index}. Traverse to position ${index - 1}.`, 
    operation: 'Delete At' 
  });

  // Step 1: Traverse to index-1
  for (let i = 0; i < index; i++) {
    const nodes = values.map((v, j) => ({
      id: `n${j}_${v}`, value: v,
      state: (j < i ? 'highlight' : j === i ? 'active' : 'default') as NodeState,
      x: 0, y: 0,
    }));
    steps.push({ nodes, description: `Traversing... currently at node [${values[i]}] (index ${i})`, operation: 'Delete At' });
  }

  // Step 2: Mark for deletion
  const markedNodes = values.map((v, j) => ({
    id: `n${j}_${v}`, value: v,
    state: (j === index ? 'deleted' : j === index - 1 ? 'active' : j === index + 1 ? 'highlight' : 'default') as NodeState,
    x: 0, y: 0,
  }));
  steps.push({ nodes: markedNodes, description: `Mark node [${values[index]}] (index ${index}) for deletion.`, operation: 'Delete At' });

  // Step 3: Re-link
  const after = values.filter((_, i) => i !== index);
  const resultNodes = after.map((v, i) => {
    let state: NodeState = 'default';
    if (i === 0) state = 'head';
    if (i === after.length - 1) state = 'tail';
    return { id: `n${i}_${v}`, value: v, state, x: 0, y: 0 };
  });

  steps.push({ 
    nodes: resultNodes, 
    description: `Update [${values[index-1]}]->next to point to [${values[index+1]}]. Node removed! ✅`, 
    operation: 'Delete At' 
  });

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
