import React from 'react';
import { Download, FileDown, Database, Share2 } from 'lucide-react';

export default function ExportBar({ searchId }) {
  const exportBaseUrl = `http://localhost:8000/api/export/${searchId}`;

  const handleExport = (type) => {
    window.open(`${exportBaseUrl}/${type}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
      <button 
        onClick={() => handleExport('csv')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-sky-400 transition-all text-[11px] font-bold uppercase tracking-widest"
      >
        <FileDown size={14} />
        CSV
      </button>
      <div className="w-px h-4 bg-white/10"></div>
      <button 
        onClick={() => handleExport('pdf')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-pink-400 transition-all text-[11px] font-bold uppercase tracking-widest"
      >
        <Download size={14} />
        PDF Report
      </button>
      <div className="w-px h-4 bg-white/10"></div>
      <button 
        onClick={() => handleExport('json')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-all text-[11px] font-bold uppercase tracking-widest"
      >
        <Database size={14} />
        Raw JSON
      </button>
      <div className="w-px h-4 bg-white/10"></div>
      <button 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-all text-[11px] font-bold uppercase tracking-widest"
        onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Results link copied to clipboard!");
        }}
      >
        <Share2 size={14} />
        Share
      </button>
    </div>
  );
}
