import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Radar, TrendingUp, History, Bookmark } from 'lucide-react';
import client from '../api/client';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [numPapers, setNumPapers] = useState(50);
  const [numGaps, setNumGaps] = useState(5);
  const [simThreshold, setSimThreshold] = useState(0.55);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const resp = await client.post('/api/search/', {
        query,
        num_papers: parseInt(numPapers),
        num_gaps: parseInt(numGaps),
        sim_threshold: parseFloat(simThreshold)
      });
      
      const searchId = resp.data.id;
      
      // Save to guest history in localStorage
      const guestHistory = JSON.parse(localStorage.getItem('guest_history') || '[]');
      const newEntry = {
        id: searchId,
        query: query,
        status: 'fetching',
        paper_count: 0,
        created_at: new Date().toISOString()
      };
      
      // Keep only last 20 searches, avoid duplicates
      const filteredHistory = guestHistory.filter(h => h.query !== query);
      localStorage.setItem('guest_history', JSON.stringify([newEntry, ...filteredHistory].slice(0, 20)));
      
      navigate(`/results/${searchId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start search. Backend might be down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-sky-500/10 rounded-3xl border border-sky-500/20 shadow-2xl shadow-sky-500/10">
            <Radar className="text-sky-400 w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black tracking-tight">
            Research<span className="text-sky-400">Radar</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Discover hidden connections between papers and generate novel AI hypotheses.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-6 w-full">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative bg-slate-800 rounded-2xl border border-slate-700 flex items-center p-2 shadow-2xl">
              <Search className="ml-4 text-slate-500" size={24} />
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a research topic (e.g. CRISPR gene editing)"
                className="w-full bg-transparent border-none focus:ring-0 text-xl py-4 px-4 placeholder:text-slate-600 outline-none"
              />
              <button 
                disabled={loading}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
              >
                {loading ? 'Starting...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Config Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between">
                Papers <span>{numPapers}</span>
              </label>
              <input 
                type="range" min="20" max="200" step="10" 
                value={numPapers} onChange={(e) => setNumPapers(e.target.value)}
                className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between">
                Gaps <span>{numGaps}</span>
              </label>
              <input 
                type="range" min="1" max="10" step="1" 
                value={numGaps} onChange={(e) => setNumGaps(e.target.value)}
                className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between">
                Similarity <span>{simThreshold}</span>
              </label>
              <input 
                type="range" min="0.3" max="0.9" step="0.05" 
                value={simThreshold} onChange={(e) => setSimThreshold(e.target.value)}
                className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </form>

        <div className="pt-8 flex justify-center gap-8 text-slate-500 text-sm font-medium">
             <div className="flex items-center gap-2 hover:text-slate-300 cursor-pointer transition-colors" onClick={() => navigate('/history')}>
                <History size={16} /> History
             </div>
             <div className="flex items-center gap-2 hover:text-slate-300 cursor-pointer transition-colors" onClick={() => navigate('/saved')}>
                <Bookmark size={16} /> Saved
             </div>
             <div className="flex items-center gap-2">
                <TrendingUp size={16} /> Trending Tasks
             </div>
        </div>
      </div>
    </div>
  );
}
