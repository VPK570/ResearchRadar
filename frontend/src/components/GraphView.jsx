import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphView({ data, loading, onNodeClick }) {
  const fgRef = useRef();
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth - 420 : 800, // Sync with sidebar width
    height: typeof window !== 'undefined' ? window.innerHeight : 600
  });

  
  // Format data for React Force Graph
  const graphData = useMemo(() => {
    if (!data || !data.nodes || !data.edges) return { nodes: [], links: [] };
    
    // In our backend, gap vs normal edges is differentiated by 'gap: True' boolean or implicit
    const formattedLinks = data.edges.map(link => ({
      ...link,
      // Map 'gap' boolean to a type if not provided
      type: link.gap ? 'gap' : 'semantic'
    }));
    
    return {
      nodes: data.nodes.map(node => ({ ...node, id: node.id })),
      links: formattedLinks
    };
  }, [data]);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth - 400, // Account for sidebar width
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Zoom to fit when data loads
  useEffect(() => {
    if (graphData.nodes.length > 0 && fgRef.current && !loading) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [graphData.nodes.length, loading]);

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const label = node.title || node.id;
    const fontSize = 12 / globalScale;
    
    // Draw Node
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#0f172a'; // bg base
    ctx.stroke();

    // Node interactions - hover text
    if (node === window.hoveredNode) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#38bdf8'; // accent color
      ctx.fill();

      // Background for text
      ctx.font = `${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // padding
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Dark slate background
      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - 12 - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
      
      // Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(label, node.x, node.y - 12);
    }
  }, []);

  const linkCanvasObject = useCallback((link, ctx) => {
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    
    if (link.type === 'gap') {
      // Glow and styling for gap edges
      ctx.strokeStyle = '#f472b6'; // pink-400
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); // Dashed line
      
      // Add glow effect manually on canvas
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 8;
    } else {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'; // faint sky
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }
    
    ctx.stroke();
    ctx.shadowBlur = 0; // reset for next drawing
    ctx.setLineDash([]); // reset for next drawing
  }, []);

  if (graphData.nodes.length === 0 && !loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
        <Radar size={48} className="mb-4 opacity-50" />
        <p>No papers loaded. Enter a topic to start.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0f172a] absolute inset-0">
      <ForceGraph2D
        ref={fgRef}
        width={windowDimensions.width}
        height={windowDimensions.height}
        graphData={graphData}
        nodeLabel={(node) => `<b>${node.title}</b><br/><span style="color:#38bdf8">${node.year || 'Unknown Year'}</span>`}
        nodeColor={() => '#f8fafc'}
        nodeRelSize={4}
        linkWidth={(link) => (link.type === 'gap' ? 2 : 0.5)}
        linkLineDash={(link) => (link.type === 'gap' ? [4, 4] : null)}
        linkColor={(link) => (link.type === 'gap' ? '#f472b6' : 'rgba(56, 189, 248, 0.15)')}
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={linkCanvasObject}
        nodeCanvasObject={nodeCanvasObject}
        onNodeClick={onNodeClick}
        onNodeHover={node => {

          // Custom hover logic to trigger rerender for nodeCanvasObject text
          window.hoveredNode = node;
        }}
        d3Force="charge"
        d3VelocityDecay={0.4}
      />
    </div>
  );
}

// Dummy icon for empty state if not imported above
function Radar(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
      <path d="M4 6h.01" />
      <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
      <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
      <path d="M12 18h.01" />
      <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
      <circle cx="12" cy="12" r="2" />
      <path d="m13.41 10.59 5.66-5.66" />
    </svg>
  );
}
