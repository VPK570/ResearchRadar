import React, { useState } from 'react';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HypothesisPanel({ hypotheses, loading }) {
  const { isAuthenticated } = useAuth();
  const [saving, setSaving] = useState({}); // Tracking saving state per hypothesis index

  const handleSave = async (hyp, index) => {
    if (!isAuthenticated) return alert("Please sign in to save hypotheses.");
    
    setSaving(prev => ({ ...prev, [index]: 'loading' }));
    try {
      await client.post('/api/hypotheses/save', { content: hyp });
      setSaving(prev => ({ ...prev, [index]: 'success' }));
      setTimeout(() => {
        setSaving(prev => ({ ...prev, [index]: null }));
      }, 2000);
    } catch (err) {
      console.error(err);
      setSaving(prev => ({ ...prev, [index]: 'error' }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 opacity-50">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse flex flex-col gap-3 bg-slate-800/80 p-5 rounded-xl border border-slate-700/50">
            <div className="h-5 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/4 mb-3"></div>
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!hypotheses || hypotheses.length === 0) {
    return (
      <div className="text-center text-slate-400 py-10 px-4">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 shadow-inner">
          <p className="text-sm">No hypotheses generated yet. Run a search to explore the literature gaps and synthesize new ideas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {hypotheses.map((h, i) => (
        <div 
          key={i} 
          className="group relative bg-slate-800/40 rounded-xl border border-slate-700/50 p-5 overflow-hidden transition-all hover:bg-slate-800/60"
        >
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-pink-400"></div>
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-100 font-semibold text-base leading-snug m-0 pr-2">
              {h.title || 'Novel Connection'}
            </h3>
            <div className="flex flex-col items-end gap-2">
                <div className="shrink-0 bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-1 rounded text-[10px] font-bold tracking-wide">
                {(h.novelty_score || 0)}/100
                </div>
                <button 
                    onClick={() => handleSave(h, i)}
                    className={`p-2 rounded-lg transition-all ${
                        saving[i] === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                        saving[i] === 'error' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-white/5 text-slate-500 hover:text-pink-400 hover:bg-pink-500/10'
                    }`}
                >
                    {saving[i] === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 
                     saving[i] === 'success' ? <Check size={16} /> : 
                     <Bookmark size={16} />}
                </button>
            </div>
          </div>


          <div className="text-xs text-slate-400 mb-5 pb-5 border-b border-slate-700/50 leading-relaxed">
            <span className="block mb-1 font-medium text-slate-300 uppercase tracking-wider text-[10px]">Connecting Papers:</span>
            <div className="mb-1"><span className="text-sky-400 mr-1">1.</span> {h.paper_a}</div>
            <div><span className="text-sky-400 mr-1">2.</span> {h.paper_b}</div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-1">Hypothesis</div>
              <p className="text-sm text-slate-300 m-0 leading-relaxed">{h.hypothesis}</p>
            </div>
            
            <div>
              <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-1">Proposed Method</div>
              <p className="text-sm text-slate-300 m-0 leading-relaxed">{h.method}</p>
            </div>
            
            <div>
              <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-1">Why It Matters</div>
              <p className="text-sm text-slate-300 m-0 leading-relaxed">{h.impact}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
