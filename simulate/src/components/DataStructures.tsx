import React from 'react';

const DataStructures: React.FC = () => {
  return (
    <div style={{ padding: '48px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Data Structures Algorithms</h1>
      <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>
        This section will contain various data structures algorithms and visualizations. 
        Stay tuned for upcoming features!
      </p>
      
      <div style={{ 
        marginTop: '48px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px',
        maxWidth: '1000px',
        margin: '48px auto'
      }}>
        {['Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching'].map(item => (
          <div key={item} className="card" style={{ padding: '32px', textAlign: 'center', opacity: 0.7 }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{item}</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>Coming Soon</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataStructures;
