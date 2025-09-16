import React from 'react';
import { GameEvent, GameEventType } from '../types';
import Card from './common/Card';

const EventItem: React.FC<{ event: GameEvent }> = ({ event }) => {
  const getBorderColor = (type: GameEventType) => {
    switch (type) {
      case GameEventType.NARRATIVE:
        return 'border-sky-500';
      case GameEventType.AGENT:
        return 'border-yellow-500';
      case GameEventType.SYSTEM:
        return 'border-red-500';
      default:
        return 'border-slate-600';
    }
  };

  return (
    <div className={`bg-slate-800 p-3 rounded-md border-l-4 ${getBorderColor(event.type)}`}>
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-slate-100">{event.title}</h4>
        {event.isAiGenerated && (
          <span className="text-xs font-medium bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full">
            Genesis Event
          </span>
        )}
      </div>
      <p className="text-sm text-slate-300 mt-1">{event.description}</p>
      <p className="text-xs text-slate-500 text-right mt-2">{new Date(event.timestamp).toLocaleTimeString()}</p>
    </div>
  );
};

const EventLog: React.FC<{ events: GameEvent[] }> = ({ events }) => {
  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card title="Event Log">
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {sortedEvents.length === 0 && (
          <p className="text-slate-500 text-center py-4">No events have occurred yet.</p>
        )}
        {sortedEvents.map(event => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </Card>
  );
};

export default EventLog;
