import React, { useState, useEffect, useRef } from 'react';
import './ArrayVisualizer.css';
import type { Step, StepType } from './AlgoEngine';
import {
  ALGO_INFO,
  generateBubbleSortSteps, generateSelectionSortSteps,
  generateInsertionSortSteps, generateMergeSortSteps, generateQuickSortSteps,
  generateLinearSearchSteps, generateBinarySearchSteps
} from './AlgoEngine';

const LANGUAGES = ['C++', 'C#', 'C', 'Java', 'Python'];
const SORTING_ALGOS = ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'];
const SEARCHING_ALGOS = ['Linear Search', 'Binary Search'];

const SNIPPETS: Record<string, Record<string, string>> = {
  'Bubble Sort': {
    'C++': `void bubbleSort(int arr[], int n) {\n  for (int i = 0; i < n-1; i++)\n    for (int j = 0; j < n-i-1; j++)\n      if (arr[j] > arr[j+1])\n        swap(arr[j], arr[j+1]);\n}`,
    'Java': `void bubbleSort(int[] arr) {\n  int n = arr.length;\n  for (int i = 0; i < n-1; i++)\n    for (int j = 0; j < n-i-1; j++)\n      if (arr[j] > arr[j+1]) {\n        int t=arr[j]; arr[j]=arr[j+1]; arr[j+1]=t;\n      }\n}`,
    'Python': `def bubble_sort(arr):\n  n = len(arr)\n  for i in range(n):\n    for j in range(0, n-i-1):\n      if arr[j] > arr[j+1]:\n        arr[j], arr[j+1] = arr[j+1], arr[j]`,
    'C': `void bubbleSort(int arr[], int n) {\n  for (int i=0;i<n-1;i++)\n    for(int j=0;j<n-i-1;j++)\n      if(arr[j]>arr[j+1]){\n        int t=arr[j];arr[j]=arr[j+1];arr[j+1]=t;\n      }\n}`,
    'C#': `void BubbleSort(int[] arr) {\n  for(int i=0;i<arr.Length-1;i++)\n    for(int j=0;j<arr.Length-i-1;j++)\n      if(arr[j]>arr[j+1]){\n        int t=arr[j];arr[j]=arr[j+1];arr[j+1]=t;\n      }\n}`
  },
  'Selection Sort': {
    'C++': `void selectionSort(int arr[], int n) {\n  for (int i = 0; i < n-1; i++) {\n    int min_idx = i;\n    for (int j = i+1; j < n; j++)\n      if (arr[j] < arr[min_idx])\n        min_idx = j;\n    swap(arr[min_idx], arr[i]);\n  }\n}`,
    'Java': `void selectionSort(int[] arr) {\n  for (int i = 0; i < arr.length-1; i++) {\n    int min_idx = i;\n    for (int j = i+1; j < arr.length; j++)\n      if (arr[j] < arr[min_idx]) min_idx = j;\n    int t = arr[min_idx]; arr[min_idx] = arr[i]; arr[i] = t;\n  }\n}`,
    'Python': `def selection_sort(arr):\n  for i in range(len(arr)):\n    min_idx = i\n    for j in range(i+1, len(arr)):\n      if arr[min_idx] > arr[j]:\n        min_idx = j\n    arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
    'C': `void selectionSort(int arr[], int n) {\n  for (int i=0; i<n-1; i++) {\n    int min_idx=i;\n    for (int j=i+1; j<n; j++)\n      if (arr[j]<arr[min_idx]) min_idx=j;\n    int t=arr[min_idx]; arr[min_idx]=arr[i]; arr[i]=t;\n  }\n}`,
    'C#': `void SelectionSort(int[] arr) {\n  for (int i=0; i<arr.Length-1; i++) {\n    int min_idx=i;\n    for (int j=i+1; j<arr.Length; j++)\n      if (arr[j]<arr[min_idx]) min_idx=j;\n    int t=arr[min_idx]; arr[min_idx]=arr[i]; arr[i]=t;\n  }\n}`
  },
  'Insertion Sort': {
    'C++': `void insertionSort(int arr[], int n) {\n  for (int i = 1; i < n; i++) {\n    int key = arr[i];\n    int j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j = j - 1;\n    }\n    arr[j + 1] = key;\n  }\n}`,
    'Java': `void insertionSort(int[] arr) {\n  for (int i = 1; i < arr.length; ++i) {\n    int key = arr[i];\n    int j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j = j - 1;\n    }\n    arr[j + 1] = key;\n  }\n}`,
    'Python': `def insertion_sort(arr):\n  for i in range(1, len(arr)):\n    key = arr[i]\n    j = i-1\n    while j >= 0 and key < arr[j]:\n      arr[j + 1] = arr[j]\n      j -= 1\n    arr[j + 1] = key`,
    'C': `void insertionSort(int arr[], int n) {\n  for (int i=1; i<n; i++) {\n    int key=arr[i], j=i-1;\n    while(j>=0 && arr[j]>key) { arr[j+1]=arr[j]; j--; }\n    arr[j+1]=key;\n  }\n}`,
    'C#': `void InsertionSort(int[] arr) {\n  for (int i=1; i<arr.Length; i++) {\n    int key=arr[i], j=i-1;\n    while(j>=0 && arr[j]>key) { arr[j+1]=arr[j]; j--; }\n    arr[j+1]=key;\n  }\n}`
  },
  'Merge Sort': {
    'C++': `void merge(int arr[], int l, int m, int r) { /* ... */ }\nvoid mergeSort(int arr[], int l, int r) {\n  if (l >= r) return;\n  int m = l + (r - l) / 2;\n  mergeSort(arr, l, m);\n  mergeSort(arr, m + 1, r);\n  merge(arr, l, m, r);\n}`,
    'Java': `void merge(int[] arr, int l, int m, int r) { /* ... */ }\nvoid sort(int[] arr, int l, int r) {\n  if (l < r) {\n    int m = l + (r - l) / 2;\n    sort(arr, l, m);\n    sort(arr, m + 1, r);\n    merge(arr, l, m, r);\n  }\n}`,
    'Python': `def merge_sort(arr):\n  if len(arr) > 1:\n    mid = len(arr)//2\n    L = arr[:mid]; R = arr[mid:]\n    merge_sort(L); merge_sort(R)\n    # merge logic...`,
    'C': `void merge(int arr[], int l, int m, int r) { /* ... */ }\nvoid mergeSort(int arr[], int l, int r) {\n  if(l<r) {\n    int m = l+(r-l)/2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m+1, r);\n    merge(arr, l, m, r);\n  }\n}`,
    'C#': `void Merge(int[] arr, int l, int m, int r) { /* ... */ }\nvoid MergeSort(int[] arr, int l, int r) {\n  if(l<r) {\n    int m = l+(r-l)/2;\n    MergeSort(arr, l, m);\n    MergeSort(arr, m+1, r);\n    Merge(arr, l, m, r);\n  }\n}`
  },
  'Quick Sort': {
    'C++': `int partition(int arr[], int low, int high) {\n  int pivot = arr[high], i = (low - 1);\n  for (int j = low; j <= high - 1; j++) {\n    if (arr[j] < pivot)\n      swap(arr[++i], arr[j]);\n  }\n  swap(arr[i + 1], arr[high]);\n  return (i + 1);\n}\nvoid quickSort(int arr[], int low, int high) {\n  if (low < high) {\n    int pi = partition(arr, low, high);\n    quickSort(arr, low, pi - 1);\n    quickSort(arr, pi + 1, high);\n  }\n}`,
    'Java': `int partition(int[] arr, int low, int high) {\n  int pivot = arr[high], i = (low-1);\n  for (int j=low; j<high; j++) {\n    if (arr[j] < pivot) {\n      int t=arr[++i]; arr[i]=arr[j]; arr[j]=t;\n    }\n  }\n  int t=arr[i+1]; arr[i+1]=arr[high]; arr[high]=t;\n  return i+1;\n}\nvoid sort(int[] arr, int low, int high) {\n  if (low < high) {\n    int pi = partition(arr, low, high);\n    sort(arr, low, pi-1);\n    sort(arr, pi+1, high);\n  }\n}`,
    'Python': `def partition(arr, low, high):\n  pivot = arr[high]\n  i = low - 1\n  for j in range(low, high):\n    if arr[j] <= pivot:\n      i += 1\n      arr[i], arr[j] = arr[j], arr[i]\n  arr[i + 1], arr[high] = arr[high], arr[i + 1]\n  return i + 1\n\ndef quick_sort(arr, low, high):\n  if low < high:\n    pi = partition(arr, low, high)\n    quick_sort(arr, low, pi - 1)\n    quick_sort(arr, pi + 1, high)`,
    'C': `int partition(int arr[], int low, int high) {\n  int pivot=arr[high], i=(low-1);\n  for(int j=low;j<high;j++) {\n    if(arr[j]<pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }\n  }\n  int t=arr[i+1]; arr[i+1]=arr[high]; arr[high]=t;\n  return (i+1);\n}\nvoid quickSort(int arr[], int low, int high) {\n  if(low<high) {\n    int pi = partition(arr, low, high);\n    quickSort(arr, low, pi-1);\n    quickSort(arr, pi+1, high);\n  }\n}`,
    'C#': `int Partition(int[] arr, int low, int high) {\n  int pivot=arr[high], i=(low-1);\n  for(int j=low;j<high;j++) {\n    if(arr[j]<pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }\n  }\n  int t=arr[i+1]; arr[i+1]=arr[high]; arr[high]=t;\n  return i+1;\n}\nvoid QuickSort(int[] arr, int low, int high) {\n  if(low<high) {\n    int pi = Partition(arr, low, high);\n    QuickSort(arr, low, pi-1);\n    QuickSort(arr, pi+1, high);\n  }\n}`
  },
  'Linear Search': {
    'C++': `int linearSearch(int arr[], int n, int x) {\n  for (int i=0; i<n; i++)\n    if (arr[i] == x) return i;\n  return -1;\n}`,
    'Java': `int linearSearch(int[] arr, int x) {\n  for (int i=0; i<arr.length; i++)\n    if (arr[i]==x) return i;\n  return -1;\n}`,
    'Python': `def linear_search(arr, x):\n  for i in range(len(arr)):\n    if arr[i] == x:\n      return i\n  return -1`,
    'C': `int linearSearch(int arr[],int n,int x){\n  for(int i=0;i<n;i++)\n    if(arr[i]==x) return i;\n  return -1;\n}`,
    'C#': `int LinearSearch(int[] arr, int x){\n  for(int i=0;i<arr.Length;i++)\n    if(arr[i]==x) return i;\n  return -1;\n}`
  },
  'Binary Search': {
    'C++': `int binarySearch(int arr[], int n, int x) {\n  int l=0,r=n-1;\n  while(l<=r){\n    int m=l+(r-l)/2;\n    if(arr[m]==x) return m;\n    else if(arr[m]<x) l=m+1;\n    else r=m-1;\n  }\n  return -1;\n}`,
    'Java': `int binarySearch(int[] arr, int x) {\n  int l=0,r=arr.length-1;\n  while(l<=r){\n    int m=(l+r)/2;\n    if(arr[m]==x) return m;\n    else if(arr[m]<x) l=m+1;\n    else r=m-1;\n  }\n  return -1;\n}`,
    'Python': `def binary_search(arr, x):\n  l, r = 0, len(arr)-1\n  while l <= r:\n    m = (l+r)//2\n    if arr[m]==x: return m\n    elif arr[m]<x: l=m+1\n    else: r=m-1\n  return -1`,
    'C': `int binarySearch(int arr[],int n,int x){\n  int l=0,r=n-1;\n  while(l<=r){\n    int m=(l+r)/2;\n    if(arr[m]==x) return m;\n    else if(arr[m]<x) l=m+1;\n    else r=m-1;\n  }\n  return -1;\n}`,
    'C#': `int BinarySearch(int[] arr, int x){\n  int l=0,r=arr.Length-1;\n  while(l<=r){\n    int m=(l+r)/2;\n    if(arr[m]==x) return m;\n    else if(arr[m]<x) l=m+1;\n    else r=m-1;\n  }\n  return -1;\n}`
  }
};

const ALGO_COLORS: Record<string, { background: string; color: string; borderColor: string }> = {
  'Bubble Sort': { background: '#FEF3C7', color: '#92400E', borderColor: '#FCD34D' },
  'Selection Sort': { background: '#DBEAFE', color: '#1E3A8A', borderColor: '#93C5FD' },
  'Insertion Sort': { background: '#EDE9FE', color: '#4C1D95', borderColor: '#C4B5FD' },
  'Merge Sort': { background: '#D1FAE5', color: '#064E3B', borderColor: '#6EE7B7' },
  'Quick Sort': { background: '#FCE7F3', color: '#831843', borderColor: '#F9A8D4' },
  'Linear Search': { background: '#FFEDD5', color: '#9A3412', borderColor: '#FDBA74' },
  'Binary Search': { background: '#DCFCE7', color: '#14532D', borderColor: '#86EFAC' },
};

const COLOR_MAP: Record<StepType, string> = {
  compare: '#FBBF24', swap: '#EF4444', sorted: '#10B981',
  active: '#6366F1', found: '#10B981', pivot: '#F59E0B',
  left: '#3B82F6', right: '#EF4444', mid: '#8B5CF6',
  eliminated: '#94A3B8', reset: '#E2E8F0'
};

const LABEL_MAP: Record<StepType, string> = {
  compare: 'Comparing', swap: 'Swapping', sorted: 'Sorted',
  active: 'Active', found: 'Found!', pivot: 'Pivot',
  left: 'Left', right: 'Right', mid: 'Mid',
  eliminated: 'Eliminated', reset: 'Default'
};

function getBoxStyle(type: StepType) {
  return { background: COLOR_MAP[type] + '33', border: `2px solid ${COLOR_MAP[type]}`, color: COLOR_MAP[type] };
}

interface Props {
  onBack?: () => void;
}

const ArrayVisualizer: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<number[]>(() => {
    try {
      const saved = sessionStorage.getItem('av_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [38, 15, 8, 42, 23, 56, 11];
  });
  const [inputValue, setInputValue] = useState('');
  const [sortAlgo, setSortAlgo] = useState(() => sessionStorage.getItem('av_sortAlgo') || '');
  const [searchAlgo, setSearchAlgo] = useState(() => sessionStorage.getItem('av_searchAlgo') || '');
  const [language, setLanguage] = useState(() => sessionStorage.getItem('av_language') || 'C++');
  const [searchTarget, setSearchTarget] = useState(() => sessionStorage.getItem('av_searchTarget') || '');

  const [stepsStateDummy, setSteps] = useState<Step[]>([]); // remove unused
  const [currentStep, setCurrentStep] = useState(() => {
    const s = sessionStorage.getItem('av_currentStep');
    return s ? parseInt(s, 10) : -1;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(() => {
    const s = sessionStorage.getItem('av_speed');
    return s ? parseInt(s, 10) : 600;
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sessionStorage.setItem('av_data', JSON.stringify(data));
    sessionStorage.setItem('av_sortAlgo', sortAlgo);
    sessionStorage.setItem('av_searchAlgo', searchAlgo);
    sessionStorage.setItem('av_language', language);
    sessionStorage.setItem('av_searchTarget', searchTarget);
    sessionStorage.setItem('av_currentStep', currentStep.toString());
    sessionStorage.setItem('av_speed', speed.toString());
  }, [data, sortAlgo, searchAlgo, language, searchTarget, currentStep, speed]);

  const activeAlgo = sortAlgo || searchAlgo;
  const algoInfo = activeAlgo ? ALGO_INFO[activeAlgo] : null;

  const steps = React.useMemo(() => {
    if (!activeAlgo) return [];
    if (sortAlgo === 'Bubble Sort') return generateBubbleSortSteps(data);
    else if (sortAlgo === 'Selection Sort') return generateSelectionSortSteps(data);
    else if (sortAlgo === 'Insertion Sort') return generateInsertionSortSteps(data);
    else if (sortAlgo === 'Merge Sort') return generateMergeSortSteps(data);
    else if (sortAlgo === 'Quick Sort') return generateQuickSortSteps(data);
    else if (searchAlgo === 'Linear Search') return generateLinearSearchSteps(data, parseInt(searchTarget) || 0);
    else if (searchAlgo === 'Binary Search') return generateBinarySearchSteps(data, parseInt(searchTarget) || 0);
    return [];
  }, [activeAlgo, sortAlgo, searchAlgo, data, searchTarget]);

  const codeToShow = SNIPPETS[activeAlgo]?.[language]
    || '// Select an algorithm above\n// to view its code here.';

  const currentDisplay = currentStep >= 0 && steps[currentStep]
    ? steps[currentStep]
    : null;

  const displayArray = currentDisplay ? currentDisplay.array : data;
  const highlights = currentDisplay ? currentDisplay.highlights : [];
  
  const getHighlight = (i: number) => highlights.find(h => h.index === i);

  function stopPlayback() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
  }

  function handlePlay() {
    let s = steps;
    if (s.length === 0) return;
    if (currentStep >= s.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
      let idx = 0;
      const id = setInterval(() => {
        idx++;
        if (idx >= s.length) { clearInterval(id); setIsPlaying(false); setCurrentStep(s.length - 1); return; }
        setCurrentStep(idx);
      }, speed);
      intervalRef.current = id;
      return;
    }
    setIsPlaying(true);
    let idx = currentStep < 0 ? 0 : currentStep;
    setCurrentStep(idx);
    const id = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(id); setIsPlaying(false); setCurrentStep(s.length - 1); return; }
      setCurrentStep(idx);
    }, speed);
    intervalRef.current = id;
  }

  function handlePause() { stopPlayback(); }

  function handleReset() {
    stopPlayback();
    setCurrentStep(-1);
  }

  function handleStepForward() {
    if (steps.length === 0) return;
    if (currentStep < 0) { setCurrentStep(0); return; }
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
  }

  function handleStepBack() {
    if (currentStep > 0) setCurrentStep(c => c - 1);
    else if (currentStep === 0) setCurrentStep(-1);
  }

  useEffect(() => { return () => stopPlayback(); }, []);

  const handleAdd = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && data.length < 12) { setData([...data, num]); setInputValue(''); handleReset(); }
  };

  const handleRemove = (index: number) => { setData(data.filter((_, i) => i !== index)); handleReset(); };
  const handleClear = () => { setData([]); handleReset(); };
  const handleRandom = () => {
    const len = Math.floor(Math.random() * 5) + 5;
    setData(Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 5));
    handleReset();
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSortAlgo(e.target.value); setSearchAlgo(''); handleReset(); };
  const handleSearchChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setSearchAlgo(e.target.value); setSortAlgo(''); handleReset(); };

  const isSearching = !!searchAlgo;
  const progress = steps.length > 0 ? Math.round(((currentStep + 1) / steps.length) * 100) : 0;

  return (
    <div className="av-container">
      {/* SIDEBAR */}
      <div className="av-sidebar">
        <div className="av-header">
          {onBack && (
            <button className="av-back-btn" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back
            </button>
          )}
          <h2>Array Builder</h2>
          <p>Build your dataset & run algorithms</p>
        </div>

        <div className="av-input-group">
          <input type="number" className="av-input" placeholder="Add number" value={inputValue}
            onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <button className="av-btn-add" onClick={handleAdd}>+ Add</button>
        </div>

        <div className="av-pills">
          {data.map((num, i) => (
            <div className="av-pill" key={i}>{num}
              <button className="av-pill-remove" onClick={() => handleRemove(i)}>✕</button>
            </div>
          ))}
        </div>

        <div className="av-actions">
          <button className="av-btn-action" onClick={handleClear}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Clear
          </button>
          <button className="av-btn-action" onClick={handleRandom}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 8h.01"></path><path d="M8 8h.01"></path><path d="M8 16h.01"></path><path d="M16 16h.01"></path><path d="M12 12h.01"></path></svg>
            Random
          </button>
        </div>

        <hr className="av-divider" />

        <div className="av-section">
          <h3 className="av-section-title">Sorting Algorithms</h3>
          <select className="av-select" style={sortAlgo ? ALGO_COLORS[sortAlgo] : {}} value={sortAlgo} onChange={handleSortChange}>
            <option value="" disabled>Select Algorithm...</option>
            {SORTING_ALGOS.map(a => <option key={a}>{a}</option>)}
          </select>
          <h3 className="av-section-title">Searching Algorithms</h3>
          <select className="av-select" style={searchAlgo ? ALGO_COLORS[searchAlgo] : {}} value={searchAlgo} onChange={handleSearchChange}>
            <option value="" disabled>Select Algorithm...</option>
            {SEARCHING_ALGOS.map(a => <option key={a}>{a}</option>)}
          </select>
          {isSearching && (
            <div style={{ marginTop: 12 }}>
              <h3 className="av-section-title">Search Target</h3>
              <input type="number" className="av-input" placeholder="Enter target value"
                value={searchTarget} onChange={e => { setSearchTarget(e.target.value); handleReset(); }} />
            </div>
          )}
        </div>

        {algoInfo && (
          <div className="av-complexity-card">
            <h3 className="av-section-title">Time Complexity</h3>
            <div className="av-complexity-grid">
              <div className="av-complexity-item best"><span>Best</span><strong>{algoInfo.best}</strong></div>
              <div className="av-complexity-item avg"><span>Average</span><strong>{algoInfo.average}</strong></div>
              <div className="av-complexity-item worst"><span>Worst</span><strong>{algoInfo.worst}</strong></div>
              <div className="av-complexity-item space"><span>Space</span><strong>{algoInfo.space}</strong></div>
            </div>
            <p className="av-algo-desc">{algoInfo.description}</p>
          </div>
        )}

        <div className="av-section" style={{ padding: 0, background: 'transparent', border: 'none' }}>
          <h3 className="av-section-title">Code Generator</h3>
          <div className="av-lang-tabs">
            {LANGUAGES.map(lang => (
              <button key={lang} className={`av-lang-tab ${language === lang ? 'active' : ''}`} onClick={() => setLanguage(lang)}>{lang}</button>
            ))}
          </div>
          <div className="av-code-block">
            <pre>{codeToShow.split('\n').map((line, i) => {
              const keywords = ['void', 'int', 'for', 'if', 'return', 'def', 'len', 'range', 'while', 'else', 'elif'];
              const parts = line.split(new RegExp("\\b(" + keywords.join('|') + ")\\b", "g"));
              return <div key={i}>{parts.map((p, j) => keywords.includes(p) ? <span key={j} className="kw">{p}</span> : p)}</div>;
            })}</pre>
          </div>
        </div>
      </div>

      {/* MAIN CANVAS */}
      <div className="av-main">

        {/* Controls */}
        <div className="av-controls-bar">
          <div className="av-playback">
            <button className="av-ctrl-btn" onClick={handleStepBack} disabled={currentStep <= 0} title="Step Back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
            </button>
            {isPlaying
              ? <button className="av-ctrl-btn play active" onClick={handlePause} title="Pause">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>
              : <button className="av-ctrl-btn play" onClick={handlePlay} disabled={!activeAlgo || data.length === 0} title="Play">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
            }
            <button className="av-ctrl-btn" onClick={handleStepForward} disabled={!activeAlgo || (steps.length > 0 && currentStep >= steps.length - 1)} title="Step Forward">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
            </button>
            <button className="av-ctrl-btn reset" onClick={handleReset} title="Reset">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </button>
          </div>

          <div className="av-speed-control">
            <span>Speed</span>
            <input type="range" min={100} max={1500} step={100} value={1600 - speed}
              onChange={e => setSpeed(1600 - parseInt(e.target.value))} />
            <span>{speed < 400 ? 'Fast' : speed < 900 ? 'Med' : 'Slow'}</span>
          </div>

          {steps.length > 0 && (
            <div className="av-step-counter">
              Step {Math.max(0, currentStep + 1)} / {steps.length}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {steps.length > 0 && (
          <div className="av-progress-bar-wrap">
            <div className="av-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Legend */}
        <div className="av-legend">
          {(['compare','swap','sorted','found','pivot','left','mid','right','eliminated'] as StepType[]).map(type => (
            <div key={type} className="av-legend-item">
              <div className="av-legend-dot" style={{ background: COLOR_MAP[type] }} />
              <span>{LABEL_MAP[type]}</span>
            </div>
          ))}
        </div>

        {/* Array Display */}
        <div className="av-canvas">
          <div className="av-array-display">
            {displayArray.map((num, i) => {
              const hl = getHighlight(i);
              const boxStyle = hl ? getBoxStyle(hl.type) : {};
              return (
                <div className="av-array-element" key={i}>
                  <div className={`av-box ${!hl ? 'default' : ''}`} style={{ ...boxStyle, transition: 'all 0.3s ease' }}>
                    {num}
                    {hl && <div className="av-box-label">{LABEL_MAP[hl.type]}</div>}
                  </div>
                  <div className="av-index">[{i}]</div>
                </div>
              );
            })}
          </div>

          {/* Description Log */}
          <div className="av-description">
            {steps.length === 0 || currentStep < 0 ? (
              <div className="av-desc-empty">
                {activeAlgo
                  ? (
                    <>
                      Press <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline', verticalAlign: 'middle', margin: '0 4px'}}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> 
                      Play to visualize {activeAlgo}
                    </>
                  )
                  : 'Select an algorithm from the sidebar to begin'}
              </div>
            ) : (
              <div className="av-log-list">
                {steps.slice(0, currentStep + 1).map((step, i) => (
                  <div
                    key={i}
                    className="av-log-item"
                    style={{
                      borderLeftColor: step.highlights[0]
                        ? COLOR_MAP[step.highlights[0].type] || '#94A3B8'
                        : '#94A3B8',
                      opacity: i === currentStep ? 1 : 0.55,
                    }}
                  >
                    <span className="av-log-step-num">Step {i + 1} / {steps.length}</span>
                    <span className="av-log-text">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', color: '#6366F1'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      {step.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrayVisualizer;
