// =============================================
//  STACK ENGINE LOGIC
// =============================================

export type StackNode = {
  id: string;
  value: number;
  state: 'default' | 'active' | 'success' | 'removing';
};

export type StackStep = {
  stack: StackNode[];
  description: string;
  operation: string;
};

export const STACK_COMPLEXITY: Record<string, any> = {
  'Push': { operation: 'Push', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', desc: 'Add element to the top of the stack.' },
  'Pop': { operation: 'Pop', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', desc: 'Remove the top element from the stack.' },
  'Peek': { operation: 'Peek', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', desc: 'View the top element without removing it.' },
};

export function generatePushSteps(currentData: number[], newVal: number): StackStep[] {
  const steps: StackStep[] = [];
  const baseNodes: StackNode[] = currentData.map((v, i) => ({ id: `s_${i}`, value: v, state: 'default' }));
  
  // Initial state
  steps.push({
    stack: [...baseNodes],
    description: `Preparing to push ${newVal} to the top.`,
    operation: 'Push'
  });

  // Highlight action
  const newNode: StackNode = { id: `new_${Date.now()}`, value: newVal, state: 'active' };
  steps.push({
    stack: [newNode, ...baseNodes],
    description: `Inserting ${newVal} at the top of the stack.`,
    operation: 'Push'
  });

  // Success state
  steps.push({
    stack: [{ ...newNode, state: 'success' }, ...baseNodes],
    description: `Push successful. ${newVal} is now the new Top.`,
    operation: 'Push'
  });

  return steps;
}

export function generatePopSteps(currentData: number[]): StackStep[] {
  const steps: StackStep[] = [];
  if (currentData.length === 0) return [];

  const baseNodes: StackNode[] = currentData.map((v, i) => ({ id: `s_${i}`, value: v, state: 'default' }));

  // Highlight Top
  const withActive = [...baseNodes];
  withActive[0] = { ...withActive[0], state: 'active' };
  steps.push({
    stack: withActive,
    description: `Identifying the top element (${currentData[0]}) for removal.`,
    operation: 'Pop'
  });

  // Mark for removal
  const withRemoving = [...baseNodes];
  withRemoving[0] = { ...withRemoving[0], state: 'removing' };
  steps.push({
    stack: withRemoving,
    description: `Popping ${currentData[0]} from the stack.`,
    operation: 'Pop'
  });

  // Removed
  steps.push({
    stack: baseNodes.slice(1),
    description: `Pop operation complete.`,
    operation: 'Pop'
  });

  return steps;
}

export function generatePeekSteps(currentData: number[]): StackStep[] {
  const steps: StackStep[] = [];
  if (currentData.length === 0) return [];

  const baseNodes: StackNode[] = currentData.map((v, i) => ({ id: `s_${i}`, value: v, state: 'default' }));

  // Highlight Top
  const withActive = [...baseNodes];
  withActive[0] = { ...withActive[0], state: 'active' };
  steps.push({
    stack: withActive,
    description: `Peeking at the top: The value is ${currentData[0]}.`,
    operation: 'Peek'
  });

  // Back to normal
  steps.push({
    stack: baseNodes,
    description: `Peek operation complete.`,
    operation: 'Peek'
  });

  return steps;
}
