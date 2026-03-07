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
    if (!isAuthenticated) return;

    const fetchHistory = async () => {
      try {
        // We'll need a backend endpoint for this. 
        // For now, let's assume /api/search/history exists or create it.
        const resp = await client.get('/api/search/history');
        setSearches(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
     return (
        <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-100">
            <h1 className="text-xl font-bold mb-4">Please Sign In</h1>
            <p className="text-slate-400">You need an account to track your search history.</p>
            <button onClick={() => navigate('/')} className="mt-8 text-sky-400 font-bold hover:underline">Back to Search</button>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
             <History className="text-sky-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Search History</h1>
            <p className="text-slate-500 text-sm font-medium">Your past explorations and synthesized hypotheses.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
             <Loader2 className="w-10 h-10 text-slate-700 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {searches.length === 0 ? (
               <div className="p-20 text-center bg-slate-800/20 border border-slate-700/50 rounded-2xl text-slate-500">
                  <Search className="mx-auto mb-4 opacity-10" size={48} />
                  <p>You haven't performed any searches yet.</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-sky-400 hover:text-sky-300 font-bold">Start Searching</button>
               </div>
            ) : (
              searches.map(search => (
                <div 
                  key={search.id}
                  onClick={() => navigate(`/results/${search.id}`)}
                  className="group bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:bg-slate-800/80 hover:border-sky-500/30 transition-all cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-colors">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-200 group-hover:text-slate-100 transition-colors">{search.query}</h3>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            <span>{new Date(search.created_at).toLocaleDateString()}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span className={search.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}>{search.status}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span>{search.paper_count} Papers</span>
                        </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ArrowRight className="text-slate-700 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
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
