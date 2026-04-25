import React from 'react';
import './DataStructures.css';

interface DataStructuresProps {
  onOpenVisualizer: () => void;
}

const DataStructures: React.FC<DataStructuresProps> = ({ onOpenVisualizer }) => {
  const cards = [
    {
      id: 'array',
      title: 'Array',
      desc: 'Visualize contiguous memory allocation, sorting algorithms, and pointer manipulation.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="8" rx="1" ry="1"></rect>
          <line x1="9" y1="8" x2="9" y2="16"></line>
          <line x1="15" y1="8" x2="15" y2="16"></line>
        </svg>
      )
    },
    {
      id: 'linked-list',
      title: 'Linked List',
      desc: 'Explore dynamic node structures, pointer traversal, and complex list reversals.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="12" r="3"></circle>
          <line x1="9" y1="12" x2="15" y2="12"></line>
          <polyline points="13 10 15 12 13 14"></polyline>
        </svg>
      )
    },
    {
      id: 'stack',
      title: 'Stack',
      desc: 'Understand LIFO behavior, recursive call stacks, and depth-first mechanics.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 12 12 17 22 12"></polyline>
          <polyline points="2 17 12 22 22 17"></polyline>
        </svg>
      )
    },
    {
      id: 'queue',
      title: 'Queue',
      desc: 'Master FIFO concepts, scheduling algorithms, and breadth-first search logic.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
          <line x1="8" y1="6" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="18"></line>
          <line x1="2" y1="12" x2="8" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'graphs',
      title: 'Graphs',
      desc: "Navigate complex networks. Learn Dijkstra's, A*, and topological sorting.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <circle cx="5" cy="6" r="3"></circle>
          <circle cx="19" cy="6" r="3"></circle>
          <circle cx="5" cy="18" r="3"></circle>
          <circle cx="19" cy="18" r="3"></circle>
          <line x1="6.5" y1="8" x2="10.5" y2="10.5"></line>
          <line x1="17.5" y1="8" x2="13.5" y2="10.5"></line>
          <line x1="6.5" y1="16" x2="10.5" y2="13.5"></line>
          <line x1="17.5" y1="16" x2="13.5" y2="13.5"></line>
        </svg>
      )
    },
    {
      id: 'trees',
      title: 'Trees',
      desc: 'Deconstruct hierarchical data. Visualize Binary Search Trees, AVL balancing, and various traversal methods (Inorder, Preorder, Postorder) step-by-step.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3"></circle>
          <circle cx="6" cy="13" r="3"></circle>
          <circle cx="18" cy="13" r="3"></circle>
          <circle cx="3" cy="20" r="3"></circle>
          <circle cx="9" cy="20" r="3"></circle>
          <line x1="10.5" y1="7.5" x2="7.5" y2="10.5"></line>
          <line x1="13.5" y1="7.5" x2="16.5" y2="10.5"></line>
          <line x1="5" y1="15.5" x2="4" y2="17.5"></line>
          <line x1="7" y1="15.5" x2="8" y2="17.5"></line>
        </svg>
      )
    }
  ];

  return (
    <div className="data-structures-container">
      <div className="data-structures-header">
        <h1 className="data-structures-title">
          Master Algorithms
          <span>Visually.</span>
        </h1>
        <p className="data-structures-subtitle">
          Select a core data structure below to launch the interactive workspace. Step through logic, manipulate nodes, and build your intuition.
        </p>
      </div>
      
      <div className="data-structures-grid">
        {cards.map(card => (
          <div key={card.id} className="ds-card">
            <div className="ds-icon-container">
              <div className="ds-icon">
                {card.icon}
              </div>
            </div>
            <h3 className="ds-card-title">{card.title}</h3>
            <p className="ds-card-desc">{card.desc}</p>
            <button 
              className="ds-card-btn"
              onClick={card.id === 'array' ? onOpenVisualizer : undefined}
            >
              OPEN VISUALIZER
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataStructures;
