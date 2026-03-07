import React from 'react';
import { Search, Radar } from 'lucide-react';

export default function Header({ query, setQuery, onSearch, loading }) {
  return (
    <div className="absolute top-0 left-0 w-full p-5 bg-gradient-to-b from-slate-900/90 to-transparent z-10 pointer-events-none">
      <div className="pointer-events-auto inline-flex flex-col gap-3">
        <h1 className="m-0 text-2xl font-bold flex items-center gap-2.5">
          <Radar className="text-sky-400" size={28} />
          Research<span className="text-sky-400">Radar</span>
        </h1>
        
        <form onSubmit={onSearch} className="flex gap-2.5 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter an academic topic (e.g. CRISPR gene editing)" 
              className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/80 text-white w-[350px] text-sm backdrop-blur-[4px] outline-none transition-colors focus:border-sky-400 focus:ring-1 focus:ring-sky-400 shadow-inner"
              autoComplete="off"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg border-none bg-sky-500 text-slate-950 font-semibold cursor-pointer transition-all hover:bg-sky-400 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-sky-500 shadow-md shadow-sky-500/20"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>
    </div>
  );
}
