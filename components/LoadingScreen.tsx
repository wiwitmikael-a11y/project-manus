import React from 'react';
import Spinner from './common/Spinner';

interface LoadingScreenProps {
  isFadingOut: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isFadingOut }) => {
  return (
    <div className={`flex flex-col items-center justify-center h-screen bg-slate-900 transition-opacity duration-500 ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className="flex items-center">
        <Spinner />
        <h2 className="text-2xl font-semibold text-sky-400 ml-4">Menciptakan Dunia Baru...</h2>
      </div>
      <p className="text-slate-400 mt-3">Sang AI sedang merajut takdir awal kolonimu sementara semesta terbentuk.</p>
    </div>
  );
};

export default LoadingScreen;
