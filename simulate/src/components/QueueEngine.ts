// =============================================
//  QUEUE ENGINE — FIFO DATA STRUCTURE LOGIC
// =============================================

export type QueueNodeState =
  | 'default'
  | 'active'
  | 'success'
  | 'removing'
  | 'front'
  | 'rear'
  | 'highlight';

export type QueueNode = {
  id: string;
  value: number;
  state: QueueNodeState;
};

export type QueueStep = {
  queue: QueueNode[];
  description: string;
  operation: string;
  highlightFront?: boolean;
  highlightRear?: boolean;
};

// ── Complexity Reference ───────────────────────────────────────────────────────
export const QUEUE_COMPLEXITY: Record<string, { avg: string; space: string; desc: string }> = {
  Enqueue:  { avg: 'O(1)', space: 'O(1)', desc: 'Adds an element to the REAR of the queue in constant time.' },
  Dequeue:  { avg: 'O(1)', space: 'O(1)', desc: 'Removes the element at the FRONT of the queue in constant time.' },
  Peek:     { avg: 'O(1)', space: 'O(1)', desc: 'Reads the FRONT element without removing it. Non-destructive.' },
  Front:    { avg: 'O(1)', space: 'O(1)', desc: 'Accesses the FRONT (head) of the queue — the next to be dequeued.' },
  Rear:     { avg: 'O(1)', space: 'O(1)', desc: 'Accesses the REAR (tail) of the queue — the most recently enqueued.' },
};

// ── Helper ─────────────────────────────────────────────────────────────────────
function baseNodes(data: number[]): QueueNode[] {
  return data.map((v, i) => ({ id: `q_${i}_${v}`, value: v, state: 'default' }));
}

// ── ENQUEUE ────────────────────────────────────────────────────────────────────
export function generateEnqueueSteps(data: number[], val: number): QueueStep[] {
  const steps: QueueStep[] = [];
  const base = baseNodes(data);

  // Step 1 — show current state
  steps.push({
    queue: [...base],
    description: `Enqueue ${val}: Initializing insertion at the REAR pointer.`,
    operation: 'Enqueue',
    highlightRear: true,
  });

  // Step 2 — new node entering (active)
  const entering: QueueNode = { id: `new_${Date.now()}`, value: val, state: 'active' };
  steps.push({
    queue: [...base, entering],
    description: `Allocating memory for ${val} and linking it to the current REAR.`,
    operation: 'Enqueue',
    highlightRear: true,
  });

  // Step 3 — success
  steps.push({
    queue: [...base, { ...entering, state: 'success' }],
    description: `Enqueue successful. ${val} is now the new REAR. Queue size: ${data.length + 1}.`,
    operation: 'Enqueue',
    highlightRear: true,
  });

  return steps;
}

// ── DEQUEUE ────────────────────────────────────────────────────────────────────
export function generateDequeueSteps(data: number[]): QueueStep[] {
  if (data.length === 0) return [];
  const steps: QueueStep[] = [];
  const base = baseNodes(data);

  // Step 1 — identify front
  const step1 = base.map((n, i) => i === 0 ? { ...n, state: 'front' as QueueNodeState } : n);
  steps.push({
    queue: step1,
    description: `Dequeue: Locating the element at the FRONT — current value is ${data[0]}.`,
    operation: 'Dequeue',
    highlightFront: true,
  });

  // Step 2 — mark for removal
  const step2 = base.map((n, i) => i === 0 ? { ...n, state: 'removing' as QueueNodeState } : n);
  steps.push({
    queue: step2,
    description: `Decoupling ${data[0]} from the head. Advancing the FRONT pointer.`,
    operation: 'Dequeue',
    highlightFront: true,
  });

  // Step 3 — removed
  const remaining = base.slice(1);
  steps.push({
    queue: remaining,
    description: `Dequeue complete. Node ${data[0]} successfully removed. New size: ${data.length - 1}.`,
    operation: 'Dequeue',
    highlightFront: remaining.length > 0,
  });

  return steps;
}

// ── PEEK ───────────────────────────────────────────────────────────────────────
export function generatePeekSteps(data: number[]): QueueStep[] {
  if (data.length === 0) return [];
  const steps: QueueStep[] = [];
  const base = baseNodes(data);

  // Step 1 — pulsing front
  const step1 = base.map((n, i) => i === 0 ? { ...n, state: 'front' as QueueNodeState } : n);
  steps.push({
    queue: step1,
    description: `Peek: Inspecting the head element without modifying the queue structure.`,
    operation: 'Peek',
    highlightFront: true,
  });

  // Step 2 — shaking/highlight
  const step2 = base.map((n, i) => i === 0 ? { ...n, state: 'highlight' as QueueNodeState } : n);
  steps.push({
    queue: step2,
    description: `Data access successful: Head value is ${data[0]}. Structure remains intact.`,
    operation: 'Peek',
    highlightFront: true,
  });

  // Step 3 — restore
  steps.push({
    queue: [...base],
    description: `Peek operation concluded. No changes were made to the FIFO sequence.`,
    operation: 'Peek',
  });

  return steps;
}

// ── FRONT ──────────────────────────────────────────────────────────────────────
export function generateFrontSteps(data: number[]): QueueStep[] {
  if (data.length === 0) return [];
  const steps: QueueStep[] = [];
  const base = baseNodes(data);

  // Step 1 — pulsing front
  const step1 = base.map((n, i) => i === 0 ? { ...n, state: 'front' as QueueNodeState } : n);
  steps.push({
    queue: step1,
    description: `Front: Accessing the FRONT pointer reference — targets index 0.`,
    operation: 'Front',
    highlightFront: true,
  });

  // Step 2 — final result
  steps.push({
    queue: [...base],
    description: `FRONT pointer points to value ${data[0]}. This is the next element to be dequeued.`,
    operation: 'Front',
  });

  return steps;
}

// ── REAR ───────────────────────────────────────────────────────────────────────
export function generateRearSteps(data: number[]): QueueStep[] {
  if (data.length === 0) return [];
  const steps: QueueStep[] = [];
  const base = baseNodes(data);
  const last = data.length - 1;

  // Step 1 — pulsing rear
  const step1 = base.map((n, i) => i === last ? { ...n, state: 'rear' as QueueNodeState } : n);
  steps.push({
    queue: step1,
    description: `Rear: Accessing the REAR pointer reference — targets index ${last}.`,
    operation: 'Rear',
    highlightRear: true,
  });

  // Step 2 — final result
  steps.push({
    queue: [...base],
    description: `REAR pointer points to value ${data[last]}. This is the most recently added element.`,
    operation: 'Rear',
  });

  return steps;
}

// ── RANDOM ─────────────────────────────────────────────────────────────────────
export function generateRandomSteps(oldData: number[], newData: number[]): QueueStep[] {
  const steps: QueueStep[] = [];
  
  // Step 1: Clear current queue
  if (oldData.length > 0) {
    const clearingNodes = oldData.map((v, i) => ({ 
      id: `q_${i}_${v}`, 
      value: v, 
      state: 'removing' as QueueNodeState 
    }));
    steps.push({
      queue: clearingNodes,
      description: 'System Reset: Clearing existing queue structure.',
      operation: 'Random',
    });
  }

  // Step 2: Empty state
  steps.push({
    queue: [],
    description: 'Generating new random dataset...',
    operation: 'Random',
  });

  // Step 3: Progressive fill
  let currentQueue: QueueNode[] = [];
  newData.forEach((val, i) => {
    const node: QueueNode = { id: `rnd_${i}_${Date.now()}`, value: val, state: 'active' };
    
    // Node entering
    steps.push({
      queue: [...currentQueue, node],
      description: `Populating queue with random value: ${val}.`,
      operation: 'Random',
    });

    // Node settled
    const settledNode = { ...node, state: 'success' as QueueNodeState };
    currentQueue.push(settledNode);
    steps.push({
      queue: [...currentQueue],
      description: `Random value ${val} successfully indexed at position ${i}.`,
      operation: 'Random',
    });
  });

  return steps;
}
