import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Radio, 
  Brain, 
  Zap, 
  Github, 
  ExternalLink, 
  Network, 
  Database, 
  Cpu, 
  FlaskConical,
  PlusCircle,
  Layers,
  Activity
} from 'lucide-react';

/**
 * KnowledgeGraph Component
 * A custom SVG-based interactive force-simulation graph for a hackathon-ready look.
 */
const KnowledgeGraph = ({ isScanning }) => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const containerRef = useRef(null);

  // Initialize a mock graph structure
  useEffect(() => {
    const initialNodes = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 400 + 100,
      y: Math.random() * 200 + 50,
      size: Math.random() * 5 + 3,
      label: i === 0 ? "CORE" : `Paper ${i}`,
      color: i === 0 ? "#3b82f6" : "#64748b"
    }));

    const initialLinks = Array.from({ length: 20 }, () => ({
      source: Math.floor(Math.random() * 15),
      target: Math.floor(Math.random() * 15),
    })).filter(l => l.source !== l.target);

    setNodes(initialNodes);
    setLinks(initialLinks);
  }, []);

  // Simple "Force" animation effect when scanning
  useEffect(() => {
    if (!isScanning) return;
    
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        x: node.x + (Math.random() - 0.5) * 10,
        y: node.y + (Math.random() - 0.5) * 10,
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:30px_30px]"></div>
      
      <svg className="w-full h-full cursor-move">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Links */}
        {links.map((link, i) => {
          const s = nodes[link.source];
          const t = nodes[link.target];
          if (!s || !t) return null;
          return (
            <line
              key={i}
              x1={s.x} y1={s.y}
              x2={t.x} y2={t.y}
              stroke={isScanning ? "#3b82f6" : "#334155"}
              strokeWidth={isScanning ? "2" : "1"}
              strokeDasharray={isScanning ? "5,5" : "0"}
              className={isScanning ? "animate-[dash_2s_linear_infinite]" : ""}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={i} transform={`translate(${node.x},${node.y})`}>
            <circle
              r={node.size}
              fill={node.color}
              filter={node.id === 0 ? "url(#glow)" : ""}
              className={node.id === 0 ? "animate-pulse" : ""}
            />
            <text
              y={-10}
              textAnchor="middle"
              className="text-[8px] fill-slate-500 font-mono"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Overlay status */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-[10px] font-mono">
          <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`}></div>
          {isScanning ? 'TRAVERSING_EDGES' : 'GRAPH_STABLE'}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [query, setQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hypotheses, setHypotheses] = useState([
    {
      id: 1,
      title: "Neuromorphic Transformers",
      score: 94,
      hypothesis: "Combining sparse attention mechanisms from efficient transformers (Longformer) with spiking neural network architectures may lead to ultra-low-power real-time vision systems, because both exploit temporal sparsity but have never been co-optimized.",
      shared: 7,
      confidence: "HIGH",
      tags: ["Vision", "SNN", "Hardware"],
      sources: ["Longformer (2020)", "Loihi SNN Chip", "Sparse Spiking Survey"]
    },
    {
      id: 2,
      title: "Cross-Domain Protein Optimization",
      score: 88,
      hypothesis: "Utilizing Variational Quantum Eigensolvers (VQE) to optimize the side-chain packing problem in AlphaFold-derived structures could significantly reduce energy-state convergence time for complex metabolic proteins.",
      shared: 4,
      confidence: "MEDIUM",
      tags: ["Quantum", "Bio-ML"],
      sources: ["AlphaFold 2.0", "VQE Fundamentals", "Protein Dynamics"]
    }
  ]);

  const handleScan = () => {
    if (!query) return;
    setIsScanning(true);
    // Simulate API delay
    setTimeout(() => {
      setIsScanning(false);
      const newHypothesis = {
        id: Date.now(),
        title: `${query.split(' ')[0] || 'Neural'} Synergy`,
        score: Math.floor(Math.random() * 20) + 75,
        hypothesis: `Integrating ${query} with existing topological data analysis (TDA) methods may reveal latent manifolds in high-dimensional citation clusters, enabling automated discovery of interdisciplinary gaps.`,
        shared: Math.floor(Math.random() * 10) + 2,
        confidence: "PREDICTED",
        tags: ["New", "Auto-Gen"],
        sources: ["Semantic Scholar API", "Neo4j Gap Engine"]
      };
      setHypotheses([newHypothesis, ...hypotheses]);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>

      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Network size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ResearchRadar
              </h1>
              <p className="text-[10px] font-mono text-blue-500 tracking-[0.2em] uppercase">Knowledge Link Discovery</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Engine</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-700 hover:border-slate-500 transition-all text-white">
              <Github size={16} /> <span>v1.0.4-alpha</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Control Center */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Search size={18} className="text-blue-400" />
              </div>
              <h2 className="font-semibold">Idea Generator</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block font-mono">TARGET_DOMAIN</label>
                <input 
                  type="text"
                  placeholder="e.g. Protein Folding, Federated Learning"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all border-slate-700"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                />
              </div>

              <button 
                onClick={handleScan}
                disabled={isScanning || !query}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                  isScanning 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-900/40 text-white"
                }`}
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                    Scraping ArXiv...
                  </>
                ) : (
                  <>
                    <Zap size={18} /> Run Gap Detection
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-xs font-mono text-slate-500 mb-4 uppercase tracking-[0.2em]">Engine Analytics</h3>
            <div className="space-y-5">
              <StatItem icon={<Database size={14}/>} label="Papers Indexed" value="208,442,109" />
              <StatItem icon={<Cpu size={14}/>} label="Gap Search Pairs" value="1.2M / sec" />
              <StatItem icon={<Layers size={14}/>} label="Neo4j Relations" value="1.4B Edges" />
              <StatItem icon={<Activity size={14}/>} label="S-BERT Clusters" value="8,291" />
            </div>
          </div>

          <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl">
            <p className="text-[11px] text-indigo-400 font-medium">
              💡 Tip: Try combining two distant domains like "Cell Biology" and "Graph Neural Networks" to force a cross-domain bridge.
            </p>
          </div>
        </aside>

        {/* Right Content: Viz and Results */}
        <section className="lg:col-span-8 space-y-8">
          
          {/* Main Visualizer */}
          <div className="h-[350px] relative">
            <div className="absolute top-4 left-4 z-10 space-y-1">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Network size={16} className="text-blue-500" /> 
                Knowledge Topology
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">REPRESENTATION: S-BERT 768-DIM PROJECTION</p>
            </div>
            <KnowledgeGraph isScanning={isScanning} />
          </div>

          {/* Results List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2 italic">
                <Brain size={22} className="text-purple-400" /> Synthesized Hypotheses
              </h2>
              <div className="flex gap-2">
                <span className="bg-slate-900 px-2 py-1 rounded text-[10px] font-mono border border-slate-800">SORT: NOVELTY</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {hypotheses.map((item) => (
                <div key={item.id} className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:bg-slate-900/80">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                        {item.confidence === 'PREDICTED' && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold uppercase tracking-wider">New</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[9px] text-slate-500 font-mono">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-mono uppercase">Novelty Score</div>
                        <div className="text-xl font-black text-blue-500">{item.score}%</div>
                      </div>
                      <div className="h-10 w-[2px] bg-slate-800"></div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-mono uppercase">Confidence</div>
                        <div className={`text-xs font-bold uppercase ${
                          item.confidence === 'HIGH' ? 'text-green-500' : 
                          item.confidence === 'PREDICTED' ? 'text-indigo-400' : 'text-yellow-500'
                        }`}>
                          {item.confidence}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute -left-3 top-0 bottom-0 w-[2px] bg-blue-600/30"></div>
                    <p className="text-slate-300 text-sm leading-relaxed italic pl-4">
                      "{item.hypothesis}"
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-slate-800/50 pt-4 mt-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] text-slate-500 uppercase font-mono mr-2 flex items-center gap-1"><FlaskConical size={12}/> Bridges:</span>
                      {item.sources.map(s => (
                        <div key={s} className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-800 hover:text-white transition-colors cursor-pointer">
                          {s} <ExternalLink size={10} className="opacity-50" />
                        </div>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold transition-all group-hover:px-6">
                      View Full Graph <PlusCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Background Glows */}
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none -z-10"></div>
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none -z-10"></div>
    </div>
  );
};

const StatItem = ({ icon, label, value }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
      <span className="text-slate-600 group-hover:text-blue-500 transition-colors">{icon}</span>
      <span className="text-xs">{label}</span>
    </div>
    <span className="text-xs font-mono font-bold text-blue-400">{value}</span>
  </div>
);

export default App;