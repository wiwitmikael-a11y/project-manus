import React from 'react';
import Button from './common/Button';

interface CommandBarProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onColonyClick: () => void;
  onEventsClick: () => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ isPaused, onTogglePause, onColonyClick, onEventsClick }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-2 p-2 bg-slate-800/60 backdrop-blur-md border border-slate-600/50 rounded-full shadow-lg">
        <Button onClick={onColonyClick} variant="secondary">
            <span className="text-lg" role="img" aria-label="Colony Status">🏛️</span>
            <span className="hidden sm:inline ml-2">Koloni</span>
        </Button>
        <Button onClick={onEventsClick} variant="secondary">
            <span className="text-lg" role="img" aria-label="Event Log">📜</span>
            <span className="hidden sm:inline ml-2">Events</span>
        </Button>
        <Button onClick={onTogglePause} variant="primary">
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </Button>
      </div>
    </div>
  );
};

export default CommandBar;
