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
    description: `Enqueue ${val}: Preparing to insert at the REAR of the queue.`,
    operation: 'Enqueue',
    highlightRear: true,
  });

  // Step 2 — new node entering (active)
  const entering: QueueNode = { id: `new_${Date.now()}`, value: val, state: 'active' };
  steps.push({
    queue: [...base, entering],
    description: `Placing ${val} at the REAR position. FRONT pointer unchanged.`,
    operation: 'Enqueue',
    highlightRear: true,
  });

  // Step 3 — success
  steps.push({
    queue: [...base, { ...entering, state: 'success' }],
    description: `Enqueue complete ✓. ${val} is now the new REAR. Size: ${data.length + 1}.`,
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
    description: `Dequeue: Identifying FRONT element — value is ${data[0]}.`,
    operation: 'Dequeue',
    highlightFront: true,
  });

  // Step 2 — mark for removal
  const step2 = base.map((n, i) => i === 0 ? { ...n, state: 'removing' as QueueNodeState } : n);
  steps.push({
    queue: step2,
    description: `Removing ${data[0]} from the FRONT. FRONT pointer advances →`,
    operation: 'Dequeue',
    highlightFront: true,
  });

  // Step 3 — removed
  const remaining = base.slice(1);
  steps.push({
    queue: remaining,
    description: `Dequeue complete ✓. ${data[0]} has left the queue. Size: ${data.length - 1}.`,
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

  // Step 1 — highlight front
  const step1 = base.map((n, i) => i === 0 ? { ...n, state: 'active' as QueueNodeState } : n);
  steps.push({
    queue: step1,
    description: `Peek: Inspecting the FRONT element without removing it.`,
    operation: 'Peek',
    highlightFront: true,
  });

  // Step 2 — show value, highlight
  const step2 = base.map((n, i) => i === 0 ? { ...n, state: 'highlight' as QueueNodeState } : n);
  steps.push({
    queue: step2,
    description: `FRONT value is ${data[0]}. The queue remains unchanged.`,
    operation: 'Peek',
    highlightFront: true,
  });

  // Step 3 — restore
  steps.push({
    queue: [...base],
    description: `Peek complete ✓. No elements were modified.`,
    operation: 'Peek',
  });

  return steps;
}

// ── FRONT ──────────────────────────────────────────────────────────────────────
export function generateFrontSteps(data: number[]): QueueStep[] {
  if (data.length === 0) return [];
  const steps: QueueStep[] = [];
  const base = baseNodes(data);

  const step1 = base.map((n, i) => i === 0 ? { ...n, state: 'front' as QueueNodeState } : n);
  steps.push({
    queue: step1,
    description: `Front: FRONT pointer targets index 0 — value is ${data[0]}.`,
    operation: 'Front',
    highlightFront: true,
  });

  steps.push({
    queue: [...base],
    description: `Front operation complete ✓. FRONT = ${data[0]}.`,
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

  const step1 = base.map((n, i) => i === last ? { ...n, state: 'rear' as QueueNodeState } : n);
  steps.push({
    queue: step1,
    description: `Rear: REAR pointer targets index ${last} — value is ${data[last]}.`,
    operation: 'Rear',
    highlightRear: true,
  });

  steps.push({
    queue: [...base],
    description: `Rear operation complete ✓. REAR = ${data[last]}.`,
    operation: 'Rear',
  });

  return steps;
}
