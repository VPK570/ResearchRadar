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
              <p className="text-slate-500 font-medium animate-pulse">
                {searchData?.status === 'failed' ? 'Encountered an error' : 'Analyzing literature...'}
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
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Synthesis Engine</h2>
            {searchData?.paper_count > 0 && (
                <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full font-bold">
                    {searchData.paper_count} PAPERS
                </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
