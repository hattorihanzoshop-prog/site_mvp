import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Search, X } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SearchOverlay({ open, onClose, onViewReport, reports }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    // Client-side search for instant results
    const q = query.toLowerCase();
    const filtered = reports.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.industry.toLowerCase().includes(q) ||
      (r.keywords && r.keywords.some(k => k.toLowerCase().includes(q)))
    ).slice(0, 8);
    setResults(filtered);
  }, [query, reports]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0F1D32] border-white/10 text-white p-0 gap-0">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            data-testid="search-input"
            type="text"
            placeholder="Search reports, industries, topics..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 && query && (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">No results found for "{query}"</div>
          )}
          {results.length === 0 && !query && (
            <div className="px-6 py-12 text-center text-slate-600 text-sm">Start typing to search...</div>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              data-testid={`search-result-${r.id}`}
              onClick={() => { onViewReport(r); onClose(); }}
              className="w-full flex items-start gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-left"
            >
              <img src={r.cover_image} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#00B4D8]">{r.industry}</span>
                  <span className="text-[10px] text-slate-600">|</span>
                  <span className="text-[10px] text-[#F59E0B] font-mono">${r.price_single.toLocaleString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
