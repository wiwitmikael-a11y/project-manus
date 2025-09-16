
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-bold text-sky-400">Project MANUS</h1>
        <p className="text-sm text-slate-400">Narrative Sandbox Simulation Dashboard</p>
      </div>
    </header>
  );
};

export default Header;
