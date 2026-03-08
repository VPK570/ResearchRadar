import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, ArrowRight, Loader2, Clock, Trash2 } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        let allSearches = [];
        
        // 1. Fetch from backend if authenticated
        if (isAuthenticated) {
          try {
            const resp = await client.get('/api/search/history');
            allSearches = resp.data;
          } catch (err) {
            console.error("Backend history fetch failed:", err);
          }
        }
        
        // 2. Fetch from localStorage (always show, or merge)
        const guestHistory = JSON.parse(localStorage.getItem('guest_history') || '[]');
        
        // Merge and deduplicate by query if needed, or just combine
        // For simplicity, we'll combine them and sort by date
        const combined = [...allSearches, ...guestHistory].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Final deduplication by ID or Query to avoid seeing the same search twice if it was saved locally then synced
        const unique = combined.reduce((acc, current) => {
          const x = acc.find(item => item.id === current.id || item.query === current.query);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        setSearches(unique);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated]);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local search history?")) {
        localStorage.removeItem('guest_history');
        if (!isAuthenticated) {
            setSearches([]);
        } else {
            // If authenticated, we only clear local, but keep server history
            setSearches(prev => prev.filter(s => s.user_id)); // Assuming user_id exists for server items
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-10 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/')} 
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
                <Search size={20} />
            </button>
            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 shadow-lg shadow-sky-500/5">
                <History className="text-sky-400" size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tight leading-none mb-1">Search History</h1>
                <p className="text-slate-500 text-sm font-medium">Your past explorations and synthesized hypotheses.</p>
            </div>
            </div>
            
            {searches.length > 0 && (
                <button 
                    onClick={clearHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-bold transition-all"
                >
                    <Trash2 size={14} /> Clear History
                </button>
            )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-40 gap-4">
             <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
             <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Retrieving logs...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {searches.length === 0 ? (
               <div className="p-32 text-center bg-slate-800/20 border border-slate-700/50 rounded-3xl text-slate-500 backdrop-blur-sm">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                      <Search className="absolute inset-0 opacity-10 w-full h-full" />
                      <History className="absolute inset-0 opacity-5 w-full h-full animate-ping" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">No history found</h3>
                  <p className="max-w-xs mx-auto text-sm text-slate-500 leading-relaxed mb-8">
                      You haven't performed any research searches yet. Start your project now!
                  </p>
                  <button onClick={() => navigate('/')} className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl transition-all active:scale-95 shadow-xl shadow-sky-500/20">
                      START SEARCHING
                  </button>
               </div>
            ) : (
              searches.map((search, i) => (
                <div 
                  key={search.id || i}
                  onClick={() => navigate(`/results/${search.id}`)}
                  className="group bg-slate-800/30 border border-slate-700/40 p-6 rounded-2xl flex items-center justify-between hover:bg-slate-800/80 hover:border-sky-500/40 transition-all cursor-pointer shadow-xl relative overflow-hidden active:scale-[0.99]"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-sky-500/10 group-hover:text-sky-400 group-hover:border-sky-500/20 transition-all">
                        <Clock size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-slate-200 group-hover:text-white transition-colors leading-tight mb-2">{search.query}</h3>
                        <div className="flex items-center flex-wrap gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                <Clock size={12} className="text-slate-600" />
                                {new Date(search.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className={`flex items-center gap-1.5 px-2 py-1 rounded ${
                                search.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                                search.status === 'failed' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                                <Activity size={12} />
                                {search.status}
                            </span>
                            <span className="text-slate-700 font-bold">•</span>
                            <span className="flex items-center gap-1.5 text-slate-400 hover:text-sky-400 transition-colors">
                                {search.paper_count || 0} PAPERS
                            </span>
                        </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-all translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 shadow-inner">
                        <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
