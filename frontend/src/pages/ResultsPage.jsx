import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, ArrowLeft, Loader2, Search } from 'lucide-react';
import client from '../api/client';
import GraphView from '../components/GraphView';
import HypothesisPanel from '../components/HypothesisPanel';
import ExportBar from '../components/ExportBar';
import NodeDrawer from '../components/NodeDrawer';


export default function ResultsPage() {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    let interval;
    const fetchStatus = async () => {
      try {
        const resp = await client.get(`/api/search/${searchId}/status`);
        setSearchData(resp.data);
        
        if (resp.data.status === 'completed' || resp.data.status === 'failed') {
          setPolling(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch search session details.');
        setPolling(false);
        clearInterval(interval);
      }
    };

    fetchStatus();
    if (polling) {
        interval = setInterval(fetchStatus, 2000);
    }

    return () => clearInterval(interval);
  }, [searchId, polling]);

  const steps = [
    { id: 'fetching', label: 'Fetching Papers' },
    { id: 'building', label: 'Building Graph' },
    { id: 'gaps', label: 'Detecting Gaps' },
    { id: 'hypotheses', label: 'AI Synthesis' }
  ];

  const getCurrentStepIndex = () => {
    if (!searchData) return 0;
    const idx = steps.findIndex(s => s.id === searchData.status);
    if (idx === -1 && searchData.status === 'completed') return 4;
    return idx === -1 ? 0 : idx;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 z-30 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1"></div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter block leading-none mb-1">Search Query</span>
            <h1 className="text-sm font-semibold m-0">{searchData?.query || 'Loading...'}</h1>
          </div>
        </div>

        {polling && (
          <div className="flex items-center gap-6">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${i <= currentStepIndex ? 'bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'bg-slate-700'}`}></div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${i === currentStepIndex ? 'text-sky-400' : 'text-slate-500'}`}>
                  {step.label}
                </span>
                {i < steps.length - 1 && <div className="w-4 h-px bg-white/10 ml-2"></div>}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
            {!polling && searchData?.status === 'completed' && (
                <ExportBar searchId={searchId} />
            )}
        </div>

      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Graph Area */}
        <div className="flex-1 relative bg-[#0a0f1d]">
          {searchData?.status === 'completed' && searchData.results ? (
            <GraphView 
                data={searchData.results} 
                loading={false} 
                onNodeClick={setSelectedNode}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
              <Loader2 className="w-10 h-10 text-sky-500 animate-spin opacity-40" />
              <p className="text-slate-500 font-medium animate-pulse text-center">
                {searchData?.status === 'failed' ? 'Encountered an error' : 
                 searchData?.status === 'fetching' ? 'Searching literature archive...' :
                 searchData?.status === 'building' ? `Discovered ${searchData.paper_count || 0} relevant papers. Constructing graph...` :
                 'Synthesizing knowledge gaps...'}
              </p>
            </div>
          )}
          
          <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
          
          {error && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-rose-500/20 border border-rose-500/50 p-4 rounded-xl flex items-center gap-3 text-rose-300 backdrop-blur-md">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-[420px] border-l border-white/5 bg-slate-900/80 backdrop-blur-xl flex flex-col z-20">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Synthesis Engine</h2>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    <span className="text-xs font-bold text-slate-300">Active Pipeline</span>
                </div>
            </div>
            {searchData?.results?.intelligence?.freshness && (
                <div className="text-right">
                    <span className="block text-[9px] font-bold text-sky-500 uppercase tracking-tighter">
                        {searchData.results.intelligence.freshness.freshness}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                        Avg Age: {searchData.results.intelligence.freshness.avg_age}y
                    </span>
                </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-8">
            {/* Feature 8: Traceability Panel (Mini version) */}
            {searchData?.status === 'completed' && (
                <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-3">Reasoning Chain</h3>
                    <div className="space-y-3 relative">
                        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-sky-500/20"></div>
                        {[
                            { step: 'Discovery', label: `${searchData.paper_count} papers indexed` },
                            { step: 'Topology', label: `${searchData.results.intelligence.gap_count} gaps found` },
                            { step: 'Synthesis', label: 'Gemini 2.0 Brain Active' }
                        ].map((s, idx) => (
                            <div key={idx} className="flex items-center gap-4 pl-4 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-sky-500 bg-slate-900 z-10"></div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase">{s.step}</div>
                                    <div className="text-[11px] font-bold text-slate-300">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <HypothesisPanel 
                hypotheses={searchData?.results?.hypotheses} 
                loading={polling && searchData?.status !== 'hypotheses'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
