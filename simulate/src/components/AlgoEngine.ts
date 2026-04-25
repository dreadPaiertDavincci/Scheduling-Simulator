export type StepType = 'compare' | 'swap' | 'sorted' | 'active' | 'found' | 'pivot' | 'left' | 'right' | 'mid' | 'eliminated' | 'reset';

export interface Step {
  array: number[];
  highlights: { index: number; type: StepType }[];
  description: string;
  searchTarget?: number;
  foundIndex?: number;
}

export interface AlgoInfo {
  best: string;
  average: string;
  worst: string;
  space: string;
  description: string;
}

export const ALGO_INFO: Record<string, AlgoInfo> = {
  'Bubble Sort': { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', description: 'Repeatedly swaps adjacent elements if they are in wrong order.' },
  'Selection Sort': { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', description: 'Finds the minimum element and places it at the beginning each pass.' },
  'Insertion Sort': { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', description: 'Builds the final sorted array one item at a time by inserting each element.' },
  'Merge Sort': { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', description: 'Divides array in half, sorts each half, then merges them back together.' },
  'Quick Sort': { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', description: 'Picks a pivot element and partitions the array around the pivot.' },
  'Linear Search': { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)', description: 'Checks each element one by one until the target is found or the list ends.' },
  'Binary Search': { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)', description: 'Searches a sorted array by repeatedly dividing the search interval in half.' },
};

function arrCopy(a: number[]): number[] { return [...a]; }

export function generateBubbleSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const arr = arrCopy(input);
  const n = arr.length;
  const sorted = new Set<number>();
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: arrCopy(arr), highlights: [{ index: j, type: 'compare' }, { index: j + 1, type: 'compare' }], description: `Comparing arr[${j}]=${arr[j]} with arr[${j+1}]=${arr[j+1]}` });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({ array: arrCopy(arr), highlights: [{ index: j, type: 'swap' }, { index: j + 1, type: 'swap' }], description: `Swapped! arr[${j}]=${arr[j]} ↔ arr[${j+1}]=${arr[j+1]}` });
      }
    }
    sorted.add(n - 1 - i);
    steps.push({ array: arrCopy(arr), highlights: Array.from(sorted).map(i => ({ index: i, type: 'sorted' as StepType })), description: `Element ${arr[n-1-i]} is now in its sorted position.` });
  }
  sorted.add(0);
  steps.push({ array: arrCopy(arr), highlights: Array.from({ length: n }, (_, i) => ({ index: i, type: 'sorted' as StepType })), description: 'Array is fully sorted!' });
  return steps;
}

export function generateSelectionSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const arr = arrCopy(input);
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({ array: arrCopy(arr), highlights: [{ index: i, type: 'pivot' }], description: `Looking for minimum in arr[${i}..${n-1}]` });
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: arrCopy(arr), highlights: [{ index: minIdx, type: 'pivot' }, { index: j, type: 'compare' }], description: `Comparing current min arr[${minIdx}]=${arr[minIdx]} with arr[${j}]=${arr[j]}` });
      if (arr[j] < arr[minIdx]) { minIdx = j; }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({ array: arrCopy(arr), highlights: [{ index: i, type: 'swap' }, { index: minIdx, type: 'swap' }], description: `Placed minimum ${arr[i]} at position ${i}` });
    }
    steps.push({ array: arrCopy(arr), highlights: [{ index: i, type: 'sorted' }], description: `Position ${i} is sorted.` });
  }
  steps.push({ array: arrCopy(arr), highlights: Array.from({ length: n }, (_, i) => ({ index: i, type: 'sorted' as StepType })), description: 'Array is fully sorted!' });
  return steps;
}

export function generateInsertionSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const arr = arrCopy(input);
  const n = arr.length;
  steps.push({ array: arrCopy(arr), highlights: [{ index: 0, type: 'sorted' }], description: 'First element is considered sorted.' });
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    steps.push({ array: arrCopy(arr), highlights: [{ index: i, type: 'active' }], description: `Inserting key = ${key} into sorted portion.` });
    while (j >= 0 && arr[j] > key) {
      steps.push({ array: arrCopy(arr), highlights: [{ index: j, type: 'compare' }, { index: j + 1, type: 'active' }], description: `arr[${j}]=${arr[j]} > ${key}, shifting right.` });
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
    steps.push({ array: arrCopy(arr), highlights: Array.from({ length: i + 1 }, (_, k) => ({ index: k, type: 'sorted' as StepType })), description: `Inserted ${key} at position ${j + 1}. Sorted: [0..${i}]` });
  }
  steps.push({ array: arrCopy(arr), highlights: Array.from({ length: n }, (_, i) => ({ index: i, type: 'sorted' as StepType })), description: 'Array is fully sorted!' });
  return steps;
}

export function generateMergeSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const arr = arrCopy(input);

  function merge(a: number[], l: number, m: number, r: number) {
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      steps.push({ array: arrCopy(a), highlights: [{ index: l + i, type: 'compare' }, { index: m + 1 + j, type: 'compare' }], description: `Merging: comparing ${left[i]} with ${right[j]}` });
      if (left[i] <= right[j]) { a[k++] = left[i++]; }
      else { a[k++] = right[j++]; }
    }
    while (i < left.length) { a[k++] = left[i++]; }
    while (j < right.length) { a[k++] = right[j++]; }
    const sortedHighlights = Array.from({ length: r - l + 1 }, (_, idx) => ({ index: l + idx, type: 'sorted' as StepType }));
    steps.push({ array: arrCopy(a), highlights: sortedHighlights, description: `Merged subarray [${l}..${r}]` });
  }

  function mergeSort(a: number[], l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    steps.push({ array: arrCopy(a), highlights: [{ index: l, type: 'left' }, { index: m, type: 'mid' }, { index: r, type: 'right' }], description: `Splitting [${l}..${r}] at mid=${m}` });
    mergeSort(a, l, m);
    mergeSort(a, m + 1, r);
    merge(a, l, m, r);
  }
  mergeSort(arr, 0, arr.length - 1);
  steps.push({ array: arrCopy(arr), highlights: Array.from({ length: arr.length }, (_, i) => ({ index: i, type: 'sorted' as StepType })), description: 'Array is fully sorted!' });
  return steps;
}

export function generateQuickSortSteps(input: number[]): Step[] {
  const steps: Step[] = [];
  const arr = arrCopy(input);

  function partition(a: number[], low: number, high: number): number {
    const pivot = a[high];
    steps.push({ array: arrCopy(a), highlights: [{ index: high, type: 'pivot' }], description: `Pivot selected: ${pivot} at index ${high}` });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ array: arrCopy(a), highlights: [{ index: j, type: 'compare' }, { index: high, type: 'pivot' }], description: `Comparing arr[${j}]=${a[j]} with pivot=${pivot}` });
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) steps.push({ array: arrCopy(a), highlights: [{ index: i, type: 'swap' }, { index: j, type: 'swap' }], description: `Swapped arr[${i}] and arr[${j}]` });
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    steps.push({ array: arrCopy(a), highlights: [{ index: i + 1, type: 'sorted' }], description: `Pivot ${pivot} placed at its final position ${i + 1}` });
    return i + 1;
  }

  function quickSort(a: number[], low: number, high: number) {
    if (low < high) {
      const pi = partition(a, low, high);
      quickSort(a, low, pi - 1);
      quickSort(a, pi + 1, high);
    }
  }
  quickSort(arr, 0, arr.length - 1);
  steps.push({ array: arrCopy(arr), highlights: Array.from({ length: arr.length }, (_, i) => ({ index: i, type: 'sorted' as StepType })), description: 'Array is fully sorted!' });
  return steps;
}

export function generateLinearSearchSteps(input: number[], target: number): Step[] {
  const steps: Step[] = [];
  const arr = arrCopy(input);
  for (let i = 0; i < arr.length; i++) {
    steps.push({ array: arrCopy(arr), highlights: [{ index: i, type: 'compare' }], description: `Checking arr[${i}] = ${arr[i]}` , searchTarget: target });
    if (arr[i] === target) {
      steps.push({ array: arrCopy(arr), highlights: [{ index: i, type: 'found' }], description: `Found ${target} at index ${i}!`, searchTarget: target, foundIndex: i });
      return steps;
    }
  }
  steps.push({ array: arrCopy(arr), highlights: [], description: `${target} not found in array.`, searchTarget: target, foundIndex: -1 });
  return steps;
}

export function generateBinarySearchSteps(input: number[], target: number): Step[] {
  const steps: Step[] = [];
  const arr = arrCopy([...input].sort((a, b) => a - b));
  steps.push({ array: arrCopy(arr), highlights: [], description: `Array sorted for Binary Search. Searching for ${target}.`, searchTarget: target });
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const eliminated: { index: number; type: StepType }[] = [];
    for (let i = 0; i < left; i++) eliminated.push({ index: i, type: 'eliminated' });
    for (let i = right + 1; i < arr.length; i++) eliminated.push({ index: i, type: 'eliminated' });
    steps.push({
      array: arrCopy(arr),
      highlights: [...eliminated, { index: left, type: 'left' }, { index: right, type: 'right' }, { index: mid, type: 'mid' }],
      description: `Left=${left}, Right=${right}, Mid=${mid}. Checking arr[${mid}]=${arr[mid]}`,
      searchTarget: target
    });
    if (arr[mid] === target) {
      steps.push({ array: arrCopy(arr), highlights: [{ index: mid, type: 'found' }], description: `Found ${target} at index ${mid}!`, searchTarget: target, foundIndex: mid });
      return steps;
    } else if (arr[mid] < target) {
      steps.push({ array: arrCopy(arr), highlights: [{ index: mid, type: 'eliminated' }], description: `arr[${mid}]=${arr[mid]} < ${target}, search right half.`, searchTarget: target });
      left = mid + 1;
    } else {
      steps.push({ array: arrCopy(arr), highlights: [{ index: mid, type: 'eliminated' }], description: `arr[${mid}]=${arr[mid]} > ${target}, search left half.`, searchTarget: target });
      right = mid - 1;
    }
  }
  steps.push({ array: arrCopy(arr), highlights: [], description: `${target} not found in array.`, searchTarget: target, foundIndex: -1 });
  return steps;
}
