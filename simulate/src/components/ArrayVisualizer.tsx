import React, { useState } from 'react';
import './ArrayVisualizer.css';

const LANGUAGES = ['C++', 'C#', 'C', 'Java', 'Python'];
const SORTING_ALGOS = ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'];
const SEARCHING_ALGOS = ['Linear Search', 'Binary Search'];

const SNIPPETS: Record<string, Record<string, string>> = {
  'Bubble Sort': {
    'C++': `void bubbleSort(int arr[], int n) {\n  for (int i = 0; i < n - 1; i++)\n    for (int j = 0; j < n - i - 1; j++)\n      if (arr[j] > arr[j + 1])\n        swap(arr[j], arr[j + 1]);\n}`,
    'C#': `static void BubbleSort(int[] arr) {\n  int n = arr.Length;\n  for (int i = 0; i < n - 1; i++)\n    for (int j = 0; j < n - i - 1; j++)\n      if (arr[j] > arr[j + 1]) {\n        int temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n}`,
    'C': `void bubbleSort(int arr[], int n) {\n  for (int i = 0; i < n - 1; i++)\n    for (int j = 0; j < n - i - 1; j++)\n      if (arr[j] > arr[j + 1]) {\n        int temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n}`,
    'Java': `void bubbleSort(int arr[]) {\n  int n = arr.length;\n  for (int i = 0; i < n-1; i++)\n    for (int j = 0; j < n-i-1; j++)\n      if (arr[j] > arr[j+1]) {\n        int temp = arr[j];\n        arr[j] = arr[j+1];\n        arr[j+1] = temp;\n      }\n}`,
    'Python': `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]`
  },
  'Linear Search': {
    'C++': `int linearSearch(int arr[], int n, int x) {\n  for (int i = 0; i < n; i++)\n    if (arr[i] == x)\n      return i;\n  return -1;\n}`,
    'C#': `static int LinearSearch(int[] arr, int x) {\n  for (int i = 0; i < arr.Length; i++)\n    if (arr[i] == x)\n      return i;\n  return -1;\n}`,
    'C': `int linearSearch(int arr[], int n, int x) {\n  for (int i = 0; i < n; i++)\n    if (arr[i] == x)\n      return i;\n  return -1;\n}`,
    'Java': `int linearSearch(int arr[], int x) {\n  int n = arr.length;\n  for (int i = 0; i < n; i++)\n    if (arr[i] == x)\n      return i;\n  return -1;\n}`,
    'Python': `def linear_search(arr, x):\n    for i in range(len(arr)):\n        if arr[i] == x:\n            return i\n    return -1`
  }
};

const ArrayVisualizer: React.FC = () => {
  const [data, setData] = useState<number[]>([42, 15, 8, 23, 56]);
  const [inputValue, setInputValue] = useState('');
  
  const [sortAlgo, setSortAlgo] = useState('');
  const [searchAlgo, setSearchAlgo] = useState('');
  const [language, setLanguage] = useState('C++');

  const codeToShow = SNIPPETS[sortAlgo]?.[language] || SNIPPETS[searchAlgo]?.[language] || '// Select an algorithm from the menus above\\n// to view the corresponding code.';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortAlgo(e.target.value);
    setSearchAlgo('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchAlgo(e.target.value);
    setSortAlgo('');
  };

  const handleAdd = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num)) {
      setData([...data, num]);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleClear = () => setData([]);

  const handleRandom = () => {
    const randLength = Math.floor(Math.random() * 5) + 3; // 3 to 7 elements
    const newArr = Array.from({ length: randLength }, () => Math.floor(Math.random() * 100));
    setData(newArr);
  };

  const renderCodeWithSyntax = (code: string) => {
    const keywords = ['void', 'int', 'for', 'if', 'return', 'def', 'len', 'range', 'static'];
    const regex = new RegExp("\\b(" + keywords.join('|') + ")\\b", "g");
    
    const lines = code.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(regex);
      return (
        <div key={i}>
          {parts.map((part, j) => 
            keywords.includes(part) ? <span key={j} className="keyword">{part}</span> : part
          )}
        </div>
      );
    });
  };

  return (
    <div className="av-container">
      {/* Sidebar */}
      <div className="av-sidebar">
        <div className="av-header">
          <h2>Array Builder</h2>
          <p>Configure your data set</p>
        </div>

        <div className="av-input-group">
          <input 
            type="number" 
            className="av-input" 
            placeholder="Enter number" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="av-btn-add" onClick={handleAdd}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add
          </button>
        </div>

        <div className="av-pills">
          {data.map((num, i) => (
            <div className="av-pill" key={i}>
              {num}
              <button className="av-pill-remove" onClick={() => handleRemove(i)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="av-actions">
          <button className="av-btn-action" onClick={handleClear}>Clear All</button>
          <button className="av-btn-action" onClick={handleRandom}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-8.36l5.67-5.67"/></svg>
            Random
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

        <div className="av-section">
          <h3 className="av-section-title">Sorting Algorithms</h3>
          <select className="av-select" value={sortAlgo} onChange={handleSortChange}>
            <option value="" disabled>Select Algorithm...</option>
            {SORTING_ALGOS.map(algo => <option key={algo} value={algo}>{algo}</option>)}
          </select>
          
          <h3 className="av-section-title" style={{ marginTop: '16px' }}>Searching Algorithms</h3>
          <select className="av-select" value={searchAlgo} onChange={handleSearchChange}>
            <option value="" disabled>Select Algorithm...</option>
            {SEARCHING_ALGOS.map(algo => <option key={algo} value={algo}>{algo}</option>)}
          </select>
        </div>

        <div className="av-section" style={{ padding: '0', background: 'transparent', border: 'none' }}>
          <h3 className="av-section-title">Code Generator</h3>
          
          <div className="av-lang-tabs">
            {LANGUAGES.map(lang => (
              <button 
                key={lang} 
                className={`av-lang-tab ${language === lang ? 'active' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="av-code-block">
            <pre>
              {renderCodeWithSyntax(codeToShow)}
            </pre>
          </div>

          <button className="av-btn-generate">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            Generate Code
          </button>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="av-main">
        <div className="av-status-badge">
          <div className="av-status-dot"></div>
          Ready to visualize algorithms
        </div>

        <div className="av-array-display">
          {data.map((num, i) => (
            <div className="av-array-element" key={i}>
              <div className={`av-box av-box-${i % 7}`}>
                {num}
              </div>
              <div className="av-index">{i}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArrayVisualizer;
