import React from 'react';
import Spinner from './common/Spinner.tsx';

interface LoadingScreenProps {
  isFadingOut: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isFadingOut }) => {
  return (
    <div className={`flex flex-col items-center justify-center h-screen bg-slate-900 transition-opacity duration-500 ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className="flex items-center">
        <Spinner />
        <h2 className="text-2xl font-semibold text-amber-400 ml-4">Menyurvei Puing-Puing...</h2>
      </div>
      <p className="text-slate-400 mt-3">Sang AI sedang memetakan reruntuhan dan menabur benih cerita para penyintas.</p>
    </div>
  );
};

export default LoadingScreen;