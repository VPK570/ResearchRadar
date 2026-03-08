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
    <div className="flex flex-col gap-6">
      {hypotheses.map((h, i) => (
        <div 
          key={i} 
          className="group relative bg-slate-800/40 rounded-xl border border-slate-700/50 p-6 overflow-hidden transition-all hover:bg-slate-800/60"
        >
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.3)]"></div>
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-100 font-bold text-lg leading-tight m-0 pr-4">
              {h.main?.title || h.title}
            </h3>
            <button 
                onClick={() => handleSave(h, i)}
                className={`p-2 rounded-lg transition-all ${
                    saving[i] === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                    saving[i] === 'error' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-white/5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10'
                }`}
            >
                {saving[i] === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 
                 saving[i] === 'success' ? <Check size={16} /> : 
                 <Bookmark size={16} />}
            </button>
          </div>

          {/* Feature 1: Credibility Scoring */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 bg-white/5 p-2 rounded border border-white/5 text-center">
                <span className="block text-[8px] uppercase font-black text-slate-500 tracking-tighter">Novelty</span>
                <span className="text-xs font-bold text-sky-400">{Math.round((h.credibility?.novelty || 0) * 100)}%</span>
            </div>
            <div className="flex-1 bg-white/5 p-2 rounded border border-white/5 text-center">
                <span className="block text-[8px] uppercase font-black text-slate-500 tracking-tighter">Evidence</span>
                <span className={`text-xs font-bold ${h.credibility?.evidence === 'High' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {h.credibility?.evidence || 'M'}
                </span>
            </div>
            <div className="flex-1 bg-white/5 p-2 rounded border border-white/5 text-center">
                <span className="block text-[8px] uppercase font-black text-slate-500 tracking-tighter">Risk</span>
                <span className={`text-xs font-bold ${h.credibility?.risk === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {h.credibility?.risk || 'L'}
                </span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-1.5 flex items-center gap-2">
                <div className="w-1 h-1 bg-sky-500 rounded-full"></div> Hypothesis
              </div>
              <p className="text-sm text-slate-300 m-0 leading-relaxed font-medium">
                {h.main?.hypothesis || h.hypothesis}
              </p>
            </div>
            
            {/* Feature 5: Hypothesis Variants */}
            {h.variants && h.variants.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full"></div> Methodology Variants
                </div>
                <div className="space-y-2">
                    {h.variants.slice(0, 3).map((v, idx) => (
                        <div key={idx} className="bg-white/3 p-2 rounded border border-white/5 group-hover:border-white/10 transition-colors">
                            <span className="text-[9px] font-bold text-amber-500 uppercase mr-2">{v.angle}:</span>
                            <span className="text-[11px] text-slate-400">{v.hypothesis}</span>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* Feature 3: Supporting Evidence */}
            {h.supporting_papers && h.supporting_papers.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div> Supporting Literature
                </div>
                <div className="space-y-1">
                    {h.supporting_papers.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="truncate pr-4 italic">"{p.title}"</span>
                            <span className="font-bold text-emerald-900 bg-emerald-500/10 px-1 rounded">
                                {Math.round(p.similarity * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
