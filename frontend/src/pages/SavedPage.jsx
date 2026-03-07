import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SavedPage() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchSaved = async () => {
    try {
      const resp = await client.get('/api/hypotheses/saved');
      setSaved(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchSaved();
  }, [isAuthenticated]);

  const handleDelete = async (id) => {
     try {
        await client.delete(`/api/hypotheses/saved/${id}`);
        setSaved(prev => prev.filter(s => s.id !== id));
     } catch (err) {
        console.error(err);
     }
  };

  if (!isAuthenticated) {
    return (
       <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-100">
           <h1 className="text-xl font-bold mb-4">Please Sign In</h1>
           <p className="text-slate-400">You need an account to save hypotheses.</p>
           <button onClick={() => navigate('/')} className="mt-8 text-sky-400 font-bold hover:underline">Back to Search</button>
       </div>
    );
 }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
             <Bookmark className="text-pink-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Saved Hypotheses</h1>
            <p className="text-slate-500 text-sm font-medium">Your collection of novel research directions.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
             <Loader2 className="w-10 h-10 text-slate-700 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {saved.length === 0 ? (
               <div className="p-20 text-center bg-slate-800/20 border border-slate-700/50 rounded-2xl text-slate-500">
                  <Bookmark className="mx-auto mb-4 opacity-10" size={48} />
                  <p>You haven't saved any hypotheses yet.</p>
               </div>
            ) : (
              saved.map(item => (
                <div 
                  key={item.id}
                  className="group relative bg-slate-800/40 rounded-2xl border border-slate-700/50 p-8 overflow-hidden transition-all hover:bg-slate-800/60 shadow-xl"
                >
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500"></div>
                   
                   <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-bold text-slate-100">{item.content.title}</h3>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/5">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Connecting</span>
                            <p className="text-xs font-medium text-sky-400">{item.content.paper_a}</p>
                            <p className="text-xs font-medium text-sky-400">{item.content.paper_b}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Novelty</span>
                            <p className="text-2xl font-black text-slate-200">{item.content.novelty_score}/100</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Saved On</span>
                            <p className="text-sm font-medium text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                   </div>

                   <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">The Hypothesis</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{item.content.hypothesis}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Method</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{item.content.method}</p>
                             </div>
                             <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Potential Impact</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{item.content.impact}</p>
                             </div>
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
