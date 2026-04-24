import { useState } from 'react';
import TreeView from './components/TreeView';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const entries = input
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const res = await fetch(`${API_URL}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: entries }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const loadExample = () => {
    setInput('A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->H, G->I, hello, 1->2, A->');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.04] blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-pink-600/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-10">

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-3">
            Tree Hierarchy Analyzer
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            Parse directed edges, detect cycles, identify duplicates, and visualize tree structures — all in real time.
          </p>
        </header>

        {/* Input Section */}
        <section className="glass-card gradient-border p-6 sm:p-8 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="edge-input" className="text-sm font-semibold text-gray-300 tracking-wide uppercase">
              Node Edge Input
            </label>
            <button
              id="load-example-btn"
              onClick={loadExample}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors underline underline-offset-2 decoration-purple-400/30 hover:decoration-purple-300/50"
            >
              Load example
            </button>
          </div>
          <textarea
            id="edge-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter edges separated by commas or new lines...&#10;Example: A->B, A->C, B->D, X->Y, Y->Z, Z->X"
            rows={5}
            className="w-full bg-black/30 border border-white/[0.06] rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/10 resize-y transition-all duration-300"
          />
          <div className="flex items-center justify-between mt-4">
            <p className="text-[11px] text-gray-500">Press ⌘ Enter to submit</p>
            <button
              id="submit-btn"
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="relative px-7 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </span>
              ) : 'Analyze'}
            </button>
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div id="error-banner" className="flex items-center gap-3 px-5 py-4 mb-8 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in-up">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'User ID', value: result.user_id, icon: '👤' },
                { label: 'Email', value: result.email_id, icon: '✉️' },
                { label: 'Roll Number', value: result.college_roll_number, icon: '🎓' },
              ].map((item) => (
                <div key={item.label} className="glass-card glass-card-hover p-5 transition-all duration-300">
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium mb-1.5">{item.label}</p>
                  <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Trees', value: result.summary?.total_trees, color: 'from-emerald-500 to-teal-500', bg: 'emerald' },
                { label: 'Total Cycles', value: result.summary?.total_cycles, color: 'from-rose-500 to-pink-500', bg: 'rose' },
                { label: 'Largest Tree Root', value: result.summary?.largest_tree_root || '—', color: 'from-purple-500 to-blue-500', bg: 'purple' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card glass-card-hover p-5 transition-all duration-300">
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium mb-2">{stat.label}</p>
                  <p className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Hierarchies */}
            {result.hierarchies && result.hierarchies.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
                  Hierarchies
                </h2>
                <div className="space-y-4">
                  {result.hierarchies.map((h, i) => (
                    <div key={i} className="glass-card p-5 transition-all duration-300 hover:border-white/10">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 text-purple-300 text-xs font-bold tracking-wider">
                          ROOT: {h.root}
                        </span>
                        {h.has_cycle ? (
                          <span className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 animate-pulse tracking-wide">
                            <span className="text-sm">⚠</span> CYCLE DETECTED
                          </span>
                        ) : (
                          h.depth !== undefined && (
                            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                              Depth: {h.depth}
                            </span>
                          )
                        )}
                      </div>
                      <TreeView tree={h.tree} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Invalid Entries & Duplicate Edges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Invalid Entries */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Invalid Entries
                  {result.invalid_entries?.length > 0 && (
                    <span className="ml-auto text-[11px] text-gray-500 font-normal">{result.invalid_entries.length} found</span>
                  )}
                </h3>
                {result.invalid_entries && result.invalid_entries.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.invalid_entries.map((entry, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/15 text-amber-300 text-xs font-mono font-medium">
                        {entry || '(empty)'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 font-medium text-sm">None ✓</p>
                )}
              </div>

              {/* Duplicate Edges */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Duplicate Edges
                  {result.duplicate_edges?.length > 0 && (
                    <span className="ml-auto text-[11px] text-gray-500 font-normal">{result.duplicate_edges.length} found</span>
                  )}
                </h3>
                {result.duplicate_edges && result.duplicate_edges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.duplicate_edges.map((edge, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/15 text-sky-300 text-xs font-mono font-medium">
                        {edge}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 font-medium text-sm">None ✓</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 mb-8">
          <p className="text-gray-500 text-[11px] tracking-wide font-medium opacity-80 transition-opacity hover:opacity-100">
            Built by Lovansh Tewatia &middot; RA2311027010106 &middot; lt4750@srmist.edu.in
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
