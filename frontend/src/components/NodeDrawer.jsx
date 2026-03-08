import React from 'react';
import { X, ExternalLink, Calendar, BookOpen, Quote, Activity, Loader2 } from 'lucide-react';
import client from '../api/client';

export default function NodeDrawer({ node, onClose }) {
  const [summary, setSummary] = React.useState(null);
  const [loadingSummary, setLoadingSummary] = React.useState(false);

  React.useEffect(() => {
    if (node && node.abstract) {
      setLoadingSummary(true);
      setSummary(null);
      // Simple fetch for summary
      const fetchSummary = async () => {
        try {
          const resp = await client.post('/api/search/paper/summary', {
            title: node.title,
            abstract: node.abstract
          });
          setSummary(resp.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    }
  }, [node?.id]);

  if (!node) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-[420px] bg-slate-900 border-l border-white/10 shadow-2xl z-40 animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar">
      <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest">
            <BookOpen size={14} /> Paper Details
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-8 space-y-8">
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-white leading-tight">{node.title}</h2>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                    <Calendar size={14} className="text-sky-500" />
                    {node.year || 'N/A'}
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                    <Quote size={14} className="text-pink-500" />
                    {node.citationCount || 0} Citations
                </div>
            </div>
        </div>

        {/* Feature 9: Smart Paper Summaries */}
        <div className="space-y-4 bg-white/2 p-4 rounded-xl border border-white/5 shadow-inner">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                 <Activity size={12} className="text-sky-500" /> AI Research Insight
             </h3>
             {loadingSummary ? (
                 <div className="flex items-center gap-3 py-2">
                     <Loader2 className="animate-spin text-sky-500" size={16} />
                     <span className="text-xs text-slate-500 font-medium">Analyzing core contribution...</span>
                 </div>
             ) : summary ? (
                 <div className="space-y-3">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Problem</span>
                        <p className="text-xs text-slate-300 leading-relaxed italic">"{summary.problem}"</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Method</span>
                        <p className="text-xs text-slate-300 leading-relaxed italic">"{summary.method}"</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase">Contribution</span>
                        <p className="text-xs text-emerald-400/80 leading-relaxed font-bold">"{summary.contribution}"</p>
                    </div>
                 </div>
             ) : (
                 <p className="text-[10px] text-slate-500 italic">Select a paper to generate an automated insight.</p>
             )}
        </div>

        {node.authors && node.authors.length > 0 && (
          <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Authors</h3>
              <div className="flex flex-wrap gap-2">
                  {node.authors.map((author, i) => (
                      <span key={i} className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                          {author}
                      </span>
                  ))}
              </div>
          </div>
        )}

        <div className="space-y-3">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Abstract</h3>
             <p className="text-sm text-slate-400 leading-relaxed text-justify">
                {node.abstract || "No abstract available for this paper."}
             </p>
        </div>

        <div className="pt-8 border-t border-white/5">
             <a 
                href={`https://www.semanticscholar.org/paper/${node.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-xl transition-all border border-white/5"
             >
                View on Semantic Scholar <ExternalLink size={16} />
             </a>
        </div>
      </div>
    </div>
  );
}
