import React from 'react';

interface CommandBarProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onColonyClick: () => void;
  onEventsClick: () => void;
}

const CommandButton: React.FC<{ onClick: () => void; icon: string; label: string; isActive?: boolean; }> = ({ onClick, icon, label, isActive }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                   text-slate-200 bg-slate-700/50 hover:bg-slate-600/70 backdrop-blur-sm
                   border border-slate-600/80 focus:outline-none focus:ring-2 focus:ring-sky-500
                   ${isActive ? 'bg-sky-500/30 text-sky-300' : ''}`}
    >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
    </button>
);


const CommandBar: React.FC<CommandBarProps> = ({ isPaused, onTogglePause, onColonyClick, onEventsClick }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-3 p-2 bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg">
        <CommandButton
            onClick={onTogglePause}
            icon={isPaused ? '▶️' : '⏸️'}
            label={isPaused ? 'Resume' : 'Pause'}
        />
        <div className="w-px h-6 bg-slate-600"></div>
        <CommandButton
            onClick={onColonyClick}
            icon="🏠"
            label="Colony"
        />
        <CommandButton
            onClick={onEventsClick}
            icon="📜"
            label="Events"
        />
      </div>
    </div>
  );
};

export default CommandBar;
