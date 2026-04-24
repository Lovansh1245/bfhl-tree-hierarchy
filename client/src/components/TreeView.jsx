import { useState } from 'react';

function TreeNode({ name, children, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children && Object.keys(children).length > 0;

  return (
    <div className={level > 0 ? 'ml-5 border-l border-purple-500/20 pl-4' : ''}>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-white/5 transition-all duration-200 group"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <span
            className={`text-[10px] text-purple-400 transition-transform duration-200 ${
              expanded ? 'rotate-90' : ''
            }`}
          >
            ▶
          </span>
        ) : (
          <span className="w-[10px] flex justify-center">
            <span className="block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
          </span>
        )}
        <span className="font-mono text-sm font-bold tracking-wider text-white group-hover:text-purple-300 transition-colors">
          {name}
        </span>
      </div>
      {expanded && hasChildren && (
        <div className="animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          {Object.entries(children).map(([key, val]) => (
            <TreeNode key={key} name={key} children={val} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ tree }) {
  if (!tree || Object.keys(tree).length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-red-500/5 border border-red-500/10">
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" />
        </svg>
        <p className="text-red-300/80 text-sm">Cycle detected — no tree structure available</p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {Object.entries(tree).map(([key, val]) => (
        <TreeNode key={key} name={key} children={val} level={0} />
      ))}
    </div>
  );
}
